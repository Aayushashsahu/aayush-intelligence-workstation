import { encodeSession, decodeSession, SESSION_MAX_AGE_S } from '@/lib/auth/session';
import type { OwnerSession } from '@/lib/types';

describe('session encoding and decoding', () => {
  const originalEnv = process.env;

  const mockSession: OwnerSession = {
    login: 'testuser',
    provider: 'github',
    exp: Date.now() + 1000 * 60 * 60, // 1 hour from now
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('encodeSession', () => {
    it('should encode a valid session using AUTH_SECRET', () => {
      process.env.AUTH_SECRET = 'test-secret-key-123';
      const encoded = encodeSession(mockSession);
      expect(typeof encoded).toBe('string');
      expect(encoded.split('.')).toHaveLength(2);
    });

    it('should encode a valid session using GITHUB_OAUTH_CLIENT_SECRET as fallback', () => {
      delete process.env.AUTH_SECRET;
      process.env.GITHUB_OAUTH_CLIENT_SECRET = 'test-github-secret-123';
      const encoded = encodeSession(mockSession);
      expect(typeof encoded).toBe('string');
      expect(encoded.split('.')).toHaveLength(2);
    });

    it('should throw an error if no signing key is configured', () => {
      delete process.env.AUTH_SECRET;
      delete process.env.GITHUB_OAUTH_CLIENT_SECRET;
      expect(() => encodeSession(mockSession)).toThrow('No session signing key configured');
    });
  });

  describe('decodeSession', () => {
    const validSecret = 'test-secret-key-123';
    let validToken: string;

    beforeEach(() => {
      process.env.AUTH_SECRET = validSecret;
      validToken = encodeSession(mockSession);
    });

    it('should decode a valid session', () => {
      const decoded = decodeSession(validToken);
      expect(decoded).toEqual(mockSession);
    });

    it('should return null for missing or empty token', () => {
      expect(decodeSession(undefined)).toBeNull();
      expect(decodeSession(null)).toBeNull();
      expect(decodeSession('')).toBeNull();
    });

    it('should return null if no signing key is configured', () => {
      delete process.env.AUTH_SECRET;
      delete process.env.GITHUB_OAUTH_CLIENT_SECRET;
      expect(decodeSession(validToken)).toBeNull();
    });

    it('should return null for malformed token (no dot)', () => {
      expect(decodeSession('malformed-token')).toBeNull();
    });

    it('should return null for tampered signature', () => {
      const [payload, signature] = validToken.split('.');
      const tamperedToken = `${payload}.tampered-${signature}`;
      expect(decodeSession(tamperedToken)).toBeNull();
    });

    it('should return null for tampered signature of different length', () => {
      const [payload, _signature] = validToken.split('.');
      const tamperedToken = `${payload}.123`;
      expect(decodeSession(tamperedToken)).toBeNull();
    });

    it('should return null for tampered payload', () => {
      const [_payload, signature] = validToken.split('.');
      const tamperedPayload = Buffer.from(JSON.stringify({ ...mockSession, login: 'hacker' })).toString('base64url');
      const tamperedToken = `${tamperedPayload}.${signature}`;
      expect(decodeSession(tamperedToken)).toBeNull();
    });

    it('should return null for expired session', () => {
      const expiredSession: OwnerSession = {
        ...mockSession,
        exp: Date.now() - 1000 * 60, // 1 minute ago
      };
      const expiredToken = encodeSession(expiredSession);
      expect(decodeSession(expiredToken)).toBeNull();
    });

    it('should return null for session without exp', () => {
      const invalidSession = {
        login: 'testuser',
        provider: 'github',
      } as OwnerSession; // force cast to omit exp
      const invalidToken = encodeSession(invalidSession);
      expect(decodeSession(invalidToken)).toBeNull();
    });

    it('should return null if payload is not valid JSON', () => {
      const [, signature] = validToken.split('.');
      const invalidPayload = Buffer.from('not-json').toString('base64url');

      // Need to re-sign it with the invalid payload so it passes signature verification
      // but fails JSON.parse
      const { createHmac } = require('node:crypto');
      const expected = createHmac('sha256', validSecret).update(invalidPayload).digest('base64url');

      expect(decodeSession(`${invalidPayload}.${expected}`)).toBeNull();
    });
  });
});
