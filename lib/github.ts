import type { GithubData, GithubEvent, LanguageStat, Repo } from '@/lib/types'

const API = 'https://api.github.com'
const UA = 'aayush-intelligence-workstation'

const round = (n: number, p = 1000) => Math.round(n * p) / p

async function gh(path: string, revalidate = 300) {
  const res = await fetch(API + path, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': UA },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  return res.json()
}

function computeLanguages(repos: Repo[]): LanguageStat[] {
  const map = new Map<string, number>()
  for (const r of repos) {
    const lang = r.language || 'Other'
    map.set(lang, (map.get(lang) || 0) + 1)
  }
  const total = repos.length || 1
  return [...map.entries()]
    .map(([name, count]) => ({ name, count, share: round(count / total) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

function countActive(repos: Repo[]): number {
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 90
  return repos.filter((r) => new Date(r.pushed_at).getTime() >= cutoff).length
}

/** Build a contribution calendar from public events when no token is available. */
function eventsFallback(events: GithubEvent[]) {
  const days = 365
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)
  const map = new Map<string, number>()
  for (const e of events) {
    const d = new Date(e.created_at)
    if (d >= since) {
      const k = d.toISOString().slice(0, 10)
      const inc = e.type === 'PushEvent' ? Math.max(1, e.payload?.commits?.length || 1) : 1
      map.set(k, (map.get(k) || 0) + inc)
    }
  }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const date = d.toISOString().slice(0, 10)
    return { date, contributionCount: map.get(date) || 0 }
  })
}

/** Exact calendar via GitHub GraphQL. Requires a server-side token. */
async function graphContributions(username: string, token: string) {
  const query = `query($login:String!){
    user(login:$login){
      contributionsCollection{
        contributionCalendar{
          totalContributions
          weeks{ contributionDays{ contributionCount date } }
        }
      }
    }
  }`
  const res = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify({ query, variables: { login: username } }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`)
  const json = await res.json()
  const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar
  const days: { date: string; contributionCount: number }[] =
    calendar?.weeks?.flatMap((w: any) => w.contributionDays) || []
  return { days, total: calendar?.totalContributions ?? days.reduce((a, d) => a + d.contributionCount, 0) }
}

/**
 * Fetch the full live snapshot. Server-side only.
 * `force` bypasses the route-level cache for a manual SYNC NOW.
 */
export async function getGithubData(username: string, opts: { force?: boolean } = {}): Promise<GithubData> {
  const revalidate = opts.force ? 0 : 300

  const [profile, rawRepos, events] = await Promise.all([
    gh(`/users/${encodeURIComponent(username)}`, revalidate),
    gh(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`, revalidate),
    gh(`/users/${encodeURIComponent(username)}/events/public?per_page=100`, revalidate),
  ])

  // Forks and archived repos are excluded from the active archive. The raw GitHub
  // objects carry ~40 extra fields each (nested owner, every URL); pruning to the
  // fields the UI actually reads keeps the server→client payload small.
  const repos = (rawRepos as Repo[])
    .filter((r) => !r.fork && !r.archived)
    .map(
      (r): Repo => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description ?? null,
        language: r.language ?? null,
        stargazers_count: r.stargazers_count ?? 0,
        forks_count: r.forks_count ?? 0,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        created_at: r.created_at,
        fork: r.fork,
        archived: r.archived,
        topics: r.topics ?? [],
        homepage: r.homepage ?? null,
      }),
    )

  let contributionDays: { date: string; contributionCount: number }[] = []
  let contributionTotal = 0
  let source: GithubData['source'] = 'events-fallback'

  const token = process.env.GITHUB_TOKEN
  if (token) {
    try {
      const gql = await graphContributions(username, token)
      if (gql.days.length) {
        contributionDays = gql.days
        contributionTotal = gql.total
        source = 'graphql'
      }
    } catch {
      // fall through to the public-events estimate
    }
  }

  if (!contributionDays.length) {
    contributionDays = eventsFallback(events as GithubEvent[])
    contributionTotal = contributionDays.reduce((a, d) => a + d.contributionCount, 0)
    source = 'events-fallback'
  }

  return {
    profile,
    repos,
    // Trimmed for a leaner server→client payload; the UI only surfaces recent items
    // and reads the event type, timestamp, repo name and push commit count.
    events: (events as GithubEvent[]).slice(0, 40).map((e) => ({
      type: e.type,
      created_at: e.created_at,
      repo: e.repo?.name ? { name: e.repo.name } : undefined,
      commits: e.payload?.commits?.length ?? 0,
    })),
    contributionDays,
    contributionTotal,
    languages: computeLanguages(repos),
    activeRepos: countActive(repos),
    username,
    fetchedAt: new Date().toISOString(),
    source,
  }
}

export function resolveUsername() {
  return process.env.GITHUB_USERNAME || 'Aayushashsahu'
}
