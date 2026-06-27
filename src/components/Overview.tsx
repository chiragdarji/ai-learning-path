import { LEARNING_PATH } from '../data/learningPath'
import type { PersonaId } from '../data/personas'
import { PERSONAS, getResourcePriority } from '../data/personas'
import { PathStats } from './ProgressBar'

interface OverviewProps {
  personaId: PersonaId
  onSelectPhase: (id: string) => void
  onSelectNewsRadar: () => void
  isComplete: (id: string) => boolean
}

export function Overview({
  personaId,
  onSelectPhase,
  onSelectNewsRadar,
  isComplete,
}: OverviewProps) {
  const persona = PERSONAS[personaId]
  const orderedPhases = persona.phaseOrder
    .map((id) => LEARNING_PATH.find((p) => p.id === id))
    .filter(Boolean) as typeof LEARNING_PATH

  return (
    <div className="overview">
      <header className="page-header">
        <p className="eyebrow">
          {personaId === 'swe-manager'
            ? 'Personalized for Engineering Managers'
            : 'Curated AI Engineering Curriculum'}
        </p>
        <h1>
          {personaId === 'swe-manager'
            ? 'Lead AI teams without becoming an ML researcher'
            : 'Your path from LLM basics to production agents'}
        </h1>
        <p className="lead">{persona.summary}</p>
        <PathStats personaId={personaId} isComplete={isComplete} />
      </header>

      <section className="news-radar-promo">
        <div className="promo-inner">
          <span className="promo-icon">📡</span>
          <div>
            <h2>AI News Radar — Phase 7</h2>
            <p>
              Powered by{' '}
              <a
                href="https://github.com/GetStream/awesome-ai-news"
                target="_blank"
                rel="noopener noreferrer"
              >
                awesome-ai-news
              </a>
              . Map monthly headlines to curriculum resources with an 8-theme learning bridge.
            </p>
          </div>
          <button type="button" className="promo-cta" onClick={onSelectNewsRadar}>
            Open News Radar →
          </button>
        </div>
      </section>

      {personaId === 'swe-manager' && (
        <section className="manager-fast-track">
          <h2>Recommended order for you</h2>
          <p className="section-intro">
            Start with LLM fluency and agent architecture — skip deep ML bootcamps and
            from-scratch training unless you want them later.
          </p>
          <ol className="fast-track-list">
            {orderedPhases.map((phase, i) => {
              const override = persona.phaseOverrides[phase.id]
              const essentials = phase.steps
                .flatMap((s) => s.resources)
                .filter((r) => getResourcePriority(personaId, r.id) === 'essential')

              return (
                <li key={phase.id}>
                  <button
                    type="button"
                    className="fast-track-item"
                    onClick={() => onSelectPhase(phase.id)}
                  >
                    <span className="fast-track-rank">{i + 1}</span>
                    <div>
                      <strong>{phase.title}</strong>
                      <span>{override?.estimatedWeeks ?? phase.estimatedWeeks}</span>
                      <p>{override?.note ?? phase.description}</p>
                      {essentials.length > 0 && (
                        <span className="essential-pill">
                          {essentials.length} essential resources
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <section className="phase-map">
        <h2>{personaId === 'swe-manager' ? 'All phases' : 'Phase map'}</h2>
        <div className="phase-timeline">
          {LEARNING_PATH.map((phase) => {
            const override = persona.phaseOverrides[phase.id]
            const resources = phase.steps.flatMap((s) => s.resources)
            const visible = resources.filter(
              (r) => getResourcePriority(personaId, r.id) !== 'skip',
            )
            const done = visible.filter((r) => isComplete(r.id)).length
            const rank = persona.phaseOrder.indexOf(phase.id) + 1

            return (
              <button
                key={phase.id}
                type="button"
                className="phase-card"
                onClick={() => onSelectPhase(phase.id)}
              >
                <div className="phase-card-header">
                  <span className="phase-card-num">
                    Phase {phase.number}
                    {personaId === 'swe-manager' && rank > 0 && (
                      <span className="your-order"> · Your #{rank}</span>
                    )}
                  </span>
                  <span className={`phase-level level-${phase.level}`}>
                    {phase.levelLabel}
                  </span>
                </div>
                <h3>{phase.title}</h3>
                <p>{override?.description ?? phase.description}</p>
                <div className="phase-card-footer">
                  <span>{override?.estimatedWeeks ?? phase.estimatedWeeks}</span>
                  <span>
                    {done}/{visible.length} done
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {personaId === 'full' && (
        <section className="classification-legend">
          <h2>How resources are classified</h2>
          <div className="legend-grid">
            {[
              ['▶', 'Video', 'Visual explanations and talks — best for intuition first.'],
              ['◉', 'Course', 'Structured hands-on learning with exercises and projects.'],
              ['⎇', 'Repository', 'Code, notebooks, and clone-and-build project material.'],
              ['▤', 'Book', 'Deep reference material — read alongside hands-on work.'],
              ['◈', 'Guide', 'Industry playbooks and whitepapers from major labs.'],
              ['◎', 'Paper', 'Foundational research — read after building intuition.'],
              ['✉', 'Newsletter', 'Ongoing signal — subscribe early, read weekly.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="legend-item">
                <span className="legend-icon">{icon}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {personaId === 'swe-manager' && (
        <section className="ranking-note">
          <h2>Priority labels on your track</h2>
          <div className="rank-ladder">
            <div className="rank-step">
              <span className="rank-dot essential" />
              <div>
                <strong>★ Essential</strong> — Do these. Highest ROI for leading AI teams.
              </div>
            </div>
            <div className="rank-step">
              <span className="rank-dot recommended" />
              <div>
                <strong>Recommended</strong> — Strong value; schedule when you have bandwidth.
              </div>
            </div>
            <div className="rank-step">
              <span className="rank-dot optional" />
              <div>
                <strong>Optional</strong> — Delegate to your team or revisit later.
              </div>
            </div>
            <div className="rank-step">
              <span className="rank-dot skip" />
              <div>
                <strong>Skip</strong> — Deep implementation work better suited for IC engineers.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
