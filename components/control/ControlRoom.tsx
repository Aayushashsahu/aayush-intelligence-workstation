'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Star,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'
import { Chip, Label, Led, Stat } from '@/components/ui/Primitives'
import EntryEditor, { getPath } from '@/components/control/EntryEditor'
import { ADMIN_DOMAINS, SCHEMAS, type AdminDomain } from '@/components/control/schemas'
import type { AdminBundle } from '@/lib/types'

const SINGLETONS: AdminDomain[] = ['profile', 'founder']

/**
 * Turn a failed response into something actionable.
 *
 * The API distinguishes "you are not allowed" (404), "that payload is wrong"
 * (400) and "writes need a datastore" (503). Collapsing those into one generic
 * failure would hide the only useful information — what to fix.
 */
async function failureReason(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (res.status === 503) return 'STORAGE NOT CONFIGURED'
    if (body?.error) return String(body.error).replace(/_/g, ' ').toUpperCase()
  } catch {
    // non-JSON body; fall through to the caller's fallback label
  }
  return fallback
}

export default function ControlRoom({
  initial,
  ownerLogin,
}: {
  initial: AdminBundle
  ownerLogin: string
}) {
  const [data, setData] = useState<AdminBundle>(initial)
  const [domain, setDomain] = useState<AdminDomain>('projects')
  const [editing, setEditing] = useState<{ value: Record<string, any> } | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [system, setSystem] = useState<any>(null)

  const flash = (message: string) => {
    setNote(message)
    setTimeout(() => setNote(''), 2600)
  }

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } catch {
      flash('RELOAD FAILED')
    }
  }, [])

  const entriesFor = useCallback(
    (d: AdminDomain): any[] => {
      if (d === 'profile') return [data.published.profile]
      if (d === 'founder') return [data.published.founder]
      const published = ((data.published as any)[d] || []) as any[]
      const drafts = ((data.drafts as any)[d] || []) as any[]
      const seen = new Set(published.map((e) => e.id))
      return [...published, ...drafts.filter((e) => !seen.has(e.id))]
    },
    [data],
  )

  const schema = SCHEMAS[domain]
  const rows = entriesFor(domain)
  const isSingleton = SINGLETONS.includes(domain)

  /* --- writes ------------------------------------------------------------ */

  const save = async (value: Record<string, any>) => {
    setBusy(true)
    try {
      const isEdit = Boolean(value?.id)
      const payload = isEdit
        ? { type: domain, id: value.id, patch: value }
        : { type: domain, data: value }
      const res = await fetch('/api/admin/content', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        flash(await failureReason(res, 'WRITE FAILED'))
        return
      }
      flash(isEdit ? 'ENTRY UPDATED' : 'ENTRY CREATED')
      setEditing(null)
      await reload()
    } catch {
      flash('WRITE FAILED')
    } finally {
      setBusy(false)
    }
  }

  const patch = async (id: string, changes: Record<string, any>, message: string) => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: domain, id, patch: changes }),
      })
      if (!res.ok) {
        flash(await failureReason(res, 'WRITE FAILED'))
        return
      }
      flash(message)
      await reload()
    } catch {
      flash('WRITE FAILED')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this entry? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: domain, id }),
      })
      if (!res.ok) {
        flash(await failureReason(res, 'DELETE FAILED'))
        return
      }
      flash('ENTRY DELETED')
      await reload()
    } catch {
      flash('DELETE FAILED')
    } finally {
      setBusy(false)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const ids = rows.map((r) => r.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    setBusy(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: domain, ids }),
      })
      if (!res.ok) {
        flash(await failureReason(res, 'REORDER FAILED'))
        return
      }
      flash('ORDER UPDATED')
      await reload()
    } catch {
      flash('REORDER FAILED')
    } finally {
      setBusy(false)
    }
  }

  const systemAction = async (action: 'sync' | 'revalidate') => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const result = await res.json()
      flash(res.ok ? `${action.toUpperCase()} OK` : `${action.toUpperCase()} FAILED`)
      setSystem((prev: any) => ({ ...(prev || {}), lastAction: { action, result } }))
    } catch {
      flash(`${action.toUpperCase()} FAILED`)
    } finally {
      setBusy(false)
    }
  }

  const loadSystem = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/system', { cache: 'no-store' })
      if (res.ok) setSystem(await res.json())
    } catch {
      flash('STATUS UNAVAILABLE')
    }
  }, [])

  useEffect(() => {
    loadSystem()
  }, [loadSystem])

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const heading = (row: any) => String(getPath(row, schema.titleKey) ?? row?.id ?? 'ENTRY')
  const subheading = (row: any) => String(getPath(row, schema.subtitleKey) ?? '')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Label>CONTROL ROOM // OWNER ONLY</Label>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Curated content &amp; system control.</h1>
            <p className="mono mt-2 text-[9px] tk text-[var(--dim)]">
              AUTHENTICATED AS {ownerLogin.toUpperCase()} · STORAGE // {data.storage.toUpperCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {note && <span className="mono text-[9px] tk amber">{note}</span>}
            <button onClick={signOut} className="btn">
              <LogOut size={11} /> SIGN OUT
            </button>
          </div>
        </div>
      </div>

      {/* Domain tabs */}
      <div className="flex flex-wrap gap-2">
        {ADMIN_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => {
              setDomain(d)
              setEditing(null)
            }}
            className="chip"
            style={
              domain === d
                ? { borderColor: 'var(--amber-line)', color: 'var(--amber-hi)', background: 'var(--amber-wash)' }
                : undefined
            }
          >
            {SCHEMAS[d].label}
            <span className="opacity-60">{entriesFor(d).length}</span>
          </button>
        ))}
        <button
          onClick={() => setDomain('system' as unknown as AdminDomain)}
          className="chip"
          style={
            (domain as string) === 'system'
              ? { borderColor: 'var(--amber-line)', color: 'var(--amber-hi)', background: 'var(--amber-wash)' }
              : undefined
          }
        >
          SYSTEM
        </button>
      </div>

      {((domain as string) === 'system') ? (
        <SystemTab system={system} counts={data.counts} storage={data.storage} onSync={() => systemAction('sync')} onRebuild={() => systemAction('revalidate')} busy={busy} />
      ) : editing ? (
        <EntryEditor
          domain={domain}
          value={editing.value}
          saving={busy}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <div className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="mono text-[9px] tk-lg text-[var(--dim)]">
                {schema.label} {'//'} {rows.length} ENTRIES
              </span>
              <div className="flex flex-wrap gap-2">
                <button onClick={reload} className="btn">
                  <RefreshCw size={11} /> RELOAD
                </button>
                {!isSingleton && (
                  <button onClick={() => setEditing({ value: { published: true, tags: [] } })} className="btn btn-amber">
                    <Plus size={11} /> NEW {schema.singular}
                  </button>
                )}
                {isSingleton && (
                  <button onClick={() => setEditing({ value: { ...rows[0] } })} className="btn btn-amber">
                    <Pencil size={11} /> EDIT {schema.singular}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((row, index) => {
              const published = row?.published !== false
              return (
                <div key={row?.id || index} className="panel flex flex-wrap items-center gap-3 p-4">
                  <span className="mono w-6 flex-none text-[9px] text-[var(--dim)]">{String(index + 1).padStart(2, '0')}</span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{heading(row)}</span>
                      {!published && <Chip amber>DRAFT</Chip>}
                      {row?.featured && <Chip amber>FEATURED</Chip>}
                      {!isSingleton && (
                        <span className="mono text-[8px] tk text-[var(--dim)]">{row?.id}</span>
                      )}
                    </span>
                    {subheading(row) && (
                      <span className="mono mt-0.5 block truncate text-[9px] tk text-[var(--dim)]">{subheading(row)}</span>
                    )}
                  </span>

                  <span className="flex flex-none flex-wrap items-center gap-1">
                    {!isSingleton && (
                      <>
                        <IconButton
                          label={`Move ${heading(row)} up`}
                          disabled={busy || index === 0}
                          onClick={() => move(index, -1)}
                        >
                          <ArrowUp size={12} />
                        </IconButton>
                        <IconButton
                          label={`Move ${heading(row)} down`}
                          disabled={busy || index === rows.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <ArrowDown size={12} />
                        </IconButton>
                        <IconButton
                          label={published ? `Unpublish ${heading(row)}` : `Publish ${heading(row)}`}
                          disabled={busy}
                          onClick={() => patch(row.id, { published: !published }, published ? 'UNPUBLISHED' : 'PUBLISHED')}
                        >
                          {published ? <EyeOff size={12} /> : <Eye size={12} />}
                        </IconButton>
                        {domain === 'projects' && (
                          <IconButton
                            label={`${row?.featured ? 'Unfeature' : 'Feature'} ${heading(row)}`}
                            disabled={busy}
                            onClick={() => patch(row.id, { featured: !row?.featured }, row?.featured ? 'UNFEATURED' : 'FEATURED')}
                          >
                            <Star size={12} />
                          </IconButton>
                        )}
                      </>
                    )}
                    <IconButton
                      label={`Edit ${heading(row)}`}
                      disabled={busy}
                      onClick={() => setEditing({ value: { ...row } })}
                    >
                      <Pencil size={12} />
                    </IconButton>
                    {!isSingleton && (
                      <IconButton label={`Delete ${heading(row)}`} disabled={busy} onClick={() => remove(row.id)}>
                        <Trash2 size={12} />
                      </IconButton>
                    )}
                  </span>
                </div>
              )
            })}

            {!rows.length && (
              <div className="panel-flat p-8 text-center text-xs text-[var(--dim)]">
                No entries in this domain yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center border border-[var(--line)] text-[var(--dim)] transition hover:border-[var(--line-2)] hover:text-[var(--text)] disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function SystemTab({
  system,
  counts,
  storage,
  onSync,
  onRebuild,
  busy,
}: {
  system: any
  counts: any
  storage: string
  onSync: () => void
  onRebuild: () => void
  busy: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <Label>GITHUB</Label>
          <div className="mono mt-4 space-y-2 text-[10px] tk text-[var(--dim)]">
            <Row label="USERNAME" value={system?.github?.username ?? '—'} />
            <Row
              label="TOKEN"
              value={system?.github?.tokenConfigured ? 'CONFIGURED (EXACT CALENDAR)' : 'NOT SET (EVENTS FALLBACK)'}
            />
            <Row label="OAUTH OWNER" value={(system?.github?.oauthOwner || '—').toUpperCase()} />
          </div>
          <button onClick={onSync} disabled={busy} className="btn btn-amber mt-4 w-full justify-center">
            <RefreshCw size={12} /> GITHUB SYNC
          </button>
          {system?.lastAction?.action === 'sync' && (
            <p className="mono mt-3 text-[9px] tk text-[var(--muted)]">
              {JSON.stringify(system.lastAction.result).slice(0, 160)}
            </p>
          )}
        </div>

        <div className="panel p-5">
          <Label>CONTENT STORE</Label>
          <div className="mono mt-4 space-y-2 text-[10px] tk text-[var(--dim)]">
            <Row label="BACKEND" value={storage === 'mongodb' ? 'MONGODB ATLAS' : 'SEED FALLBACK'} />
            <Row label="CONFIGURED" value={system?.storage?.configured ? 'YES' : 'NO'} />
            <Row label="REACHABLE" value={system?.storage?.reachable ? 'YES' : 'NO'} />
          </div>
          {system?.storage?.error && (
            <p className="mono mt-3 break-words text-[9px] leading-5 text-[var(--danger)]">{system.storage.error}</p>
          )}
          <button onClick={onRebuild} disabled={busy} className="btn mt-4 w-full justify-center">
            <RotateCcw size={12} /> REBUILD INDEX
          </button>
        </div>
      </div>

      <div className="panel p-5">
        <Label>CONTENT COUNTS</Label>
        <div className="mt-5 grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          <Stat label="Projects" value={counts?.projects ?? 0} tone="amber" />
          <Stat label="Research" value={counts?.research ?? 0} />
          <Stat label="Lab entries" value={counts?.lab ?? 0} />
          <Stat label="Security cases" value={counts?.security ?? 0} />
          <Stat label="Notes" value={counts?.thoughts ?? 0} />
          <Stat label="Milestones" value={counts?.milestones ?? 0} />
          <Stat label="Repos bound" value={counts?.curatedRepos ?? 0} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
          <Chip>WRITES VERIFIED SERVER-SIDE</Chip>
          <Chip>DRAFTS NEVER PUBLIC</Chip>
          {system?.authConfigured ? <Chip amber>AUTH CONFIGURED</Chip> : <Chip>SEED MODE</Chip>}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-2">
      <span>{label}</span>
      <span className="flex items-center gap-2 text-[var(--muted)]">
        <Led tone="live" /> {value}
      </span>
    </div>
  )
}
