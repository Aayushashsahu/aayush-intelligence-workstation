'use client'

import {
  ArrowUpRight,
  ChevronRight,
  Radio,
  RefreshCw,
  BrainCircuit,
  FolderGit2,
  GitCommitHorizontal,
  Network,
  Rocket,
  UserCheck,
  ScanSearch,
  Mail,
  Linkedin,
} from 'lucide-react'
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
  const {
    github,
    setView,
    openView,
    openDossier,
    openTerminal,
    sync,
    lastSync,
    syncPhase,
    askCortex,
    openRecruiter,
  } = useWorkstation()
  const bundle = useContent()
  const profileData = bundle.profile
  const company = bundle.founder.company
  const contentCounts = counts(bundle)
  const repos = github?.repos ?? []
  const connected = Boolean(github && !github?.error)
  const featured = featuredProjects(bundle)
  const recent = (github?.events ?? []).slice(0, 6)
  const languages = github?.languages ?? []
  const recentCommits = (github?.events ?? []).reduce((total, e) => total + (e.commits ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* 1. Identity & Live Machine State Section */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_.8fr]">
        <div className="panel relative overflow-hidden p-6 md:p-10">
          <div
            className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,138,43,.14), transparent 68%)' }}
          />

          <div className="mono flex items-center gap-2 text-[9px] tk-lg text-[var(--amber)]">
            <Led tone="amber" pulse />
            INSTANCE // AAYUSH · WORKSTATION 01 · OPERATING ENVIRONMENT
          </div>

          <h1 className="mt-5 text-5xl font-bold leading-[0.92] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            AAYUSH SAHU
          </h1>

          <div className="mono mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm tk-lg font-medium text-[var(--amber-hi)]">
            <span>ENGINEER</span>
            <span className="text-[var(--line-2)]">·</span>
            <span>SYSTEMS BUILDER</span>
            <span className="text-[var(--line-2)]">·</span>
            <span>RESEARCHER</span>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg">
            Building intelligent systems at the intersection of{' '}
            <span className="font-medium text-[var(--text)]">AI</span> ×{' '}
            <span className="font-medium text-[var(--text)]">cybersecurity</span> ×{' '}
            <span className="font-medium text-[var(--text)]">systems engineering</span> ×{' '}
            <span className="font-medium text-[var(--text)]">product</span>.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {profileData.secondary.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>

          {/* Direct Contact Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profileData.email || 'aayushsahu0406@gmail.com'}`}
              className="mono inline-flex items-center gap-2 text-xs text-[var(--amber-hi)] hover:text-[var(--text)] border border-[var(--amber-line)] px-3 py-1.5 rounded bg-[var(--amber-wash)] transition-all hover:border-[var(--amber)]"
            >
              <Mail size={13} className="text-[var(--amber)]" />
              <span>aayushsahu0406@gmail.com</span>
            </a>
            <a
              href={profileData.linkedin || 'https://www.linkedin.com/in/aayush-sahu-ai'}
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line-2)] px-3 py-1.5 rounded bg-[var(--surface-2)] transition-all hover:border-[var(--amber-line)]"
            >
              <Linkedin size={13} className="text-[var(--amber)]" />
              <span>linkedin.com/in/aayush-sahu-ai</span>
            </a>
          </div>

          <div className="mt-8 grid gap-6 border-t border-[var(--line)] pt-6 sm:grid-cols-4">
            <Stat label="Contributions / yr" value={github?.contributionTotal ?? '—'} tone="amber" />
            <Stat label="Repos tracked" value={connected ? repos.length : '—'} />
            <Stat label="Active / 90d" value={connected ? (github?.activeRepos ?? '—') : '—'} />
            <Stat label="Recent commits" value={connected ? recentCommits || '—' : '—'} />
          </div>
        </div>

        {/* Live Machine State */}
        <div className="grid gap-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <Label>
                <Radio size={13} className="amber-pure" />
                SYSTEM STATUS
              </Label>
              <span className="mono text-[9px] text-[var(--dim)]">{timeAgo(lastSync)}</span>
            </div>
            <div className="mt-4 space-y-3">
              <StatusRow label="COMMAND" value="ONLINE" tone="live" />
              <StatusRow label="CORTEX" value="REASONING READY" tone="amber" />
              <StatusRow
                label="SYSTEM MAP"
                value="6 ACTIVE NODES"
                tone="live"
              />
              <StatusRow
                label="GITHUB"
                value={syncPhase === 'ERROR' ? 'DEGRADED' : connected ? 'CONNECTED' : 'LINKING'}
                tone={syncPhase === 'ERROR' ? 'danger' : connected ? 'live' : 'idle'}
              />
              <StatusRow label="FOUNDER" value={company.verified ? 'ACTIVE' : 'ACTIVE · DRAFT'} tone="live" />
            </div>
          </div>

          <div className="panel p-5 flex flex-col justify-between">
            <div>
              <Label>OPERATOR READ</Label>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                The pattern is not one project. It is the combination: AI systems built with deterministic evidence discipline,
                forensic rigor, and founder execution that turns the machinery into production software.
              </p>
            </div>
            <button
              onClick={() => setView('CORTEX')}
              className="btn btn-amber mt-4 w-full justify-center"
            >
              CONSULT CORTEX
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. System Controls / Exploration Actions */}
      <section className="panel p-5 border-[var(--line-2)] bg-[var(--surface)]">
        <div className="mono text-[9px] tk-lg text-[var(--dim)] mb-3 flex items-center justify-between">
          <span>SYSTEM CONTROLS // EXPLORATION PROTOCOLS</span>
          <span className="text-[var(--amber)]">SELECT SUBSYSTEM TO ENGAGE</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setView('CORTEX')}
            className="panel group flex flex-col items-start p-3 text-left transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
          >
            <span className="mono text-[8px] text-[var(--amber)] opacity-60">01 //</span>
            <div className="mt-2 flex items-center gap-2">
              <BrainCircuit size={14} className="text-[var(--amber)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-[var(--text)]">ASK CORTEX</span>
            </div>
            <span className="mono mt-1 text-[8px] text-[var(--dim)]">Intelligence core</span>
          </button>

          <button
            onClick={() => setView('PROJECTS')}
            className="panel group flex flex-col items-start p-3 text-left transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
          >
            <span className="mono text-[8px] text-[var(--amber)] opacity-60">02 //</span>
            <div className="mt-2 flex items-center gap-2">
              <FolderGit2 size={14} className="text-[var(--amber)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-[var(--text)]">CASE FILES</span>
            </div>
            <span className="mono mt-1 text-[8px] text-[var(--dim)]">Systems archive</span>
          </button>

          <button
            onClick={() => setView('MAP')}
            className="panel group flex flex-col items-start p-3 text-left transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
          >
            <span className="mono text-[8px] text-[var(--amber)] opacity-60">03 //</span>
            <div className="mt-2 flex items-center gap-2">
              <Network size={14} className="text-[var(--amber)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-[var(--text)]">SYSTEM MAP</span>
            </div>
            <span className="mono mt-1 text-[8px] text-[var(--dim)]">Topology graph</span>
          </button>

          <button
            onClick={() => setView('GITHUB')}
            className="panel group flex flex-col items-start p-3 text-left transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
          >
            <span className="mono text-[8px] text-[var(--amber)] opacity-60">04 //</span>
            <div className="mt-2 flex items-center gap-2">
              <GitCommitHorizontal size={14} className="text-[var(--amber)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-[var(--text)]">TELEMETRY</span>
            </div>
            <span className="mono mt-1 text-[8px] text-[var(--dim)]">Live git commits</span>
          </button>

          <button
            onClick={() => setView('FOUNDER')}
            className="panel group flex flex-col items-start p-3 text-left transition-all hover:border-[var(--amber-line)] hover:bg-[var(--amber-wash)]"
          >
            <span className="mono text-[8px] text-[var(--amber)] opacity-60">05 //</span>
            <div className="mt-2 flex items-center gap-2">
              <Rocket size={14} className="text-[var(--amber)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-[var(--text)]">FOUNDER HQ</span>
            </div>
            <span className="mono mt-1 text-[8px] text-[var(--dim)]">Strategic layer</span>
          </button>

          <button
            onClick={openRecruiter}
            className="panel group flex flex-col items-start p-3 text-left transition-all border-[var(--amber-line)] bg-[var(--amber-wash)] hover:shadow-md"
          >
            <span className="mono text-[8px] text-[var(--amber)] font-bold">06 //</span>
            <div className="mt-2 flex items-center gap-2">
              <UserCheck size={14} className="text-[var(--amber)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-[var(--amber-hi)]">RECRUITER</span>
            </div>
            <span className="mono mt-1 text-[8px] text-[var(--amber)] opacity-80">60-second read</span>
          </button>
        </div>
      </section>

      {/* 3. Active Systems Showcase */}
      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <Label>ACTIVE ENGINEERING SYSTEMS</Label>
            <button onClick={() => setView('PROJECTS')} className="mono text-[9px] amber">
              FULL ARCHIVE <ArrowUpRight size={11} className="ml-1 inline" />
            </button>
          </div>

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {featured.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="panel-flat group flex flex-col justify-between p-4 text-left transition hover:border-[var(--amber-line)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="mono text-[8px] tk text-[var(--dim)]">{p.category}</span>
                    <Led tone="live" />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--text)]">{p.title}</span>
                  </div>
                  <p className="clamp-2 mt-1.5 text-xs leading-5 text-[var(--muted)]">{p.objective}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                  <button
                    onClick={() => openDossier({ id: p.id, title: p.title, category: p.category })}
                    className="mono text-[8px] tk text-[var(--amber)] hover:underline flex items-center gap-1"
                  >
                    CASE FILE <ChevronRight size={10} className="transition group-hover:translate-x-0.5" />
                  </button>
                  <button
                    onClick={() => askCortex(`Analyze the engineering architecture, verification guarantees, and tradeoffs of ${p.title}.`)}
                    className="mono text-[8px] text-[var(--dim)] hover:text-[var(--text)] flex items-center gap-1"
                  >
                    <ScanSearch size={9} /> ASK CORTEX
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Venture Bridge */}
          <div className="panel mt-4 p-4 border-[var(--amber-line)] bg-[var(--surface-2)]">
            <div className="flex items-center justify-between">
              <span className="mono text-[9px] tk-lg text-[var(--amber)]">STRATEGIC VENTURE // {company.name.toUpperCase()}</span>
              <span className="mono flex items-center gap-2 text-[9px] text-[var(--muted)]">
                <Led tone="amber" pulse /> {company.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{company.summary}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="mono text-[8px] text-[var(--dim)]">{company.role}</span>
              <button
                onClick={() => setView('FOUNDER')}
                className="mono text-[8px] tk amber hover:underline"
              >
                ENTER STRATEGIC LAYER →
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry & Signal Sidebar */}
        <div className="grid gap-4">
          <div className="panel p-6">
            <Label>LANGUAGE DISTRIBUTION</Label>
            <div className="mt-4 space-y-2.5">
              {languages.length ? (
                languages.slice(0, 5).map((l) => (
                  <div key={l.name}>
                    <div className="mono mb-1 flex justify-between text-[8px] tk text-[var(--dim)]">
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
            <Label>SYSTEM MAP TOPOLOGY</Label>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              Interactive nexus connecting Aayush to AI Systems, Cybersecurity, Systems Engineering, and Product.
            </p>
            <button
              onClick={() => setView('MAP')}
              className="btn btn-amber mt-4 w-full justify-center"
            >
              <Network size={12} />
              OPEN INTERACTIVE SYSTEM MAP
            </button>
          </div>
        </div>
      </section>

      {/* 4. Storytelling Triad: BUILD · THINK · INVESTIGATE */}
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

      {/* 5. Live Telemetry Strip */}
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>LIVE REPOSITORY TELEMETRY</Label>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('GITHUB')} className="mono text-[9px] amber">
              FULL TELEMETRY <ArrowUpRight size={11} className="ml-1 inline" />
            </button>
            <button
              onClick={() => void sync()}
              className="mono flex items-center gap-1.5 text-[9px] text-[var(--dim)] hover:text-[var(--text)]"
            >
              <RefreshCw size={11} /> SYNC NOW
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
