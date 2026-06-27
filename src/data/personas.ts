export type PersonaId = 'full' | 'swe-manager'

export type ResourcePriority = 'essential' | 'recommended' | 'optional' | 'skip'

export interface Persona {
  id: PersonaId
  label: string
  subtitle: string
  summary: string
  goals: string[]
  phaseOrder: string[]
  phaseOverrides: Record<
    string,
    { description?: string; estimatedWeeks?: string; note?: string }
  >
  resources: Record<string, ResourcePriority>
  resourceNotes: Record<string, string>
}

export const PERSONAS: Record<PersonaId, Persona> = {
  full: {
    id: 'full',
    label: 'Full Track',
    subtitle: 'Complete beginner → expert',
    summary: 'Every resource in sequence — for hands-on builders starting from scratch.',
    goals: [],
    phaseOrder: [
      'foundations',
      'llm-fundamentals',
      'applied-llm',
      'agent-foundations',
      'production-agents',
      'expert-mastery',
      'ai-news-radar',
    ],
    phaseOverrides: {},
    resources: {},
    resourceNotes: {},
  },

  'swe-manager': {
    id: 'swe-manager',
    label: 'Software Engineering Manager',
    subtitle: 'Lead AI teams with confidence',
    summary:
      'You already understand systems, shipping, and people. This track skips deep math and from-scratch implementation — and focuses on architecture, evaluation, production trade-offs, and the vocabulary to lead AI engineering teams.',
    goals: [
      'Evaluate agent/RAG proposals and vendor pitches critically',
      'Ask the right questions in design reviews and sprint planning',
      'Understand when to use workflows vs agents, RAG vs fine-tuning',
      'Set up evaluation and LLMOps expectations for your team',
      'Stay current without reading every paper or writing training code',
    ],
    phaseOrder: [
      'llm-fundamentals',
      'ai-news-radar',
      'agent-foundations',
      'production-agents',
      'applied-llm',
      'foundations',
      'expert-mastery',
    ],
    phaseOverrides: {
      foundations: {
        description:
          'Lite track only — you don\'t need a full ML course. Focus on system design literacy and curated references.',
        estimatedWeeks: '2–3 weeks (optional)',
        note: 'Skim DMLS + subscribe to a newsletter. Skip UDL and full ML bootcamps.',
      },
      'llm-fundamentals': {
        description:
          'Build LLM fluency fast — enough to read architecture docs and lead technical discussions.',
        estimatedWeeks: '3–4 weeks',
        note: 'Watch intro videos, read the prompt guide, take the 1-hr transformers course.',
      },
      'applied-llm': {
        description:
          'RAG and vector search — what your team will actually ship. Prioritize evaluation over implementation.',
        estimatedWeeks: '3–4 weeks',
        note: 'Understand RAG trade-offs; let your team handle Pinecone/Weaviate setup details.',
      },
      'agent-foundations': {
        description:
          'Your highest-ROI phase — industry guides, agent architecture, and design patterns for leadership.',
        estimatedWeeks: '4–5 weeks',
        note: 'Read Anthropic, OpenAI, and Google whitepapers before any framework course.',
      },
      'production-agents': {
        description:
          'MCP, memory, evaluation, and production books — how to scope and govern agent projects.',
        estimatedWeeks: '4–6 weeks',
        note: 'Evaluating AI Agents course is non-negotiable for managers.',
      },
      'expert-mastery': {
        description:
          'Multi-agent strategy and LLMOps — for scaling teams and long-horizon planning.',
        estimatedWeeks: 'Ongoing',
        note: 'Pick multi-agent overview + LLMOps; skip philosophical deep dives unless interested.',
      },
      'ai-news-radar': {
        description:
          'Your ongoing news ritual — scan awesome-ai-news monthly and map headlines to curriculum.',
        estimatedWeeks: '30 min/week',
        note: 'Start this in week 1 alongside LLM fundamentals. Check GitHub on the 1st Monday each month.',
      },
    },
    resources: {
      // Phase 1 — lite
      'ml-beginners': 'skip',
      'made-with-ml': 'optional',
      'udl-book': 'skip',
      'dmls': 'essential',
      'awesome-genai': 'recommended',
      'gradient-ascent': 'essential',
      'data-hustle': 'optional',

      // Phase 2
      'llm-intro-video': 'essential',
      'hands-on-llm': 'recommended',
      'llm-course': 'optional',
      'transformers-course': 'recommended',
      'prompt-guide': 'essential',
      'cot-paper': 'optional',
      'llm-scratch-video': 'skip',
      'llm-scratch-book': 'skip',

      // Phase 3
      'vector-db-pinecone': 'recommended',
      'vector-db-weaviate': 'optional',
      'rag-survey': 'optional',
      'advanced-rag': 'recommended',
      'improve-accuracy': 'essential',
      'llm-handbook': 'recommended',
      'hands-on-ai-eng': 'optional',
      'deep-focus': 'recommended',
      'decoding-ml': 'essential',

      // Phase 4
      'stanford-agents': 'essential',
      'google-agents-wp': 'essential',
      'agentic-ai-course': 'recommended',
      'react-paper': 'recommended',
      'toolformer-paper': 'optional',
      'tot-paper': 'optional',
      'anthropic-agents': 'essential',
      'openai-agents': 'essential',
      'effective-agents-video': 'essential',
      'google-companion': 'recommended',
      'ms-agents': 'recommended',
      'hf-agents': 'optional',
      'genai-agents': 'optional',
      'agent-design-patterns': 'recommended',

      // Phase 5
      'mcp-video': 'recommended',
      'mcp-course': 'optional',
      'mcp-book': 'recommended',
      'agent-memory': 'recommended',
      'generative-agents': 'optional',
      'build-eval-video': 'essential',
      'agent-scratch-video': 'optional',
      'eval-agents': 'essential',
      'reflexion-paper': 'optional',
      'browser-agents': 'optional',
      'computer-use': 'optional',
      'claude-code': 'recommended',
      'ai-agents-definitive': 'essential',
      'building-apps-agents': 'essential',
      'ai-engineering': 'essential',
      'jam-with-ai': 'recommended',

      // Phase 6
      'multi-agent-course': 'recommended',
      'multi-agent-systems': 'recommended',
      'multi-agent-dl': 'optional',
      'philo-agents': 'skip',
      'llmops': 'essential',
      'automated-testing': 'recommended',
      'neosage': 'optional',

      // Phase 7 — AI News Radar
      'awesome-ai-news': 'essential',
      'karpathy-software-changing': 'essential',
      'agents-md': 'recommended',
      'google-adk': 'recommended',
      'openai-agent-builder': 'recommended',
      'voice-agents-course': 'optional',
      'vision-agents': 'optional',
    },
    resourceNotes: {
      'dmls': 'Best ROI for managers — mirrors how you already think about production systems.',
      'llm-intro-video': 'Watch first. Gives you vocabulary for every conversation after.',
      'hands-on-llm': 'Skim Part 1 + RAG chapters. Skip fine-tuning unless your team does it.',
      'prompt-guide': 'Read the techniques section — you\'ll use this in every AI product review.',
      'improve-accuracy': 'Teaches the evaluation mindset your team needs before shipping.',
      'stanford-agents': 'Academic framing helps you push back on over-engineered agent proposals.',
      'anthropic-agents': 'Must-read. "Don\'t build agents when workflows will do" — quote this in meetings.',
      'openai-agents': 'Guardrails and orchestration patterns — use for scoping docs.',
      'eval-agents': 'Critical. You can\'t manage what you can\'t measure.',
      'ai-agents-definitive': 'Production agent pitfalls — agent-washing, cost, reliability.',
      'ai-engineering': 'Chip Huyen\'s strategic view on foundation models in products.',
      'llmops': 'Set expectations for CI, deployment, and monitoring on AI projects.',
      'awesome-ai-news': 'Bookmark this repo. Your 15-min monthly scan replaces Twitter doom-scrolling.',
      'karpathy-software-changing': 'Software 3.0 framing — use in strategy docs and team talks.',
      'agents-md': 'If your team uses coding agents, require AGENTS.md in every repo.',
    },
  },
}

export const PRIORITY_LABELS: Record<ResourcePriority, string> = {
  essential: 'Essential',
  recommended: 'Recommended',
  optional: 'Optional',
  skip: 'Skip',
}

export function getResourcePriority(
  personaId: PersonaId,
  resourceId: string,
): ResourcePriority {
  if (personaId === 'full') return 'essential'
  return PERSONAS[personaId].resources[resourceId] ?? 'optional'
}

export function getPersonaResourceIds(
  personaId: PersonaId,
  allIds: string[],
  priorities: ResourcePriority[],
): string[] {
  if (personaId === 'full') return allIds
  return allIds.filter((id) =>
    priorities.includes(getResourcePriority(personaId, id)),
  )
}
