"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: number;
  product_id: string;
  name: string;
  category: string;
  selling_price: number;
  image_url: string;
  description: string | null;
  keywords: string | null;
  stock: number;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  useEffect(() => {
    async function loadProduct() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, product_id, name, category, selling_price, image_url, description, keywords, stock"
        )
        .eq("product_id", productId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Product details error:", error);
        setError("Product not found.");
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  async function getLoggedInUser() {
    const supabase = createClient();

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
  // ADD TO WISHLIST
  // =====================================================

  async function handleWishlist() {
    if (!product) return;

    setMessage("");
    setError("");

    const user = await getLoggedInUser();

    if (!user) return;

    setButtonLoading(true);

    const supabase = createClient();

    const { error } = await supabase.from("wishlist").upsert(
      {
        user_id: user.id,
        product_id: product.id,
      },
      {
        onConflict: "user_id,product_id",
      }
    );

    if (error) {
      console.error("Wishlist error:", error);
      setError("Unable to add this product to your wishlist.");
      setButtonLoading(false);
      return;
    }

    setWishlistAdded(true);
    setMessage("♡ Added to your wishlist.");

    setButtonLoading(false);
  }

  // =====================================================
  // ADD PRODUCT TO DATABASE CART
  // =====================================================

  async function addProductToCart() {
    if (!product) return false;

    const user = await getLoggedInUser();

    if (!user) return false;

    const supabase = createClient();

    // Find customer's cart
    const { data: existingCart, error: cartFetchError } =
      await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (cartFetchError) {
      console.error(cartFetchError);
      setError("Unable to access your cart.");
      return false;
    }

    let cartId = existingCart?.id;

    // Create cart if customer doesn't have one
    if (!cartId) {
      const { data: newCart, error: cartCreateError } =
        await supabase
          .from("cart")
          .insert({
            user_id: user.id,
          })
          .select("id")
          .single();

      if (cartCreateError) {
        console.error(cartCreateError);
        setError("Unable to create your cart.");
        return false;
      }

      cartId = newCart.id;
    }

    // Check whether product already exists in cart
    const { data: existingItem, error: itemFetchError } =
      await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", product.id)
        .maybeSingle();

    if (itemFetchError) {
      console.error(itemFetchError);
      setError("Unable to check your cart.");
      return false;
    }

    // Product already exists
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;

      if (newQuantity > product.stock) {
        setError(
          "You cannot add more than the available stock."
        );
        return false;
      }

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error(updateError);
        setError("Unable to update your cart.");
        return false;
      }
    } else {
      // Add product for first time
      const { error: insertItemError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: product.id,
          quantity: 1,
        });

      if (insertItemError) {
        console.error(insertItemError);
        setError("Unable to add product to your cart.");
        return false;
      }
    }

    return true;
  }

  // =====================================================
  // ADD TO CART BUTTON
  // =====================================================

  async function handleAddToCart() {
    if (!product) return;

    if (product.stock <= 0) {
      setError("This product is currently out of stock.");
      return;
    }

    setMessage("");
    setError("");
    setButtonLoading(true);

    const success = await addProductToCart();

    if (success) {
      // Clear old Buy Now selection.
      localStorage.removeItem("diara_buy_now");

      setCartAdded(true);
      setMessage("✓ Product added to your cart.");
    }

    setButtonLoading(false);
  }

  // =====================================================
  // BUY NOW
  // =====================================================

  async function handleBuyNow() {
    if (!product) return;

    if (product.stock <= 0) {
      setError("This product is currently out of stock.");
      return;
    }

    setMessage("");
    setError("");
    setButtonLoading(true);

    // Check login
    const user = await getLoggedInUser();

    if (!user) {
      setButtonLoading(false);
      return;
    }

    // IMPORTANT:
    // Buy Now does NOT call addProductToCart().
    // It is a separate checkout flow.

    const buyNowProduct = {
      id: product.id,
      product_id: product.product_id,
      name: product.name,
      category: product.category,
      selling_price: Number(product.selling_price),
      image_url: product.image_url,
      description: product.description,
      stock: product.stock,
      quantity: 1,
    };

    // Remove previous Buy Now product
    localStorage.removeItem("diara_buy_now");

    // Save current product for Buy Now checkout
    localStorage.setItem(
      "diara_buy_now",
      JSON.stringify(buyNowProduct)
    );

    // Go to checkout
    router.push("/cart?mode=buy");
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-lg font-medium">
          Loading product...
        </p>
      </main>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error && !product) {
    return (
      <main className="min-h-screen bg-[#faf7f2] px-6 py-20 text-center text-[#24352f]">
        <p className="text-xl font-semibold">
          Product not found
        </p>

        <p className="mt-2 text-sm text-[#6f6a64]">
          The product may have been removed or is currently unavailable.
        </p>

        <Link
          href="/necklaces"
          className="mt-6 inline-block rounded-full bg-[#24352f] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#a46b78]"
        >
          ← Back to Necklaces
        </Link>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  // =====================================================
  // PRODUCT PAGE
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
              href="/cart"
              className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
            >
              Cart
            </Link>

            <Link
              href="/necklaces"
              className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
            >
              ← Back to Necklaces
            </Link>

          </div>
        </div>
      </header>

      {/* =================================================
          PRODUCT
      ================================================= */}

      <section className="mx-auto max-w-6xl px-6 py-14">

        <div className="grid gap-12 md:grid-cols-2">

          {/* IMAGE */}

          <div className="overflow-hidden rounded-3xl bg-[#f5f0ea] shadow-sm">
            <div className="relative aspect-square">

              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />

            </div>
          </div>

          {/* DETAILS */}

          <div className="flex flex-col justify-center">

            <p className="text-xs uppercase tracking-[0.3em] text-[#a46b78]">
              {product.category}
            </p>

            <p className="mt-4 text-xs tracking-[0.2em] text-[#8b837c]">
              {product.product_id}
            </p>

            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-2xl font-semibold">
              ₹
              {Number(product.selling_price).toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-2 text-sm text-[#6f6a64]">
              {product.stock > 0
                ? `${product.stock} available`
                : "Currently out of stock"}
            </p>

            {/* PRODUCT DETAILS */}

            <div className="mt-8 border-t border-[#e8dfd5] pt-7">

              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
                Product Details
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#6f6a64]">
                {product.description ||
                  "Beautiful DIARA jewellery crafted for special occasions."}
              </p>

            </div>

            {/* SUCCESS MESSAGE */}

            {message && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {/* ERROR */}

            {error && product && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-8 flex flex-col gap-3">

              {/* WISHLIST */}

              <button
                type="button"
                onClick={handleWishlist}
                disabled={buttonLoading}
                className={`w-full rounded-full border px-6 py-4 text-sm font-medium transition ${
                  wishlistAdded
                    ? "border-[#a46b78] bg-[#a46b78] text-white"
                    : "border-[#24352f] text-[#24352f] hover:bg-[#24352f] hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {wishlistAdded
                  ? "✓ Added to Wishlist"
                  : "♡ Add to Wishlist"}
              </button>

              {/* ADD TO CART */}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  buttonLoading ||
                  product.stock <= 0
                }
                className="w-full rounded-full bg-[#24352f] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#a46b78] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buttonLoading
                  ? "Please wait..."
                  : cartAdded
                  ? "✓ Added to Cart"
                  : "Add to Cart"}
              </button>

              {/* BUY NOW */}

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={
                  buttonLoading ||
                  product.stock <= 0
                }
                className="w-full rounded-full border border-[#a46b78] px-6 py-4 text-sm font-medium text-[#a46b78] transition hover:bg-[#a46b78] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buttonLoading
                  ? "Opening Checkout..."
                  : "Buy Now"}
              </button>

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