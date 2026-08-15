import React from 'react';
import { Loader2, Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="py-10 sm:py-20 flex items-center justify-center px-4 w-full">
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-white/90 border border-slate-200/80 shadow-xl shadow-slate-900/5 backdrop-blur-xl max-w-xs w-full text-center space-y-4">
        
        {/* Animated Brand Logo Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-teal-600 to-cyan-500 blur-lg opacity-40 animate-pulse" />
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 flex items-center justify-center text-white shadow-xl shadow-teal-900/20 ring-1 ring-white/30">
            <Zap className="h-7 w-7 sm:h-8 sm:w-8 fill-white/20 animate-bounce" />
          </div>
        </div>

        {/* Text & Spinner */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
            <span>SATUDATA</span>
            <span className="text-teal-700">MEDIS</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Memuat data halaman...</p>
        </div>

        {/* Modern Spinner Bar */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] sm:text-xs font-bold shadow-2xs">
          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-teal-700" />
          <span>Sinkronisasi Portal...</span>
        </div>
      </div>
    </div>
  );
}
