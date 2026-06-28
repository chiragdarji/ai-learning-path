import { PERSONAS, type PersonaId } from '../data/personas'

interface PersonaBannerProps {
  personaId: PersonaId
  onChangePersona: (id: PersonaId) => void
  essentialCount: number
  essentialDone: number
}

const PERSONA_OPTIONS: PersonaId[] = [
  'swe-manager',
  'product-manager',
  'ic-engineer',
  'data-scientist',
  'full',
]

export function PersonaBanner({
  personaId,
  onChangePersona,
  essentialCount,
  essentialDone,
}: PersonaBannerProps) {
  const persona = PERSONAS[personaId]
  const tracksWithEssentials =
    personaId !== 'full' && personaId !== 'ic-engineer'

  return (
    <div className="persona-banner">
      <div className="persona-header">
        <div>
          <span className="persona-badge">Your track</span>
          <h2>{persona.label}</h2>
          <p>{persona.summary}</p>
        </div>
        <div className="persona-switch persona-switch-select">
          <label htmlFor="persona-select" className="sr-only">
            Choose track
          </label>
          <select
            id="persona-select"
            value={personaId}
            onChange={(e) => onChangePersona(e.target.value as PersonaId)}
          >
            {PERSONA_OPTIONS.map((id) => (
              <option key={id} value={id}>
                {PERSONAS[id].label}
              </option>
            ))}
          </select>
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

      {tracksWithEssentials && (
        <p className="persona-progress-note">
          Essential progress: <strong>{essentialDone}/{essentialCount}</strong>
        </p>
      )}
    </div>
  )
}
