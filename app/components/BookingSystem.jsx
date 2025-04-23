"use client";

import React, { useState } from "react";

const BookingSystem = () => {
    // База данных услуг
    const services = [
        { name: "Haircut", duration: 30 },
        { name: "Hair Coloring", duration: 60 },
        { name: "Beard Grooming", duration: 20 },
        { name: "Complex (Haircut + Beard)", duration: 90 },
    ];

    // Парикмахеры
    const barbers = [
        { id: 1, name: "Patrick Potter" },
        { id: 2, name: "John Smith" },
        { id: 3, name: "Emily Johnson" },
    ];

    // Состояния
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Временные интервалы
    const workingHours = { start: 9, end: 18 }; // Рабочий день с 9:00 до 18:00
    const timeSlots = Array.from(
        { length: (workingHours.end - workingHours.start) * 2 },
        (_, i) => {
            const hour = workingHours.start + Math.floor(i / 2);
            const minutes = i % 2 === 0 ? "00" : "30";
            return `${hour}:${minutes}`;
        }
    );

    // Проверка доступности времени
    const getAvailableSlots = () => {
        if (!selectedService || !selectedBarber) return [];
        const serviceDuration = services.find((s) => s.name === selectedService).duration;
        return timeSlots.filter((slot, index) => {
            const [hour, minutes] = slot.split(":").map(Number);
            const startMinutes = hour * 60 + minutes;
            const endMinutes = startMinutes + serviceDuration;

            // Проверяем, чтобы услуга не выходила за пределы рабочего дня
            const endHour = Math.floor(endMinutes / 60);
            const endMinute = endMinutes % 60;
            return endHour < workingHours.end || (endHour === workingHours.end && endMinute === 0);
        });
    };

    return (
        <section className="py-12 bg-gray-100">
            <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Book Your Appointment</h2>

                {/* Выбор парикмахера */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold mb-2">Choose a Barber:</label>
                    <select
                        className="w-full p-3 border rounded"
                        value={selectedBarber || ""}
                        onChange={(e) => setSelectedBarber(e.target.value)}
                    >
                        <option value="" disabled>
                            Select a barber
                        </option>
                        {barbers.map((barber) => (
                            <option key={barber.id} value={barber.name}>
                                {barber.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Выбор услуги */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold mb-2">Choose a Service:</label>
                    <select
                        className="w-full p-3 border rounded"
                        value={selectedService || ""}
                        onChange={(e) => setSelectedService(e.target.value)}
                    >
                        <option value="" disabled>
                            Select a service
                        </option>
                        {services.map((service) => (
                            <option key={service.name} value={service.name}>
                                {service.name} ({service.duration} min)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Доступные временные интервалы */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold mb-2">Available Time Slots:</label>
                    <select
                        className="w-full p-3 border rounded"
                        value={selectedTime || ""}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        disabled={!selectedService || !selectedBarber}
                    >
                        <option value="" disabled>
                            Select a time slot
                        </option>
                        {getAvailableSlots().map((slot, index) => (
                            <option key={index} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Подтверждение записи */}
                {selectedBarber && selectedService && selectedTime && (
                    <div className="mt-6 p-4 bg-green-100 border border-green-500 rounded">
                        <h3 className="text-lg font-bold mb-2">Appointment Summary:</h3>
                        <p>
                            <strong>Barber:</strong> {selectedBarber}
                        </p>
                        <p>
                            <strong>Service:</strong> {selectedService}
                        </p>
                        <p>
                            <strong>Time:</strong> {selectedTime}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default BookingSystem;