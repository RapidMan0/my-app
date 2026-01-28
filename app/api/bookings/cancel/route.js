import { verifyAccessToken } from "../../../../lib/auth.js";
import { getUserById, getBookingById, updateBookingStatus } from "../../../../lib/prisma.js";

export async function POST(req) {
  const auth = req.headers.get("authorization");
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const parts = auth.split(" ");
  const token = parts.length === 2 ? parts[1] : null;
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Invalid Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await getUserById(payload.id);
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { bookingId, notes } = body || {};

  if (!bookingId) {
    return new Response(
      JSON.stringify({ error: "Missing bookingId" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Проверяем, что пользователь либо владелец, либо администратор
  if (booking.userId !== user.id && !user.isAdmin) {
    return new Response(
      JSON.stringify({ error: "Unauthorized to cancel this booking" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const updatedBooking = await updateBookingStatus(
    bookingId, 
    "cancelled", 
    notes || (user.isAdmin ? "Отменено администратором" : "Отменено пользователем")
  );

  return new Response(
    JSON.stringify({
      success: true,
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
