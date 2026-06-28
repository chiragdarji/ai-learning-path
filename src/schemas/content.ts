import { z } from 'zod'

export const resourceTypeSchema = z.enum([
  'video',
  'repo',
  'guide',
  'book',
  'paper',
  'course',
  'newsletter',
])

export const difficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
])

export const resourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  type: resourceTypeSchema,
  difficulty: difficultySchema,
  duration: z.string().optional(),
  description: z.string().min(1),
  tags: z.array(z.string()),
})

export const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  resources: z.array(resourceSchema).min(1),
})

export const phaseSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  level: difficultySchema,
  levelLabel: z.string().min(1),
  description: z.string().min(1),
  estimatedWeeks: z.string().min(1),
  steps: z.array(stepSchema).min(1),
})

export const learningPathSchema = z.array(phaseSchema).min(1)

export const resourcePrioritySchema = z.enum([
  'essential',
  'recommended',
  'optional',
  'skip',
])

export const personaIdSchema = z.enum([
  'full',
  'swe-manager',
  'product-manager',
  'ic-engineer',
  'data-scientist',
])

export const personaSchema = z.object({
  id: personaIdSchema,
  label: z.string().min(1),
  subtitle: z.string().min(1),
  summary: z.string().min(1),
  goals: z.array(z.string()),
  phaseOrder: z.array(z.string()).min(1),
  phaseOverrides: z.record(
    z.string(),
    z.object({
      description: z.string().optional(),
      estimatedWeeks: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  resources: z.record(z.string(), resourcePrioritySchema),
  resourceNotes: z.record(z.string(), z.string()),
})

export const personasSchema = z.record(personaIdSchema, personaSchema)

export const learningBridgeSchema = z.object({
  id: z.string().min(1),
  theme: z.string().min(1),
  icon: z.string().min(1),
  newsSignal: z.string().min(1),
  recentExamples: z.array(z.string()),
  managerAction: z.string().min(1),
  phaseId: z.string().min(1),
  phaseTitle: z.string().min(1),
  curriculumResourceIds: z.array(z.string()),
  phase7ResourceIds: z.array(z.string()),
})

export const newsHighlightSchema = z.object({
  id: z.string().min(1),
  headline: z.string().min(1),
  month: z.string().min(1),
  themeId: z.string().min(1),
  learningAction: z.string().min(1),
  phaseId: z.string().min(1),
})

export const aiNewsRadarSchema = z.object({
  awesomeAiNews: z.object({
    title: z.string().min(1),
    url: z.string().url(),
    description: z.string().min(1),
    updateCadence: z.string().min(1),
  }),
  monthlyRitual: z.array(
    z.object({
      step: z.number().int().positive(),
      title: z.string().min(1),
      detail: z.string().min(1),
    }),
  ),
  learningBridges: z.array(learningBridgeSchema).min(1),
  recentHighlights: z.array(newsHighlightSchema),
})

export type LearningPathData = z.infer<typeof learningPathSchema>
export type PersonasData = z.infer<typeof personasSchema>
export type AiNewsRadarData = z.infer<typeof aiNewsRadarSchema>

export function collectResourceIds(phases: LearningPathData): string[] {
  return phases.flatMap((p) =>
    p.steps.flatMap((s) => s.resources.map((r) => r.id)),
  )
}

export function assertUniqueResourceIds(phases: LearningPathData): void {
  const seen = new Map<string, string>()
  for (const phase of phases) {
    for (const step of phase.steps) {
      for (const resource of step.resources) {
        const existing = seen.get(resource.id)
        if (existing) {
          throw new Error(
            `Duplicate resource id "${resource.id}" in phases "${existing}" and "${phase.id}"`,
          )
        }
        seen.set(resource.id, phase.id)
      }
    }
  }
}

export function assertPersonaReferences(
  phases: LearningPathData,
  personas: PersonasData,
  news: AiNewsRadarData,
): void {
  const phaseIds = new Set(phases.map((p) => p.id))
  const resourceIds = new Set(collectResourceIds(phases))
  const bridgeIds = new Set(news.learningBridges.map((b) => b.id))

  for (const persona of Object.values(personas)) {
    for (const pid of persona.phaseOrder) {
      if (!phaseIds.has(pid)) {
        throw new Error(
          `Persona "${persona.id}" references unknown phase "${pid}"`,
        )
      }
    }
    for (const rid of Object.keys(persona.resources)) {
      if (!resourceIds.has(rid)) {
        throw new Error(
          `Persona "${persona.id}" references unknown resource "${rid}"`,
        )
      }
    }
    for (const rid of Object.keys(persona.resourceNotes)) {
      if (!resourceIds.has(rid)) {
        throw new Error(
          `Persona "${persona.id}" resourceNotes references unknown resource "${rid}"`,
        )
      }
    }
  }

  for (const bridge of news.learningBridges) {
    if (!phaseIds.has(bridge.phaseId)) {
      throw new Error(
        `Bridge "${bridge.id}" references unknown phase "${bridge.phaseId}"`,
      )
    }
    for (const rid of [
      ...bridge.curriculumResourceIds,
      ...bridge.phase7ResourceIds,
    ]) {
      if (!resourceIds.has(rid)) {
        throw new Error(
          `Bridge "${bridge.id}" references unknown resource "${rid}"`,
        )
      }
    }
  }

  for (const highlight of news.recentHighlights) {
    if (!bridgeIds.has(highlight.themeId)) {
      throw new Error(
        `Highlight "${highlight.id}" references unknown theme "${highlight.themeId}"`,
      )
    }
    if (!phaseIds.has(highlight.phaseId)) {
      throw new Error(
        `Highlight "${highlight.id}" references unknown phase "${highlight.phaseId}"`,
      )
    }
  }
}

export function validateAllContent(
  learningPathRaw: unknown,
  personasRaw: unknown,
  newsRaw: unknown,
) {
  const learningPath = learningPathSchema.parse(learningPathRaw)
  const personas = personasSchema.parse(personasRaw)
  const news = aiNewsRadarSchema.parse(newsRaw)

  assertUniqueResourceIds(learningPath)
  assertPersonaReferences(learningPath, personas, news)

  return { learningPath, personas, news }
}
