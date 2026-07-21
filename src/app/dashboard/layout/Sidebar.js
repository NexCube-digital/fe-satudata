"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Stethoscope, 
  Activity, 
  User, 
  ShieldCheck,
  Zap
} from "lucide-react";

export default function Sidebar({ role }) {
  const pathname = usePathname();

  // Define menu items based on role
  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Overview", icon: Home, badge: null },
          { href: "/dashboard/admin/users", label: "Kelola Pengguna", icon: Users, badge: "1,334" },
          { href: "/dashboard/admin/logs", label: "Audit Trail", icon: FileText, badge: "Live" },
        ];
      case "faskes":
      case "rumah_sakit":
        return [
          { href: "/dashboard/faskes", label: "Dasbor Dokter", icon: Home, badge: null },
          { href: "/dashboard/faskes/patients", label: "Data Pasien", icon: Stethoscope, badge: "48 Hari Ini" },
          { href: "/dashboard/faskes/requests", label: "Request Akses", icon: Activity, badge: "3 New" },
        ];
      case "pasien":
      default:
        return [
          { href: "/dashboard/pasien", label: "Portal Kesehatan", icon: Home, badge: null },
          { href: "/dashboard/pasien/records", label: "Rekam Medis", icon: FileText, badge: "14 EHR" },
          { href: "/dashboard/pasien/consent", label: "Kelola Izin", icon: ShieldCheck, badge: "3 Aktif" },
        ];
    }
  };

  const getRoleHeader = () => {
    switch (role) {
      case "admin":
        return { title: "Admin Center", subtitle: "System Governance", bg: "from-rose-500/10 to-red-500/10 border-rose-200 text-rose-700" };
      case "faskes":
      case "rumah_sakit":
        return { title: "Hospital Portal", subtitle: "HIS & Medical POS", bg: "from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700" };
      case "pasien":
      default:
        return { title: "Patient Hub", subtitle: "Sovereign Health", bg: "from-pink-500/10 to-fuchsia-500/10 border-pink-200 text-pink-700" };
    }
  };

  const getAccountStatus = () => {
    switch (role) {
      case "admin":
        return { 
          title: "Administrator", 
          badge: "Aktif", 
          subtext: "Hak Akses System Admin",
          iconColor: "text-rose-600 bg-rose-50 border-rose-200" 
        };
      case "faskes":
      case "rumah_sakit":
        return { 
          title: "Fasilitas Kesehatan", 
          badge: "Terverifikasi", 
          subtext: "Hak Akses Faskes & RS",
          iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200" 
        };
      case "pasien":
      default:
        return { 
          title: "Pasien", 
          badge: "Aktif", 
          subtext: "Hak Akses Rekam Medis",
          iconColor: "text-rose-600 bg-rose-50 border-rose-200" 
        };
    }
  };

  const menuItems = getMenuItems();
  const roleHeader = getRoleHeader();
  const accountStatus = getAccountStatus();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-[65px] self-start h-[calc(100vh-65px)] w-64 border-r border-slate-200/80 bg-white/90 backdrop-blur-md hidden md:flex flex-col shrink-0 shadow-xs">
        {/* Scrollable Nav Content */}
        <div className="flex-1 p-5 space-y-6 overflow-y-auto min-h-0">
          {/* Role Chip Header */}
          <div className={`rounded-2xl border bg-gradient-to-r p-3.5 ${roleHeader.bg}`}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-extrabold uppercase tracking-wider">{roleHeader.title}</span>
            </div>
            <p className="text-[10px] font-semibold opacity-75 mt-0.5">{roleHeader.subtitle}</p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 px-3">
              Navigasi Utama
            </p>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-md shadow-rose-900/20"
                        : "text-slate-600 hover:bg-rose-50/90 hover:text-rose-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-rose-400" : "text-slate-400 group-hover:text-slate-700"
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isActive
                          ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Account Status Widget - Fixed at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2">
              <span className="uppercase tracking-wider text-[9px] text-slate-400 font-extrabold">Status Akun</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {accountStatus.badge}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg border ${accountStatus.iconColor}`}>
                <User className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold text-slate-800 truncate">{accountStatus.title}</p>
                <p className="text-[9px] text-slate-400 font-mono truncate">{accountStatus.subtext}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 flex items-center justify-around md:hidden shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
                isActive ? "text-rose-600 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
