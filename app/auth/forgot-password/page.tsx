"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          "http://localhost:3000/auth/reset-password",
      }
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    setMessage(
      "If an account exists with this email, a password reset link has been sent. Please check your email."
    );

    setEmail("");
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#24352f]">

      <header className="border-b border-[#e8dfd5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.3em]"
          >
            DIARA
          </Link>

          <Link
            href="/auth/login"
            className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
          >
            Back to Login
          </Link>

        </div>
      </header>

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <div className="mb-8 text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
              DIARA ACCOUNT
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Forgot Password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6f6a64]">
              Enter your email address and we will send you a
              password reset link.
            </p>

          </div>

          <div className="rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

            <form
              onSubmit={handleForgotPassword}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                />

              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending Reset Link..."
                  : "Send Reset Link"}
              </button>

            </form>

            <div className="mt-6 border-t border-[#eee6de] pt-6 text-center">

              <p className="text-sm text-[#6f6a64]">
                Remember your password?
              </p>

              <Link
                href="/auth/login"
                className="mt-2 inline-block text-sm font-medium text-[#a46b78] hover:underline"
              >
                Login to DIARA
              </Link>

            </div>

          </div>
        </div>

      </section>

      <footer className="border-t border-[#e8dfd5] py-8 text-center">

        <p className="text-sm tracking-[0.2em]">
          DIARA
        </p>

        <p className="mt-2 text-xs text-[#8b837c]">
          For Moments That Deserve To Shine
        </p>

      </footer>

    </main>
  );
}
