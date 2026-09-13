import type { Project } from '@/lib/types'

/**
 * CURATED PROJECT DOSSIERS
 * ----------------------------------------------------------------------------
 * `repo` binds a dossier to live GitHub telemetry. Repositories that are not
 * listed here are still auto-discovered and appear in the archive — they simply
 * get a lighter, auto-generated dossier.
 *
 * Descriptions below are derived from the repository surface and the owner's
 * own project notes. No dates, metrics or achievements are invented.
 */

export const projects: Project[] = [
  {
    id: 'aegis',
    repo: 'AEGIS.',
    title: 'AEGIS',
    category: 'AI RELIABILITY / EVIDENCE SYSTEMS',
    objective: 'Make extraction reliability a verifiable property instead of an assumption.',
    why:
      'An HTTP 200 and a successful parse are observations, not proof. AEGIS is built around treating them that way and pushing the release decision onto deterministic evidence.',
    evidence: [
      'Semantic verification is modelled separately from extraction.',
      'Risk policy is explicit rather than implied.',
      'Release boundaries fail closed: unverified output does not ship.',
    ],
    architecture: [
      'Extraction → semantic verification → risk policy → release gate',
      'AI proposes; deterministic evidence decides.',
    ],
    techAreas: ['AI reliability', 'Verification', 'Risk controls', 'Fail-closed release'],
    status: 'ACTIVE',
    timeline: 'BUILD',
    tags: ['ai', 'reliability', 'verification', 'security'],
    featured: true,
  },
  {
    id: 'sentinelforge',
    repo: 'sentinelforge',
    title: 'SentinelForge',
    category: 'SECURITY / INCIDENT RESPONSE',
    objective: 'Automate incident response without handing an AI unchecked authority to act.',
    why:
      'An engineering incident responder that separates evidence, investigation, proposal, approval, verification and guarded external action. Authority boundaries are part of the architecture, not an afterthought.',
    evidence: [
      'Every external action passes through an explicit approval gate.',
      'Proposal and approval are distinct stages held by different actors.',
      'Verification is required before the loop is considered closed.',
    ],
    architecture: [
      'Evidence → investigation → proposal → approval → verification → guarded external action',
    ],
    techAreas: ['Incident response', 'Authorization boundaries', 'Evidence handling', 'Guarded automation'],
    status: 'ACTIVE',
    timeline: 'RESEARCH',
    tags: ['security', 'incident-response', 'automation', 'governance'],
    featured: true,
  },
  {
    id: 'edith',
    repo: 'EDITH-',
    title: 'E.D.I.T.H. V8',
    category: 'AI / OFFLINE SYSTEMS',
    objective: 'Run a capable personal assistant entirely on local hardware.',
    why:
      'An offline personal AI that combines local LLMs, vision, RAG, voice, automation and system integration. A system that actually touches the machine rather than a hosted chat window.',
    evidence: [
      'Local model inference rather than a hosted dependency.',
      'Multiple modalities wired into one assistant: vision, voice, retrieval.',
      'System-level integration and automation surfaces.',
    ],
    architecture: ['Local LLMs + vision + RAG + voice + automation', 'FastAPI / WebSockets service layer'],
    techAreas: ['Local LLMs', 'Vision', 'RAG', 'Voice', 'Automation', 'FastAPI / WebSockets'],
    status: 'ACTIVE',
    timeline: 'BUILD',
    tags: ['ai', 'local-first', 'multimodal', 'systems'],
    featured: true,
  },
  {
    id: 'jarvis',
    repo: 'J.A.R.V.I.S.-HACKTHONE',
    title: 'J.A.R.V.I.S.',
    category: 'AI / KNOWLEDGE SYSTEMS',
    objective: 'Turn industrial documents into retrievable, compliance-aware operational knowledge.',
    why:
      'Industrial knowledge intelligence built on document ingestion, knowledge graphs, RAG, compliance tracking and root-cause analysis. Enterprise-oriented product thinking rather than a toy chatbot.',
    evidence: [
      'Document intelligence feeding a structured knowledge graph.',
      'Compliance tracking layered on retrieved knowledge.',
      'Root-cause analysis as a first-class output.',
    ],
    architecture: ['Ingest → knowledge graph → retrieval (RAG) → compliance & RCA surfaces'],
    techAreas: ['Document intelligence', 'Knowledge graphs', 'RAG', 'Compliance tracking', 'Root-cause analysis'],
    status: 'SHIPPED',
    timeline: 'RESEARCH',
    tags: ['ai', 'knowledge-graph', 'rag', 'industrial'],
    featured: true,
  },
  {
    id: 'reconciliation-engine',
    repo: 'reconciliation-engine',
    title: 'Reconciliation Engine',
    category: 'DATA / BACKEND',
    objective: 'Resolve disagreement between transaction records deterministically.',
    why:
      'A focused engineering system for transaction and data reconciliation — clear evidence of backend and data-integrity thinking.',
    evidence: ['Deterministic matching logic rather than heuristic guessing.'],
    architecture: ['Ingest → match → resolve → report'],
    techAreas: ['Backend', 'Data integrity', 'Matching logic'],
    status: 'MAINTAINED',
    timeline: 'BUILD',
    tags: ['data', 'backend', 'integrity'],
  },
  {
    id: 'career-os',
    repo: 'Career-OS',
    title: 'Career OS',
    category: 'PRODUCT / AI',
    objective: 'Turn a personal workflow into a product other people can use.',
    why:
      'A product-oriented system on the founder/operator side of the portfolio: taking a workflow that mattered personally and shaping it into a usable product surface.',
    evidence: ['Product framing rather than a one-off script.'],
    architecture: ['Workflow model → product surface'],
    techAreas: ['Product systems', 'Applied AI'],
    status: 'PROTOTYPE',
    timeline: 'BUILD',
    tags: ['product', 'ai', 'founder'],
  },
  {
    id: 'personal-ai-router',
    repo: 'Personal-AI-Router',
    title: 'Personal AI Router',
    category: 'AI / INFRASTRUCTURE',
    objective: 'Route tasks to the right model or tool instead of defaulting to one.',
    why:
      'An infrastructure-flavoured AI project that reinforces the pattern across the work: orchestration, routing and practical systems rather than only model demos.',
    evidence: ['Routing and orchestration as the primary concern.'],
    architecture: ['Request → classification → route → response'],
    techAreas: ['Orchestration', 'Model routing', 'Infrastructure'],
    status: 'ACTIVE',
    timeline: 'BUILD',
    tags: ['ai', 'infrastructure', 'orchestration'],
  },
]

/** Dossiers surfaced in the SECURITY subsystem. */
export const securityProjectIds = ['aegis', 'sentinelforge']

/** Case-file vocabulary for the security subsystem. */
export const securityPillars = [
  { title: 'Cybersecurity', text: 'Trust boundaries, authorization and failure modes treated as first-class design material.' },
  { title: 'DFIR', text: 'Evidence acquisition, investigation structure and conclusions that survive scrutiny.' },
  { title: 'Security engineering', text: 'Guardrails, approval gates and guarded action instead of unbounded automation.' },
  { title: 'Reliability', text: 'Fail-closed behaviour and verification before release.' },
  { title: 'Incident response', text: 'A staged responder loop with explicit human authority.' },
  { title: 'Trust / verification', text: 'Making "verified" a real state rather than a label.' },
]
