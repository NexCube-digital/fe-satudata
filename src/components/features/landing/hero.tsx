'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface HeroProps {
  walletConnected?: boolean;
  setWalletConnected?: (connected: boolean) => void;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-teal-100/80 bg-white p-4 sm:p-8 lg:p-12 min-h-[calc(100dvh-5.5rem)] sm:min-h-[calc(100vh-6.5rem)] flex flex-col items-center justify-between text-center shadow-[0_20px_70px_rgba(20,184,166,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(20,184,166,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-700/10 blur-[120px]" />

      {/* Brand Partnership Logos */}
      <div className="flex items-center justify-center gap-2 sm:gap-3.5 z-10 my-auto">
        <div className="bg-white/95 border border-slate-100 h-9 sm:h-13 lg:h-[56px] px-2.5 sm:px-4 rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-center">
          <img src="/images/logo.png" alt="SatuData" className="h-5 sm:h-9 lg:h-10 w-auto object-contain" />
        </div>

        <div className="bg-white/95 border border-slate-100 h-9 sm:h-13 lg:h-[56px] px-2.5 sm:px-4 rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-center">
          <img src="/images/satusehat.jfif" alt="SatuSehat" className="h-5 sm:h-8 lg:h-9 w-auto object-contain" />
        </div>

        <div className="bg-white/95 border border-slate-100 h-9 sm:h-13 lg:h-[56px] px-2.5 sm:px-4 rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-center overflow-hidden">
          <img src="/images/kemenkes.jfif" alt="Kemenkes" className="h-7 sm:h-10 lg:h-12 w-auto object-contain scale-[1.3] transform-gpu" />
        </div>
      </div>

      {/* Center Hero Heading & Info */}
      <div className="relative max-w-2xl sm:max-w-3xl space-y-2.5 sm:space-y-5 z-10 mx-auto my-auto py-1 sm:py-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold tracking-wide text-teal-800 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse shrink-0" />
          <span>Integrasi Official SATUSEHAT & Web3 Sovereign</span>
        </div>

        <div className="space-y-1.5 sm:space-y-3">
          <p className="text-[9px] sm:text-xs font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-teal-800">
            SatuData Healthcare Hub v2.5
          </p>
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black tracking-tight text-slate-950 leading-snug sm:leading-tight">
            Data Kesehatan Anda, <br />
            <span className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-800 bg-clip-text text-transparent">
              100% Hak Kendali Anda.
            </span>
          </h1>
          <p className="max-w-xl text-[11px] sm:text-sm leading-relaxed text-slate-600 mx-auto">
            Platform manajemen rekam medis berbasis blockchain yang memberikan persetujuan eksplisit digital kepada pasien. Rumah sakit atau dokter hanya dapat membaca data medis Anda setelah mendapatkan verifikasi otorisasi Smart Contract.
          </p>
        </div>
      </div>

      {/* Call to Actions (Bottom of Frame) */}
      <div className="w-full max-w-xs sm:max-w-none my-auto pt-1 z-10">
        <Link
          href="/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-700 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-teal-900/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
        >
          Mulai Sekarang
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
