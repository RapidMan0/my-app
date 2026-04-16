import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    // Загружаем барберов в порядке возрастания ID (без сортировки по рейтингу)
    const { data: barbers, error: barbersError } = await supabase
      .from("barbers")
      .select("*")
      .order("id", { ascending: true });

    if (barbersError) throw barbersError;

    // Загружаем услуги
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("*");

    if (servicesError) throw servicesError;

    // Загружаем галерею
    const { data: gallery, error: galleryError } = await supabase
      .from("gallery")
      .select("*");

    if (galleryError) throw galleryError;

    // Трансформируем barbers: average_rating → averageRating, availabletimes → availableTimes
    const transformedBarbers = barbers.map(barber => ({
      ...barber,
      averageRating: barber.average_rating,
      availableTimes: barber.availabletimes || [], // PostgreSQL возвращает в нижнем регистре
    }));

    return Response.json({
      barbers: transformedBarbers || [],
      services: services || [],
      gallery: gallery || [],
    });
  } catch (error) {
    console.error("Supabase error:", error);
    return Response.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
