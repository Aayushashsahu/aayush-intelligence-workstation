import { isOwner } from './github'

describe('isOwner', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('matches exactly when OWNER_GITHUB_LOGIN is set', () => {
    process.env.OWNER_GITHUB_LOGIN = 'TestUser'
    expect(isOwner({ login: 'TestUser' })).toBe(true)
  })

  it('matches case-insensitively', () => {
    process.env.OWNER_GITHUB_LOGIN = 'TestUser'
    expect(isOwner({ login: 'testuser' })).toBe(true)
    expect(isOwner({ login: 'TESTUSER' })).toBe(true)
  })

  it('matches when input has whitespace', () => {
    process.env.OWNER_GITHUB_LOGIN = 'TestUser'
    expect(isOwner({ login: '  TestUser  ' })).toBe(true)
  })

  it('matches when OWNER_GITHUB_LOGIN has whitespace', () => {
    process.env.OWNER_GITHUB_LOGIN = '  TestUser  '
    expect(isOwner({ login: 'TestUser' })).toBe(true)
  })

  it('returns false for non-matching login', () => {
    process.env.OWNER_GITHUB_LOGIN = 'TestUser'
    expect(isOwner({ login: 'OtherUser' })).toBe(false)
  })

  it('uses default owner login when OWNER_GITHUB_LOGIN is not set', () => {
    delete process.env.OWNER_GITHUB_LOGIN
    expect(isOwner({ login: 'Aayushashsahu' })).toBe(true)
    expect(isOwner({ login: 'aayushashsahu' })).toBe(true)
    expect(isOwner({ login: 'otheruser' })).toBe(false)
  })

  it('returns false if ownerLogin resolves to empty string', () => {
    process.env.OWNER_GITHUB_LOGIN = '   '
    expect(isOwner({ login: '   ' })).toBe(false)
    expect(isOwner({ login: 'anything' })).toBe(false)
  })
})
