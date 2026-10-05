"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setError(
          "Your password reset link is missing or has expired. Please request a new reset link."
        );
      }

      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setError("");
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);

    setMessage(
      "Your password has been updated successfully. You can now login with your new password."
    );

    setPassword("");
    setConfirmPassword("");
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-sm">Checking password recovery session...</p>
      </main>
    );
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
              Reset Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6f6a64]">
              Create a new password for your DIARA account.
            </p>
          </div>

          <div className="rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >

              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
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

                <p className="mt-2 text-xs text-[#8b837c]">
                  Password must contain at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm New Password
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
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 pr-14 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
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
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
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
                disabled={loading || !!error}
                className="w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Updating Password..."
                  : "Update Password"}
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