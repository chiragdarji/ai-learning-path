import { useAuth } from '../../context/AuthProvider'
import { PageHeader } from '../PageHeader'
import { Button } from '../ui'

interface ProfileHeaderProps {
  done: number
  total: number
  pct: number
}

export function ProfileHeader({ done, total, pct }: ProfileHeaderProps) {
  const { user, openSignIn } = useAuth()
  return (
    <PageHeader
      eyebrow="My learning"
      title="Your learning"
      subtitle={`${done} of ${total} done · ${pct}%`}
    >
      {!user && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <Button onClick={openSignIn}>Sign in to sync</Button>
        </div>
      )}
    </PageHeader>
  )
}
