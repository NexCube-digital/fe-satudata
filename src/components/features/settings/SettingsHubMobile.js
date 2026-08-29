"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Lock, 
  Wallet, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  LogOut,
  History,
  Clock
} from "lucide-react";
import { getAvatarUrl } from "@/lib/api";

export default function SettingsHubMobile({
  user,
  profilePicturePreview,
  roleLabelMap,
  nik,
  handleLogout
}) {
  const router = useRouter();

  return (
    <div className="space-y-4 max-w-2xl mx-auto md:hidden">
      {/* Profile Card Header */}
      <Link
        href="/dashboard/pasien/settings/profile"
        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] ring-2 ring-teal-500/20 shrink-0">
            {profilePicturePreview || getAvatarUrl(user) ? (
              <img
                src={profilePicturePreview || getAvatarUrl(user)}
                alt={user?.name || "Foto Profil"}
                className="h-full w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-extrabold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 truncate">
              {user?.name || "Pengguna Terdaftar"}
            </h2>
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
              {user?.email || "user@satudata.id"}
            </p>
            <span className="inline-block mt-1 rounded-md bg-teal-50 border border-teal-200 px-2 py-0.2 text-[9px] font-bold text-teal-800 uppercase">
              {roleLabelMap[user?.role] || "Aktif"} • NIK: {nik || "Belum Dilengkapi"}
            </span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
      </Link>

      {/* GROUP 1: AKUN & KEAMANAN */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
          Pengaturan Akun & Keamanan
        </p>
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 shadow-2xs overflow-hidden text-xs">
          <Link
            href="/dashboard/pasien/settings/profile"
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:scale-105 transition shrink-0">
                <User className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-slate-900">Profile & Identitas Diri</p>
                <p className="text-[10px] text-slate-400">Edit nama, NIK, No. HP, dan foto profil</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>

          <Link
            href="/dashboard/pasien/settings/privacy-security"
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition shrink-0">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-slate-900">Privacy & Security</p>
                <p className="text-[10px] text-slate-400">Ubah kata sandi dan atur 6-digit PIN keamanan</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>

          <Link
            href="/dashboard/pasien/settings/wallet"
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition shrink-0">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-slate-900">Wallet & Web3</p>
                <p className="text-[10px] text-slate-400">Tautkan dompet MetaMask & cek saldo ETH</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>
        </div>
      </div>

      {/* GROUP 2: REKAM MEDIS & RIWAYAT (UNTUK PASIEN) */}
      {user?.role === "pasien" && (
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
            Data Medis & Riwayat Otorisasi
          </p>
          <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 shadow-2xs overflow-hidden text-xs">
            <button
              onClick={() => router.push("/dashboard/pasien/consent/history")}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:scale-105 transition shrink-0">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Riwayat Otorisasi (History)</p>
                  <p className="text-[10px] text-slate-400">Log riwayat transaksi & izin akses blockchain</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* GROUP 3: LOGOUT */}
      <div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden text-xs">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/50 transition cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:scale-105 transition shrink-0">
                <LogOut className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-rose-600">Keluar Akun (Logout)</p>
                <p className="text-[10px] text-rose-400">Akhiri sesi login di perangkat ini</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-rose-400 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
