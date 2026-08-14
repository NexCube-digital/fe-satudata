import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartPulse, ShieldCheck, Lock } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-800/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden z-10 min-h-[640px]">
        {/* Left Side: Hero Image & Branding Panel */}
        <div className="lg:col-span-6 relative bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 p-8 sm:p-10 flex flex-col justify-between text-white overflow-hidden min-h-[260px] lg:min-h-full">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/branding/login.jpg"
              alt="Medical Data Network"
              fill
              className="object-cover opacity-35 mix-blend-overlay scale-105 transition-transform duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-teal-950/60 to-transparent" />
          </div>

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-300 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
                <HeartPulse className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                SatuData <span className="text-teal-400 font-normal text-xs">EHR</span>
              </span>
            </Link>
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 my-auto py-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Blockchain Verified Medical Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Integrasi Rekam Medis Nasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Platform terintegrasi standar SATUSEHAT Kemenkes & Blockchain Sepolia untuk enkripsi rekam medis aman dan terkontrol.
            </p>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="h-3.5 w-3.5 text-teal-400" /> End-to-End Encrypted
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v3.0.0</span>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
