import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  findUserByEmail,
  createUser,
  createRefreshToken,
} from "../../../../lib/prisma.js";
import {
  signAccessToken,
  ACCESS_EXPIRES_SECONDS,
  REFRESH_EXPIRES_DAYS,
} from "../../../../lib/auth.js";

function makeRefreshCookie(token, maxAgeSec) {
  const secure = process.env.NODE_ENV === "production";
  return `refreshToken=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export async function POST(req) {
  const body = await req.json();
  const { name, email, password } = body || {};

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Missing email or password" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 409,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ name: name || "", email, password: hashed });

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
    createdAt: user.createdAt,
  };

  const cookie = makeRefreshCookie(
    refreshToken,
    REFRESH_EXPIRES_DAYS * 24 * 60 * 60
  );

  return new Response(JSON.stringify({ token: accessToken, user: respUser }), {
    status: 201,
    headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
  });
}
