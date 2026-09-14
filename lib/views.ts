import type { Mode, ViewId } from '@/lib/types'

export type IconName =
  | 'command'
  | 'cortex'
  | 'map'
  | 'lab'
  | 'projects'
  | 'github'
  | 'security'
  | 'founder'

export type ViewMeta = {
  id: ViewId
  code: string
  label: string
  icon: IconName
  mode: Mode
  blurb: string
  windowed: boolean
}

/** The persistent subsystem hierarchy of the workstation. */
export const VIEWS: ViewMeta[] = [
  {
    id: 'COMMAND',
    code: '01',
    label: 'COMMAND',
    icon: 'command',
    mode: 'BUILD',
    blurb: 'Home / command center',
    windowed: false,
  },
  {
    id: 'CORTEX',
    code: '02',
    label: 'CORTEX',
    icon: 'cortex',
    mode: 'ANALYZE',
    blurb: 'Intelligence core',
    windowed: true,
  },
  {
    id: 'MAP',
    code: '03',
    label: 'SYSTEM MAP',
    icon: 'map',
    mode: 'ANALYZE',
    blurb: 'Interactive architecture graph',
    windowed: true,
  },
  {
    id: 'LAB',
    code: '04',
    label: 'LAB',
    icon: 'lab',
    mode: 'EXPLORE',
    blurb: 'Experiments & research',
    windowed: true,
  },
  {
    id: 'PROJECTS',
    code: '05',
    label: 'PROJECTS',
    icon: 'projects',
    mode: 'BUILD',
    blurb: 'Systems archive',
    windowed: true,
  },
  {
    id: 'GITHUB',
    code: '06',
    label: 'GITHUB',
    icon: 'github',
    mode: 'INVESTIGATE',
    blurb: 'Live engineering telemetry',
    windowed: true,
  },
  {
    id: 'SECURITY',
    code: '07',
    label: 'SECURITY',
    icon: 'security',
    mode: 'INVESTIGATE',
    blurb: 'Cybersecurity & forensics',
    windowed: true,
  },
  {
    id: 'FOUNDER',
    code: '08',
    label: 'FOUNDER',
    icon: 'founder',
    mode: 'FOUNDER',
    blurb: 'Octiq AI & founder HQ',
    windowed: true,
  },
]

export const MODE_ORDER: Mode[] = ['BUILD', 'ANALYZE', 'INVESTIGATE', 'EXPLORE', 'FOUNDER']

export function viewMeta(id: ViewId): ViewMeta {
  return VIEWS.find((v) => v.id === id) || VIEWS[0]
}

export function viewMode(id: ViewId): Mode {
  return viewMeta(id).mode
}

/** Resolve a loosely-typed user input (terminal, links) to a subsystem. */
export function resolveView(input: string): ViewId | null {
  const raw = input.trim().toLowerCase()
  if (!raw) return null
  const alias: Record<string, ViewId> = {
    home: 'COMMAND',
    command: 'COMMAND',
    overview: 'COMMAND',
    cortex: 'CORTEX',
    analyst: 'CORTEX',
    intelligence: 'CORTEX',
    ask: 'CORTEX',
    map: 'MAP',
    systemmap: 'MAP',
    graph: 'MAP',
    architecture: 'MAP',
    systems: 'MAP',
    lab: 'LAB',
    research: 'LAB',
    experiments: 'LAB',
    projects: 'PROJECTS',
    archive: 'PROJECTS',
    github: 'GITHUB',
    telemetry: 'GITHUB',
    security: 'SECURITY',
    forensics: 'SECURITY',
    dfir: 'SECURITY',
    founder: 'FOUNDER',
    octiq: 'FOUNDER',
    hq: 'FOUNDER',
  }
  return alias[raw] || null
}
