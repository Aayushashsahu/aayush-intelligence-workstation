'use client'

import { useMemo, useState } from 'react'
import { FlaskConical, ExternalLink, FileText, HelpCircle } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Empty, Label, Led } from '@/components/ui/Primitives'
import { findProject } from '@/lib/content'
import { thoughtTopics } from '@/lib/taxonomy'
import type { LabStatus, ResearchStatus } from '@/lib/types'

const TONE: Record<string, 'live' | 'amber' | 'idle'> = {
  EXPLORING: 'idle',
  RESEARCHING: 'amber',
  PROTOTYPING: 'amber',
  TESTING: 'amber',
  ACTIVE: 'live',
  COMPLETED: 'live',
  ARCHIVED: 'idle',
}

export default function Lab() {
  const { openDossier, setView } = useWorkstation()
  const bundle = useContent()
  const [filter, setFilter] = useState<'ALL' | ResearchStatus>('ALL')

  const experiments = bundle.lab
  const research = bundle.research

  const statuses = useMemo(
    () => ['ALL', ...Array.from(new Set(research.map((r) => r.status)))] as ('ALL' | ResearchStatus)[],
    [research],
  )
  const items = filter === 'ALL' ? research : research.filter((r) => r.status === filter)

  const openProject = (projectId: string) => {
    const project = findProject(bundle, projectId)
    if (project) openDossier({ id: project.id, title: project.title, category: project.category })
  }

  return (
    <div className="space-y-4">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Label>
              <FlaskConical size={13} className="amber-pure" />
              LAB // EXPERIMENTS & RESEARCH
            </Label>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Where the thinking happens.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Not everything here is a finished product. These are open questions, experiments and threads — each one
              traceable back to real project work.
            </p>
          </div>
          <div className="mono flex flex-col gap-1.5 text-[9px] tk text-[var(--dim)]">
            <span className="flex items-center gap-2">
              <Led tone="amber" pulse /> {experiments.length} EXPERIMENTS
            </span>
            <span className="flex items-center gap-2">
              <Led tone="live" /> {research.length} RESEARCH THREADS
            </span>
            <span className="flex items-center gap-2">
              <Led tone="idle" /> {bundle.thoughts.length} NOTES
            </span>
          </div>
        </div>
      </section>

      {/* Experiments — open questions being worked on */}
      <section>
        <div className="mono mb-3 px-1 text-[9px] tk-lg text-[var(--dim)]">EXPERIMENTS</div>
        <div className="grid gap-4 lg:grid-cols-2">
          {experiments.map((entry) => (
            <article key={entry.id} className="panel flex flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="mono text-[8px] tk-lg text-[var(--dim)]">{entry.category}</span>
                <span className="mono flex items-center gap-2 text-[9px] tk text-[var(--muted)]">
                  <Led tone={TONE[entry.status] ?? 'idle'} pulse={entry.status === 'TESTING'} />
                  {entry.status}
                </span>
              </div>

              <h3 className="mt-3.5 text-lg font-semibold leading-snug">{entry.title}</h3>

              <div className="mt-3 flex gap-2 border-l border-[var(--amber-line)] pl-3">
                <HelpCircle size={13} className="mt-0.5 flex-none text-[var(--amber)]" aria-hidden />
                <p className="text-sm leading-6 text-[var(--text)]">{entry.question}</p>
              </div>

              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">{entry.description}</p>

              {entry.state && (
                <p className="mono mt-3 text-[9px] leading-5 text-[var(--dim)]"> STATE // {entry.state}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-4">
                {entry.relatedProjects?.map((pid) => {
                  const project = findProject(bundle, pid)
                  if (!project) return null
                  return (
                    <button
                      key={pid}
                      onClick={() => openDossier({ id: project.id, title: project.title, category: project.category })}
                      className="mono text-[9px] tk amber"
                    >
                      → {project.title.toUpperCase()}
                    </button>
                  )
                })}
                {entry.link && (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mono flex items-center gap-1.5 text-[9px] tk text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    <ExternalLink size={11} /> LINK
                  </a>
                )}
              </div>
            </article>
          ))}
          {!experiments.length && <Empty>No experiments published yet.</Empty>}
        </div>
      </section>

      {/* Research threads */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <span className="mono text-[9px] tk-lg text-[var(--dim)]">RESEARCH THREADS</span>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="chip"
                style={
                  filter === s
                    ? { borderColor: 'var(--amber-line)', color: 'var(--amber-hi)', background: 'var(--amber-wash)' }
                    : undefined
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((r) => (
            <article key={r.id} className="panel flex flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="mono text-[8px] tk-lg text-[var(--dim)]">{r.category}</span>
                <span className="mono flex items-center gap-2 text-[9px] tk text-[var(--muted)]">
                  <Led tone={TONE[r.status as LabStatus] ?? 'idle'} pulse={r.status === 'RESEARCHING' || r.status === 'TESTING'} />
                  {r.status}
                </span>
              </div>

              <h3 className="mt-3.5 text-lg font-semibold leading-snug">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{r.description}</p>

              {r.notes && <p className="mono mt-3 text-[9px] leading-5 text-[var(--dim)]">{r.notes}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {r.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-4">
                {r.relatedProjects?.map((pid) => {
                  const project = findProject(bundle, pid)
                  if (!project) return null
                  return (
                    <button
                      key={pid}
                      onClick={() => openDossier({ id: project.id, title: project.title, category: project.category })}
                      className="mono text-[9px] tk amber"
                    >
                      → {project.title.toUpperCase()}
                    </button>
                  )
                })}
                {r.link && (
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mono flex items-center gap-1.5 text-[9px] tk text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    <ExternalLink size={11} /> LINK
                  </a>
                )}
                {r.paper && (
                  <a
                    href={r.paper}
                    target="_blank"
                    rel="noreferrer"
                    className="mono flex items-center gap-1.5 text-[9px] tk text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    <FileText size={11} /> PAPER
                  </a>
                )}
                {r.date && <span className="mono text-[9px] text-[var(--dim)]">{r.date}</span>}
              </div>
            </article>
          ))}
          {!items.length && <Empty>No research threads match this status yet.</Empty>}
        </div>
      </section>

      {/* Thinking space */}
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>THINKING SPACE</Label>
          <span className="mono text-[9px] text-[var(--dim)]">RESERVED FOR NOTES & ESSAYS</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          The workstation makes room for what Aayush is thinking about, not only what he has shipped. Topics are open;
          entries are added as they are written.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {thoughtTopics.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
        {bundle.thoughts.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {bundle.thoughts.map((t) => (
              <article key={t.id} className="panel-flat p-5">
                <div className="mono text-[8px] tk-lg text-[var(--dim)]">{t.topic}</div>
                <h3 className="mt-2 text-base font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <Empty>
              No notes published yet.
              <button onClick={() => setView('PROJECTS')} className="mono mt-4 block w-full text-[9px] tk amber">
                BROWSE THE BUILT SYSTEMS →
              </button>
            </Empty>
          </div>
        )}
      </section>
    </div>
  )
}
