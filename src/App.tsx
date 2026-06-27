import { useMemo, useState } from 'react'
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'
import { LEARNING_PATH } from './data/learningPath'
import { Overview } from './components/Overview'
import { PhaseView } from './components/PhaseView'
import { NewsRadarView } from './components/NewsRadarView'
import { ProgressBar, usePersonaProgress } from './components/ProgressBar'
import { ProgressActions } from './components/ProgressActions'
import { PersonaBanner } from './components/PersonaBanner'
import { Sidebar } from './components/Sidebar'
import { useProgress } from './hooks/useProgress'
import { usePersona } from './hooks/usePersona'
import type { Phase } from './types'
import { getResourcePriority } from './data/personas'

function countPhase(
  phase: Phase,
  isComplete: (id: string) => boolean,
  personaId: ReturnType<typeof usePersona>['personaId'],
  showSkipped: boolean,
) {
  const resources = phase.steps.flatMap((s) => s.resources).filter((r) => {
    const p = getResourcePriority(personaId, r.id)
    return showSkipped || p !== 'skip'
  })
  return {
    total: resources.length,
    done: resources.filter((r) => isComplete(r.id)).length,
  }
}

function AppShell() {
  const [showSkipped, setShowSkipped] = useState(false)
  const {
    toggle,
    isComplete,
    reset,
    count,
    exportProgress,
    importProgress,
  } = useProgress()
  const { personaId, setPersona } = usePersona()
  const navigate = useNavigate()
  const location = useLocation()

  const allResourceIds = useMemo(
    () =>
      LEARNING_PATH.flatMap((p) =>
        p.steps.flatMap((s) => s.resources.map((r) => r.id)),
      ),
    [],
  )

  const { trackIds, essentialIds, trackDone, essentialDone } = usePersonaProgress(
    personaId,
    allResourceIds,
    isComplete,
  )

  const phaseCompleted = (p: Phase) =>
    countPhase(p, isComplete, personaId, showSkipped).done
  const phaseTotal = (p: Phase) =>
    countPhase(p, isComplete, personaId, showSkipped).total

  const progressLabel =
    personaId === 'swe-manager' ? 'Essential progress' : 'Overall progress'
  const progressTotal =
    personaId === 'swe-manager' ? essentialIds.length : trackIds.length
  const progressDone =
    personaId === 'swe-manager' ? essentialDone : trackDone

  const isPhaseView = location.pathname.startsWith('/phase/')

  return (
    <div className="app-shell">
      <Sidebar
        personaId={personaId}
        completedCount={phaseCompleted}
        totalCount={phaseTotal}
      />

      <main className="main-content">
        <div className="top-bar">
          <ProgressBar
            completed={progressDone}
            total={progressTotal}
            label={progressLabel}
          />
          <div className="top-bar-actions">
            {personaId === 'swe-manager' && isPhaseView && (
              <label className="toggle-skipped">
                <input
                  type="checkbox"
                  checked={showSkipped}
                  onChange={(e) => setShowSkipped(e.target.checked)}
                />
                Show skipped
              </label>
            )}
            <ProgressActions
              count={count}
              onExport={exportProgress}
              onImport={importProgress}
              onReset={reset}
            />
          </div>
        </div>

        <PersonaBanner
          personaId={personaId}
          onChangePersona={(id) => {
            setPersona(id)
            if (id === 'swe-manager' && isPhaseView) {
              navigate('/phase/llm-fundamentals')
            }
          }}
          essentialCount={essentialIds.length}
          essentialDone={essentialDone}
        />

        <Outlet context={{ personaId, isComplete, toggle, showSkipped }} />
      </main>
    </div>
  )
}

interface OutletContext {
  personaId: ReturnType<typeof usePersona>['personaId']
  isComplete: (id: string) => boolean
  toggle: (id: string) => void
  showSkipped: boolean
}

function OverviewPage() {
  const { personaId, isComplete } = useOutletContext<OutletContext>()
  const navigate = useNavigate()

  return (
    <Overview
      personaId={personaId}
      onSelectPhase={(id) => navigate(`/phase/${id}`)}
      onSelectNewsRadar={() => navigate('/news-radar')}
      isComplete={isComplete}
    />
  )
}

function NewsRadarPage() {
  const { isComplete } = useOutletContext<OutletContext>()
  const navigate = useNavigate()

  return (
    <NewsRadarView
      onSelectPhase={(id) => navigate(`/phase/${id}`)}
      isComplete={isComplete}
    />
  )
}

function PhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { personaId, isComplete, toggle, showSkipped } =
    useOutletContext<OutletContext>()

  const phase = LEARNING_PATH.find((p) => p.id === phaseId)

  if (!phase) {
    return <Navigate to="/" replace />
  }

  return (
    <PhaseView
      phase={phase}
      personaId={personaId}
      isComplete={isComplete}
      onToggle={toggle}
      showSkipped={showSkipped}
    />
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="news-radar" element={<NewsRadarPage />} />
        <Route path="phase/:phaseId" element={<PhasePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
