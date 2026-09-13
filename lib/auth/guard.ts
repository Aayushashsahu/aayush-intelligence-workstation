import { NextResponse } from 'next/server'
import { readSessionCookie } from '@/lib/auth/session'
import { isOwner, oauthConfigured, ownerLogin } from '@/lib/auth/github'
import type { OwnerSession } from '@/lib/types'

/**
 * SERVER-ONLY authorisation gate.
 *
 * Every admin surface — page, route handler, server action — must call this.
 * It fails closed: if the auth environment is not configured, or the session is
 * missing/expired/forged, or the login is not the owner, access is refused.
 */

export function authConfigured(): boolean {
  return oauthConfigured()
}

/**
 * The verified owner session, or null. Re-validates the owner login every time.
 *
 * Deliberately pure: it must not touch response cookies. This runs during Server
 * Component render as well as inside route handlers, and mutating cookies from a
 * render throws (Next only permits mutation in a Route Handler or Server Action)
 * — which turned a rejected non-owner session into a 500 instead of a 404.
 * Clearing a rejected cookie is the job of the auth route handlers.
 */
export async function getOwnerSession(): Promise<OwnerSession | null> {
  if (!authConfigured()) return null
  const session = await readSessionCookie()
  if (!session) return null
  if (session.provider !== 'github') return null
  if (!isOwner({ login: session.login })) return null
  return session
}

/** True only for the verified owner. */
export async function isOwnerRequest(): Promise<boolean> {
  return (await getOwnerSession()) !== null
}

/**
 * Route-handler guard. Returns a 404 (not 401/403) so an unauthorised visitor
 * cannot even confirm that an administrative surface exists here.
 */
export async function ownerGuard(): Promise<NextResponse | null> {
  if (await isOwnerRequest()) return null
  return new NextResponse(null, { status: 404 })
}

export function ownerLoginHint(): string {
  return ownerLogin()
}
