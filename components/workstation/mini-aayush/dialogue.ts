import type { ViewId } from '@/lib/types'

export const SUBSYSTEM_DIALOGUE: Record<ViewId, string> = {
  COMMAND: 'command center online.',
  CORTEX: "that's the brain.",
  MAP: 'everything connects here.',
  PROJECTS: 'this is where the receipts are.',
  GITHUB: 'checking the commits?',
  FOUNDER: 'the strategic layer.',
  LAB: 'waiting on validated research.',
  SECURITY: 'defensive boundary active.',
}

export const CLICK_REACTIONS: string[] = [
  'hey! exploring the workstation?',
  'everything here is backed by verifiable code.',
  'click through the case files to see the verification gates.',
  'i live here in the workstation — click me anytime.',
  'all telemetry you see is streaming live.',
  'need a technical deep-dive? try consulting cortex.',
]

export const FALL_DIALOGUE = {
  falling: 'oh that was embarrassing hehe',
  recovering: 'hehe... all good',
}

export const SLEEP_DIALOGUE = 'zzz... ping me if you need anything'

export const IDLE_THOUGHTS: string[] = [
  'checking telemetry stream...',
  'deterministic gates make happy systems.',
  'monitoring system health...',
  'fail-closed by default.',
]

export const PICKUP_DIALOGUE: string[] = [
  'uhh?',
  'hey—',
  'whoa!',
  'wait—',
  'where to?',
]

export const SETTLE_DIALOGUE: string[] = [
  'okay... this works.',
  'nice spot.',
  'back on solid ground.',
  'safely docked.',
  'phew.',
]

