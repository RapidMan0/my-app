"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST", credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.token && data?.user) {
          setAccessToken(data.token);
          localStorage.setItem("accessToken", data.token);
          setUser(data.user);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    refresh();
  }, []);

  async function login(email, password) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: 'same-origin',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Login failed");
    setAccessToken(data.token);
    localStorage.setItem("accessToken", data.token);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: 'same-origin',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Register failed");
    setAccessToken(data.token);
    localStorage.setItem("accessToken", data.token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: 'same-origin' });
    } catch (e) {}
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  function updateUser(userData) {
    setUser(userData);
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}