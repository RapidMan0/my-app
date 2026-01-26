"use client";

import React, { useState, useRef, useEffect } from "react";
import md5 from 'blueimp-md5'
import LoginForm from "./Auth/LoginForm";
import RegisterForm from "./Auth/RegisterForm";
import { useAuth } from "./Auth/AuthProvider";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, login, register, logout } = useAuth();
  const navItems = ["Home", "About", "Services", "Gallery", "Contact"];
  const overlayLoginRef = useRef(null)
  const overlayRegisterRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (showLogin) setShowLogin(false)
        if (showRegister) setShowRegister(false)
      }
    }
    if (showLogin || showRegister) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLogin, showRegister])

  // AuthProvider handles refresh on mount; Header uses `useAuth()` for user state

  return (
    <header className="bg-black text-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        {/* Desktop меню */}
        <div className="flex items-center justify-between">
          <ul className="hidden md:flex space-x-14 font-semibold">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${
                    item.toLowerCase() === "services"
                      ? "pricing-tabs"
                      : item.toLowerCase()
                  }`}
                  className="hover:text-red-500 transition"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="border border-white px-3 py-1 rounded"
                >
                  Register
                </button>
              </>
                ) : (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden">
                  {user.email ? (
                    <img
                      src={`https://www.gravatar.com/avatar/${md5(
                        (user.email || "").trim().toLowerCase()
                      )}?s=80&d=identicon`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-medium">
                      {(user.name || user.email || "")
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="font-medium">{user.name || user.email}</span>
                                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
                      await logout()
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-gray-700 px-2 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

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
            <li>
              {!user ? (
                <div className="space-x-2">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-red-500 px-3 py-1 rounded"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="border border-white px-3 py-1 rounded"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <span>{user.name || user.email}</span>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await logout();
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-gray-700 px-2 py-1 rounded"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        )}

        {/* Login modal */}
        {showLogin && (
          <div
            ref={el => overlayLoginRef.current = el}
            onClick={(e) => { if (e.target === overlayLoginRef.current) setShowLogin(false) }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white p-6 rounded text-black w-80 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Login</h3>
              <LoginForm onClose={() => setShowLogin(false)} />
              <button
                onClick={() => setShowLogin(false)}
                className="mt-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Register modal */}
        {showRegister && (
          <div
            ref={el => overlayRegisterRef.current = el}
            onClick={(e) => { if (e.target === overlayRegisterRef.current) setShowRegister(false) }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white p-6 rounded text-black w-80 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Register</h3>
              <RegisterForm onClose={() => setShowRegister(false)} />
              <button
                onClick={() => setShowRegister(false)}
                className="mt-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
