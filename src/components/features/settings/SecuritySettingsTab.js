"use client";

import Link from "next/link";
import { 
  ShieldPlus, 
  Lock, 
  Key, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Loader, 
  ArrowLeft 
} from "lucide-react";

export default function SecuritySettingsTab({
  user,
  needsPasswordSetup,
  passwordMsg,
  handleUpdatePassword,
  oldPassword,
  setOldPassword,
  showOldPassword,
  setShowOldPassword,
  newPassword,
  setNewPassword,
  showNewPassword,
  setShowNewPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordLoading,
  needsPinSetup,
  pinMsg,
  handleUpdatePin,
  oldPin,
  setOldPin,
  showOldPin,
  setShowOldPin,
  newPin,
  setNewPin,
  showNewPin,
  setShowNewPin,
  confirmPin,
  setConfirmPin,
  showConfirmPin,
  setShowConfirmPin,
  pinLoading
}) {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      {/* CARD: Ganti / Atur Kata Sandi */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <Link
            href="/dashboard/pasien/settings"
            className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer md:hidden shrink-0"
            title="Kembali ke Pilihan Settings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
            {needsPasswordSetup ? <ShieldPlus className="h-5 w-5 text-[#0D9488]" /> : <Lock className="h-5 w-5 text-[#0D9488]" />}
            {needsPasswordSetup ? "Atur Kata Sandi" : "Keamanan & Sandi"}
          </h2>
        </div>

        {needsPasswordSetup && (
          <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
            Akun Anda dibuat melalui Google dan belum memiliki kata sandi. Atur kata sandi
            di bawah agar Anda juga bisa login menggunakan email &amp; kata sandi.
          </p>
        )}

        {passwordMsg.text && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-xs sm:text-sm ${
            passwordMsg.type === "success" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {passwordMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 sm:space-y-5">
          {/* Field kata sandi lama hanya muncul jika user SUDAH punya password */}
          {!needsPasswordSetup && (
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Kata Sandi Saat Ini</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  aria-label={showOldPassword ? "Sembunyikan kata sandi saat ini" : "Tampilkan kata sandi saat ini"}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0F766E] transition cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {needsPasswordSetup ? "Simpan Kata Sandi" : "Perbarui Kata Sandi"}
            </button>
          </div>
        </form>
      </div>

      {/* CARD: Atur / Ubah PIN - khusus role pasien */}
      {user?.role === "pasien" && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
              {needsPinSetup ? <ShieldPlus className="h-5 w-5 text-[#0D9488]" /> : <KeyRound className="h-5 w-5 text-[#0D9488]" />}
              {needsPinSetup ? "Atur PIN Keamanan" : "Ubah 6-Digit PIN"}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
            {needsPinSetup
              ? "Atur PIN 6 digit agar Anda bisa masuk lebih cepat menggunakan NIK dan PIN, tanpa perlu memasukkan email dan kata sandi."
              : "Ubah PIN 6 digit yang digunakan untuk login cepat dengan NIK. Masukkan PIN lama untuk verifikasi."}
          </p>

          {pinMsg.text && (
            <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-xs sm:text-sm ${
              pinMsg.type === "success" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {pinMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span>{pinMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="space-y-4 sm:space-y-5">
            {!needsPinSetup && (
              <div>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">PIN Saat Ini</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showOldPin ? "text" : "password"}
                    inputMode="numeric"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    placeholder="••••••"
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm tracking-[0.3em] focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPin(!showOldPin)}
                    aria-label={showOldPin ? "Sembunyikan PIN saat ini" : "Tampilkan PIN saat ini"}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showOldPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">PIN Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showNewPin ? "text" : "password"}
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  placeholder="6 digit angka"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm tracking-[0.3em] focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  aria-label={showNewPin ? "Sembunyikan PIN baru" : "Tampilkan PIN baru"}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Konfirmasi PIN Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showConfirmPin ? "text" : "password"}
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  placeholder="Ulangi PIN baru"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm tracking-[0.3em] focus:border-[#0D9488] focus:ring-2 focus:ring-teal-500/20 outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  aria-label={showConfirmPin ? "Sembunyikan konfirmasi PIN" : "Tampilkan konfirmasi PIN"}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end">
              <button
                type="submit"
                disabled={pinLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0F766E] transition cursor-pointer disabled:opacity-50"
              >
                {pinLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {needsPinSetup ? "Simpan PIN" : "Perbarui PIN"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
