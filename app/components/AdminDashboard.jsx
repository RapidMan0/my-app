"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./Auth/AuthProvider";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { accessToken, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({ show: false, bookingId: null, date: "", time: "" });

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAllBookings();
    }
  }, [accessToken, user]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/bookings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить бронирования");
      }

      const data = await response.json();
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Вы уверены, что хотите отменить это бронирование?")) {
      return;
    }

    try {
      const response = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, notes: "Отменено администратором" }),
      });

      if (!response.ok) {
        throw new Error("Не удалось отменить бронирование");
      }

      setToast({ show: true, message: "Бронирование отменено", type: "success" });
      setSelectedBooking(null);
      fetchAllBookings();
      setTimeout(() => setToast({ ...toast, show: false }), 3000);
    } catch (err) {
      setToast({ show: true, message: err.message, type: "error" });
    }
  };

  const handleRescheduleClick = (booking) => {
    setRescheduleModal({
      show: true,
      bookingId: booking.id,
      date: booking.date,
      time: booking.time,
    });
    setSelectedBooking(null);
  };

  const handleRescheduleSubmit = async () => {
    try {
      const response = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: rescheduleModal.bookingId,
          date: rescheduleModal.date,
          time: rescheduleModal.time,
          notes: "Перенесено администратором",
        }),
      });

      if (!response.ok) {
        throw new Error("Не удалось перенести бронирование");
      }

      setToast({ show: true, message: "Бронирование перенесено", type: "success" });
      setRescheduleModal({ show: false, bookingId: null, date: "", time: "" });
      fetchAllBookings();
      setTimeout(() => setToast({ ...toast, show: false }), 3000);
    } catch (err) {
      setToast({ show: true, message: err.message, type: "error" });
    }
  };

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Подтверждено";
      case "cancelled":
        return "Отменено";
      case "rescheduled":
        return "Перенесено";
      default:
        return status;
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Доступ запрещен</h1>
          <p className="text-gray-400">У вас нет прав администратора</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-xl text-gray-300">Загрузка...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Админ панель</h1>
          <p className="text-gray-400">Управление бронированиями</p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            Ошибка: {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всего бронирований</p>
                <p className="text-white text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Подтверждено</p>
                <p className="text-green-400 text-3xl font-bold">{stats.confirmed}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Отменено</p>
                <p className="text-red-400 text-3xl font-bold">{stats.cancelled}</p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </motion.div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "confirmed"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Подтверждено
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Отменено
          </button>
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
        >
          {getFilteredBookings().length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-lg">Нет бронирований</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Клиент</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Услуга</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Барбер</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Дата и время</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Статус</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBookings().map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300">
                        <div>
                          <p className="font-semibold">{booking.user.name}</p>
                          <p className="text-sm text-gray-400">{booking.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{booking.service}</td>
                      <td className="px-6 py-4 text-gray-300">{booking.barber}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(booking.date).toLocaleDateString("ru-RU")} {booking.time}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                          Подробнее
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-800 rounded-lg p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Детали бронирования</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Клиент</p>
                <p className="text-white font-semibold">{selectedBooking.user.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{selectedBooking.user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Телефон</p>
                <p className="text-white">{selectedBooking.phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Услуга</p>
                <p className="text-white">{selectedBooking.service}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Барбер</p>
                <p className="text-white">{selectedBooking.barber}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Дата и время</p>
                <p className="text-white">
                  {new Date(selectedBooking.date).toLocaleDateString("ru-RU")} {selectedBooking.time}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Статус</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {getStatusText(selectedBooking.status)}
                </span>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-gray-400 text-sm">Примечания</p>
                  <p className="text-white">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            {selectedBooking.status === "confirmed" && (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleRescheduleClick(selectedBooking)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Перенести
                </button>
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Отменить
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setRescheduleModal({ show: false, bookingId: null, date: "", time: "" })}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-800 rounded-lg p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Перенести бронирование</h2>

            <div className="mb-4">
              <label className="block text-gray-300 font-semibold mb-2">Новая дата</label>
              <input
                type="date"
                value={rescheduleModal.date}
                onChange={(e) =>
                  setRescheduleModal({ ...rescheduleModal, date: e.target.value })
                }
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-2">Новое время</label>
              <input
                type="time"
                value={rescheduleModal.time}
                onChange={(e) =>
                  setRescheduleModal({ ...rescheduleModal, time: e.target.value })
                }
                className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setRescheduleModal({ show: false, bookingId: null, date: "", time: "" })
                }
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Отменить
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Подтвердить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 20 }}
          className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg text-white z-40 ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;