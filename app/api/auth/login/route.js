import bcrypt from "bcryptjs";
import crypto from "crypto";
import { findUserByEmail, createRefreshToken } from "../../../../lib/prisma.js";
import { signAccessToken, REFRESH_EXPIRES_DAYS } from "../../../../lib/auth.js";

function makeRefreshCookie(token, maxAgeSec) {
  const secure = process.env.NODE_ENV === "production";
  return `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body || {};

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Missing email or password" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const accessToken = signAccessToken({ id: user.id, email: user.email });

  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );
  await createRefreshToken(user.id, refreshToken, expiresAt);

  const respUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    haircutCount: user.haircutCount,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };

  const cookie = makeRefreshCookie(
    refreshToken,
    REFRESH_EXPIRES_DAYS * 24 * 60 * 60
  );

  return new Response(JSON.stringify({ token: accessToken, user: respUser }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
  });
}
