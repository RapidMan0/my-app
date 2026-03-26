import React from "react";

const FilterButtons = ({
  filter,
  setFilter,
  selectedService,
  setSelectedService,
  selectedBarber,
  setSelectedBarber,
  services,
  barbers,
}) => {
  const handleResetFilters = () => {
    setFilter("all");
    setSelectedService("");
    setSelectedBarber("");
  };

  return (
    <div className="flex gap-4 mb-8 flex-wrap items-center">
      {/* Date filter buttons */}
      <div className="flex gap-4 flex-wrap">
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

      {/* Service filter dropdown */}
      <select
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
        className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 hover:border-gray-500 focus:outline-none focus:bg-gray-600 transition-colors"
      >
        <option value="">All Services</option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>

      {/* Barber filter dropdown */}
      <select
        value={selectedBarber}
        onChange={(e) => setSelectedBarber(e.target.value)}
        className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 hover:border-gray-500 focus:outline-none focus:bg-gray-600 transition-colors"
      >
        <option value="">All Barbers</option>
        {barbers.map((barber) => (
          <option key={barber} value={barber}>
            {barber}
          </option>
        ))}
      </select>

      {/* Reset filters button */}
      <button
        onClick={handleResetFilters}
        className="px-4 py-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors font-semibold"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterButtons;
