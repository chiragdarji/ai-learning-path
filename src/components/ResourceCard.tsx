import type { Resource } from '../types'
import { TYPE_LABELS } from '../types'
import type { ResourcePriority } from '../data/personas'
import { PRIORITY_LABELS } from '../data/personas'
import { difficultyLabel, typeIcon } from '../utils/helpers'

interface ResourceCardProps {
  resource: Resource
  done: boolean
  onToggle: (id: string) => void
  priority?: ResourcePriority
  managerNote?: string
  dimmed?: boolean
}

export function ResourceCard({
  resource,
  done,
  onToggle,
  priority,
  managerNote,
  dimmed,
}: ResourceCardProps) {
  return (
    <article
      className={`resource-card ${done ? 'done' : ''} ${dimmed ? 'dimmed' : ''} ${priority ? `priority-${priority}` : ''}`}
    >
      <div className="resource-top">
        <button
          type="button"
          className={`check-btn ${done ? 'checked' : ''}`}
          onClick={() => onToggle(resource.id)}
          aria-label={
            done
              ? `Mark "${resource.title}" incomplete`
              : `Mark "${resource.title}" complete`
          }
          aria-pressed={done}
        >
          {done ? '✓' : ''}
        </button>
        <div className="resource-badges">
          {priority && priority !== 'essential' && (
            <span className={`badge priority-badge priority-${priority}`}>
              {PRIORITY_LABELS[priority]}
            </span>
          )}
          {priority === 'essential' && (
            <span className="badge priority-badge priority-essential">★ Essential</span>
          )}
          <span className={`badge type-${resource.type}`}>
            {typeIcon(resource.type)} {TYPE_LABELS[resource.type]}
          </span>
          <span className={`badge diff-${resource.difficulty}`}>
            {difficultyLabel(resource.difficulty)}
          </span>
          {resource.duration && (
            <span className="badge duration">{resource.duration}</span>
          )}
        </div>
      </div>

      <h4 className="resource-title">
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          {resource.title}
        </a>
      </h4>

      <p className="resource-desc">{resource.description}</p>

      {managerNote && <p className="manager-note">{managerNote}</p>}

      <div className="resource-tags">
        {resource.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
