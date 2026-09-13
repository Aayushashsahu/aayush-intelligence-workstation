import { NextResponse, type NextRequest } from 'next/server'
import { callbackUrl, exchangeCode, fetchGithubIdentity, isOwner, oauthConfigured } from '@/lib/auth/github'
import { SESSION_MAX_AGE_S, consumeStateCookie, writeSessionCookie } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

/** Any failure returns the same opaque 404 — never a hint that admin exists. */
const opaque = () => new NextResponse(null, { status: 404 })

export async function GET(req: NextRequest) {
  if (!oauthConfigured()) return opaque()

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expectedState = await consumeStateCookie()

  // CSRF: the state cookie must exist and match exactly.
  if (!code || !state || !expectedState || state !== expectedState) return opaque()

  try {
    const accessToken = await exchangeCode(code, callbackUrl(url.origin))
    const identity = await fetchGithubIdentity(accessToken)

    // Authorised but not the owner: refuse and leave no session behind.
    if (!isOwner(identity)) return opaque()

    await writeSessionCookie({
      login: identity.login,
      name: identity.name ?? undefined,
      avatarUrl: identity.avatar_url ?? undefined,
      provider: 'github',
      exp: Date.now() + SESSION_MAX_AGE_S * 1000,
    })

    return NextResponse.redirect(new URL('/control', url.origin))
  } catch {
    return opaque()
  }
}
