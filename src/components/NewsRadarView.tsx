import {
  AWESOME_AI_NEWS,
  LEARNING_BRIDGES,
  MONTHLY_RITUAL,
  RECENT_HIGHLIGHTS,
} from '../data/aiNewsRadar'
import { LEARNING_PATH } from '../data/learningPath'
import { PageHeader } from './PageHeader'

interface NewsRadarViewProps {
  onSelectPhase: (id: string) => void
  onToggleResource?: (id: string) => void
  isComplete: (id: string) => boolean
}

function findResourceTitle(id: string): string {
  for (const phase of LEARNING_PATH) {
    for (const step of phase.steps) {
      const r = step.resources.find((res) => res.id === id)
      if (r) return r.title
    }
  }
  return id
}

export function NewsRadarView({
  onSelectPhase,
  isComplete,
}: NewsRadarViewProps) {
  return (
    <div className="news-radar">
      <PageHeader eyebrow="Phase 7 · Ongoing" title="AI News Radar">
        <p className="lead">
          Turn headlines into learning. Scan{' '}
          <a href={AWESOME_AI_NEWS.url} target="_blank" rel="noopener noreferrer">
            awesome-ai-news
          </a>{' '}
          monthly, map trends to curriculum, and stay ahead without chasing every launch.
        </p>
      </PageHeader>

      <section className="news-hub-card">
        <div className="hub-card-inner">
          <span className="hub-icon">📡</span>
          <div>
            <h2>{AWESOME_AI_NEWS.title}</h2>
            <p>{AWESOME_AI_NEWS.description}</p>
            <span className="hub-cadence">{AWESOME_AI_NEWS.updateCadence}</span>
          </div>
          <a
            href={AWESOME_AI_NEWS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hub-cta"
          >
            Open on GitHub →
          </a>
        </div>
      </section>

      <section className="monthly-ritual">
        <h2>Monthly ritual (≈30 min)</h2>
        <ol className="ritual-steps">
          {MONTHLY_RITUAL.map((item) => (
            <li key={item.step}>
              <span className="ritual-num">{item.step}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="learning-bridges">
        <h2>News theme → Learning opportunity</h2>
        <p className="section-intro">
          When you see these patterns in awesome-ai-news, jump to the matching curriculum
          phase instead of randomly chasing tutorials.
        </p>
        <div className="bridge-grid">
          {LEARNING_BRIDGES.map((bridge) => (
            <article key={bridge.id} className="bridge-card">
              <div className="bridge-header">
                <span className="bridge-icon">{bridge.icon}</span>
                <h3>{bridge.theme}</h3>
              </div>
              <p className="bridge-signal">
                <strong>News signal:</strong> {bridge.newsSignal}
              </p>
              <ul className="bridge-examples">
                {bridge.recentExamples.slice(0, 3).map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
              <p className="bridge-action">
                <strong>Manager action:</strong> {bridge.managerAction}
              </p>
              <div className="bridge-links">
                <button
                  type="button"
                  className="bridge-phase-btn"
                  onClick={() => onSelectPhase(bridge.phaseId)}
                >
                  Go to {bridge.phaseTitle} →
                </button>
              </div>
              <div className="bridge-curriculum">
                <span className="bridge-label">Study in curriculum:</span>
                <div className="bridge-tags">
                  {[...bridge.curriculumResourceIds, ...bridge.phase7ResourceIds].map(
                    (id) => (
                      <span
                        key={id}
                        className={`bridge-tag ${isComplete(id) ? 'done' : ''}`}
                      >
                        {isComplete(id) ? '✓ ' : ''}
                        {findResourceTitle(id)}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="recent-highlights">
        <h2>Recent headlines → Actions</h2>
        <p className="section-intro">
          Curated from awesome-ai-news with a suggested learning response.
        </p>
        <div className="highlights-list">
          {RECENT_HIGHLIGHTS.map((h) => (
            <div key={h.id} className="highlight-row">
              <div className="highlight-meta">
                <span className="highlight-month">{h.month}</span>
                <span className="highlight-theme">
                  {LEARNING_BRIDGES.find((b) => b.id === h.themeId)?.theme}
                </span>
              </div>
              <p className="highlight-headline">{h.headline}</p>
              <p className="highlight-action">→ {h.learningAction}</p>
              <button
                type="button"
                className="highlight-go"
                onClick={() => onSelectPhase(h.phaseId)}
              >
                Open phase
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
