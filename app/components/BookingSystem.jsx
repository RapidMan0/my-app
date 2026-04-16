"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import md5 from "blueimp-md5";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "./Auth/AuthProvider";
import { useDispatch, useSelector } from "react-redux";
import {
  setBarbers,
  setServices,
  setSelectedBarber,
  setSelectedService,
  setSelectedDate,
  setSelectedTime,
  setIsOpen,
  setShowForm,
  setShowBookingButton,
  setDiscount,
  setFinalPrice,
  setToast,
  updateBarber,
  resetBooking,
} from "../../store/bookingSlice";

// Toast уведомление
const Toast = ({ message, show, onClose, type = "success" }) => (
  <div
    className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-lg shadow-lg transition-all duration-500
      ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
    `}
    role="alert"
  >
    <div className="flex items-center gap-3">
      {type === "success" ? (
        <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
      ) : (
        <XCircleIcon className="w-6 h-6 flex-shrink-0" />
      )}
      <span className="font-semibold">{message}</span>
      <button
        className="ml-4 text-white hover:text-gray-200"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  </div>
);

const BookingSidebar = () => {
  const { user, accessToken, updateUser } = useAuth();
  const dispatch = useDispatch();
  const {
    barbers,
    services,
    selectedBarber,
    selectedService,
    selectedDate,
    selectedTime,
    isOpen,
    showForm,
    showBookingButton,
    discount,
    finalPrice,
    toast,
  } = useSelector((state) => state.booking);

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedBarberForReviews, setSelectedBarberForReviews] =
    useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeletingReviews, setIsDeletingReviews] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Инициализируйте emailjs
  useEffect(() => {
    emailjs.init("TWMGobjrMR-dkenWF"); // ваш Public Key
  }, []);

  const openReviewsModal = (barber) => {
    setSelectedBarberForReviews(barber);
    setSelectedReviews([]); // Сбрасываем выбранные отзывы
    setReviews(barber.reviews || []);
    setShowReviewsModal(true);
  };

  const submitReview = async () => {
    if (!newReview.rating || !accessToken || !selectedBarberForReviews) return;

    setIsSubmittingReview(true);

    const barber = barbers.find(b => b.id === selectedBarberForReviews.id);
    if (!barber) return;

    // Создаем новый отзыв
    const newReviewData = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name || user.email,
      userEmail: user.email,
      userAvatar: user.avatar || null,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString(),
    };

    // Оптимистичное обновление
    const updatedReviews = [...(barber.reviews || []), newReviewData];
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = (totalRating / updatedReviews.length).toFixed(1);

    // Обновляем состояние
    dispatch(updateBarber({ id: barber.id, reviews: updatedReviews, averageRating: newAverageRating }));
    setReviews(updatedReviews);
    setNewReview({ rating: 5, comment: "" });
    showToast("Review added successfully!", "success");

    setIsSubmittingReview(false);

    // Фоновый запрос к API
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          barberId: selectedBarberForReviews.id,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const data = await response.json();
      // Обновляем с актуальными данными из API
      dispatch(updateBarber({ id: barber.id, reviews: data.reviews, averageRating: data.averageRating }));
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error submitting review:", error);
      // Откатываем изменения
      const revertedReviews = barber.reviews || [];
      const revertedTotal = revertedReviews.reduce((sum, r) => sum + r.rating, 0);
      const revertedAverage = revertedReviews.length > 0 ? (revertedTotal / revertedReviews.length).toFixed(1) : 0;
      dispatch(updateBarber({ id: barber.id, reviews: revertedReviews, averageRating: revertedAverage }));
      setReviews(revertedReviews);
      showToast("Failed to add review. Please try again.", "error");
    }
  };

  const deleteSelectedReviews = async () => {
    if (selectedReviews.length === 0 || !accessToken || !selectedBarberForReviews) return;

    setIsDeletingReviews(true);

    const barber = barbers.find(b => b.id === selectedBarberForReviews.id);
    if (!barber) return;

    const reviewsToDelete = [...selectedReviews]; // Сохраняем для API

    // Оптимистичное обновление
    const updatedReviews = (barber.reviews || []).filter(review => !reviewsToDelete.includes(review.id));
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverageRating = updatedReviews.length > 0 ? (totalRating / updatedReviews.length).toFixed(1) : 0;

    // Обновляем состояние
    dispatch(updateBarber({ id: barber.id, reviews: updatedReviews, averageRating: newAverageRating }));
    setReviews(updatedReviews);
    setSelectedReviews([]);
    showToast("Reviews deleted successfully!", "success");

    setIsDeletingReviews(false);

    // Фоновый запрос к API
    try {
      const response = await fetch("/api/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          barberId: selectedBarberForReviews.id,
          reviewIds: reviewsToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete reviews");
      }

      const data = await response.json();
      // Обновляем с актуальными данными из API
      dispatch(updateBarber({ id: barber.id, reviews: data.reviews, averageRating: data.averageRating }));
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error deleting reviews:", error);
      // Откатываем изменения
      const revertedReviews = barber.reviews || [];
      const revertedTotal = revertedReviews.reduce((sum, r) => sum + r.rating, 0);
      const revertedAverage = revertedReviews.length > 0 ? (revertedTotal / revertedReviews.length).toFixed(1) : 0;
      dispatch(updateBarber({ id: barber.id, reviews: revertedReviews, averageRating: revertedAverage }));
      setReviews(revertedReviews);
      setSelectedReviews(reviewsToDelete); // Восстанавливаем выбранные
      showToast("Failed to delete reviews. Please try again.", "error");
    }
  };

  const handleReviewSelect = (reviewId) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId],
    );
  };

  // Fetch barbers and services data
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch(
          "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
          {
            headers: {
              "X-Master-Key":
                "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
            },
          },
        );
        const json = await response.json();
        dispatch(setBarbers(json.record.barbers));
      } catch (error) {
        console.error("Error fetching barbers:", error);
      }
    };

    // Fetch services data
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "https://api.jsonbin.io/v3/b/680b69788960c979a58cd355/latest",
          {
            headers: {
              "X-Master-Key":
                "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
            },
          },
        );
        const json = await response.json();
        dispatch(setServices(json.record.services));
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchBarbers();
    fetchServices();
  }, [dispatch]);

  // Handle scroll event to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const showToast = (message, type = "success") => {
    dispatch(setToast({ show: true, message, type }));
    setTimeout(
      () => dispatch(setToast({ show: false, message: "", type: "success" })),
      3500,
    );
  };

  // Calculate discount based on haircut count
  useEffect(() => {
    if (!selectedService || !user) {
      dispatch(setDiscount({ percent: 0, amount: 0, message: "" }));
      dispatch(setFinalPrice(0));
      return;
    }

    const visits = user.haircutCount || 0;
    const usedDiscountsStr =
      typeof user.usedDiscounts === "string"
        ? user.usedDiscounts
        : JSON.stringify(user.usedDiscounts || []);
    const used = JSON.parse(usedDiscountsStr);

    let discountPercent = 0;
    let discountMessage = "";
    let currentThreshold = null;

    // Проверяем в обратном порядке (от 10 к 3)
    if (visits >= 10 && !used.includes(10)) {
      discountPercent = 20;
      currentThreshold = 10;
      discountMessage = "20% discount (one-time)";
    } else if (visits >= 6 && !used.includes(6)) {
      discountPercent = 15;
      currentThreshold = 6;
      discountMessage = "15% discount (one-time)";
    } else if (visits >= 3 && !used.includes(3)) {
      discountPercent = 10;
      currentThreshold = 3;
      discountMessage = "10% discount (one-time)";
    }

    const priceNum = parseFloat(selectedService.price.replace(/[^\d.]/g, ""));
    const discountAmount = (priceNum * discountPercent) / 100;
    const final = priceNum - discountAmount;

    dispatch(
      setDiscount({
        percent: discountPercent,
        amount: discountAmount,
        message: discountMessage,
      }),
    );
    dispatch(setFinalPrice(Math.round(final)));
  }, [selectedService, user, dispatch]);

  const onSubmit = async (data) => {
    // Оптимистично закрываем UI сразу
    dispatch(setShowForm(false));
    dispatch(setIsOpen(false));
    dispatch(setShowBookingButton(true));

    // Очищаем форму после submit
    reset();

    // Дать браузеру обновить интерфейс
    await new Promise((r) => requestAnimationFrame(() => r()));

    // Выполняем сетевые операции в фоне, не блокируя UI
    (async () => {
      // Сохранение брони на сервере, если пользователь авторизован
      if (user && accessToken) {
        try {
          const res = await fetch("/api/bookings/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              barber: selectedBarber.name,
              service: selectedService.name,
              date: selectedDate,
              time: selectedTime,
              email: data.email,
              phone: data.phone,
              price: `${finalPrice} mdl`,
              originalPrice: selectedService.price,
              discount: discount.percent,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || "Failed to create booking", "error");
            return;
          }

          // Получаем обновленного пользователя из ответа сервера
          const responseData = await res.json();
          showToast(`Booking confirmed! ${discount.message}`, "success");
          dispatch(resetBooking());

          // 🔑 Обновляем пользователя (включая usedDiscounts)
          if (updateUser && responseData.user) {
            await updateUser(responseData.user);
          }
        } catch (err) {
          console.error("Save booking error:", err);
          showToast("Network error while saving booking", "error");
        }
      }

      // Отправка email (тоже в фоне)
      try {
        const templateParams = {
          barber: selectedBarber.name,
          service: selectedService.name,
          date: selectedDate,
          time: selectedTime,
          email: data.email,
          phone: data.phone,
          price: `${finalPrice} mdl`,
          originalPrice: selectedService.price,
          discount: discount.percent,
        };
        await emailjs.send(
          "service_m48lm91",
          "template_pmcf25u",
          templateParams,
        );
      } catch (error) {
        console.error("Email error:", error);
        showToast("Failed to send email. Try again later.", "error");
      }
    })();
  };

  // Вычисляем базовую цену и отображаемую цену
  const basePrice = selectedService
    ? parseInt(selectedService.price.replace(/\D/g, ""))
    : 0;

  const displayPrice = discount.percent > 0 ? finalPrice : basePrice;

  // Логика для подсказки о следующей скидке
  const visits = user?.haircutCount || 0;
  const usedDiscountsStr =
    typeof user?.usedDiscounts === "string"
      ? user.usedDiscounts
      : JSON.stringify(user?.usedDiscounts || []);
  const used = JSON.parse(usedDiscountsStr);

  let nextTarget = null;
  let nextDiscount = null;

  if (visits < 3) {
    nextTarget = 3;
    nextDiscount = 10;
  } else if (visits < 6) {
    nextTarget = 6;
    nextDiscount = 15;
  } else if (visits < 10) {
    nextTarget = 10;
    nextDiscount = 20;
  }

  return (
    <>
      {showBookingButton && (
        <button
          onClick={() => {
            dispatch(setIsOpen(true));
            dispatch(setShowBookingButton(false));
          }}
          className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all"
        >
          💈 Book Now
        </button>
      )}

      <motion.aside
        id="booking-sidebar"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl z-40 overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedBarber ? "Choose a Service" : "Choose a Barber"}
          </h2>
          <button
            onClick={() => {
              if (selectedBarber) {
                dispatch(setSelectedBarber(null));
                dispatch(setSelectedService(null));
                dispatch(setSelectedDate(""));
                dispatch(setSelectedTime(null));
                dispatch(setShowForm(false)); // скрываем панель с ценой/формой при возврате
              } else {
                dispatch(setIsOpen(false));
                dispatch(setShowBookingButton(true));
                dispatch(setShowForm(false));
              }
            }}
            className="text-3xl hover:bg-gray-100 rounded-md px-2 py-1 transition-colors duration-200"
          >
            {selectedBarber ? "← Back" : "×"}
          </button>
        </div>
        {(selectedBarber
          ? barbers.filter((b) => b.id === selectedBarber.id)
          : barbers
        ).map((barber) => (
          <div
            key={barber.id}
            className={`cursor-pointer flex flex-col gap-2 border rounded-xl p-4 mb-4 shadow-sm transition ${
              selectedBarber?.id === barber.id
                ? "border-red-500"
                : "border-gray-200 hover:border-red-400"
            }`}
            onClick={() => {
              dispatch(setSelectedBarber(barber));
              dispatch(setSelectedService(null));
              dispatch(setSelectedDate(""));
              dispatch(setSelectedTime(null));
            }}
          >
            <div className="flex items-center gap-4">
              <Image
                src={barber.image}
                alt={barber.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-lg">{barber.name}</p>
                <p className="text-sm text-gray-500">{barber.role}</p>
                <div className="flex items-center gap-2">
                  <p className="text-yellow-500 text-sm">
                    {"★".repeat(Math.floor(barber.averageRating || 0))}
                    {"☆".repeat(5 - Math.floor(barber.averageRating || 0))}{" "}
                    <span className="text-gray-500">
                      {barber.averageRating || 0} (
                      {(barber.reviews || []).length} reviews)
                    </span>
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openReviewsModal(barber);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    View Reviews
                  </button>
                </div>
                {barber.experience && (
                  <p className="text-xs text-gray-400">
                    Experience: {barber.experience}
                  </p>
                )}
              </div>
            </div>

            {selectedBarber?.id === barber.id && (
              <>
                <div className="mt-3">
                  <h3 className="text-base font-semibold mb-1.5">Services:</h3>
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`cursor-pointer flex flex-col border-2 rounded p-3 mb-1.5 shadow-md transition hover:shadow-lg ${
                        selectedService?.id === service.id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedService(service));
                      }}
                    >
                      <div>
                        <p className="font-semibold text-base">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {service.description}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {service.price}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedService && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold mb-2">
                      Choose a Date:
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded"
                      value={selectedDate}
                      onChange={(e) =>
                        dispatch(setSelectedDate(e.target.value))
                      }
                      onClick={(e) => e.stopPropagation()}
                      min={new Date().toISOString().split("T")[0]}
                      max={
                        new Date(new Date().setDate(new Date().getDate() + 30))
                          .toISOString()
                          .split("T")[0]
                      }
                    />
                  </div>
                )}

                {selectedService && selectedDate && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold mb-2">
                      Choose a Time:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {barber.availableTimes.map((time, index) => (
                        <button
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm shadow ${
                            selectedTime === time
                              ? "bg-red-500 text-white"
                              : "bg-gray-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedTime(time));
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Confirm button or form */}
        {selectedBarber &&
          selectedService &&
          selectedDate &&
          selectedTime &&
          !showForm && (
            <button
              onClick={() => dispatch(setShowForm(true))}
              className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg text-lg hover:bg-red-800 transition"
            >
              Confirm Appointment
            </button>
          )}

        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4 border-t pt-4"
          >
            {/* Discount info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Total visits:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {visits}
                </span>
              </div>

              {discount.percent > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Original price:
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {selectedService?.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-semibold text-green-600">
                      Discount ({discount.percent}%):
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      -{Math.round(discount.amount)} mdl
                    </span>
                  </div>
                  <div className="text-sm text-green-700 mt-2 font-semibold flex items-center gap-2">
                    {discount.percent === 20 && (
                      <TrophyIcon className="w-5 h-5" />
                    )}
                    {discount.percent === 15 && (
                      <SparklesIcon className="w-5 h-5" />
                    )}
                    {discount.percent === 10 && (
                      <SparklesIcon className="w-5 h-5" />
                    )}
                    {discount.message}
                  </div>
                </>
              ) : (
                nextTarget && (
                  <div className="bg-blue-100 p-3 rounded-lg mt-3 mb-3">
                    <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                      <LightBulbIcon className="w-5 h-5" />
                      Visit {nextTarget - visits} more time
                      {nextTarget - visits !== 1 ? "s" : ""} to unlock{" "}
                      {nextDiscount}% discount!
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Progress: {visits} / {nextTarget}
                    </p>
                  </div>
                )
              )}

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200">
                <span className="text-lg font-bold text-gray-900">Price:</span>
                <span className="text-2xl font-bold text-blue-700">
                  {displayPrice} mdl
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                className="w-full p-3 border rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{8,15}$/,
                    message: "Enter a valid phone number (10-15 digits)",
                  },
                })}
                className="w-full p-3 border rounded"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Submit Booking
            </button>
          </form>
        )}
      </motion.aside>

      {/* Reviews Modal */}
      {showReviewsModal && selectedBarberForReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Reviews for {selectedBarberForReviews.name}
              </h3>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-3xl rounded-md px-2 py-1 transition-colors duration-200"
              >
                ×
              </button>
            </div>

            {/* Existing Reviews */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">
                  Customer Reviews ({reviews.length})
                </h4>
                {user?.isAdmin && selectedReviews.length > 0 && (
                  <button
                    onClick={deleteSelectedReviews}
                    disabled={isDeletingReviews}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeletingReviews
                      ? "Deleting..."
                      : `Delete (${selectedReviews.length})`}
                  </button>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                reviews.map((review, index) => (
                  <div
                    key={review.id}
                    className={`flex gap-3 ${index < reviews.length - 1 ? "border-b border-gray-200 pb-3 mb-3" : "pb-3"}`}
                  >
                    {user?.isAdmin && (
                      <div className="flex-shrink-0 pt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review.id)}
                            onChange={() => handleReviewSelect(review.id)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 bg-gray-200 border-2 border-gray-300 rounded peer-checked:bg-red-500 peer-checked:border-red-500 peer-hover:bg-gray-300 peer-focus:ring-2 peer-focus:ring-red-300 transition-all duration-200 flex items-center justify-center">
                            {selectedReviews.includes(review.id) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </label>
                      </div>
                    )}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden flex-shrink-0 border-2 border-gray-500">
                        {review.userEmail ? (
                          <img
                            src={`https://www.gravatar.com/avatar/${md5(
                              (review.userEmail || "").trim().toLowerCase(),
                            )}?s=80&d=identicon`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center text-white font-medium text-sm ${
                            review.userEmail ? "hidden" : ""
                          }`}
                        >
                          {(review.userName || "A").charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {review.userName || "Anonymous"}
                        </span>
                        <div className="text-yellow-500">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            {user && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Leave a Review</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rating
                    </label>
                    <select
                      value={newReview.rating}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          rating: parseInt(e.target.value),
                        })
                      }
                      className="border rounded px-3 py-2 w-full"
                    >
                      {[5, 4, 3, 2, 1].map((num) => (
                        <option key={num} value={num}>
                          {num} stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Comment (optional)
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      className="border rounded px-3 py-2 w-full h-20 resize-none"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <button
                    onClick={submitReview}
                    disabled={isSubmittingReview}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() =>
          dispatch(setToast({ show: false, message: "", type: "success" }))
        }
        type={toast.type}
      />
    </>
  );
};

export default BookingSidebar;
