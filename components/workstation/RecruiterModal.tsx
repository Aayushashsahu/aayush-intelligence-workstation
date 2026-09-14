'use client'

import { useEffect } from 'react'
import { X, ArrowUpRight, ScanSearch, CheckCircle2, Shield, Cpu, Layers, GitCommitHorizontal, Mail, FolderGit2, Linkedin } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Label, Led, Stat } from '@/components/ui/Primitives'
import { findProject } from '@/lib/content'

export default function RecruiterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { github, openDossier, askCortex, setView } = useWorkstation()
  const bundle = useContent()
  const profile = bundle.profile

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const flagshipIds = ['aegis', 'sentinelforge', 'edith']
  const flagshipProjects = flagshipIds
    .map((id) => findProject(bundle, id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const handleAuditFit = () => {
    onClose()
    askCortex('Evaluate Aayush’s technical depth and fit for an AI Systems / Engineering role based on verified evidence.')
  }

  const handleOpenProject = (p: any) => {
    onClose()
    openDossier({ id: p.id, title: p.title, category: p.category })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruiter-modal-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,5,8,0.85)] p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="panel relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden border-[var(--amber-line)] bg-[var(--bg-deep)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-5 md:px-7">
          <div className="flex items-center gap-3">
            <span className="relative grid h-8 w-8 place-items-center border border-[var(--amber-line)] bg-[var(--amber-wash)]">
              <span className="mono text-[11px] font-bold text-[var(--amber)]">R</span>
            </span>
            <div>
              <div className="mono flex items-center gap-2 text-[8px] tk-lg text-[var(--amber)]">
                <Led tone="amber" pulse /> CANDIDATE DOSSIER // RECRUITER MODE [60s READ]
              </div>
              <h2 id="recruiter-modal-title" className="text-xl font-bold tracking-tight text-[var(--text)] md:text-2xl">
                Aayush Sahu — Engineering Briefing
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="mono hidden text-[9px] text-[var(--dim)] sm:inline">ESC TO EXIT</span>
            <button
              onClick={onClose}
              className="mono flex h-8 w-8 items-center justify-center border border-[var(--line)] text-[var(--dim)] hover:border-[var(--line-2)] hover:text-[var(--text)] transition-colors"
              aria-label="Close recruiter briefing"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 md:p-7">
          {/* Executive Summary & Positioning */}
          <section className="panel-flat p-5 border-l-2 border-l-[var(--amber)]">
            <div className="mono text-[8px] tk-lg text-[var(--dim)]">ENGINEERING PROFILE</div>
            <p className="mt-2 text-base font-medium leading-7 text-[var(--text)]">
              Building intelligent, verifiable systems at the intersection of{' '}
              <span className="amber">AI Systems</span>,{' '}
              <span className="text-[var(--text)]">Cybersecurity</span>, and{' '}
              <span className="text-[var(--text)]">Systems Engineering</span>.
            </p>
            <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
              Focused on deterministic semantic validation, local inference runtimes, fail-closed boundaries, and founder execution. Backed by live code repositories and verified telemetry.
            </p>
          </section>

          {/* Core Architectural Superpowers */}
          <section>
            <div className="mono mb-3 text-[9px] tk-lg text-[var(--amber)]">CORE STRENGTHS &amp; DISCIPLINES</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="panel p-3.5">
                <div className="flex items-center gap-2 text-[var(--amber)]">
                  <Layers size={14} />
                  <span className="mono text-[9px] font-bold">SYSTEMS ARCH</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Deterministic release gates, policy evaluation matrices, fail-closed boundaries.
                </p>
              </div>

              <div className="panel p-3.5">
                <div className="flex items-center gap-2 text-[var(--amber)]">
                  <Cpu size={14} />
                  <span className="mono text-[9px] font-bold">AI ENGINEERING</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Multi-model fallbacks, quantized local inference, semantic verification pipelines.
                </p>
              </div>

              <div className="panel p-3.5">
                <div className="flex items-center gap-2 text-[var(--amber)]">
                  <Shield size={14} />
                  <span className="mono text-[9px] font-bold">SECURITY &amp; DFIR</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Digital forensics, incident response orchestration, cryptographic audit trails.
                </p>
              </div>

              <div className="panel p-3.5">
                <div className="flex items-center gap-2 text-[var(--amber)]">
                  <CheckCircle2 size={14} />
                  <span className="mono text-[9px] font-bold">PRODUCT &amp; VENTURE</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  Founder discipline at Octiq AI, shipping production software from 0 to 1.
                </p>
              </div>
            </div>
          </section>

          {/* Selected Flagship Systems */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="mono text-[9px] tk-lg text-[var(--amber)]">FLAGSHIP ENGINEERING SYSTEMS</div>
              <button
                onClick={() => {
                  onClose()
                  setView('PROJECTS')
                }}
                className="mono text-[9px] amber hover:underline"
              >
                ALL CASE FILES →
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {flagshipProjects.map((p) => (
                <div
                  key={p.id}
                  className="panel group flex flex-col p-4 text-left transition hover:border-[var(--amber-line)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="mono text-[8px] tk text-[var(--dim)]">{p.category}</span>
                    <span className="mono text-[8px] px-1.5 py-0.5 border border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)]">
                      {p.status}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-[var(--text)]">{p.title}</h4>
                  <p className="clamp-2 mt-1.5 text-xs leading-5 text-[var(--muted)]">{p.objective}</p>
                  {p.whyItMatters && (
                    <p className="mt-2 text-[11px] leading-4 text-[var(--amber-dim)] italic border-l border-[var(--amber-line)] pl-2">
                      Why it matters: {p.whyItMatters}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                    <button
                      onClick={() => handleOpenProject(p)}
                      className="mono text-[8px] tk text-[var(--amber)] hover:underline flex items-center gap-1"
                    >
                      OPEN CASE FILE <ArrowUpRight size={10} />
                    </button>
                    {p.repo && (
                      <a
                        href={`https://github.com/Aayushashsahu/${p.repo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mono text-[8px] text-[var(--dim)] hover:text-[var(--text)]"
                      >
                        GITHUB
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Telemetry Snapshot */}
          <section className="panel p-4">
            <div className="mono mb-3 text-[9px] tk-lg text-[var(--dim)]">VERIFIED ENGINEERING TELEMETRY</div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Annual Contributions" value={github?.contributionTotal ?? '—'} tone="amber" />
              <Stat label="Tracked Repos" value={github?.repos?.length ?? '—'} />
              <Stat label="Active (90d)" value={github?.activeRepos ?? '—'} />
              <Stat label="Live Status" value={github ? 'VERIFIED' : 'CONNECTING'} />
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] p-4 md:px-7">
          <div className="flex items-center gap-3">
            <button onClick={handleAuditFit} className="btn btn-amber">
              <ScanSearch size={12} />
              AUDIT ENGINEERING FIT WITH CORTEX
            </button>
            <a
              href="https://github.com/Aayushashsahu"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              <GitCommitHorizontal size={12} />
              GITHUB PROFILE
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profile.email || 'aayushsahu0406@gmail.com'}`}
              className="mono inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <Mail size={12} className="text-[var(--amber)]" />
              <span>aayushsahu0406@gmail.com</span>
            </a>
            <a
              href={profile.linkedin || 'https://www.linkedin.com/in/aayush-sahu-ai'}
              target="_blank"
              rel="noreferrer"
              className="mono inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <Linkedin size={12} className="text-[var(--amber)]" />
              <span>LINKEDIN</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
