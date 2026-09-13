'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useWorkstation } from '@/components/workstation/store'
import { useMiniAayushBehavior } from './behavior'
import { Led } from '@/components/ui/Primitives'

export default function MiniAayush() {
  const { view, windows } = useWorkstation()
  const [reducedMotion, setReducedMotion] = useState(false)
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const {
    state,
    handleClick,
    triggerFallSequence,
    startDrag,
    updateDrag,
    endDrag,
  } = useMiniAayushBehavior(view, windows, !reducedMotion && !minimized)

  // Drag Pointer Tracking
  const isPointerDownRef = useRef(false)
  const hasMovedRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (state.mood === 'stumbling' || state.mood === 'recovering') return

    isPointerDownRef.current = true
    hasMovedRef.current = false
    startPosRef.current = { x: e.clientX, y: e.clientY }

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return

    if (!hasMovedRef.current) {
      const dx = e.clientX - startPosRef.current.x
      const dy = e.clientY - startPosRef.current.y
      if (dx * dx + dy * dy > 25) {
        hasMovedRef.current = true
        startDrag(e.clientX, e.clientY)
      }
    } else {
      updateDrag(e.clientX, e.clientY)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    if (!hasMovedRef.current) {
      handleClick()
    } else {
      endDrag()
    }
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}

    if (hasMovedRef.current) {
      endDrag()
    }
  }

  if (minimized) {
    return (
      <div className="fixed bottom-12 right-4 z-40 select-none">
        <button
          onClick={() => setMinimized(false)}
          className="mono flex items-center gap-2 border border-[var(--line)] bg-[rgba(10,10,12,0.94)] px-3 py-1.5 text-[9px] tk text-[var(--muted)] hover:border-[var(--amber-line)] hover:text-[var(--text)] transition-colors shadow-xl backdrop-blur-md"
          aria-label="Restore Mini Aayush"
        >
          <Led tone="live" pulse />
          <span>MINI AAYUSH // DOCKED</span>
        </button>
      </div>
    )
  }

  const spriteSrc = `/mini-aayush/${state.pose}.png`
  const posX = reducedMotion ? 82 : state.posX

  // Determine physical animation style based on mood and reduced motion
  let motionAnimation = 'none'
  if (!reducedMotion && !state.isDragging) {
    if (state.mood === 'walking') {
      motionAnimation = 'mini-walk-bob 0.38s ease-in-out infinite alternate'
    } else if (state.mood === 'idle') {
      motionAnimation = 'mini-idle-breathe 3.2s ease-in-out infinite'
    } else if (state.mood === 'stumbling') {
      motionAnimation = 'mini-stumble-drop 0.4s cubic-bezier(0.2, 0.8, 0.3, 1) forwards'
    } else if (state.mood === 'recovering') {
      motionAnimation = 'mini-getup-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    } else if (state.mood === 'celebrating') {
      motionAnimation = 'mini-walk-bob 0.28s ease-in-out infinite alternate'
    }
  }

  return (
    <>
      <style>{`
        @keyframes mini-idle-breathe {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2.2px) scale(1.008); }
        }
        @keyframes mini-walk-bob {
          0% { transform: translateY(0px) rotate(1.8deg); }
          100% { transform: translateY(-4px) rotate(-1.5deg); }
        }
        @keyframes mini-stumble-drop {
          0% { transform: translateY(0px) rotate(0deg); }
          40% { transform: translateY(-4px) rotate(15deg); }
          100% { transform: translateY(6px) rotate(0deg); }
        }
        @keyframes mini-getup-spring {
          0% { transform: translateY(6px) scale(0.96); }
          55% { transform: translateY(-4px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}</style>

      <div
        className="fixed bottom-[44px] z-40 select-none pointer-events-none"
        style={{
          left: `${posX}%`,
          transform: `translateX(-50%) translateY(${-state.dragY}px)`,
          transition:
            state.isDragging
              ? 'none'
              : state.mood === 'settling'
              ? reducedMotion
                ? 'left 0.2s ease-out'
                : 'transform 0.45s cubic-bezier(0.34, 1.45, 0.64, 1), left 0.35s ease-out'
              : state.mood === 'walking' && !reducedMotion
              ? 'left 3.2s cubic-bezier(0.25, 1, 0.5, 1)'
              : 'none',
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Strictly Single Active Speech Bubble */}
          {state.speech && (
            <div
              className="pointer-events-auto absolute bottom-[108%] z-50 mb-2 w-max max-w-[270px] animate-in fade-in zoom-in-95 duration-200"
              role="status"
              aria-live="polite"
            >
              <div className="panel relative border border-[var(--amber-line)] bg-[rgba(12,12,14,0.96)] p-3 text-left shadow-2xl backdrop-blur-md">
                <div className="mono mb-1.5 flex items-center justify-between gap-2 text-[8px] tk-lg text-[var(--amber)]">
                  <span className="flex items-center gap-1.5">
                    <Led
                      tone={
                        state.isSleeping
                          ? 'idle'
                          : state.isFalling || state.isDragging
                          ? 'amber'
                          : 'live'
                      }
                      pulse={state.isFalling || state.isDragging}
                    />
                    MINI AAYUSH // HOST
                  </span>
                  <span className="text-[var(--dim)]">{state.mood.toUpperCase()}</span>
                </div>
                <p className="text-xs leading-5 text-[var(--text)] font-sans">
                  {state.speech}
                </p>
                {/* Pointer beak */}
                <div
                  className="absolute left-1/2 -bottom-[6px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-[var(--amber-line)] bg-[rgba(12,12,14,0.96)]"
                  aria-hidden
                />
              </div>
            </div>
          )}

          {/* Dynamic Ground Contact Shadow (anchored to bottom rail plane) */}
          <div
            className="absolute -bottom-1 left-1/2 rounded-full pointer-events-none"
            style={{
              transform: `translateX(-50%) translateY(${state.dragY}px) scale(${Math.max(
                0.35,
                1 - state.dragY / 320
              )})`,
              opacity: Math.max(0.18, 1 - state.dragY / 240),
              filter: `blur(${Math.min(4, state.dragY / 60)}px)`,
              width:
                state.mood === 'fallen' ? '76px' : state.mood === 'walking' ? '44px' : '52px',
              height: state.mood === 'fallen' ? '8px' : '4px',
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0) 75%)',
              transition: state.isDragging
                ? 'none'
                : 'transform 0.45s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.45s ease-out, filter 0.45s ease-out',
            }}
            aria-hidden
          />

          {/* Mini Aayush Draggable Character Wrapper */}
          <div
            role="button"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick()
              }
            }}
            onDoubleClick={triggerFallSequence}
            className={`pointer-events-auto group relative select-none outline-none focus-visible:ring-1 focus-visible:ring-[var(--amber)] ${
              state.isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ touchAction: 'none' }}
            aria-label={`Mini Aayush workstation host, currently ${state.mood}. Click to interact or drag to reposition.`}
            title="Click to interact, or click and drag Mini Aayush around the workstation"
          >
            {/* Sprite container with physics, scale on grab, tilt & facing flip */}
            <div
              style={{
                transform: `scaleX(${state.facing === 'right' ? -1 : 1}) rotate(${
                  reducedMotion ? 0 : state.tilt
                }deg) scale(${state.isDragging ? 1.14 : 1})`,
                filter: state.isDragging
                  ? 'drop-shadow(0 14px 20px rgba(0,0,0,0.65)) drop-shadow(0 0 14px rgba(245,158,11,0.28))'
                  : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                transition: state.isDragging
                  ? 'scale 0.18s ease-out, filter 0.2s ease-out'
                  : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease-out',
              }}
            >
              <div
                style={{
                  animation: motionAnimation,
                  transform: state.mood === 'fallen' ? 'translateY(6px)' : undefined,
                  willChange: 'transform',
                }}
              >
                <Image
                  src={spriteSrc}
                  alt="Mini Aayush"
                  width={76}
                  height={86}
                  className="h-[80px] w-auto object-contain select-none pointer-events-none drop-shadow-md transition-transform duration-200 group-hover:scale-105 group-active:scale-95"
                  priority
                  unoptimized
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Minimal Control Pill on hover */}
          <div className="pointer-events-auto mt-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setMinimized(true)}
              className="mono text-[7px] text-[var(--dim)] hover:text-[var(--muted)] px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--line)] rounded"
              title="Minimize Mini Aayush to dock"
            >
              PARK
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
