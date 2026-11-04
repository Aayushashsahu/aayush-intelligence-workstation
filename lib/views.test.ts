import { describe, it, expect } from 'vitest'
import { viewMeta, viewMode, resolveView } from './views'

describe('Views', () => {
  it('viewMeta returns the correct meta or fallback', () => {
    expect(viewMeta('COMMAND').id).toBe('COMMAND')
    expect(viewMeta('CORTEX').id).toBe('CORTEX')
    expect(viewMeta('UNKNOWN' as any).id).toBe('COMMAND') // Fallback
  })

  it('viewMode returns the correct mode', () => {
    expect(viewMode('COMMAND')).toBe('BUILD')
    expect(viewMode('CORTEX')).toBe('ANALYZE')
    expect(viewMode('UNKNOWN' as any)).toBe('BUILD')
  })

  it('resolveView resolves inputs to ViewId correctly', () => {
    expect(resolveView('home')).toBe('COMMAND')
    expect(resolveView('command')).toBe('COMMAND')
    expect(resolveView('ask')).toBe('CORTEX')
    expect(resolveView('graph')).toBe('MAP')
    expect(resolveView('research')).toBe('LAB')
    expect(resolveView('archive')).toBe('PROJECTS')
    expect(resolveView('telemetry')).toBe('GITHUB')
    expect(resolveView('dfir')).toBe('SECURITY')
    expect(resolveView('octiq')).toBe('FOUNDER')

    expect(resolveView('')).toBeNull()
    expect(resolveView('   ')).toBeNull()
    expect(resolveView('UNKNOWN')).toBeNull()
  })
})
