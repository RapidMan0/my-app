import { findRefreshTokenByToken, revokeRefreshTokenById } from '../../../../lib/prisma.js'

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(';').map(s => {
    const [k, ...rest] = s.trim().split('=')
    return [k, rest.join('=')]
  }))
}

export async function POST(req) {
  const cookieHeader = req.headers.get('cookie')
  const cookies = parseCookies(cookieHeader)
  const token = cookies.refreshToken
  if (token) {
    const stored = await findRefreshTokenByToken(token)
    if (stored) {
      await revokeRefreshTokenById(stored.id)
    }
  }

  // clear cookie
  const clear = `refreshToken=deleted; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': clear } })
}
