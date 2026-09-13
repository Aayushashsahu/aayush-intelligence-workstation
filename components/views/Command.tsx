'use client'

import { ArrowUpRight, ChevronRight, Radio, RefreshCw } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { Bar, Chip, Divider, Label, Led, Stat } from '@/components/ui/Primitives'
import { useContent } from '@/components/workstation/ContentProvider'
import { counts, featuredProjects } from '@/lib/content'

function timeAgo(iso?: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'JUST NOW'
  if (m < 60) return `${m}M AGO`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}H AGO`
  return `${Math.floor(h / 24)}D AGO`
}

function eventText(e: any) {
  const repo = e?.repo?.name?.split('/').pop() || 'repository'
  const map: Record<string, string> = {
    PushEvent: 'pushed code to',
    CreateEvent: 'created activity in',
    PullRequestEvent: 'opened a pull request in',
    IssuesEvent: 'updated an issue in',
    WatchEvent: 'starred',
    ForkEvent: 'forked',
    ReleaseEvent: 'released in',
  }
  return `${map[e?.type] || e?.type || 'activity'} ${repo}`
}

export default function Command() {
  const { github, setView, openView, openDossier, openTerminal, sync, lastSync, syncPhase } = useWorkstation()
  const bundle = useContent()
  const profileData = bundle.profile
  const company = bundle.founder.company
  const contentCounts = counts(bundle)
  const repos = github?.repos ?? []
  const connected = Boolean(github && !github?.error)
  const featured = featuredProjects(bundle)
  const recent = (github?.events ?? []).slice(0, 6)
  const languages = github?.languages ?? []
  // Derived from the live event window, not asserted: commits pushed inside the
  // most recent public activity, summed from PushEvent commit counts.
  const recentCommits = (github?.events ?? []).reduce((total, e) => total + (e.commits ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Identity block — entering the workstation, not a hero */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_.8fr]">
        <div className="panel relative overflow-hidden p-6 md:p-10">
          <div
            className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,138,43,.14), transparent 68%)' }}
          />
          <div className="mono flex items-center gap-2 text-[9px] tk-lg text-[var(--amber)]">
            <Led tone="amber" pulse />
            INSTANCE // AAYUSH · WORKSTATION 01
          </div>

          <h1 className="mt-6 text-6xl font-semibold leading-[0.86] tracking-[-0.05em] md:text-[7.5rem]">
            {profileData.identity}
          </h1>

          <div className="mono mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs tk-lg text-[var(--muted)] md:text-sm">
            {profileData.positioning.map((p, i) => (
              <span key={p} className="flex items-center gap-3">
                {i > 0 && <span className="text-[var(--line-2)]">·</span>}
                <span className={i === 0 ? 'text-[var(--text)]' : ''}>{p}</span>
              </span>
            ))}
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg">{profileData.statement}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {profileData.secondary.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>

          <div className="mt-9 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-4">
            <Stat label="Contributions / yr" value={github?.contributionTotal ?? '—'} tone="amber" />
            <Stat label="Repos tracked" value={connected ? repos.length : '—'} />
            <Stat label="Active / 90d" value={connected ? (github?.activeRepos ?? '—') : '—'} />
            <Stat label="Recent commits" value={connected ? recentCommits || '—' : '—'} />
          </div>
        </div>

        {/* Live machine state */}
        <div className="grid gap-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <Label>
                <Radio size={13} className="amber-pure" />
                SYSTEM STATUS
              </Label>
              <span className="mono text-[9px] text-[var(--dim)]">{timeAgo(lastSync)}</span>
            </div>
            <div className="mt-5 space-y-3.5">
              <StatusRow label="COMMAND" value="ONLINE" tone="live" />
              <StatusRow label="CORTEX" value="STANDBY" tone="amber" />
              <StatusRow
                label="LAB"
                value={contentCounts.lab + contentCounts.research > 0 ? `${contentCounts.lab + contentCounts.research} THREADS` : 'INDEXED · 0 THREADS'}
                tone={contentCounts.lab + contentCounts.research > 0 ? 'live' : 'idle'}
              />
              <StatusRow
                label="GITHUB"
                value={syncPhase === 'ERROR' ? 'DEGRADED' : connected ? 'CONNECTED' : 'LINKING'}
                tone={syncPhase === 'ERROR' ? 'danger' : connected ? 'live' : 'idle'}
              />
              <StatusRow label="FOUNDER" value={company.verified ? 'ACTIVE' : 'ACTIVE · DRAFT'} tone="live" />
            </div>
          </div>

          <div className="panel p-5">
            <Label>OPERATOR READ</Label>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              The pattern is not one project. It is the combination: AI systems built with an evidence discipline,
              analytical depth, and a founder instinct that turns the machinery into products.
            </p>
            <button onClick={() => setView('CORTEX')} className="btn btn-amber mt-5 w-full justify-center">
              CONSULT CORTEX
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* Storytelling Triad: BUILD · THINK · INVESTIGATE */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="mono flex items-center justify-between text-[9px] tk text-[var(--amber)]">
            <span>01 // SYSTEMS</span>
            <Led tone="live" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-[var(--text)]">BUILD</h3>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Production intelligence systems designed to run deterministically. Local inference engines, fail-closed release gates, and offline hardware integration.
          </p>
          <div className="mt-4 pt-3 border-t border-[var(--line)] mono text-[8px] tk text-[var(--dim)]">
            SYSTEMS: AEGIS · E.D.I.T.H. · CAREER OS
          </div>
        </div>

        <div className="panel p-5">
          <div className="mono flex items-center justify-between text-[9px] tk text-[var(--amber)]">
            <span>02 // REASONING</span>
            <Led tone="amber" pulse />
          </div>
          <h3 className="mt-3 text-base font-semibold text-[var(--text)]">THINK</h3>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Analytical rigor over hype. Treating model outputs as probabilistic observations that require verifiable semantic truth rather than blind trust.
          </p>
          <div className="mt-4 pt-3 border-t border-[var(--line)] mono text-[8px] tk text-[var(--dim)]">
            FOCUS: CORTEX · GRAPH RAG · DETERMINISTIC GATES
          </div>
        </div>

        <div className="panel p-5">
          <div className="mono flex items-center justify-between text-[9px] tk text-[var(--amber)]">
            <span>03 // SECURITY & EVIDENCE</span>
            <Led tone="live" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-[var(--text)]">INVESTIGATE</h3>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Digital forensics, trust boundaries, and incident response. Bounding automated agent authority so every visible action has traceable provenance.
          </p>
          <div className="mt-4 pt-3 border-t border-[var(--line)] mono text-[8px] tk text-[var(--dim)]">
            FOCUS: SENTINELFORGE · DFIR · AUDIT TRAILS
          </div>
        </div>
      </section>

      {/* Current work */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <Label>CURRENT WORK</Label>
            <button onClick={() => openView('FOUNDER')} className="mono text-[9px] amber">
              FOUNDER HQ <ArrowUpRight size={11} className="ml-1 inline" />
            </button>
          </div>

          <button
            onClick={() => openView('FOUNDER')}
            className="panel-flat mt-5 block w-full p-4 text-left transition hover:border-[var(--amber-line)]"
          >
            <div className="flex items-center justify-between">
              <span className="mono text-[9px] tk-lg text-[var(--amber)]">{company.name.toUpperCase()}</span>
              <span className="mono flex items-center gap-2 text-[9px] text-[var(--dim)]">
                <Led tone="amber" pulse /> {company.status}
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-6 text-[var(--muted)]">{company.summary}</p>
          </button>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {featured.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => openDossier({ id: p.id, title: p.title, category: p.category })}
                className="panel-flat group p-4 text-left transition hover:border-[var(--amber-line)]"
              >
                <div className="mono text-[8px] tk tk-lg text-[var(--dim)]">{p.category}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">{p.title}</span>
                  <ChevronRight size={13} className="text-[var(--dim)] transition group-hover:translate-x-0.5" />
                </div>
                <div className="clamp-2 mt-1.5 text-xs leading-5 text-[var(--dim)]">{p.objective}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="panel p-6">
            <Label>LANGUAGE DISTRIBUTION</Label>
            <div className="mt-5 space-y-3">
              {languages.length ? (
                languages.slice(0, 5).map((l) => (
                  <div key={l.name}>
                    <div className="mono mb-1.5 flex justify-between text-[9px] tk text-[var(--dim)]">
                      <span className="text-[var(--muted)]">{l.name.toUpperCase()}</span>
                      <span>{Math.round(l.share * 100)}%</span>
                    </div>
                    <Bar value={l.share * 100} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--dim)]">Telemetry linking…</p>
              )}
            </div>
          </div>

          <div className="panel p-6">
            <Label>HOW TO READ THIS MACHINE</Label>
            <div className="mt-4 space-y-2">
              <Jump n="01" title="CORTEX" text="Evidence-first read on fit, projects and gaps." onClick={() => openView('CORTEX')} />
              <Jump n="02" title="LAB" text="Research threads and active experiments." onClick={() => setView('LAB')} />
              <Jump n="03" title="PROJECTS" text="Open a system dossier." onClick={() => setView('PROJECTS')} />
              <Jump n="04" title="GITHUB" text="Live contribution telemetry." onClick={() => setView('GITHUB')} />
            </div>
          </div>
        </div>
      </section>

      {/* Live telemetry strip */}
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>RECENT ACTIVITY</Label>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('GITHUB')} className="mono text-[9px] amber">
              FULL TELEMETRY <ArrowUpRight size={11} className="ml-1 inline" />
            </button>
            <button
              onClick={() => void sync()}
              className="mono flex items-center gap-1.5 text-[9px] text-[var(--dim)] hover:text-[var(--text)]"
            >
              <RefreshCw size={11} /> SYNC
            </button>
          </div>
        </div>
        <Divider />
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {recent.length ? (
            recent.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2">
                <span className="truncate text-xs text-[var(--muted)]">{eventText(e)}</span>
                <span className="mono flex-none text-[8px] tk text-[var(--dim)]">{timeAgo(e.created_at)}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--dim)]">Waiting for the GitHub event stream…</p>
          )}
        </div>
        <button onClick={openTerminal} className="btn mt-5">
          OPEN TERMINAL_01
        </button>
      </section>
    </div>
  )
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: 'live' | 'amber' | 'danger' | 'idle' }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
      <span className="mono text-[9px] tk uppercase text-[var(--dim)]">{label}</span>
      <span className="mono flex items-center gap-2 text-[10px] text-[var(--muted)]">
        <Led tone={tone} pulse={tone === 'amber'} />
        {value}
      </span>
    </div>
  )
}

function Jump({ n, title, text, onClick }: { n: string; title: string; text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 border border-transparent px-2 py-2 text-left transition hover:border-[var(--line)]"
    >
      <span className="mono text-[9px] text-[var(--amber)]">{n}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-[11px] text-[var(--dim)]">{text}</span>
      </span>
    </button>
  )
}
