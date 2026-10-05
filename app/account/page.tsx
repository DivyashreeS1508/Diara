"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingProfile, setEditingProfile] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setError("Unable to load your profile.");
        setLoading(false);
        return;
      }

      if (!data) {
        const { data: newProfile, error: insertError } =
          await supabase
            .from("profiles")
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || "",
              email: user.email || "",
              phone: "",
            })
            .select("id, full_name, email, phone")
            .single();

        if (insertError) {
          console.error(insertError);
          setError("Unable to create your profile.");
          setLoading(false);
          return;
        }

        setProfile(newProfile);
        setFullName(newProfile.full_name || "");
        setPhone(newProfile.phone || "");
      } else {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }

      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleSaveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (phone.trim() && !/^[0-9]{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
      })
      .eq("id", user.id)
      .select("id, full_name, email, phone")
      .single();

    if (error) {
      console.error(error);
      setError("Unable to update your profile.");
      setSaving(false);
      return;
    }

    setProfile(data);
    setFullName(data.full_name || "");
    setPhone(data.phone || "");

    setSaving(false);
    setEditingProfile(false);

    setMessage("Profile updated successfully.");
  }

  async function handleChangeEmail(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!newEmail.trim()) {
      setError("Please enter your new email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setChangingEmail(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setChangingEmail(false);
      return;
    }

    setChangingEmail(false);
    setNewEmail("");

    setMessage(
      "A confirmation email has been sent. Please confirm your new email address."
    );
  }

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-lg font-medium">
          Loading your DIARA account...
        </p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
        <div className="text-center">

          <h1 className="text-2xl font-semibold text-[#24352f]">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-[#24352f] px-6 py-3 text-sm text-white"
          >
            Back to Home
          </Link>

        </div>
      </main>
    );
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

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
          >
            Logout
          </button>

        </div>

      </header>

      {/* ACCOUNT */}
      <section className="mx-auto max-w-6xl px-6 py-14">

        <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
          DIARA ACCOUNT
        </p>

        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
          My Account
        </h1>

        <p className="mt-3 text-sm text-[#6f6a64]">
          Manage your profile, addresses, wishlist and orders.
        </p>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PROFILE */}
        <div className="mt-10 rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#a46b78]">
                Personal Information
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                My Profile
              </h2>
            </div>

            {!editingProfile && (
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(true);
                  setMessage("");
                  setError("");
                }}
                className="rounded-full border border-[#24352f] px-6 py-3 text-sm font-medium text-[#24352f] transition hover:bg-[#24352f] hover:text-white"
              >
                Edit Profile
              </button>
            )}

          </div>

          {!editingProfile ? (

            /* VIEW PROFILE */
            <div className="mt-8 grid gap-7 md:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b837c]">
                  Full Name
                </p>

                <p className="mt-2 font-medium">
                  {profile?.full_name || "Not added yet"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b837c]">
                  Email Address
                </p>

                <p className="mt-2 break-all font-medium">
                  {profile?.email || "Not added yet"}
                </p>

                <p className="mt-2 text-xs text-green-700">
                  ✓ Email verified
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8b837c]">
                  Phone Number
                </p>

                <p className="mt-2 font-medium">
                  {profile?.phone || "Not added yet"}
                </p>
              </div>

            </div>

          ) : (

            /* EDIT PROFILE */
            <form
              onSubmit={handleSaveProfile}
              className="mt-8 space-y-6"
            >

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
                />

                <p className="mt-2 text-xs text-[#8b837c]">
                  Enter a 10-digit Indian mobile number.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#24352f] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProfile(false);
                    setFullName(profile?.full_name || "");
                    setPhone(profile?.phone || "");
                    setError("");
                  }}
                  className="rounded-full border border-[#ddd2c7] px-7 py-3 text-sm font-medium text-[#6f6a64] transition hover:border-[#24352f] hover:text-[#24352f]"
                >
                  Cancel
                </button>

              </div>

            </form>

          )}

        </div>

        {/* CHANGE EMAIL */}
        <div className="mt-6 rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

          <p className="text-xs uppercase tracking-[0.25em] text-[#a46b78]">
            Account Security
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Change Email Address
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#6f6a64]">
            Changing your login email requires email confirmation.
            We will send a confirmation link to the new address.
          </p>

          <form
            onSubmit={handleChangeEmail}
            className="mt-6 flex flex-col gap-4 md:flex-row"
          >

            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className="flex-1 rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
            />

            <button
              type="submit"
              disabled={changingEmail}
              className="rounded-full bg-[#24352f] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingEmail
                ? "Sending..."
                : "Change Email"}
            </button>

          </form>

        </div>

        {/* ACCOUNT OPTIONS */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* ADDRESSES */}
          <Link
            href="/addresses"
            className="group rounded-3xl border border-[#e8dfd5] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
              Delivery
            </p>

            <h3 className="mt-2 font-semibold group-hover:text-[#a46b78]">
              My Addresses
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6f6a64]">
              Add and manage your delivery addresses.
            </p>

            <p className="mt-5 text-xs font-medium text-[#a46b78]">
              Manage Addresses →
            </p>
          </Link>

          {/* WISHLIST */}
          <Link
            href="/wishlist"
            className="group rounded-3xl border border-[#e8dfd5] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
              Saved Jewellery
            </p>

            <h3 className="mt-2 font-semibold group-hover:text-[#a46b78]">
              My Wishlist
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6f6a64]">
              View jewellery you have saved.
            </p>

            <p className="mt-5 text-xs font-medium text-[#a46b78]">
              View Wishlist →
            </p>
          </Link>

          {/* ORDERS */}
          <Link
            href="/orders"
            className="group rounded-3xl border border-[#e8dfd5] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
              Shopping
            </p>

            <h3 className="mt-2 font-semibold group-hover:text-[#a46b78]">
              My Orders
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6f6a64]">
              View your previous and current orders.
            </p>

            <p className="mt-5 text-xs font-medium text-[#a46b78]">
              View Orders →
            </p>
          </Link>

          {/* PAYMENTS */}
          <Link
            href="/payments"
            className="group rounded-3xl border border-[#e8dfd5] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
              Payments
            </p>

            <h3 className="mt-2 font-semibold group-hover:text-[#a46b78]">
              Payment History
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6f6a64]">
              View your completed payment records.
            </p>

            <p className="mt-5 text-xs font-medium text-[#a46b78]">
              View Payments →
            </p>
          </Link>

        </div>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-col justify-center gap-3 text-center sm:flex-row">

          <Link
            href="/necklaces"
            className="inline-block rounded-full bg-[#24352f] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78]"
          >
            Continue Shopping
          </Link>

          <Link
            href="/wishlist"
            className="inline-block rounded-full border border-[#24352f] px-8 py-4 text-sm font-medium text-[#24352f] transition hover:bg-[#24352f] hover:text-white"
          >
            View My Wishlist
          </Link>

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