import { resolveView } from './views'

describe('resolveView', () => {
  it('resolves valid views correctly', () => {
    expect(resolveView('home')).toBe('COMMAND')
    expect(resolveView('command')).toBe('COMMAND')
    expect(resolveView('cortex')).toBe('CORTEX')
    expect(resolveView('ask')).toBe('CORTEX')
    expect(resolveView('map')).toBe('MAP')
    expect(resolveView('lab')).toBe('LAB')
    expect(resolveView('projects')).toBe('PROJECTS')
    expect(resolveView('github')).toBe('GITHUB')
    expect(resolveView('security')).toBe('SECURITY')
    expect(resolveView('founder')).toBe('FOUNDER')
  })

  it('handles case-insensitivity and whitespace', () => {
    expect(resolveView(' HOME ')).toBe('COMMAND')
    expect(resolveView('CoRtEx')).toBe('CORTEX')
    expect(resolveView('   github   ')).toBe('GITHUB')
  })

  it('returns null for empty or invalid inputs', () => {
    expect(resolveView('')).toBeNull()
    expect(resolveView('   ')).toBeNull()
    expect(resolveView('invalid_view')).toBeNull()
    expect(resolveView('unknown')).toBeNull()
  })
})
