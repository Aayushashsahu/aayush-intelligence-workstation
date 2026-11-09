'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CornerDownLeft,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Network,
  ChevronRight,
  ExternalLink,
  FileCode,
  FileText,
  Binary,
  Layers,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { Chip, Label, Led } from '@/components/ui/Primitives'
import { useContent } from '@/components/workstation/ContentProvider'

export type CortexSource = {
  label: string
  path: string
  url: string
  category?: 'DOCUMENTATION' | 'ARCHITECTURE' | 'AUDIT' | 'IMPLEMENTATION' | 'TEST' | 'METADATA' | string
}

export type ProjectDetails = {
  name?: string
  repoUrl?: string
  category?: string
  objective?: string
  architecture?: string[]
  techStack?: string[]
  capabilities?: string[]
  findings?: string[]
  limitations?: string[]
  status?: string
  verificationGaps?: string[]
}

export type CortexResult = {
  kind?: string
  verdict?: string | null
  confidence?: number | null
  summary?: string
  evidence?: string[]
  gaps?: string[]
  verify?: string[]
  text?: string
  sources?: CortexSource[]
  projectDetails?: ProjectDetails
}

type Turn = {
  id: string
  role: 'user' | 'cortex'
  result: CortexResult
  timestamp: string
}

const SUGGESTED = [
  'What does Infinite Money Glitch Detector do?',
  'Explain the architecture of the Infinite Money Glitch Detector.',
  'Did the strategy actually make money?',
  'What are the project’s limitations?',
  'Would Aayush fit an AI systems engineering role?',
  'What are the core tradeoffs in SentinelForge and AEGIS?',
]

const SCAN_PHASES = [
  '01 // LOCKING SCOPE BOUNDARY TO AAYUSH SAHU',
  '02 // DISCOVERING & RETRIEVING REPOSITORY INTELLIGENCE',
  '03 // SCANNING VERIFIED ARCHITECTURE & AUDIT EVIDENCE',
  '04 // CROSS-REFERENCING IMPLEMENTATION & TESTS',
  '05 // COMPILING EVIDENCE-GROUNDED INTELLIGENCE REPORT',
]

export default function Cortex() {
  const { cortexQuery, clearCortexQuery, notice, github } = useWorkstation()
  const [turns, setTurns] = useState<Turn[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanPhaseIdx, setScanPhaseIdx] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  const send = async (raw: string) => {
    const q = raw.trim()
    if (!q || loading) return
    setMsg('')
    const turnId = `q-${Date.now()}`
    const timeStr = new Date().toLocaleTimeString('en-GB')

    setTurns((t) => [
      ...t,
      { id: turnId, role: 'user', result: { text: q }, timestamp: timeStr },
    ])
    setLoading(true)
    setProgress(0)
    setScanPhaseIdx(0)
    notice('THINKING', 'CORTEX REASONING', 4000)

    const timer = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(94, p + Math.random() * 18)
        if (next > 75) setScanPhaseIdx(3)
        else if (next > 50) setScanPhaseIdx(2)
        else if (next > 25) setScanPhaseIdx(1)
        return next
      })
    }, 200)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      const data = await res.json()
      setProgress(100)
      setScanPhaseIdx(4)
      setTurns((t) => [
        ...t,
        {
          id: `r-${Date.now()}`,
          role: 'cortex',
          result: data as CortexResult,
          timestamp: new Date().toLocaleTimeString('en-GB'),
        },
      ])
    } catch {
      setTurns((t) => [
        ...t,
        {
          id: `err-${Date.now()}`,
          role: 'cortex',
          result: {
            verdict: 'UNAVAILABLE',
            summary:
              'The intelligence backend did not respond. Live telemetry and static evidence remain fully accessible.',
          },
          timestamp: new Date().toLocaleTimeString('en-GB'),
        },
      ])
      notice('ALERT', 'CORTEX BACKEND UNREACHABLE', 4000)
    } finally {
      clearInterval(timer)
      setLoading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  useEffect(() => {
    if (cortexQuery) {
      clearCortexQuery()
      void send(cortexQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cortexQuery])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, loading])

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] p-5 md:p-6 bg-[var(--surface)]">
          <div>
            <Label>
              <ScanSearch size={13} className="amber-pure" />
              CORTEX // EVALUATIVE INTELLIGENCE CORE
            </Label>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">
              Reasoning over verified evidence.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              CORTEX is a specialized intelligence engine scoped strictly to Aayush Sahu and his documented work.
              It synthesizes verified repository documentation, source code, case files, and live GitHub telemetry.
            </p>
          </div>

          <div className="mono flex flex-col items-end gap-1.5 text-[9px] tk text-[var(--dim)]">
            <span className="flex items-center gap-2">
              <Led tone={github ? 'live' : 'idle'} /> TELEMETRY SOURCE: {github ? 'LIVE' : 'LINKING'}
            </span>
            <span className="flex items-center gap-2">
              <Led tone="amber" pulse /> REPO INTELLIGENCE: ENABLED
            </span>
          </div>
        </div>

        {/* Query & Conversation Container */}
        <div
          ref={bodyRef}
          className="max-h-[64vh] min-h-[340px] space-y-6 overflow-y-auto p-5 md:p-7"
        >
          {!turns.length && (
            <div className="space-y-4">
              <div className="mono text-[9px] tk-lg text-[var(--dim)] flex items-center justify-between">
                <span>SAMPLE EVALUATION &amp; REPOSITORY INTELLIGENCE QUERIES</span>
                <span className="text-[var(--amber)]">SELECT TO QUERY INTELLIGENCE CORE</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="panel-flat group p-4 text-left text-xs leading-5 text-[var(--muted)] transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
                  >
                    <span className="mono block text-[8px] tk-lg text-[var(--amber)]">PROMPT QUERY</span>
                    <span className="mt-1.5 block font-medium text-[var(--text)] group-hover:text-[var(--amber-hi)]">
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t) =>
            t.role === 'user' ? (
              <div key={t.id} className="flex justify-end">
                <div className="max-w-2xl border border-[var(--line)] bg-[rgba(255,255,255,.03)] p-4 shadow-sm">
                  <div className="mono mb-1.5 flex items-center justify-between text-[8px] tk-lg text-[var(--dim)]">
                    <span>INTERVIEWER // QUERY</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <div className="text-sm font-medium leading-6 text-[var(--text)]">{t.result.text}</div>
                </div>
              </div>
            ) : (
              <CortexReportCard key={t.id} result={t.result} timestamp={t.timestamp} />
            ),
          )}

          {loading && (
            <div className="panel-flat p-5 space-y-3 border-l-2 border-l-[var(--amber)] bg-[rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <span className="mono text-[9px] tk-lg text-[var(--amber)] flex items-center gap-2">
                  <Led tone="amber" pulse /> {SCAN_PHASES[scanPhaseIdx]}
                </span>
                <span className="mono text-[9px] text-[var(--dim)]">{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="mono text-[9px] text-[var(--dim)]">
                Cross-referencing repository documentation, AST architecture guards, and live code telemetry…
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(msg)
          }}
          className="border-t border-[var(--line)] p-4 md:p-5 bg-[var(--surface)]"
        >
          <div className="flex items-center gap-3 border border-[var(--line-2)] bg-[rgba(0,0,0,.4)] px-3.5 py-1">
            <span className="mono text-base font-bold text-[var(--amber)]">&gt;</span>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask CORTEX about technical decisions, architecture, systems fit, or verification…"
              aria-label="Question for CORTEX"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--dim)]"
            />
            <button
              type="submit"
              disabled={loading || !msg.trim()}
              className="btn btn-amber my-1"
            >
              {loading ? 'PROCESSING' : 'ANALYZE'}
              <CornerDownLeft size={12} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CortexReportCard({ result, timestamp }: { result: CortexResult; timestamp: string }) {
  const { openDossier, setView } = useWorkstation()
  const bundle = useContent()
  const confidence = typeof result.confidence === 'number' ? result.confidence : null
  const isDeclined = result.kind === 'declined'

  // Determine Primary & Secondary Signals
  let primarySignal = 'SYSTEMS EVALUATION'
  let secondarySignals = ['AI SYSTEMS', 'CYBERSECURITY', 'PRODUCT']

  if (isDeclined) {
    primarySignal = 'OUT OF SCOPE'
    secondarySignals = ['SCOPE ENFORCEMENT']
  } else if (result.verdict) {
    primarySignal = result.verdict.toUpperCase()
    if (result.kind === 'fit') {
      secondarySignals = ['FIT EVALUATION', 'CAPABILITY AUDIT', 'TECHNICAL DEPTH']
    } else if (result.kind === 'project') {
      secondarySignals = ['ARCHITECTURE ANALYSIS', 'VERIFICATION GATE', 'CODEBASE AUDIT']
    }
  }

  // Detect project mentions in text/evidence to create discovery bridges
  const mentionedProjects = bundle.projects.filter((p) => {
    const textToSearch = `${result.summary || ''} ${(result.evidence || []).join(' ')} ${result.projectDetails?.name || ''}`.toLowerCase()
    return (
      textToSearch.includes(p.title.toLowerCase()) ||
      textToSearch.includes(p.id.toLowerCase()) ||
      (p.repo && textToSearch.includes(p.repo.toLowerCase()))
    )
  })

  const pd = result.projectDetails
  const sources = result.sources || []

  return (
    <div className="panel border-[var(--line-2)] bg-[var(--surface-2)] p-5 md:p-6 shadow-md transition-all">
      {/* Report Identification Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <span className="relative grid h-7 w-7 place-items-center border border-[var(--amber-line)] bg-[var(--amber-wash)]">
            <span className="mono text-[10px] font-bold text-[var(--amber)]">C</span>
          </span>
          <div>
            <div className="mono text-[8px] tk-lg text-[var(--amber)] flex items-center gap-1.5">
              <Led tone={isDeclined ? 'idle' : 'live'} /> CORTEX INTELLIGENCE REPORT // EVALUATION
            </div>
            <div className="mono text-[9px] text-[var(--dim)]">
              TIMESTAMP // {timestamp} · PROVENANCE // EVIDENCE-GROUNDED
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result.verdict && (
            <span className="mono text-[8px] tk font-bold px-2 py-0.5 border border-[var(--amber-line)] bg-[var(--amber-wash)] text-[var(--amber-hi)]">
              VERDICT // {result.verdict}
            </span>
          )}
          {isDeclined && (
            <span className="mono text-[8px] tk font-bold px-2 py-0.5 border border-[var(--line)] bg-[var(--surface)] text-[var(--dim)]">
              STATUS // DECLINED
            </span>
          )}
        </div>
      </div>

      {/* Signals & Confidence Bar */}
      {!isDeclined && (
        <div className="mt-4 grid gap-4 border-b border-[var(--line)] pb-4 sm:grid-cols-2">
          <div>
            <div className="mono text-[8px] tk-lg text-[var(--dim)]">ANALYSIS TYPE</div>
            <div className="mono mt-1 text-sm font-bold text-[var(--text)] tracking-wide">
              {primarySignal}
            </div>
            <div className="mono mt-1.5 flex flex-wrap gap-1.5 text-[8px] tk text-[var(--dim)]">
              <span>EVIDENCE DOMAINS:</span>
              {secondarySignals.map((s, idx) => (
                <span key={idx} className="text-[var(--muted)]">
                  {s}
                  {idx < secondarySignals.length - 1 && ' ·'}
                </span>
              ))}
            </div>
          </div>

          {confidence !== null && (
            <div>
              <div className="mono flex items-center justify-between text-[8px] tk-lg text-[var(--dim)]">
                <span>EVIDENCE CONFIDENCE</span>
                <span className="font-bold text-[var(--amber)]">{confidence}%</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <DigitalSegmentedBar value={confidence} />
                <Led tone={confidence >= 70 ? 'live' : confidence >= 40 ? 'amber' : 'idle'} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Core Analysis Body */}
      <div className="mt-4">
        <div className="mono text-[8px] tk-lg text-[var(--dim)] mb-2">ANALYSIS SUMMARY</div>
        <p className="text-sm leading-7 text-[var(--text)] font-normal">
          {result.summary || result.text}
        </p>
      </div>

      {/* Structured Project Intelligence Dossier (if present) */}
      {pd && (
        <div className="mt-5 panel-flat border border-[var(--amber-line)] bg-[rgba(255,140,0,0.03)] p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[var(--amber)]" />
              <span className="mono text-[9px] tk-lg font-bold text-[var(--text)]">
                PROJECT INTELLIGENCE DOSSIER // {pd.name || 'DOCUMENTED SYSTEM'}
              </span>
            </div>
            {pd.repoUrl && (
              <a
                href={pd.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[9px] text-[var(--amber)] hover:text-[var(--amber-hi)] flex items-center gap-1.5 transition-colors"
              >
                <span>OPEN REPOSITORY</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>

          {pd.objective && (
            <div className="mt-3">
              <div className="mono text-[8px] tk-lg text-[var(--dim)]">OBJECTIVE &amp; PROBLEM STATEMENT</div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{pd.objective}</p>
            </div>
          )}

          {pd.architecture && pd.architecture.length > 0 && (
            <div className="mt-3.5">
              <div className="mono text-[8px] tk-lg text-[var(--dim)]">ARCHITECTURE &amp; DATA PIPELINE</div>
              <ul className="mt-1.5 space-y-1">
                {pd.architecture.map((item, i) => (
                  <li key={i} className="text-xs leading-5 text-[var(--muted)] flex gap-2 items-start">
                    <span className="mono text-[8px] text-[var(--amber)] mt-0.5">0{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pd.techStack && pd.techStack.length > 0 && (
            <div className="mt-3.5">
              <div className="mono text-[8px] tk-lg text-[var(--dim)] mb-1.5">TECHNOLOGY STACK</div>
              <div className="flex flex-wrap gap-1.5">
                {pd.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="mono text-[8px] tk px-2 py-0.5 border border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-[var(--text)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pd.limitations && pd.limitations.length > 0 && (
            <div className="mt-4 border-t border-[var(--line)] pt-3">
              <div className="mono text-[8px] tk-lg text-[var(--amber)] flex items-center gap-1.5">
                <AlertTriangle size={10} /> DOCUMENTED RESEARCH LIMITATIONS
              </div>
              <ul className="mt-1.5 space-y-1">
                {pd.limitations.map((lim, i) => (
                  <li key={i} className="text-xs leading-5 text-[var(--dim)] flex gap-2 items-start">
                    <span className="text-[var(--amber)]">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Structured Sections: Evidence, Gaps, Verification */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.evidence && result.evidence.length > 0 && (
          <div className="panel-flat p-4">
            <div className="mono text-[8px] tk-lg text-[var(--amber)] flex items-center gap-1.5">
              <CheckCircle2 size={11} /> VERIFIED EVIDENCE
            </div>
            <ul className="mt-2.5 space-y-2">
              {result.evidence.map((ev, i) => (
                <li key={i} className="text-xs leading-5 text-[var(--muted)] flex gap-2 items-start">
                  <span className="mono text-[8px] text-[var(--amber)] mt-0.5">0{i + 1}</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.gaps && result.gaps.length > 0 && (
          <div className="panel-flat p-4">
            <div className="mono text-[8px] tk-lg text-[var(--dim)] flex items-center gap-1.5">
              <AlertTriangle size={11} className="text-[var(--dim)]" /> BOUNDARIES &amp; GAPS
            </div>
            <ul className="mt-2.5 space-y-2">
              {result.gaps.map((g, i) => (
                <li key={i} className="text-xs leading-5 text-[var(--dim)] flex gap-2 items-start">
                  <span className="text-[var(--line-2)]">—</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.verify && result.verify.length > 0 && (
          <div className="panel-flat p-4 sm:col-span-2 lg:col-span-1">
            <div className="mono text-[8px] tk-lg text-[var(--muted)] flex items-center gap-1.5">
              <ScanSearch size={11} /> WHAT TO VERIFY
            </div>
            <ul className="mt-2.5 space-y-2">
              {result.verify.map((v, i) => (
                <li key={i} className="text-xs leading-5 text-[var(--muted)] flex gap-2 items-start">
                  <span className="text-[var(--amber)]">?</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dedicated Evidence Sources & Provenance Section */}
      {sources.length > 0 && (
        <div className="mt-5 border-t border-[var(--line)] pt-4">
          <div className="mono text-[8px] tk-lg text-[var(--amber)] flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={11} /> EVIDENCE SOURCES &amp; PROVENANCE ({sources.length})
            </span>
            <span className="text-[var(--dim)]">GITHUB REPOSITORY DOCUMENTS</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {sources.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="panel-flat group p-2.5 flex items-center justify-between text-xs transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {s.category === 'IMPLEMENTATION' ? (
                    <FileCode size={13} className="text-[var(--amber)] shrink-0" />
                  ) : s.category === 'ARCHITECTURE' ? (
                    <Layers size={13} className="text-[var(--amber)] shrink-0" />
                  ) : s.category === 'AUDIT' ? (
                    <ShieldCheck size={13} className="text-[var(--amber)] shrink-0" />
                  ) : (
                    <FileText size={13} className="text-[var(--muted)] shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="mono text-[8px] text-[var(--amber)] block">{s.label}</span>
                    <span className="text-[var(--text)] group-hover:text-[var(--amber-hi)] font-medium truncate block">
                      {s.path}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="mono text-[7px] tk px-1.5 py-0.5 border border-[var(--line)] bg-[rgba(0,0,0,0.3)] text-[var(--dim)]">
                    {s.category || 'DOCS'}
                  </span>
                  <ExternalLink size={10} className="text-[var(--dim)] group-hover:text-[var(--amber-hi)]" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Cross-System Discovery Bridge */}
      {mentionedProjects.length > 0 && (
        <div className="mt-5 border-t border-[var(--line)] pt-4">
          <div className="mono text-[8px] tk-lg text-[var(--dim)] mb-2">
            CROSS-SYSTEM CASE FILES REFERENCED IN REPORT
          </div>
          <div className="flex flex-wrap gap-2">
            {mentionedProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => openDossier({ id: p.id, title: p.title, category: p.category })}
                className="chip hover:border-[var(--amber-line)] hover:text-[var(--text)] flex items-center gap-1.5"
              >
                <FolderGit2 size={11} className="text-[var(--amber)]" />
                <span>OPEN {p.title.toUpperCase()} DOSSIER</span>
                <ChevronRight size={10} />
              </button>
            ))}
            <button
              onClick={() => setView('MAP')}
              className="chip hover:border-[var(--amber-line)] hover:text-[var(--text)] flex items-center gap-1.5"
            >
              <Network size={11} className="text-[var(--amber)]" />
              <span>VIEW IN SYSTEM MAP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DigitalSegmentedBar({ value }: { value: number }) {
  const totalBlocks = 12
  const filledBlocks = Math.round((Math.max(0, Math.min(100, value)) / 100) * totalBlocks)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalBlocks }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-3 border transition-colors ${
            i < filledBlocks
              ? 'border-[var(--amber-line)] bg-[var(--amber)]'
              : 'border-[var(--line)] bg-[rgba(255,255,255,0.03)]'
          }`}
        />
      ))}
    </div>
  )
}
