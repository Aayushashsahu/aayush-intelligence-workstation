import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { authorizeUrl, callbackUrl, oauthConfigured } from '@/lib/auth/github'
import { writeStateCookie } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Fail closed: with no auth configuration there is no way in, and no hint that a way exists.
  if (!oauthConfigured()) return new NextResponse(null, { status: 404 })

  const origin = new URL(req.url).origin
  const state = randomUUID()
  await writeStateCookie(state)

  return NextResponse.redirect(authorizeUrl(state, callbackUrl(origin)))
}
