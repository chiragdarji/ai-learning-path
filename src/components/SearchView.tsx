import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { Link } from 'react-router-dom'
import { PageHeader } from './PageHeader'
import type { Difficulty, ResourceType } from '../types'
import { TYPE_LABELS } from '../types'
import { difficultyLabel, typeIcon } from '../utils/helpers'
import {
  ALL_DIFFICULTIES,
  ALL_RESOURCE_TYPES,
  buildResourceIndex,
  type IndexedResource,
} from '../utils/resourceIndex'

const INDEX = buildResourceIndex()

const fuse = new Fuse(INDEX, {
  keys: [
    { name: 'title', weight: 0.45 },
    { name: 'description', weight: 0.25 },
    { name: 'tags', weight: 0.2 },
    { name: 'phaseTitle', weight: 0.05 },
    { name: 'stepTitle', weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
})

function filterResources(
  items: IndexedResource[],
  types: Set<ResourceType>,
  difficulties: Set<Difficulty>,
): IndexedResource[] {
  return items.filter(
    (item) =>
      (types.size === 0 || types.has(item.type)) &&
      (difficulties.size === 0 || difficulties.has(item.difficulty)),
  )
}

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function SearchView() {
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<Set<ResourceType>>(new Set())
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(new Set())

  const results = useMemo(() => {
    const base = query.trim()
      ? fuse.search(query.trim()).map((r) => r.item)
      : INDEX
    return filterResources(base, types, difficulties)
  }, [query, types, difficulties])

  return (
    <div className="search-view">
      <PageHeader eyebrow="Browse curriculum" title="Search resources">
        <p className="lead">
          Find videos, courses, repos, and papers across all phases. Filter by type
          and difficulty.
        </p>
      </PageHeader>

      <div className="search-controls">
        <label className="search-input-wrap">
          <span className="visually-hidden">Search resources</span>
          <input
            type="search"
            className="search-input"
            placeholder="Search title, description, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </label>

        <div className="filter-group">
          <span className="filter-label">Type</span>
          <div className="filter-chips">
            {ALL_RESOURCE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`filter-chip ${types.has(type) ? 'active' : ''}`}
                onClick={() => setTypes(toggleSet(types, type))}
              >
                {typeIcon(type)} {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-label">Difficulty</span>
          <div className="filter-chips">
            {ALL_DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                className={`filter-chip ${difficulties.has(level) ? 'active' : ''}`}
                onClick={() => setDifficulties(toggleSet(difficulties, level))}
              >
                {difficultyLabel(level)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="search-count">
        {results.length} resource{results.length === 1 ? '' : 's'}
      </p>

      <ul className="search-results">
        {results.map((resource) => (
          <li key={resource.id} className="search-result">
            <div className="search-result-meta">
              <span className={`badge type-${resource.type}`}>
                {typeIcon(resource.type)} {TYPE_LABELS[resource.type]}
              </span>
              <span className={`badge diff-${resource.difficulty}`}>
                {difficultyLabel(resource.difficulty)}
              </span>
              <Link to={`/phase/${resource.phaseId}`} className="search-phase-link">
                {resource.phaseTitle}
              </Link>
            </div>
            <h2 className="search-result-title">
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                {resource.title}
              </a>
            </h2>
            <p>{resource.description}</p>
            <div className="resource-tags">
              {resource.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
