'use client';

import React from 'react';
import {
  User as UserIcon,
  Wallet,
  Lock,
  LogOut,
  ChevronRight,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { getAvatarUrl } from '@/lib/api-client';

export const MobileSettingHub = ({
  user,
  name,
  email,
  nik,
  onSelectMenu,
  canUseWallet,
  onLogout,
}) => {
  return (
    <div className="space-y-4 animate-fade-in pb-12 -mt-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
      </div>

      {/* User Profile Banner (iOS Style) */}
      <div
        onClick={() => onSelectMenu('profil')}
        className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-teal-700 to-cyan-800 ring-2 ring-teal-500/20 shrink-0 shadow-xs flex items-center justify-center">
            {getAvatarUrl(user) ? (
              <img
                src={getAvatarUrl(user)}
                alt={name || 'Foto Profil'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xl font-bold text-white">
                {name ? name.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6" />}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 truncate">{name || 'Pengguna SatuData'}</h2>
            <p className="text-xs text-slate-500 truncate mt-0.5">{email || (nik ? `NIK: ${nik}` : 'SatuData Patient Account')}</p>
          </div>
        </div>

        <div className="p-2.5 rounded-full bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
          <QrCode className="h-4.5 w-4.5" />
        </div>
      </div>

      {/* Main Grouped Settings Menu List (iOS Style) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100 shadow-2xs">
        {/* Profil */}
        <button
          type="button"
          onClick={() => onSelectMenu('profil')}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-extrabold text-slate-800 group-hover:text-teal-800 transition">Profil</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
        </button>

        {/* Dompet */}
        {canUseWallet && (
          <button
            type="button"
            onClick={() => onSelectMenu('dompet')}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Wallet className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-extrabold text-slate-800 group-hover:text-teal-800 transition">Dompet</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
          </button>
        )}

        {/* Keamanan & Sandi */}
        <button
          type="button"
          onClick={() => onSelectMenu('keamanan')}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-extrabold text-slate-800 group-hover:text-teal-800 transition">Keamanan & sandi</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
        </button>
      </div>

      {/* Separate Card for Logout (iOS Style) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-rose-50/50 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <LogOut className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-extrabold text-rose-600 transition">Keluar Akun</span>
          </div>
          <ChevronRight className="h-4 w-4 text-rose-300 group-hover:text-rose-500 transition" />
        </button>
      </div>

      {/* Footer Branding (like 'from FACEBOOK') */}
      <div className="pt-6 text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">from</p>
        <p className="text-xs font-black uppercase tracking-widest text-slate-700 mt-0.5 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-700" /> SATUDATA INDONESIA
        </p>
      </div>
    </div>
  );
};

export default MobileSettingHub;
