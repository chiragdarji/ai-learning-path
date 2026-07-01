import { useRef, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { useProgress } from '../../hooks/useProgress'
import { subscribeDigest } from '../../services/communityFeatures'
import { Card, Button, Input } from '../ui'

export function AccountPreferences() {
  const { user } = useAuth()
  const { exportProgress, importProgress } = useProgress()
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <form
          style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}
          onSubmit={(e) => {
            e.preventDefault()
            setMessage(null)
            void subscribeDigest(email, user?.id).then((r) =>
              setMessage(r.error ?? 'Subscribed. Check your inbox weekly.'),
            )
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              id="digest-email"
              label="Weekly digest"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>
          <Button type="submit">Subscribe</Button>
        </form>
        {message && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text)' }}>{message}</p>}

        <div>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              margin: '0 0 var(--space-2)',
            }}
          >
            Progress backup
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => exportProgress()}>
              Export
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void importProgress(file)
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
