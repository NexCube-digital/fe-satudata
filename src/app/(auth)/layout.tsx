'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HeartPulse, ShieldCheck, Lock, Home } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRegister = pathname?.includes('/register');
  const isForgotPassword = pathname?.includes('/forgot-password');

  const mobileTitle = isRegister
    ? 'Pendaftaran Akun Baru'
    : isForgotPassword
    ? 'Lupa Kata Sandi'
    : 'Pilih Metode Masuk';

  const mobileSubtitle = isRegister
    ? 'Buat akun untuk mengakses layanan SatuData'
    : isForgotPassword
    ? 'Masukkan email terdaftar Anda untuk mereset kata sandi'
    : 'Tentukan peran Anda untuk mengakses sistem SatuData';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#f4efe6] to-[#eef2ff] flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Soft Background Radial Glow Accent */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/15 via-cyan-500/10 to-transparent pointer-events-none" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl shadow-teal-950/10 grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10 min-h-0 lg:min-h-[640px]">
        {/* Left Side: Hero Image & Branding Panel */}
        <div className="lg:col-span-6 relative bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-900 p-4 sm:p-8 lg:p-10 flex flex-col justify-between text-white overflow-hidden min-h-0">
          {/* Background Decorative Blur Rings */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

          {/* Background Image with Light Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/branding/login.jpg"
              alt="Medical Data Network"
              fill
              className="object-cover opacity-20 lg:opacity-25 mix-blend-overlay scale-105 transition-transform duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-teal-900/40 to-transparent" />
          </div>

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-white text-teal-800 flex items-center justify-center shadow-lg shadow-teal-950/20 group-hover:scale-105 transition-transform shrink-0">
                <HeartPulse className="h-4.5 w-4.5 sm:h-6 sm:w-6 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base sm:text-xl text-white tracking-tight">
                SatuData <span className="text-teal-200 font-semibold text-[9px] sm:text-xs uppercase tracking-widest">EHR</span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile Home Button Icon next to SATUSEHAT */}
              <Link
                href="/"
                title="Kembali ke Beranda"
                className="inline-flex lg:hidden h-7 w-7 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md transition cursor-pointer shadow-xs shrink-0"
              >
                <Home className="h-3.5 w-3.5 text-white" />
              </Link>
            </div>
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 my-auto py-3 lg:py-6 space-y-2 sm:space-y-3 lg:space-y-4">
            {/* Desktop View Header */}
            <div className="hidden lg:block space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold backdrop-blur-md shadow-xs">
                <ShieldCheck className="h-4 w-4 text-teal-200" />
                <span>SATUSEHAT & Blockchain Verified</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                Integrasi Rekam Medis Nasional
              </h1>
              <p className="text-sm text-teal-50 font-medium leading-relaxed max-w-md">
                Platform terintegrasi standar SATUSEHAT Kemenkes & Blockchain Sepolia untuk enkripsi rekam medis aman, transparan, dan terkontrol.
              </p>
            </div>

            {/* Mobile View Header */}
            <div className="block lg:hidden space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug tracking-tight">
                {mobileTitle}
              </h2>
              <p className="text-xs text-teal-100 font-medium">
                {mobileSubtitle}
              </p>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-3 lg:pt-4 border-t border-white/20 hidden sm:flex items-center justify-between text-xs text-teal-100 font-semibold">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-teal-200" /> End-to-End Encrypted
            </span>
            <span className="text-[10px] text-teal-200 font-mono">v3.0.0</span>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-6 p-4 sm:p-8 lg:p-12 flex flex-col justify-between bg-white min-h-0 lg:min-h-[560px]">
          {children}
        </div>
      </div>
    </div>
  );
}
