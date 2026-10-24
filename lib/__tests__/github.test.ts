import { getGithubData } from '../github'
import type { GithubData, Repo } from '../types'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as any

describe('getGithubData', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('fetches basic data and uses events-fallback when no token is present', async () => {
    // Delete token to force fallback
    delete process.env.GITHUB_TOKEN

    // Mock responses for the 3 Promise.all calls
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: 'testuser', id: 123 }), // profile
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          // rawRepos
          { id: 1, name: 'repo1', fork: false, archived: false, language: 'TypeScript', pushed_at: new Date().toISOString() }, // active, valid
          { id: 2, name: 'repo2', fork: true, archived: false }, // fork, should be filtered
          { id: 3, name: 'repo3', fork: false, archived: true }, // archived, should be filtered
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          // events
          { type: 'PushEvent', created_at: new Date().toISOString(), repo: { name: 'repo1' }, payload: { commits: [1] } },
        ],
      })

    const data = await getGithubData('testuser')

    expect(data.profile.login).toBe('testuser')
    // Should filter out forks and archived repos
    expect(data.repos.length).toBe(1)
    expect(data.repos[0].name).toBe('repo1')

    // Should compute active repos
    expect(data.activeRepos).toBe(1)

    // Should fallback to events
    expect(data.source).toBe('events-fallback')
    expect(data.contributionTotal).toBeGreaterThan(0)
  })

  it('fetches graphql data when token is present', async () => {
    process.env.GITHUB_TOKEN = 'mock-token'

    // Mock 3 REST calls
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ login: 'testuser' }) }) // profile
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // repos
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // events
      // Mock GraphQL call
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              contributionsCollection: {
                contributionCalendar: {
                  totalContributions: 42,
                  weeks: [
                    {
                      contributionDays: [
                        { contributionCount: 42, date: '2023-01-01' },
                      ],
                    },
                  ],
                },
              },
            },
          },
        }),
      })

    const data = await getGithubData('testuser')

    expect(data.source).toBe('graphql')
    expect(data.contributionTotal).toBe(42)
    expect(data.contributionDays.length).toBe(1)
  })

  it('throws an error if GitHub API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await expect(getGithubData('testuser')).rejects.toThrow('GitHub 404')
  })
})
