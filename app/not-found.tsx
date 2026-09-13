import Link from 'next/link'

/**
 * Root 404 boundary.
 *
 * This is deliberately the *same* response for an unknown path and for an
 * unauthorised request to an owner-only route, so a visitor cannot fingerprint
 * which paths are administratively meaningful. It reveals nothing about what
 * exists on the server — only that this address does not.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="panel w-full max-w-lg p-8">
        <div className="mono text-[9px] tracking-[0.22em] text-[var(--amber)]">
          404 // ADDRESS NOT RESOLVED
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">No such subsystem.</h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          This address is not part of the workstation. Nothing is exposed here.
        </p>

        <Link
          href="/"
          className="mono mt-7 inline-flex items-center gap-2 rounded-md border border-[var(--line-2)] px-3.5 py-2 text-[10px] tracking-[0.18em] text-[var(--muted)] transition-colors hover:border-[var(--amber)] hover:text-[var(--text)]"
        >
          RETURN TO COMMAND
        </Link>
      </div>
    </main>
  )
}
