'use client'

import { ShieldCheck, ChevronRight, ExternalLink } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Field, Label, Led } from '@/components/ui/Primitives'
import { findProject } from '@/lib/content'
import { securityDepthAreas } from '@/lib/taxonomy'

export default function Security() {
  const { openDossier } = useWorkstation()
  const bundle = useContent()
  const cases = bundle.security

  return (
    <div className="space-y-4">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <Label>
              <ShieldCheck size={13} className="amber-pure" />
              SECURITY // DEPTH, NOT POSTURE
            </Label>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Technical depth, quietly held.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Cybersecurity and digital forensics are supporting specialisms here, not the headline. What matters is that
              security thinking — trust boundaries, evidence, failure modes — runs through the AI and product work too.
            </p>
          </div>
          <div className="mono flex flex-col gap-1.5 text-[9px] tk text-[var(--dim)]">
            <span className="flex items-center gap-2">
              <Led tone="live" /> {cases.length} SECURITY CASES
            </span>
            <span className="flex items-center gap-2">
              <Led tone="amber" /> EVIDENCE-FIRST METHOD
            </span>
          </div>
        </div>

        <div className="mt-7 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {securityDepthAreas.map((p) => (
            <Field key={p.title} label={p.title}>
              {p.text}
            </Field>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {cases.map((c) => {
          const project = c.projectId ? findProject(bundle, c.projectId) : undefined
          return (
            <article key={c.id} className="panel flex flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="mono text-[8px] tk-lg text-[var(--dim)]">CASE // {c.category}</span>
                <span className="mono flex items-center gap-2 text-[9px] tk text-[var(--muted)]">
                  <Led tone={c.status === 'ACTIVE' ? 'live' : c.status === 'INVESTIGATION' ? 'amber' : 'idle'} />
                  {c.status}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{c.description}</p>

              {c.findings.length > 0 && (
                <div className="mt-4">
                  <div className="mono text-[8px] tk-lg text-[var(--amber)]">FINDINGS</div>
                  <ul className="mt-2 space-y-1.5">
                    {c.findings.map((f, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-5 text-[var(--muted)]">
                        <span className="text-[var(--line-2)]">—</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.evidence.length > 0 && (
                <div className="mt-4">
                  <div className="mono text-[8px] tk-lg text-[var(--dim)]">EVIDENCE</div>
                  <ul className="mt-2 space-y-1.5">
                    {c.evidence.map((e, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-5 text-[var(--dim)]">
                        <span className="text-[var(--line-2)]">—</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>

              {c.references.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {c.references.map((ref, i) => (
                    <a
                      key={i}
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mono flex items-center gap-1.5 text-[9px] tk text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      <ExternalLink size={11} /> {ref.label.toUpperCase()}
                    </a>
                  ))}
                </div>
              )}

              {project && (
                <button
                  onClick={() => openDossier({ id: project.id, title: project.title, category: project.category })}
                  className="mono mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-4 text-left text-[9px] tk amber"
                >
                  OPEN FULL CASE DOSSIER <ChevronRight size={11} />
                </button>
              )}
            </article>
          )
        })}
        {!cases.length && (
          <div className="panel-flat p-8 text-center text-xs text-[var(--dim)] lg:col-span-2">
            No security cases published yet.
          </div>
        )}
      </section>
    </div>
  )
}
