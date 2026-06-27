import { useCallback, useEffect, useState } from 'react'
import { downloadProgress, parseProgressFile } from '../utils/progressExport'

const STORAGE_KEY = 'ai-learning-path-progress'

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore corrupt storage */
    }
  }, [])

  const persist = useCallback((next: Set<string>) => {
    setCompleted(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
  }, [])

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(completed)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persist(next)
    },
    [completed, persist],
  )

  const isComplete = useCallback((id: string) => completed.has(id), [completed])

  const reset = useCallback(() => persist(new Set()), [persist])

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
  }
}
