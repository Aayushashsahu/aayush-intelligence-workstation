import type { Repo, Project } from '../types'
import { resolveUsername } from '../github'

export type ResolvedRepository = {
  name: string
  owner: string
  fullName: string
  repoUrl: string
  matchType: 'exact' | 'dossier' | 'alias' | 'url' | 'fuzzy' | 'contextual'
  confidence: number
  curatedProject?: Project
  repoMeta?: Repo
}

export type ResolutionResult = {
  matches: ResolvedRepository[]
  primaryMatch?: ResolvedRepository
  isAmbiguous: boolean
  clarificationMessage?: string
}

/**
 * Normalizes text for lenient matching:
 * Lowercases, replaces punctuation/hyphens/underscores/slashes with spaces,
 * and collapses multiple spaces.
 */
export function normalizeTokenString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Normalizes a repository or entity name by stripping common prefixes/suffixes
 * such as "the ", trailing dots, hyphens, and whitespace.
 */
export function normalizeRepoName(name: string): string {
  let cleaned = name.trim().toLowerCase()
  if (cleaned.startsWith('the-')) cleaned = cleaned.slice(4)
  if (cleaned.startsWith('the_')) cleaned = cleaned.slice(4)
  if (cleaned.startsWith('the ')) cleaned = cleaned.slice(4)
  return cleaned.replace(/[._-]+$/, '')
}

/**
 * Canonical project aliases mapping common conversational references
 * to actual GitHub repository names.
 */
const CANONICAL_ALIASES: Record<string, string> = {
  'infinite money glitch detector': 'The-Infinite-Money-Glitch-Detector',
  'the infinite money glitch detector': 'The-Infinite-Money-Glitch-Detector',
  'infinite money glitch': 'The-Infinite-Money-Glitch-Detector',
  'money glitch detector': 'The-Infinite-Money-Glitch-Detector',
  'money glitch': 'The-Infinite-Money-Glitch-Detector',
  'glitch detector': 'The-Infinite-Money-Glitch-Detector',
  'imgd': 'The-Infinite-Money-Glitch-Detector',
  'cross currency carry trade': 'The-Infinite-Money-Glitch-Detector',
  'carry trade detector': 'The-Infinite-Money-Glitch-Detector',
  'carry trade platform': 'The-Infinite-Money-Glitch-Detector',
  'financial research project': 'The-Infinite-Money-Glitch-Detector',
  'quant project': 'The-Infinite-Money-Glitch-Detector',
  'arbitrage detector': 'The-Infinite-Money-Glitch-Detector',
  'arbitrage project': 'The-Infinite-Money-Glitch-Detector',
  'financial platform': 'The-Infinite-Money-Glitch-Detector',
  'edith': 'EDITH-',
  'edith v8': 'EDITH-',
  'edith-v8': 'EDITH-',
  'e.d.i.t.h': 'EDITH-',
  'e.d.i.t.h.': 'EDITH-',
  'jarvis': 'J.A.R.V.I.S.-HACKTHONE',
  'j.a.r.v.i.s': 'J.A.R.V.I.S.-HACKTHONE',
  'j.a.r.v.i.s.': 'J.A.R.V.I.S.-HACKTHONE',
  'aegis': 'AEGIS.',
  'sentinelforge': 'sentinelforge',
  'sentinel forge': 'sentinelforge',
  'sentinel': 'sentinelforge',
  'reconciliation engine': 'reconciliation-engine',
  'reconciliation': 'reconciliation-engine',
  'career os': 'Career-OS',
  'career-os': 'Career-OS',
  'careeros': 'Career-OS',
  'personal ai router': 'Personal-AI-Router',
  'ai router': 'Personal-AI-Router',
  'model router': 'Personal-AI-Router',
  'workstation': 'aayush-intelligence-workstation',
  'intelligence workstation': 'aayush-intelligence-workstation',
}

/**
 * Resolves one or more repositories referenced in a natural language query.
 *
 * Prioritizes:
 * 1. Exact repository name match
 * 2. Curated project dossier match
 * 3. Known project alias match
 * 4. Hyphen-less / normalized token match
 * 5. Repository URL / owner/repo identifier
 * 6. Contextual reference (e.g. "latest AI project")
 */
export function resolveRepositories(
  query: string,
  repos: Repo[] = [],
  projects: Project[] = [],
  configuredOwner?: string,
): ResolutionResult {
  const owner = (configuredOwner || resolveUsername()).trim()
  const lowerQuery = query.toLowerCase()
  const normalizedQuery = normalizeTokenString(query)
  const matchesMap = new Map<string, ResolvedRepository>()

  // Helper to register a match safely without duplicates
  const registerMatch = (
    repoName: string,
    matchType: ResolvedRepository['matchType'],
    confidence: number,
  ) => {
    // Find metadata and curated dossier if available
    const repoMeta = repos.find((r) => r.name.toLowerCase() === repoName.toLowerCase())
    const curated = projects.find(
      (p) =>
        (p.repo && p.repo.toLowerCase() === repoName.toLowerCase()) ||
        p.id.toLowerCase() === repoName.toLowerCase() ||
        p.title.toLowerCase() === repoName.toLowerCase(),
    )

    const resolvedName = repoMeta?.name || curated?.repo || repoName
    const resolvedFullName = repoMeta?.full_name || `${owner}/${resolvedName}`
    const repoUrl = repoMeta?.html_url || `https://github.com/${owner}/${resolvedName}`

    const existing = matchesMap.get(resolvedName.toLowerCase())
    if (!existing || existing.confidence < confidence) {
      matchesMap.set(resolvedName.toLowerCase(), {
        name: resolvedName,
        owner,
        fullName: resolvedFullName,
        repoUrl,
        matchType,
        confidence,
        curatedProject: curated,
        repoMeta,
      })
    }
  }

  // --- Step 1: Check GitHub URLs and owner/repo identifiers ---
  const urlPattern = new RegExp(`(?:https?:\\/\\/github\\.com\\/)?(?:${owner}\\/)?([a-zA-Z0-9_.-]+)`, 'gi')
  const explicitRepoMatch = query.match(/(?:github\.com\/[a-zA-Z0-9_.-]+\/|Aayushashsahu\/)([a-zA-Z0-9_.-]+)/i)
  if (explicitRepoMatch && explicitRepoMatch[1]) {
    const rawName = explicitRepoMatch[1]
    const foundRepo = repos.find((r) => r.name.toLowerCase() === rawName.toLowerCase())
    if (foundRepo) {
      registerMatch(foundRepo.name, 'url', 1.0)
    }
  }

  // --- Step 2: Check Exact Repository Names (case-insensitive) ---
  for (const r of repos) {
    const exactRegex = new RegExp(`\\b${escapeRegExp(r.name.toLowerCase())}\\b`, 'i')
    if (exactRegex.test(lowerQuery)) {
      registerMatch(r.name, 'exact', 0.98)
    }
  }

  // --- Step 3: Check Curated Dossiers (title, id, or repo) ---
  for (const p of projects) {
    const titleRegex = new RegExp(`\\b${escapeRegExp(p.title.toLowerCase())}\\b`, 'i')
    const idRegex = new RegExp(`\\b${escapeRegExp(p.id.toLowerCase())}\\b`, 'i')
    if (titleRegex.test(lowerQuery) || idRegex.test(lowerQuery)) {
      const targetRepo = p.repo || p.id
      registerMatch(targetRepo, 'dossier', 0.95)
    }
  }

  // --- Step 4: Check Known Canonical Aliases ---
  for (const [alias, canonicalRepo] of Object.entries(CANONICAL_ALIASES)) {
    const aliasRegex = new RegExp(`\\b${escapeRegExp(alias)}\\b`, 'i')
    if (aliasRegex.test(lowerQuery) || aliasRegex.test(normalizedQuery)) {
      registerMatch(canonicalRepo, 'alias', 0.92)
    }
  }

  // --- Step 5: Check Normalized Hyphen-less Names ---
  for (const r of repos) {
    const normRepo = normalizeTokenString(r.name)
    const normNoThe = normRepo.startsWith('the ') ? normRepo.slice(4) : normRepo
    if (normRepo.length >= 4 && normalizedQuery.includes(normRepo)) {
      registerMatch(r.name, 'fuzzy', 0.88)
    } else if (normNoThe.length >= 6 && normalizedQuery.includes(normNoThe)) {
      registerMatch(r.name, 'fuzzy', 0.85)
    }
  }

  // --- Step 6: Contextual / Intent References (e.g. "latest project", "latest AI project") ---
  if (matchesMap.size === 0) {
    const isLatestRequest = /\b(latest|newest|recent|most recent)\s+(project|repo|repository|work)\b/i.test(query)
    const isLatestAiRequest = /\b(latest|newest|recent|most recent)\s+(ai|ml|agent)\s+(project|repo|repository)\b/i.test(query)

    if (isLatestAiRequest) {
      // Find latest pushed repo with AI topics or language
      const aiRepos = repos.filter((r) => {
        const text = `${r.name} ${r.description || ''} ${(r.topics || []).join(' ')}`.toLowerCase()
        return /ai|llm|agent|machine learning|python|rag/.test(text)
      })
      const sorted = (aiRepos.length ? aiRepos : repos).slice().sort((a, b) => {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      })
      if (sorted[0]) {
        registerMatch(sorted[0].name, 'contextual', 0.75)
      }
    } else if (isLatestRequest) {
      const sorted = repos.slice().sort((a, b) => {
        return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
      })
      if (sorted[0]) {
        registerMatch(sorted[0].name, 'contextual', 0.7)
      }
    }
  }

  const matches = Array.from(matchesMap.values()).sort((a, b) => b.confidence - a.confidence)

  // Detect ambiguity: multiple matches with equal low confidence without explicit distinction
  let isAmbiguous = false
  let clarificationMessage: string | undefined

  if (matches.length > 2 && matches[0].confidence < 0.8 && matches[0].confidence === matches[1].confidence) {
    isAmbiguous = true
    clarificationMessage = `Multiple candidate repositories matched (${matches.slice(0, 3).map((m) => m.name).join(', ')}). Which project would you like to explore?`
  }

  return {
    matches,
    primaryMatch: matches[0],
    isAmbiguous,
    clarificationMessage,
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
