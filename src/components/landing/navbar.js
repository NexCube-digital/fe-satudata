"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet, LogIn, UserPlus } from "lucide-react";

const links = [
  { href: "#fitur", label: "Fitur Unggulan" },
  { href: "#panel", label: "Dasbor Interaktif" },
  { href: "#alur", label: "Alur Sistem" },
];

export default function Navbar({ walletConnected, setWalletConnected }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }
  }, []);
  return (
    <header className="fixed left-0 right-0 top-4 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-3xl shadow-[0_8px_32px_rgba(244,114,182,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(244,114,182,0.12)]">
        <div className="flex flex-col gap-4 px-6 py-3.5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo Section */}
          <a href="#top" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-pink-300">
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={36}
                height={36}
                priority
                className="h-8 w-8 object-contain"
              />
            </span>
            <div>
              <span className="block text-sm font-bold uppercase tracking-[0.25em] text-pink-600 transition-colors duration-300 group-hover:text-pink-700">
                Satu Data
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Hub Rekam Medis Modern
              </span>
            </div>
          </a>

          {/* Navigation and CTA */}
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600 lg:gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 transition-all duration-200 hover:bg-pink-50 hover:text-pink-600"
              >
                {link.label}
              </a>
            ))}
            <span className="hidden h-5 w-px bg-slate-200 lg:block" />

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-medium">
                  {user.email}
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    setUser(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-600 px-4 py-2 text-xs font-bold hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-pink-500 to-fuchsia-500 text-white px-4 py-2 text-xs font-bold hover:from-pink-400 hover:to-fuchsia-400 transition"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
