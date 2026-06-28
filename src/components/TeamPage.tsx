import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import { useLocale } from '../context/LocaleProvider'
import {
  assignResource,
  createTeam,
  fetchMyAssignments,
  fetchOwnedTeams,
  type AssignmentRow,
  type TeamSummary,
} from '../services/communityFeatures'
import { LEARNING_PATH } from '../data/learningPath'

export function TeamPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [teamName, setTeamName] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const allResources = LEARNING_PATH.flatMap((p) =>
    p.steps.flatMap((s) => s.resources),
  )

  useEffect(() => {
    if (!user) return
    void Promise.all([
      fetchOwnedTeams(user.id),
      fetchMyAssignments(user.id),
    ]).then(([owned, mine]) => {
      setTeams(owned)
      setAssignments(mine)
      if (owned[0]) setSelectedTeam(owned[0].id)
    })
  }, [user])

  if (!user) {
    return (
      <article className="community-page">
        <p>Sign in to manage team assignments.</p>
        <Link to="/">← Back</Link>
      </article>
    )
  }

  return (
    <article className="community-page">
      <header className="page-header">
        <p className="eyebrow">Team</p>
        <h1>{t.community.assign}</h1>
        <p className="lead">
          Create a team and assign curriculum resources by member user ID (from Supabase auth).
        </p>
      </header>

      <section className="team-section">
        <h2>Your teams</h2>
        <form
          className="community-form inline-form"
          onSubmit={(e) => {
            e.preventDefault()
            void createTeam(user.id, teamName).then((result) => {
              if (result.error) {
                setMessage(result.error)
                return
              }
              setTeamName('')
              void fetchOwnedTeams(user.id).then(setTeams)
            })
          }}
        >
          <input
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <button type="submit" className="action-btn">
            Create team
          </button>
        </form>
        <ul className="admin-list">
          {teams.map((team) => (
            <li key={team.id}>
              {team.name} <code className="digest-meta">{team.id}</code>
            </li>
          ))}
        </ul>
      </section>

      {teams.length > 0 && (
        <section className="team-section">
          <h2>Assign resource</h2>
          <form
            className="community-form"
            onSubmit={(e) => {
              e.preventDefault()
              void assignResource({
                teamId: selectedTeam,
                resourceId,
                assigneeId,
                assignedBy: user.id,
              }).then((result) => {
                setMessage(result.error ?? 'Assigned.')
              })
            }}
          >
            <label>
              Team
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Resource
              <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} required>
                <option value="">—</option>
                {allResources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assignee user ID (UUID)
              <input
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                placeholder="member auth user id"
                required
              />
            </label>
            <button type="submit" className="auth-btn primary">
              Assign
            </button>
          </form>
        </section>
      )}

      <section className="team-section">
        <h2>Assigned to you</h2>
        {assignments.length === 0 ? (
          <p className="section-intro">No assignments yet.</p>
        ) : (
          <ul className="admin-list">
            {assignments.map((a) => (
              <li key={a.id}>
                <code>{a.resource_id}</code>
                {a.note ? ` — ${a.note}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      {message && <p className="auth-message">{message}</p>}
    </article>
  )
}
