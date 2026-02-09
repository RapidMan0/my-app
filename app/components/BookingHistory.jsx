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

const BookingHistory = () => {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // react-smart-print
  const {
    config: pdfConfig,
    renderAndPrint,
    isLoading: pdfLoading,
    isRendered: pdfRendered,
    unmount: closePdf,
  } = useSmartPrint("user-bookings-report");

  useEffect(() => {
    if (accessToken) {
      fetchBookings();
    }
  }, [accessToken]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings/list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setError("Unauthorized. Please refresh the page.");
        setBookings([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
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

  // Group bookings by email so phone/email appear once per user (no name)
  const groupedBookings = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      const email = b.email || b.user?.email || "—";
      const phone = b.phone || b.user?.phone || "—";
      const key = email;
      if (!map.has(key)) {
        map.set(key, { email, phone, items: [] });
      }
      map.get(key).items.push(b);
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.email || "").localeCompare(b.email || ""),
    );
  }, [bookings]);

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
        Booking History
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
        Generated: {new Date().toLocaleDateString()} | Total bookings:{" "}
        {bookings.length}
      </Typography>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Booking History</h1>
          <div className="flex gap-3">
            <button
              onClick={renderAndPrint}
              disabled={pdfLoading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              {pdfLoading ? "Генерация PDF..." : "Скачать историю (PDF)"}
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
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {groupedBookings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">You have no bookings yet</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {groupedBookings.map((group) => (
              <motion.div
                key={`${group.email}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <div>
                    <p className="text-gray-100 text-sm">
                      ✉️ {group.email}{" "}
                      {group.phone && group.phone !== "—"
                        ? `• 📞 ${group.phone}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-sm text-gray-300">
                    {group.items.length} booking
                    {group.items.length > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="grid gap-3">
                  {group.items
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-900 rounded p-3 text-gray-200 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">
                            {booking.service} — {booking.barber}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(booking.date).toLocaleDateString("en-US")}{" "}
                            at {booking.time}
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

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
          <Typography bold fontSize={18} align="center" marginBottom={12}>
            Booking History
          </Typography>
          <Paragraph align="left" fontSize={12} marginBottom={12}>
            Generated: {new Date().toLocaleDateString("ru-RU")}
          </Paragraph>
          <Divider />

          {groupedBookings.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 12 }}>
              <Typography bold fontSize={13} marginBottom={6}>
                {group.email} {group.phone !== "—" ? `• ${group.phone}` : ""}
              </Typography>

              <Table width="100%" tableLayout="fixed">
                <TableHead style={{ background: "#0051ff" }}>
                  <TableRow>
                    <TableCell
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 11,
                        textAlign: "center",
                        background: "#0051ff",
                        padding: "8px 4px",
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
                        background: "#0051ff",
                        padding: "8px 4px",
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
                        background: "#0051ff",
                        padding: "8px 4px",
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
                        background: "#0051ff",
                        padding: "8px 4px",
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.items
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((b, idx) => (
                      <TableRow
                        key={b.id || idx}
                        style={{
                          background: idx % 2 === 0 ? "#f1f5f9" : "#fff",
                          minHeight: "22px",
                        }}
                      >
                        <TableCell
                          style={{
                            textAlign: "center",
                            fontSize: 11,
                            padding: "6px 4px",
                          }}
                        >
                          {b.service}
                        </TableCell>
                        <TableCell
                          style={{
                            textAlign: "center",
                            fontSize: 11,
                            padding: "6px 4px",
                          }}
                        >
                          {b.barber}
                        </TableCell>
                        <TableCell
                          style={{
                            textAlign: "center",
                            fontSize: 11,
                            padding: "6px 4px",
                          }}
                        >
                          {new Date(b.date).toLocaleDateString("en-GB")}{" "}
                          {b.time}
                        </TableCell>
                        <TableCell
                          style={{
                            textAlign: "center",
                            fontSize: 11,
                            padding: "6px 4px",
                          }}
                        >
                          {getStatusText(b.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </PageRender>
      </div>
    </motion.div>
  );
};

export default BookingHistory;
