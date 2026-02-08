import React from "react";
import { motion } from "framer-motion";

const BookingsTable = ({
  bookings,
  onSelectBooking,
  getStatusColor,
  getStatusText,
}) => {
  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-lg">No bookings found</p>
      </div>
    );
  }

  return (
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
              {bookings.map((booking, index) => (
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
                      onClick={() => onSelectBooking(booking)}
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
        {bookings.map((booking, index) => (
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
              <span className="text-gray-400 text-sm">Date & Time: </span>
              <span className="text-white">
                {new Date(booking.date).toLocaleDateString("en-US")}{" "}
                {booking.time}
              </span>
            </div>
            <button
              onClick={() => onSelectBooking(booking)}
              className="mt-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Details
            </button>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default BookingsTable;
