import { verifyAccessToken } from "../../../lib/auth.js";
import { getUserById } from "../../../lib/prisma.js";
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
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
    const { barberId, rating, comment } = body;

    if (!barberId || !rating || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: "Invalid barberId or rating (1-5 required)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Получаем барбера из Supabase
    const { data: barber, error: fetchError } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", barberId)
      .single();

    if (fetchError || !barber) {
      return new Response(
        JSON.stringify({ error: "Barber not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Создаем новый отзыв
    const newReview = {
      id: Date.now().toString(),
      userId: payload.id,
      userName: user.name || user.email,
      userEmail: user.email,
      userAvatar: user.avatar || null,
      rating: parseInt(rating),
      comment: comment || "",
      date: new Date().toISOString(),
    };

    // Добавляем отзыв
    const updatedReviews = [...(barber.reviews || []), newReview];

    // Пересчитываем средний рейтинг
    const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
    const newAverageRating = (totalRating / updatedReviews.length).toFixed(1);

    // Обновляем барбера в Supabase
    const { error: updateError } = await supabase
      .from("barbers")
      .update({
        reviews: updatedReviews,
        average_rating: newAverageRating,
      })
      .eq("id", barberId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Review added successfully",
        review: newReview,
        reviews: updatedReviews,
        averageRating: newAverageRating,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error adding review:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add review" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const barberId = url.searchParams.get("barberId");

    if (!barberId) {
      return new Response(
        JSON.stringify({ error: "barberId parameter required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Получаем барбера из Supabase
    const { data: barber, error: fetchError } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", parseInt(barberId))
      .single();

    if (fetchError || !barber) {
      return new Response(
        JSON.stringify({ error: "Barber not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Обновляем отзывы, добавляя информацию о пользователях если отсутствует
    const updatedReviews = await Promise.all((barber.reviews || []).map(async (review) => {
      if (!review.userName) {
        try {
          const user = await getUserById(review.userId);
          return {
            ...review,
            userName: user ? (user.name || user.email) : "Anonymous",
            userEmail: user ? user.email : null,
            userAvatar: user?.avatar || null,
          };
        } catch (error) {
          return {
            ...review,
            userName: "Anonymous",
            userAvatar: null,
          };
        }
      }
      return review;
    }));

    return new Response(
      JSON.stringify({
        reviews: updatedReviews,
        averageRating: barber.average_rating || 0,
        totalReviews: updatedReviews.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reviews" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req) {
  try {
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
    if (!user || !user.isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { barberId, reviewIds } = body;

    console.log("[DELETE] Request body:", { barberId, reviewIds });

    if (!barberId || !reviewIds || !Array.isArray(reviewIds)) {
      return new Response(
        JSON.stringify({ error: "Invalid barberId or reviewIds" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Получаем барбера из Supabase
    console.log("[DELETE] Fetching barber with id:", barberId);
    const { data: barber, error: fetchError } = await supabase
      .from("barbers")
      .select("*")
      .eq("id", barberId)
      .single();

    if (fetchError) {
      console.error("[DELETE] Barber fetch error:", fetchError);
    }
    if (!barber) {
      console.error("[DELETE] Barber not found for id:", barberId);
    }

    if (fetchError || !barber) {
      return new Response(
        JSON.stringify({ error: "Barber not found", details: fetchError?.message }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Фильтруем отзывы, удаляя выбранные
    const updatedReviews = barber.reviews.filter(review => !reviewIds.includes(review.id));

    // Пересчитываем средний рейтинг
    let newAverageRating = 0;
    if (updatedReviews.length > 0) {
      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      newAverageRating = (totalRating / updatedReviews.length).toFixed(1);
    }

    console.log("[DELETE] Updating barber reviews:", { barberId, newLength: updatedReviews.length, newAverageRating });

    // Обновляем барбера в Supabase
    const { error: updateError } = await supabase
      .from("barbers")
      .update({
        reviews: updatedReviews,
        average_rating: newAverageRating,
      })
      .eq("id", barberId);

    if (updateError) {
      console.error("[DELETE] Supabase update error:", updateError);
      throw updateError;
    }

    console.log("[DELETE] Successfully updated barber");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reviews deleted successfully",
        reviews: updatedReviews,
        averageRating: newAverageRating,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[DELETE] Error deleting reviews:", error.message, error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to delete reviews", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}