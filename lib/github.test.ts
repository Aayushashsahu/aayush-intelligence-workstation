import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGithubData, resolveUsername } from './github'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('GitHub data fetching', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    process.env.GITHUB_USERNAME = 'testuser'
  })

  it('resolves username from environment', () => {
    expect(resolveUsername()).toBe('testuser')
  })

  it('handles missing GITHUB_USERNAME', () => {
    delete process.env.GITHUB_USERNAME
    expect(resolveUsername()).toBe('Aayushashsahu')
  })

  it('fetches GitHub data correctly', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ login: 'testuser' }) }) // profile
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([
        { id: 1, name: 'repo1', fork: false, archived: false, html_url: '', pushed_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_at: new Date().toISOString() }
      ]) }) // repos
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // events

    const data = await getGithubData('testuser')

    expect(data.username).toBe('testuser')
    expect(data.profile.login).toBe('testuser')
    expect(data.repos.length).toBe(1)
    expect(data.repos[0].name).toBe('repo1')
    expect(data.source).toBe('events-fallback')
  })
})
