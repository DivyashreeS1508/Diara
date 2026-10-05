import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf7f2] text-[#24352f]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <Navbar />

      {/* =========================================================
          HERO SECTION
      ========================================================= */}

      <section
        id="home"
        className="relative flex min-h-[calc(100vh-91px)] items-center justify-center overflow-hidden px-6 py-20"
      >
        {/* Soft background decoration */}
        <div className="absolute left-[-180px] top-20 h-[420px] w-[420px] rounded-full bg-[#ead9d4]/30 blur-3xl" />

        <div className="absolute bottom-[-180px] right-[-150px] h-[450px] w-[450px] rounded-full bg-[#dfe8df]/35 blur-3xl" />

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">

          {/* LARGE CENTER LOGO */}
          <div className="mb-9 flex justify-center">
            <Image
              src="/images/logo.png"
              alt="DIARA Jewellery"
              width={190}
              height={190}
              priority
              className="h-[150px] w-[150px] object-contain drop-shadow-[0_8px_20px_rgba(36,53,47,0.10)] md:h-[190px] md:w-[190px]"
            />
          </div>

          {/* SMALL ELEGANT TAGLINE */}
          <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.32em] text-[#a46b78] md:text-[15px]">
            For Moments That Deserve To Shine
          </p>

          {/* MAIN HEADING */}
          <h1 className="max-w-5xl text-[46px] font-semibold leading-[1.08] tracking-[-0.025em] text-[#24352f] sm:text-[54px] md:text-[68px] lg:text-[76px]">
            Beautiful Moments
            <br />
            Deserve Beautiful Jewellery.
          </h1>

          {/* SUPPORTING LINE */}
          <p className="mt-8 max-w-2xl text-[18px] font-light leading-relaxed tracking-wide text-[#655b55] md:text-[21px]">
            Where Every Sparkle Becomes A Memory
          </p>

          {/* BRAND STATEMENT */}
          <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.22em] text-[#a46b78] md:text-[14px]">
            A Signature Of Elegance For Every Occasion.
          </p>

          {/* BUTTONS */}
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <Link
              href="#collections"
              className="rounded-full bg-[#24352f] px-9 py-3.5 text-[15px] font-medium text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#344b43] hover:shadow-md"
            >
              Explore Collections
            </Link>

            <Link
              href="#bridal"
              className="rounded-full border border-[#24352f] px-9 py-3.5 text-[15px] font-medium text-[#24352f] transition duration-300 hover:-translate-y-0.5 hover:bg-[#24352f] hover:text-white"
            >
              Bridal Rental
            </Link>

          </div>
        </div>
      </section>

      {/* =========================================================
          COLLECTIONS
      ========================================================= */}

      <section
        id="collections"
        className="bg-white px-6 py-24 md:py-28"
      >
        <div className="mx-auto max-w-7xl">

          {/* SECTION INTRO */}
          <div className="mb-16 text-center">

            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.3em] text-[#a46b78] md:text-[14px]">
              Discover DIARA
            </p>

            <h2 className="text-[38px] font-semibold tracking-tight text-[#24352f] md:text-[50px]">
              Our Collections
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-[#766b64] md:text-[17px]">
              Explore elegant jewellery pieces designed to complement every
              celebration, occasion and beautiful moment.
            </p>

          </div>

          {/* COLLECTION CARDS */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* NECKLACES */}
            <Link
              href="/necklaces"
              className="group block overflow-hidden rounded-[28px] bg-[#faf7f2] shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-[310px] overflow-hidden">
                <Image
                  src="/images/collections/necklace.png"
                  alt="DIARA Necklaces"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7 text-center">
                <h3 className="text-[21px] font-semibold text-[#24352f]">
                  Necklaces
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                  Elegant necklace designs for every occasion.
                </p>
              </div>
            </Link>

            {/* EARRINGS */}
            <div className="group overflow-hidden rounded-[28px] bg-[#faf7f2] shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="relative h-[310px] overflow-hidden">
                <Image
                  src="/images/collections/earrings.png"
                  alt="DIARA Earrings"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7 text-center">
                <h3 className="text-[21px] font-semibold text-[#24352f]">
                  Earrings
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                  Beautiful earrings to complete your look.
                </p>
              </div>
            </div>

            {/* BANGLES */}
            <div className="group overflow-hidden rounded-[28px] bg-[#faf7f2] shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="relative h-[310px] overflow-hidden">
                <Image
                  src="/images/collections/bangles.png"
                  alt="DIARA Bangles"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7 text-center">
                <h3 className="text-[21px] font-semibold text-[#24352f]">
                  Bangles
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                  Graceful bangles for festive occasions.
                </p>
              </div>
            </div>

            {/* RINGS */}
            <div className="group overflow-hidden rounded-[28px] bg-[#faf7f2] shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl">
              <div className="relative h-[310px] overflow-hidden">
                <Image
                  src="/images/collections/rings.png"
                  alt="DIARA Rings"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-7 text-center">
                <h3 className="text-[21px] font-semibold text-[#24352f]">
                  Rings
                </h3>

                <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                  Elegant rings crafted for timeless beauty.
                </p>
              </div>
            </div>

          </div>

          {/* VIEW ALL */}
          <div className="mt-14 text-center">
            <button
              type="button"
              className="rounded-full border border-[#24352f] px-9 py-3.5 text-[15px] font-medium text-[#24352f] transition duration-300 hover:bg-[#24352f] hover:text-white"
            >
              View All Collections
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================
          BRIDAL RENTAL
      ========================================================= */}

      <section
        id="bridal"
        className="bg-[#f3ebe7] px-6 py-24 md:py-28"
      >
        <div className="mx-auto max-w-6xl">

          <div className="grid items-center gap-14 md:grid-cols-2">

            {/* TEXT */}
            <div>

              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.3em] text-[#a46b78] md:text-[14px]">
                Bridal Collection
              </p>

              <h2 className="text-[38px] font-semibold leading-[1.15] tracking-tight text-[#24352f] md:text-[50px]">
                Your Dream Bridal Look,
                <br />
                Made Beautiful.
              </h2>

              <p className="mt-7 max-w-xl text-[16px] leading-8 text-[#6f625b] md:text-[17px]">
                Make your special day unforgettable with our elegant bridal
                jewellery collection. Choose from beautifully crafted pieces
                available for bridal rental.
              </p>

              <div className="mt-9">
                <Link
                  href="#contact"
                  className="inline-block rounded-full bg-[#24352f] px-9 py-3.5 text-[15px] font-medium text-white transition duration-300 hover:bg-[#344b43]"
                >
                  Enquire For Bridal Rental
                </Link>
              </div>

            </div>

            {/* DECORATIVE CARD */}
            <div className="flex min-h-[400px] items-center justify-center rounded-[32px] bg-[#faf7f2] px-8 shadow-sm">

              <div className="text-center">

                <p className="text-[13px] uppercase tracking-[0.35em] text-[#a46b78]">
                  DIARA
                </p>

                <h3 className="mt-6 text-[38px] font-semibold text-[#24352f] md:text-[44px]">
                  Bridal Elegance
                </h3>

                <p className="mx-auto mt-5 max-w-sm text-[16px] leading-7 text-[#766b64]">
                  Jewellery that makes your most precious moments shine.
                </p>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          ABOUT
      ========================================================= */}

      <section
        id="about"
        className="bg-white px-6 py-24 md:py-28"
      >
        <div className="mx-auto max-w-5xl text-center">

          <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.3em] text-[#a46b78] md:text-[14px]">
            About DIARA
          </p>

          <h2 className="text-[38px] font-semibold tracking-tight text-[#24352f] md:text-[50px]">
            Jewellery With A Story
          </h2>

          <p className="mx-auto mt-7 max-w-3xl text-[16px] leading-8 text-[#766b64] md:text-[17px]">
            DIARA is a jewellery and accessories brand created for women who
            love elegance, beauty and timeless style. From everyday pieces to
            statement jewellery and bridal collections, every piece is chosen
            to make your special moments even more beautiful.
          </p>

          {/* FEATURES */}
          <div className="mt-14 grid gap-7 sm:grid-cols-3">

            <div className="rounded-[28px] bg-[#faf7f2] p-8">
              <h3 className="text-[19px] font-semibold text-[#24352f]">
                Elegant Designs
              </h3>

              <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                Carefully selected designs for every style.
              </p>
            </div>

            <div className="rounded-[28px] bg-[#faf7f2] p-8">
              <h3 className="text-[19px] font-semibold text-[#24352f]">
                Bridal Rental
              </h3>

              <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                Beautiful bridal jewellery for your special day.
              </p>
            </div>

            <div className="rounded-[28px] bg-[#faf7f2] p-8">
              <h3 className="text-[19px] font-semibold text-[#24352f]">
                Everyday Beauty
              </h3>

              <p className="mt-3 text-[14px] leading-6 text-[#766b64]">
                Elegant pieces made for everyday moments.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          CONTACT
      ========================================================= */}

      <section
        id="contact"
        className="bg-[#24352f] px-6 py-24 text-center text-white"
      >
        <div className="mx-auto max-w-3xl">

          <p className="text-[13px] uppercase tracking-[0.3em] text-[#e3b8c2]">
            Get In Touch
          </p>

          <h2 className="mt-5 text-[38px] font-semibold leading-tight md:text-[50px]">
            Let's Make Your Moment Shine
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-7 text-white/70">
            Have a question about our jewellery, bridal rental or
            collections? We would love to hear from you.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <a
              href="https://wa.me/"
              className="rounded-full bg-white px-9 py-3.5 text-[15px] font-medium text-[#24352f] transition duration-300 hover:bg-[#f3ebe7]"
            >
              WhatsApp Us
            </a>

            <a
              href="mailto:hello@diara.com"
              className="rounded-full border border-white/50 px-9 py-3.5 text-[15px] font-medium text-white transition duration-300 hover:bg-white hover:text-[#24352f]"
            >
              Email Us
            </a>

          </div>

        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#182720] px-6 py-11 text-center text-white">
        <div className="mx-auto max-w-5xl">

          <p className="text-[25px] font-semibold tracking-[0.28em]">
            DIARA
          </p>

          <p className="mt-2 text-[10px] tracking-[0.42em] text-[#d9aab5]">
            JEWELLERY
          </p>

          <p className="mx-auto mt-6 max-w-xl text-[14px] leading-6 text-white/60">
            For moments that deserve to shine, where every sparkle becomes a
            memory.
          </p>

          <div className="my-9 h-px bg-white/10" />

          <p className="text-[12px] text-white/50">
            © {new Date().getFullYear()} DIARA Jewellery. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}