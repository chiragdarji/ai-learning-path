import { Link } from 'react-router-dom'
import type { NextResource, PhaseProgressRow } from '../../lib/progressSummary'
import { Card } from '../ui'
import styles from './ProgressOverview.module.css'

interface ProgressOverviewProps {
  rows: PhaseProgressRow[]
  next: NextResource | null
}

export function ProgressOverview({ rows, next }: ProgressOverviewProps) {
  return (
    <div>
      {next ? (
        <Link to={`/phase/${next.phaseId}`} className={styles.continue}>
          <span aria-hidden="true">▶</span>
          <span>
            <span className={styles.continueLabel}>Continue where you left off</span>
            <span className={styles.continueTitle}>{next.title}</span>
          </span>
        </Link>
      ) : (
        <p className={styles.done}>You've completed your track. Nice work.</p>
      )}
      <Card>
        {rows.map((row) => (
          <div key={row.phaseId} className={styles.row}>
            <span className={styles.rowTitle}>
              {row.number} · {row.title}
            </span>
            <span className={styles.rowPct}>{row.pct}%</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
