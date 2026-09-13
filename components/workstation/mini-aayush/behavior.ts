import { useEffect, useRef, useState, useCallback } from 'react'
import type { ViewId } from '@/lib/types'
import type { WinState } from '@/components/workstation/store'
import type { MiniAayushPose, MiniAayushMood } from './types'
import {
  SUBSYSTEM_DIALOGUE,
  CLICK_REACTIONS,
  FALL_DIALOGUE,
  SLEEP_DIALOGUE,
  IDLE_THOUGHTS,
} from './dialogue'

export interface MiniAayushState {
  pose: MiniAayushPose
  mood: MiniAayushMood
  speech: string | null
  posX: number // percentage across bottom rail (12% to 85%)
  facing: 'left' | 'right'
  isSleeping: boolean
  isFalling: boolean
  hasEntered: boolean
}

export function useMiniAayushBehavior(
  currentView: ViewId,
  windows: WinState[] = [],
  enabled = true
) {
  const [state, setState] = useState<MiniAayushState>({
    pose: '05-walk',
    mood: 'walking',
    speech: null,
    posX: 96,
    facing: 'left',
    isSleeping: false,
    isFalling: false,
    hasEntered: false,
  })

  const lastActivityRef = useRef(Date.now())
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wanderIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInteractingRef = useRef(false)
  const walkCountRef = useRef(0)

  // Enforce strictly single active speech bubble
  const setSpeech = useCallback((text: string | null, durationMs = 3800) => {
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current)
    setState((prev) => ({ ...prev, speech: text }))
    if (text && durationMs > 0) {
      speechTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, speech: null }))
      }, durationMs)
    }
  }, [])

  // 1. Initial Boot Entrance Slide: walk into workstation from right margin
  useEffect(() => {
    if (!enabled) return

    const entranceTimer = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        posX: 78,
        mood: 'walking',
        pose: '05-walk',
        facing: 'left',
      }))

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          mood: 'idle',
          pose: '01-greet',
          hasEntered: true,
        }))
        setSpeech('welcome to my workstation.', 4000)

        setTimeout(() => {
          setState((prev) => {
            if (prev.mood === 'idle' && prev.pose === '01-greet') {
              return { ...prev, pose: '08-chill' }
            }
            return prev
          })
        }, 4000)
      }, 2600)
    }, 400)

    return () => clearTimeout(entranceTimer)
  }, [enabled, setSpeech])

  // Trigger the Fall Micro-Event Sequence:
  // Walk -> stumble -> fall ("oh that was embarrassing hehe") -> pause -> get up ("hehe... all good") -> resume
  const triggerFallSequence = useCallback(() => {
    if (isInteractingRef.current) return
    isInteractingRef.current = true

    // Step 1: Stumble
    setState((prev) => ({
      ...prev,
      pose: '05-walk',
      mood: 'stumbling',
      isFalling: true,
    }))

    // Step 2: Fall flat with speech
    animTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        pose: '06-fall',
        mood: 'fallen',
        speech: FALL_DIALOGUE.falling,
      }))

      // Step 3: Pause on floor, then begin getting up
      animTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          pose: '07-getup',
          mood: 'recovering',
          speech: FALL_DIALOGUE.recovering,
        }))

        // Step 4: Stand back up and resume chill/idle
        animTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            pose: '08-chill',
            mood: 'idle',
            speech: null,
            isFalling: false,
          }))
          isInteractingRef.current = false
        }, 2200)
      }, 2600)
    }, 400)
  }, [])

  // Subsystem Guidance: react when user switches views
  const prevViewRef = useRef(currentView)
  useEffect(() => {
    if (prevViewRef.current !== currentView) {
      prevViewRef.current = currentView
      if (isInteractingRef.current) return

      lastActivityRef.current = Date.now()
      const dialogue = SUBSYSTEM_DIALOGUE[currentView]
      if (dialogue) {
        setState((prev) => ({
          ...prev,
          pose: '14-guide',
          mood: 'guiding',
          isSleeping: false,
        }))
        setSpeech(dialogue, 4500)
        setTimeout(() => {
          setState((prev) => {
            if (prev.mood === 'guiding') {
              return { ...prev, pose: '08-chill', mood: 'idle' }
            }
            return prev
          })
        }, 3000)
      }
    }
  }, [currentView, setSpeech])

  // Inactivity tracking: Sleep after 45s of user inactivity
  useEffect(() => {
    if (!enabled) return

    const markActivity = () => {
      lastActivityRef.current = Date.now()
      setState((prev) => {
        if (prev.isSleeping) {
          setSpeech("i'm back awake!", 2200)
          return {
            ...prev,
            isSleeping: false,
            pose: '01-greet',
            mood: 'idle',
          }
        }
        return prev
      })
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }))

    const inactivityCheck = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current
      if (elapsed >= 45000 && !isInteractingRef.current) {
        setState((prev) => {
          if (!prev.isSleeping) {
            return {
              ...prev,
              isSleeping: true,
              pose: '12-sleep',
              mood: 'sleeping',
              speech: SLEEP_DIALOGUE,
            }
          }
          return prev
        })
      }
    }, 5000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActivity))
      clearInterval(inactivityCheck)
    }
  }, [enabled, setSpeech])

  // 5. Natural Roaming with Dynamic Window Avoidance
  useEffect(() => {
    if (!enabled) return

    const roam = () => {
      if (isInteractingRef.current || state.isSleeping || !state.hasEntered) return

      walkCountRef.current += 1

      // Every 4th stroll, trigger the stumble/fall micro-event!
      if (walkCountRef.current % 4 === 0) {
        triggerFallSequence()
        return
      }

      // Check open windows to avoid overlapping them
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800
      const blockingWindows = windows.filter(
        (w) => !w.minimized && w.y + w.h > vh - 220
      )

      let targetX = Math.floor(Math.random() * 58) + 18 // default 18% to 76%

      if (blockingWindows.length > 0) {
        const win = blockingWindows[0]
        const winMinPercent = (win.x / vw) * 100
        const winMaxPercent = ((win.x + win.w) / vw) * 100

        // If target overlaps window footprint, park in safe lateral cove
        if (targetX >= winMinPercent - 10 && targetX <= winMaxPercent + 10) {
          targetX = winMaxPercent + 12 < 88 ? 84 : 14
        }
      }

      const currentX = state.posX
      const facing = targetX < currentX ? 'left' : 'right'

      setState((prev) => ({
        ...prev,
        pose: '05-walk',
        mood: 'walking',
        facing,
        posX: targetX,
      }))

      // After walking travel time (~3.2s) settle into an idle pose
      setTimeout(() => {
        setState((prev) => {
          if (prev.mood === 'walking') {
            const idlePoses: MiniAayushPose[] = ['08-chill', '02-think', '03-work', '15-type']
            const nextPose = idlePoses[Math.floor(Math.random() * idlePoses.length)]
            return {
              ...prev,
              pose: nextPose,
              mood: 'idle',
            }
          }
          return prev
        })

        // Rare ambient thought
        if (Math.random() < 0.22) {
          const thought = IDLE_THOUGHTS[Math.floor(Math.random() * IDLE_THOUGHTS.length)]
          setSpeech(thought, 3200)
        }
      }, 3200)
    }

    wanderIntervalRef.current = setInterval(roam, 16000)
    return () => {
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current)
    }
  }, [enabled, state.isSleeping, state.hasEntered, state.posX, windows, triggerFallSequence, setSpeech])

  // User direct click interaction
  const handleClick = useCallback(() => {
    lastActivityRef.current = Date.now()

    if (state.isSleeping) {
      setState((prev) => ({
        ...prev,
        isSleeping: false,
        pose: '01-greet',
        mood: 'idle',
      }))
      setSpeech('awake! what are we looking at?', 2500)
      return
    }

    if (state.isFalling) {
      setSpeech('still catching my balance haha...', 2000)
      return
    }

    // Interactive response
    const reactions = CLICK_REACTIONS
    const randomSpeech = reactions[Math.floor(Math.random() * reactions.length)]
    const poses: MiniAayushPose[] = ['10-celebrate', '04-idea', '01-greet', '08-chill']
    const nextPose = poses[Math.floor(Math.random() * poses.length)]

    setState((prev) => ({
      ...prev,
      pose: nextPose,
      mood: 'celebrating',
    }))
    setSpeech(randomSpeech, 3500)

    setTimeout(() => {
      setState((prev) => {
        if (prev.mood === 'celebrating') {
          return { ...prev, pose: '08-chill', mood: 'idle' }
        }
        return prev
      })
    }, 3200)
  }, [state.isSleeping, state.isFalling, setSpeech])

  return {
    state,
    handleClick,
    triggerFallSequence,
    setSpeech,
  }
}
