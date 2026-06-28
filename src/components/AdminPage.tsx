import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { useLocale } from '../context/LocaleProvider'
import {
  fetchDigestSubscriberCount,
  fetchPendingSubmissions,
  reviewSubmission,
  type ResourceSubmission,
} from '../services/communityFeatures'
import { fetchUserProfile, isAdminEmail } from '../services/userProfile'

export function AdminPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [submissions, setSubmissions] = useState<ResourceSubmission[]>([])
  const [digestCount, setDigestCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    void (async () => {
      const profile = await fetchUserProfile(user.id)
      const admin =
        profile?.is_admin === true || isAdminEmail(user.email ?? undefined)
      setIsAdmin(admin)
      if (!admin) {
        setLoading(false)
        return
      }
      const [pending, subs] = await Promise.all([
        fetchPendingSubmissions(),
        fetchDigestSubscriberCount(),
      ])
      setSubmissions(pending)
      setDigestCount(subs)
      setLoading(false)
    })()
  }, [user])

  if (!user) {
    return (
      <article className="community-page">
        <p>Sign in to access admin tools.</p>
        <Link to="/">← Back</Link>
      </article>
    )
  }

  if (loading) return <p className="account-loading">Loading admin…</p>

  if (!isAdmin) {
    return (
      <article className="community-page">
        <h1>Access denied</h1>
        <p>
          Set <code>is_admin = true</code> on your profile or add your email to{' '}
          <code>VITE_ADMIN_EMAILS</code>.
        </p>
        <Link to="/">← Back</Link>
      </article>
    )
  }

  return (
    <article className="community-page admin-page">
      <header className="page-header">
        <p className="eyebrow">Admin</p>
        <h1>{t.admin.title}</h1>
      </header>

      <section className="admin-panel">
        <h2>{t.admin.submissions}</h2>
        {submissions.length === 0 ? (
          <p className="section-intro">No pending submissions.</p>
        ) : (
          <ul className="admin-list">
            {submissions.map((s) => (
              <li key={s.id} className="admin-card">
                <strong>{s.title}</strong>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.url}
                </a>
                <p>{s.description}</p>
                <p className="admin-meta">
                  {s.resource_type} · {s.difficulty}
                  {s.suggested_phase_id ? ` · ${s.suggested_phase_id}` : ''}
                </p>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() =>
                      void reviewSubmission(s.id, 'approved').then(() =>
                        setSubmissions((prev) => prev.filter((x) => x.id !== s.id)),
                      )
                    }
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() =>
                      void reviewSubmission(s.id, 'rejected').then(() =>
                        setSubmissions((prev) => prev.filter((x) => x.id !== s.id)),
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel">
        <h2>{t.admin.digestSubs}</h2>
        <p>{digestCount} subscriber{digestCount === 1 ? '' : 's'}</p>
      </section>

      <section className="admin-panel">
        <h2>{t.admin.linkHealth}</h2>
        <p className="section-intro">
          Weekly link-check runs in GitHub Actions. See repository workflows for failures.
        </p>
      </section>
    </article>
  )
}
