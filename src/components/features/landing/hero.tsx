'use client';

import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Lock, Activity, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface HeroProps {
  walletConnected?: boolean;
  setWalletConnected?: (connected: boolean) => void;
}

export const Hero: React.FC<HeroProps> = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-teal-100/80 bg-white p-6 sm:p-10 lg:p-12 min-h-[calc(100dvh-5.5rem)] sm:min-h-[calc(100vh-6.5rem)] flex flex-col justify-between shadow-[0_20px_70px_rgba(20,184,166,0.08)]"
    >
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.08),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Brand Partnership Logos Header */}
      <div className="flex items-center gap-5 sm:gap-8 lg:gap-10 z-10 w-full mb-6 lg:mb-4">
        <img
          src="/images/logo.png"
          alt="SatuData"
          className="h-10 sm:h-14 lg:h-16 w-auto object-contain transition-transform duration-200 hover:scale-105"
        />

        <img
          src="/images/satusehat.png"
          alt="SatuSehat"
          className="h-9 sm:h-13 lg:h-15 w-auto object-contain transition-transform duration-200 hover:scale-105"
        />

        <img
          src="/images/kemenkes.png"
          alt="Kemenkes"
          className="h-16 sm:h-22 lg:h-28 w-auto object-contain transition-transform duration-200 hover:scale-105"
        />
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center my-auto z-10 w-full">
        {/* Left Column: Text & Action Callouts */}
        <div className="lg:col-span-7 text-left space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3.5 py-1.5 text-xs font-bold tracking-wide text-teal-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-pulse shrink-0" />
            <span>Integrasi Official SATUSEHAT & Web3 Sovereign</span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-[1.15]">
              Data Kesehatan Anda, <br />
              <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                100% Hak Kendali Anda.
              </span>
            </h1>
            <p className="max-w-xl text-xs sm:text-base leading-relaxed text-slate-600">
              Platform manajemen rekam medis berbasis blockchain yang memberikan persetujuan eksplisit digital kepada pasien. Rumah sakit atau dokter hanya dapat membaca data medis Anda setelah mendapatkan verifikasi otorisasi Smart Contract.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-700 px-7 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-teal-900/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-teal-900/30 active:scale-[0.98] cursor-pointer"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#fitur"
              className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              Jelajahi Fitur
            </a>
          </div>

          {/* Key Value Props / Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">Privasi Mutlak</p>
                <p className="text-[10px] text-slate-500">Izin Pasien Direct</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">Smart Contract</p>
                <p className="text-[10px] text-slate-500">Verifikasi Web3</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">SATUSEHAT</p>
                <p className="text-[10px] text-slate-500">Standar Kemenkes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Doctor Illustration & Floating Interactive Badges */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[320px] sm:min-h-[420px] lg:min-h-[460px]">
          {/* Ambient Glowing Backdrop */}
          <div className="absolute h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-gradient-to-tr from-teal-400/20 to-cyan-400/20 blur-3xl" />
          
          {/* Main 3D Doctor Illustration */}
          <div className="relative z-10 w-full max-w-[340px] sm:max-w-[400px] transform hover:scale-[1.02] transition-transform duration-500 ease-out">
            <img
              src="/images/hero-doctor-3d.png"
              alt="Animasi Dokter 3D SatuData"
              className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(15,118,110,0.22)]"
            />

            {/* Floating Glassmorphism Badge 1: Top Left */}
            <div className="absolute top-4 -left-4 sm:-left-8 bg-white/90 backdrop-blur-md border border-white/80 shadow-xl shadow-teal-900/10 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 animate-bounce [animation-duration:4s] z-20">
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/30">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Keamanan</p>
                <p className="text-xs font-black text-slate-900">Enkripsi End-to-End</p>
              </div>
            </div>

            {/* Floating Glassmorphism Badge 2: Bottom Right */}
            <div className="absolute bottom-6 -right-2 sm:-right-6 bg-white/90 backdrop-blur-md border border-white/80 shadow-xl shadow-cyan-900/10 rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 animate-bounce [animation-duration:5s] z-20">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/30">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Akses Dokter</p>
                <p className="text-xs font-black text-teal-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-ping" />
                  Otorisasi Real-Time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
