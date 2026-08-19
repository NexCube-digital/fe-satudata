'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, Building2 } from 'lucide-react';

interface LoginRequiredModalProps {
  title?: string;
  description?: string;
  loginUrl?: string;
  icon?: LucideIcon;
}

export default function LoginRequiredModal({
  title = "Akses Memerlukan Login",
  description = "Silakan masuk dengan akun Fasilitas Kesehatan Anda.",
  loginUrl = "/auth/login",
  icon: Icon = Building2,
}: LoginRequiredModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-500/25 backdrop-blur-md animate-in fade-in duration-200">
      <div className="text-center p-8 sm:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 max-w-md w-full relative z-[101] transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 shadow-2xs">
          <Icon className="h-8 w-8 text-teal-800" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">{description}</p>
        <Link
          href={loginUrl}
          className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white font-bold text-sm shadow-md shadow-teal-900/15 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
}
