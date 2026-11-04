import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOwnerSession, isOwnerRequest, authConfigured } from './guard'
import * as session from './session'
import * as github from './github'

vi.mock('./session', () => ({
  readSessionCookie: vi.fn(),
}))

vi.mock('./github', () => ({
  isOwner: vi.fn(),
  oauthConfigured: vi.fn(),
  ownerLogin: vi.fn(),
}))

describe('Auth Guard', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns null if auth is not configured', async () => {
    vi.mocked(github.oauthConfigured).mockReturnValue(false)
    const result = await getOwnerSession()
    expect(result).toBeNull()
  })

  it('returns null if no session exists', async () => {
    vi.mocked(github.oauthConfigured).mockReturnValue(true)
    vi.mocked(session.readSessionCookie).mockResolvedValue(null)
    const result = await getOwnerSession()
    expect(result).toBeNull()
  })

  it('returns null if provider is not github', async () => {
    vi.mocked(github.oauthConfigured).mockReturnValue(true)
    vi.mocked(session.readSessionCookie).mockResolvedValue({ provider: 'google' as any, login: 'test', exp: 123 })
    const result = await getOwnerSession()
    expect(result).toBeNull()
  })

  it('returns null if user is not owner', async () => {
    vi.mocked(github.oauthConfigured).mockReturnValue(true)
    vi.mocked(session.readSessionCookie).mockResolvedValue({ provider: 'github', login: 'test', exp: 123 })
    vi.mocked(github.isOwner).mockReturnValue(false)
    const result = await getOwnerSession()
    expect(result).toBeNull()
  })

  it('returns session if user is owner', async () => {
    vi.mocked(github.oauthConfigured).mockReturnValue(true)
    const mockSession = { provider: 'github' as const, login: 'owner', exp: 123 }
    vi.mocked(session.readSessionCookie).mockResolvedValue(mockSession)
    vi.mocked(github.isOwner).mockReturnValue(true)
    const result = await getOwnerSession()
    expect(result).toEqual(mockSession)
  })

  it('isOwnerRequest returns correct boolean', async () => {
    vi.mocked(github.oauthConfigured).mockReturnValue(true)
    vi.mocked(session.readSessionCookie).mockResolvedValue(null)
    expect(await isOwnerRequest()).toBe(false)

    const mockSession = { provider: 'github' as const, login: 'owner', exp: 123 }
    vi.mocked(session.readSessionCookie).mockResolvedValue(mockSession)
    vi.mocked(github.isOwner).mockReturnValue(true)
    expect(await isOwnerRequest()).toBe(true)
  })
})
