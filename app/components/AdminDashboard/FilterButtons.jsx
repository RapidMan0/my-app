import React from "react";

const FilterButtons = ({ filter, setFilter }) => {
  return (
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
  );
};

export default FilterButtons;
