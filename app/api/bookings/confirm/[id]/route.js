import { getBookingById, updateBookingStatus } from "../../../../../lib/prisma.js";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Получаем бронирование
    const booking = await getBookingById(id);
    
    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Если уже подтверждено
    if (booking.status === "confirmed") {
      return new Response(
        JSON.stringify({ 
          message: "Booking already confirmed",
          booking 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Обновляем статус на confirmed
    const updatedBooking = await updateBookingStatus(id, "confirmed");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking confirmed successfully",
        booking: updatedBooking,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Confirmation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to confirm booking" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
