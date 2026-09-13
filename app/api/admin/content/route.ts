import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ownerGuard } from '@/lib/auth/guard'
import {
  createEntry,
  deleteEntry,
  getAdminData,
  reorderEntries,
  updateEntry,
} from '@/lib/content/repo'
import { storageConfigured } from '@/lib/db'
import { SINGLETON_TYPES, type ContentType } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * Writes need a datastore. Without one the control room is read-only over the
 * committed seed, so answer 503 with a fixable reason instead of a 500 that
 * looks like a crash.
 */
function requireStorage(): NextResponse | null {
  if (storageConfigured()) return null
  return NextResponse.json(
    { error: 'storage_not_configured', detail: 'Set MONGODB_URI to enable content writes.' },
    { status: 503 },
  )
}

const TYPES: ContentType[] = [
  'profile',
  'founder',
  'projects',
  'research',
  'lab',
  'security',
  'thoughts',
  'milestones',
]

function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (TYPES as string[]).includes(value)
}

function refreshPublicSurfaces() {
  try {
    revalidatePath('/')
    revalidatePath('/control')
  } catch {
    // best effort
  }
}

/** GET — every entry including drafts. Owner only. */
export async function GET() {
  const denied = await ownerGuard()
  if (denied) return denied

  const data = await getAdminData()
  return NextResponse.json({ ...data, singletonTypes: SINGLETON_TYPES }, { headers: { 'Cache-Control': 'no-store' } })
}

/** POST — create an entry (or save a singleton domain). Owner only. */
export async function POST(req: NextRequest) {
  const denied = await ownerGuard()
  if (denied) return denied
  const noStorage = requireStorage()
  if (noStorage) return noStorage

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { type, data } = body ?? {}
  if (!isContentType(type) || !data || typeof data !== 'object') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  try {
    const doc = await createEntry(type, data)
    refreshPublicSurfaces()
    return NextResponse.json({ ok: true, entry: doc })
  } catch (error: any) {
    return NextResponse.json({ error: 'write_failed', detail: String(error?.message || error) }, { status: 500 })
  }
}

/** PATCH — update an entry. Owner only. */
export async function PATCH(req: NextRequest) {
  const denied = await ownerGuard()
  if (denied) return denied
  const noStorage = requireStorage()
  if (noStorage) return noStorage

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { type, id, patch } = body ?? {}
  if (!isContentType(type) || typeof id !== 'string' || !patch || typeof patch !== 'object') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  try {
    await updateEntry(type, id, patch)
    refreshPublicSurfaces()
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'write_failed', detail: String(error?.message || error) }, { status: 500 })
  }
}

/** PUT — reorder a domain. Owner only. */
export async function PUT(req: NextRequest) {
  const denied = await ownerGuard()
  if (denied) return denied
  const noStorage = requireStorage()
  if (noStorage) return noStorage

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { type, ids } = body ?? {}
  if (!isContentType(type) || !Array.isArray(ids) || ids.some((i: unknown) => typeof i !== 'string')) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  const result = await reorderEntries(type, ids)
  refreshPublicSurfaces()
  return NextResponse.json({ ok: true, ...result })
}

/** DELETE — remove an entry. Owner only. */
export async function DELETE(req: NextRequest) {
  const denied = await ownerGuard()
  if (denied) return denied
  const noStorage = requireStorage()
  if (noStorage) return noStorage

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { type, id } = body ?? {}
  if (!isContentType(type) || typeof id !== 'string') {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }
  if (SINGLETON_TYPES.includes(type)) {
    return NextResponse.json({ error: 'singleton_not_deletable' }, { status: 400 })
  }

  await deleteEntry(type, id)
  refreshPublicSurfaces()
  return NextResponse.json({ ok: true })
}
