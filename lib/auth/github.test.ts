import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isOwner, getAppUrl, callbackUrl, oauthConfigured } from './github'

describe('GitHub Auth', () => {
  const originalEnv = process.env
  beforeEach(() => {
    vi.resetModules()
    process.env = {
      ...originalEnv,
      OWNER_GITHUB_LOGIN: 'Aayushashsahu',
      GITHUB_OAUTH_CLIENT_ID: 'client-id',
      GITHUB_OAUTH_CLIENT_SECRET: 'client-secret',
    }
  })

  it('isOwner correctly matches the owner login', () => {
    expect(isOwner({ login: 'Aayushashsahu' })).toBe(true)
    expect(isOwner({ login: 'aayushashsahu' })).toBe(true)
    expect(isOwner({ login: 'otheruser' })).toBe(false)
  })

  it('getAppUrl returns the correct URL based on environment', () => {
    // Development mode fallback
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' })
    delete process.env.APP_URL
    expect(getAppUrl()).toBe('http://localhost:3000')

    // Explicit APP_URL
    process.env.APP_URL = 'https://my-app.com/'
    expect(getAppUrl()).toBe('https://my-app.com')
  })

  it('callbackUrl generates the correct callback path', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' })
    delete process.env.APP_URL
    expect(callbackUrl()).toBe('http://localhost:3000/api/auth/github/callback')
    expect(callbackUrl('https://custom.com/')).toBe('https://custom.com/api/auth/github/callback')
  })

  it('oauthConfigured correctly identifies when OAuth is configured', () => {
    expect(oauthConfigured()).toBe(true)

    delete process.env.GITHUB_OAUTH_CLIENT_ID
    expect(oauthConfigured()).toBe(false)
  })
})
