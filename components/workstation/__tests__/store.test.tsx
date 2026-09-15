import { renderHook } from '@testing-library/react'
import { useWorkstation, WorkstationProvider } from '../store'
import React from 'react'

// Mock matchMedia since it's used in WorkstationProvider
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
})

describe('useWorkstation', () => {
  it('throws an error when used outside of WorkstationProvider', () => {
    // Suppress console.error for this expected error test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useWorkstation())).toThrow(
      'useWorkstation must be used inside <WorkstationProvider>'
    )

    consoleSpy.mockRestore()
  })

  it('returns context when used inside WorkstationProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkstationProvider initialGithub={null}>
        {children}
      </WorkstationProvider>
    )

    const { result } = renderHook(() => useWorkstation(), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.view).toBe('COMMAND') // Default view
    expect(typeof result.current.setView).toBe('function')
  })
})
