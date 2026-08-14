'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Bell, Shield, HeartPulse } from 'lucide-react';
import { clearAuth } from '@/lib/api';

interface NavbarProps {
  user?: any;
  roleLabel?: string;
  onLogout?: () => void;
}

export default function Navbar({ user, roleLabel = 'Pengguna Portal', onLogout }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-slate-900 via-teal-900 to-slate-800 bg-clip-text text-transparent tracking-tight">
              SatuData
            </span>
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
            {roleLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50/60 transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Pengguna'}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {user?.email || 'User Active'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="ml-1.5 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
