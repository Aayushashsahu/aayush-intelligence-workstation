import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { authorizeUrl, callbackUrl, oauthConfigured } from '@/lib/auth/github'
import { writeStateCookie } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Fail closed: with no auth configuration there is no way in, and no hint that a way exists.
  if (!oauthConfigured()) return new NextResponse(null, { status: 404 })

  let redirectUri: string
  try {
    redirectUri = callbackUrl()
  } catch (err: any) {
    console.error('[OAuth Start Error] Failed to resolve canonical callbackUrl:', err?.message || err)
    return new NextResponse('OAuth misconfigured: APP_URL is missing in production.', { status: 500 })
  }

  const state = randomUUID()
  await writeStateCookie(state)

  return NextResponse.redirect(authorizeUrl(state, redirectUri))
}
