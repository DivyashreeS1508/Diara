"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

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
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // -------------------------
    // LOGIN
    // -------------------------
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Make sure login session exists
    if (!data.user) {
      setError("Unable to login. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);

    setMessage(
      "Login successful! Redirecting to your account..."
    );

    // -------------------------
    // GO TO CUSTOMER ACCOUNT
    // -------------------------
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 500);
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
            href="/auth/register"
            className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
          >
            New customer? Create Account
          </Link>

        </div>
      </header>

      {/* LOGIN SECTION */}
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* TITLE */}
          <div className="mb-8 text-center">

            <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
              WELCOME BACK TO DIARA
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6f6a64]">
              Login to access your DIARA account and continue shopping.
            </p>

          </div>

          {/* FORM CARD */}
          <div className="rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-sm font-medium">
                    Password
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-[#a46b78] hover:underline"
                  >
                    Forgot Password?
                  </Link>

                </div>

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
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-sm text-[#6f6a64] hover:text-[#a46b78]"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  {message}
                </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            {/* REGISTER LINK */}
            <div className="mt-6 border-t border-[#eee6de] pt-6 text-center">

              <p className="text-sm text-[#6f6a64]">
                Don't have a DIARA account?
              </p>

              <Link
                href="/auth/register"
                className="mt-2 inline-block text-sm font-medium text-[#a46b78] hover:underline"
              >
                Create Account
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