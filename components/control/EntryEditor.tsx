'use client'

import { useState } from 'react'
import { SCHEMAS, type FieldDef } from '@/components/control/schemas'

/* -------------------------------------------------------------------------- */
/* path helpers                                                               */
/* -------------------------------------------------------------------------- */

export function getPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function setPath(obj: any, path: string, value: any) {
  const keys = path.split('.')
  const clone = { ...(obj || {}) }
  let cursor = clone
  for (let i = 0; i < keys.length - 1; i += 1) {
    cursor[keys[i]] = { ...(cursor[keys[i]] || {}) }
    cursor = cursor[keys[i]]
  }
  cursor[keys[keys.length - 1]] = value
  return clone
}

/* -------------------------------------------------------------------------- */
/* value <-> text conversions                                                 */
/* -------------------------------------------------------------------------- */

const listToText = (value: unknown) => (Array.isArray(value) ? value.join('\n') : '')
const textToList = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const tagsToText = (value: unknown) => (Array.isArray(value) ? value.join(', ') : '')
const textToTags = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

function pairsToText(value: unknown, keys: string[]): string {
  if (!Array.isArray(value)) return ''
  return value
    .map((item: any) => keys.map((k) => String(item?.[k] ?? '')).join('|'))
    .join('\n')
}

function textToPairs(text: string, keys: string[]) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((s) => s.trim())
      const obj: Record<string, string> = {}
      keys.forEach((key, i) => {
        if (parts[i]) obj[key] = parts[i]
      })
      return obj
    })
}

/* -------------------------------------------------------------------------- */
/* editor                                                                     */
/* -------------------------------------------------------------------------- */

export default function EntryEditor({
  domain,
  value,
  saving,
  onSave,
  onCancel,
}: {
  domain: string
  value: Record<string, any>
  saving?: boolean
  onSave: (next: Record<string, any>) => void
  onCancel: () => void
}) {
  const schema = SCHEMAS[domain]
  const [draft, setDraft] = useState<Record<string, any>>(() => ({ ...value }))

  if (!schema) return <p className="text-xs text-[var(--dim)]">No schema for “{domain}”.</p>

  const update = (path: string, next: any) => setDraft((prev) => setPath(prev, path, next))

  const renderField = (field: FieldDef) => {
    const raw = getPath(draft, field.key)

    const label = (
      <span className="mono block text-[8px] tk-lg text-[var(--dim)]">
        {field.label.toUpperCase()}
        {field.help && <span className="ml-2 normal-case tracking-normal text-[var(--dim)] opacity-70">{field.help}</span>}
      </span>
    )

    const inputClass =
      'mt-1.5 w-full border border-[var(--line)] bg-[rgba(0,0,0,.28)] px-3 py-2 text-xs outline-none focus:border-[var(--amber-line)]'

    if (field.kind === 'boolean') {
      return (
        <label key={field.key} className={`flex items-start gap-3 ${field.wide ? 'md:col-span-2' : ''}`}>
          <input
            type="checkbox"
            checked={raw !== false}
            onChange={(e) => update(field.key, e.target.checked)}
            className="mt-1 accent-[var(--amber)]"
          />
          <span>
            <span className="mono block text-[8px] tk-lg text-[var(--dim)]">{field.label.toUpperCase()}</span>
            {field.help && <span className="mt-0.5 block text-[10px] leading-4 text-[var(--dim)]">{field.help}</span>}
          </span>
        </label>
      )
    }

    return (
      <div key={field.key} className={field.wide ? 'md:col-span-2' : ''}>
        {label}
        {field.kind === 'textarea' && (
          <textarea
            value={raw ?? ''}
            onChange={(e) => update(field.key, e.target.value)}
            rows={3}
            className={inputClass}
          />
        )}
        {field.kind === 'list' && (
          <textarea
            value={listToText(raw)}
            onChange={(e) => update(field.key, textToList(e.target.value))}
            rows={3}
            className={inputClass}
          />
        )}
        {field.kind === 'tags' && (
          <input value={tagsToText(raw)} onChange={(e) => update(field.key, textToTags(e.target.value))} className={inputClass} />
        )}
        {field.kind === 'pairs' && (
          <textarea
            value={pairsToText(raw, field.pairKeys || [])}
            onChange={(e) => update(field.key, textToPairs(e.target.value, field.pairKeys || []))}
            rows={3}
            className={inputClass}
          />
        )}
        {field.kind === 'select' && (
          <select
            value={raw ?? ''}
            onChange={(e) => update(field.key, e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        {field.kind === 'date' && (
          <input
            type="date"
            value={raw ? String(raw).slice(0, 10) : ''}
            onChange={(e) => update(field.key, e.target.value || null)}
            className={inputClass}
          />
        )}
        {(field.kind === 'text' || field.kind === 'url') && (
          <input value={raw ?? ''} onChange={(e) => update(field.key, e.target.value)} className={inputClass} />
        )}
      </div>
    )
  }

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="mono text-[9px] tk-lg text-[var(--amber)]">
          {value?.id ? `EDIT // ${schema.singular}` : `NEW // ${schema.singular}`}
        </span>
        <span className="mono text-[9px] tk text-[var(--dim)]">
          {schema.fields.length} FIELDS
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSave(draft)
        }}
        className="mt-5"
      >
        <div className="grid gap-4 md:grid-cols-2">{schema.fields.map(renderField)}</div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
          <button type="submit" disabled={saving} className="btn btn-amber">
            {saving ? 'SAVING…' : 'SAVE'}
          </button>
          <button type="button" onClick={onCancel} className="btn">
            CANCEL
          </button>
        </div>
      </form>
    </div>
  )
}
