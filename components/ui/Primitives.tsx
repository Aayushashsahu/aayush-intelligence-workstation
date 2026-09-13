import type { ReactNode } from 'react'

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="mono flex items-center gap-2 text-[9px] tk-lg uppercase text-[var(--dim)]">{children}</div>
  )
}

export function Led({ tone = 'live', pulse = false }: { tone?: 'live' | 'amber' | 'danger' | 'idle'; pulse?: boolean }) {
  const cls =
    tone === 'amber' ? 'led led-amber' : tone === 'danger' ? 'led led-danger' : tone === 'idle' ? 'led led-idle' : 'led'
  return <span aria-hidden className={`${cls}${pulse ? ' led-pulse' : ''}`} />
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: 'amber' }) {
  return (
    <div>
      <div className="mono text-[8px] tk-lg uppercase text-[var(--dim)]">{label}</div>
      <div className={`mono mt-1 text-lg font-medium ${tone === 'amber' ? 'amber' : ''}`}>{value}</div>
    </div>
  )
}

export function Chip({ children, amber = false }: { children: ReactNode; amber?: boolean }) {
  return <span className={`chip${amber ? ' chip-amber' : ''}`}>{children}</span>
}

export function Bar({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={`progress-track ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mono mb-1.5 flex items-center justify-between text-[9px] tk uppercase text-[var(--dim)]">
        <span>{label}</span>
        <span className="amber">{Math.round(Math.max(0, Math.min(100, value)))}%</span>
      </div>
      <Bar value={value} />
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="panel-flat p-4">
      <div className="mono text-[8px] tk-lg uppercase text-[var(--amber)]">{label}</div>
      <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{children}</div>
    </div>
  )
}

export function Divider() {
  return <div className="h-px w-full bg-[var(--line)]" />
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="panel-flat p-8 text-center text-xs leading-6 text-[var(--dim)]">{children}</div>
}
