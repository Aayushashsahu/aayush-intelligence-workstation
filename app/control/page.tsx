import { notFound } from 'next/navigation'
import ControlRoom from '@/components/control/ControlRoom'
import { getOwnerSession } from '@/lib/auth/guard'
import { ownerLogin } from '@/lib/auth/github'
import { getAdminData } from '@/lib/content/repo'

/*
 * No `metadata` export, deliberately.
 *
 * A static `metadata` (or `generateMetadata`) export is serialised into the RSC
 * payload of *every* response for this segment — including the 404 an
 * unauthorised visitor receives — which would advertise the control room in the
 * page source. With no metadata the segment contributes nothing and its 404 is
 * byte-comparable to an unknown path.
 */
export const dynamic = 'force-dynamic'

/**
 * OWNER-ONLY control room.
 *
 * The authorisation check happens here on the server before anything is rendered.
 * An unauthenticated visitor receives `notFound()` — the same 404 as any unknown
 * path — so the existence of this route is never disclosed, and no administrative
 * data, counts, drafts or configuration is ever sent to their browser.
 */
export default async function ControlPage() {
  const session = await getOwnerSession()
  if (!session) notFound()

  const data = await getAdminData()

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <ControlRoom initial={data} ownerLogin={session.login || ownerLogin()} />
    </div>
  )
}
