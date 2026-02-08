import React from "react";
import { motion } from "framer-motion";

const RescheduleModal = ({
  isOpen,
  data,
  error,
  onClose,
  onDateChange,
  onTimeChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

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
          Reschedule Booking
        </h2>

        <div className="mb-4">
          <label className="block text-gray-300 font-semibold mb-2">
            New Date
          </label>
          <input
            type="date"
            value={data.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
          />
          {error && (
            <div className="text-red-400 mt-2 text-sm">{error}</div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-2">
            New Time
          </label>
          <input
            type="time"
            value={data.time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RescheduleModal;
