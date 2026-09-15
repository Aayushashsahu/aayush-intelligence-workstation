import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Cortex from './Cortex'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'

// Mock the dependencies
jest.mock('@/components/workstation/store', () => ({
  useWorkstation: jest.fn(),
}))

jest.mock('@/components/workstation/ContentProvider', () => ({
  useContent: jest.fn(),
}))

describe('Cortex View Component', () => {
  const mockNotice = jest.fn()
  const mockSetView = jest.fn()
  const mockClearCortexQuery = jest.fn()
  const mockOpenDossier = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock returns
    ;(useWorkstation as jest.Mock).mockReturnValue({
      cortexQuery: '',
      clearCortexQuery: mockClearCortexQuery,
      notice: mockNotice,
      github: { isInitialLoad: false },
      setView: mockSetView,
      openDossier: mockOpenDossier,
    })

    ;(useContent as jest.Mock).mockReturnValue({
      projects: [],
      profile: {
        summary: 'Test summary',
      },
      thoughtProcess: [],
      milestones: []
    })

    // Mock fetch
    global.fetch = jest.fn()

    // Mock scrollTo
    window.HTMLElement.prototype.scrollTo = jest.fn()
  })

  it('handles fetch API errors properly', async () => {
    // Setup fetch to fail
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<Cortex />)

    // Find input and submit button
    const input = screen.getByPlaceholderText(/Ask CORTEX about/i)
    const button = screen.getByRole('button', { name: /ANALYZE/i })

    // Type a message and submit
    await userEvent.type(input, 'Test question')

    // Check it's thinking
    expect(screen.queryByText('PROCESSING')).toBeNull()

    await userEvent.click(button)

    // Wait for the error handling to complete
    await waitFor(() => {
      // Check that the error message is displayed in the UI
      expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument()
      expect(screen.getByText(/The intelligence backend did not respond/i)).toBeInTheDocument()
    })

    // Verify notice was called
    expect(mockNotice).toHaveBeenCalledWith('ALERT', 'CORTEX BACKEND UNREACHABLE', 4000)

    // Verify loading state is reset
    expect(screen.getByRole('button', { name: /ANALYZE/i })).toBeInTheDocument()
    // It's disabled initially after loading completes until input is typed. We just check if the text goes back to ANALYZE

    // The input should be cleared immediately upon submit, but since loading is reset
    // it will just be empty string value
    expect(input).toHaveValue('')
  })
})
