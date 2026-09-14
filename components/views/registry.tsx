'use client'

import { BrainCircuit, Command as CommandIcon, FlaskConical, FolderGit2, GitCommitHorizontal, Network, Rocket, ShieldCheck } from 'lucide-react'
import type { ComponentType } from 'react'
import type { IconName } from '@/lib/views'
import type { ViewId } from '@/lib/types'
import Command from '@/components/views/Command'
import Cortex from '@/components/views/Cortex'
import SystemMap from '@/components/views/SystemMap'
import Lab from '@/components/views/Lab'
import Projects from '@/components/views/Projects'
import GithubTelemetry from '@/components/views/GithubTelemetry'
import Security from '@/components/views/Security'
import Founder from '@/components/views/Founder'

export const ICONS: Record<IconName, ComponentType<{ size?: number; className?: string }>> = {
  command: CommandIcon,
  cortex: BrainCircuit,
  map: Network,
  lab: FlaskConical,
  projects: FolderGit2,
  github: GitCommitHorizontal,
  security: ShieldCheck,
  founder: Rocket,
}

export const VIEW_COMPONENTS: Record<ViewId, ComponentType<{ windowed?: boolean }>> = {
  COMMAND: Command,
  CORTEX: Cortex,
  MAP: SystemMap,
  LAB: Lab,
  PROJECTS: Projects,
  GITHUB: GithubTelemetry,
  SECURITY: Security,
  FOUNDER: Founder,
}
