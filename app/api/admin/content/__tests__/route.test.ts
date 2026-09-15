import { NextRequest } from 'next/server'
import { POST } from '../route'

jest.mock('@/lib/auth/guard', () => ({ ownerGuard: jest.fn().mockResolvedValue(null) }))
jest.mock('@/lib/db', () => ({ storageConfigured: jest.fn().mockReturnValue(true) }))
jest.mock('@/lib/content/repo', () => ({}))

describe('POST', () => {
  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost', { method: 'POST', body: '{bad' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('invalid_json')
  })
})
