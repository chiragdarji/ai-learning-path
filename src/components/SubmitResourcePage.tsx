import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LEARNING_PATH } from '../data/learningPath'
import { useAuth } from '../context/AuthProvider'
import { useLocale } from '../context/LocaleProvider'
import { submitResource } from '../services/communityFeatures'
import { SignInPrompt } from './SignInPrompt'

export function SubmitResourcePage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [resourceType, setResourceType] = useState('guide')
  const [difficulty, setDifficulty] = useState('intermediate')
  const [description, setDescription] = useState('')
  const [phaseId, setPhaseId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!user) {
    return (
      <article className="community-page">
        <SignInPrompt message="Sign in to suggest resources for the curriculum." />
        <Link to="/">← Back to overview</Link>
      </article>
    )
  }

  return (
    <article className="community-page">
      <header className="page-header">
        <p className="eyebrow">Community</p>
        <h1>{t.community.submitTitle}</h1>
        <p className="lead">{t.community.submitLead}</p>
      </header>

      <form
        className="community-form"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitting(true)
          setMessage(null)
          void submitResource({
            title,
            url,
            resource_type: resourceType,
            difficulty,
            description,
            suggested_phase_id: phaseId || undefined,
          }).then((result) => {
            setSubmitting(false)
            if (result.error) {
              setMessage(result.error)
              return
            }
            setMessage('Submitted for review — thank you!')
            setTitle('')
            setUrl('')
            setDescription('')
          })
        }}
      >
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          URL
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
        </label>
        <label>
          Type
          <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
            {['video', 'course', 'repo', 'book', 'guide', 'paper', 'newsletter'].map(
              (type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Difficulty
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label>
          Suggested phase
          <select value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
            <option value="">—</option>
            {LEARNING_PATH.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Why is this valuable?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </label>
        <button type="submit" className="auth-btn primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit for review'}
        </button>
        {message && <p className="auth-message">{message}</p>}
      </form>
    </article>
  )
}
