import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  resolveRepositories,
  normalizeTokenString,
  normalizeRepoName,
} from '../lib/cortex/repository-resolver'
import type { Repo, Project } from '../lib/types'

const MOCK_REPOS: Repo[] = [
  {
    id: 1,
    name: 'The-Infinite-Money-Glitch-Detector',
    full_name: 'Aayushashsahu/The-Infinite-Money-Glitch-Detector',
    html_url: 'https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector',
    description: 'An institutional quantitative research and macro-financial analytics platform evaluating cross-currency arbitrage.',
    language: 'Python',
    stargazers_count: 5,
    forks_count: 0,
    updated_at: '2026-03-01T00:00:00Z',
    pushed_at: '2026-03-01T00:00:00Z',
    fork: false,
    archived: false,
    topics: ['finance', 'quantitative', 'arbitrage', 'carry-trade', 'python'],
  },
  {
    id: 2,
    name: 'AEGIS.',
    full_name: 'Aayushashsahu/AEGIS.',
    html_url: 'https://github.com/Aayushashsahu/AEGIS.',
    description: 'Deterministic extraction verification engine.',
    language: 'TypeScript',
    stargazers_count: 10,
    forks_count: 1,
    updated_at: '2026-02-15T00:00:00Z',
    pushed_at: '2026-02-15T00:00:00Z',
    fork: false,
    archived: false,
    topics: ['ai', 'reliability', 'verification'],
  },
  {
    id: 3,
    name: 'sentinelforge',
    full_name: 'Aayushashsahu/sentinelforge',
    html_url: 'https://github.com/Aayushashsahu/sentinelforge',
    description: 'Autonomous incident response system with mathematical authority boundaries.',
    language: 'Python',
    stargazers_count: 12,
    forks_count: 2,
    updated_at: '2026-01-20T00:00:00Z',
    pushed_at: '2026-01-20T00:00:00Z',
    fork: false,
    archived: false,
    topics: ['security', 'incident-response', 'automation'],
  },
  {
    id: 4,
    name: 'EDITH-',
    full_name: 'Aayushashsahu/EDITH-',
    html_url: 'https://github.com/Aayushashsahu/EDITH-',
    description: 'Offline local personal assistant.',
    language: 'Python',
    stargazers_count: 8,
    forks_count: 0,
    updated_at: '2026-02-10T00:00:00Z',
    pushed_at: '2026-02-10T00:00:00Z',
    fork: false,
    archived: false,
    topics: ['local-ai', 'voice', 'rag'],
  },
  {
    id: 5,
    name: 'Career-OS',
    full_name: 'Aayushashsahu/Career-OS',
    html_url: 'https://github.com/Aayushashsahu/Career-OS',
    description: 'Product workflow platform.',
    language: 'TypeScript',
    stargazers_count: 4,
    forks_count: 0,
    updated_at: '2026-02-01T00:00:00Z',
    pushed_at: '2026-02-01T00:00:00Z',
    fork: false,
    archived: false,
    topics: ['product', 'workflow'],
  },
]

const MOCK_PROJECTS: Project[] = [
  {
    id: 'aegis',
    repo: 'AEGIS.',
    title: 'AEGIS',
    category: 'AI RELIABILITY',
    objective: 'Make extraction reliability verifiable.',
    why: 'Deterministic boundaries.',
    evidence: [],
    architecture: [],
    techAreas: ['AI'],
    status: 'BUILDING',
    timeline: 'BUILD',
    tags: ['ai'],
  },
  {
    id: 'sentinelforge',
    repo: 'sentinelforge',
    title: 'SentinelForge',
    category: 'SECURITY',
    objective: 'Automate incident response.',
    why: 'Authority boundaries.',
    evidence: [],
    architecture: [],
    techAreas: ['Security'],
    status: 'EXPERIMENTAL',
    timeline: 'RESEARCH',
    tags: ['security'],
  },
]

describe('Repository Resolver', () => {
  test('Exact repository name match', () => {
    const res = resolveRepositories(
      'Explain The-Infinite-Money-Glitch-Detector',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res.matches.length > 0, true)
    assert.strictEqual(res.primaryMatch?.name, 'The-Infinite-Money-Glitch-Detector')
    assert.strictEqual(res.primaryMatch?.matchType, 'exact')
  })

  test('Hyphen-less / natural language match', () => {
    const res = resolveRepositories(
      'What does the project Infinite Money Glitch Detector do?',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res.matches.length > 0, true)
    assert.strictEqual(res.primaryMatch?.name, 'The-Infinite-Money-Glitch-Detector')
  })

  test('Project aliases (e.g. money glitch, financial research)', () => {
    const res1 = resolveRepositories(
      'Tell me about the money glitch detector.',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res1.primaryMatch?.name, 'The-Infinite-Money-Glitch-Detector')

    const res2 = resolveRepositories(
      'Tell me about my financial research project.',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res2.primaryMatch?.name, 'The-Infinite-Money-Glitch-Detector')
  })

  test('Curated dossier match', () => {
    const res = resolveRepositories('Explain AEGIS.', MOCK_REPOS, MOCK_PROJECTS, 'Aayushashsahu')
    assert.strictEqual(res.primaryMatch?.name, 'AEGIS.')

    const res2 = resolveRepositories('What is SentinelForge?', MOCK_REPOS, MOCK_PROJECTS, 'Aayushashsahu')
    assert.strictEqual(res2.primaryMatch?.name, 'sentinelforge')
  })

  test('GitHub URL / owner-repo identifier', () => {
    const res = resolveRepositories(
      'Review https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res.primaryMatch?.name, 'The-Infinite-Money-Glitch-Detector')
    assert.strictEqual(res.primaryMatch?.matchType, 'url')
  })

  test('Multi-project comparison resolution', () => {
    const res = resolveRepositories(
      'Compare AEGIS and SentinelForge architectures.',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res.matches.length >= 2, true)
    const names = res.matches.map((m) => m.name)
    assert.strictEqual(names.includes('AEGIS.'), true)
    assert.strictEqual(names.includes('sentinelforge'), true)
  })

  test('Unknown query does not resolve spurious repo', () => {
    const res = resolveRepositories(
      'What are your thoughts on baking bread?',
      MOCK_REPOS,
      MOCK_PROJECTS,
      'Aayushashsahu',
    )
    assert.strictEqual(res.matches.length, 0)
    assert.strictEqual(res.primaryMatch, undefined)
  })

  test('Normalization helpers work correctly', () => {
    assert.strictEqual(
      normalizeTokenString('The-Infinite-Money-Glitch-Detector!'),
      'the infinite money glitch detector',
    )
    assert.strictEqual(
      normalizeRepoName('The-Infinite-Money-Glitch-Detector'),
      'infinite-money-glitch-detector',
    )
    assert.strictEqual(normalizeRepoName('AEGIS.'), 'aegis')
    assert.strictEqual(normalizeRepoName('EDITH-'), 'edith')
  })
})
