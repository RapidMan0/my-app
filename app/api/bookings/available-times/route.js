import { getBookingsByBarberAndDate } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId"); // Это имя барбера
    const date = searchParams.get("date");

    // Валидация параметров
    if (!barberId || !date) {
      return new Response(
        JSON.stringify({ error: "Missing barberId or date" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Получаем все брони для конкретного барбера на конкретную дату
    const bookings = await getBookingsByBarberAndDate(barberId, date);

    // Извлекаем только времена из забронированных слотов (исключаем отменённые)
    const bookedTimes = bookings
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => booking.time);

    return new Response(
      JSON.stringify({ bookedTimes }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching available times:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch available times" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
