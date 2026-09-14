// Shared types for AAYUSH // INTELLIGENCE WORKSTATION

/* ==========================================================================
   LIVE AUTOMATIC DATA (GitHub)
   ========================================================================== */

export type Repo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  pushed_at: string
  created_at?: string
  fork: boolean
  archived: boolean
  topics?: string[]
  homepage?: string | null
}

export type GithubEvent = {
  type: string
  created_at: string
  repo?: { name?: string }
  /** Commit count for PushEvents; pruned server-side so the payload stays small. */
  commits?: number
  payload?: any
}

export type LanguageStat = { name: string; count: number; share: number }

export type GithubData = {
  profile: any
  repos: Repo[]
  events: GithubEvent[]
  contributionDays: { date: string; contributionCount: number }[]
  contributionTotal: number
  languages: LanguageStat[]
  activeRepos: number
  username: string
  fetchedAt: string
  source: 'graphql' | 'events-fallback'
  error?: string
}

/* ==========================================================================
   MANUALLY CURATED DATA
   Every curated domain carries `published` so drafts can never leak publicly.
   `published` left undefined is treated as published.
   ========================================================================== */

export type ContentType =
  | 'profile'
  | 'founder'
  | 'projects'
  | 'research'
  | 'lab'
  | 'security'
  | 'thoughts'
  | 'milestones'

/** Domains held as a single document rather than a list. */
export const SINGLETON_TYPES: ContentType[] = ['profile', 'founder']

export type ProjectStatus = 'ACTIVE' | 'MAINTAINED' | 'PROTOTYPE' | 'EXPERIMENT' | 'SHIPPED' | 'ARCHIVED'
export type TimelineModel = 'BUILD' | 'RESEARCH'
export type ResearchStatus =
  | 'EXPLORING'
  | 'RESEARCHING'
  | 'PROTOTYPING'
  | 'TESTING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED'
export type LabStatus = ResearchStatus
export type SecurityStatus = 'ACTIVE' | 'INVESTIGATION' | 'CLOSED' | 'ARCHIVED' | 'MONITORING'

export type Media = { url: string; alt?: string; kind?: 'image' | 'video' | 'pdf' | 'link' }
export type LinkRef = { label: string; url: string }

export type Principle = { title: string; text: string }

/** A manually entered timeline point. `projectId` optionally binds it to a dossier. */
export type Milestone = {
  id: string
  title: string
  description?: string
  /** Only set a date that is genuinely known. Never fabricate. */
  date?: string | null
  link?: string | null
  projectId?: string | null
  kind?: 'IDEA' | 'PROTOTYPE' | 'BUILD' | 'TEST' | 'SHIP' | 'DISCOVERY' | 'COLLECTION' | 'ANALYSIS' | 'VALIDATION' | 'CONCLUSION' | 'OTHER'
  /** 'github' points are derived automatically and are read-only in the control room. */
  source?: 'manual' | 'github'
  published?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export type Project = {
  id: string
  /** GitHub repository name to bind live telemetry. */
  repo?: string
  title: string
  category: string
  objective: string
  why: string
  evidence: string[]
  architecture: string[]
  techAreas: string[]
  status: ProjectStatus
  timeline: TimelineModel
  tags: string[]
  featured?: boolean
  published?: boolean
  order?: number
  link?: string
  links?: LinkRef[]
  media?: Media[]
  relatedResearch?: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string
  /* Engineering Case File extensions */
  problem?: string
  question?: string
  approach?: string
  keyDecisions?: string[]
  tradeoffs?: string[]
  provenance?: string[]
}

export type Research = {
  id: string
  title: string
  description: string
  date?: string | null
  category: string
  tags: string[]
  status: ResearchStatus
  link?: string | null
  paper?: string | null
  notes?: string | null
  relatedProjects?: string[]
  published?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export type LabEntry = {
  id: string
  title: string
  /** The question or hypothesis being tested. */
  question: string
  description: string
  state?: string
  notes?: string | null
  category: string
  tags: string[]
  status: LabStatus
  link?: string | null
  relatedProjects?: string[]
  relatedResearch?: string[]
  published?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export type SecurityCase = {
  id: string
  title: string
  description: string
  category: string
  findings: string[]
  evidence: string[]
  references: LinkRef[]
  status: SecurityStatus
  projectId?: string | null
  tags: string[]
  published?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export type Thought = {
  id: string
  title: string
  body: string
  date?: string | null
  topic: string
  tags: string[]
  published?: boolean
  order?: number
  createdAt?: string
  updatedAt?: string
}

export type Profile = {
  name: string
  handle: string
  identity: string
  positioning: string[]
  secondary: string[]
  statement: string
  summary: string
  disciplines: string[]
  domains: string[]
  email?: string
  linkedin?: string
  updatedAt?: string
}

export type FounderProductNote = { id: string; title: string; body: string; date?: string | null }

export type FounderContent = {
  company: {
    name: string
    role: string
    status: string
    summary: string
    building: string[]
    exploring: string[]
    links: string[]
    verified: boolean
  }
  focus: string[]
  exploring: string[]
  principles: Principle[]
  productNotes: FounderProductNote[]
  /** Curated project ids that represent the founder's thinking. */
  currentProjects: string[]
  needsInput: string[]
  updatedAt?: string
}

export type ContentEntry =
  | Project
  | Research
  | LabEntry
  | SecurityCase
  | Thought
  | Milestone

/** Everything the public surface is allowed to render. */
export type ContentBundle = {
  profile: Profile
  founder: FounderContent
  projects: Project[]
  research: Research[]
  lab: LabEntry[]
  security: SecurityCase[]
  thoughts: Thought[]
  milestones: Milestone[]
}

/** Admin view: every entry including drafts. */
export type AdminBundle = {
  published: ContentBundle
  drafts: {
    projects: Project[]
    research: Research[]
    lab: LabEntry[]
    security: SecurityCase[]
    thoughts: Thought[]
    milestones: Milestone[]
  }
  storage: 'mongodb' | 'seed'
  counts: Record<ContentType, number>
}

/* ==========================================================================
   UI / SHELL
   ========================================================================== */

export type Mode = 'BUILD' | 'ANALYZE' | 'INVESTIGATE' | 'EXPLORE' | 'FOUNDER'

export type ViewId = 'COMMAND' | 'CORTEX' | 'MAP' | 'LAB' | 'PROJECTS' | 'GITHUB' | 'SECURITY' | 'FOUNDER'

export type CompanionState = 'IDLE' | 'THINKING' | 'READING' | 'EXCITED' | 'SLEEPING' | 'INVESTIGATING' | 'ALERT'

export type SyncPhase =
  | 'IDLE'
  | 'CONNECTING'
  | 'FETCHING_REPOSITORIES'
  | 'CHECKING_CHANGES'
  | 'INDEXING_PROJECTS'
  | 'UPDATING_TELEMETRY'
  | 'COMPLETE'
  | 'ERROR'

export type OwnerSession = {
  login: string
  name?: string
  avatarUrl?: string
  provider: 'github'
  exp: number
}
