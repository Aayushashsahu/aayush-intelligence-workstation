import type { LabEntry } from '@/lib/types'

/**
 * LAB — experiments and research threads.
 * Each entry leads with the question being tested rather than a product claim.
 * Dates are null unless genuinely known.
 */
export const lab: LabEntry[] = [
  {
    id: 'semantic-vs-structural',
    title: 'Semantic verification of extracted data',
    question: 'Do deterministic semantic checks catch the failure modes that structural validation misses?',
    description:
      'Testing whether semantic checks catch the cases where a scrape technically succeeds but the content is wrong.',
    state: 'Running comparison runs against known-bad fixtures.',
    category: 'ANALYSIS',
    tags: ['verification', 'data-integrity', 'testing'],
    status: 'TESTING',
    relatedProjects: ['aegis'],
    relatedResearch: ['semantic-verification'],
  },
  {
    id: 'responder-authority',
    title: 'Authority limits for automated responders',
    question: 'How much authority can an automated responder hold before its actions stop being auditable?',
    description:
      'Exploring where approval gates belong in an agent pipeline so every externally visible action has a traceable owner.',
    state: 'Mapping candidate gate placements against incident scenarios.',
    category: 'SECURITY OF AI SYSTEMS',
    tags: ['incident-response', 'governance', 'automation'],
    status: 'RESEARCHING',
    relatedProjects: ['sentinelforge'],
    relatedResearch: ['approval-boundaries'],
  },
  {
    id: 'local-first-assistant',
    title: 'Local-first personal intelligence',
    question: 'Can a personal assistant be fully local and still genuinely useful?',
    description:
      'What capability is actually required when inference, memory and multimodal input all live on the machine.',
    state: 'Prototype instrumented with vision, voice and retrieval.',
    category: 'AI MEMORY',
    tags: ['local-first', 'multimodal', 'assistant'],
    status: 'PROTOTYPING',
    relatedProjects: ['edith'],
    relatedResearch: ['local-first-intelligence'],
  },
  {
    id: 'fail-closed-release',
    title: 'Fail-closed release gates for AI output',
    question: 'What does it take to make "verified" a real state rather than a label?',
    description:
      'Separating extraction from verification, then gating release on deterministic evidence instead of confidence.',
    state: 'Design settled; hardening the release boundary.',
    category: 'AI RELIABILITY',
    tags: ['verification', 'reliability', 'trust'],
    status: 'RESEARCHING',
    relatedProjects: ['aegis'],
    relatedResearch: ['release-gates'],
  },
  {
    id: 'knowledge-provenance',
    title: 'Knowledge graphs for operational compliance',
    question: 'How do you structure industrial documents so retrieval never loses provenance?',
    description:
      'Structuring operational documents into a graph that supports retrieval, compliance tracking and root-cause analysis with traceable sources.',
    state: 'Exploring graph shapes against sample corpora.',
    category: 'INTELLIGENCE SYSTEMS',
    tags: ['knowledge-graph', 'rag', 'compliance'],
    status: 'EXPLORING',
    relatedProjects: ['jarvis'],
    relatedResearch: ['industrial-knowledge-graphs'],
  },
]
