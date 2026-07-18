import Image from "next/image";
import { Wallet } from "lucide-react";

const links = [
  { href: "#fitur", label: "Fitur Unggulan" },
  { href: "#panel", label: "Dasbor Interaktif" },
  { href: "#alur", label: "Alur Sistem" },
];

export default function Navbar() {
  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-3xl shadow-[0_8px_32px_rgba(225,29,72,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(225,29,72,0.08)]">
        <div className="flex flex-col gap-4 px-6 py-3.5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Logo Section */}
          <a href="#top" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-rose-300">
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
              <span className="block text-sm font-bold uppercase tracking-[0.25em] text-rose-600 transition-colors duration-300 group-hover:text-rose-700">
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
                className="rounded-full px-4 py-2 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600"
              >
                {link.label}
              </a>
            ))}
            <span className="hidden h-5 w-px bg-slate-200 lg:block" />
            <a
              href="#panel"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:from-red-500 hover:to-rose-500 hover:shadow-md hover:shadow-rose-100"
            >
              <Wallet className="h-3.5 w-3.5" />
              Hubungkan Wallet
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}