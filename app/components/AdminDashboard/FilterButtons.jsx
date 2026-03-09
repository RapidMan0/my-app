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
        onClick={() => setFilter("today")}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
          filter === "today"
            ? "bg-yellow-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Today
      </button>
      <button
        onClick={() => setFilter("upcoming")}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
          filter === "upcoming"
            ? "bg-green-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Upcoming
      </button>
      <button
        onClick={() => setFilter("past")}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
          filter === "past"
            ? "bg-red-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        Past
      </button>
    </div>
  );
};

export default FilterButtons;
