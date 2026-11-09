import { test, describe } from 'node:test'
import assert from 'node:assert'
import {
  extractMarkdownSections,
  isValidRepoIdentifier,
  formatRepositoryIntelligenceForPrompt,
  type RepositoryIntelligence,
} from '../lib/cortex/repository-intelligence'

describe('Repository Intelligence Unit Tests', () => {
  test('isValidRepoIdentifier security boundaries', () => {
    // Valid repository names
    assert.strictEqual(isValidRepoIdentifier('The-Infinite-Money-Glitch-Detector'), true)
    assert.strictEqual(isValidRepoIdentifier('AEGIS.'), true)
    assert.strictEqual(isValidRepoIdentifier('EDITH-'), true)
    assert.strictEqual(isValidRepoIdentifier('sentinelforge'), true)

    // Invalid / path traversal / injection attempts
    assert.strictEqual(isValidRepoIdentifier('../etc/passwd'), false)
    assert.strictEqual(isValidRepoIdentifier('..\\windows\\system32'), false)
    assert.strictEqual(isValidRepoIdentifier('otheruser/otherrepo'), false)
    assert.strictEqual(isValidRepoIdentifier('repo; rm -rf /'), false)
    assert.strictEqual(isValidRepoIdentifier('https://malicious.site/repo'), false)
  })

  test('extractMarkdownSections extracts header-delimited blocks', () => {
    const sampleMd = `# Project Title
Overview of the project.

## 1. Overview
The platform investigates cross-currency arbitrage.

## 2. Architecture
Data ingestion -> SQLite PIT store -> Dashboard.

## 3. Limitations
Forward quotes are unavailable.
`
    const sections = extractMarkdownSections(sampleMd)
    assert.strictEqual(Boolean(sections['Project Title']), true)
    assert.strictEqual(Boolean(sections['1. Overview']), true)
    assert.strictEqual(Boolean(sections['2. Architecture']), true)
    assert.strictEqual(Boolean(sections['3. Limitations']), true)

    assert.strictEqual(
      sections['1. Overview'].includes('cross-currency arbitrage'),
      true,
    )
    assert.strictEqual(
      sections['3. Limitations'].includes('Forward quotes are unavailable'),
      true,
    )
  })

  test('formatRepositoryIntelligenceForPrompt wraps content in protective XML delimiters', () => {
    const mockIntel: RepositoryIntelligence = {
      repoName: 'The-Infinite-Money-Glitch-Detector',
      owner: 'Aayushashsahu',
      repoUrl: 'https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector',
      defaultBranch: 'main',
      metadata: {
        description: 'Quant research engine',
        language: 'Python',
        topics: ['quant', 'finance'],
        stars: 10,
        forks: 1,
        pushedAt: '2026-03-01T00:00:00Z',
      },
      readme: {
        provenance: {
          repo: 'The-Infinite-Money-Glitch-Detector',
          path: 'README.md',
          url: 'https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector/blob/main/README.md',
          ref: 'main',
          retrievedAt: '2026-03-01T00:00:00Z',
          category: 'DOCUMENTATION',
        },
        title: 'The-Infinite-Money-Glitch-Detector // README.md',
        content: 'README content stating arbitrage falsification.',
      },
      additionalDocs: [
        {
          provenance: {
            repo: 'The-Infinite-Money-Glitch-Detector',
            path: 'docs/DEPLOYMENT_GUIDE.md',
            url: 'https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector/blob/main/docs/DEPLOYMENT_GUIDE.md',
            ref: 'main',
            retrievedAt: '2026-03-01T00:00:00Z',
            category: 'ARCHITECTURE',
          },
          title: 'The-Infinite-Money-Glitch-Detector // docs/DEPLOYMENT_GUIDE.md',
          content: 'Deployment guide content.',
        },
      ],
      sourceSnippets: [
        {
          provenance: {
            repo: 'The-Infinite-Money-Glitch-Detector',
            path: 'src/dashboard/app.py',
            url: 'https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector/blob/main/src/dashboard/app.py',
            ref: 'main',
            retrievedAt: '2026-03-01T00:00:00Z',
            category: 'IMPLEMENTATION',
          },
          title: 'The-Infinite-Money-Glitch-Detector // src/dashboard/app.py',
          content: 'def main(): pass',
        },
      ],
      retrievedAt: '2026-03-01T00:00:00Z',
      isAvailable: true,
    }

    const formatted = formatRepositoryIntelligenceForPrompt([mockIntel])

    // Verify presence of provenance headers
    assert.strictEqual(formatted.includes('=== VERIFIED REPOSITORY INTELLIGENCE: The-Infinite-Money-Glitch-Detector ==='), true)
    assert.strictEqual(formatted.includes('GITHUB REPOSITORY: https://github.com/Aayushashsahu/The-Infinite-Money-Glitch-Detector'), true)

    // Verify defensive XML wrapping
    assert.strictEqual(formatted.includes('<repository_evidence repo="The-Infinite-Money-Glitch-Detector" file="README.md" category="DOCUMENTATION">'), true)
    assert.strictEqual(formatted.includes('<repository_evidence repo="The-Infinite-Money-Glitch-Detector" file="docs/DEPLOYMENT_GUIDE.md" category="ARCHITECTURE">'), true)
    assert.strictEqual(formatted.includes('<repository_evidence repo="The-Infinite-Money-Glitch-Detector" file="src/dashboard/app.py" category="IMPLEMENTATION">'), true)
    assert.strictEqual(formatted.includes('</repository_evidence>'), true)
  })

  test('formatRepositoryIntelligenceForPrompt returns empty string for empty input', () => {
    assert.strictEqual(formatRepositoryIntelligenceForPrompt([]), '')
  })
})
