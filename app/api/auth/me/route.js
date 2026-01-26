import { verifyAccessToken } from "../../../../lib/auth.js";
import { getUserById } from "../../../../lib/prisma.js";

export async function GET(req) {
  const auth = req.headers.get("authorization");
  if (!auth)
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );

  const parts = auth.split(" ");
  const token = parts.length === 2 ? parts[1] : null;
  if (!token)
    return new Response(
      JSON.stringify({ error: "Invalid Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );

  const payload = verifyAccessToken(token);
  if (!payload)
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

  const user = await getUserById(payload.id);
  if (!user)
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });

  const respUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    haircutCount: user.haircutCount,
    createdAt: user.createdAt,
  };

  return new Response(JSON.stringify({ user: respUser }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
