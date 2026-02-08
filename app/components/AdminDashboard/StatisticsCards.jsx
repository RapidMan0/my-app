import React from "react";
import { motion } from "framer-motion";

const StatisticsCards = ({ stats }) => {
  return (
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
  );
};

export default StatisticsCards;
