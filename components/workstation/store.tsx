'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { CompanionState, GithubData, Mode, SyncPhase, ViewId } from '@/lib/types'
import { viewMeta, viewMode } from '@/lib/views'

export type WindowKind = 'view' | 'dossier' | 'terminal'

export type WinState = {
  id: string
  kind: WindowKind
  title: string
  sub: string
  view?: ViewId
  projectId?: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
}

type Companion = { state: CompanionState; activity: string }

type Ctx = {
  view: ViewId
  setView: (v: ViewId) => void
  mode: Mode

  windows: WinState[]
  activeWindowId: string | null
  isMobile: boolean
  openView: (v: ViewId) => void
  openDossier: (project: { id: string; title: string; category: string }) => void
  openTerminal: () => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, w: number, h: number) => void
  tileWindows: () => void

  github: GithubData | null
  setGithub: (g: GithubData) => void
  syncPhase: SyncPhase
  lastSync: string | null
  sync: () => Promise<void>

  companion: Companion
  notice: (state: CompanionState, activity: string, ttl?: number) => void

  cortexQuery: string | null
  askCortex: (q: string) => void
  clearCortexQuery: () => void

  recruiterOpen: boolean
  openRecruiter: () => void
  closeRecruiter: () => void
}

const WorkstationContext = createContext<Ctx | null>(null)

export function useWorkstation() {
  const ctx = useContext(WorkstationContext)
  if (!ctx) throw new Error('useWorkstation must be used inside <WorkstationProvider>')
  return ctx
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

const SYNC_STEPS: { phase: SyncPhase; ms: number }[] = [
  { phase: 'CONNECTING', ms: 180 },
  { phase: 'FETCHING_REPOSITORIES', ms: 260 },
  { phase: 'CHECKING_CHANGES', ms: 200 },
  { phase: 'INDEXING_PROJECTS', ms: 200 },
  { phase: 'UPDATING_TELEMETRY', ms: 180 },
]

export function WorkstationProvider({
  children,
  initialGithub,
}: {
  children: ReactNode
  initialGithub: GithubData | null
}) {
  const isMobile = useMediaQuery('(max-width: 900px)')

  const [view, setViewState] = useState<ViewId>('COMMAND')
  const [windows, setWindows] = useState<WinState[]>([])
  const zRef = useRef(10)

  const [github, setGithub] = useState<GithubData | null>(initialGithub)
  const [syncPhase, setSyncPhase] = useState<SyncPhase>(initialGithub ? 'COMPLETE' : 'IDLE')
  const [lastSync, setLastSync] = useState<string | null>(initialGithub?.fetchedAt ?? null)

  const [companion, setCompanion] = useState<Companion>({ state: 'IDLE', activity: 'OBSERVING SYSTEM' })
  const revertRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [cortexQuery, setCortexQuery] = useState<string | null>(null)
  const [recruiterOpen, setRecruiterOpen] = useState(false)

  const openRecruiter = useCallback(() => setRecruiterOpen(true), [])
  const closeRecruiter = useCallback(() => setRecruiterOpen(false), [])

  const notice = useCallback((state: CompanionState, activity: string, ttl = 3600) => {
    setCompanion({ state, activity })
    if (revertRef.current) clearTimeout(revertRef.current)
    revertRef.current = setTimeout(() => setCompanion({ state: 'IDLE', activity: 'OBSERVING SYSTEM' }), ttl)
  }, [])

  /* --- window manager ----------------------------------------------------- */

  const viewport = useCallback(() => {
    if (typeof window === 'undefined') return { w: 1024, h: 768 }
    return { w: window.innerWidth, h: window.innerHeight }
  }, [])

  /** Keeps window stacking inside [21, 80] so UI chrome always sits above. */
  const nextZ = useCallback(() => {
    zRef.current = (zRef.current % 60) + 1
    return 20 + zRef.current
  }, [])

  const focusWindow = useCallback(
    (id: string) => {
      const z = nextZ()
      setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)))
    },
    [nextZ],
  )

  const spawn = useCallback(
    (base: Omit<WinState, 'x' | 'y' | 'w' | 'h' | 'z' | 'minimized' | 'maximized'>) => {
      setWindows((ws) => {
        const existing = ws.find((w) => w.id === base.id)
        const z = nextZ()
        if (existing) {
          return ws.map((w) => (w.id === base.id ? { ...w, z, minimized: false } : w))
        }
        const vp = viewport()
        const n = ws.length
        const mobile = vp.w <= 900
        const w = mobile ? vp.w - 16 : Math.min(900, Math.max(420, vp.w - 200))
        const h = mobile ? vp.h - 16 : Math.min(660, Math.max(360, vp.h - 180))
        const x = mobile ? 8 : Math.max(56, Math.min(vp.w - w - 56, 150 + n * 32))
        const y = mobile ? 8 : Math.max(60, Math.min(vp.h - h - 40, 96 + n * 28))
        return [...ws, { ...base, x, y, w, h, z, minimized: false, maximized: false }]
      })
    },
    [viewport, nextZ],
  )

  /** Arrange open windows into a readable grid. */
  const tileWindows = useCallback(() => {
    const vp = viewport()
    const mobile = vp.w <= 900
    setWindows((ws) => {
      const visible = ws.filter((w) => !w.minimized)
      const cols = mobile ? 1 : visible.length > 2 ? 2 : 1
      const rows = Math.max(1, Math.ceil(visible.length / cols))
      const gap = 10
      const top = 64
      const w = mobile ? vp.w - 16 : Math.floor((vp.w - 160 - gap * (cols - 1)) / cols)
      const h = Math.floor((vp.h - top - 60 - gap * (rows - 1)) / rows)
      let i = 0
      return ws.map((win) => {
        if (win.minimized) return win
        const c = i % cols
        const r = Math.floor(i / cols)
        i += 1
        return {
          ...win,
          maximized: false,
          x: mobile ? 8 : 120 + c * (w + gap),
          y: top + r * (h + gap),
          w,
          h,
        }
      })
    })
    notice('THINKING', 'ARRANGING WINDOWS', 2000)
  }, [viewport, notice])

  /**
   * A subsystem lives in exactly one place at a time: the canvas or a window.
   * Popping one out moves it into the window, so no subsystem is ever mounted
   * twice with divergent state.
   */
  const openView = useCallback(
    (v: ViewId) => {
      const meta = viewMeta(v)
      spawn({ id: `view:${v}`, kind: 'view', title: meta.label, sub: meta.blurb, view: v })
      focusWindow(`view:${v}`)
      setViewState((cur) => (cur === v ? 'COMMAND' : cur))
      notice(v === 'CORTEX' ? 'THINKING' : 'INVESTIGATING', `ENGAGED ${meta.label}`, 2600)
    },
    [spawn, focusWindow, notice],
  )

  const openDossier = useCallback(
    (project: { id: string; title: string; category: string }) => {
      if (!project?.id) return
      spawn({
        id: `dossier:${project.id}`,
        kind: 'dossier',
        title: project.title || project.id,
        sub: project.category || 'SYSTEM DOSSIER',
        projectId: project.id,
      })
      focusWindow(`dossier:${project.id}`)
      notice('READING', `DOSSIER // ${project.title || project.id}`, 3000)
    },
    [spawn, focusWindow, notice],
  )

  const openTerminal = useCallback(() => {
    spawn({ id: 'terminal', kind: 'terminal', title: 'TERMINAL_01', sub: 'SYSTEM CONTROL' })
    focusWindow('terminal')
  }, [spawn, focusWindow])

  const closeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.filter((w) => w.id !== id))
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)))
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))
  }, [])

  const resizeWindow = useCallback((id: string, w: number, h: number) => {
    setWindows((ws) => ws.map((win) => (win.id === id ? { ...win, w, h } : win)))
  }, [])

  const setView = useCallback(
    (v: ViewId) => {
      setViewState(v)
      // The canvas now owns this subsystem — retract any popped-out window for it.
      setWindows((ws) => ws.filter((w) => w.view !== v))
      notice(v === 'LAB' ? 'READING' : 'THINKING', `ENGAGED ${viewMeta(v).label}`, 2200)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [notice],
  )

  const askCortex = useCallback(
    (q: string) => {
      setCortexQuery(q)
      openView('CORTEX')
    },
    [openView],
  )

  const clearCortexQuery = useCallback(() => setCortexQuery(null), [])

  /* --- github sync -------------------------------------------------------- */

  const sync = useCallback(async () => {
    setSyncPhase('CONNECTING')
    notice('THINKING', 'SYNCING GITHUB', 1200)
    const timers: ReturnType<typeof setTimeout>[] = []
    let cursor = 0
    for (const step of SYNC_STEPS) {
      if (step.phase === 'CONNECTING') continue
      cursor += step.ms
      timers.push(setTimeout(() => setSyncPhase(step.phase), cursor))
    }
    try {
      const res = await fetch('/api/github/sync', { method: 'POST', cache: 'no-store' })
      if (!res.ok) throw new Error('sync failed')
      const data = (await res.json()) as GithubData & { throttled?: boolean }
      // Let the phase labels land so the interaction reads as a real operation.
      await new Promise((r) => setTimeout(r, 200))
      if (data && !data.error) {
        setGithub(data)
        setLastSync(data.fetchedAt)
      }
      setSyncPhase('COMPLETE')
      notice(
        data?.throttled ? 'IDLE' : 'EXCITED',
        data?.throttled ? 'SYNC THROTTLED · DATA CURRENT' : 'SYNC COMPLETE · TELEMETRY LIVE',
        4200,
      )
    } catch {
      setSyncPhase('ERROR')
      notice('ALERT', 'SYNC FAILED · FEED DEGRADED', 5000)
    } finally {
      timers.forEach(clearTimeout)
      setTimeout(() => setSyncPhase((p) => (p === 'COMPLETE' || p === 'ERROR' ? 'IDLE' : p)), 3200)
    }
  }, [notice])

  /* --- periodic refresh --------------------------------------------------- */
  useEffect(() => {
    const load = () =>
      fetch('/api/github', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d: GithubData) => {
          if (d && !d.error) {
            setGithub(d)
            setLastSync(d.fetchedAt)
          }
        })
        .catch(() => {})
    const i = setInterval(load, 120000)
    return () => clearInterval(i)
  }, [])

  /* --- companion: inactivity + boot -------------------------------------- */
  useEffect(() => {
    notice('EXCITED', 'WORKSTATION ONLINE', 4000)
    let last = Date.now()
    const bump = () => {
      last = Date.now()
    }
    window.addEventListener('pointerdown', bump, { passive: true })
    window.addEventListener('keydown', bump)
    window.addEventListener('scroll', bump, { passive: true })
    const i = setInterval(() => {
      if (Date.now() - last > 45000) {
        setCompanion((c) => (c.state === 'SLEEPING' ? c : { state: 'SLEEPING', activity: 'DORMANT' }))
      }
    }, 5000)
    return () => {
      window.removeEventListener('pointerdown', bump)
      window.removeEventListener('keydown', bump)
      window.removeEventListener('scroll', bump)
      clearInterval(i)
    }
  }, [notice])

  const activeWindowId = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id
  }, [windows])

  const mode = viewMode(view)

  const value: Ctx = {
    view,
    setView,
    mode,
    windows,
    activeWindowId,
    isMobile,
    openView,
    openDossier,
    openTerminal,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    tileWindows,
    github,
    setGithub,
    syncPhase,
    lastSync,
    sync,
    companion,
    notice,
    cortexQuery,
    askCortex,
    clearCortexQuery,
    recruiterOpen,
    openRecruiter,
    closeRecruiter,
  }

  return <WorkstationContext.Provider value={value}>{children}</WorkstationContext.Provider>
}
