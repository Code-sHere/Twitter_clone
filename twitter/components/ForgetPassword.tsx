"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const ForgetPassword = () => {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Clear old messages
    setMessage("");
    setError("");

    // Validate input
    if (!emailOrPhone.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/forget-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: emailOrPhone.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log("Forget Password Response:", data);

      // Handle backend error
      if (!response.ok) {
        setError(
          data.error ||
          data.message ||
          "Something went wrong. Please try again."
        );
        return;
      }

      // Success
      setSuccess(true);

      setMessage(
        data.message ||
        "Password reset successfully. Please check your email."
      );
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        "Unable to connect to the server. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-8 flex items-center justify-center">

      {/* Main Container */}
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl shadow-black/30 p-6 sm:p-8">

          {/* Header */}
          <div className="text-center mb-8">

            {/* Lock Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-8 w-8 text-indigo-400"
              >
                <rect
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                  ry="2"
                />

                <path d="M7 11V7a5 5 0 0 1 10 0v4" />

                <circle
                  cx="12"
                  cy="16"
                  r="1"
                />
              </svg>

            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Forgot Password?
            </h1>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Enter your registered email or phone number and
              we&apos;ll send you a new temporary password.
            </p>

          </div>

          {/* =========================
              FORM
          ========================== */}

          {!success ? (

            <form
              onSubmit={handleForgetPassword}
              className="space-y-5"
            >

              {/* Email / Phone Input */}
              <div>

                <label
                  htmlFor="emailOrPhone"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email or Phone Number
                </label>

                <input
                  id="emailOrPhone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) =>
                    setEmailOrPhone(e.target.value)
                  }
                  placeholder="Enter email or phone number"
                  disabled={loading}
                  autoComplete="email"
                  className="
                    w-full
                    rounded-xl
                    border border-white/10
                    bg-white/[0.05]
                    px-4
                    py-3.5
                    text-sm
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    transition-all
                    duration-200
                    focus:border-indigo-500/70
                    focus:bg-white/[0.08]
                    focus:ring-4
                    focus:ring-indigo-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

              </div>

              {/* Error Message */}
              {error && (

                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">

                  <span className="text-sm">
                    ⚠️
                  </span>

                  <p className="text-sm leading-5 text-red-300">
                    {error}
                  </p>

                </div>

              )}

              {/* Reset Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-600/20
                  transition-all
                  duration-200
                  hover:bg-indigo-500
                  hover:shadow-indigo-600/30
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                  focus:ring-offset-2
                  focus:ring-offset-slate-900
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:bg-indigo-600
                "
              >

                {loading ? (

                  <span className="flex items-center gap-2">

                    {/* Loading Spinner */}
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    Processing...

                  </span>

                ) : (

                  "Reset Password"

                )}

              </button>

            </form>

          ) : (

            /* =========================
               SUCCESS SCREEN
            ========================== */

            <div className="text-center">

              {/* Success Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-8 w-8 text-emerald-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>

              </div>

              {/* Success Heading */}
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Password Reset Successful
              </h2>

              {/* Backend Message */}
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {message ||
                  "Your new password has been sent to your registered email."}
              </p>

              {/* Login Button */}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="
                  mt-7
                  w-full
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-600/20
                  transition-all
                  duration-200
                  hover:bg-indigo-500
                  focus:outline-none
                  focus:ring-2
                  focus:ring-indigo-500
                  focus:ring-offset-2
                  focus:ring-offset-slate-900
                "
              >
                Go to Login
              </button>

            </div>

          )}

          {/* Back To Login */}
          {!success && (

            <div className="mt-6 text-center">

              <button
                type="button"
                onClick={() => router.push("/login")}
                disabled={loading}
                className="
                  text-sm
                  font-medium
                  text-slate-400
                  transition-colors
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                ← Back to Login
              </button>

            </div>

          )}

        </div>

        {/* Security Notice */}
        <p className="mt-5 px-4 text-center text-xs leading-5 text-slate-500">
          For security purposes, password reset requests are
          limited to one request per day.
        </p>

      </div>

    </main>
  );
};

export default ForgetPassword;
