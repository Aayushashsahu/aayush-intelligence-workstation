import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Workstation from '../Workstation'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('Workstation Boot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('proceeds even if sessionStorage throws an error', async () => {
    // Mock sessionStorage to throw using spyOn to ensure it can be restored
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const initialContent = {
      profile: {
        secondary: []
      },
      founder: {
        company: {
          role: "test",
          name: "test",
          status: "test"
        }
      },
      projects: [],
      research: [],
      lab: [],
      security: [],
      thoughts: [],
      milestones: []
    } as any

    render(
      <Workstation
        initialGithub={null}
        initialContent={initialContent}
        contentStorage="seed"
      />
    )

    // We expect the boot screen to render
    expect(screen.getByText('SYSTEM INIT')).toBeTruthy()

    // Fast forward the boot lines or just click the boot screen to complete
    const bootContainer = screen.getByTitle('Click or press ESC to enter')
    fireEvent.click(bootContainer)

    // The handleBootComplete function should be called, which tries to use sessionStorage.setItem and catches the error.
    // We wait to see if the Boot screen unmounts and the actual workstation content mounts.
    // Skip to content is in the workstation view
    await waitFor(() => {
      expect(screen.getByText('Skip to content')).toBeTruthy()
    })
  })
})
