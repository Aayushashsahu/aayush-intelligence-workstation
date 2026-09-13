'use client'

import { useEffect, useRef, useState } from 'react'
import { CornerDownLeft, ScanSearch } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { Chip, Label, Led, Meter } from '@/components/ui/Primitives'

type CortexResult = {
  kind?: string
  verdict?: string | null
  confidence?: number | null
  summary?: string
  evidence?: string[]
  gaps?: string[]
  verify?: string[]
  text?: string
}

type Turn = { role: 'user' | 'cortex'; result: CortexResult }

const SUGGESTED = [
  'Would Aayush fit an AI engineering role?',
  'What evidence suggests he can build AI systems?',
  'Which projects best demonstrate systems engineering?',
  'What should an interviewer verify?',
]

export default function Cortex() {
  const { cortexQuery, clearCortexQuery, notice, github } = useWorkstation()
  const [turns, setTurns] = useState<Turn[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  const send = async (raw: string) => {
    const q = raw.trim()
    if (!q || loading) return
    setMsg('')
    setTurns((t) => [...t, { role: 'user', result: { text: q } }])
    setLoading(true)
    setProgress(0)
    notice('THINKING', 'CORTEX PROCESSING', 4000)
    const timer = setInterval(() => setProgress((p) => Math.min(94, p + Math.random() * 16)), 220)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      const data = await res.json()
      setProgress(100)
      setTurns((t) => [...t, { role: 'cortex', result: data as CortexResult }])
    } catch {
      setTurns((t) => [
        ...t,
        { role: 'cortex', result: { verdict: 'UNAVAILABLE', summary: 'The intelligence backend did not respond. The live data layer is unaffected.' } },
      ])
      notice('ALERT', 'CORTEX UNREACHABLE', 4000)
    } finally {
      clearInterval(timer)
      setLoading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }

  // A question routed from the terminal lands here.
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] p-5 md:p-6">
          <div>
            <Label>
              <ScanSearch size={13} className="amber-pure" />
              CORTEX // INTELLIGENCE CORE
            </Label>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Reasoning over evidence.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Not a chatbot. CORTEX evaluates Aayush against his real project and telemetry data, separates fact from
              inference, and surfaces gaps an interviewer should verify.
            </p>
          </div>
          <div className="mono flex flex-col items-end gap-1.5 text-[9px] tk text-[var(--dim)]">
            <span className="flex items-center gap-2">
              <Led tone={github ? 'live' : 'idle'} /> EVIDENCE SOURCE {github ? 'LIVE' : 'LINKING'}
            </span>
            <span className="flex items-center gap-2">
              <Led tone="amber" /> SCOPE // AAYUSH ONLY
            </span>
          </div>
        </div>

        <div ref={bodyRef} className="max-h-[46vh] min-h-[280px] space-y-5 overflow-auto p-5 md:p-6">
          {!turns.length && (
            <div className="grid gap-3 md:grid-cols-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => setMsg(s)}
                  className="panel-flat p-4 text-left text-xs leading-5 text-[var(--muted)] transition hover:border-[var(--amber-line)]"
                >
                  <span className="mono block text-[8px] tk-lg text-[var(--dim)]">PROMPT</span>
                  <span className="mt-1.5 block text-[var(--text)]">{s}</span>
                </button>
              ))}
            </div>
          )}

          {turns.map((t, i) =>
            t.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-2xl border border-[var(--line)] bg-[rgba(255,255,255,.02)] p-4">
                  <div className="mono mb-1.5 text-[8px] tk-lg text-[var(--dim)]">INTERVIEWER</div>
                  <div className="text-sm leading-6">{t.result.text}</div>
                </div>
              </div>
            ) : (
              <CortexOutput key={i} result={t.result} />
            ),
          )}

          {loading && (
            <div className="space-y-3">
              <div className="mono text-[9px] tk-lg text-[var(--amber)]">PROCESSING</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="mono text-[9px] text-[var(--dim)]">
                parsing profile evidence · correlating live telemetry · separating fact from inference
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void send(msg)
          }}
          className="border-t border-[var(--line)] p-4 md:p-5"
        >
          <div className="flex items-center gap-2 border border-[var(--line-2)] bg-[rgba(0,0,0,.3)] px-3">
            <span className="mono text-[var(--amber)]">&gt;</span>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask about fit, projects, systems engineering, evidence…"
              aria-label="Question for CORTEX"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[var(--dim)]"
            />
            <button type="submit" disabled={loading || !msg.trim()} className="btn btn-amber my-1.5">
              {loading ? 'RUNNING' : 'ANALYSE'}
              <CornerDownLeft size={11} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CortexOutput({ result }: { result: CortexResult }) {
  const confidence = typeof result.confidence === 'number' ? result.confidence : null
  const isStructured = Boolean(result.verdict || result.evidence?.length || result.gaps?.length || result.verify?.length)

  if (!isStructured && result.text) {
    return (
      <div className="panel-flat max-w-3xl p-4">
        <div className="mono mb-2 text-[8px] tk-lg text-[var(--amber)]">CORTEX</div>
        <p className="text-sm leading-6 text-[var(--muted)]">{result.text}</p>
      </div>
    )
  }

  return (
    <div className="panel-flat max-w-3xl p-4">
      <div className="mono mb-3 flex flex-wrap items-center gap-3 text-[8px] tk-lg">
        <span className="text-[var(--amber)]">CORTEX</span>
        {result.verdict && <Chip amber>VERDICT · {result.verdict}</Chip>}
      </div>

      {result.summary && <p className="text-sm leading-6 text-[var(--muted)]">{result.summary}</p>}

      {confidence !== null && (
        <div className="mt-4">
          <Meter label="CONFIDENCE" value={confidence} />
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Section title="EVIDENCE" items={result.evidence} accent />
        <Section title="GAPS / RISKS" items={result.gaps} />
        <Section title="WHAT TO VERIFY" items={result.verify} />
      </div>
    </div>
  )
}

function Section({ title, items, accent }: { title: string; items?: string[]; accent?: boolean }) {
  if (!items?.length) return null
  return (
    <div>
      <div className={`mono text-[8px] tk-lg ${accent ? 'text-[var(--amber)]' : 'text-[var(--dim)]'}`}>{title}</div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-xs leading-5 text-[var(--muted)]">
            <span className="text-[var(--line-2)]">—</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
