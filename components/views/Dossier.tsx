'use client'

import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Field, Label, Led } from '@/components/ui/Primitives'
import { findProject, relatedLab, relatedResearch, timelineFor } from '@/lib/content'
import type { Project, TimelineModel } from '@/lib/types'

const BUILD_STAGES = ['IDEA', 'PROTOTYPE', 'BUILD', 'TEST', 'SHIP']
const RESEARCH_STAGES = ['DISCOVERY', 'COLLECTION', 'ANALYSIS', 'VALIDATION', 'CONCLUSION']

function stageIndex(status: Project['status']): number {
  const map: Record<Project['status'], number> = {
    EXPERIMENT: 0,
    PROTOTYPE: 1,
    ACTIVE: 2,
    MAINTAINED: 2,
    SHIPPED: 4,
    ARCHIVED: 4,
  }
  return map[status] ?? 2
}

export default function Dossier({ projectId }: { projectId: string }) {
  const { github, openDossier } = useWorkstation()
  const bundle = useContent()
  const project = findProject(bundle, projectId)

  if (!project) {
    return <p className="text-sm text-[var(--dim)]">Dossier not found. It may have been renamed or unpublished.</p>
  }

  const repo = github?.repos?.find((r) => r.name === project.repo)
  const labels: string[] = project.timeline === 'RESEARCH' ? RESEARCH_STAGES : BUILD_STAGES
  const active = stageIndex(project.status)
  const related = relatedResearch(bundle, project.id)
  const lab = relatedLab(bundle, project.id)
  const milestones = timelineFor(bundle, project, repo)
  const others = bundle.projects.filter((p) => p.id !== project.id).slice(0, 4)

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="mono text-[9px] tk-lg text-[var(--amber)]">{project.category}</span>
          <span className="mono flex items-center gap-2 text-[9px] tk text-[var(--muted)]">
            <Led tone={project.status === 'ARCHIVED' ? 'idle' : 'live'} />
            STATUS // {project.status}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{project.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="mono text-[9px] tk text-[var(--dim)]">
            SYSTEM ID // {(project.repo || project.id).toUpperCase()}
          </p>
          {project.provenance?.map((prov, i) => (
            <span key={i} className="mono text-[8px] px-2 py-0.5 border border-[var(--line)] text-[var(--dim)] bg-[var(--surface-2)]">
              {prov}
            </span>
          ))}
        </div>
      </header>

      {/* Case File: Problem & Core Question */}
      {(project.problem || project.question) && (
        <section className="panel p-5 border-l-2 border-l-[var(--amber)]">
          {project.problem && (
            <div>
              <Label>THE PROBLEM</Label>
              <p className="mt-2 text-sm leading-6 text-[var(--text)]">{project.problem}</p>
            </div>
          )}
          {project.question && (
            <div className={project.problem ? 'mt-4 pt-4 border-t border-[var(--line)]' : ''}>
              <span className="mono text-[9px] tk-lg text-[var(--amber)]">CORE QUESTION TESTED</span>
              <p className="mt-1 text-sm font-medium leading-6 text-[var(--amber-hi)]">{project.question}</p>
            </div>
          )}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="OBJECTIVE">{project.objective}</Field>
        <Field label="WHY IT EXISTS">{project.why}</Field>
      </div>

      {/* Engineering Approach */}
      {project.approach && (
        <section>
          <Label>ENGINEERING APPROACH</Label>
          <div className="panel-flat p-4 mt-2 text-sm leading-6 text-[var(--muted)]">
            {project.approach}
          </div>
        </section>
      )}

      {/* Key Architectural Decisions */}
      {project.keyDecisions && project.keyDecisions.length > 0 && (
        <section>
          <Label>KEY ARCHITECTURAL DECISIONS</Label>
          <div className="mt-3 space-y-2.5">
            {project.keyDecisions.map((decision, i) => (
              <div key={i} className="panel p-3.5 flex gap-3.5 items-start">
                <span className="mono text-[10px] text-[var(--amber)] font-bold">0{i + 1}</span>
                <p className="text-xs leading-5 text-[var(--muted)]">{decision}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.evidence.length > 0 && (
        <section>
          <Label>EVIDENCE & VERIFICATION</Label>
          <ul className="mt-3 space-y-2">
            {project.evidence.map((e, i) => (
              <li key={i} className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
                <span className="mono flex-none text-[10px] text-[var(--amber)]">{String(i + 1).padStart(2, '0')}</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.architecture.length > 0 && (
        <section>
          <Label>ARCHITECTURE PIPELINE</Label>
          <div className="mt-3 space-y-2">
            {project.architecture.map((a, i) => (
              <div key={i} className="panel-flat mono p-3 text-[11px] leading-6 text-[var(--muted)]">
                {a}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tradeoffs & Deliberate Constraints */}
      {project.tradeoffs && project.tradeoffs.length > 0 && (
        <section>
          <Label>DELIBERATE TRADEOFFS & BOUNDARIES</Label>
          <ul className="mt-3 space-y-2">
            {project.tradeoffs.map((t, i) => (
              <li key={i} className="panel-flat p-3 text-xs leading-5 text-[var(--muted)] flex gap-2.5 items-start">
                <span className="text-[var(--amber)] text-[10px] mt-0.5">▲</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <Label>TECHNICAL AREAS</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.techAreas.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          {!project.techAreas.length && <span className="text-xs text-[var(--dim)]">Not yet catalogued.</span>}
        </div>
      </section>

      {/* Qualitative stage chain */}
      <section>
        <Label>STAGE // {project.timeline === 'RESEARCH' ? 'RESEARCH MODEL' : 'BUILD MODEL'}</Label>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {labels.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className={`mono border px-2.5 py-1.5 text-[9px] tk ${
                  i === active
                    ? 'border-[var(--amber-line)] bg-[var(--amber-wash)] text-[var(--amber-hi)]'
                    : i < active
                      ? 'border-[var(--line)] text-[var(--muted)]'
                      : 'border-[var(--line)] text-[var(--dim)]'
                }`}
              >
                {s}
              </span>
              {i < labels.length - 1 && <ChevronRight size={11} className="text-[var(--line-2)]" />}
            </span>
          ))}
        </div>
      </section>

      {/* Timeline: authored milestones + GitHub-derived telemetry */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>TIMELINE</Label>
          <span className="mono text-[8px] tk text-[var(--dim)]">
            {milestones.filter((m) => m.source === 'github').length} TELEMETRY POINTS
          </span>
        </div>

        {milestones.length ? (
          <ol className="mt-4 space-y-3">
            {milestones.map((m) => (
              <li key={m.id} className="flex gap-4">
                <div className="mono w-[86px] flex-none pt-0.5 text-[9px] tk text-[var(--dim)]">
                  {m.date ? new Date(m.date).toLocaleDateString('en-GB') : 'UNDATED'}
                </div>
                <div className="min-w-0 flex-1 border-l border-[var(--line)] pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{m.title}</span>
                    {m.kind && <Chip>{m.kind}</Chip>}
                    <Chip amber={m.source === 'manual'}>{m.source === 'github' ? 'TELEMETRY' : 'MANUAL'}</Chip>
                  </div>
                  {m.description && <p className="mt-1 text-xs leading-5 text-[var(--dim)]">{m.description}</p>}
                  {m.link && (
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mono mt-1 inline-flex items-center gap-1.5 text-[9px] tk text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      REFERENCE <ArrowUpRight size={10} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-xs leading-6 text-[var(--dim)]">
            No timeline entries yet. Repository-derived points appear automatically once this dossier is
            bound to a repository.
          </p>
        )}
      </section>

      {/* Media / links */}
      {(project.media?.length || project.links?.length) && (
        <section>
          <Label>MEDIA & LINKS</Label>
          {project.media && project.media.length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {project.media.map((m, i) =>
                m.kind === 'image' ? (
                  <figure key={i} className="panel-flat overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt || `${project.title} media`} className="w-full" loading="lazy" />
                    {m.alt && (
                      <figcaption className="mono px-3 py-2 text-[9px] tk text-[var(--dim)]">{m.alt}</figcaption>
                    )}
                  </figure>
                ) : (
                  <a
                    key={i}
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="panel-flat mono flex items-center justify-between p-3 text-[10px] tk text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    {m.alt || m.url}
                    <ArrowUpRight size={11} />
                  </a>
                ),
              )}
            </div>
          )}
          {project.links && project.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {project.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="chip hover:text-[var(--text)]"
                >
                  {link.label} <ArrowUpRight size={10} />
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Live repository telemetry */}
      <section className="panel-flat p-4">
        <Label>REPOSITORY</Label>
        {repo ? (
          <div className="mt-3">
            <div className="mono grid grid-cols-2 gap-3 text-[10px] tk text-[var(--muted)] sm:grid-cols-4">
              <span>★ {repo.stargazers_count}</span>
              <span>{repo.language || 'MULTI'}</span>
              <span>UPDATED {new Date(repo.updated_at).toLocaleDateString('en-GB')}</span>
              <span>{repo.archived ? 'ARCHIVED' : 'LIVE'}</span>
            </div>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="mono mt-4 inline-flex items-center gap-2 text-[9px] tk amber"
            >
              OPEN REPOSITORY <ArrowUpRight size={12} />
            </a>
          </div>
        ) : project.link ? (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="mono mt-3 inline-flex items-center gap-2 text-[9px] tk amber"
          >
            EXTERNAL REFERENCE <ArrowUpRight size={12} />
          </a>
        ) : (
          <p className="mt-3 text-xs text-[var(--dim)]">
            {project.repo
              ? 'Repository not present in the live index — it may be private, renamed or archived.'
              : 'No public repository bound to this dossier.'}
          </p>
        )}
      </section>

      {(related.length > 0 || lab.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {related.length > 0 && (
            <div>
              <Label>RELATED RESEARCH</Label>
              <div className="mt-3 space-y-2">
                {related.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 border border-[var(--line)] px-3 py-2.5">
                    <span className="text-xs text-[var(--muted)]">{r.title}</span>
                    <span className="mono flex-none text-[8px] tk text-[var(--dim)]">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lab.length > 0 && (
            <div>
              <Label>RELATED EXPERIMENTS</Label>
              <div className="mt-3 space-y-2">
                {lab.map((l) => (
                  <div key={l.id} className="border border-[var(--line)] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[var(--muted)]">{l.title}</span>
                      <span className="mono flex-none text-[8px] tk text-[var(--dim)]">{l.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-[var(--dim)]">{l.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <Label>OTHER SYSTEMS</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((p) => (
            <button
              key={p.id}
              onClick={() => openDossier({ id: p.id, title: p.title, category: p.category })}
              className="chip hover:text-[var(--text)]"
            >
              {p.title}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
