'use client'

import { useState } from 'react'
import { useWorkstation } from '@/components/workstation/store'
import type { CompanionState } from '@/lib/types'

const TEMPERAMENT: Record<CompanionState, string> = {
  IDLE: 'CURIOUS',
  THINKING: 'FOCUSED',
  READING: 'ABSORBED',
  EXCITED: 'BUOYANT',
  SLEEPING: 'DORMANT',
  INVESTIGATING: 'ATTENTIVE',
  ALERT: 'ALARMED',
}

const TONE: Record<CompanionState, string> = {
  IDLE: 'var(--muted)',
  THINKING: 'var(--amber)',
  READING: '#9c9ca4',
  EXCITED: 'var(--led)',
  SLEEPING: '#4a4a52',
  INVESTIGATING: 'var(--amber)',
  ALERT: 'var(--danger)',
}

const SPEED: Record<CompanionState, string> = {
  IDLE: '9s',
  THINKING: '2.2s',
  READING: '5s',
  EXCITED: '1.1s',
  SLEEPING: '24s',
  INVESTIGATING: '3s',
  ALERT: '0.8s',
}

export default function Companion() {
  const { companion } = useWorkstation()
  const [open, setOpen] = useState(true)
  const { state, activity } = companion
  const tone = TONE[state]

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 select-none">
      <div className="pointer-events-auto panel w-[236px] overflow-hidden p-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 text-left"
          aria-expanded={open}
          aria-label={`Companion 01, ${state.toLowerCase()}. Toggle detail.`}
        >
          <span className="relative grid h-8 w-8 flex-none place-items-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: `${tone}66`, animation: `companionSpin ${SPEED[state]} linear infinite` }}
            />
            <span
              aria-hidden
              className="absolute inset-[5px] rounded-full border"
              style={{ borderColor: `${tone}44`, animation: `companionSpin ${SPEED[state]} linear infinite reverse` }}
            />
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: tone, boxShadow: `0 0 8px ${tone}` }} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="mono block text-[9px] tk-lg text-[var(--dim)]">COMPANION // 01</span>
            <span className="mono block truncate text-[10px] tk" style={{ color: tone }}>
              {state}
            </span>
          </span>
        </button>

        {open && (
          <div className="mono mt-3 space-y-1.5 border-t border-[var(--line)] pt-3 text-[9px] tk text-[var(--dim)]">
            <Row label="TEMPERAMENT" value={TEMPERAMENT[state]} />
            <Row label="CURRENT ACTIVITY" value={activity} />
          </div>
        )}
      </div>

      <style>{`@keyframes companionSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className="truncate text-[var(--muted)]">{value}</span>
    </div>
  )
}
