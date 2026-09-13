import { NextResponse } from 'next/server'
import { getPublishedContent } from '@/lib/content/repo'
import { counts } from '@/lib/content/selectors'

export const dynamic = 'force-dynamic'

/**
 * PUBLIC content API.
 *
 * Returns published content only. Draft and unpublished entries are filtered out
 * by the repository before they ever reach this response, so an unpublished entry
 * cannot leak through the public data path.
 */
export async function GET() {
  const { bundle, storage } = await getPublishedContent()
  return NextResponse.json(
    {
      storage,
      counts: counts(bundle),
      profile: bundle.profile,
      founder: bundle.founder,
      projects: bundle.projects,
      research: bundle.research,
      lab: bundle.lab,
      security: bundle.security,
      thoughts: bundle.thoughts,
      milestones: bundle.milestones,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
