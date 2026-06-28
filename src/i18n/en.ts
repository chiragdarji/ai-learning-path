export const en = {
  nav: {
    overview: 'Roadmap Overview',
    overviewSub: 'Full journey map',
    search: 'Search',
    searchSub: 'Filter all resources',
    newsRadar: 'AI News Radar',
    newsRadarSub: 'Stay current · Phase 7',
    phases: 'Phases',
    privacy: 'Privacy',
    submit: 'Submit resource',
    digest: 'Weekly digest',
    team: 'Team',
    embed: 'Embed / API',
    admin: 'Admin',
  },
  auth: {
    signIn: 'Sign in to sync',
    signOut: 'Sign out',
  },
  persona: {
    yourTrack: 'Your track',
    manager: 'Manager',
    full: 'Full track',
    switchLabel: 'Choose track',
  },
  community: {
    submitTitle: 'Suggest a resource',
    submitLead: 'Propose a link for the curriculum. Admins review before publishing.',
    notes: 'My notes',
    sharedNotes: 'Community notes',
    assign: 'Assign to team',
    digestSubscribe: 'Subscribe to weekly digest',
    curriculumVersion: 'Curriculum version',
  },
  admin: {
    title: 'Admin dashboard',
    submissions: 'Pending submissions',
    linkHealth: 'Link health',
    digestSubs: 'Digest subscribers',
  },
} as const

export type Messages = {
  nav: Record<keyof typeof en.nav, string>
  auth: Record<keyof typeof en.auth, string>
  persona: Record<keyof typeof en.persona, string>
  community: Record<keyof typeof en.community, string>
  admin: Record<keyof typeof en.admin, string>
}
