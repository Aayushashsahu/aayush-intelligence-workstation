import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { OwnerSession } from '@/lib/types'

/**
 * SERVER-ONLY session handling.
 *
 * Sessions are stateless and signed with HMAC-SHA256, stored in an httpOnly,
 * SameSite=Lax cookie. Nothing about authorisation is trusted from the client:
 * every request re-verifies the signature and expiry server-side.
 */

const COOKIE_NAME = 'ws_session'
const STATE_COOKIE = 'ws_oauth_state'
const SYNC_COOKIE = 'ws_sync_at'
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7

export const isProd = () => process.env.NODE_ENV === 'production'

/**
 * Signing key. AUTH_SECRET is preferred; the OAuth client secret is accepted as a
 * fallback so there is one less variable to configure. Both are server-only.
 */
function signingKey(): string | null {
  return process.env.AUTH_SECRET || process.env.GITHUB_OAUTH_CLIENT_SECRET || null
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url')
}

export function encodeSession(session: OwnerSession): string {
  const key = signingKey()
  if (!key) throw new Error('No session signing key configured')
  const payload = base64url(JSON.stringify(session))
  return `${payload}.${sign(payload, key)}`
}

export function decodeSession(token: string | undefined | null): OwnerSession | null {
  const key = signingKey()
  if (!token || !key) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload, key)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as OwnerSession
    if (!session?.exp || session.exp < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export async function readSessionCookie(): Promise<OwnerSession | null> {
  const store = await cookies()
  return decodeSession(store.get(COOKIE_NAME)?.value)
}

export async function writeSessionCookie(session: OwnerSession) {
  const store = await cookies()
  store.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

/* --- short-lived OAuth CSRF state ---------------------------------------- */

export async function writeStateCookie(state: string) {
  const store = await cookies()
  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    path: '/',
    maxAge: 600,
  })
}

export async function consumeStateCookie(): Promise<string | null> {
  const store = await cookies()
  const value = store.get(STATE_COOKIE)?.value ?? null
  store.delete(STATE_COOKIE)
  return value
}

/* --- public GitHub sync throttle ----------------------------------------- */

export async function readSyncThrottle(): Promise<number> {
  const store = await cookies()
  return Number(store.get(SYNC_COOKIE)?.value || 0)
}

export async function writeSyncThrottle(at: number) {
  const store = await cookies()
  store.set(SYNC_COOKIE, String(at), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    path: '/',
    maxAge: 3600,
  })
}
