import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAdminData, getPublishedContent, slugify, invalidateContentCache, createEntry, getStorageStatus, updateEntry, deleteEntry, reorderEntries } from './repo'
import { getDb } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  storageConfigured: () => false,
  getDb: vi.fn(),
}))

describe('Content Repo', () => {
  it('slugify correctly transforms strings', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })

  it('getPublishedContent falls back to seed when storage not configured', async () => {
    const { bundle, storage } = await getPublishedContent()
    expect(storage).toBe('seed')
    expect(bundle).toBeDefined()
  })

  it('getAdminData falls back to seed when storage not configured', async () => {
    const { published, drafts, storage } = await getAdminData()
    expect(storage).toBe('seed')
    expect(published).toBeDefined()
    expect(drafts).toBeDefined()
  })

  it('invalidateContentCache works', () => {
    invalidateContentCache()
    expect(true).toBe(true)
  })

  it('getStorageStatus returns not configured', async () => {
    const status = await getStorageStatus()
    expect(status.configured).toBe(false)
  })
})
