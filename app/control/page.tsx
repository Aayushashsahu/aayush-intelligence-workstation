import Link from 'next/link'
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import ControlRoom from '@/components/control/ControlRoom'
import { getOwnerSession } from '@/lib/auth/guard'
import { ownerLogin, oauthConfigured } from '@/lib/auth/github'
import { getAdminData } from '@/lib/content/repo'
import { Led } from '@/components/ui/Primitives'

export const dynamic = 'force-dynamic'

/**
 * OWNER-ONLY control room.
 *
 * The authorization check is enforced on the server.
 * When authenticated as the verified owner, the full control room renders.
 * When unauthenticated, the owner login gateway renders with the GitHub OAuth handshake trigger.
 */
export default async function ControlPage() {
  const session = await getOwnerSession()

  if (!session) {
    const configured = oauthConfigured()
    const targetOwner = ownerLogin()

    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="panel relative w-full max-w-lg border border-[var(--amber-line)] bg-[rgba(12,12,14,0.96)] p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="mono flex items-center gap-2 text-[9px] tk-lg text-[var(--amber)]">
              <Led tone="amber" pulse />
              <span>CONTROL ROOM // OWNER GATE</span>
            </div>
            <span className="mono text-[8px] text-[var(--dim)]">RESTRICTED SUBSYSTEM</span>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center border border-[var(--amber-line)] bg-[var(--amber-wash)] text-[var(--amber)]">
                <Lock size={18} />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">
                  Owner Authentication Required
                </h1>
                <p className="mono text-[10px] text-[var(--muted)]">
                  AUTHORITY TARGET // @{targetOwner}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              This environment provides administrative control over published engineering case files, telemetry synchronization, and workstation configuration.
            </p>

            <div className="panel-flat mt-5 p-4 border-l-2 border-l-[var(--amber)]">
              <div className="mono text-[8px] tk-lg text-[var(--amber)] mb-1 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                SECURITY BOUNDARY
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Access is verified cryptographically using server-side GitHub OAuth. Any non-owner account is automatically rejected and denied session generation.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              {configured ? (
                <a
                  href="/api/auth/github/start"
                  className="btn btn-amber flex w-full items-center justify-center gap-2 py-3 text-xs tracking-wider font-semibold"
                >
                  <span>AUTHENTICATE WITH GITHUB</span>
                  <ArrowRight size={14} />
                </a>
              ) : (
                <div className="mono p-3 text-center text-xs text-[var(--danger)] border border-red-900/40 bg-red-950/20">
                  GITHUB OAUTH CREDENTIALS NOT CONFIGURED ON SERVER
                </div>
              )}

              <Link
                href="/"
                className="mono flex items-center justify-center py-2 text-[10px] text-[var(--dim)] hover:text-[var(--text)] transition-colors"
              >
                ← RETURN TO WORKSTATION
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const data = await getAdminData()

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <ControlRoom initial={data} ownerLogin={session.login || ownerLogin()} />
    </div>
  )
}
