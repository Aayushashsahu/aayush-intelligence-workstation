import type {
  ContentBundle,
  LabEntry,
  Milestone,
  Project,
  Repo,
  Research,
  Thought,
} from '@/lib/types'

/* -------------------------------------------------------------------------- */
/* ordering + publication                                                     */
/* -------------------------------------------------------------------------- */

/** Anything without `published: false` is public. Drafts must set it explicitly. */
export function isPublished(entry: { published?: boolean }): boolean {
  return entry.published !== false
}

/** Stable ordering: explicit `order` wins, otherwise the original index. */
export function byOrder<T extends { order?: number }>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (a.item.order ?? a.index) - (b.item.order ?? b.index))
    .map(({ item }) => item)
}

/* -------------------------------------------------------------------------- */
/* lookup                                                                      */
/* -------------------------------------------------------------------------- */

export function findProject(bundle: ContentBundle, idOrRepoOrTitle: string): Project | undefined {
  const needle = idOrRepoOrTitle.toLowerCase()
  return bundle.projects.find(
    (p) =>
      p.id.toLowerCase() === needle ||
      (p.repo || '').toLowerCase() === needle ||
      p.title.toLowerCase() === needle,
  )
}

export function findProjectByRepo(bundle: ContentBundle, repoName: string): Project | undefined {
  return bundle.projects.find((p) => p.repo === repoName)
}

export function relatedResearch(bundle: ContentBundle, projectId: string): Research[] {
  return bundle.research.filter((r) => r.relatedProjects?.includes(projectId))
}

export function relatedLab(bundle: ContentBundle, projectId: string): LabEntry[] {
  return bundle.lab.filter((l) => l.relatedProjects?.includes(projectId))
}

/** Manual milestones bound to a project. */
export function projectMilestones(bundle: ContentBundle, projectId: string): Milestone[] {
  return bundle.milestones.filter((m) => m.projectId === projectId)
}

export function featuredProjects(bundle: ContentBundle): Project[] {
  const featured = bundle.projects.filter((p) => p.featured)
  return featured.length ? featured : bundle.projects.slice(0, 4)
}

export function thoughtsForTopic(bundle: ContentBundle, topic: string): Thought[] {
  return bundle.thoughts.filter((t) => t.topic === topic)
}

/* -------------------------------------------------------------------------- */
/* derived data                                                               */
/* -------------------------------------------------------------------------- */

export const counts = (bundle: ContentBundle) => ({
  projects: bundle.projects.length,
  research: bundle.research.length,
  lab: bundle.lab.length,
  security: bundle.security.length,
  thoughts: bundle.thoughts.length,
  milestones: bundle.milestones.length,
  curatedRepos: bundle.projects.filter((p) => p.repo).length,
})

export function inferCategory(repo: Repo): string {
  const haystack = `${repo.name} ${repo.description || ''} ${repo.language || ''} ${(repo.topics || []).join(' ')}`.toLowerCase()
  if (/aegis|sentinel|security|forensic|malware|recon|threat/.test(haystack)) return 'SECURITY'
  if (/ai|llm|agent|jarvis|edith|career|router|model|neural/.test(haystack)) return 'AI / SYSTEMS'
  if (/reconcil|data|pipeline|etl|document|intelligen/.test(haystack)) return 'DATA / BACKEND'
  if (/web|portfolio|landing|frontend|react|next|ui/.test(haystack)) return 'WEB / PRODUCT'
  return 'EXPERIMENTS'
}

/**
 * Bind a live repository to its curated dossier, or synthesise a light one.
 * Curated narrative always wins; GitHub supplies the telemetry.
 */
export function toDossier(bundle: ContentBundle, repo: Repo): Project {
  const curated = findProjectByRepo(bundle, repo.name)
  if (curated) return curated
  return {
    id: `auto-${repo.name}`,
    repo: repo.name,
    title: repo.name,
    category: inferCategory(repo),
    objective: repo.description || 'Repository auto-discovered from GitHub telemetry.',
    why: repo.description || 'Auto-discovered from live GitHub telemetry. No curated narrative yet.',
    evidence: [],
    architecture: [],
    techAreas: repo.language ? [repo.language] : [],
    status: 'ACTIVE',
    timeline: 'BUILD',
    tags: (repo.topics || []).slice(0, 5),
    link: repo.html_url,
  }
}

/**
 * GitHub-derived timeline points. These are read-only telemetry, labelled as such,
 * and never presented as authored milestones.
 */
export function repoMilestones(repo: Repo | undefined, projectId: string): Milestone[] {
  if (!repo) return []
  const out: Milestone[] = []
  if (repo.created_at) {
    out.push({
      id: `telemetry:${projectId}:created`,
      title: 'Repository created',
      description: `Derived from live GitHub telemetry · ${repo.full_name}`,
      date: repo.created_at,
      projectId,
      kind: 'IDEA',
      source: 'github',
    })
  }
  if (repo.pushed_at) {
    out.push({
      id: `telemetry:${projectId}:pushed`,
      title: 'Last push',
      description: `Derived from live GitHub telemetry · ${repo.full_name}`,
      date: repo.pushed_at,
      projectId,
      kind: 'BUILD',
      source: 'github',
    })
  }
  return out
}

/** Manual milestones first (oldest to newest), then GitHub telemetry. */
export function timelineFor(bundle: ContentBundle, project: Project, repo?: Repo): Milestone[] {
  const manual = projectMilestones(bundle, project.id).map((m) => ({ ...m, source: 'manual' as const }))
  const derived = repoMilestones(repo, project.id)
  const all = [...manual, ...derived]
  return all.sort((a, b) => {
    const at = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY
    const bt = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY
    return at - bt
  })
}

/** Everything the PROJECTS archive should list: curated dossiers plus discovered repos. */
export function archiveDossiers(bundle: ContentBundle, repos: Repo[]): Project[] {
  const curated = bundle.projects
  const extra = repos
    .filter((r) => !curated.some((p) => p.repo === r.name))
    .map((r) => toDossier(bundle, r))
  return [...curated, ...extra]
}

/** Language share over the live repositories. */
export function languageShare(repos: Repo[]) {
  const map = new Map<string, number>()
  for (const r of repos) {
    const key = r.language || 'Other'
    map.set(key, (map.get(key) || 0) + 1)
  }
  const total = repos.length || 1
  return [...map.entries()]
    .map(([name, count]) => ({ name, count, share: count / total }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}
