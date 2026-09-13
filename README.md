# AAYUSH // INTELLIGENCE WORKSTATION

**AI SYSTEMS · ANALYSIS · PRODUCT**

An AI-lab / operating-environment personal portfolio. It behaves like software rather than a set of
webpages: persistent subsystems, draggable windows, a working terminal, live GitHub telemetry, and an
evidence-first intelligence core.

Security and digital forensics remain as a supporting specialism, not the headline identity.

The system is built to stay useful for years: live data updates itself, and everything GitHub cannot
know is editable from a private control room instead of by editing source code.

## Subsystems

| Subsystem | Role |
| --- | --- |
| `COMMAND` | Command center / home. Live machine state, current work, telemetry strip. |
| `CORTEX` | Intelligence core. Evidence-first reasoning about Aayush; never fabricates. |
| `LAB` | Experiments and research threads, plus a reserved thinking space. |
| `PROJECTS` | Systems archive. Curated dossiers + auto-discovered repositories. |
| `GITHUB` | Live engineering telemetry, contribution calendar, manual `SYNC NOW`. |
| `SECURITY` | Cybersecurity, DFIR, reliability and incident-response depth. |
| `FOUNDER` | Octiq AI and founder operating principles. |
| `TERMINAL` | System control. Commands navigate and drive the interface. |

Plus a `COMPANION` entity that reacts to real system activity.

## Security boundary

The portfolio is public. The ability to *modify* it is private. These are two separate code paths.

```
PUBLIC  browser → /api/github · /api/content · /api/chat   → PUBLISHED data only
OWNER   browser → /api/auth/github/* → signed session → /api/admin/* → reads + writes
```

- `/control` is owner-only and **not linked anywhere** in the public interface — not in the rail, the
  taskbar, the terminal's command list, or CORTEX.
- Authorization is **server-side only**. Every admin page render and every admin route handler calls
  `ownerGuard()` from `lib/auth/guard.ts`. No client flag, redirect, or hidden link is relied on.
- Unauthorised requests to `/control` and `/api/admin/*` get a plain **404**, so a visitor cannot even
  confirm an administrative surface exists.
- Sessions are stateless, HMAC-SHA256 signed, `httpOnly` + `SameSite=Lax`, and the signature, expiry
  and owner login are re-verified on every request (`lib/auth/session.ts`).
- Unpublished entries are filtered out inside the repository layer, so a draft cannot reach the
  public response from `/api/content` at all.

### Enabling auth

Auth is disabled (and `/control` returns 404) until these are set:

1. Create a GitHub OAuth App → callback URL `https://YOUR_DOMAIN/api/auth/github/callback`.
2. Set `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `OWNER_GITHUB_LOGIN`, `AUTH_SECRET`.

Only `OWNER_GITHUB_LOGIN` is allowed in. Every other GitHub account is rejected and the session is
cleared. The guard lives in `lib/auth/guard.ts`, so swapping the provider later does not touch the
control room UI.

## Data model

Three deliberate layers:

| Layer | Source | Updates |
| --- | --- | --- |
| **Live automatic** | GitHub REST + GraphQL | On its own; `SYNC NOW` forces it |
| **Curated** | MongoDB (seed fallback in `content/`) | From `/control` |
| **Derived** | `lib/content/selectors.ts` | Computed from the two above |

### Content domains

`profile` · `founder` · `projects` · `research` · `lab` · `security` · `thoughts` · `milestones`

`profile` and `founder` are singletons; the rest are ordered collections supporting create, edit,
delete, publish/unpublish, feature/unfeature and reorder.

### Seed and fallback

`content/*.ts` holds the committed seed. On first connect the datastore imports it, then the database
becomes the source of truth — editing seed files no longer changes the site.

If `MONGODB_URI` is unset or unreachable, the site serves the seed bundle and the control room reports
`SEED FALLBACK` rather than breaking. The public site never depends on the database being up.

## API surface

```
Public
  GET  /api/github            live telemetry snapshot (token stays server-side)
  POST /api/github/sync       unprivileged refresh; throttled per client + per instance
  GET  /api/content           published content only
  POST /api/chat              CORTEX, grounded in curated content + live GitHub

Auth (owner)
  GET  /api/auth/github/start     → GitHub OAuth
  GET  /api/auth/github/callback  → verifies owner, issues session
  POST /api/auth/logout           → clears session

Admin (owner, 404 otherwise)
  GET    /api/admin/content   entries including drafts
  POST   /api/admin/content   create
  PATCH  /api/admin/content   update
  PUT    /api/admin/content   reorder
  DELETE /api/admin/content   delete
  GET    /api/admin/system    storage + GitHub + auth status
  POST   /api/admin/system    { action: 'sync' | 'revalidate' }
```

`/api/github/sync` is intentionally public but **unprivileged**: it re-reads data GitHub already serves
publicly and returns `forced: false` when a throttle trips instead of pretending to have refreshed.
The forced refetch and index rebuild require the owner.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_USERNAME` | yes | Repository discovery + telemetry |
| `GITHUB_TOKEN` | recommended | Exact contribution calendar via GraphQL |
| `OPENAI_API_KEY` | for CORTEX | Evidence-grounded reasoning |
| `OPENAI_MODEL` | no | Defaults to `gpt-5-mini` |
| `MONGODB_URI` | for persistence | Curated content store |
| `MONGODB_DB` | no | Defaults to the URI's database, else `workstation` |
| `OWNER_GITHUB_LOGIN` | for auth | The only login allowed into `/control` |
| `GITHUB_OAUTH_CLIENT_ID` / `_SECRET` | for auth | GitHub OAuth App |
| `AUTH_SECRET` | recommended | Session signing key |

All secrets are read server-side only. There is deliberately no `NEXT_PUBLIC_*` secret.

## Local setup

```bash
npm install
cp .env.example .env.local     # fill in what you have; everything is optional
npm run dev
npm run typecheck              # tsc --noEmit
npm run build
```

The workstation renders fully with an empty `.env.local` — it degrades to seed content and shows its
telemetry sources honestly rather than inventing data.

## Guarantees

- **No fabricated claims.** CORTEX treats unknown fields as unknown, separates evidence from inference,
  and always surfaces gaps and what an interviewer should verify. No invented employers, dates,
  metrics, certifications, responsibilities or traction.
- **No fabricated progress.** Sync states reflect real phases. Contribution source is always labelled
  `graphql` (exact) or `events-fallback` (estimate).
- **No hard-coded repository list.** Add a public, non-fork, non-archived repo on GitHub and it appears
  in the archive automatically.
