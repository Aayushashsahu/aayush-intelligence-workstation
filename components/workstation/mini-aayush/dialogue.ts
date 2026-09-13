import type { ViewId } from '@/lib/types'

export const SUBSYSTEM_DIALOGUE: Record<ViewId, string> = {
  COMMAND: 'welcome to my workstation. this is the live telemetry and systems overview.',
  CORTEX: "that's cortex. ask it anything about my architecture, decisions, or fit.",
  PROJECTS: 'these are my engineering case files. real problems, fail-closed verification, no hand-waving.',
  LAB: 'the lab index is clean right now. research artifacts will publish here directly from my control room.',
  SECURITY: 'authority boundaries, incident response, and dfir investigation cases.',
  FOUNDER: 'turning technical systems into real products and ventures.',
  GITHUB: 'live graphql contribution data directly from my github profile.',
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
