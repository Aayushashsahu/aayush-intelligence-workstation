import { randomUUID } from 'node:crypto'
import type { Db } from 'mongodb'
import { getDb, storageConfigured } from '@/lib/db'
import { seedBundle } from '@/content'
import { byOrder, isPublished } from '@/lib/content/selectors'
import {
  SINGLETON_TYPES,
  type AdminBundle,
  type ContentBundle,
  type ContentType,
} from '@/lib/types'

/**
 * SERVER-ONLY content repository.
 *
 * Reads: the public surface only ever receives published entries.
 * Writes: called exclusively from authenticated admin route handlers.
 * Fallback: if MONGODB_URI is missing or unreachable the committed seed bundle is
 * served, so the public workstation never breaks.
 */

const COLL = 'entries'
const META = 'meta'
const SEED_VERSION = 4

const LIST_TYPES = ['projects', 'research', 'lab', 'security', 'thoughts', 'milestones'] as const
type ListType = (typeof LIST_TYPES)[number]

/* -------------------------------------------------------------------------- */
/* cache                                                                      */
/* -------------------------------------------------------------------------- */

let publishedCache: { at: number; bundle: ContentBundle } | null = null
const CACHE_TTL_MS = 15_000

export function invalidateContentCache() {
  publishedCache = null
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

function strip(doc: any) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

function seedPublishedBundle(): ContentBundle {
  return {
    profile: seedBundle.profile,
    founder: seedBundle.founder,
    projects: byOrder(seedBundle.projects.filter(isPublished)),
    research: byOrder(seedBundle.research.filter(isPublished)),
    lab: byOrder(seedBundle.lab.filter(isPublished)),
    security: byOrder(seedBundle.security.filter(isPublished)),
    thoughts: byOrder(seedBundle.thoughts.filter(isPublished)),
    milestones: byOrder(seedBundle.milestones.filter(isPublished)),
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/** One-time, version-gated seed. Deleted entries are never resurrected. */
async function ensureSeed(db: Db) {
  const meta = db.collection(META)
  const marker: any = await meta.findOne({ _id: 'seed' as any })
  const previousVersion = marker ? Number(marker.version) : 0

  if (marker && previousVersion >= SEED_VERSION) return

  const entries = db.collection(COLL)
  const now = new Date().toISOString()

  // Migration to v3: Purge any initial fabricated research/lab seed items
  if (previousVersion > 0 && previousVersion < 3) {
    await entries.deleteMany({ type: { $in: ['research', 'lab'] } })
  }

  // Migration to v4: ensure profile gets updated with verified email and linkedin
  if (previousVersion > 0 && previousVersion < 4) {
    await entries.updateOne(
      { type: 'profile' },
      {
        $set: {
          email: seedBundle.profile.email,
          linkedin: seedBundle.profile.linkedin,
          updatedAt: now,
        },
      },
    )
  }

  for (const type of LIST_TYPES) {
    const existing = await entries.countDocuments({ type })
    if (existing > 0) continue
    const seed = byOrder((seedBundle[type] as any[]) || [])
    if (!seed.length) continue
    await entries.insertMany(
      seed.map((entry, index) => ({
        ...entry,
        type,
        id: entry.id || `${type}-${index + 1}`,
        published: entry.published !== false,
        order: typeof entry.order === 'number' ? entry.order : index,
        createdAt: entry.createdAt || now,
        updatedAt: now,
      })),
    )
  }

  for (const type of SINGLETON_TYPES) {
    const existing = await entries.findOne({ type })
    if (!existing) {
      await entries.insertOne({
        ...(seedBundle as any)[type],
        type,
        id: type,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  await meta.updateOne(
    { _id: 'seed' as any },
    { $set: { version: SEED_VERSION, seededAt: now } },
    { upsert: true },
  )
}

/* -------------------------------------------------------------------------- */
/* reads                                                                      */
/* -------------------------------------------------------------------------- */

async function readBundle(db: Db, opts: { onlyPublished: boolean }): Promise<ContentBundle> {
  const entries = db.collection(COLL)
  const docs = (await entries.find({}).toArray()).map(strip)

  const list = (type: ListType) => {
    const forType = docs.filter((d: any) => d.type === type)
    const visible = opts.onlyPublished ? forType.filter(isPublished) : forType
    return byOrder(visible as any[])
  }

  const singleton = (type: ContentType) => {
    const doc = docs.find((d: any) => d.type === type)
    return doc ? { ...(seedBundle as any)[type], ...doc } : (seedBundle as any)[type]
  }

  return {
    profile: singleton('profile'),
    founder: singleton('founder'),
    projects: list('projects') as ContentBundle['projects'],
    research: list('research') as ContentBundle['research'],
    lab: list('lab') as ContentBundle['lab'],
    security: list('security') as ContentBundle['security'],
    thoughts: list('thoughts') as ContentBundle['thoughts'],
    milestones: list('milestones') as ContentBundle['milestones'],
  }
}

/**
 * The public read path. Returns published content only.
 */
export async function getPublishedContent(): Promise<{
  bundle: ContentBundle
  storage: 'mongodb' | 'seed'
}> {
  if (!storageConfigured()) {
    return { bundle: seedPublishedBundle(), storage: 'seed' }
  }
  if (publishedCache && Date.now() - publishedCache.at < CACHE_TTL_MS) {
    return { bundle: publishedCache.bundle, storage: 'mongodb' }
  }
  try {
    const db = await getDb()
    await ensureSeed(db)
    const bundle = await readBundle(db, { onlyPublished: true })
    publishedCache = { at: Date.now(), bundle }
    return { bundle, storage: 'mongodb' }
  } catch {
    // Unreachable datastore must never take the public site down.
    return { bundle: seedPublishedBundle(), storage: 'seed' }
  }
}

/** Admin read path — includes drafts. Callers must have verified the owner. */
export async function getAdminData(): Promise<AdminBundle> {
  const empty = {
    projects: [],
    research: [],
    lab: [],
    security: [],
    thoughts: [],
    milestones: [],
  }

  const tally = (bundle: ContentBundle) => ({
    profile: 1,
    founder: 1,
    projects: bundle.projects.length,
    research: bundle.research.length,
    lab: bundle.lab.length,
    security: bundle.security.length,
    thoughts: bundle.thoughts.length,
    milestones: bundle.milestones.length,
  }) as Record<ContentType, number>

  if (!storageConfigured()) {
    const published = seedPublishedBundle()
    return { published, drafts: empty, storage: 'seed', counts: tally(published) }
  }

  try {
    const db = await getDb()
    await ensureSeed(db)
    const all = await readBundle(db, { onlyPublished: false })
    const published = await readBundle(db, { onlyPublished: true })

    const draftOf = <T extends { published?: boolean; order?: number }>(items: T[]) =>
      byOrder(items.filter((e) => !isPublished(e)))

    return {
      published,
      drafts: {
        projects: draftOf(all.projects),
        research: draftOf(all.research),
        lab: draftOf(all.lab),
        security: draftOf(all.security),
        thoughts: draftOf(all.thoughts),
        milestones: draftOf(all.milestones),
      },
      storage: 'mongodb',
      counts: tally(published),
    }
  } catch {
    const published = seedPublishedBundle()
    return { published, drafts: empty, storage: 'seed', counts: tally(published) }
  }
}

export async function getStorageStatus() {
  if (!storageConfigured()) {
    return { configured: false, reachable: false, error: null as string | null }
  }
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    return { configured: true, reachable: true, error: null as string | null }
  } catch (error: any) {
    return {
      configured: true,
      reachable: false,
      error: String(error?.message || error).slice(0, 300),
    }
  }
}

/* -------------------------------------------------------------------------- */
/* writes (admin only — callers must verify the owner first)                  */
/* -------------------------------------------------------------------------- */

function isSingleton(type: ContentType) {
  return SINGLETON_TYPES.includes(type)
}

export async function saveSingleton(type: ContentType, data: Record<string, unknown>) {
  const db = await getDb()
  await ensureSeed(db)
  const now = new Date().toISOString()
  await db
    .collection(COLL)
    .updateOne(
      { type },
      { $set: { ...data, type, id: type, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
  invalidateContentCache()
  return { id: type, type }
}

export async function createEntry(type: ContentType, data: Record<string, unknown>) {
  if (isSingleton(type)) return saveSingleton(type, data)

  const db = await getDb()
  await ensureSeed(db)
  const entries = db.collection(COLL)
  const now = new Date().toISOString()
  const id = String(data.id || slugify(String(data.title || '')) || randomUUID())
  const order =
    typeof data.order === 'number' ? data.order : await entries.countDocuments({ type })

  const doc = {
    ...data,
    id,
    type,
    published: data.published !== false,
    order,
    createdAt: now,
    updatedAt: now,
  }
  await entries.updateOne({ type, id }, { $set: doc }, { upsert: true })
  invalidateContentCache()
  return doc
}

export async function updateEntry(type: ContentType, id: string, patch: Record<string, unknown>) {
  if (isSingleton(type)) return saveSingleton(type, patch)

  const db = await getDb()
  const now = new Date().toISOString()
  const { _id, type: _ignored, id: _idIgnored, ...safe } = patch as any
  await db.collection(COLL).updateOne({ type, id }, { $set: { ...safe, updatedAt: now } })
  invalidateContentCache()
  return { id, type }
}

export async function deleteEntry(type: ContentType, id: string) {
  const db = await getDb()
  await db.collection(COLL).deleteOne({ type, id })
  invalidateContentCache()
  return { id, type }
}

export async function reorderEntries(type: ContentType, ids: string[]) {
  const db = await getDb()
  const now = new Date().toISOString()
  const ops = ids.map((id, index) => ({
    updateOne: {
      filter: { type, id },
      update: { $set: { order: index, updatedAt: now } },
    },
  }))
  if (ops.length) await db.collection(COLL).bulkWrite(ops)
  invalidateContentCache()
  return { type, count: ops.length }
}
