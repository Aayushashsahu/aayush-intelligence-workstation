import type { SecurityCase } from '@/lib/types'

/**
 * SECURITY — case files.
 * Technical depth rather than posture. Findings and evidence are described from the
 * repository surface; nothing is dramatised and no incident is invented.
 */
export const security: SecurityCase[] = [
  {
    id: 'aegis-reliability',
    title: 'AEGIS — treating HTTP success as an observation',
    description:
      'A reliability control around data extraction built on the premise that a successful call and a successful parse are observations, not proof.',
    category: 'AI RELIABILITY / VERIFICATION',
    findings: [
      'Semantic verification is modelled as a stage separate from extraction.',
      'Risk policy is explicit rather than implied by code paths.',
      'Release boundaries fail closed: unverified output does not ship.',
    ],
    evidence: [
      'Architecture separates extraction, verification and release gating.',
      'The design assumes extraction can succeed while being wrong.',
    ],
    references: [],
    status: 'ACTIVE',
    projectId: 'aegis',
    tags: ['ai-reliability', 'verification', 'fail-closed'],
  },
  {
    id: 'sentinelforge-authority',
    title: 'SentinelForge — authority boundaries in incident response',
    description:
      'An approval-gated engineering incident responder where the separation of evidence, investigation, proposal, approval, verification and action is the architecture.',
    category: 'INCIDENT RESPONSE / AUTHORIZATION',
    findings: [
      'Every external action passes through an explicit approval gate.',
      'Proposal and approval are distinct stages held by different actors.',
      'Verification is required before the loop is considered closed.',
    ],
    evidence: [
      'Authority boundaries are encoded in the pipeline rather than convention.',
      'Guarded external action instead of unbounded automation.',
    ],
    references: [],
    status: 'ACTIVE',
    projectId: 'sentinelforge',
    tags: ['incident-response', 'authorization', 'governance'],
  },
]

// Presentational depth areas and status options live in `lib/taxonomy`,
// which is safe to import from client components.
