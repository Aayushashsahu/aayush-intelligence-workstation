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
  PICKUP_DIALOGUE,
  SETTLE_DIALOGUE,
} from './dialogue'

export interface MiniAayushState {
  pose: MiniAayushPose
  mood: MiniAayushMood
  speech: string | null
  posX: number // percentage across bottom rail (8% to 92%)
  dragY: number // vertical lift height (0 when grounded)
  tilt: number // angular tilt during drag/movement (-14 to +14 deg)
  facing: 'left' | 'right'
  isSleeping: boolean
  isFalling: boolean
  isDragging: boolean
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
    dragY: 0,
    tilt: 0,
    facing: 'left',
    isSleeping: false,
    isFalling: false,
    isDragging: false,
    hasEntered: false,
  })

  const lastActivityRef = useRef(Date.now())
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wanderIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInteractingRef = useRef(false)
  const isDraggingRef = useRef(false)
  const lastPointerXRef = useRef(0)
  const lastPointerYRef = useRef(0)
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
      if (isDraggingRef.current) return
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
      if (elapsed >= 45000 && !isInteractingRef.current && !isDraggingRef.current) {
        setState((prev) => {
          if (!prev.isSleeping && prev.mood !== 'dragging' && prev.mood !== 'settling') {
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
      if (
        isInteractingRef.current ||
        isDraggingRef.current ||
        state.isSleeping ||
        !state.hasEntered ||
        state.isDragging ||
        state.mood === 'dragging' ||
        state.mood === 'settling'
      ) {
        return
      }

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
  }, [
    enabled,
    state.isSleeping,
    state.hasEntered,
    state.posX,
    state.isDragging,
    state.mood,
    windows,
    triggerFallSequence,
    setSpeech,
  ])

  // Drag Interaction: Pointer Down -> Dragging -> Pointer Up -> Settling -> Autonomous
  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!enabled) return

      isInteractingRef.current = true
      isDraggingRef.current = true
      lastPointerXRef.current = clientX
      lastPointerYRef.current = clientY

      // Cancel any scheduled wander or animation sequences
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current)
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current)

      // Rare/subtle pickup reaction dialogue (50% chance)
      const shouldSpeak = Math.random() < 0.55
      const pickDialogue = shouldSpeak
        ? PICKUP_DIALOGUE[Math.floor(Math.random() * PICKUP_DIALOGUE.length)]
        : null

      setState((prev) => ({
        ...prev,
        mood: 'dragging',
        pose: '11-confused',
        isDragging: true,
        isSleeping: false,
        isFalling: false,
        speech: pickDialogue,
      }))
      if (pickDialogue) {
        speechTimeoutRef.current = setTimeout(() => {
          setState((p) => (p.speech === pickDialogue ? { ...p, speech: null } : p))
        }, 1800)
      }
    },
    [enabled]
  )

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800

    // Safe horizontal bounds: clamp to 8% - 92%
    const rawPercent = (clientX / vw) * 100
    const clampedX = Math.max(8, Math.min(92, rawPercent))

    // Safe vertical lift: from 0 (bottom rail) up to (vh - 160)
    // Resting pointer baseline is around (vh - 44 - 36)
    const rawLift = vh - 44 - 36 - clientY
    const clampedLift = Math.max(0, Math.min(vh - 160, rawLift))

    // Velocity & angular tilt based on pointer movement direction
    const vx = clientX - lastPointerXRef.current
    lastPointerXRef.current = clientX
    lastPointerYRef.current = clientY

    const tilt = Math.max(-14, Math.min(14, vx * 1.1))
    const facing = vx > 1.5 ? 'right' : vx < -1.5 ? 'left' : undefined

    setState((prev) => ({
      ...prev,
      posX: clampedX,
      dragY: clampedLift,
      tilt,
      facing: facing || prev.facing,
    }))
  }, [])

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800

    // Check safe zones against blocking windows at the bottom rail
    const blockingWindows = windows.filter(
      (w) => !w.minimized && w.y + w.h > vh - 220
    )

    let finalX = state.posX
    if (blockingWindows.length > 0) {
      const win = blockingWindows[0]
      const winMin = (win.x / vw) * 100
      const winMax = ((win.x + win.w) / vw) * 100
      if (finalX >= winMin - 4 && finalX <= winMax + 4) {
        // Nudge gently to nearest side of window cove
        finalX =
          Math.abs(finalX - winMin) < Math.abs(finalX - winMax)
            ? Math.max(8, winMin - 8)
            : Math.min(92, winMax + 8)
      }
    }

    // Step 1: Trigger physical drop to floor & landing pose
    setState((prev) => ({
      ...prev,
      posX: finalX,
      dragY: 0, // initiates gravity spring to ground
      tilt: 0,
      mood: 'settling',
      pose: '07-getup', // landing crouch/recovery
      isDragging: false,
    }))

    // Subtle landing dialogue (65% chance)
    if (Math.random() < 0.65) {
      const settleText =
        SETTLE_DIALOGUE[Math.floor(Math.random() * SETTLE_DIALOGUE.length)]
      setSpeech(settleText, 2500)
    }

    // Step 2: Transition from landing crouch to chill pose
    animTimeoutRef.current = setTimeout(() => {
      setState((prev) =>
        prev.mood === 'settling' ? { ...prev, pose: '08-chill' } : prev
      )

      // Step 3: Settle complete, return to autonomous idle with cooldown
      animTimeoutRef.current = setTimeout(() => {
        setState((prev) =>
          prev.mood === 'settling' ? { ...prev, mood: 'idle' } : prev
        )
        isInteractingRef.current = false
        lastActivityRef.current = Date.now()
      }, 1400)
    }, 450)
  }, [state.posX, windows, setSpeech])

  // User direct click interaction
  const handleClick = useCallback(() => {
    if (
      isDraggingRef.current ||
      state.isDragging ||
      state.mood === 'dragging' ||
      state.mood === 'settling'
    ) {
      return
    }

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
  }, [state.isSleeping, state.isFalling, state.isDragging, state.mood, setSpeech])

  return {
    state,
    handleClick,
    triggerFallSequence,
    setSpeech,
    startDrag,
    updateDrag,
    endDrag,
  }
}

