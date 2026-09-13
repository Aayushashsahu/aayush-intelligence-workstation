import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getGithubData, resolveUsername } from '@/lib/github'
import { readSyncThrottle, writeSyncThrottle } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

const THROTTLE_MS = 60_000

/**
 * Instance-wide throttle for forced upstream fetches.
 *
 * Best effort: serverless instances each hold their own copy, so this bounds
 * abuse per instance rather than globally. It exists so an unauthenticated
 * caller cannot spin the GitHub API (and the token's rate limit) in a loop.
 */
let lastForcedAt = 0

/**
 * UNPRIVILEGED refresh of GitHub telemetry.
 *
 * This only re-reads data GitHub already serves publicly — no secrets are
 * returned and nothing privileged changes, so it stays on the public path that
 * SYNC NOW uses. Two throttles apply: a per-client httpOnly cookie, plus an
 * instance-wide minimum interval between real upstream fetches. When either
 * trips, the caller gets the cached snapshot plus `forced: false` rather than a
 * fake success.
 *
 * PRIVILEGED operations — forced refetch on demand and index rebuild — require
 * the owner and live behind ownerGuard() at /api/admin/system.
 */
export async function POST() {
  const username = resolveUsername()
  const now = Date.now()
  const clientThrottled = now - (await readSyncThrottle()) < THROTTLE_MS
  const instanceThrottled = now - lastForcedAt < THROTTLE_MS
  const forced = !clientThrottled && !instanceThrottled

  try {
    const data = await getGithubData(username, { force: forced })
    if (forced) {
      lastForcedAt = now
      await writeSyncThrottle(now)
      try {
        revalidatePath('/')
      } catch {
        // best effort — a stale page is preferable to a failed sync
      }
    }
    return NextResponse.json(
      { ...data, forced, throttled: !forced },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'github_unavailable', username }, { status: 502 })
  }
}
