"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  User, 
  Lock, 
  Wallet, 
  History, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  Home
} from "lucide-react";
import { getAvatarUrl } from "@/lib/api";

export default function SidebarSetting({
  user,
  activeTab,
  setActiveTab,
  nik,
  profilePicturePreview,
  handleLogout
}) {
  const pathname = usePathname();
  const router = useRouter();

  const roleLabelMap = {
    admin: "Administrator",
    rumah_sakit: "Fasilitas Kesehatan",
    faskes: "Fasilitas Kesehatan",
    pasien: "Pasien Terdaftar"
  };

  const getDashboardHref = () => {
    switch (user?.role) {
      case "admin":
        return "/dashboard/admin";
      case "faskes":
      case "rumah_sakit":
        return "/dashboard/faskes";
      case "pasien":
      default:
        return "/dashboard/pasien";
    }
  };

  const getSubpageHref = (tab) => {
    if (user?.role === "pasien") {
      switch (tab) {
        case "profile":
          return "/dashboard/pasien/settings/profile";
        case "security":
          return "/dashboard/pasien/settings/privacy-security";
        case "wallet":
          return "/dashboard/pasien/settings/wallet";
        default:
          return "/dashboard/pasien/settings";
      }
    } else if (user?.role === "faskes" || user?.role === "rumah_sakit") {
      return "/dashboard/faskes/settings";
    } else if (user?.role === "admin") {
      return "/dashboard/admin/settings";
    }
    return "/dashboard/pasien/settings";
  };

  const isTabActive = (tabName) => {
    if (tabName === "profile") {
      return activeTab === "profile" || activeTab === "overview" || pathname?.includes("/settings/profile");
    }
    if (tabName === "security") {
      return activeTab === "security" || pathname?.includes("/settings/privacy-security");
    }
    if (tabName === "wallet") {
      return activeTab === "wallet" || pathname?.includes("/settings/wallet");
    }
    return false;
  };

  const handleTabClick = (tabName, e) => {
    if (setActiveTab) {
      setActiveTab(tabName);
    }
  };

  return (
    <aside 
      className="sticky top-[57px] self-start h-[calc(100vh-57px)] w-80 border-r border-slate-200 bg-white hidden md:flex flex-col shrink-0 z-30"
      style={{ boxShadow: "inset -1px 0 0 0 rgb(0 0 0 / 0.05)" }}
    >
      <div className="flex-1 p-4 space-y-5 overflow-y-auto min-h-0">

        {/* Group 1: Pengaturan Akun & Keamanan */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2">
            Pengaturan Akun & Keamanan
          </p>

          <nav className="space-y-1">
            {/* 0. Home / Dashboard */}
            <Link
              href={getDashboardHref()}
              className="group flex items-center justify-between p-3 rounded-xl text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:border-teal-200 group-hover:text-teal-700 shrink-0 transition">
                  <Home className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold leading-snug truncate">Home / Dashboard</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Kembali ke halaman utama dashboard
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
            </Link>

            {/* 1. Profile & Identitas Diri */}
            <Link
              href={getSubpageHref("profile")}
              onClick={(e) => handleTabClick("profile", e)}
              className={`group flex items-center justify-between p-3 rounded-xl text-xs transition-all duration-200 ${
                isTabActive("profile")
                  ? "bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 transition ${
                  isTabActive("profile")
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-teal-50 border-teal-100 text-teal-700"
                }`}>
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold leading-snug truncate">Profile & Identitas Diri</p>
                  <p className={`text-[10px] truncate ${isTabActive("profile") ? "text-teal-100" : "text-slate-400"}`}>
                    Edit nama, NIK, No. HP, dan foto profil
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition ${isTabActive("profile") ? "text-white" : "text-slate-400 group-hover:translate-x-0.5"}`} />
            </Link>

            {/* 2. Privacy & Security */}
            <Link
              href={getSubpageHref("security")}
              onClick={(e) => handleTabClick("security", e)}
              className={`group flex items-center justify-between p-3 rounded-xl text-xs transition-all duration-200 ${
                isTabActive("security")
                  ? "bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 transition ${
                  isTabActive("security")
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-amber-50 border-amber-100 text-amber-700"
                }`}>
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold leading-snug truncate">Privacy & Security</p>
                  <p className={`text-[10px] truncate ${isTabActive("security") ? "text-teal-100" : "text-slate-400"}`}>
                    Ubah kata sandi dan atur 6-digit PIN keamanan
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition ${isTabActive("security") ? "text-white" : "text-slate-400 group-hover:translate-x-0.5"}`} />
            </Link>

            {/* 3. Wallet & Web3 */}
            <Link
              href={getSubpageHref("wallet")}
              onClick={(e) => handleTabClick("wallet", e)}
              className={`group flex items-center justify-between p-3 rounded-xl text-xs transition-all duration-200 ${
                isTabActive("wallet")
                  ? "bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 transition ${
                  isTabActive("wallet")
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-purple-50 border-purple-100 text-purple-700"
                }`}>
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold leading-snug truncate">Wallet & Web3</p>
                  <p className={`text-[10px] truncate ${isTabActive("wallet") ? "text-teal-100" : "text-slate-400"}`}>
                    Tautkan dompet MetaMask & cek saldo ETH
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 shrink-0 transition ${isTabActive("wallet") ? "text-white" : "text-slate-400 group-hover:translate-x-0.5"}`} />
            </Link>
          </nav>
        </div>

        {/* Group 2: Data Medis & Riwayat Otorisasi (Pasien only) */}
        {user?.role === "pasien" && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2">
              Data Medis & Riwayat Otorisasi
            </p>

            <nav className="space-y-1">
              <Link
                href="/dashboard/pasien/consent/history"
                className="group flex items-center justify-between p-3 rounded-xl text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-blue-100 bg-blue-50 text-blue-700 shrink-0">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold leading-snug truncate">Riwayat Otorisasi (History)</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Log riwayat transaksi & izin akses blockchain
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
            </nav>
          </div>
        )}

      </div>

      {/* Footer / Group 3: Keluar Akun */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200/80 hover:bg-rose-50/80 text-rose-700 transition cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-extrabold text-xs truncate">Keluar Akun (Logout)</p>
              <p className="text-[10px] text-rose-500/90 truncate">Akhiri sesi login di perangkat ini</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-rose-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>
      </div>
    </aside>
  );
}
