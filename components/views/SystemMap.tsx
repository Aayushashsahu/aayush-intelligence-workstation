'use client'

import { useState } from 'react'
import { Network, ScanSearch, FolderGit2, ArrowUpRight, Cpu, Shield, Layers, Rocket } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Label, Led } from '@/components/ui/Primitives'
import { findProject } from '@/lib/content'

type DisciplineId = 'ai' | 'security' | 'systems' | 'product'

type SystemNode = {
  id: string
  name: string
  subtitle: string
  disciplines: DisciplineId[]
  projectId?: string
  viewId?: 'CORTEX' | 'FOUNDER' | 'GITHUB'
  status: 'ACTIVE' | 'DEPLOYED' | 'CORE'
  summary: string
  architecture: string
  tags: string[]
}

const DISCIPLINES: { id: DisciplineId; label: string; icon: any; tone: 'live' | 'amber' }[] = [
  { id: 'ai', label: 'AI SYSTEMS', icon: Cpu, tone: 'amber' },
  { id: 'security', label: 'CYBERSECURITY', icon: Shield, tone: 'live' },
  { id: 'systems', label: 'SYSTEMS ENGINEERING', icon: Layers, tone: 'live' },
  { id: 'product', label: 'PRODUCT & VENTURES', icon: Rocket, tone: 'amber' },
]

const SYSTEMS: SystemNode[] = [
  {
    id: 'aegis',
    name: 'AEGIS',
    subtitle: 'FAIL-CLOSED VERIFICATION',
    disciplines: ['ai', 'systems', 'security'],
    projectId: 'aegis',
    status: 'ACTIVE',
    summary: 'Autonomous verification boundary enforcing strict deterministic policy gates before untrusted actions execute.',
    architecture: 'Input Stream -> Semantic Parser -> Policy Evaluation Matrix -> Release Gate',
    tags: ['Deterministic Gates', 'Local Inference', 'Boundary Defense'],
  },
  {
    id: 'sentinelforge',
    name: 'SENTINELFORGE',
    subtitle: 'FORENSIC INVESTIGATION',
    disciplines: ['security', 'systems'],
    projectId: 'sentinelforge',
    status: 'ACTIVE',
    summary: 'DFIR and incident response orchestration pipeline establishing cryptographic evidence trails.',
    architecture: 'Telemetry Ingestion -> Anomaly Correlation -> Evidence Sealing -> Audit Log',
    tags: ['DFIR', 'Audit Trails', 'Forensics'],
  },
  {
    id: 'edith',
    name: 'E.D.I.T.H.',
    subtitle: 'TACTICAL AUTOMATION',
    disciplines: ['ai', 'systems'],
    projectId: 'edith',
    status: 'ACTIVE',
    summary: 'Context-aware tactical operations framework designed to eliminate friction in engineering workflows.',
    architecture: 'Event Sensor -> Intent Router -> Safety Validator -> Local Runtime Dispatch',
    tags: ['Tactical Ops', 'Safety Verification', 'Automation'],
  },
  {
    id: 'jarvis',
    name: 'JARVIS',
    subtitle: 'LOCAL INTELLIGENCE',
    disciplines: ['ai', 'systems'],
    projectId: 'jarvis',
    status: 'ACTIVE',
    summary: 'Self-hosted offline-capable assistant runtime operating on local hardware without cloud dependency.',
    architecture: 'Speech/Text Input -> Local Quantized Model -> Sandboxed Tool Runtime',
    tags: ['Offline Runtime', 'Local LLM', 'Quantization'],
  },
  {
    id: 'octiq',
    name: 'OCTIQ AI',
    subtitle: 'ENTERPRISE OUTCOMES',
    disciplines: ['product', 'ai'],
    viewId: 'FOUNDER',
    status: 'DEPLOYED',
    summary: 'Autonomous AI agents transforming unstructured business workflows into verifiable execution pipelines.',
    architecture: 'Workflow Mapping -> Deterministic Verification -> Outcome Engine',
    tags: ['Autonomous Agents', 'Enterprise Workflows', 'Founder HQ'],
  },
  {
    id: 'cortex',
    name: 'CORTEX',
    subtitle: 'INTELLIGENCE CORE',
    disciplines: ['ai', 'systems', 'security'],
    viewId: 'CORTEX',
    status: 'CORE',
    summary: 'Evidence-grounded reasoning engine serving as the central cognitive core of the workstation.',
    architecture: 'Scope Boundary Lock -> Multi-Model Reasoning Fallback -> Evidence Validation',
    tags: ['Multi-Model Fallback', 'Grounding', 'Scope Lock'],
  },
]

export default function SystemMap() {
  const { openDossier, setView, askCortex } = useWorkstation()
  const bundle = useContent()
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineId | null>(null)
  const [hoveredSystem, setHoveredSystem] = useState<SystemNode | null>(null)
  const [activeSystemId, setActiveSystemId] = useState<string>(SYSTEMS[0].id)

  const activeSystem = SYSTEMS.find((s) => s.id === (hoveredSystem?.id || activeSystemId)) || SYSTEMS[0]

  const handleSystemClick = (sys: SystemNode) => {
    setActiveSystemId(sys.id)
    if (sys.projectId) {
      const proj = findProject(bundle, sys.projectId)
      if (proj) {
        openDossier({ id: proj.id, title: proj.title, category: proj.category })
        return
      }
    }
    if (sys.viewId) {
      setView(sys.viewId)
    }
  }

  return (
    <div className="space-y-4">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Label>
              <Network size={13} className="amber-pure" />
              SYSTEM MAP // ARCHITECTURAL TOPOLOGY
            </Label>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Systems architecture, interconnected.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Interactive relationship graph mapping Aayush to core engineering disciplines and real deployed systems.
              Select any system to inspect architectural boundaries or launch case files.
            </p>
          </div>

          <div className="mono flex flex-wrap items-center gap-2 text-[9px] tk text-[var(--dim)]">
            <span className="flex items-center gap-1.5">
              <Led tone="live" /> 6 REAL SYSTEMS
            </span>
            <span className="text-[var(--line-2)]">·</span>
            <span className="flex items-center gap-1.5">
              <Led tone="amber" /> 4 DISCIPLINES
            </span>
            <span className="text-[var(--line-2)]">·</span>
            <span>CLICK NODE TO OPEN</span>
          </div>
        </div>
      </section>

      {/* Interactive Topology Surface */}
      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="panel relative min-h-[500px] overflow-hidden p-6">
          {/* Subtle Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(var(--amber) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Root Operator Hub */}
          <div className="flex flex-col items-center justify-center">
            <div className="mono flex items-center gap-2 text-[9px] tk-lg text-[var(--dim)]">
              OPERATOR ROOT
            </div>
            <div className="panel mt-2 border-[var(--amber-line)] bg-[var(--amber-wash)] px-5 py-2.5 text-center shadow-lg">
              <div className="mono text-[8px] tk-lg text-[var(--amber)]">AAYUSH SAHU</div>
              <div className="text-sm font-semibold tracking-wide text-[var(--text)]">
                SYSTEMS ARCHITECT &amp; BUILDER
              </div>
            </div>
          </div>

          {/* Discipline Bridges */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DISCIPLINES.map((d) => {
              const Icon = d.icon
              const isSelected = selectedDiscipline === d.id
              const isConnectedToActive = activeSystem.disciplines.includes(d.id)
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDiscipline(isSelected ? null : d.id)}
                  className={`panel p-3 text-left transition-all ${
                    isSelected || isConnectedToActive
                      ? 'border-[var(--amber-line)] bg-[var(--amber-wash)]'
                      : 'border-[var(--line)] bg-[var(--surface)] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={14} className={isSelected || isConnectedToActive ? 'text-[var(--amber)]' : 'text-[var(--dim)]'} />
                    <Led tone={d.tone} pulse={isConnectedToActive} />
                  </div>
                  <div className="mono mt-2 text-[9px] tk-lg text-[var(--text)]">{d.label}</div>
                </button>
              )
            })}
          </div>

          {/* Connecting Visual SVG */}
          <div className="relative my-6 h-6 w-full">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--line-2)] to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-[var(--line)] bg-[var(--bg-deep)] px-2 py-0.5 mono text-[8px] tk text-[var(--dim)]">
              DEPLOYED SUBSYSTEMS
            </div>
          </div>

          {/* Systems Cluster */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEMS.map((sys) => {
              const matchesFilter = !selectedDiscipline || sys.disciplines.includes(selectedDiscipline)
              const isSelected = activeSystem.id === sys.id

              return (
                <button
                  key={sys.id}
                  onMouseEnter={() => setHoveredSystem(sys)}
                  onMouseLeave={() => setHoveredSystem(null)}
                  onClick={() => handleSystemClick(sys)}
                  className={`panel group relative p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[var(--amber)] bg-[rgba(255,138,43,0.06)] shadow-md'
                      : matchesFilter
                        ? 'border-[var(--line)] hover:border-[var(--amber-line)]'
                        : 'border-[var(--line)] opacity-30 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="mono text-[8px] tk text-[var(--dim)]">{sys.subtitle}</span>
                    <span className="mono flex items-center gap-1.5 text-[8px] tk text-[var(--muted)]">
                      <Led tone={sys.status === 'CORE' ? 'amber' : 'live'} />
                      {sys.status}
                    </span>
                  </div>

                  <div className="mt-2.5 text-base font-semibold text-[var(--text)] group-hover:text-[var(--amber-hi)] transition-colors">
                    {sys.name}
                  </div>

                  <p className="clamp-2 mt-1.5 text-xs leading-5 text-[var(--muted)]">{sys.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {sys.disciplines.map((d) => (
                      <span key={d} className="mono text-[7px] tk uppercase border border-[var(--line)] px-1.5 py-0.5 text-[var(--dim)]">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="mono mt-4 flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[8px] tk text-[var(--dim)]">
                    <span>{sys.projectId ? 'CASE FILE' : 'SUBSYSTEM'}</span>
                    <span className="flex items-center gap-1 text-[var(--amber)] group-hover:translate-x-0.5 transition-transform">
                      VIEW NODE <ArrowUpRight size={10} />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected System Node Inspector */}
        <div className="panel flex flex-col p-6">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <span className="mono text-[9px] tk-lg text-[var(--amber)]">NODE INSPECTOR</span>
            <span className="mono flex items-center gap-2 text-[9px] text-[var(--dim)]">
              <Led tone="live" /> ID // {activeSystem.id.toUpperCase()}
            </span>
          </div>

          <div className="mt-5">
            <span className="mono text-[9px] tk-lg text-[var(--dim)]">{activeSystem.subtitle}</span>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--text)]">{activeSystem.name}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{activeSystem.summary}</p>
          </div>

          {/* Architecture Pipeline */}
          <div className="mt-6">
            <span className="mono text-[9px] tk-lg text-[var(--dim)]">PIPELINE ARCHITECTURE</span>
            <div className="panel-flat mt-2 p-3 mono text-[10px] leading-6 text-[var(--amber-hi)] bg-[rgba(0,0,0,0.3)]">
              {activeSystem.architecture}
            </div>
          </div>

          {/* Connected Disciplines */}
          <div className="mt-6">
            <span className="mono text-[9px] tk-lg text-[var(--dim)]">AFFINITY DISCIPLINES</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeSystem.disciplines.map((d) => (
                <Chip key={d} amber>
                  {d.toUpperCase()}
                </Chip>
              ))}
            </div>
          </div>

          {/* System Tags */}
          <div className="mt-6">
            <span className="mono text-[9px] tk-lg text-[var(--dim)]">ENGINEERING TAGS</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeSystem.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-2.5">
            {activeSystem.projectId && (
              <button
                onClick={() => {
                  const proj = findProject(bundle, activeSystem.projectId!)
                  if (proj) openDossier({ id: proj.id, title: proj.title, category: proj.category })
                }}
                className="btn btn-amber w-full justify-center"
              >
                <FolderGit2 size={12} />
                OPEN {activeSystem.name} CASE FILE
              </button>
            )}

            {activeSystem.viewId && (
              <button
                onClick={() => setView(activeSystem.viewId!)}
                className="btn btn-amber w-full justify-center"
              >
                ENTER {activeSystem.viewId} SUBSYSTEM
              </button>
            )}

            <button
              onClick={() =>
                askCortex(`Analyze the engineering architecture, verification guarantees, and tradeoffs of ${activeSystem.name}.`)
              }
              className="btn w-full justify-center"
            >
              <ScanSearch size={12} />
              ASK CORTEX ABOUT THIS SYSTEM
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
