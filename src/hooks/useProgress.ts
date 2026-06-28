import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import {
  clearCloudProgress,
  fetchCloudProgress,
  mergeProgressSets,
  syncProgressToCloud,
  upsertProgressItem,
} from '../services/userDataSync'
import { downloadProgress, parseProgressFile } from '../utils/progressExport'

const STORAGE_KEY = 'ai-learning-path-progress'

function readStoredProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {
    /* ignore corrupt storage */
  }
  return new Set()
}

function writeStoredProgress(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
}

export function useProgress() {
  const { user } = useAuth()
  const [completed, setCompleted] = useState<Set<string>>(readStoredProgress)
  const [syncing, setSyncing] = useState(false)
  const mergedForUser = useRef<string | null>(null)

  useEffect(() => {
    setCompleted(readStoredProgress())
  }, [])

  useEffect(() => {
    if (!user) {
      mergedForUser.current = null
      return
    }
    if (mergedForUser.current === user.id) return

    let cancelled = false
    setSyncing(true)

    ;(async () => {
      try {
        const local = readStoredProgress()
        const cloud = await fetchCloudProgress(user.id)
        const merged = mergeProgressSets(local, cloud)
        if (cancelled) return

        writeStoredProgress(merged)
        setCompleted(merged)
        await syncProgressToCloud(user.id, merged)
        mergedForUser.current = user.id
      } catch (err) {
        console.error('Progress sync failed:', err)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  const persist = useCallback(
    (next: Set<string>, sync = Boolean(user)) => {
      setCompleted(next)
      writeStoredProgress(next)
      if (sync && user) {
        void syncProgressToCloud(user.id, next).catch((err) =>
          console.error('Progress sync failed:', err),
        )
      }
    },
    [user],
  )

  const toggle = useCallback(
    (id: string) => {
      setCompleted((prev) => {
        const next = new Set(prev)
        const adding = !next.has(id)
        if (adding) next.add(id)
        else next.delete(id)
        writeStoredProgress(next)

        if (user) {
          void upsertProgressItem(user.id, id, adding).catch((err) =>
            console.error('Progress sync failed:', err),
          )
        }

        return next
      })
    },
    [user],
  )

  const isComplete = useCallback(
    (id: string) => completed.has(id),
    [completed],
  )

  const reset = useCallback(() => {
    persist(new Set())
    if (user) {
      void clearCloudProgress(user.id).catch((err) =>
        console.error('Progress reset sync failed:', err),
      )
    }
  }, [persist, user])

  const exportProgress = useCallback(() => {
    downloadProgress(completed)
  }, [completed])

  const importProgress = useCallback(
    (file: File, merge = true) => {
      return file.text().then((text) => {
        const ids = parseProgressFile(text)
        const next = merge ? new Set([...completed, ...ids]) : new Set(ids)
        persist(next)
        return ids.length
      })
    },
    [completed, persist],
  )

  return {
    completed,
    toggle,
    isComplete,
    reset,
    exportProgress,
    importProgress,
    count: completed.size,
    syncing,
  }
}
