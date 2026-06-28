import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import { useLocale } from '../context/LocaleProvider'
import {
  fetchResourceNote,
  fetchSharedNotesForResource,
  upsertResourceNote,
} from '../services/communityFeatures'

interface ResourceNotesProps {
  resourceId: string
}

export function ResourceNotes({ resourceId }: ResourceNotesProps) {
  const { user } = useAuth()
  const { t } = useLocale()
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'shared'>('private')
  const [shared, setShared] = useState<Array<{ body: string }>>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user || !open) return
    void Promise.all([
      fetchResourceNote(user.id, resourceId),
      fetchSharedNotesForResource(resourceId),
    ]).then(([mine, community]) => {
      if (mine) {
        setBody(mine.body)
        setVisibility(mine.visibility)
      }
      setShared(community)
    })
  }, [user, resourceId, open])

  if (!user) return null

  return (
    <div className="resource-notes">
      <button
        type="button"
        className="notes-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide notes' : t.community.notes}
      </button>
      {open && (
        <div className="notes-panel">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Your notes on this resource…"
          />
          <label className="notes-visibility">
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value === 'shared' ? 'shared' : 'private')
              }
            >
              <option value="private">Private</option>
              <option value="shared">Share with community</option>
            </select>
          </label>
          <button
            type="button"
            className="action-btn"
            disabled={saving}
            onClick={() => {
              setSaving(true)
              void upsertResourceNote(user.id, resourceId, body, visibility).then(() =>
                setSaving(false),
              )
            }}
          >
            {saving ? 'Saving…' : 'Save note'}
          </button>
          {shared.length > 0 && (
            <div className="shared-notes">
              <strong>{t.community.sharedNotes}</strong>
              <ul>
                {shared.map((n, i) => (
                  <li key={i}>{n.body}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
