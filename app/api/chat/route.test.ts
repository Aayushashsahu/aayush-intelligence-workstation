import { describe, it, expect } from 'vitest'
import { POST } from './route'

describe('Chat API POST', () => {
  it('should return 400 when request body contains invalid JSON', async () => {
    // Create a mock request with invalid JSON
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: '{ invalid_json ',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toEqual({
      kind: 'declined',
      summary: 'Malformed request.'
    })
  })

  it('should return 400 when request body contains empty message', async () => {
    // Create a mock request with empty message
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: '   ' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toEqual({
      kind: 'declined',
      summary: 'Empty question.'
    })
  })
})
