"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function AdminPage() {
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Necklaces");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // --------------------------------
      // 1. Basic validation
      // --------------------------------

      if (!productId.trim()) {
        throw new Error("Please enter Product ID.");
      }

      if (!name.trim()) {
        throw new Error("Please enter Product Name.");
      }

      if (!sellingPrice) {
        throw new Error("Please enter Selling Price.");
      }

      if (!costPrice) {
        throw new Error("Please enter Cost Price.");
      }

      if (!stock) {
        throw new Error("Please enter Stock.");
      }

      if (!image) {
        throw new Error("Please select a product image.");
      }

      // --------------------------------
      // 2. Create unique image filename
      // --------------------------------

      const fileExtension = image.name.split(".").pop();

      const fileName = `${productId
        .trim()
        .replace(/[^a-zA-Z0-9-_]/g, "-")}-${Date.now()}.${fileExtension}`;

      // --------------------------------
      // 3. Upload image to Supabase
      // --------------------------------

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      // --------------------------------
      // 4. Get public image URL
      // --------------------------------

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // --------------------------------
      // 5. Save product in database
      // --------------------------------

      const { error: productError } = await supabase
        .from("products")
        .insert({
          product_id: productId.trim(),
          name: name.trim(),
          category: category,
          selling_price: Number(sellingPrice),
          cost_price: Number(costPrice),
          image_url: imageUrl,
          description: description.trim(),
          keywords: keywords.trim(),
          stock: Number(stock),
          is_active: true,
        });

      if (productError) {
        // If database insertion fails, remove uploaded image
        await supabase.storage
          .from("product-images")
          .remove([fileName]);

        throw new Error(`Product save failed: ${productError.message}`);
      }

      // --------------------------------
      // 6. Success
      // --------------------------------

      setMessage("✅ Product added successfully!");

      // Clear form
      setProductId("");
      setName("");
      setCategory("Necklaces");
      setSellingPrice("");
      setCostPrice("");
      setStock("");
      setDescription("");
      setKeywords("");
      setImage(null);

      // Reset file input
      const fileInput = document.getElementById(
        "product-image"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f2] px-5 py-10 text-[#24352f]">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#a46b78]">
            DIARA
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Admin Product Panel
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Add products directly from the website. Upload the image, enter
            the product details, and save it to the DIARA database.
          </p>
        </div>

        {/* Success message */}
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] bg-white p-6 shadow-xl md:p-10"
        >
          <div className="grid gap-8 md:grid-cols-2">
            {/* Product ID */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Product ID *
              </label>

              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Example: DIARA-001"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Product Name *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Lotus Gold Necklace Set"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              >
                <option value="Necklaces">Necklaces</option>
                <option value="Long Hara">Long Hara</option>
                <option value="Premium Sets">Premium Sets</option>
                <option value="Earrings">Earrings</option>
                <option value="Rings">Rings</option>
                <option value="Bangles">Bangles</option>
                <option value="Maang Tikka">Maang Tikka</option>
                <option value="Maati">Maati</option>
                <option value="Pearl Hara">Pearl Hara</option>
                <option value="Waist Belt">Waist Belt</option>
                <option value="Anti-Tarnish Chains">
                  Anti-Tarnish Chains
                </option>
                <option value="Anti-Tarnish Bracelets">
                  Anti-Tarnish Bracelets
                </option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Stock *
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Example: 5"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Selling Price (₹) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="Example: 2499"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Cost Price (₹) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="Admin only"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />

              <p className="mt-2 text-xs text-gray-500">
                This is your internal purchase/cost price.
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the jewellery..."
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />
            </div>

            {/* Keywords */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Search Keywords
              </label>

              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Example: necklace, gold, bridal, temple jewellery"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#a46b78] focus:ring-2 focus:ring-[#a46b78]/20"
              />

              <p className="mt-2 text-xs text-gray-500">
                Separate keywords with commas.
              </p>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Product Image *
              </label>

              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-[#faf7f2] p-6 text-center">
                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    setImage(e.target.files?.[0] ?? null);
                  }}
                  className="mx-auto block w-full max-w-md text-sm"
                />

                <p className="mt-3 text-xs text-gray-500">
                  JPG, PNG or WEBP • Maximum 5 MB
                </p>

                {image && (
                  <p className="mt-3 font-medium text-[#24352f]">
                    Selected: {image.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-10 border-t border-gray-100 pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#24352f] px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-[#30463f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading & Saving Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}