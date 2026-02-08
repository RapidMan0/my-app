import React from "react";
import { motion } from "framer-motion";

const BookingDetailsModal = ({
  booking,
  onClose,
  onReschedule,
  onCancel,
  getStatusColor,
  getStatusText,
}) => {
  if (!booking) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
              {booking.clientName ||
                booking.name ||
                booking.user?.name ||
                (booking.email || "").split("@")[0] ||
                "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white">
              {booking.email || booking.user?.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Phone</p>
            <p className="text-white">{booking.phone}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Service</p>
            <p className="text-white">{booking.service}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Barber</p>
            <p className="text-white">{booking.barber}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Date & Time</p>
            <p className="text-white">
              {new Date(booking.date).toLocaleDateString("en-US")}{" "}
              {booking.time}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                booking.status,
              )}`}
            >
              {getStatusText(booking.status)}
            </span>
          </div>
          {booking.notes && (
            <div>
              <p className="text-gray-400 text-sm">Notes</p>
              <p className="text-white">{booking.notes}</p>
            </div>
          )}
        </div>

        {booking.status === "confirmed" && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => onReschedule(booking)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reschedule
            </button>
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default BookingDetailsModal;
