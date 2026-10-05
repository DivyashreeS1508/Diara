"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e8ded5] bg-[#faf7f2]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/images/logo.png"
            alt="DIARA Jewellery Logo"
            width={62}
            height={62}
            className="rounded-full"
          />

          <div className="leading-tight">
            <p className="text-[21px] font-semibold tracking-[0.28em] text-[#24352f]">
              DIARA
            </p>

            <p className="mt-1 text-[10px] tracking-[0.38em] text-[#a46b78]">
              JEWELLERY
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-7 md:flex">

          <Link
            href="/"
            className="text-[15px] font-medium text-[#394842] transition hover:text-[#a46b78]"
          >
            Home
          </Link>

          <Link
            href="/#collections"
            className="text-[15px] font-medium text-[#394842] transition hover:text-[#a46b78]"
          >
            Collections
          </Link>

          <Link
            href="/#bridal"
            className="text-[15px] font-medium text-[#394842] transition hover:text-[#a46b78]"
          >
            Bridal Rental
          </Link>

          <Link
            href="/#about"
            className="text-[15px] font-medium text-[#394842] transition hover:text-[#a46b78]"
          >
            About
          </Link>

          <Link
            href="/#contact"
            className="text-[15px] font-medium text-[#394842] transition hover:text-[#a46b78]"
          >
            Contact
          </Link>

          {/* MY ACCOUNT */}
          {loggedIn && (
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full border border-[#d8cbc3] px-4 py-2 text-[14px] font-medium text-[#24352f] transition duration-300 hover:bg-[#24352f] hover:text-white"
            >
              <span className="text-[18px]">👤</span>
              <span>My Account</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}