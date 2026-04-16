import { supabase } from "@/lib/supabase";

export async function GET(req) {
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*");

    if (error) throw error;

    return new Response(JSON.stringify({ images: data || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch gallery images" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
