import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ownerGuard } from '@/lib/auth/guard'
import { getGithubData, resolveUsername } from '@/lib/github'
import { getStorageStatus, invalidateContentCache } from '@/lib/content/repo'
import { authConfigured } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

/** GET — system status for the control room. Owner only. */
export async function GET() {
  const denied = await ownerGuard()
  if (denied) return denied

  const storage = await getStorageStatus()
  return NextResponse.json(
    {
      storage,
      github: {
        username: resolveUsername(),
        tokenConfigured: Boolean(process.env.GITHUB_TOKEN),
        oauthOwner: process.env.OWNER_GITHUB_LOGIN || null,
      },
      authConfigured: authConfigured(),
      checkedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

/** POST — privileged actions: forced GitHub sync and index rebuild. Owner only. */
export async function POST(req: NextRequest) {
  const denied = await ownerGuard()
  if (denied) return denied

  let action = ''
  try {
    action = (await req.json())?.action ?? ''
  } catch {
    action = ''
  }

  if (action === 'sync') {
    try {
      const data = await getGithubData(resolveUsername(), { force: true })
      revalidatePath('/')
      return NextResponse.json({
        ok: true,
        fetchedAt: data.fetchedAt,
        repos: data.repos.length,
        source: data.source,
        contributions: data.contributionTotal,
      })
    } catch {
      return NextResponse.json({ ok: false, error: 'github_unavailable' }, { status: 502 })
    }
  }

  if (action === 'revalidate') {
    invalidateContentCache()
    revalidatePath('/')
    revalidatePath('/control')
    return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() })
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 })
}
