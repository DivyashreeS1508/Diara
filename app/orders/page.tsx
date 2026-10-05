"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, total_amount, status, payment_status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    }

    loadOrders();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-[#24352f]">
        <p>Loading your orders...</p>
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
            href="/account"
            className="text-sm text-[#6f6a64] hover:text-[#a46b78]"
          >
            ← My Account
          </Link>

        </div>
      </header>


      <section className="mx-auto max-w-5xl px-6 py-14">

        <p className="text-xs uppercase tracking-[0.35em] text-[#a46b78]">
          SHOPPING
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          My Orders
        </h1>

        <p className="mt-3 text-sm text-[#6f6a64]">
          View your DIARA orders and order status.
        </p>


        {orders.length === 0 ? (

          <div className="mt-10 rounded-3xl border border-[#e8dfd5] bg-white p-10 text-center">

            <h2 className="text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mt-3 text-sm text-[#6f6a64]">
              Your orders will appear here after you complete a purchase.
            </p>

            <Link
              href="/necklaces"
              className="mt-6 inline-block rounded-full bg-[#24352f] px-7 py-3 text-sm font-medium text-white hover:bg-[#a46b78]"
            >
              Start Shopping
            </Link>

          </div>

        ) : (

          <div className="mt-10 space-y-5">

            {orders.map((order) => (

              <div
                key={order.id}
                className="rounded-3xl border border-[#e8dfd5] bg-white p-7 shadow-sm"
              >

                <div className="flex flex-col justify-between gap-5 md:flex-row">

                  <div>

                    <p className="text-xs uppercase tracking-[0.2em] text-[#a46b78]">
                      Order
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      {order.order_number}
                    </h2>

                    <p className="mt-2 text-sm text-[#6f6a64]">
                      {new Date(order.created_at).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>

                  </div>


                  <div className="text-left md:text-right">

                    <p className="text-xl font-semibold">
                      ₹
                      {Number(order.total_amount).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-2 text-sm">
                      Order: {order.status}
                    </p>

                    <p className="mt-1 text-sm text-[#6f6a64]">
                      Payment: {order.payment_status}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

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