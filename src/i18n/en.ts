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
    learn: 'Learn',
    myLearning: 'My learning',
    community: 'Community',
    account: 'Account',
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
  myLearning: {
    title: 'My learning',
    progress: 'Your progress',
    persona: 'Your track',
    continue: 'Continue learning',
    signInHint: 'Sign in to sync your progress across devices.',
  },
  communityHub: {
    title: 'Community',
    intro: 'Contribute resources, get the weekly digest, and learn alongside others.',
    submit: 'Submit a resource',
    submitSub: 'Suggest a link for the curriculum',
    digest: 'Weekly digest',
    digestSub: 'Essential resources in your inbox',
    team: 'Team',
    teamSub: 'Learn together',
  },
} as const

export type Messages = {
  nav: Record<keyof typeof en.nav, string>
  auth: Record<keyof typeof en.auth, string>
  persona: Record<keyof typeof en.persona, string>
  community: Record<keyof typeof en.community, string>
  admin: Record<keyof typeof en.admin, string>
  myLearning: Record<keyof typeof en.myLearning, string>
  communityHub: Record<keyof typeof en.communityHub, string>
}
