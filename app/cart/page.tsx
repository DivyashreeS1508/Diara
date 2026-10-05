"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: number;
  product_id: string;
  name: string;
  category: string;
  selling_price: number;
  image_url: string | null;
  description: string | null;
  stock: number;
};

type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
};

type Address = {
  id: string;
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

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");

  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [buttonLoading, setButtonLoading] = useState(false);

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  useEffect(() => {
    loadCheckout();
  }, [mode]);

  async function loadCheckout() {
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    // -------------------------------------------------
    // CHECK LOGIN
    // -------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // -------------------------------------------------
    // LOAD ADDRESSES
    // -------------------------------------------------

    const { data: addressData, error: addressError } =
      await supabase
        .from("addresses")
        .select(
          "id, full_name, phone, house_number, street, area, city, state, pincode, address_type, is_default"
        )
        .eq("user_id", user.id)
        .order("is_default", {
          ascending: false,
        });

    if (addressError) {
      console.error("Address loading error:", addressError);
    } else {
      setAddresses(addressData || []);

      if (addressData && addressData.length > 0) {
        const defaultAddress =
          addressData.find(
            (address) => address.is_default
          ) || addressData[0];

        setSelectedAddress(defaultAddress);
      }
    }

    // =================================================
    // BUY NOW MODE
    // =================================================

    if (mode === "buy") {
      const savedBuyNow =
        localStorage.getItem("diara_buy_now");

      if (!savedBuyNow) {
        setBuyNowItem(null);
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(savedBuyNow);

        const buyProduct: Product = {
          id: parsed.id,
          product_id: parsed.product_id,
          name: parsed.name,
          category: parsed.category,
          selling_price: Number(
            parsed.selling_price
          ),
          image_url: parsed.image_url,
          description: parsed.description,
          stock: parsed.stock,
        };

        const item: CartItem = {
          id: 0,
          product_id: buyProduct.id,
          quantity: parsed.quantity || 1,
          product: buyProduct,
        };

        setBuyNowItem(item);
        setCartItems([]);

        setLoading(false);
        return;
      } catch (err) {
        console.error(
          "Buy Now data error:",
          err
        );

        setError(
          "Unable to load Buy Now product."
        );

        setLoading(false);
        return;
      }
    }

    // =================================================
    // NORMAL CART MODE
    // =================================================

    const { data: cart, error: cartError } =
      await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (cartError) {
      console.error(
        "Cart loading error:",
        cartError
      );

      setError("Unable to load your cart.");
      setLoading(false);
      return;
    }

    if (!cart) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // -------------------------------------------------
    // LOAD CART ITEMS
    // -------------------------------------------------

    const {
      data: items,
      error: itemsError,
    } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity")
      .eq("cart_id", cart.id)
      .order("id", {
        ascending: false,
      });

    if (itemsError) {
      console.error(
        "Cart items error:",
        itemsError
      );

      setError("Unable to load cart items.");
      setLoading(false);
      return;
    }

    if (!items || items.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // -------------------------------------------------
    // LOAD PRODUCTS
    // -------------------------------------------------

    const productIds = items.map(
      (item) => item.product_id
    );

    const {
      data: products,
      error: productsError,
    } = await supabase
      .from("products")
      .select(
        "id, product_id, name, category, selling_price, image_url, description, stock"
      )
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError) {
      console.error(
        "Products loading error:",
        productsError
      );

      setError(
        "Unable to load product information."
      );

      setLoading(false);
      return;
    }

    // -------------------------------------------------
    // COMBINE CART ITEMS + PRODUCTS
    // -------------------------------------------------

    const combinedItems: CartItem[] = [];

    items.forEach((item) => {
      const product = products?.find(
        (p) => p.id === item.product_id
      );

      if (product) {
        combinedItems.push({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product,
        });
      }
    });

    setCartItems(combinedItems);

    setLoading(false);
  }

  // =====================================================
  // CURRENT ITEMS
  // =====================================================

  const displayedItems =
    mode === "buy"
      ? buyNowItem
        ? [buyNowItem]
        : []
      : cartItems;

  // =====================================================
  // TOTAL
  // =====================================================

  const totalAmount = displayedItems.reduce(
    (total, item) =>
      total +
      Number(item.product.selling_price) *
        item.quantity,
    0
  );

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  async function changeQuantity(
    item: CartItem,
    newQuantity: number
  ) {
    if (newQuantity < 1) return;

    if (newQuantity > item.product.stock) {
      setError(
        `Only ${item.product.stock} item(s) available.`
      );
      return;
    }

    setError("");

    // -------------------------------------------------
    // BUY NOW
    // -------------------------------------------------

    if (mode === "buy") {
      const savedBuyNow =
        localStorage.getItem("diara_buy_now");

      if (savedBuyNow) {
        const parsed = JSON.parse(savedBuyNow);

        parsed.quantity = newQuantity;

        localStorage.setItem(
          "diara_buy_now",
          JSON.stringify(parsed)
        );

        setBuyNowItem({
          ...item,
          quantity: newQuantity,
        });
      }

      return;
    }

    // -------------------------------------------------
    // NORMAL CART
    // -------------------------------------------------

    const supabase = createClient();

    const { error: updateError } =
      await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", item.id);

    if (updateError) {
      console.error(updateError);
      setError(
        "Unable to update quantity."
      );
      return;
    }

    setCartItems((current) =>
      current.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity: newQuantity,
            }
          : cartItem
      )
    );
  }

  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  async function removeItem(item: CartItem) {
    setError("");

    // -------------------------------------------------
    // BUY NOW
    // -------------------------------------------------

    if (mode === "buy") {
      localStorage.removeItem(
        "diara_buy_now"
      );

      setBuyNowItem(null);

      return;
    }

    // -------------------------------------------------
    // NORMAL CART
    // -------------------------------------------------

    const supabase = createClient();

    const { error: deleteError } =
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.id);

    if (deleteError) {
      console.error(deleteError);
      setError(
        "Unable to remove product."
      );
      return;
    }

    setCartItems((current) =>
      current.filter(
        (cartItem) =>
          cartItem.id !== item.id
      )
    );

    setMessage("Product removed from cart.");
  }

  // =====================================================
  // PAY NOW
  // =====================================================

  async function handlePayNow() {
    if (displayedItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );
      return;
    }

    // -------------------------------------------------
    // STOCK CHECK
    // -------------------------------------------------

    for (const item of displayedItems) {
      if (
        item.quantity >
        item.product.stock
      ) {
        setError(
          `${item.product.name} has only ${item.product.stock} available.`
        );
        return;
      }
    }

    setButtonLoading(true);
    setError("");
    setMessage("");

    // -------------------------------------------------
    // CREATE CHECKOUT DATA
    // -------------------------------------------------

    const checkoutData = {
      mode: mode === "buy" ? "buy_now" : "cart",

      items: displayedItems.map(
        (item) => ({
          product_id:
            item.product.id,

          product_code:
            item.product.product_id,

          name: item.product.name,

          category:
            item.product.category,

          selling_price:
            Number(
              item.product.selling_price
            ),

          image_url:
            item.product.image_url,

          quantity:
            item.quantity,

          subtotal:
            Number(
              item.product.selling_price
            ) * item.quantity,
        })
      ),

      // Keep these fields too so your
      // existing payment page can continue
      // using the first product if required.
      product:
        displayedItems[0].product,

      quantity:
        displayedItems[0].quantity,

      total_amount: totalAmount,

      address: selectedAddress,

      payment_method: paymentMethod,
    };

    localStorage.setItem(
      "diara_checkout",
      JSON.stringify(checkoutData)
    );

    // Buy Now data is no longer needed
    // after checkout information is prepared.
    if (mode === "buy") {
      localStorage.removeItem(
        "diara_buy_now"
      );
    }

    setButtonLoading(false);

    // Go to your existing payment page
    router.push("/payments");
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-lg font-medium">
          Loading checkout...
        </p>
      </main>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (displayedItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf7f2] text-[#24352f]">

        <header className="border-b border-[#e8dfd5] bg-[#faf7f2]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.3em]"
            >
              DIARA
            </Link>

            <Link
              href="/account"
              className="text-sm text-[#6f6a64]"
            >
              My Account
            </Link>

          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="w-full max-w-md rounded-2xl border border-[#e8dfd5] bg-white p-10 text-center shadow-sm">

            <h1 className="text-2xl font-semibold">
              Your Cart is Empty
            </h1>

            <p className="mt-3 text-sm text-[#6f6a64]">
              Add a beautiful DIARA jewellery
              piece to your cart to continue.
            </p>

            <Link
              href="/necklaces"
              className="mt-7 inline-block rounded-full bg-[#24352f] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#a46b78]"
            >
              Continue Shopping
            </Link>

          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // CHECKOUT PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#24352f]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-[#e8dfd5] bg-[#faf7f2]">

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
              className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
            >
              My Account
            </Link>

            <Link
              href="/necklaces"
              className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </header>

      {/* =================================================
          PAGE
      ================================================= */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        <div className="mb-10">

          <p className="text-xs uppercase tracking-[0.3em] text-[#a46b78]">
            {mode === "buy"
              ? "Buy Now"
              : "Your Cart"}
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-[#6f6a64]">
            Enter your delivery details and
            choose your payment method.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-7">

            {/* DELIVERY ADDRESS */}

            <div className="rounded-2xl border border-[#e8dfd5] bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold">
                    Delivery Address
                  </h2>

                  <p className="mt-1 text-sm text-[#6f6a64]">
                    Where should we deliver your
                    jewellery?
                  </p>
                </div>

                <Link
                  href="/addresses"
                  className="rounded-full border border-[#24352f] px-4 py-2 text-xs font-medium text-[#24352f] transition hover:bg-[#24352f] hover:text-white"
                >
                  + Add New
                </Link>

              </div>

              {addresses.length === 0 ? (

                <div className="mt-6 rounded-xl border border-dashed border-[#d8cec3] bg-[#faf7f2] p-6 text-center">

                  <p className="text-sm text-[#6f6a64]">
                    You don't have a delivery
                    address yet.
                  </p>

                  <Link
                    href="/addresses"
                    className="mt-4 inline-block rounded-full bg-[#24352f] px-5 py-2.5 text-xs font-medium text-white"
                  >
                    Add Delivery Address
                  </Link>

                </div>

              ) : (

                <div className="mt-6 space-y-3">

                  {addresses.map(
                    (address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() =>
                          setSelectedAddress(
                            address
                          )
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selectedAddress?.id ===
                          address.id
                            ? "border-[#24352f] bg-[#f5f0ea]"
                            : "border-[#e8dfd5] hover:border-[#a46b78]"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="font-semibold">
                              {address.full_name}
                            </p>

                            <p className="mt-1 text-sm text-[#6f6a64]">
                              {address.phone}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#6f6a64]">
                              {address.house_number},{" "}
                              {address.street},{" "}
                              {address.area},{" "}
                              {address.city},{" "}
                              {address.state} -{" "}
                              {address.pincode}
                            </p>

                            <p className="mt-2 text-xs uppercase tracking-wider text-[#a46b78]">
                              {address.address_type}
                            </p>

                          </div>

                          {selectedAddress?.id ===
                            address.id && (
                            <span className="text-sm font-semibold text-[#24352f]">
                              ✓
                            </span>
                          )}

                        </div>

                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* PAYMENT METHOD */}

            <div className="rounded-2xl border border-[#e8dfd5] bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold">
                Payment Method
              </h2>

              <p className="mt-1 text-sm text-[#6f6a64]">
                Select your preferred payment
                method.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">

                {[
                  "UPI",
                  "PhonePe",
                  "Paytm",
                ].map((method) => (

                  <button
                    key={method}
                    type="button"
                    onClick={() =>
                      setPaymentMethod(method)
                    }
                    className={`rounded-xl border px-4 py-4 text-sm font-medium transition ${
                      paymentMethod === method
                        ? "border-[#24352f] bg-[#24352f] text-white"
                        : "border-[#e8dfd5] text-[#24352f] hover:border-[#a46b78]"
                    }`}
                  >
                    {method}
                  </button>

                ))}

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE - ORDER SUMMARY
          ================================================= */}

          <div>

            <div className="sticky top-6 rounded-2xl border border-[#e8dfd5] bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-5">

                {displayedItems.map(
                  (item) => (

                    <div
                      key={`${item.product.id}-${item.id}`}
                      className="flex gap-4"
                    >

                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f5f0ea]">

                        {item.product.image_url ? (
                          <img
                            src={
                              item.product.image_url
                            }
                            alt={
                              item.product.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[#8b837c]">
                            No Image
                          </div>
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-xs uppercase tracking-wider text-[#a46b78]">
                          {item.product.category}
                        </p>

                        <h3 className="mt-1 font-medium">
                          {item.product.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#8b837c]">
                          {item.product.product_id}
                        </p>

                        <p className="mt-2 font-semibold">
                          ₹
                          {Number(
                            item.product
                              .selling_price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        {/* QUANTITY */}

                        <div className="mt-3 flex items-center gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1
                            }
                            className="h-7 w-7 rounded-full border border-[#d8cec3] text-sm disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >=
                              item.product.stock
                            }
                            className="h-7 w-7 rounded-full border border-[#d8cec3] text-sm disabled:opacity-40"
                          >
                            +
                          </button>

                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item)
                          }
                          className="mt-2 text-xs text-[#a46b78] hover:underline"
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

              {/* TOTAL */}

              <div className="mt-7 border-t border-[#e8dfd5] pt-5">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-[#6f6a64]">
                    Total
                  </span>

                  <span className="text-xl font-semibold">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              {/* PAY BUTTON */}

              <button
                type="button"
                onClick={handlePayNow}
                disabled={
                  buttonLoading ||
                  !selectedAddress
                }
                className="mt-6 w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buttonLoading
                  ? "Preparing Payment..."
                  : "Continue to Payment"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#8b837c]">
                Your payment details are
                handled securely on the payment
                page.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

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