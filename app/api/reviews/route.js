import { verifyAccessToken } from "../../../lib/auth.js";
import { getUserById } from "../../../lib/prisma.js";

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

    // Получаем текущие данные барберов
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
      {
        headers: {
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch barbers data");
    }

    const data = await response.json();
    const barbers = data.record.barbers;

    // Находим барбера
    const barberIndex = barbers.findIndex(b => b.id === barberId);
    if (barberIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Barber not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const barber = barbers[barberIndex];

    // Инициализируем reviews если не существует
    if (!barber.reviews) {
      barber.reviews = [];
    }

    // Добавляем новый отзыв
    const newReview = {
      id: Date.now().toString(),
      userId: payload.id,
      userName: user.name || user.email, // Используем name или email как fallback
      userEmail: user.email, // Добавляем email для генерации Gravatar
      userAvatar: user.avatar || null, // Если есть поле avatar, иначе null
      rating: parseInt(rating),
      comment: comment || "",
      date: new Date().toISOString(),
    };

    barber.reviews.push(newReview);

    // Обновляем существующие отзывы, добавляя информацию о пользователях если отсутствует
    const updatedReviews = await Promise.all(barber.reviews.map(async (review) => {
      if (!review.userName || !review.userEmail) {
        try {
          const reviewUser = await getUserById(review.userId);
          return {
            ...review,
            userName: reviewUser ? (reviewUser.name || reviewUser.email) : "Anonymous",
            userEmail: reviewUser ? reviewUser.email : null,
            userAvatar: reviewUser?.avatar || null,
          };
        } catch (error) {
          return {
            ...review,
            userName: "Anonymous",
            userEmail: null,
            userAvatar: null,
          };
        }
      }
      return review;
    }));

    barber.reviews = updatedReviews;

    // Пересчитываем средний рейтинг
    const totalRating = barber.reviews.reduce((sum, review) => sum + review.rating, 0);
    barber.averageRating = (totalRating / barber.reviews.length).toFixed(1);

    // Обновляем данные в jsonbin
    const updateResponse = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
        body: JSON.stringify({ barbers }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update barbers data");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Review added successfully",
        review: newReview,
        reviews: barber.reviews,
        averageRating: barber.averageRating,
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

    // Получаем данные барберов
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
      {
        headers: {
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch barbers data");
    }

    const data = await response.json();
    const barbers = data.record.barbers;

    // Находим барбера
    const barber = barbers.find(b => b.id === parseInt(barberId));
    if (!barber) {
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
        averageRating: barber.averageRating || 0,
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

    if (!barberId || !reviewIds || !Array.isArray(reviewIds)) {
      return new Response(
        JSON.stringify({ error: "Invalid barberId or reviewIds" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Получаем текущие данные барберов
    const response = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
      {
        headers: {
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch barbers data");
    }

    const data = await response.json();
    const barbers = data.record.barbers;

    // Находим барбера
    const barberIndex = barbers.findIndex(b => b.id === barberId);
    if (barberIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Barber not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const barber = barbers[barberIndex];

    // Фильтруем отзывы, удаляя выбранные
    barber.reviews = barber.reviews.filter(review => !reviewIds.includes(review.id));

    // Пересчитываем средний рейтинг
    if (barber.reviews.length > 0) {
      const totalRating = barber.reviews.reduce((sum, review) => sum + review.rating, 0);
      barber.averageRating = (totalRating / barber.reviews.length).toFixed(1);
    } else {
      barber.averageRating = 0;
    }

    // Обновляем данные в jsonbin
    const updateResponse = await fetch(
      "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
        },
        body: JSON.stringify({ barbers }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update barbers data");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reviews deleted successfully",
        reviews: barber.reviews,
        averageRating: barber.averageRating,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error deleting reviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete reviews" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}