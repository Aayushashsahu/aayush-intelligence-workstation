/**
 * Client-safe content surface.
 *
 * Contains the content schema (types) and pure selectors only. Server-only
 * modules — the datastore repository and the seed bundle — live in
 * `lib/content/repo.ts` and `content/index.ts` and must never be imported here,
 * or the seed data would end up in the browser bundle.
 */
export * from '@/lib/types'
export * from './selectors'
