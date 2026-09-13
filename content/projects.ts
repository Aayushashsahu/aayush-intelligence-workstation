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
    problem:
      'Unstructured extractions routinely return HTTP 200 with valid syntax that is semantically corrupted or hallucinated. Downstream pipelines treat valid schema as truth, causing silent cascading errors.',
    question:
      'Can extraction reliability be governed by fail-closed deterministic evidence gates instead of probabilistic model confidence?',
    approach:
      'Decouple generative proposal from deterministic verification. Extract candidates via LLM, pass through isolated semantic predicate engines, evaluate against risk policy matrices, and enforce release gates that fail closed by default.',
    keyDecisions: [
      'Fail-Closed Gatekeeper: Output is withheld if semantic predicates fail, even if schema validation passes.',
      'Decoupled Verification: Verifier does not share context or prompt state with the extraction worker to prevent shared hallucination.',
      'Deterministic Risk Score: Release thresholds use deterministic weighted predicates rather than an LLM confidence rating.',
    ],
    tradeoffs: [
      'Higher latency due to multi-pass verification pipeline.',
      'Strict predicate checks cause higher false-negative rejections when source pages change layout drastically.',
    ],
    provenance: ['PROVENANCE // REPOSITORY TEST SUITE', 'STATUS // ACTIVE PIPELINE', 'INTEGRITY // DETERMINISTIC GATES'],
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
    problem:
      'Autonomous incident response systems risk taking destructive remediations without human oversight or auditable provenance.',
    question:
      'How do we automate security incident investigation and remediation proposal while mathematically bounding execution authority?',
    approach:
      'A 6-stage lifecycle: Evidence → Investigation → Proposal → Human Approval Gate → Verification → Guarded Execution. No action can bridge from proposal to execution without cryptographically signed human approval.',
    keyDecisions: [
      'Strict Authority Separation: Investigation agent holds read-only observation scopes; action worker requires signed approval token.',
      'Immutable Audit Log: All evidence, rationale, and diffs are committed to an append-only audit trail before execution.',
      'Pre-Action Dry Run: Every remediation undergoes a non-destructive simulation step prior to gate clearance.',
    ],
    tradeoffs: [
      'Requires human-in-the-loop latency for high-severity actions.',
      'Tooling integration surface requires custom adapter shims for each target provider.',
    ],
    provenance: ['PROVENANCE // DFIR RESEARCH', 'STATUS // ACTIVE BENCHMARK', 'INTEGRITY // AIR-GAPPED ACTION GATES'],
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
    problem:
      'Cloud-hosted assistants leak desktop context, fail when offline, and cannot securely manipulate local host resources without exposing private credentials.',
    question:
      'Can a personal multimodal assistant operate with zero cloud egress while maintaining sub-second voice, vision, and tool execution latency?',
    approach:
      'An offline architecture orchestrating quantized local LLMs, on-device vision processing, local vector indexing for RAG, and FastAPI/WebSocket IPC to execute system automation commands directly on the host.',
    keyDecisions: [
      'Local-First Egress Boundary: Zero telemetry or audio packets sent outside the host boundary.',
      'Decoupled IPC Backbone: FastAPI and WebSockets isolate user interface from heavy inference threads.',
      'Direct OS Integration: Native system commands executed through sandboxed subshell wrappers.',
    ],
    tradeoffs: [
      'Requires dedicated local GPU/VRAM resources (minimum 8GB VRAM for 7B/8B parameter models).',
      'Context window is bounded by host memory constraints.',
    ],
    provenance: ['PROVENANCE // HOST SYSTEM RIG', 'STATUS // ACTIVE WORKSTATION', 'INTEGRITY // ZERO EGRESS RUNTIME'],
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
    problem:
      'Industrial compliance and equipment maintenance documents are fragmented across complex manuals; standard chunked RAG destroys relational context and provenance.',
    question:
      'How do you structure technical operational corpora into a knowledge graph so compliance checks and root-cause analysis remain traceable to original clauses?',
    approach:
      'Dual-layer ingestion pipeline: parse technical schemas into an entity-relation knowledge graph, link nodes directly to source page/clause coordinates, and run hybrid graph-vector retrieval.',
    keyDecisions: [
      'Provenance-Preserving Graph: Every fact node retains parent document URI, page offset, and clause hash.',
      'Structured RCA Engine: Graph traversal isolates failure modes along known dependency edges before querying language models.',
    ],
    tradeoffs: [
      'High ingestion compute cost during entity extraction and graph building.',
      'Schema evolution requires re-indexing affected subgraphs.',
    ],
    provenance: ['PROVENANCE // ENTERPRISE CORPUS', 'STATUS // PRODUCTION SHIPPED', 'INTEGRITY // CLAUSE-HASHED TRACEABILITY'],
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
