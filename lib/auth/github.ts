/**
 * SERVER-ONLY GitHub OAuth.
 *
 * The control room is owner-only: a successful OAuth handshake is not enough,
 * the authenticated GitHub login must match OWNER_GITHUB_LOGIN.
 */

export type GithubIdentity = {
  id: number
  login: string
  name: string | null
  avatar_url: string | null
}

export function ownerLogin(): string {
  return (process.env.OWNER_GITHUB_LOGIN || 'Aayushashsahu').trim().toLowerCase()
}

function clientId(): string {
  return process.env.GITHUB_OAUTH_CLIENT_ID || ''
}

function clientSecret(): string {
  return process.env.GITHUB_OAUTH_CLIENT_SECRET || ''
}

export function oauthConfigured(): boolean {
  return Boolean(clientId() && clientSecret() && (process.env.AUTH_SECRET || clientSecret()))
}

export function authorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    scope: 'read:user',
    state,
    allow_signup: 'false',
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export async function exchangeCode(code: string, redirectUri: string): Promise<string> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId(),
      client_secret: clientSecret(),
      code,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`oauth_exchange_failed_${res.status}`)
  const data = await res.json()
  if (!data?.access_token) throw new Error('oauth_no_token')
  return data.access_token as string
}

export async function fetchGithubIdentity(accessToken: string): Promise<GithubIdentity> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'aayush-intelligence-workstation',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`oauth_user_failed_${res.status}`)
  const user = await res.json()
  return {
    id: user.id,
    login: String(user.login || ''),
    name: user.name ?? null,
    avatar_url: user.avatar_url ?? null,
  }
}

/** Case-insensitive match against the configured owner login. */
export function isOwner(identity: { login: string }): boolean {
  const expected = ownerLogin()
  if (!expected) return false
  return identity.login.trim().toLowerCase() === expected
}

/**
 * Canonical Application URL.
 *
 * In production, this MUST come from process.env.APP_URL so OAuth redirects
 * are never polluted by arbitrary Host headers or Vercel preview domains.
 * In local development, falls back to http://localhost:3000 if unset.
 */
export function getAppUrl(): string {
  const raw = process.env.APP_URL?.trim()
  const isProd = process.env.NODE_ENV === 'production'

  if (!raw) {
    if (isProd) {
      console.error(
        '[OAuth Configuration Error] APP_URL environment variable is missing in production. Set APP_URL=https://aayush-intelligence-workstation.vercel.app',
      )
      throw new Error('APP_URL is not configured in production.')
    }
    return 'http://localhost:3000'
  }

  // Normalize URL safely: strip trailing slashes and ensure proper protocol/host format
  try {
    const parsed = new URL(raw)
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '')
    return `${parsed.origin}${pathname}`
  } catch {
    return raw.replace(/\/+$/, '')
  }
}

/**
 * Derives the canonical OAuth callback URL safely, avoiding double slashes.
 * In production, it ALWAYS resolves from APP_URL, ignoring client origins.
 */
export function callbackUrl(customBase?: string): string {
  const base = customBase?.trim() ? customBase.trim().replace(/\/+$/, '') : getAppUrl()
  return `${base}/api/auth/github/callback`
}
