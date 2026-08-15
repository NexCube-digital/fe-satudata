'use client';

import React from 'react';
import { Activity, Stethoscope, ShieldCheck } from 'lucide-react';

export interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
  fullScreen?: boolean;
  inline?: boolean;
  className?: string;
}

export default function LoadingScreen({
  message = 'Memuat Data Medis Terenkripsi...',
  subtitle = 'Menghubungkan ke Jaringan SatuData Blockchain...',
  fullScreen = true,
  inline = false,
  className = '',
}: LoadingScreenProps) {
  if (inline) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
        <div className="relative flex items-center justify-center h-14 w-14 mb-4">
          <div className="absolute inset-0 rounded-full border-3 border-teal-100 border-t-teal-700 animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-3 border-cyan-100 border-b-cyan-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <Stethoscope className="h-5 w-5 text-teal-800 animate-pulse" />
        </div>
        <p className="text-xs font-extrabold text-slate-800 tracking-tight text-center">{message}</p>
        {subtitle && <p className="text-[10px] text-slate-500 font-medium mt-1 text-center">{subtitle}</p>}
      </div>
    );
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4'
    : `py-10 sm:py-20 flex flex-col items-center justify-center p-4 w-full ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center text-center max-w-xs sm:max-w-sm w-full bg-white/95 backdrop-blur-xl border border-white/80 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-teal-900/10">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 mb-4 sm:mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-700 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-cyan-100 border-b-cyan-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />

          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-tr from-teal-800 to-cyan-700 text-white flex items-center justify-center shadow-md animate-pulse">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-extrabold text-teal-800 uppercase tracking-widest mb-2.5">
          <ShieldCheck className="h-3 w-3 text-teal-700" /> SatuData Healthcare
        </div>

        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{message}</h3>
        <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-relaxed mt-1">{subtitle}</p>

        <div className="mt-5 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[10px] font-bold text-slate-600">
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
