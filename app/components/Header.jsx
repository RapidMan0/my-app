"use client";

import React, { useState } from "react";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navItems = ["Home", "About", "Services", "Our Gallery", "Contact"];

    return (
        <header className="bg-black text-white shadow-md">
            <nav className="container mx-auto px-4 py-4">
                {/* Desktop меню */}
                <ul className="hidden md:flex justify-center space-x-14 font-semibold">
                    {navItems.map((item) => (
                        <li key={item}>
                            <a
                                href={`#${item.toLowerCase() === "services" ? "pricing-tabs" : item.toLowerCase()}`}
                                className="hover:text-red-500 transition"
                            >
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Кнопка бургера (моб. меню) */}
                <div className="flex justify-end md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle Menu"
                        className="text-white"
                    >
                        {isOpen ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Мобильное меню */}
                {isOpen && (
                    <ul className="mt-4 space-y-4 font-semibold md:hidden text-center">
                        {navItems.map((item) => (
                            <li key={item}>
                                <a
                                    href={`#${item.toLowerCase()}`}
                                    className="block text-white hover:text-red-500 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </nav>
        </header>
    );
};

export default Header;
