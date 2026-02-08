import {
  findRefreshTokenByToken,
  createRefreshToken,
  revokeRefreshTokenById,
  getUserById,
} from "../../../../lib/prisma.js";
import { signAccessToken, REFRESH_EXPIRES_DAYS } from "../../../../lib/auth.js";
import crypto from "crypto";

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((s) => {
      const [k, ...rest] = s.trim().split("=");
      return [k, rest.join("=")];
    })
  );
}

function makeRefreshCookie(token, maxAgeSec) {
  const secure = process.env.NODE_ENV === "production";
  return `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export async function POST(req) {
  const cookieHeader = req.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const token = cookies.refreshToken;
  if (!token)
    return new Response(JSON.stringify({ error: "Missing refresh token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  const stored = await findRefreshTokenByToken(token);
  if (!stored || stored.revoked)
    return new Response(JSON.stringify({ error: "Invalid refresh token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  if (new Date(stored.expiresAt) < new Date())
    return new Response(JSON.stringify({ error: "Refresh token expired" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  const user = await getUserById(stored.userId);
  if (!user)
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });

  // rotate tokens: revoke old, create new
  await revokeRefreshTokenById(stored.id);
  const newToken = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );
  await createRefreshToken(user.id, newToken, expiresAt);

  const accessToken = signAccessToken({ id: user.id, email: user.email });

  const cookie = makeRefreshCookie(
    newToken,
    REFRESH_EXPIRES_DAYS * 24 * 60 * 60
  );

  const respUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    haircutCount: user.haircutCount,
    usedDiscounts: JSON.parse(user.usedDiscounts || "[]"),
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };

  return new Response(JSON.stringify({ token: accessToken, user: respUser }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
  });
}
