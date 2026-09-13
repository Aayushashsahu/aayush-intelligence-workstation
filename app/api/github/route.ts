import { NextResponse } from 'next/server'
import { getGithubData, resolveUsername } from '@/lib/github'

export const dynamic = 'force-dynamic'

/**
 * Server-only GitHub bridge: browser → /api/github → server → GitHub API.
 * GITHUB_TOKEN is read on the server and is never exposed to the client.
 */
export async function GET() {
  const username = resolveUsername()
  try {
    return NextResponse.json(await getGithubData(username), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'github_unavailable', username }, { status: 502 })
  }
}
