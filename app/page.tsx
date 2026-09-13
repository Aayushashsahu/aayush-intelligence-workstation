import Workstation from '@/components/workstation/Workstation'
import { getGithubData, resolveUsername } from '@/lib/github'
import { getPublishedContent } from '@/lib/content/repo'
import type { GithubData } from '@/lib/types'

// Live telemetry and published content, refreshed on a short interval.
export const revalidate = 120

export default async function Home() {
  // Content never throws: it falls back to the committed seed bundle.
  const [content, initialGithub] = await Promise.all([
    getPublishedContent(),
    getGithubData(resolveUsername()).catch((): GithubData | null => null),
  ])

  return (
    <Workstation
      initialGithub={initialGithub}
      initialContent={content.bundle}
      contentStorage={content.storage}
    />
  )
}
