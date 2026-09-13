'use client'

import { useMemo } from 'react'
import { GitCommitHorizontal, RefreshCw, Activity, ArrowUpRight } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Bar, Chip, Label, Led, Stat } from '@/components/ui/Primitives'
import { findProjectByRepo } from '@/lib/content'
import type { GithubData } from '@/lib/types'

const LEVELS = ['rgba(255,255,255,.045)', '#0e4429', '#006d32', '#26a641', '#39d353']

function levelFor(count: number, max: number) {
  if (count <= 0) return 0
  const r = count / (max || 1)
  if (r <= 0.25) return 1
  if (r <= 0.5) return 2
  if (r <= 0.75) return 3
  return 4
}

function toWeeks(days: GithubData['contributionDays']) {
  if (!days.length) return [] as (GithubData['contributionDays'][number] | null)[][]
  const first = new Date(days[0].date + 'T00:00:00')
  const pad = first.getDay()
  const cells: (GithubData['contributionDays'][number] | null)[] = [...Array(pad).fill(null), ...days]
  const weeks: (GithubData['contributionDays'][number] | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

const PHASE_LABEL: Record<string, string> = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING…',
  FETCHING_REPOSITORIES: 'FETCHING REPOSITORIES…',
  CHECKING_CHANGES: 'CHECKING CHANGES…',
  INDEXING_PROJECTS: 'INDEXING PROJECTS…',
  UPDATING_TELEMETRY: 'UPDATING TELEMETRY…',
  COMPLETE: 'SYNC COMPLETE',
  ERROR: 'SYNC FAILED',
}

export default function GithubTelemetry() {
  const { github, sync, syncPhase, lastSync, openDossier } = useWorkstation()
  const bundle = useContent()

  const days = github?.contributionDays ?? []
  const weeks = useMemo(() => toWeeks(days), [days])
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.contributionCount)), [days])
  const connected = Boolean(github && !github?.error)
  const syncing = !['IDLE', 'COMPLETE', 'ERROR'].includes(syncPhase)

  const activeRepos = useMemo(() => {
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 120
    return (github?.repos ?? []).filter((r) => new Date(r.pushed_at).getTime() >= cutoff).slice(0, 8)
  }, [github])

  return (
    <div className="space-y-4">
      {/* Sync control */}
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Label>
              <GitCommitHorizontal size={13} className="amber-pure" />
              GITHUB // LIVE ENGINEERING TELEMETRY
            </Label>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Real activity, not decoration.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Repositories, contributions and events are pulled server-side. Anyone can verify the raw signal on GitHub;
              this surface just makes it legible.
            </p>
          </div>

          <div className="panel-flat min-w-[240px] p-4">
            <div className="flex items-center justify-between">
              <span className="mono text-[8px] tk-lg text-[var(--dim)]">GITHUB SYNC</span>
              <span className="mono flex items-center gap-2 text-[9px] tk text-[var(--muted)]">
                <Led tone={syncPhase === 'ERROR' ? 'danger' : connected ? 'live' : 'idle'} pulse={syncing} />
                {connected ? 'ONLINE' : 'LINKING'}
              </span>
            </div>
            <div className="mono mt-3 flex items-center justify-between text-[9px] tk text-[var(--dim)]">
              <span>LAST SYNC</span>
              <span className="text-[var(--muted)]">
                {lastSync ? new Date(lastSync).toLocaleTimeString('en-GB') : '—'}
              </span>
            </div>
            <div className="mono mt-2 flex items-center justify-between text-[9px] tk text-[var(--dim)]">
              <span>CALENDAR SOURCE</span>
              <span className="text-[var(--muted)]">
                {github?.source === 'graphql' ? 'GITHUB GRAPHQL' : github ? 'PUBLIC EVENTS' : '—'}
              </span>
            </div>
            <button onClick={() => void sync()} disabled={syncing} className="btn btn-amber mt-4 w-full justify-center">
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              {syncing ? PHASE_LABEL[syncPhase] : 'SYNC NOW'}
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Contributions (yr)" value={github?.contributionTotal ?? '—'} tone="amber" />
          <Stat label="Repositories (non-fork)" value={github?.repos?.length ?? '—'} />
          <Stat label="Active last 90 days" value={github?.activeRepos ?? '—'} />
          <Stat label="Public events" value={github?.events?.length ?? '—'} />
        </div>
      </section>

      {/* Contribution heatmap */}
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>CONTRIBUTION CALENDAR</Label>
          <div className="mono flex items-center gap-2 text-[8px] tk text-[var(--dim)]">
            LESS
            {LEVELS.map((c, i) => (
              <span key={i} className="heat-legend" style={{ background: c }} />
            ))}
            MORE
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-2">
          <div className="flex gap-[3px]">
            {weeks.length ? (
              weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((d, di) => (
                    <div
                      key={di}
                      className="heat"
                      style={{
                        width: 11,
                        height: 11,
                        background: d ? LEVELS[levelFor(d.contributionCount, max)] : 'transparent',
                        boxShadow: d ? undefined : 'none',
                      }}
                      title={d ? `${d.contributionCount} contributions on ${d.date}` : undefined}
                      aria-hidden
                    />
                  ))}
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--dim)]">Contribution data linking…</p>
            )}
          </div>
        </div>
        <p className="mono mt-4 text-[9px] leading-5 text-[var(--dim)]">
          {github?.source === 'graphql'
            ? 'Exact calendar via GitHub GraphQL using a server-side token. The token never reaches the browser.'
            : 'Estimated from the public events feed. Add a server-side GITHUB_TOKEN for the exact calendar.'}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        {/* Active repositories */}
        <div className="panel p-6">
          <Label>ACTIVE REPOSITORIES</Label>
          <div className="mt-4 space-y-2">
            {activeRepos.map((r) => {
              const dossier = findProjectByRepo(bundle, r.name)
              return (
                <div key={r.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="mono text-[8px] tk text-[var(--dim)]">
                      {r.language || 'MULTI'} · PUSHED {new Date(r.pushed_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-3">
                    {dossier && (
                      <button
                        onClick={() =>
                          openDossier({ id: dossier.id, title: dossier.title, category: dossier.category })
                        }
                        className="mono text-[8px] tk amber"
                      >
                        DOSSIER
                      </button>
                    )}
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${r.name} on GitHub`}
                      className="text-[var(--dim)] hover:text-[var(--text)]"
                    >
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              )
            })}
            {!activeRepos.length && <p className="text-xs text-[var(--dim)]">No recent pushes in the window.</p>}
          </div>
        </div>

        {/* Activity + languages */}
        <div className="space-y-4">
          <div className="panel p-6">
            <Label>
              <Activity size={13} className="amber-pure" /> RECENT EVENTS
            </Label>
            <div className="mt-4 space-y-3">
              {(github?.events ?? []).slice(0, 7).map((e, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] pb-2">
                  <span className="mono text-[9px] tk text-[var(--muted)]">{e.type.replace('Event', '')}</span>
                  <span className="truncate text-[11px] text-[var(--dim)]">{e.repo?.name?.split('/').pop()}</span>
                  <span className="mono flex-none text-[8px] text-[var(--dim)]">
                    {new Date(e.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              ))}
              {!github?.events?.length && <p className="text-xs text-[var(--dim)]">Event stream unavailable.</p>}
            </div>
          </div>

          <div className="panel p-6">
            <Label>LANGUAGES</Label>
            <div className="mt-4 space-y-3">
              {(github?.languages ?? []).map((l) => (
                <div key={l.name}>
                  <div className="mono mb-1.5 flex justify-between text-[9px] tk text-[var(--dim)]">
                    <span className="text-[var(--muted)]">{l.name.toUpperCase()}</span>
                    <span>{l.count} REPOS</span>
                  </div>
                  <Bar value={l.share * 100} />
                </div>
              ))}
              {!github?.languages?.length && <p className="text-xs text-[var(--dim)]">Linking…</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Project discovery */}
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>PROJECT DISCOVERY</Label>
          <Chip>FORKS & ARCHIVED EXCLUDED</Chip>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
          New public, non-fork repositories appear here automatically — no source change required. Curated dossiers are
          matched by repository name; the rest are auto-indexed with a light profile.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(github?.repos ?? []).slice(0, 24).map((r) => (
            <span key={r.id} className="chip">
              {r.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
