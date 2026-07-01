import { useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { useProgress } from '../../hooks/useProgress'
import { deleteAccountData } from '../../services/accountData'
import { Modal, Button } from '../ui'
import styles from './DangerZone.module.css'

export function DangerZone() {
  const { user, signOut } = useAuth()
  const { reset } = useProgress()
  const [confirm, setConfirm] = useState<null | 'reset' | 'delete'>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className={styles.zone}>
      <div className={styles.row}>
        <div>
          <p className={styles.rowText}>Reset progress</p>
          <p className={styles.rowSub}>Clears all checkmarks on this device and in the cloud.</p>
        </div>
        <Button variant="danger" onClick={() => setConfirm('reset')}>
          Reset progress
        </Button>
      </div>

      {user && (
        <div className={styles.row}>
          <div>
            <p className={styles.rowText}>Delete my data</p>
            <p className={styles.rowSub}>Permanently removes your progress, profile, and notes.</p>
          </div>
          <Button variant="danger" onClick={() => setConfirm('delete')}>
            Delete my data
          </Button>
        </div>
      )}

      {error && <p className={styles.msg}>{error}</p>}

      <Modal
        open={confirm === 'reset'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Reset progress?"
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          This clears all checkmarks on this device and in the cloud. It can't be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            reset()
            setConfirm(null)
          }}
        >
          Yes, reset progress
        </Button>
      </Modal>

      <Modal
        open={confirm === 'delete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Delete my data?"
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          This permanently deletes your progress, profile, and notes. Your sign-in email stays
          registered. It can't be undone.
        </p>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            if (!user) return
            setBusy(true)
            setError(null)
            void deleteAccountData(user.id).then((r) => {
              setBusy(false)
              if (r.error) {
                setError(r.error)
                return
              }
              setConfirm(null)
              void signOut()
            })
          }}
        >
          {busy ? 'Deleting…' : 'Yes, delete everything'}
        </Button>
      </Modal>
    </div>
  )
}
