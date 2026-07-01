import { usePersona } from '../../hooks/usePersona'
import { useProgress } from '../../hooks/useProgress'
import { overallProgress, phaseProgress, nextResource } from '../../lib/progressSummary'
import { ProfileHeader } from './ProfileHeader'
import { ProgressOverview } from './ProgressOverview'
import { TrackSelector } from './TrackSelector'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { personaId } = usePersona()
  const { isComplete } = useProgress()

  const overall = overallProgress(personaId, isComplete)
  const rows = phaseProgress(personaId, isComplete)
  const next = nextResource(personaId, isComplete)

  return (
    <div className={styles.page}>
      <ProfileHeader done={overall.done} total={overall.total} pct={overall.pct} />
      <ProgressOverview rows={rows} next={next} />
      <TrackSelector />
    </div>
  )
}
