import React from "react";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

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
          <ClipboardDocumentCheckIcon className="w-10 h-10 text-indigo-400" />
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
            <p className="text-gray-400 text-sm">Today</p>
            <p className="text-yellow-400 text-3xl font-bold">
              {stats.today}
            </p>
          </div>
          <CalendarDaysIcon className="w-10 h-10 text-yellow-400" />
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
            <p className="text-gray-400 text-sm">Upcoming</p>
            <p className="text-green-400 text-3xl font-bold">
              {stats.upcoming}
            </p>
          </div>
          <ClockIcon className="w-10 h-10 text-green-400" />
        </div>
      </motion.div>
    </div>
  );
};

export default StatisticsCards;
