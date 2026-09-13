/**
 * Shared taxonomy. Client-safe: no AI keys, no datastore, no seed data.
 * Used by both the public views and the control room editors.
 */

export const thoughtTopics = [
  'AI AGENTS',
  'AI MEMORY',
  'INTELLIGENCE SYSTEMS',
  'HUMAN + AI INTERACTION',
  'AI RELIABILITY',
  'SECURITY OF AI SYSTEMS',
  'PRODUCT SYSTEMS',
  'ANALYSIS',
  'AUTOMATION',
]

export const securityDepthAreas = [
  { title: 'Cybersecurity', text: 'Trust boundaries, authorization and failure modes treated as first-class design material.' },
  { title: 'DFIR', text: 'Evidence acquisition, investigation structure and conclusions that survive scrutiny.' },
  { title: 'Security engineering', text: 'Guardrails, approval gates and guarded action instead of unbounded automation.' },
  { title: 'Reliability', text: 'Fail-closed behaviour and verification before release.' },
  { title: 'Incident response', text: 'A staged responder loop with explicit human authority.' },
  { title: 'Trust / verification', text: 'Making "verified" a real state rather than a label.' },
]

export const securityStatuses = ['ACTIVE', 'INVESTIGATION', 'MONITORING', 'CLOSED', 'ARCHIVED'] as const

export const projectStatuses = ['ACTIVE', 'MAINTAINED', 'PROTOTYPE', 'EXPERIMENT', 'SHIPPED', 'ARCHIVED'] as const

export const researchStatuses = [
  'EXPLORING',
  'RESEARCHING',
  'PROTOTYPING',
  'TESTING',
  'ACTIVE',
  'COMPLETED',
  'ARCHIVED',
] as const

export const timelineModels = ['BUILD', 'RESEARCH'] as const

export const BUILD_KINDS = ['IDEA', 'PROTOTYPE', 'BUILD', 'TEST', 'SHIP'] as const
export const RESEARCH_KINDS = ['DISCOVERY', 'COLLECTION', 'ANALYSIS', 'VALIDATION', 'CONCLUSION'] as const
export const milestoneKinds = [...BUILD_KINDS, ...RESEARCH_KINDS, 'OTHER'] as const

export const projectCategories = [
  'AI RELIABILITY / EVIDENCE SYSTEMS',
  'AI / OFFLINE SYSTEMS',
  'AI / KNOWLEDGE SYSTEMS',
  'AI / INFRASTRUCTURE',
  'AI / SYSTEMS',
  'SECURITY / INCIDENT RESPONSE',
  'SECURITY',
  'DATA / BACKEND',
  'PRODUCT / AI',
  'WEB / PRODUCT',
  'EXPERIMENTS',
]

export const researchCategories = [
  'AI RELIABILITY',
  'AI MEMORY',
  'INTELLIGENCE SYSTEMS',
  'HUMAN + AI INTERACTION',
  'SECURITY OF AI SYSTEMS',
  'PRODUCT SYSTEMS',
  'ANALYSIS',
  'AUTOMATION',
]

export const contentTypes = [
  'projects',
  'research',
  'lab',
  'security',
  'thoughts',
  'milestones',
] as const

export const mediaKinds = ['image', 'video', 'pdf', 'link'] as const
