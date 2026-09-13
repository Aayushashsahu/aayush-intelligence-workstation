'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ContentBundle } from '@/lib/types'

/**
 * Holds the PUBLISHED content bundle that the public workstation renders.
 *
 * The bundle is produced server-side (published entries only) and handed in as a
 * prop, so draft content is never part of the client payload. `refresh()` re-reads
 * the public API, which applies the same published-only filter.
 */

type ContentStore = {
  bundle: ContentBundle
  storage: 'mongodb' | 'seed'
  refresh: () => Promise<void>
  replace: (next: ContentBundle) => void
}

const Ctx = createContext<ContentStore | null>(null)

export function ContentProvider({
  initial,
  storage = 'seed',
  children,
}: {
  initial: ContentBundle
  storage?: 'mongodb' | 'seed'
  children: ReactNode
}) {
  const [bundle, setBundle] = useState<ContentBundle>(initial)
  const [source, setSource] = useState<'mongodb' | 'seed'>(storage)

  const replace = useCallback((next: ContentBundle) => setBundle(next), [])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setBundle({
        profile: data.profile,
        founder: data.founder,
        projects: data.projects ?? [],
        research: data.research ?? [],
        lab: data.lab ?? [],
        security: data.security ?? [],
        thoughts: data.thoughts ?? [],
        milestones: data.milestones ?? [],
      })
      if (data.storage) setSource(data.storage)
    } catch {
      // keep the last known good bundle
    }
  }, [])

  const value = useMemo<ContentStore>(
    () => ({ bundle, storage: source, refresh, replace }),
    [bundle, source, refresh, replace],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useContentStore(): ContentStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useContentStore must be used inside <ContentProvider>')
  return ctx
}

/** The published content bundle. */
export function useContent(): ContentBundle {
  return useContentStore().bundle
}
