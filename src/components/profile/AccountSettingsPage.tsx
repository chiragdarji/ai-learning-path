import { PageHeader } from '../PageHeader'
import { AccountPreferences } from './AccountPreferences'
import { DangerZone } from './DangerZone'
import styles from './AccountSettingsPage.module.css'

export function AccountSettingsPage() {
  return (
    <div className={styles.page}>
      <PageHeader eyebrow="My learning" title="Account settings" />
      <AccountPreferences />
      <div>
        <p className={styles.dangerLabel}>Danger zone</p>
        <DangerZone />
      </div>
    </div>
  )
}
