import { PERSONAS, type PersonaId } from '../data/personas'

interface PersonaBannerProps {
  personaId: PersonaId
  onChangePersona: (id: PersonaId) => void
  essentialCount: number
  essentialDone: number
}

export function PersonaBanner({
  personaId,
  onChangePersona,
  essentialCount,
  essentialDone,
}: PersonaBannerProps) {
  const persona = PERSONAS[personaId]

  return (
    <div className="persona-banner">
      <div className="persona-header">
        <div>
          <span className="persona-badge">Your track</span>
          <h2>{persona.label}</h2>
          <p>{persona.summary}</p>
        </div>
        <div className="persona-switch">
          <button
            type="button"
            className={personaId === 'swe-manager' ? 'active' : ''}
            onClick={() => onChangePersona('swe-manager')}
          >
            Manager
          </button>
          <button
            type="button"
            className={personaId === 'full' ? 'active' : ''}
            onClick={() => onChangePersona('full')}
          >
            Full track
          </button>
        </div>
      </div>

      {persona.goals.length > 0 && (
        <div className="persona-goals">
          <strong>What you'll be able to do</strong>
          <ul>
            {persona.goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {personaId === 'swe-manager' && (
        <p className="persona-progress-note">
          Manager track: <strong>{essentialDone}/{essentialCount}</strong> essential
          resources complete
        </p>
      )}
    </div>
  )
}
