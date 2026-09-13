import type { Research } from '@/lib/types'

/**
 * CURATED RESEARCH / EXPERIMENTS
 * ----------------------------------------------------------------------------
 * This is the LAB. Items here are research threads and experiments, not
 * finished products — and that is the point: it shows active thinking.
 *
 * `date` is null unless the date is genuinely known. Related projects bind a
 * thread to a dossier so CORTEX can trace the evidence back.
 */

export const research: Research[] = [
  {
    id: 'release-gates',
    title: 'Evidence-first release gates for AI output',
    description:
      'Investigating what it takes to make "verified" a real state: separating extraction from semantic verification, then gating release on deterministic evidence.',
    date: null,
    category: 'AI RELIABILITY',
    tags: ['verification', 'reliability', 'trust'],
    status: 'RESEARCHING',
    relatedProjects: ['aegis'],
    notes: 'Derived from the AEGIS reliability work.',
  },
  {
    id: 'approval-boundaries',
    title: 'Authority boundaries for autonomous responders',
    description:
      'How far an automated responder should be allowed to go, and where a human approval gate has to sit so authority stays legible.',
    date: null,
    category: 'SECURITY OF AI SYSTEMS',
    tags: ['incident-response', 'governance', 'automation'],
    status: 'RESEARCHING',
    relatedProjects: ['sentinelforge'],
    notes: 'Derived from the SentinelForge approval-gated design.',
  },
  {
    id: 'local-first-intelligence',
    title: 'Local-first personal intelligence',
    description:
      'What a capable assistant looks like when inference, memory and multimodal input all live on the machine instead of a hosted service.',
    date: null,
    category: 'AI MEMORY',
    tags: ['local-first', 'multimodal', 'assistant'],
    status: 'PROTOTYPING',
    relatedProjects: ['edith'],
  },
  {
    id: 'industrial-knowledge-graphs',
    title: 'Knowledge graphs for operational compliance',
    description:
      'Structuring industrial documents into a graph that supports retrieval, compliance tracking and root-cause analysis without losing provenance.',
    date: null,
    category: 'INTELLIGENCE SYSTEMS',
    tags: ['knowledge-graph', 'rag', 'compliance'],
    status: 'EXPLORING',
    relatedProjects: ['jarvis'],
  },
  {
    id: 'semantic-verification',
    title: 'Semantic verification of extracted data',
    description:
      'Testing whether semantic checks catch the failure modes that structural validation misses when a scrape technically succeeds but is wrong.',
    date: null,
    category: 'ANALYSIS',
    tags: ['verification', 'data-integrity', 'testing'],
    status: 'TESTING',
    relatedProjects: ['aegis'],
  },
]
