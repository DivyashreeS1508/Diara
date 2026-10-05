"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    // -------------------------
    // NAME VALIDATION
    // -------------------------
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // -------------------------
    // EMAIL VALIDATION
    // -------------------------
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // -------------------------
    // PASSWORD VALIDATION
    // -------------------------
    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "Password must contain at least one number."
      );
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) {
      setError(
        "Password must contain at least one special character."
      );
      return;
    }

    // -------------------------
    // CONFIRM PASSWORD
    // -------------------------
    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // -------------------------
    // SUPABASE REGISTRATION
    // -------------------------
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    if (data.session) {
      setMessage(
        "Account created successfully! You are now logged in."
      );
    } else {
      setMessage(
        "Account created successfully! Please check your email to confirm your account."
      );
    }

    // Clear form after successful registration
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#24352f]">

      {/* HEADER */}
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
            Already have an account? Login
          </Link>

        </div>
      </header>

      {/* REGISTER SECTION */}
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* TITLE */}
          <div className="mb-8 text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
              WELCOME TO DIARA
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Create Account
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6f6a64]">
              Create your DIARA account to shop our jewellery collection.
            </p>

          </div>

          {/* FORM CARD */}
          <div className="rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* FULL NAME */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                />

              </div>

              {/* EMAIL */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-sm text-[#6f6a64] hover:text-[#a46b78]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <div className="mt-3 rounded-xl bg-[#faf7f2] p-3">

                  <p className="text-xs font-medium text-[#24352f]">
                    Password must contain:
                  </p>

                  <ul className="mt-2 space-y-1 text-xs text-[#6f6a64]">
                    <li>• At least 8 characters</li>
                    <li>• At least one uppercase letter (A-Z)</li>
                    <li>• At least one lowercase letter (a-z)</li>
                    <li>• At least one number (0-9)</li>
                    <li>• At least one special character (!@#$...)</li>
                  </ul>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-sm text-[#6f6a64] hover:text-[#a46b78]"
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {message}
                </div>
              )}

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>

            {/* LOGIN LINK */}
            <div className="mt-6 border-t border-[#eee6de] pt-6 text-center">

              <p className="text-sm text-[#6f6a64]">
                Already have an account?
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

      {/* FOOTER */}
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