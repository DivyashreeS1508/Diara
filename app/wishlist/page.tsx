"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type WishlistItem = {
  id: number;
  product_id: number;
  product: {
    id: number;
    product_id: string;
    name: string;
    category: string;
    selling_price: number;
    image_url: string;
    stock: number;
  };
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWishlist() {
      const supabase = createClient();

      // Check customer login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth/login";
        return;
      }

      // Get wishlist records
      const { data: wishlistData, error: wishlistError } =
        await supabase
          .from("wishlist")
          .select("id, product_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (wishlistError) {
        console.error(wishlistError);
        setError("Unable to load your wishlist.");
        setLoading(false);
        return;
      }

      if (!wishlistData || wishlistData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Get product details
      const productIds = wishlistData.map(
        (item) => item.product_id
      );

      const { data: products, error: productsError } =
        await supabase
          .from("products")
          .select(
            "id, product_id, name, category, selling_price, image_url, stock"
          )
          .in("id", productIds)
          .eq("is_active", true);

      if (productsError) {
        console.error(productsError);
        setError("Unable to load wishlist products.");
        setLoading(false);
        return;
      }

      const combinedItems: WishlistItem[] =
        wishlistData
          .map((wishlistItem) => {
            const product = products?.find(
              (p) => p.id === wishlistItem.product_id
            );

            if (!product) return null;

            return {
              id: wishlistItem.id,
              product_id: wishlistItem.product_id,
              product,
            };
          })
          .filter(Boolean) as WishlistItem[];

      setItems(combinedItems);
      setLoading(false);
    }

    loadWishlist();
  }, []);

  // ==========================================
  // REMOVE FROM WISHLIST
  // ==========================================

  async function removeFromWishlist(
    wishlistId: number
  ) {
    const supabase = createClient();

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", wishlistId);

    if (error) {
      console.error(error);
      setError("Unable to remove this product.");
      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== wishlistId
      )
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p className="text-lg font-medium">
          Loading your wishlist...
        </p>
      </main>
    );
  }

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
              href="/cart"
              className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
            >
              Cart
            </Link>

          </div>

        </div>

      </header>


      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-14">

        <div className="mb-10">

          <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
            DIARA ACCOUNT
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            My Wishlist
          </h1>

          <p className="mt-3 text-sm text-[#6f6a64]">
            Jewellery you've saved for later.
          </p>

        </div>


        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* EMPTY WISHLIST */}
        {items.length === 0 && !error && (
          <div className="rounded-3xl border border-[#e8dfd5] bg-white px-6 py-16 text-center">

            <p className="text-4xl">
              ♡
            </p>

            <h2 className="mt-5 text-2xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f6a64]">
              Save jewellery you love and come back to it anytime.
            </p>

            <Link
              href="/necklaces"
              className="mt-7 inline-block rounded-full bg-[#24352f] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#a46b78]"
            >
              Explore Jewellery
            </Link>

          </div>
        )}


        {/* WISHLIST PRODUCTS */}
        {items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {items.map((item) => (

              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-[#e8dfd5] bg-white shadow-sm"
              >

                {/* IMAGE */}
                <Link
                  href={`/products/${item.product.product_id}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f5f0ea]">

                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />

                  </div>
                </Link>


                {/* DETAILS */}
                <div className="p-5">

                  <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
                    {item.product.category}
                  </p>

                  <Link
                    href={`/products/${item.product.product_id}`}
                  >
                    <h2 className="mt-2 text-xl font-semibold hover:text-[#a46b78]">
                      {item.product.name}
                    </h2>
                  </Link>

                  <p className="mt-3 text-lg font-semibold">
                    ₹
                    {Number(
                      item.product.selling_price
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-xs text-[#8b837c]">
                    {item.product.stock > 0
                      ? `${item.product.stock} available`
                      : "Currently out of stock"}
                  </p>


                  <div className="mt-5 flex gap-2">

                    <Link
                      href={`/products/${item.product.product_id}`}
                      className="flex-1 rounded-full bg-[#24352f] px-4 py-3 text-center text-xs font-medium text-white transition hover:bg-[#a46b78]"
                    >
                      View Product
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(item.id)
                      }
                      className="rounded-full border border-[#a46b78] px-4 py-3 text-xs font-medium text-[#a46b78] transition hover:bg-[#a46b78] hover:text-white"
                    >
                      Remove
                    </button>

                  </div>

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