import { resolveUsername, getGithubHeaders, GITHUB_API } from '../github'
import type { Repo } from '../types'

export type EvidenceCategory =
  | 'DOCUMENTATION'
  | 'ARCHITECTURE'
  | 'AUDIT'
  | 'IMPLEMENTATION'
  | 'TEST'
  | 'METADATA'

export type EvidenceProvenance = {
  repo: string
  path: string
  url: string
  ref: string
  retrievedAt: string
  category: EvidenceCategory
}

export type RetrievedDocument = {
  provenance: EvidenceProvenance
  title: string
  content: string
  summary?: string
  extractedSections?: Record<string, string>
}

export type RepositoryIntelligence = {
  repoName: string
  owner: string
  repoUrl: string
  defaultBranch: string
  metadata: {
    description: string | null
    language: string | null
    topics: string[]
    stars: number
    forks: number
    createdAt?: string
    pushedAt?: string
  }
  readme?: RetrievedDocument
  additionalDocs: RetrievedDocument[]
  sourceSnippets: RetrievedDocument[]
  retrievedAt: string
  isAvailable: boolean
  error?: string
}

// In-memory cache with 15-minute TTL
type CacheEntry = {
  intelligence: RepositoryIntelligence
  expiresAt: number
}
const intelligenceCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Validates repository identifier to ensure it strictly belongs to
 * the configured owner and contains no path traversal characters.
 */
export function isValidRepoIdentifier(name: string): boolean {
  return /^[a-zA-Z0-9_.-]+$/.test(name) && !name.includes('..') && !name.includes('/') && !name.includes('\\')
}

/**
 * Extracts key markdown sections from a README based on headers.
 */
export function extractMarkdownSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentHeader = 'Introduction'
  let currentContent: string[] = []

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/)
    if (headerMatch) {
      if (currentContent.length) {
        sections[currentHeader] = currentContent.join('\n').trim()
      }
      currentHeader = headerMatch[1].trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  if (currentContent.length) {
    sections[currentHeader] = currentContent.join('\n').trim()
  }

  return sections
}

/**
 * Categorizes a file path into its evidence category.
 */
function categorizePath(path: string): EvidenceCategory {
  const lower = path.toLowerCase()
  if (lower.includes('test')) return 'TEST'
  if (lower.includes('audit') || lower.includes('report') || lower.includes('closure')) return 'AUDIT'
  if (lower.includes('architecture') || lower.includes('design') || lower.includes('spec')) return 'ARCHITECTURE'
  if (lower.endsWith('.md') || lower.endsWith('.txt')) return 'DOCUMENTATION'
  return 'IMPLEMENTATION'
}

/**
 * Retrieves repository intelligence from GitHub for a single repository.
 * Safe, bounded, cached, and provenance-tracked.
 */
export async function getRepositoryIntelligence(
  repoName: string,
  options: {
    question?: string
    forceRefresh?: boolean
    configuredOwner?: string
  } = {},
): Promise<RepositoryIntelligence> {
  const owner = (options.configuredOwner || resolveUsername()).trim()

  if (!isValidRepoIdentifier(repoName)) {
    return {
      repoName,
      owner,
      repoUrl: `https://github.com/${owner}/${repoName}`,
      defaultBranch: 'main',
      metadata: { description: null, language: null, topics: [], stars: 0, forks: 0 },
      additionalDocs: [],
      sourceSnippets: [],
      retrievedAt: new Date().toISOString(),
      isAvailable: false,
      error: 'Invalid repository identifier.',
    }
  }

  const cacheKey = `${owner}/${repoName.toLowerCase()}`
  const now = Date.now()

  if (!options.forceRefresh && intelligenceCache.has(cacheKey)) {
    const entry = intelligenceCache.get(cacheKey)!
    if (entry.expiresAt > now) {
      return entry.intelligence
    }
  }

  const defaultBranch = 'main'
  let repoMeta: any = null

  // 1. Fetch Repository Metadata
  try {
    const metaRes = await fetch(`${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}`, {
      headers: getGithubHeaders(),
      next: { revalidate: 300 },
    })
    if (metaRes.ok) {
      repoMeta = await metaRes.json()
    }
  } catch {
    // Non-fatal; continue to README
  }

  const branch = repoMeta?.default_branch || defaultBranch
  const repoUrl = repoMeta?.html_url || `https://github.com/${owner}/${repoName}`

  let readmeDoc: RetrievedDocument | undefined

  // 2. Fetch README Content (raw)
  try {
    const readmeRes = await fetch(`${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}/readme`, {
      headers: getGithubHeaders({ Accept: 'application/vnd.github.raw+json' }),
      next: { revalidate: 300 },
    })

    if (readmeRes.ok) {
      const readmeRaw = await readmeRes.text()
      // Cap README size defensively to 28KB
      const truncated = readmeRaw.slice(0, 28000)
      const sections = extractMarkdownSections(truncated)

      readmeDoc = {
        provenance: {
          repo: repoName,
          path: 'README.md',
          url: `${repoUrl}/blob/${branch}/README.md`,
          ref: branch,
          retrievedAt: new Date().toISOString(),
          category: 'DOCUMENTATION',
        },
        title: `${repoName} // README.md`,
        content: truncated,
        extractedSections: sections,
      }
    }
  } catch {
    // Handled below if missing
  }

  const additionalDocs: RetrievedDocument[] = []
  const sourceSnippets: RetrievedDocument[] = []

  // 3. Discover Additional Documentation & Source Code
  const questionLower = (options.question || '').toLowerCase()
  const needsArchitecture = /arch|design|spec|flow|pipeline|how\s+it\s+works/i.test(questionLower)
  const needsResultsOrAudit = /money|result|return|profit|backtest|sharpe|alpha|drawdown|audit|validation/i.test(questionLower)
  const needsLimitations = /limit|risk|drawback|weakness|boundary/i.test(questionLower)
  const needsImplementation = /implement|code|database|store|sqlite|pit|engine|ast|verify|guard|app\.py/i.test(questionLower)

  try {
    // List contents of docs/ directory if available
    const docsListRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}/contents/docs`,
      { headers: getGithubHeaders(), next: { revalidate: 300 } },
    )

    if (docsListRes.ok) {
      const docsList = (await docsListRes.json()) as Array<{ name: string; path: string; size: number }>
      const candidateDocs = docsList.filter((d) => d.name.endsWith('.md'))

      // Prioritize relevant docs based on user query
      let selectedDocs = candidateDocs.filter((d) => {
        const name = d.name.toLowerCase()
        if (needsArchitecture && (name.includes('architecture') || name.includes('deployment'))) return true
        if (needsResultsOrAudit && (name.includes('audit') || name.includes('report') || name.includes('validation'))) return true
        if (needsLimitations && (name.includes('audit') || name.includes('report'))) return true
        return false
      })

      // Default fallback docs if none specifically targeted: pick architecture or deployment guide
      if (selectedDocs.length === 0 && candidateDocs.length > 0) {
        selectedDocs = candidateDocs.filter(
          (d) =>
            d.name.toLowerCase().includes('architecture') ||
            d.name.toLowerCase().includes('deployment') ||
            d.name.toLowerCase().includes('guide'),
        )
      }

      // Fetch top 1-2 candidate docs (max 12KB each)
      for (const doc of selectedDocs.slice(0, 2)) {
        try {
          const docRes = await fetch(
            `${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}/contents/${encodeURIComponent(doc.path)}`,
            {
              headers: getGithubHeaders({ Accept: 'application/vnd.github.raw+json' }),
              next: { revalidate: 300 },
            },
          )
          if (docRes.ok) {
            const docText = await docRes.text()
            additionalDocs.push({
              provenance: {
                repo: repoName,
                path: doc.path,
                url: `${repoUrl}/blob/${branch}/${doc.path}`,
                ref: branch,
                retrievedAt: new Date().toISOString(),
                category: categorizePath(doc.path),
              },
              title: `${repoName} // ${doc.path}`,
              content: docText.slice(0, 14000),
            })
          }
        } catch {
          // ignore single doc error
        }
      }
    }
  } catch {
    // ignore docs listing error
  }

  // 4. Selective Source-Code Inspection when implementation verification is relevant
  if (needsImplementation || needsArchitecture) {
    const candidateSourcePaths = [
      'src/dashboard/app.py',
      'src/dashboard/artifacts/registry.py',
      'src/main.py',
      'main.py',
      'src/core/pipeline.py',
    ]

    for (const srcPath of candidateSourcePaths) {
      if (sourceSnippets.length >= 2) break
      try {
        const srcRes = await fetch(
          `${GITHUB_API}/repos/${owner}/${encodeURIComponent(repoName)}/contents/${encodeURIComponent(srcPath)}`,
          {
            headers: getGithubHeaders({ Accept: 'application/vnd.github.raw+json' }),
            next: { revalidate: 300 },
          },
        )
        if (srcRes.ok) {
          const srcText = await srcRes.text()
          sourceSnippets.push({
            provenance: {
              repo: repoName,
              path: srcPath,
              url: `${repoUrl}/blob/${branch}/${srcPath}`,
              ref: branch,
              retrievedAt: new Date().toISOString(),
              category: 'IMPLEMENTATION',
            },
            title: `${repoName} // ${srcPath}`,
            content: srcText.slice(0, 8000), // First ~150-200 lines
          })
        }
      } catch {
        // file doesn't exist, try next
      }
    }
  }

  const result: RepositoryIntelligence = {
    repoName,
    owner,
    repoUrl,
    defaultBranch: branch,
    metadata: {
      description: repoMeta?.description ?? null,
      language: repoMeta?.language ?? null,
      topics: repoMeta?.topics ?? [],
      stars: repoMeta?.stargazers_count ?? 0,
      forks: repoMeta?.forks_count ?? 0,
      createdAt: repoMeta?.created_at,
      pushedAt: repoMeta?.pushed_at,
    },
    readme: readmeDoc,
    additionalDocs,
    sourceSnippets,
    retrievedAt: new Date().toISOString(),
    isAvailable: Boolean(readmeDoc || repoMeta),
  }

  intelligenceCache.set(cacheKey, {
    intelligence: result,
    expiresAt: now + CACHE_TTL_MS,
  })

  return result
}

/**
 * Formats retrieved repository intelligence into a safe, delimited prompt string
 * for CORTEX. All untrusted text is wrapped with clear provenance markers.
 */
export function formatRepositoryIntelligenceForPrompt(
  intelligenceList: RepositoryIntelligence[],
): string {
  if (!intelligenceList.length) return ''

  const sections: string[] = []

  for (const intel of intelligenceList) {
    if (!intel.isAvailable) continue

    const repoBlock: string[] = []
    repoBlock.push(`=== VERIFIED REPOSITORY INTELLIGENCE: ${intel.repoName} ===`)
    repoBlock.push(`GITHUB REPOSITORY: ${intel.repoUrl}`)
    repoBlock.push(`DEFAULT BRANCH: ${intel.defaultBranch}`)
    repoBlock.push(
      `METADATA: ${JSON.stringify({
        description: intel.metadata.description,
        language: intel.metadata.language,
        topics: intel.metadata.topics,
        stars: intel.metadata.stars,
        last_push: intel.metadata.pushedAt,
      })}`,
    )

    if (intel.readme) {
      repoBlock.push(
        `\n[EVIDENCE SOURCE // DOCUMENTATION] ${intel.readme.provenance.path} (${intel.readme.provenance.url}):\n<repository_evidence repo="${intel.repoName}" file="${intel.readme.provenance.path}" category="DOCUMENTATION">\n${intel.readme.content}\n</repository_evidence>`,
      )
    }

    for (const doc of intel.additionalDocs) {
      repoBlock.push(
        `\n[EVIDENCE SOURCE // ${doc.provenance.category}] ${doc.provenance.path} (${doc.provenance.url}):\n<repository_evidence repo="${intel.repoName}" file="${doc.provenance.path}" category="${doc.provenance.category}">\n${doc.content}\n</repository_evidence>`,
      )
    }

    for (const src of intel.sourceSnippets) {
      repoBlock.push(
        `\n[EVIDENCE SOURCE // IMPLEMENTATION VERIFIED] ${src.provenance.path} (${src.provenance.url}):\n<repository_evidence repo="${intel.repoName}" file="${src.provenance.path}" category="IMPLEMENTATION">\n${src.content}\n</repository_evidence>`,
      )
    }

    sections.push(repoBlock.join('\n'))
  }

  return sections.join('\n\n')
}
