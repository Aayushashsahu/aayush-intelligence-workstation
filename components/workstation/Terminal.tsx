'use client'

import { useEffect, useRef, useState } from 'react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { findProject } from '@/lib/content'
import { resolveView, VIEWS } from '@/lib/views'

type Line = { text: string; tone?: 'in' | 'amber' | 'dim' | 'danger' | 'ok' }

const BANNER: Line[] = [
  { text: 'AAYUSH // INTELLIGENCE WORKSTATION · TERMINAL_01', tone: 'amber' },
  { text: 'Drives the interface, not a simulation. Type "help".', tone: 'dim' },
]

export default function Terminal() {
  const {
    github,
    mode,
    setView,
    openView,
    openDossier,
    askCortex,
    openTerminal,
    sync,
    notice,
    windows,
  } = useWorkstation()

  const bundle = useContent()

  const [lines, setLines] = useState<Line[]>(BANNER)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIndex, setHIndex] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  const push = (next: Line[]) => setLines((l) => [...l, ...next])

  const systems = VIEWS.map((v) => v.label.toLowerCase()).join(' · ')

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    push([{ text: `$ ${cmd}`, tone: 'in' }])
    setHistory((h) => [...h, cmd])
    setHIndex(-1)

    const [head, ...rest] = cmd.split(/\s+/)
    const arg = rest.join(' ').trim()
    const key = head.toLowerCase()

    if (key === 'clear') {
      setLines([])
      return
    }

    if (key === 'help') {
      push([
        { text: 'SUBSYSTEMS', tone: 'amber' },
        { text: `  ${systems}` },
        { text: 'OPEN AS WINDOW', tone: 'amber' },
        { text: '  open <system>        e.g. open cortex' },
        { text: 'ANALYTICS', tone: 'amber' },
        { text: '  analyze <project>    open a system dossier' },
        { text: '  ask <question>       route a question to CORTEX' },
        { text: '  sync                 refresh GitHub telemetry' },
        { text: 'SYSTEM', tone: 'amber' },
        { text: '  status · whoami · projects · github · lab' },
        { text: '  founder · security · cortex · timeline · octiq' },
        { text: '  clear                clear this terminal' },
      ])
      return
    }

    if (key === 'status') {
      push([
        { text: `INSTANCE      AAYUSH`, tone: 'ok' },
        { text: `WORKSTATION   01` },
        { text: `MODE          ${mode}`, tone: 'amber' },
        { text: `GITHUB        ${github ? 'CONNECTED' : 'LINKING'} · ${github?.repos?.length ?? 0} REPOS` },
        { text: `CONTRIBUTIONS ${github?.contributionTotal ?? '—'} / YR` },
        { text: `WINDOWS OPEN  ${windows.length}` },
      ])
      return
    }

    if (key === 'whoami') {
      push([
        { text: 'Aayush Sahu', tone: 'ok' },
        { text: 'AI SYSTEMS · ANALYSIS · PRODUCT' },
        { text: 'Secondary: SECURITY · FORENSICS · SYSTEMS ENGINEERING', tone: 'dim' },
      ])
      return
    }

    if (key === 'projects' || key === 'archive') {
      setView('PROJECTS')
      push([
        { text: `${bundle.projects.length} curated dossiers + auto-discovered repositories.`, tone: 'dim' },
        { text: 'Focusing PROJECTS ▸', tone: 'amber' },
      ])
      return
    }

    if (key === 'github' || key === 'telemetry') {
      setView('GITHUB')
      push([
        { text: `GitHub telemetry ${github ? 'connected' : 'linking'} · ${github?.repos?.length ?? 0} non-fork repositories.`, tone: 'dim' },
        { text: 'Focusing GITHUB ▸', tone: 'amber' },
      ])
      return
    }

    if (key === 'timeline') {
      push([
        { text: 'BUILD MODEL     IDEA → PROTOTYPE → BUILD → TEST → SHIP', tone: 'dim' },
        { text: 'RESEARCH MODEL  DISCOVERY → COLLECTION → ANALYSIS → VALIDATION → CONCLUSION', tone: 'dim' },
        { text: 'Stage is qualitative; dates only appear when evidenced.', tone: 'dim' },
      ])
      return
    }

    if (key === 'octiq') {
      setView('FOUNDER')
      push([{ text: 'Octiq AI · current founder and product effort.', tone: 'dim' }, { text: 'Opening FOUNDER HQ ▸', tone: 'amber' }])
      return
    }

    if (key === 'open') {
      const v = resolveView(arg)
      if (!v) {
        push([{ text: `Unknown subsystem "${arg}". Try: ${systems}`, tone: 'danger' }])
        return
      }
      openView(v)
      push([{ text: `Opening ${v} as a window ▸`, tone: 'amber' }])
      return
    }

    if (key === 'analyze') {
      const known = bundle.projects.map((p) => p.id).join(', ')
      if (!arg) {
        push([{ text: `Usage: analyze <project>. Known: ${known}`, tone: 'dim' }])
        return
      }
      const p = findProject(bundle, arg)
      if (!p) {
        push([{ text: `No dossier matched "${arg}".`, tone: 'danger' }, { text: `Known: ${known}`, tone: 'dim' }])
        return
      }
      openDossier({ id: p.id, title: p.title, category: p.category })
      push([{ text: `Loading dossier // ${p.title} ▸`, tone: 'amber' }])
      return
    }

    if (key === 'ask') {
      if (!arg) {
        push([{ text: 'Usage: ask <question>  · e.g. ask would Aayush fit an AI role?', tone: 'dim' }])
        return
      }
      askCortex(arg)
      push([{ text: 'Routing to CORTEX ▸', tone: 'amber' }])
      return
    }

    if (key === 'sync') {
      push([{ text: 'Requesting GitHub sync…', tone: 'dim' }])
      void sync()
      return
    }

    // Plain subsystem names navigate the canvas.
    const nav = resolveView(key)
    if (nav) {
      setView(nav)
      push([{ text: `Focusing ${nav} ▸`, tone: 'amber' }])
      return
    }

    if (key === 'terminal' || key === 'term') {
      openTerminal()
      push([{ text: 'TERMINAL_01 is already focused.', tone: 'dim' }])
      return
    }

    push([{ text: `Unknown command "${head}". Type "help".`, tone: 'danger' }])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      run(input)
      setInput('')
      notice('THINKING', 'TERMINAL COMMAND', 1600)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const i = hIndex === -1 ? history.length - 1 : Math.max(0, hIndex - 1)
      setHIndex(i)
      setInput(history[i])
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIndex === -1) return
      const i = hIndex + 1
      if (i >= history.length) {
        setHIndex(-1)
        setInput('')
      } else {
        setHIndex(i)
        setInput(history[i])
      }
    }
  }

  const toneClass = (t?: Line['tone']) =>
    t === 'in'
      ? 'text-[var(--text)]'
      : t === 'amber'
        ? 'text-[var(--amber)]'
        : t === 'dim'
          ? 'text-[var(--dim)]'
          : t === 'danger'
            ? 'text-[var(--danger)]'
            : t === 'ok'
              ? 'text-[var(--led)]'
              : 'text-[var(--muted)]'

  return (
    <div className="term flex h-full min-h-0 flex-col">
      <div ref={bodyRef} className="term-body" aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className={toneClass(l.tone)}>
            {l.text}
          </div>
        ))}
      </div>
      <form
        className="term-input"
        onSubmit={(e) => {
          e.preventDefault()
          run(input)
          setInput('')
        }}
      >
        <span className="text-[var(--amber)]">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="enter command…"
          aria-label="Terminal command input"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
