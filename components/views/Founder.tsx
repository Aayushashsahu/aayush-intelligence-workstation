'use client'

import { Rocket, ArrowUpRight } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Field, Label, Led } from '@/components/ui/Primitives'
import { featuredProjects, findProject } from '@/lib/content'

export default function Founder() {
  const { openDossier, setView } = useWorkstation()
  const bundle = useContent()
  const profile = bundle.profile
  const founder = bundle.founder
  const company = founder.company

  const thinking = founder.currentProjects.length
    ? (founder.currentProjects.map((id) => findProject(bundle, id)).filter(Boolean) as ReturnType<
        typeof featuredProjects
      >)
    : featuredProjects(bundle)

  return (
    <div className="space-y-4">
      <section className="panel relative overflow-hidden p-6 md:p-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,138,43,.13), transparent 68%)' }}
        />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <Label>
              <Rocket size={13} className="amber-pure" />
              FOUNDER HQ
            </Label>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.03em] md:text-6xl">
              BUILD.
              <br />
              <span className="amber">INVESTIGATE.</span>
              <br />
              SHIP.
            </h2>
            <p className="mt-6 text-base leading-7 text-[var(--muted)]">{profile.summary}</p>
          </div>
          <div className="panel-flat min-w-[220px] p-4">
            <div className="mono flex items-center justify-between text-[8px] tk-lg text-[var(--dim)]">
              <span>CURRENT COMPANY</span>
              <Led tone="amber" pulse />
            </div>
            <div className="mt-2 text-lg font-semibold">{company.name}</div>
            <div className="mono mt-1 text-[9px] tk text-[var(--muted)]">
              {company.role} · {company.status}
            </div>
            <div className="mono mt-3 border-t border-[var(--line)] pt-3 text-[9px] tk text-[var(--dim)]">
              {company.verified ? 'DETAIL VERIFIED' : 'DETAIL PENDING FOUNDER INPUT'}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-6">
          <Label>WHAT I&apos;M BUILDING</Label>
          <div className="mt-4 space-y-3">
            {company.building.map((b, i) => (
              <p key={i} className="text-sm leading-6 text-[var(--muted)]">
                {b}
              </p>
            ))}
          </div>

          {!company.verified && founder.needsInput.length > 0 && (
            <div className="mt-5 border border-[var(--amber-line)] bg-[var(--amber-wash)] p-4">
              <div className="mono text-[8px] tk-lg text-[var(--amber)]">AWAITING DETAIL</div>
              <ul className="mt-2 space-y-1.5">
                {founder.needsInput.map((n, i) => (
                  <li key={i} className="text-xs leading-5 text-[var(--muted)]">
                    — {n}
                  </li>
                ))}
              </ul>
              <p className="mono mt-3 text-[9px] leading-5 text-[var(--dim)]">
                This workstation does not fabricate founder claims. Fields with no verified source stay empty rather than guessed.
              </p>
            </div>
          )}

          {founder.productNotes.length > 0 && (
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <Label>PRODUCT NOTES</Label>
              <div className="mt-4 space-y-3">
                {founder.productNotes.map((note) => (
                  <div key={note.id} className="panel-flat p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold">{note.title}</span>
                      {note.date && <span className="mono text-[9px] text-[var(--dim)]">{note.date}</span>}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{note.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel p-6">
          <Label>WHAT I&apos;M EXPLORING</Label>
          <div className="mt-4 space-y-4">
            {founder.exploring.map((e, i) => (
              <div key={i} className="flex gap-3">
                <span className="mono flex-none text-[10px] text-[var(--amber)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm leading-6 text-[var(--muted)]">{e}</span>
              </div>
            ))}
          </div>

          {founder.principles.length > 0 && (
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <Label>OPERATING PRINCIPLES</Label>
              <div className="mt-4 space-y-3">
                {founder.principles.map((p) => (
                  <div key={p.title} className="border-l border-[var(--amber-line)] pl-3">
                    <div className="mono text-[9px] tk-lg text-[var(--amber)]">{p.title}</div>
                    <p className="mt-1 text-xs leading-5 text-[var(--dim)]">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-6">
          <Label>CURRENT FOCUS</Label>
          <div className="mt-4 space-y-3">
            {founder.focus.map((f, i) => (
              <Field key={i} label={`FOCUS ${String(i + 1).padStart(2, '0')}`}>
                {f}
              </Field>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <Label>PROJECTS THAT REPRESENT MY THINKING</Label>
          <div className="mt-4 space-y-2">
            {thinking.map((p) => (
              <button
                key={p.id}
                onClick={() => openDossier({ id: p.id, title: p.title, category: p.category })}
                className="panel-flat flex w-full items-center justify-between gap-4 p-4 text-left transition hover:border-[var(--amber-line)]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{p.title}</span>
                  <span className="mono block truncate text-[9px] tk text-[var(--dim)]">{p.category}</span>
                </span>
                <ArrowUpRight size={13} className="flex-none text-[var(--dim)]" />
              </button>
            ))}
          </div>
          <button onClick={() => setView('CORTEX')} className="btn btn-amber mt-5 w-full justify-center">
            ASK CORTEX ABOUT THE FOUNDER WORK
          </button>
        </div>
      </section>

      <section className="panel p-6">
        <Label>EVOLVING IDENTITY</Label>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mono text-[8px] tk-lg text-[var(--amber)]">PRIMARY</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.positioning.map((p) => (
                <Chip key={p} amber>
                  {p}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="mono text-[8px] tk-lg text-[var(--dim)]">SECONDARY TECHNICAL DIMENSIONS</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.secondary.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
          {profile.disciplines.map((d) => (
            <span key={d} className="mono text-[9px] tk text-[var(--dim)]">
              {d.toUpperCase()}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
