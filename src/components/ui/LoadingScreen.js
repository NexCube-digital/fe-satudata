"use client";

import React from "react";
import { Activity, Stethoscope, ShieldCheck } from "lucide-react";

/**
 * LoadingScreen - Component tampilan loading modern bergaya aplikasi rumah sakit & Web3
 *
 * Props:
 *   message     - Pesan utama (default: "Memuat Data Medis Terenkripsi...")
 *   subtitle    - Sub-pesan (default: "Menghubungkan ke Jaringan SatuData Blockchain Core...")
 *   fullScreen  - Menampilkan loading satu layar penuh (default: true)
 *   inline      - Tampilan compact untuk kontainer card/modal (default: false)
 *   className   - Kelas tambahan CSS
 */
export default function LoadingScreen({
  message = "Memuat Data Medis Terenkripsi...",
  subtitle = "Menghubungkan ke Jaringan SatuData Blockchain...",
  fullScreen = true,
  inline = false,
  className = "",
}) {
  // Mode Inline (untuk card / section)
  if (inline) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
        <div className="relative flex items-center justify-center h-14 w-14 mb-4">
          <div className="absolute inset-0 rounded-full border-3 border-teal-100 border-t-teal-700 animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-3 border-cyan-100 border-b-cyan-600 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <Stethoscope className="h-5 w-5 text-teal-800 animate-pulse" />
        </div>
        <p className="text-xs font-extrabold text-slate-800 tracking-tight text-center">{message}</p>
        {subtitle && <p className="text-[10px] text-slate-500 font-medium mt-1 text-center">{subtitle}</p>}
      </div>
    );
  }

  // Container styling untuk FullScreen / Page Level
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] min-h-screen bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    : `min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-4 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center text-center max-w-sm w-full bg-white/90 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-2xl shadow-teal-900/10">
        
        {/* Glow Background Accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Central Hospital Animated Spinner */}
        <div className="relative flex items-center justify-center h-20 w-20 mb-6">
          {/* Outer Ring Spin */}
          <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin" />
          {/* Inner Reverse Ring Spin */}
          <div className="absolute inset-2 rounded-full border-4 border-cyan-100 border-b-cyan-600 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
          
          {/* Center Hospital Icon */}
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-800 to-cyan-700 text-white flex items-center justify-center shadow-md animate-pulse">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Brand Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-extrabold text-teal-800 uppercase tracking-widest mb-3">
          <ShieldCheck className="h-3 w-3 text-teal-700" /> SatuData Healthcare
        </div>

        {/* Status Message */}
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{message}</h3>
        <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1.5">{subtitle}</p>

        {/* Live Pulsing Dot */}
        <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[10px] font-bold text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
          </span>
          Sistem Medis Terhubung Real-Time
        </div>
      </div>
    </div>
  );
}
