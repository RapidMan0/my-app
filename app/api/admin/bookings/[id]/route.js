import { verifyAccessToken } from "../../../../../lib/auth.js";
import { getUserById, getBookingById, deleteBookingById } from "../../../../../lib/prisma.js";

export async function DELETE(req, context) {
  try {
    const params = context?.params;
    const { id } = params ? await params : {};
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id param" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const parts = auth.split(" ");
    const token = parts.length === 2 ? parts[1] : null;
    if (!token) {
      return new Response(JSON.stringify({ error: "Invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await getUserById(payload.id);
    if (!user || !user.isAdmin) {
      return new Response(JSON.stringify({ error: "Admin privileges required" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    await deleteBookingById(id);

    return new Response(JSON.stringify({ success: true, message: "Booking deleted" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("DELETE /api/admin/bookings/[id] error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete booking" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}