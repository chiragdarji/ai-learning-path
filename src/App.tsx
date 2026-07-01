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
import { ProgressBar } from './components/ProgressBar'
import { usePersonaProgress } from './hooks/usePersonaProgress'
import { ProgressActions } from './components/ProgressActions'
import { PersonaBanner } from './components/PersonaBanner'
import { TopNav } from './components/TopNav'
import { MobileTabBar } from './components/MobileTabBar'
import { SiteFooter } from './components/SiteFooter'
import { AuthModal } from './components/AuthModal'
import { LearnSidebar } from './components/LearnSidebar'
import { MyLearningPage } from './components/MyLearningPage'
import { CommunityPage } from './components/CommunityPage'
import { SearchView } from './components/SearchView'
import { SubmitResourcePage } from './components/SubmitResourcePage'
import { AdminPage } from './components/AdminPage'
import { DigestPage } from './components/DigestPage'
import { TeamPage } from './components/TeamPage'
import { EmbedPage } from './components/EmbedPage'
import { PrivacyPage } from './components/PrivacyPage'
import { useProgress } from './hooks/useProgress'
import { usePersona } from './hooks/usePersona'
import { useCommunityStats } from './hooks/useCommunityStats'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, usePageMeta } from './hooks/usePageMeta'
import { useJsonLd } from './hooks/useJsonLd'
import { curriculumJsonLd, phaseCourseJsonLd } from './lib/jsonLd'
import type { PhaseCompletionStat } from './services/communityStats'
import type { Phase } from './types'
import { getResourcePriority, isEssentialTrack } from './data/personas'

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

  const progressLabel = isEssentialTrack(personaId)
    ? 'Essential progress'
    : 'Overall progress'
  const progressTotal = isEssentialTrack(personaId)
    ? essentialIds.length
    : trackIds.length
  const progressDone = isEssentialTrack(personaId) ? essentialDone : trackDone

  const isPhaseView = location.pathname.startsWith('/phase/')
  const learnPaths = ['/', '/search', '/news-radar']
  const isLearnRoute =
    learnPaths.includes(location.pathname) || isPhaseView
  const { getPhaseStat, loading: communityStatsLoading } = useCommunityStats()

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <TopNav />
      <AuthModal />
      <div className="app-body">
        {isLearnRoute && (
          <LearnSidebar
            personaId={personaId}
            completedCount={phaseCompleted}
            totalCount={phaseTotal}
          />
        )}

        <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="top-bar">
          <ProgressBar
            completed={progressDone}
            total={progressTotal}
            label={progressLabel}
          />
          <div className="top-bar-actions">
            <div className="top-bar-tools">
              {isEssentialTrack(personaId) && isPhaseView && (
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

        <Outlet
          context={{
            personaId,
            isComplete,
            toggle,
            showSkipped,
            getPhaseStat,
            communityStatsLoading,
          }}
        />
        </main>
      </div>
      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}

interface OutletContext {
  personaId: ReturnType<typeof usePersona>['personaId']
  isComplete: (id: string) => boolean
  toggle: (id: string) => void
  showSkipped: boolean
  getPhaseStat: (phaseId: string) => PhaseCompletionStat | undefined
  communityStatsLoading: boolean
}

function OverviewPage() {
  const { personaId, isComplete, getPhaseStat, communityStatsLoading } =
    useOutletContext<OutletContext>()
  const navigate = useNavigate()
  usePageMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, '/')
  useJsonLd(useMemo(() => curriculumJsonLd(LEARNING_PATH), []))

  return (
    <Overview
      personaId={personaId}
      onSelectPhase={(id) => navigate(`/phase/${id}`)}
      onSelectNewsRadar={() => navigate('/news-radar')}
      isComplete={isComplete}
      getPhaseStat={getPhaseStat}
      communityStatsLoading={communityStatsLoading}
    />
  )
}

function NewsRadarPage() {
  const { isComplete } = useOutletContext<OutletContext>()
  const navigate = useNavigate()
  usePageMeta(
    'AI News Radar',
    'Monthly AI news themes mapped to curriculum learning actions for engineering leaders.',
    '/news-radar',
  )

  return (
    <NewsRadarView
      onSelectPhase={(id) => navigate(`/phase/${id}`)}
      isComplete={isComplete}
    />
  )
}

function PhasePage() {
  const { phaseId } = useParams<{ phaseId: string }>()
  const {
    personaId,
    isComplete,
    toggle,
    showSkipped,
    getPhaseStat,
    communityStatsLoading,
  } = useOutletContext<OutletContext>()

  const phase = LEARNING_PATH.find((p) => p.id === phaseId)

  usePageMeta(
    phase?.title ?? 'Phase',
    phase?.description ?? DEFAULT_DESCRIPTION,
    phaseId ? `/phase/${phaseId}` : '/',
  )
  useJsonLd(useMemo(() => (phase ? phaseCourseJsonLd(phase) : null), [phase]))

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
      phaseCommunityStat={getPhaseStat(phase.id)}
      communityStatsLoading={communityStatsLoading}
    />
  )
}

function SearchPage() {
  usePageMeta(
    'Search Resources',
    'Search and filter the full AI learning path curriculum.',
    '/search',
  )
  return <SearchView />
}

function PrivacyRoute() {
  usePageMeta(
    'Privacy Policy',
    'How AI Learning Path handles your data, progress, and analytics.',
    '/privacy',
  )
  return <PrivacyPage />
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="my" element={<MyLearningPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="news-radar" element={<NewsRadarPage />} />
        <Route path="submit" element={<SubmitResourcePage />} />
        <Route path="digest" element={<DigestPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="embed" element={<EmbedPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="privacy" element={<PrivacyRoute />} />
        <Route path="phase/:phaseId" element={<PhasePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
