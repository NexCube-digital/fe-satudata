"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, Menu, X, ArrowRight, ShieldCheck, User as UserIcon, LogOut } from "lucide-react";

const links = [
  { href: "#fitur", label: "Fitur Unggulan" },
  { href: "#panel", label: "Dasbor Interaktif" },
  { href: "#alur", label: "Alur Sistem" },
  { href: "#faq", label: "FAQ & Bantuan" },
];

export default function Navbar({ walletConnected, setWalletConnected }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setMobileMenuOpen(false);
  };

  const getDashboardHref = () => {
    switch (user?.role) {
      case "admin":
        return "/dashboard/admin";
      case "rumah_sakit":
      case "faskes":
        return "/dashboard/faskes";
      case "pasien":
      default:
        return "/dashboard/pasien";
    }
  };

  return (
    <header className="fixed left-0 right-0 top-3 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-md shadow-rose-950/5 transition-all duration-300">
        <div className="flex items-center justify-between px-5 py-3 sm:px-8">
          
          {/* Logo Section */}
          <a href="#top" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white shadow-2xs transition-transform duration-300 group-hover:scale-105">
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
              <span className="block text-sm font-extrabold uppercase tracking-[0.2em] text-rose-800 transition-colors duration-300">
                Satu Data
              </span>
              <span className="block text-[10px] font-medium text-slate-500">
                Hub Rekam Medis Modern
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-2 transition-all duration-200 hover:bg-rose-50 hover:text-rose-800"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA / User State */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardHref()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-800 to-red-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Buka Dashboard ({user.name ? user.name.split(" ")[0] : "Akun"})
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-500" />
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-rose-800 to-red-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                >
                  Daftar Akun <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-rose-50 hover:text-rose-800 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 p-4 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-800"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-800 to-red-900 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <ShieldCheck className="h-4 w-4" /> Buka Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700"
                  >
                    <LogIn className="h-3.5 w-3.5" /> Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-rose-800 to-red-900 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    Daftar <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
