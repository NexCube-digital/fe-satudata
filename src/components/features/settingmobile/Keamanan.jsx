'use client';

import React from 'react';
import {
  Lock,
  Key,
  CheckCircle,
  AlertCircle,
  Loader,
  Save,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

export const KeamananMobile = ({
  hasPassword,
  passwordMsg,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showOldPassword,
  setShowOldPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordLoading,
  handleUpdatePassword,
  router,
  onBack,
}) => {
  return (
    <div className="space-y-4 animate-fade-in pb-24">
      {/* Fixed Flushed Top Header Navigation */}
      <div className="sticky top-0 z-40 -mt-8 -mx-4 pt-4 px-4 pb-3 bg-[#faf7f2] border-b border-slate-200/90 flex items-center gap-3 shadow-2xs">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-800">Keamanan & Sandi</h2>
          <p className="text-[11px] text-slate-500">Perbarui kata sandi dan keamanan akun Anda</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Lock className="h-4 w-4 text-teal-800 shrink-0" />
          {hasPassword ? 'Ganti Kata Sandi' : 'Atur Kata Sandi'}
        </h3>

        {!hasPassword ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Akun Google Anda belum memiliki kata sandi. Atur kata sandi terlebih dahulu agar dapat masuk tanpa Google.
            </p>
            <button
              type="button"
              onClick={() => router.push('/auth/set-password')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              <Key className="h-4 w-4" />
              Atur Kata Sandi Sekarang
            </button>
          </div>
        ) : (
          <>
            {passwordMsg?.text && (
              <div
                className={`flex items-center gap-3 rounded-xl p-3 text-xs ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                    : 'bg-rose-50 text-[#DC2626] border border-rose-200'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-600 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-600 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-600 focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default KeamananMobile;
