'use client'

import { useState, useEffect } from 'react'
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

  const { state, handleClick, triggerFallSequence } = useMiniAayushBehavior(
    view,
    windows,
    !reducedMotion && !minimized
  )

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
  if (!reducedMotion) {
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
          transform: 'translateX(-50%)',
          transition:
            reducedMotion || state.mood !== 'walking'
              ? 'none'
              : 'left 3.2s cubic-bezier(0.25, 1, 0.5, 1)',
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
                      tone={state.isSleeping ? 'idle' : state.isFalling ? 'amber' : 'live'}
                      pulse={state.isFalling}
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

          {/* Mini Aayush Character Button */}
          <button
            onClick={handleClick}
            onDoubleClick={triggerFallSequence}
            className="pointer-events-auto group relative cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--amber)]"
            aria-label={`Mini Aayush workstation host, currently ${state.mood}. Click to interact, double click to trigger stumble.`}
            title="Click to interact with Mini Aayush (Double click for stumble)"
          >
            {/* Dynamic Ground Contact Shadow */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300"
              style={{
                width: state.mood === 'fallen' ? '76px' : state.mood === 'walking' ? '44px' : '52px',
                height: state.mood === 'fallen' ? '8px' : '4px',
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0) 75%)',
              }}
              aria-hidden
            />

            {/* Sprite container with physics & facing flip */}
            <div
              style={{
                transform: state.facing === 'right' ? 'scaleX(-1)' : 'scaleX(1)',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                transition: 'transform 0.25s ease-out',
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
                />
              </div>
            </div>
          </button>

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
