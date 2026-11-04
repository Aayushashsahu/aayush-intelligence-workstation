import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { encodeSession, decodeSession } from './session'
import type { OwnerSession } from '@/lib/types'

describe('Session handling', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('encodes and decodes a session successfully', () => {
    process.env.AUTH_SECRET = 'test-secret'

    const session: OwnerSession = {
      login: 'test-user',
      provider: 'github',
      exp: Date.now() + 1000 * 60 * 60,
    }

    const token = encodeSession(session)
    expect(token).toBeDefined()

    const decoded = decodeSession(token)
    expect(decoded).toEqual(session)
  })

  it('fails to decode with invalid signature', () => {
    process.env.AUTH_SECRET = 'test-secret'

    const session: OwnerSession = {
      login: 'test-user',
      provider: 'github',
      exp: Date.now() + 1000 * 60 * 60,
    }

    const token = encodeSession(session)
    const [payload, signature] = token.split('.')
    const invalidToken = `${payload}.invalid${signature}`

    const decoded = decodeSession(invalidToken)
    expect(decoded).toBeNull()
  })

  it('fails to decode an expired session', () => {
    process.env.AUTH_SECRET = 'test-secret'

    const session: OwnerSession = {
      login: 'test-user',
      provider: 'github',
      exp: Date.now() - 1000 * 60 * 60,
    }

    const token = encodeSession(session)
    const decoded = decodeSession(token)
    expect(decoded).toBeNull()
  })
})
