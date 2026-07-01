import { usePersona } from '../../hooks/usePersona'
import { PERSONAS } from '../../data/personas'
import type { PersonaId } from '../../data/personas'

const ORDER: PersonaId[] = [
  'swe-manager',
  'ic-engineer',
  'product-manager',
  'data-scientist',
  'full',
]

export function TrackSelector() {
  const { personaId, setPersona } = usePersona()
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <span
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--text-strong)',
        }}
      >
        Your track
      </span>
      <select
        aria-label="Your track"
        value={personaId}
        onChange={(e) => setPersona(e.target.value as PersonaId)}
        style={{
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--bg-deep)',
          color: 'var(--text-strong)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {ORDER.map((id) => (
          <option key={id} value={id}>
            {PERSONAS[id].label}
          </option>
        ))}
      </select>
    </label>
  )
}
