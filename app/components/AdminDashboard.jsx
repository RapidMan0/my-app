"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./Auth/AuthProvider";
import { motion } from "framer-motion";
import {
  PageRender,
  Typography,
  Paragraph,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  useSmartPrint,
} from "react-smart-print";

const AdminDashboard = () => {
  const { accessToken, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({
    show: false,
    bookingId: null,
    date: "",
    time: "",
  });
  const [rescheduleError, setRescheduleError] = useState(""); // новое состояние для ошибок

  // PDF logic for react-smart-print
  const {
    config: pdfConfig,
    renderAndPrint,
    isLoading: pdfLoading,
    isRendered: pdfRendered,
    unmount: closePdf,
  } = useSmartPrint("admin-bookings-report");

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
        throw new Error("Failed to load bookings");
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
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this booking? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ message: "Failed to delete booking" }));
        throw new Error(err.message || "Failed to delete booking");
      }

      setToast({
        show: true,
        message: "Booking removed from database",
        type: "success",
      });
      // Обновляем список локально или заново загружаем
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setSelectedBooking(null);
      setTimeout(
        () => setToast({ show: false, message: "", type: "success" }),
        3000,
      );
    } catch (err) {
      setToast({
        show: true,
        message: err.message || "Delete failed",
        type: "error",
      });
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
    // Валидация даты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(rescheduleModal.date);

    if (!rescheduleModal.date) {
      setRescheduleError("Выберите дату!");
      return;
    }
    if (selectedDate < today) {
      setRescheduleError("Дата не может быть в прошлом!");
      return;
    }
    setRescheduleError(""); // сброс ошибки

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
          notes: "Rescheduled by admin",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reschedule booking");
      }

      setToast({ show: true, message: "Booking rescheduled", type: "success" });
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
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "rescheduled":
        return "Rescheduled";
      default:
        return status;
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  // PDF header/footer
  const pdfHeader = (page, total) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 20px",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <Typography fontSize={12} color="#2563eb" bold>
        Booking Report
      </Typography>
      <Typography fontSize={12} color="#2563eb">
        Page {page} of {total}
      </Typography>
    </div>
  );
  const pdfFooter = (page, total) => (
    <div
      style={{
        textAlign: "center",
        padding: "8px",
        borderTop: "1px solid #e2e8f0",
        color: "#64748b",
      }}
    >
      <Typography fontSize={10}>
        Generated: {new Date().toLocaleDateString()} | Total:{" "}
        {getFilteredBookings().length}
      </Typography>
    </div>
  );

  // PDF table rows
  const pdfTableRows = getFilteredBookings().map((b, idx) => (
    <TableRow
      key={b.id || idx}
      style={{
        background: idx % 2 === 0 ? "#f1f5f9" : "#fff",
        minHeight: "24px",
      }}
    >
      <TableCell
        style={{ textAlign: "center", fontSize: 12, padding: "6px 4px" }}
      >
        {b.clientName ||
          b.name ||
          b.user?.name ||
          (b.email || "").split("@")[0] ||
          "Unknown"}
      </TableCell>
      <TableCell
        style={{ textAlign: "center", fontSize: 12, padding: "6px 4px" }}
      >
        {b.email || b.user?.email || "—"}
      </TableCell>
      <TableCell
        style={{ textAlign: "center", fontSize: 12, padding: "6px 4px" }}
      >
        {b.service}
      </TableCell>
      <TableCell
        style={{ textAlign: "center", fontSize: 12, padding: "6px 4px" }}
      >
        {b.barber}
      </TableCell>
      <TableCell
        style={{ textAlign: "center", fontSize: 12, padding: "6px 4px" }}
      >
        {new Date(b.date).toLocaleDateString("en-GB")} {b.time}
      </TableCell>
      <TableCell
        style={{ textAlign: "center", fontSize: 12, padding: "6px 4px" }}
      >
        {getStatusText(b.status)}
      </TableCell>
    </TableRow>
  ));

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You do not have admin permissions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-xl text-gray-300">Loading...</div>
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage all bookings</p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            Error: {error}
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
                <p className="text-gray-400 text-sm">Total Bookings</p>
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
                <p className="text-gray-400 text-sm">Confirmed</p>
                <p className="text-green-400 text-3xl font-bold">
                  {stats.confirmed}
                </p>
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
                <p className="text-gray-400 text-sm">Cancelled</p>
                <p className="text-red-400 text-3xl font-bold">
                  {stats.cancelled}
                </p>
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
            All
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "confirmed"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings Table / Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
        >
          {getFilteredBookings().length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-lg">No bookings found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                          Barber
                        </th>
                        <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-gray-300 font-semibold">
                          Action
                        </th>
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
                              <p className="font-semibold">
                                {booking.clientName ||
                                  booking.name ||
                                  booking.user?.name ||
                                  (booking.email || "").split("@")[0] ||
                                  "Unknown"}
                              </p>
                              <p className="text-sm text-gray-400">
                                {booking.email || booking.user?.email || "—"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {booking.service}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {booking.barber}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {new Date(booking.date).toLocaleDateString("en-US")}{" "}
                            {booking.time}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}
                            >
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                            >
                              Details
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {getFilteredBookings().map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-white">
                          {booking.clientName ||
                            booking.name ||
                            booking.user?.name ||
                            (booking.email || "").split("@")[0] ||
                            "Unknown"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.email || booking.user?.email || "—"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">Service: </span>
                      <span className="text-white">{booking.service}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">Barber: </span>
                      <span className="text-white">{booking.barber}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">
                        Date & Time:{" "}
                      </span>
                      <span className="text-white">
                        {new Date(booking.date).toLocaleDateString("en-US")}{" "}
                        {booking.time}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="mt-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Details
                    </button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* PDF Report Button */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={renderAndPrint}
            disabled={pdfLoading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            {pdfLoading ? "Генерация PDF..." : "Скачать отчет (PDF)"}
          </button>
          {pdfRendered && (
            <button
              onClick={closePdf}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Закрыть PDF
            </button>
          )}
        </div>

        {/* PDF Content (hidden, used for react-smart-print) */}
        <PageRender
          {...pdfConfig}
          paperOptions={{
            paperSize: "a4",
            margin: "normal",
            paragraphSpacing: 12,
          }}
          header={pdfHeader}
          footer={pdfFooter}
        >
          <Typography bold fontSize={18} align="center" marginBottom={16}>
            Booking Report
          </Typography>
          <Paragraph align="left" fontSize={12} marginBottom={12}>
            Дата формирования: {new Date().toLocaleDateString("ru-RU")}
          </Paragraph>
          <Divider />
          <Table width="100%">
            <TableHead>
              <TableRow style={{ background: "#2563eb" }}>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                  }}
                >
                  Client
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                  }}
                >
                  Service
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                  }}
                >
                  Barber
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                  }}
                >
                  Date & Time
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "8px 4px",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{pdfTableRows}</TableBody>
          </Table>
        </PageRender>

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
              <h2 className="text-2xl font-bold text-white mb-6">
                Booking Details
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Client</p>
                  <p className="text-white font-semibold">
                    {selectedBooking.clientName ||
                      selectedBooking.name ||
                      selectedBooking.user?.name ||
                      (selectedBooking.email || "").split("@")[0] ||
                      "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">
                    {selectedBooking.email ||
                      selectedBooking.user?.email ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Service</p>
                  <p className="text-white">{selectedBooking.service}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Barber</p>
                  <p className="text-white">{selectedBooking.barber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date & Time</p>
                  <p className="text-white">
                    {new Date(selectedBooking.date).toLocaleDateString("en-US")}{" "}
                    {selectedBooking.time}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      selectedBooking.status,
                    )}`}
                  >
                    {getStatusText(selectedBooking.status)}
                  </span>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <p className="text-gray-400 text-sm">Notes</p>
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
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
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
            onClick={() =>
              setRescheduleModal({
                show: false,
                bookingId: null,
                date: "",
                time: "",
              })
            }
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 rounded-lg p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Reschedule Booking
              </h2>

              <div className="mb-4">
                <label className="block text-gray-300 font-semibold mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleModal.date}
                  min={new Date().toISOString().split("T")[0]} // запретить прошлые даты
                  onChange={(e) =>
                    setRescheduleModal({
                      ...rescheduleModal,
                      date: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                />
                {rescheduleError && (
                  <div className="text-red-400 mt-2 text-sm">
                    {rescheduleError}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 font-semibold mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleModal.time}
                  onChange={(e) =>
                    setRescheduleModal({
                      ...rescheduleModal,
                      time: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setRescheduleModal({
                      show: false,
                      bookingId: null,
                      date: "",
                      time: "",
                    })
                  }
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Confirm
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
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
