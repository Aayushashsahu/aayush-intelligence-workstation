'use client'

import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { GripVertical, Minus, Square, X, Copy } from 'lucide-react'
import { useWorkstation, type WinState } from '@/components/workstation/store'
import Terminal from '@/components/workstation/Terminal'
import Dossier from '@/components/views/Dossier'
import { VIEW_COMPONENTS } from '@/components/views/registry'

const EDGE = 96

export default function WindowFrame({ win }: { win: WinState }) {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
    isMobile,
    activeWindowId,
  } = useWorkstation()

  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const resize = useRef<{ x: number; y: number; w: number; h: number } | null>(null)

  const focused = activeWindowId === win.id
  const minimized = win.minimized

  const clamp = useCallback((x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const cx = Math.min(Math.max(x, -w + EDGE), vw - EDGE)
    const cy = Math.min(Math.max(y, 0), vh - 48)
    return { x: cx, y: cy, w, h }
  }, [])

  const onDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isMobile || win.maximized) return
    focusWindow(win.id)
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const next = clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy, win.w, win.h)
    moveWindow(win.id, next.x, next.y)
  }
  const onDragEnd = () => {
    drag.current = null
  }

  const onResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isMobile) return
    focusWindow(win.id)
    resize.current = { x: e.clientX, y: e.clientY, w: win.w, h: win.h }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.stopPropagation()
  }
  const onResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resize.current) return
    const w = Math.max(360, resize.current.w + (e.clientX - resize.current.x))
    const h = Math.max(260, resize.current.h + (e.clientY - resize.current.y))
    resizeWindow(win.id, w, h)
  }

  const onBarKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (win.maximized) return
    const step = e.shiftKey ? 48 : 16
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const delta = map[e.key]
    if (!delta) return
    e.preventDefault()
    const next = clamp(win.x + delta[0], win.y + delta[1], win.w, win.h)
    moveWindow(win.id, next.x, next.y)
  }

  const style: React.CSSProperties = win.maximized
    ? { left: 8, top: 8, width: 'calc(100vw - 16px)', height: 'calc(100dvh - 16px)', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  if (minimized) return null

  const content =
    win.kind === 'terminal' ? (
      <Terminal />
    ) : win.kind === 'dossier' && win.projectId ? (
      <Dossier projectId={win.projectId} />
    ) : win.view ? (
      (() => {
        const View = VIEW_COMPONENTS[win.view]
        return <View windowed />
      })()
    ) : null

  return (
    <div
      className={`win ${isMobile ? 'win-sheet' : ''}`}
      style={style}
      data-focused={focused}
      role="dialog"
      aria-label={`${win.title} window`}
      onPointerDown={() => focusWindow(win.id)}
    >
      <div className={`win-bar ${focused ? 'metal' : ''}`}>
        <div
          className={`win-grip flex min-w-0 items-center gap-2 ${isMobile ? '' : 'cursor-grab'}`}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          onKeyDown={onBarKey}
          tabIndex={0}
          role="group"
          aria-label={`${win.title}: drag handle. Use arrow keys to move this window; Shift for larger steps.`}
        >
          <GripVertical size={13} className="flex-none text-[var(--dim)]" aria-hidden />
          <span className="mono truncate text-[10px] tk text-[var(--muted)]">{win.title}</span>
          <span className="mono hidden flex-none text-[9px] tk text-[var(--dim)] sm:inline">// {win.sub}</span>
        </div>

        <div className="flex flex-none items-center gap-0.5">
          <button type="button" onClick={() => minimizeWindow(win.id)} aria-label={`Minimize ${win.title}`}>
            <Minus size={13} />
          </button>
          {!isMobile && (
            <button type="button" onClick={() => toggleMaximize(win.id)} aria-label={`Maximize ${win.title}`}>
              <Square size={12} />
            </button>
          )}
          <button type="button" onClick={() => closeWindow(win.id)} aria-label={`Close ${win.title}`}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="win-body">{content}</div>

      {!isMobile && !win.maximized && (
        <div
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={() => (resize.current = null)}
          onPointerCancel={() => (resize.current = null)}
          className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize"
          aria-hidden
        >
          <Copy size={10} className="absolute bottom-0.5 right-0.5 text-[var(--line-2)]" />
        </div>
      )}
    </div>
  )
}
