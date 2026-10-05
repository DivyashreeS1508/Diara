"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: number;
  user_id: string;
  full_name: string;
  phone: string;
  house_number: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  address_type: string;
  is_default: boolean;
};

const emptyForm = {
  full_name: "",
  phone: "",
  house_number: "",
  street: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  address_type: "Home",
};

export default function AddressesPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD ADDRESSES
  // ==========================================

  async function loadAddresses() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select(
        `
        id,
        user_id,
        full_name,
        phone,
        house_number,
        street,
        area,
        city,
        state,
        pincode,
        address_type,
        is_default
        `
      )
      .eq("user_id", user.id)
      .order("is_default", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Address loading error:", error);
      setError("Unable to load your addresses.");
      setLoading(false);
      return;
    }

    setAddresses(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  // ==========================================
  // FORM INPUT
  // ==========================================

  function handleChange(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  function openEditForm(address: Address) {
    setForm({
      full_name: address.full_name,
      phone: address.phone,
      house_number: address.house_number,
      street: address.street,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      address_type: address.address_type,
    });

    setEditingId(address.id);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  // ==========================================
  // SAVE ADDRESS
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    // Basic validation
    if (
      !form.full_name.trim() ||
      !form.phone.trim() ||
      !form.house_number.trim() ||
      !form.street.trim() ||
      !form.area.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      setError("Please fill in all address fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
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

    // ========================================
    // UPDATE EXISTING ADDRESS
    // ========================================

    if (editingId !== null) {
      const { error } = await supabase
        .from("addresses")
        .update({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          house_number: form.house_number.trim(),
          street: form.street.trim(),
          area: form.area.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          address_type: form.address_type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setError("Unable to update your address.");
        setSaving(false);
        return;
      }

      setMessage("Address updated successfully.");
    }

    // ========================================
    // CREATE NEW ADDRESS
    // ========================================

    else {
      const shouldBeDefault =
        addresses.length === 0;

      const { error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          house_number: form.house_number.trim(),
          street: form.street.trim(),
          area: form.area.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          address_type: form.address_type,
          is_default: shouldBeDefault,
        });

      if (error) {
        console.error(error);
        setError("Unable to save your address.");
        setSaving(false);
        return;
      }

      setMessage("Address added successfully.");
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);

    await loadAddresses();
  }

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  async function deleteAddress(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setError("Unable to delete this address.");
      return;
    }

    setMessage("Address deleted successfully.");

    await loadAddresses();
  }

  // ==========================================
  // SET DEFAULT ADDRESS
  // ==========================================

  async function setDefaultAddress(id: number) {
    setError("");
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Remove default from all user's addresses
    const { error: resetError } = await supabase
      .from("addresses")
      .update({
        is_default: false,
      })
      .eq("user_id", user.id);

    if (resetError) {
      console.error(resetError);
      setError("Unable to update default address.");
      return;
    }

    // Set selected address as default
    const { error } = await supabase
      .from("addresses")
      .update({
        is_default: true,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      setError("Unable to set default address.");
      return;
    }

    setMessage("Default address updated.");

    await loadAddresses();
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-lg font-medium">
          Loading your addresses...
        </p>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

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

          <div className="flex items-center gap-5">

            <Link
              href="/account"
              className="text-sm text-[#6f6a64] hover:text-[#a46b78]"
            >
              My Account
            </Link>

            <Link
              href="/wishlist"
              className="text-sm text-[#6f6a64] hover:text-[#a46b78]"
            >
              Wishlist
            </Link>

          </div>

        </div>

      </header>


      {/* CONTENT */}

      <section className="mx-auto max-w-5xl px-6 py-14">

        <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
          DIARA ACCOUNT
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>

            <h1 className="text-4xl font-semibold">
              My Addresses
            </h1>

            <p className="mt-3 text-sm text-[#6f6a64]">
              Manage your delivery addresses.
            </p>

          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-full bg-[#24352f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#a46b78]"
          >
            + Add New Address
          </button>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* ==================================
            ADD / EDIT FORM
        ================================== */}

        {showForm && (
          <div className="mt-8 rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm md:p-8">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-[#a46b78]">
                  {editingId
                    ? "Edit Address"
                    : "New Address"}
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {editingId
                    ? "Update Address"
                    : "Add Delivery Address"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                  setError("");
                }}
                className="text-sm text-[#6f6a64] hover:text-[#a46b78]"
              >
                Cancel
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* NAME + PHONE */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      handleChange(
                        "full_name",
                        e.target.value
                      )
                    }
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      handleChange(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                  />

                </div>

              </div>


              {/* HOUSE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  House / Flat / Door Number
                </label>

                <input
                  type="text"
                  value={form.house_number}
                  onChange={(e) =>
                    handleChange(
                      "house_number",
                      e.target.value
                    )
                  }
                  placeholder="Example: 12A, 2nd Floor"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                />

              </div>


              {/* STREET */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Street / Road
                </label>

                <input
                  type="text"
                  value={form.street}
                  onChange={(e) =>
                    handleChange(
                      "street",
                      e.target.value
                    )
                  }
                  placeholder="Enter street or road"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                />

              </div>


              {/* AREA */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Area / Locality
                </label>

                <input
                  type="text"
                  value={form.area}
                  onChange={(e) =>
                    handleChange(
                      "area",
                      e.target.value
                    )
                  }
                  placeholder="Enter area or locality"
                  className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                />

              </div>


              {/* CITY STATE PINCODE */}

              <div className="grid gap-5 md:grid-cols-3">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    City
                  </label>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      handleChange(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="City"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    State
                  </label>

                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      handleChange(
                        "state",
                        e.target.value
                      )
                    }
                    placeholder="State"
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Pincode
                  </label>

                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) =>
                      handleChange(
                        "pincode",
                        e.target.value
                      )
                    }
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full rounded-xl border border-[#ddd2c7] px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                  />

                </div>

              </div>


              {/* ADDRESS TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Address Type
                </label>

                <select
                  value={form.address_type}
                  onChange={(e) =>
                    handleChange(
                      "address_type",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#ddd2c7] bg-white px-4 py-3 text-sm outline-none focus:border-[#a46b78]"
                >
                  <option value="Home">
                    Home
                  </option>

                  <option value="Work">
                    Work
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving Address..."
                  : editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

            </form>

          </div>
        )}


        {/* ==================================
            NO ADDRESSES
        ================================== */}

        {addresses.length === 0 && !showForm && (
          <div className="mt-10 rounded-3xl border border-[#e8dfd5] bg-white px-6 py-16 text-center">

            <p className="text-4xl">
              🏠
            </p>

            <h2 className="mt-5 text-2xl font-semibold">
              No addresses yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f6a64]">
              Add your delivery address so you can
              use it during checkout.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-7 rounded-full bg-[#24352f] px-7 py-3 text-sm font-medium text-white hover:bg-[#a46b78]"
            >
              Add Your First Address
            </button>

          </div>
        )}


        {/* ==================================
            ADDRESS LIST
        ================================== */}

        {addresses.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {addresses.map((address) => (

              <div
                key={address.id}
                className="rounded-3xl border border-[#e8dfd5] bg-white p-6 shadow-sm"
              >

                {/* TOP */}

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <span className="rounded-full bg-[#f5ebe6] px-3 py-1 text-xs font-medium text-[#a46b78]">
                      {address.address_type}
                    </span>

                    {address.is_default && (
                      <span className="ml-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        Default
                      </span>
                    )}

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="mt-5 space-y-1 text-sm leading-6 text-[#6f6a64]">

                  <p className="font-semibold text-[#24352f]">
                    {address.full_name}
                  </p>

                  <p>
                    {address.house_number},{" "}
                    {address.street}
                  </p>

                  <p>
                    {address.area}
                  </p>

                  <p>
                    {address.city},{" "}
                    {address.state} -{" "}
                    {address.pincode}
                  </p>

                  <p>
                    Phone: {address.phone}
                  </p>

                </div>


                {/* ACTIONS */}

                <div className="mt-6 flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(address)
                    }
                    className="rounded-full border border-[#24352f] px-4 py-2 text-xs font-medium text-[#24352f] hover:bg-[#24352f] hover:text-white"
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      deleteAddress(address.id)
                    }
                    className="rounded-full border border-red-300 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>


                  {!address.is_default && (
                    <button
                      type="button"
                      onClick={() =>
                        setDefaultAddress(address.id)
                      }
                      className="rounded-full border border-[#a46b78] px-4 py-2 text-xs font-medium text-[#a46b78] hover:bg-[#a46b78] hover:text-white"
                    >
                      Set as Default
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>
        )}

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