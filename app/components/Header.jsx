"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import md5 from "blueimp-md5";
import LoginForm from "./Auth/LoginForm";
import RegisterForm from "./Auth/RegisterForm";
import { useAuth } from "./Auth/AuthProvider";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const navItems = ["Home", "About", "Services", "Gallery", "Contact"];
  const overlayLoginRef = useRef(null);
  const overlayRegisterRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (showLogin) setShowLogin(false);
        if (showRegister) setShowRegister(false);
      }
    }
    if (showLogin || showRegister) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLogin, showRegister]);

  const handleLogout = async () => {
    setLoading(true);
    setIsOpen(false);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      await logout();
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (item) => {
    if (item.toLowerCase() === "home") {
      router.push("/");
    }
    setIsOpen(false);
  };

  return (
    <header className="bg-black text-white shadow-md">
      <nav className="container mx-auto px-4 py-2">
        {/* Desktop меню */}
        <div className="flex items-center justify-between">
          <ul className="hidden md:flex space-x-14 font-semibold">
            {navItems.map((item) => (
              <li key={item}>
                {item.toLowerCase() === "home" ? (
                  <Link href="/" className="hover:text-red-500 transition">
                    {item}
                  </Link>
                ) : (
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
                )}
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-red-500 px-2 lg:px-3 py-1 rounded hover:bg-red-600 transition text-sm lg:text-base"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="border border-white px-2 lg:px-3 py-1 rounded hover:bg-white hover:text-black transition text-sm lg:text-base"
                >
                  Register
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gray-600 overflow-hidden flex-shrink-0">
                  {user.email ? (
                    <img
                      src={`https://www.gravatar.com/avatar/${md5(
                        (user.email || "").trim().toLowerCase(),
                      )}?s=80&d=identicon`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-medium text-xs">
                      {(user.name || user.email || "")
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="font-medium text-sm lg:text-base hidden lg:inline">
                  {user.name || user.email}
                </span>
                <Link
                  href="/bookings"
                  className="text-blue-400 hover:text-blue-300 px-3 lg:px-4 py-2 rounded text-xs lg:text-sm transition flex items-center gap-2 hover:bg-blue-900/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V2h-2v1H8V2H6v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                  </svg>
                  <span className="hidden lg:inline">Bookings</span>
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-purple-400 hover:text-purple-300 px-3 lg:px-4 py-2 rounded text-xs lg:text-sm transition flex items-center gap-2 hover:bg-purple-900/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.49.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.64l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                    </svg>
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="bg-gray-700 px-1.5 lg:px-2 py-1 rounded hover:bg-gray-600 transition disabled:opacity-50 text-xs lg:text-sm"
                >
                  {loading ? "..." : "Logout"}
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
                {item.toLowerCase() === "home" ? (
                  <Link
                    href="/"
                    className="block text-white hover:text-red-500 transition py-2"
                    onClick={() => handleNavClick(item)}
                  >
                    {item}
                  </Link>
                ) : (
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="block text-white hover:text-red-500 transition py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                  </a>
                )}
              </li>
            ))}
            <li className="border-t border-gray-700 pt-4">
              {!user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setIsOpen(false);
                    }}
                    className="block w-full bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowRegister(true);
                      setIsOpen(false);
                    }}
                    className="block w-full border border-white px-3 py-2 rounded hover:bg-white hover:text-black transition"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden">
                      {user.email ? (
                        <img
                          src={`https://www.gravatar.com/avatar/${md5(
                            (user.email || "").trim().toLowerCase(),
                          )}?s=80&d=identicon`}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-medium text-xs">
                          {(user.name || user.email || "")
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm">{user.name || user.email}</span>
                  </div>
                  <Link
                    href="/bookings"
                    className="block text-blue-400 hover:text-blue-300 text-sm py-2 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V2h-2v1H8V2H6v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                    </svg>
                    Bookings
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="block text-purple-400 hover:text-purple-300 text-sm py-2 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.22-.07.49.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.64l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="block w-full bg-gray-700 px-2 py-2 rounded hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    {loading ? "..." : "Logout"}
                  </button>
                </div>
              )}
            </li>
          </ul>
        )}

        {/* Login modal */}
        {showLogin && (
          <div
            ref={(el) => (overlayLoginRef.current = el)}
            onClick={(e) => {
              if (e.target === overlayLoginRef.current) setShowLogin(false);
            }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white p-6 rounded text-black w-80 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Login</h3>
              <LoginForm onClose={() => setShowLogin(false)} />
              <button
                onClick={() => setShowLogin(false)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Register modal */}
        {showRegister && (
          <div
            ref={(el) => (overlayRegisterRef.current = el)}
            onClick={(e) => {
              if (e.target === overlayRegisterRef.current)
                setShowRegister(false);
            }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white p-6 rounded text-black w-80 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Register</h3>
              <RegisterForm onClose={() => setShowRegister(false)} />
              <button
                onClick={() => setShowRegister(false)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-900"
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
