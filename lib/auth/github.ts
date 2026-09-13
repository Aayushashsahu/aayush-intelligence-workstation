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

export function callbackUrl(origin: string): string {
  return `${origin}/api/auth/github/callback`
}
