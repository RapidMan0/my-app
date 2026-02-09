"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import StatisticsCards from "./AdminDashboard/StatisticsCards";
import FilterButtons from "./AdminDashboard/FilterButtons";
import BookingsTable from "./AdminDashboard/BookingsTable";
import BookingDetailsModal from "./AdminDashboard/BookingDetailsModal";
import RescheduleModal from "./AdminDashboard/RescheduleModal";
import ServiceChart from "./AdminDashboard/ServiceChart";

const AdminDashboard = () => {
  const { accessToken, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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

  const filteredBookings = getFilteredBookings();
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

  // aggregated data for Recharts (most popular services)
  const serviceData = useMemo(() => {
    const counts = {};
    bookings.forEach((b) => {
      const key = (b.service || "Unknown").toString();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

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

        <StatisticsCards stats={stats} />
        <FilterButtons filter={filter} setFilter={setFilter} />

        {/* Bookings Table / Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-8"
        >
          <BookingsTable
            bookings={paginatedBookings}
            onSelectBooking={setSelectedBooking}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, filteredBookings.length)}</span> of{" "}
                  <span className="font-medium">{filteredBookings.length}</span> results
                </p>
              </div>
              <div>
                <nav
                  aria-label="Pagination"
                  className="isolate inline-flex -space-x-px rounded-md border border-gray-600"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-600 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon aria-hidden="true" className="size-5" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first 3 pages, last 3 pages, and current page with neighbors
                    const isVisible =
                      pageNum <= 3 ||
                      pageNum > totalPages - 3 ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                    if (!isVisible && pageNum !== 4 && pageNum !== totalPages - 2) {
                      return null;
                    }

                    if (
                      (pageNum === 4 && totalPages > 6 && currentPage > 4) ||
                      (pageNum === totalPages - 2 && totalPages > 6 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 ring-1 ring-gray-600 focus:outline-offset-0"
                        >
                          ...
                        </span>
                      );
                    }

                    if (!isVisible) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={pageNum === currentPage ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline-offset-2 ${
                          pageNum === currentPage
                            ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-indigo-500"
                            : "text-gray-200 ring-1 ring-gray-600 hover:bg-gray-700 focus-visible:outline-offset-0"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-600 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon aria-hidden="true" className="size-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
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
          <Table width="100%" tableLayout="fixed">
            <TableHead>
              <TableRow style={{ background: "#2563eb" }}>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                    width: "15%",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Client
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                    width: "18%",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                    width: "17%",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Service
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                    width: "16%",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Barber
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight: "1px solid #fff",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                    width: "18%",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Date & Time
                </TableCell>
                <TableCell
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 11,
                    textAlign: "center",
                    padding: "8px 4px",
                    background: "#2563eb",
                    letterSpacing: "0.02em",
                    width: "16%",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredBookings().map((b, idx) => (
                <TableRow
                  key={b.id || idx}
                  style={{
                    background: idx % 2 === 0 ? "#f1f5f9" : "#fff",
                    minHeight: "24px",
                  }}
                >
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 4px",
                      width: "15%",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {b.clientName ||
                      b.name ||
                      b.user?.name ||
                      (b.email || "").split("@")[0] ||
                      "Unknown"}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 4px",
                      width: "18%",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {(b.email || b.user?.email || "—").length > 20
                      ? (b.email || b.user?.email || "—").substring(0, 15) + "…"
                      : b.email || b.user?.email || "—"}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 4px",
                      width: "17%",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {b.service}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 4px",
                      width: "16%",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {b.barber}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 4px",
                      width: "18%",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {new Date(b.date).toLocaleDateString("en-GB")}
                    <br />
                    {b.time}
                  </TableCell>
                  <TableCell
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      padding: "6px 4px",
                      width: "16%",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {getStatusText(b.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PageRender>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onReschedule={handleRescheduleClick}
          onCancel={handleCancelBooking}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          isOpen={rescheduleModal.show}
          data={rescheduleModal}
          error={rescheduleError}
          onClose={() =>
            setRescheduleModal({
              show: false,
              bookingId: null,
              date: "",
              time: "",
            })
          }
          onDateChange={(date) =>
            setRescheduleModal({ ...rescheduleModal, date })
          }
          onTimeChange={(time) =>
            setRescheduleModal({ ...rescheduleModal, time })
          }
          onSubmit={handleRescheduleSubmit}
        />

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

        {/* Services usage chart */}
        <ServiceChart data={serviceData} />
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
