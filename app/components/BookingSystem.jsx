"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const BookingSidebar = () => {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showBookingButton, setShowBookingButton] = useState(true); // Управление видимостью кнопки
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch(
          "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
          {
            headers: {
              "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
            },
          }
        );
        const json = await response.json();
        setBarbers(json.record.barbers);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch(
          "https://api.jsonbin.io/v3/b/680b69788960c979a58cd355/latest",
          {
            headers: {
              "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
            },
          }
        );
        const json = await response.json();
        setServices(json.record.services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchBarbers();
    fetchServices();
  }, []);

  // Блокировка прокрутки основной страницы
  useEffect(() => {
    const handleScroll = (e) => {
      if (isOpen) {
        const sidebar = document.getElementById("booking-sidebar");
        if (sidebar && !sidebar.contains(e.target)) {
          document.body.classList.remove("overflow-hidden");
        } else {
          document.body.classList.add("overflow-hidden");
        }
      }
    };

    document.addEventListener("wheel", handleScroll, { passive: true });
    document.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("wheel", handleScroll);
      document.removeEventListener("touchmove", handleScroll);
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleBooking = () => {
    if (!selectedBarber || !selectedService || !selectedTime || !selectedDate) {
      alert("Please select a barber, service, date, and time to book an appointment.");
      return;
    }
    alert(
      `Appointment booked with ${selectedBarber.name} for ${selectedService.name} on ${selectedDate} at ${selectedTime}.`
    );
  };

  return (
    <>
      {showBookingButton && ( // Кнопка отображается только если showBookingButton === true
        <button
          onClick={() => {
            setIsOpen(true);
            setShowBookingButton(false); // Скрыть кнопку после нажатия
          }}
          className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all"
        >
          💈 Book Now
        </button>
      )}

      <motion.aside
        id="booking-sidebar"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-white shadow-2xl z-40 overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choose a Barber</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowBookingButton(true); // Показать кнопку снова при закрытии боковой панели
            }}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        {/* Выбор барбера */}
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className={`cursor-pointer flex flex-col gap-2 border rounded-xl p-4 mb-4 shadow-sm transition ${selectedBarber?.id === barber.id ? "border-blue-500" : "border-gray-200"
              }`}
            onClick={() => {
              setSelectedBarber(barber);
              setSelectedService(null);
              setSelectedDate("");
              setSelectedTime(null);
            }}
          >
            <div className="flex items-center gap-4">
              <Image
                src={barber.image}
                alt={barber.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-lg">{barber.name}</p>
                <p className="text-sm text-gray-500">{barber.role}</p>
                <p className="text-yellow-500 text-sm">
                  ★★★★★{" "}
                  <span className="text-gray-500">{barber.feedback} feedbacks</span>
                </p>
              </div>
            </div>

            {/* Меню выбора услуги */}
            {selectedBarber?.id === barber.id && (
              <>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Choose a Service:</h3>
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`cursor-pointer flex flex-col gap-2 border rounded-xl p-4 mb-4 shadow-sm transition ${selectedService?.id === service.id ? "border-blue-500" : "border-gray-200"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.description}</p>
                      <p className="text-sm font-bold text-blue-500">{service.price}</p>
                    </div>
                  ))}
                </div>

                {/* Меню выбора даты */}
                {selectedService && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold mb-2">Choose a Date:</label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* Меню выбора времени */}
                {selectedService && selectedDate && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold mb-2">Choose a Time:</label>
                    <div className="flex gap-2 flex-wrap">
                      {barber.availableTimes.map((time, index) => (
                        <button
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm shadow ${selectedTime === time ? "bg-blue-500 text-white" : "bg-gray-100"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTime(time);
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Кнопка подтверждения */}
        {selectedBarber && selectedService && selectedDate && selectedTime && (
          <button
            onClick={handleBooking}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Confirm Appointment
          </button>
        )}
      </motion.aside>
    </>
  );
};

export default BookingSidebar;