import { NextResponse, type NextRequest } from 'next/server'

/**
 * Boundary pre-filter for owner-only surfaces.
 *
 * This runs before any Node route handler or page render, and does exactly one
 * thing: if the request carries no session cookie at all, it is answered with
 * the same 404 that an unknown path receives. That matters for two reasons:
 *
 *   1. Response parity — because the guarded route never renders, its 404 is
 *      byte-comparable to any other missing path, so a visitor cannot
 *      fingerprint which addresses are administratively meaningful.
 *   2. No wasted work — anonymous probes never open a datastore connection or
 *      touch the session/owner checks.
 *
 * It deliberately performs NO authorisation of its own. A cookie is never
 * trusted here: it may be forged, expired or belong to a non-owner. Every
 * request that gets past this point is still verified by the authoritative
 * server-side guard in `lib/auth/guard.ts`, which re-checks the HMAC signature,
 * the expiry and the owner login. This file therefore cannot introduce an auth
 * bypass — removing it would weaken nothing but the response shape.
 */

const SESSION_COOKIE = 'ws_session'

/** A path guaranteed not to match a route, used to render the standard 404. */
const ABSENT_PATH = '/__unresolved'

export function middleware(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value) {
    // Fall through to the real guard, which is the authority.
    return NextResponse.next()
  }

  // API probes get an empty 404, matching what the admin handlers already return.
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 404 })
  }

  // Page probes get the normal branded 404 via the not-found boundary.
  const url = req.nextUrl.clone()
  url.pathname = ABSENT_PATH
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/control', '/control/:path*', '/api/admin/:path*'],
}
