'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, RefreshCw, TerminalSquare } from 'lucide-react'
import { useWorkstation, WorkstationProvider } from '@/components/workstation/store'
import { ContentProvider, useContentStore } from '@/components/workstation/ContentProvider'
import WindowFrame from '@/components/workstation/Window'
import Companion from '@/components/workstation/Companion'
import { ICONS, VIEW_COMPONENTS } from '@/components/views/registry'
import { VIEWS } from '@/lib/views'
import { Led } from '@/components/ui/Primitives'
import type { ContentBundle, GithubData } from '@/lib/types'

export default function Workstation({
  initialGithub,
  initialContent,
  contentStorage,
}: {
  initialGithub: GithubData | null
  initialContent: ContentBundle
  contentStorage: 'mongodb' | 'seed'
}) {
  return (
    <ContentProvider initial={initialContent} storage={contentStorage}>
      <WorkstationProvider initialGithub={initialGithub}>
        <Shell />
      </WorkstationProvider>
    </ContentProvider>
  )
}

function Shell() {
  const {
    view,
    setView,
    mode,
    windows,
    github,
    sync,
    syncPhase,
    lastSync,
    openTerminal,
    tileWindows,
    isMobile,
  } = useWorkstation()
  const contentStore = useContentStore()

  const [booted, setBooted] = useState(false)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setBooted(true)
      return
    }
    const t = setTimeout(() => setBooted(true), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (skip) setBooted(true)
  }, [skip])

  const ActiveView = VIEW_COMPONENTS[view]
  const connected = Boolean(github && !github?.error)
  const syncing = !['IDLE', 'COMPLETE', 'ERROR'].includes(syncPhase)

  if (!booted) return <Boot onSkip={() => setSkip(true)} />

  return (
    <div className="min-h-dvh pb-16">
      <a
        href="#canvas"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[960] focus:bg-[var(--surface)] focus:px-3 focus:py-2 mono text-[10px] amber"
      >
        Skip to content
      </a>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[950] border-b border-[var(--line)] bg-[rgba(8,8,10,.86)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button onClick={() => setView('COMMAND')} className="flex min-w-0 items-center gap-3 text-left">
            <span className="relative grid h-9 w-9 flex-none place-items-center border border-[var(--amber-line)] bg-[var(--amber-wash)]">
              <span className="mono text-[12px] font-semibold text-[var(--amber)]">A</span>
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--led)]" />
            </span>
            <span className="min-w-0">
              <span className="mono block truncate text-[10px] tk-lg text-[var(--text)]">
                AAYUSH // INTELLIGENCE WORKSTATION
              </span>
              <span className="mono hidden truncate text-[9px] tk text-[var(--dim)] sm:block">
                INSTANCE // AAYUSH · WORKSTATION 01 · MODE // {mode}
              </span>
            </span>
          </button>

          <div className="flex flex-none items-center gap-2">
            <span className="mono hidden items-center gap-2 text-[9px] tk text-[var(--dim)] lg:flex">
              <Led tone={syncPhase === 'ERROR' ? 'danger' : connected ? 'live' : 'idle'} pulse={syncing} />
              {connected ? 'GITHUB LIVE' : 'LINKING'}
            </span>
            <button
              onClick={() => void sync()}
              disabled={syncing}
              className="btn hidden sm:inline-flex"
              aria-label="Sync GitHub telemetry now"
            >
              <RefreshCw size={11} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'SYNCING' : 'SYNC NOW'}
            </button>
            <button onClick={openTerminal} className="btn btn-amber" aria-label="Open system terminal">
              <TerminalSquare size={12} />
              TERMINAL
            </button>
          </div>
        </div>

        {/* Mobile subsystem strip */}
        <div className="border-t border-[var(--line)] px-2 py-2 lg:hidden">
          <div className="flex gap-1.5 overflow-x-auto">
            {VIEWS.map((v) => {
              const Icon = ICONS[v.icon]
              return (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  aria-current={view === v.id}
                  className="rail-item w-auto flex-none"
                >
                  <Icon size={13} />
                  {v.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1560px] px-4 md:px-6">
        <div className="flex gap-5">
          <aside className="hidden w-[212px] flex-none py-5 lg:block" aria-label="Subsystems">
            <nav className="sticky top-[92px] space-y-1">
              <div className="mono mb-3 px-1 text-[9px] tk-lg text-[var(--dim)]">SUBSYSTEMS</div>
              {VIEWS.map((v) => {
                const Icon = ICONS[v.icon]
                return (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    aria-current={view === v.id}
                    className="rail-item"
                  >
                    <span className="mono w-4 flex-none text-[9px] opacity-60">{v.code}</span>
                    <Icon size={13} className="flex-none" />
                    <span className="min-w-0 flex-1 truncate">{v.label}</span>
                  </button>
                )
              })}
              <div className="mt-4 border-t border-[var(--line)] pt-4">
                <div className="mono mb-2 px-1 text-[9px] tk-lg text-[var(--dim)]">UTILITIES</div>
                <button onClick={openTerminal} className="rail-item">
                  <span className="mono w-4 flex-none text-[9px] opacity-60">08</span>
                  <TerminalSquare size={13} className="flex-none" />
                  TERMINAL
                </button>
                <button onClick={tileWindows} className="rail-item">
                  <span className="mono w-4 flex-none text-[9px] opacity-60">09</span>
                  <LayoutGrid size={13} className="flex-none" />
                  TILE WINDOWS
                </button>
              </div>

              <div className="panel mt-5 p-3">
                <div className="mono text-[8px] tk-lg text-[var(--dim)]">LAST SYNC</div>
                <div className="mono mt-1 text-[10px] tk text-[var(--muted)]">
                  {lastSync ? new Date(lastSync).toLocaleTimeString('en-GB') : '—'}
                </div>
                <div className="mono mt-3 flex items-center justify-between text-[8px] tk text-[var(--dim)]">
                  <span>REPOS</span>
                  <span className="text-[var(--muted)]">{github?.repos?.length ?? '—'}</span>
                </div>
                <div className="mono mt-1.5 flex items-center justify-between text-[8px] tk text-[var(--dim)]">
                  <span>CONTENT</span>
                  <span className="text-[var(--muted)]">{contentStore.storage === 'mongodb' ? 'MONGO' : 'SEED'}</span>
                </div>
              </div>
            </nav>
          </aside>

          <main id="canvas" className="min-w-0 flex-1 py-4 pb-24">
            <ActiveView />
          </main>
        </div>
      </div>

      {/* ── Taskbar ──────────────────────────────────────────────────────── */}
      <Taskbar />

      {/* ── Windows ──────────────────────────────────────────────────────── */}
      {windows.map((w) => (
        <WindowFrame key={w.id} win={w} />
      ))}

      <Companion />
      {isMobile && <div className="h-10" />}
    </div>
  )
}

function Taskbar() {
  const { windows, activeWindowId, focusWindow, openTerminal, tileWindows, mode, syncPhase } = useWorkstation()
  return (
    <div className="fixed inset-x-0 bottom-0 z-[900] border-t border-[var(--line)] bg-[rgba(9,9,11,.94)] backdrop-blur-md">
      <div className="mx-auto flex h-10 max-w-[1560px] items-center gap-2 px-3">
        <button onClick={openTerminal} className="btn !py-1.5 !px-2.5" aria-label="Open terminal">
          <Led tone="amber" pulse />
          TERMINAL_01
        </button>

        <div className="mx-1 h-5 w-px bg-[var(--line)]" />

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {windows.length === 0 && (
            <span className="mono text-[9px] tk text-[var(--dim)]">NO WINDOWS OPEN</span>
          )}
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => focusWindow(w.id)}
              className={`mono flex flex-none items-center gap-2 border px-2.5 py-1 text-[9px] tk transition ${
                activeWindowId === w.id && !w.minimized
                  ? 'border-[var(--amber-line)] bg-[var(--amber-wash)] text-[var(--amber-hi)]'
                  : 'border-[var(--line)] text-[var(--dim)] hover:text-[var(--text)]'
              } ${w.minimized ? 'opacity-50' : ''}`}
              aria-label={`${w.minimized ? 'Restore' : 'Focus'} ${w.title}`}
            >
              <span className="max-w-[150px] truncate">{w.title}</span>
            </button>
          ))}
        </div>

        <button onClick={tileWindows} className="btn !py-1.5 !px-2.5 hidden sm:inline-flex" aria-label="Tile windows">
          <LayoutGrid size={11} /> TILE
        </button>

        <div className="mono hidden items-center gap-3 text-[9px] tk text-[var(--dim)] md:flex">
          <span>
            MODE // <span className="text-[var(--amber)]">{mode}</span>
          </span>
          <span>
            SYNC //{' '}
            <span className={syncPhase === 'ERROR' ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}>
              {syncPhase}
            </span>
          </span>
          <Clock />
        </div>
      </div>
    </div>
  )
}

function Clock() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString('en-GB'))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])
  return <span className="tabular-nums text-[var(--muted)]">{now}</span>
}

const BOOT_LINES = [
  'POST · intelligence workstation',
  'mounting subsystem rail',
  'linking github telemetry',
  'indexing project dossiers',
  'waking companion',
  'session ready',
]

function Boot({ onSkip }: { onSkip: () => void }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setN((x) => Math.min(BOOT_LINES.length, x + 1)), 220)
    return () => clearInterval(i)
  }, [])
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <button
        onClick={onSkip}
        aria-label="Skip boot sequence"
        className="panel w-full max-w-xl p-6 text-left"
      >
        <div className="flex items-center justify-between">
          <span className="mono text-[10px] tk-lg text-[var(--amber)]">AAYUSH // INTELLIGENCE WORKSTATION</span>
          <span className="mono text-[9px] tk text-[var(--dim)]">BOOT</span>
        </div>
        <div className="mono mt-6 space-y-2 text-[11px] text-[var(--muted)]">
          {BOOT_LINES.slice(0, n).map((l) => (
            <div key={l} className="flex items-center justify-between">
              <span>{l}</span>
              <span className="text-[var(--led)]">OK</span>
            </div>
          ))}
        </div>
        <div className="mt-6 progress-track">
          <div className="progress-fill" style={{ width: `${(n / BOOT_LINES.length) * 100}%` }} />
        </div>
        <div className="mono mt-3 text-[9px] tk text-[var(--dim)]">CLICK OR PRESS ENTER TO SKIP</div>
      </button>
    </div>
  )
}
