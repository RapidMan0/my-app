"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import emailjs from "emailjs-com";

// Toast уведомление
const Toast = ({ message, show, onClose, type = "success" }) => (
  <div
    className={`fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-lg shadow-lg transition-all duration-500
      ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
    `}
    role="alert"
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold">{message}</span>
      <button
        className="ml-4 text-white text-xl hover:text-gray-200"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  </div>
);

const BookingSidebar = () => {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showBookingButton, setShowBookingButton] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Fetch barbers and services data
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch(
          "https://api.jsonbin.io/v3/b/680b66408a456b7966910e72/latest",
          {
            headers: {
              "X-Master-Key":
                "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
            },
          }
        );
        const json = await response.json();
        setBarbers(json.record.barbers);
      } catch (error) {
        console.error("Error fetching barbers:", error);
      }
    };

    // Fetch services data
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "https://api.jsonbin.io/v3/b/680b69788960c979a58cd355/latest",
          {
            headers: {
              "X-Master-Key":
                "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
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

  // Handle scroll event to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  const onSubmit = (data) => {
    const templateParams = {
      barber: selectedBarber.name,
      service: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      email: data.email,
      phone: data.phone,
      price: selectedService.price,
    };

    emailjs
      .send(
        "service_m48lm91",     // <-- замените
        "template_pmcf25u",    // <-- замените
        templateParams,
        "TWMGobjrMR-dkenWF"      // <-- замените
      )
      .then(
        (result) => {
          showToast("Appointment booked and email sent!", "success");
          setShowForm(false);
          setIsOpen(false);
          setShowBookingButton(true);
        },
        (error) => {
          console.error("Email error:", error);
          showToast("Failed to send email. Try again later.", "error");
        }
      );
  };

  return (
    <>
      {showBookingButton && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowBookingButton(false);
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
          <h2 className="text-2xl font-bold">
            {selectedBarber ? "Choose a Service" : "Choose a Barber"}
          </h2>
          <button
            onClick={() => {
              if (selectedBarber) {
                setSelectedBarber(null); // Сбросить выбранного барбера
                setSelectedService(null);
                setSelectedDate("");
                setSelectedTime(null);
              } else {
                setIsOpen(false);
                setShowBookingButton(true);
                setShowForm(false);
              }
            }}
            className="text-2xl"
          >
            {selectedBarber ? "← Back" : "×"}
          </button>
        </div>
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className={`cursor-pointer flex flex-col gap-2 border rounded-xl p-4 mb-4 shadow-sm transition ${selectedBarber?.id === barber.id
              ? "border-red-500"
              : "border-gray-200"
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
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-lg">{barber.name}</p>
                <p className="text-sm text-gray-500">{barber.role}</p>
                <p className="text-yellow-500 text-sm">
                  ★★★★★{" "}
                  <span className="text-gray-500">
                    {barber.feedback} feedbacks
                  </span>
                </p>
                {barber.experience && (
                  <p className="text-xs text-gray-400">Experience: {barber.experience}</p>
                )}
              </div>
            </div>

            {selectedBarber?.id === barber.id && (
              <>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Choose a Service:</h3>
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`cursor-pointer flex flex-col gap-2 border rounded-xl p-4 mb-4 shadow-sm transition ${selectedService?.id === service.id
                        ? "border-red-500"
                        : "border-gray-200"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                    >
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                      <p className="text-sm font-bold text-blue-500">
                        {service.price}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedService && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold mb-2">
                      Choose a Date:
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      min={new Date().toISOString().split("T")[0]}
                      max={new Date(new Date().setDate(new Date().getDate() + 30))
                        .toISOString()
                        .split("T")[0]}
                    />
                  </div>
                )}

                {selectedService && selectedDate && (
                  <div className="mt-4">
                    <label className="block text-lg font-semibold mb-2">
                      Choose a Time:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {barber.availableTimes.map((time, index) => (
                        <button
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm shadow ${selectedTime === time
                            ? "bg-red-500 text-white"
                            : "bg-gray-100"
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

        {/* Confirm button or form */}
        {selectedBarber &&
          selectedService &&
          selectedDate &&
          selectedTime &&
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg text-lg hover:bg-red-800 transition"
            >
              Confirm Appointment
            </button>
          )}

        {showForm && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-4 border-t pt-4"
          >
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                className="w-full p-3 border rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{8,15}$/,
                    message: "Enter a valid phone number (10-15 digits)",
                  },
                })}
                className="w-full p-3 border rounded"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Submit Booking
            </button>
          </form>
        )}
      </motion.aside>
      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
        type={toast.type}
      />
    </>
  );
};

export default BookingSidebar;