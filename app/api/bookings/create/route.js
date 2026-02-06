import { verifyAccessToken } from "../../../../lib/auth.js";
import {
  getUserById,
  incrementHaircutCount,
  createBooking,
  updateUserDiscounts,
} from "../../../../lib/prisma.js";

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
  const { barber, service, date, time, email, phone, discount } = body || {};

  if (!barber || !service || !date || !time || !email || !phone) {
    return new Response(
      JSON.stringify({ error: "Missing required booking fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Определяем текущий активный порог скидки
  const visits = user.haircutCount;
  const usedDiscountsStr = user.usedDiscounts || "[]";
  const used = JSON.parse(usedDiscountsStr);
  let currentThreshold = null;

  if (visits >= 10 && !used.includes(10)) {
    currentThreshold = 10;
  } else if (visits >= 6 && !used.includes(6)) {
    currentThreshold = 6;
  } else if (visits >= 3 && !used.includes(3)) {
    currentThreshold = 3;
  }

  // Create booking in database
  const booking = await createBooking(user.id, {
    barber,
    service,
    date,
    time,
    email,
    phone,
    status: "confirmed",
  });

  // Increment haircut count
  let updatedUser = await incrementHaircutCount(user.id);

  // 🔑 Если скидка была применена, отмечаем порог как использованный
  if (currentThreshold && discount > 0) {
    const newUsedDiscounts = [...used, currentThreshold];
    updatedUser = await updateUserDiscounts(user.id, newUsedDiscounts);
  }

  const respUser = {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    haircutCount: updatedUser.haircutCount,
    usedDiscounts: JSON.parse(updatedUser.usedDiscounts || "[]"),
    isAdmin: updatedUser.isAdmin,
    createdAt: updatedUser.createdAt,
  };

  return new Response(
    JSON.stringify({
      success: true,
      message: "Booking created successfully",
      user: respUser,
      booking: booking,
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}
