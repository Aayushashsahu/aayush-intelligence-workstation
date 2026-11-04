import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkstation, WorkstationProvider } from './store'
import type { ViewId } from '@/lib/types'
import { ReactNode } from 'react'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <WorkstationProvider initialGithub={null}>{children}</WorkstationProvider>
)

describe('Workstation Store', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWorkstation(), { wrapper })
    expect(result.current.mode).toBe('BUILD')
    expect(result.current.view).toBe('COMMAND')
    expect(result.current.windows.length).toBe(0)
  })

  it('should allow setting the active view', () => {
    const { result } = renderHook(() => useWorkstation(), { wrapper })

    act(() => {
      result.current.setView('PROJECTS' as ViewId)
    })

    expect(result.current.view).toBe('PROJECTS')
  })

  it('should open a view in a window', () => {
    const { result } = renderHook(() => useWorkstation(), { wrapper })

    act(() => {
      result.current.openView('PROJECTS' as ViewId)
    })

    expect(result.current.windows.some(w => w.view === 'PROJECTS')).toBe(true)
    expect(result.current.activeWindowId).toBeDefined()
  })

  it('should open the terminal window', () => {
    const { result } = renderHook(() => useWorkstation(), { wrapper })

    act(() => {
      result.current.openTerminal()
    })

    expect(result.current.windows.some(w => w.kind === 'terminal')).toBe(true)
  })

  it('should handle minimizing a window', () => {
    const { result } = renderHook(() => useWorkstation(), { wrapper })

    act(() => {
      result.current.openView('PROJECTS' as ViewId)
    })

    const winId = result.current.windows.find(w => w.view === 'PROJECTS')?.id

    act(() => {
      if (winId) result.current.minimizeWindow(winId)
    })

    expect(result.current.windows.find(w => w.id === winId)?.minimized).toBe(true)
  })
})
