"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  quantity: number;
  product: Product;
};

type Address = {
  id: number;
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

type BuyNowProduct = Product & {
  quantity: number;
};

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const mode = searchParams.get("mode");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] =
    useState<BuyNowProduct | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<Address | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return null;
    }

    return user;
  }

  // =====================================================
  // LOAD BUY NOW PRODUCT
  // =====================================================

  function loadBuyNowProduct() {
    try {
      const saved = localStorage.getItem(
        "diara_buy_now"
      );

      if (!saved) {
        setBuyNowItem(null);
        return;
      }

      const parsed = JSON.parse(saved);

      setBuyNowItem(parsed);
    } catch (err) {
      console.error(err);
      setBuyNowItem(null);
    }
  }

  // =====================================================
  // LOAD NORMAL CART
  // =====================================================

  async function loadCart(userId: string) {
    const { data: cart, error: cartError } =
      await supabase
        .from("cart")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

    if (cartError) {
      console.error(cartError);
      setError("Unable to load your cart.");
      return;
    }

    if (!cart) {
      setItems([]);
      return;
    }

    const { data: cartItems, error: cartItemsError } =
      await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          product_id
        `
        )
        .eq("cart_id", cart.id)
        .order("id", { ascending: false });

    if (cartItemsError) {
      console.error(cartItemsError);
      setError("Unable to load your cart items.");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setItems([]);
      return;
    }

    const productIds = cartItems.map(
      (item) => item.product_id
    );

    const { data: products, error: productsError } =
      await supabase
        .from("products")
        .select(
          `
          id,
          product_id,
          name,
          category,
          selling_price,
          image_url,
          description,
          stock
        `
        )
        .in("id", productIds);

    if (productsError) {
      console.error(productsError);
      setError("Unable to load product details.");
      return;
    }

    const combinedItems: CartItem[] = cartItems
      .map((cartItem) => {
        const product = products?.find(
          (p) => p.id === cartItem.product_id
        );

        if (!product) {
          return null;
        }

        return {
          id: cartItem.id,
          quantity: cartItem.quantity,
          product,
        };
      })
      .filter(Boolean) as CartItem[];

    setItems(combinedItems);
  }

  // =====================================================
  // LOAD ADDRESSES
  // =====================================================

  async function loadAddresses(userId: string) {
    const { data, error: addressError } =
      await supabase
        .from("addresses")
        .select(
          `
          id,
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
        .eq("user_id", userId)
        .order("is_default", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

    if (addressError) {
      console.error(addressError);
      setError("Unable to load your addresses.");
      return;
    }

    setAddresses(data || []);

    const defaultAddress = data?.find(
      (address) => address.is_default
    );

    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    } else if (data && data.length > 0) {
      setSelectedAddress(data[0]);
    } else {
      setSelectedAddress(null);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError("");

      const user = await getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      if (mode === "buy") {
        loadBuyNowProduct();
      } else {
        await loadCart(user.id);
      }

      await loadAddresses(user.id);

      setLoading(false);
    }

    initialize();
  }, [mode]);

  // =====================================================
  // DISPLAY ITEMS
  // =====================================================

  const displayedItems: CartItem[] =
    mode === "buy"
      ? buyNowItem
        ? [
            {
              id: -1,
              quantity: buyNowItem.quantity,
              product: buyNowItem,
            },
          ]
        : []
      : items;

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
  // UPDATE QUANTITY
  // =====================================================

  async function updateQuantity(
    item: CartItem,
    newQuantity: number
  ) {
    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > item.product.stock) {
      setError(
        `Only ${item.product.stock} item(s) available in stock.`
      );
      return;
    }

    setError("");

    // Buy Now quantity
    if (mode === "buy") {
      if (!buyNowItem) return;

      const updated = {
        ...buyNowItem,
        quantity: newQuantity,
      };

      setBuyNowItem(updated);

      localStorage.setItem(
        "diara_buy_now",
        JSON.stringify(updated)
      );

      return;
    }

    // Normal cart
    const { error: updateError } =
      await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

    if (updateError) {
      console.error(updateError);
      setError("Unable to update quantity.");
      return;
    }

    setItems((current) =>
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
  // REMOVE ITEM
  // =====================================================

  async function removeItem(item: CartItem) {
    setError("");

    if (mode === "buy") {
      localStorage.removeItem("diara_buy_now");
      setBuyNowItem(null);
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.id);

    if (deleteError) {
      console.error(deleteError);
      setError("Unable to remove this item.");
      return;
    }

    setItems((current) =>
      current.filter(
        (cartItem) => cartItem.id !== item.id
      )
    );
  }

  // =====================================================
  // PAY NOW
  // =====================================================

  async function handlePayNow() {
    setError("");
    setMessage("");

    if (displayedItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      setError(
        "Please select or add a delivery address."
      );
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setProcessing(true);

    try {
      const user = await getUser();

      if (!user) {
        setProcessing(false);
        return;
      }

      const checkoutData = {
        mode:
          mode === "buy"
            ? "buy_now"
            : "cart",

        items: displayedItems.map((item) => ({
          product_id: item.product.id,
          product_code:
            item.product.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          selling_price:
            Number(item.product.selling_price),
          subtotal:
            Number(item.product.selling_price) *
            item.quantity,
          image_url: item.product.image_url,
        })),

        product:
          displayedItems[0]?.product || null,

        quantity:
          displayedItems[0]?.quantity || 1,

        total_amount: totalAmount,

        address: selectedAddress,

        payment_method: paymentMethod,

        user_id: user.id,
      };

      localStorage.setItem(
        "diara_checkout",
        JSON.stringify(checkoutData)
      );

      router.push("/payments");
    } catch (err) {
      console.error(err);
      setError(
        "Unable to continue to payment."
      );
      setProcessing(false);
    }
  }

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-lg font-medium">
          Loading your cart...
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
        <header className="border-b border-[#e8dfd5]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.3em]"
            >
              DIARA
            </Link>

            <div className="flex gap-5">
              <Link
                href="/account"
                className="text-sm text-[#6f6a64] hover:text-[#a46b78]"
              >
                My Account
              </Link>

              <Link
                href="/necklaces"
                className="text-sm text-[#6f6a64] hover:text-[#a46b78]"
              >
                Shop
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-5xl">🛍️</p>

          <h1 className="mt-6 text-4xl font-semibold">
            Your Cart Is Empty
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#6f6a64]">
            Discover beautiful DIARA jewellery and
            add your favourite pieces to your cart.
          </p>

          <Link
            href="/necklaces"
            className="mt-8 inline-block rounded-full bg-[#24352f] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78]"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  // =====================================================
  // CART PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#24352f]">
      {/* HEADER */}

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
              Shop
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
          DIARA CHECKOUT
        </p>

        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
          {mode === "buy"
            ? "Buy Now"
            : "Your Cart"}
        </h1>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* MESSAGE */}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-6">
            {/* ITEMS */}

            <div className="rounded-3xl border border-[#e8dfd5] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                {mode === "buy"
                  ? "Selected Product"
                  : "Shopping Cart"}
              </h2>

              <div className="mt-6 space-y-5">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#eee5dc] p-4"
                  >
                    <div className="flex gap-4">
                      {/* IMAGE */}

                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#f5f0ea]">
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

                      {/* DETAILS */}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
                          {item.product.category}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          {item.product.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#8b837c]">
                          {item.product.product_id}
                        </p>

                        <p className="mt-3 font-semibold">
                          ₹
                          {Number(
                            item.product
                              .selling_price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#6f6a64]">
                          {item.product.stock}{" "}
                          available
                        </p>
                      </div>
                    </div>

                    {/* QUANTITY */}

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-[#ddd2c7]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            item.quantity <= 1
                          }
                          className="px-4 py-2 text-lg disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >=
                            item.product.stock
                          }
                          className="px-4 py-2 text-lg disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item)
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    {/* SUBTOTAL */}

                    <div className="mt-4 flex justify-between border-t border-[#eee5dc] pt-4 text-sm">
                      <span className="text-[#6f6a64]">
                        Item Total
                      </span>

                      <span className="font-semibold">
                        ₹
                        {(
                          Number(
                            item.product
                              .selling_price
                          ) *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <div className="rounded-3xl border border-[#e8dfd5] bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#a46b78]">
                    Delivery
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Delivery Address
                  </h2>
                </div>

                <Link
                  href="/addresses"
                  className="rounded-full border border-[#24352f] px-5 py-2.5 text-center text-sm font-medium text-[#24352f] transition hover:bg-[#24352f] hover:text-white"
                >
                  + Add New Address
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#faf7f2] p-6 text-center">
                  <p className="text-sm text-[#6f6a64]">
                    You haven't added a delivery
                    address yet.
                  </p>

                  <Link
                    href="/addresses"
                    className="mt-4 inline-block rounded-full bg-[#24352f] px-6 py-3 text-sm font-medium text-white"
                  >
                    Add Address
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {addresses.map((address) => (
                    <button
                      type="button"
                      key={address.id}
                      onClick={() =>
                        setSelectedAddress(
                          address
                        )
                      }
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        selectedAddress?.id ===
                        address.id
                          ? "border-[#a46b78] bg-[#fff8f7]"
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
                        </div>

                        <div className="flex gap-2">
                          <span className="rounded-full bg-[#f5ebe6] px-3 py-1 text-xs text-[#a46b78]">
                            {address.address_type}
                          </span>

                          {address.is_default && (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-[#6f6a64]">
                        {address.house_number},{" "}
                        {address.street},{" "}
                        {address.area},{" "}
                        {address.city},{" "}
                        {address.state} -{" "}
                        {address.pincode}
                      </p>

                      {selectedAddress?.id ===
                        address.id && (
                        <p className="mt-3 text-xs font-medium text-[#a46b78]">
                          ✓ Selected for delivery
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE - ORDER SUMMARY
          ================================================= */}

          <div className="h-fit rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs uppercase tracking-[0.25em] text-[#a46b78]">
              Order Summary
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Checkout
            </h2>

            {/* PRICE */}

            <div className="mt-7 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6f6a64]">
                  Items
                </span>

                <span>
                  {displayedItems.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6f6a64]">
                  Subtotal
                </span>

                <span>
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6f6a64]">
                  Delivery
                </span>

                <span className="text-green-700">
                  Free
                </span>
              </div>

              <div className="border-t border-[#e8dfd5] pt-5">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>

                  <span>
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}

            <div className="mt-8">
              <p className="text-sm font-semibold">
                Payment Method
              </p>

              <div className="mt-4 grid gap-3">
                {["UPI", "PhonePe", "Paytm"].map(
                  (method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() =>
                        setPaymentMethod(
                          method
                        )
                      }
                      className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                        paymentMethod === method
                          ? "border-[#a46b78] bg-[#fff8f7] text-[#a46b78]"
                          : "border-[#e8dfd5] hover:border-[#a46b78]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{method}</span>

                        {paymentMethod ===
                          method && (
                          <span>
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* PAY */}

            <button
              type="button"
              onClick={handlePayNow}
              disabled={
                processing ||
                !selectedAddress
              }
              className="mt-8 w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing
                ? "Opening Payment..."
                : `Pay ₹${totalAmount.toLocaleString(
                    "en-IN"
                  )}`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#8b837c]">
              Your payment will be processed
              securely. We never store your card
              number or CVV.
            </p>
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

// =====================================================
// REQUIRED DEFAULT EXPORT
// =====================================================

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
          <p className="text-lg font-medium">
            Loading your cart...
          </p>
        </main>
      }
    >
      <CartContent />
    </Suspense>
  );
}