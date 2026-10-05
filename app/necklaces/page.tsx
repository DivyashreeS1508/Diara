"use client";

import { useEffect, useState } from "react";
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

export default function NecklacesPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, product_id, name, category, selling_price, image_url, description, keywords, stock"
        )
        .eq("category", "Necklaces")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Product loading error:", error);
        setError("Unable to load necklaces.");
        setLoading(false);
        return;
      }

      setProducts(data || []);
      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const text = search.toLowerCase().trim();

    return (
      product.name.toLowerCase().includes(text) ||
      product.product_id.toLowerCase().includes(text) ||
      (product.keywords || "").toLowerCase().includes(text)
    );
  });

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

          <Link
            href="/"
            className="text-sm text-[#6f6a64] transition hover:text-[#a46b78]"
          >
            ← Back to Home
          </Link>

        </div>
      </header>

      {/* TITLE */}
      <section className="mx-auto max-w-7xl px-6 pb-8 pt-14 text-center">

        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#a46b78]">
          DIARA COLLECTION
        </p>

        <h1 className="text-4xl font-semibold md:text-5xl">
          Necklaces
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6f6a64]">
          Explore our beautiful necklace collection for weddings,
          celebrations and special occasions.
        </p>

      </section>

      {/* SEARCH */}
      <section className="mx-auto max-w-3xl px-6 pb-10">

        <input
          type="text"
          placeholder="Search necklaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-[#ddd2c7] bg-white px-6 py-4 text-sm text-[#24352f] outline-none transition placeholder:text-[#9b948d] focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/10"
        />

      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        {/* LOADING */}
        {loading && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium">
              Loading necklaces...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="py-20 text-center">

            <p className="text-lg font-medium">
              {error}
            </p>

            <p className="mt-2 text-sm text-[#6f6a64]">
              Please refresh the page and try again.
            </p>

          </div>
        )}

        {/* NO PRODUCTS */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="py-20 text-center">

            <p className="text-lg font-medium">
              No necklaces found
            </p>

            <p className="mt-2 text-sm text-[#6f6a64]">
              Try another search term.
            </p>

          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && !error && filteredProducts.length > 0 && (

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map((product) => (

              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >

                {/* IMAGE */}
                <div className="relative aspect-square overflow-hidden bg-[#f5f0ea]">

                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                </div>

                {/* BASIC PRODUCT INFORMATION */}
                <div className="p-5">

                  {/* PRODUCT ID */}
                  <p className="text-[11px] tracking-[0.2em] text-[#a46b78]">
                    {product.product_id}
                  </p>

                  {/* PRODUCT NAME */}
                  <h2 className="mt-2 text-lg font-medium text-[#24352f]">
                    {product.name}
                  </h2>

                  {/* SELLING PRICE */}
                  <p className="mt-4 text-lg font-semibold text-[#24352f]">
                    ₹{Number(product.selling_price).toLocaleString("en-IN")}
                  </p>

                  {/* VIEW PRODUCT */}
                  <Link
                    href={`/products/${product.product_id}`}
                    className="mt-5 block w-full rounded-full border border-[#24352f] px-4 py-3 text-center text-sm font-medium text-[#24352f] transition hover:bg-[#24352f] hover:text-white"
                  >
                    View Product
                  </Link>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8dfd5] py-8 text-center">

        <p className="text-sm tracking-[0.2em] text-[#24352f]">
          DIARA
        </p>

        <p className="mt-2 text-xs text-[#8b837c]">
          For Moments That Deserve To Shine
        </p>

      </footer>

    </main>
  );
}