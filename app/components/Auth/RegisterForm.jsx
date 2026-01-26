"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "./AuthProvider";

export default function RegisterForm({ onClose }) {
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [serverError, setServerError] = useState(null);
  const onSubmit = async (data) => {
    setServerError(null);
    try {
      // call provider register which will also set user/token
      await auth.register(data.name, data.email, data.password);
      if (onClose) onClose();
    } catch (err) {
      setServerError(err.message || "Register failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <input
          {...register("name")}
          className="w-full border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          placeholder="Name"
        />
      </div>

      <div>
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
              message: "Invalid email",
            },
          })}
          className="w-full border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          placeholder="Email"
        />
        {errors.email && (
          <div className="text-red-600 text-sm">{errors.email.message}</div>
        )}
      </div>

      <div>
        <input
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          className="w-full border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
          placeholder="Password"
          type="password"
        />
        {errors.password && (
          <div className="text-red-600 text-sm">{errors.password.message}</div>
        )}
      </div>

      {serverError && <div className="text-red-600">{serverError}</div>}

      <div className="flex justify-end">
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          type="submit"
          disabled={isSubmitting}
        >
          Create
        </button>
      </div>
    </form>
  );
}
