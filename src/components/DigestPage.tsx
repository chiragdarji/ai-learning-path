import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { useLocale } from '../context/LocaleProvider'
import { subscribeDigest } from '../services/communityFeatures'
import { LEARNING_PATH } from '../data/learningPath'
import { PERSONAS } from '../data/personas'
import { RECENT_HIGHLIGHTS } from '../data/aiNewsRadar'
import { PageHeader } from './PageHeader'
import { Card, Button } from './ui'

export function DigestPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user])

  const manager = PERSONAS['swe-manager']
  const essentialIds = Object.entries(manager.resources)
    .filter(([, p]) => p === 'essential')
    .map(([id]) => id)
    .slice(0, 3)

  const resources = LEARNING_PATH.flatMap((p) =>
    p.steps.flatMap((s) => s.resources.map((r) => ({ ...r, phaseTitle: p.title }))),
  )
  const picks = essentialIds
    .map((id) => resources.find((r) => r.id === id))
    .filter(Boolean)

  const highlight = RECENT_HIGHLIGHTS[0]

  return (
    <article className="community-page">
      <PageHeader eyebrow="Community" title="Weekly digest">
        <p className="lead">
          Three essential resources plus one news headline mapped to a learning action.
        </p>
      </PageHeader>

      <Card>
      <section className="digest-preview">
        <h2>This week&apos;s picks</h2>
        <ol>
          {picks.map((r) => (
            <li key={r!.id}>
              <a href={r!.url} target="_blank" rel="noopener noreferrer">
                {r!.title}
              </a>
              <span className="digest-meta"> — {r!.phaseTitle}</span>
            </li>
          ))}
        </ol>
        {highlight && (
          <>
            <h3>News → action</h3>
            <p>
              <strong>{highlight.headline}</strong> ({highlight.month}) —{' '}
              {highlight.learningAction}
            </p>
          </>
        )}
      </section>
      </Card>

      <Card>
      <form
        className="community-form digest-form"
        onSubmit={(e) => {
          e.preventDefault()
          void subscribeDigest(email, user?.id).then((result) => {
            setMessage(result.error ?? 'Subscribed! (Email delivery via weekly GitHub Action)')
          })
        }}
      >
        <h2>{t.community.digestSubscribe}</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <Button type="submit">Subscribe</Button>
        {message && <p className="auth-message">{message}</p>}
      </form>
      </Card>

      <p>
        <Link to="/">← Back to overview</Link>
      </p>
    </article>
  )
}
