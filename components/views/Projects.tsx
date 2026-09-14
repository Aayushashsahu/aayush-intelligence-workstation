'use client'

import { useMemo, useState } from 'react'
import { Search, FolderGit2, ChevronRight, Network } from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import { Chip, Empty, Label, Led } from '@/components/ui/Primitives'
import { archiveDossiers } from '@/lib/content'
import type { Project } from '@/lib/types'

export default function Projects() {
  const { github, openDossier, setView } = useWorkstation()
  const bundle = useContent()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')

  const dossiers: Project[] = useMemo(
    () => archiveDossiers(bundle, github?.repos ?? []),
    [bundle, github],
  )

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(dossiers.map((d) => d.category)))],
    [dossiers],
  )

  const filtered = dossiers.filter((d) => {
    const q = query.toLowerCase()
    const hay = `${d.title} ${d.category} ${d.objective} ${d.tags.join(' ')} ${d.techAreas.join(' ')}`.toLowerCase()
    return (!q || hay.includes(q)) && (filter === 'ALL' || d.category === filter)
  })

  return (
    <div className="space-y-4">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Label>
              <FolderGit2 size={13} className="amber-pure" />
              ENGINEERING CASE FILES // SYSTEMS INDEX
            </Label>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Engineered systems, verifiable evidence.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Structured technical case files detailing problem architectures, critical decisions, verification guarantees, and live GitHub telemetry.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setView('MAP')}
              className="btn btn-amber flex items-center gap-1.5"
            >
              <Network size={12} />
              SYSTEM MAP
            </button>
            <div className="flex items-center gap-2 border border-[var(--line)] bg-[rgba(0,0,0,.25)] px-3">
              <Search size={14} className="text-[var(--dim)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search systems…"
                aria-label="Search systems"
                className="w-44 bg-transparent py-2.5 text-xs outline-none placeholder:text-[var(--dim)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="chip"
              style={
                filter === c
                  ? { borderColor: 'var(--amber-line)', color: 'var(--amber-hi)', background: 'var(--amber-wash)' }
                  : undefined
              }
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <button
            key={d.id}
            onClick={() => openDossier({ id: d.id, title: d.title, category: d.category })}
            className="panel group flex flex-col p-5 text-left transition hover:border-[var(--amber-line)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="mono text-[8px] tk-lg text-[var(--dim)]">{d.category}</span>
              <span className="mono flex items-center gap-1.5 text-[8px] tk text-[var(--muted)]">
                <Led tone={d.status === 'ARCHIVED' ? 'idle' : d.status === 'ACTIVE' ? 'live' : 'amber'} />
                {d.status}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold">{d.title}</h3>
            <p className="clamp-2 mt-2 text-xs leading-5 text-[var(--muted)]">{d.objective}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {d.techAreas.slice(0, 3).map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>

            <div className="mono mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 text-[9px] tk">
              <span className="text-[var(--dim)]">{d.problem ? 'CASE FILE' : d.repo ? 'REPO LINKED' : 'DOSSIER'}</span>
              <span className="flex items-center gap-1 text-[var(--amber)]">
                OPEN CASE FILE <ChevronRight size={11} className="transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        ))}
        {!filtered.length && <Empty>No systems match this filter.</Empty>}
      </section>
    </div>
  )
}
