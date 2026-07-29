"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  FileText, 
  Plus,
  Settings, 
  BarChart3, 
  Stethoscope, 
  Activity, 
  User, 
  ShieldCheck,
  Zap,
  ChevronDown,
  Database,
  UserPlus,
  History,
  MapPin,
  Building2,
  Clock
} from "lucide-react";
import { apiGet, getAvatarUrl } from "@/lib/api";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({
    users: null,
    logs: null,
    patients: null,
    hospitals: null,
    requests: null,
    records: null,
    consent: null
  });

  const [openDropdowns, setOpenDropdowns] = useState({
    patients: pathname.startsWith("/dashboard/faskes/patients") || pathname.startsWith("/dashboard/faskes/requests"),
    medicalRecords: pathname.startsWith("/dashboard/faskes/medical-records"),
    users: pathname.startsWith("/dashboard/admin/users"),
    doctors: pathname.startsWith("/dashboard/faskes/doctor"),
    geotagging: pathname.startsWith("/dashboard/admin/faskes"),
    consent: pathname.startsWith("/dashboard/pasien/consent")
  });

  useEffect(() => {
    const loadUserData = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try { setCurrentUser(JSON.parse(userData)); } catch (e) {}
      }
    };

    loadUserData();
    window.addEventListener("userUpdated", loadUserData);
    window.addEventListener("storage", loadUserData);
    return () => {
      window.removeEventListener("userUpdated", loadUserData);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  useEffect(() => {
    const fetchBadgeData = async () => {
      const userData = localStorage.getItem("user");
      let currentUser = null;
      if (userData) {
        try { currentUser = JSON.parse(userData); } catch (e) {}
      }

      if (role === "admin") {
        try {
          const res = await apiGet("/api/dashboard/admin/stats");
          if (res.success && res.data) {
            setBadgeCounts((prev) => ({
              ...prev,
              users: `${res.data.total_users || res.data.totalUsers || 0}`,
              logs: `${res.data.blockchain_transactions || res.data.totalLogs || 0}`,
              patients: `${res.data.total_patients || res.data.totalPatients || 0}`,
              hospitals: `${res.data.total_hospitals || res.data.totalHospitals || 0}`
            }));
          }
        } catch (e) {}
      } else if (role === "faskes" || role === "rumah_sakit") {
        try {
          const res = await apiGet("/api/dashboard/hospital/stats");
          if (res.success && res.data) {
            setBadgeCounts((prev) => ({
              ...prev,
              patients: res.data.izin_akses_disetujui !== undefined ? `${res.data.izin_akses_disetujui} EHR` : null,
              requests: res.data.request_pending !== undefined ? `${res.data.request_pending} Baru` : null,
              tokens: res.data.tokens !== undefined ? `${res.data.tokens} Token` : null
            }));
          }
        } catch (e) {}
      } else if (currentUser?.id) {
        try {
          const res = await apiGet("/api/dashboard/patient/stats");
          if (res.success && res.data) {
            setBadgeCounts((prev) => ({
              ...prev,
              records: res.data.total_documents !== undefined ? `${res.data.total_documents} EHR` : null,
              consent: res.data.connected_hospitals !== undefined ? `${res.data.connected_hospitals} Aktif` : null,
              pendingConsent: res.data.pending_requests !== undefined && res.data.pending_requests > 0 ? `${res.data.pending_requests} Baru` : null
            }));
          }
        } catch (e) {}
      }
    };

    fetchBadgeData();
  }, [role]);

  // Define menu items based on role
  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Overview", icon: Home, badge: null },
          { 
            label: "Kelola Pengguna", 
            icon: Users,
            dropdownKey: "users",
            badge: badgeCounts.users || "Aktif",
            children: [
              { href: "/dashboard/admin/users/pasien", label: "Akun Pasien", icon: User, badge: badgeCounts.patients },
              { href: "/dashboard/admin/users/faskes", label: "Akun Rumah Sakit", icon: Building2, badge: badgeCounts.hospitals }
            ]
          },
          { 
            label: "Geotagging Faskes", 
            icon: MapPin,
            dropdownKey: "geotagging",
            badge: null,
            children: [
              { href: "/dashboard/admin/faskes", label: "Semua Lokasi", icon: MapPin, badge: null },
              { href: "/dashboard/admin/faskes/add", label: "Tambah Titik Baru", icon: MapPin, badge: null }
            ]
          },
          { href: "/dashboard/admin/logs", label: "Audit Trail", icon: FileText, badge: badgeCounts.logs || "Live" },
        ];
      case "faskes":
      case "rumah_sakit":
        return [
          { href: "/dashboard/faskes", label: "Dasbor Dokter", icon: Home, badge: badgeCounts.tokens || null },
          { 
            label: "Kelola Dokter", 
            icon: Users,
            dropdownKey: "doctors",
            children: [
              { href: "/dashboard/faskes/doctor/list", label: "Semua Dokter", icon: Stethoscope },
              { href: "/dashboard/faskes/doctor/add", label: "Tambah Dokter", icon: UserPlus }
            ]
          },
          {
            label: "Rekam Medis",
            icon: FileText,
            dropdownKey: "medicalRecords",
            badge: badgeCounts.records || "EHR",
            children: [
              { href: "/dashboard/faskes/medical-records", label: "Semua Rekam Medis", icon: FileText },
              { href: "/dashboard/faskes/medical-records/upload", label: "Upload Baru", icon: Plus }
            ]
          },
          { 
            label: "Data Pasien", 
            icon: Stethoscope,
            children: [
              { href: "/dashboard/faskes/requests", label: "Tambah Data Pasien", badge: null, icon: UserPlus },
              { href: "/dashboard/faskes/patients", label: "Semua Data Pasien", badge: badgeCounts.patients || "Aktif", icon: Database },
            ]
          },
          { href: "/dashboard/faskes/requests/history", label: "Histori Permintaan", badge: badgeCounts.requests || "Baru", icon: History },
          { href: "/dashboard/faskes/audit", label: "Audit Log", badge: "Live", icon: ShieldCheck },
        ];
      case "pasien":
      default:
        return [
          { href: "/dashboard/pasien", label: "Portal Kesehatan", icon: Home, badge: null },
          { href: "/dashboard/pasien/records", label: "Rekam Medis", icon: FileText, badge: badgeCounts.records || "EHR" },
          { 
            label: "Kelola Izin", 
            icon: ShieldCheck,
            dropdownKey: "consent",
            children: [
              { href: "/dashboard/pasien/consent", label: "Permintaan Baru", icon: Clock, badge: badgeCounts.pendingConsent },
              { href: "/dashboard/pasien/consent/history", label: "Riwayat Otorisasi", icon: History, badge: badgeCounts.consent || "Aktif" }
            ]
          },
        ];
    }
  };

  const getRoleHeader = () => {
    switch (role) {
      case "admin":
        return { title: "Admin Center", subtitle: "System Governance", bg: "from-rose-500/10 to-red-500/10 border-rose-200 text-rose-700" };
      case "faskes":
      case "rumah_sakit":
        return { title: "Hospital Portal", subtitle: "HIS & Medical POS", bg: "from-rose-800/10 to-red-900/10 border-rose-900/20 text-rose-900" };
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
          iconColor: "text-rose-900 bg-rose-50 border-rose-200" 
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
      <aside className="sticky top-[57px] self-start h-[calc(100vh-57px)] w-64 border-r border-slate-100 bg-white hidden md:flex flex-col shrink-0" style={{boxShadow: "inset -1px 0 0 0 rgb(0 0 0 / 0.05)"}}>
        {/* Scrollable Nav Content */}
        <div className="flex-1 p-4 space-y-5 overflow-y-auto min-h-0">
          {/* Role Header */}
          <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r p-4 ${roleHeader.bg}`}>
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-wider">{roleHeader.title}</span>
                <p className="text-[9px] font-semibold opacity-70 tracking-wide uppercase mt-0.5">{roleHeader.subtitle}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-300 mb-3 px-2">
              Navigasi Utama
            </p>
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                if (item.children) {
                  const dropdownKey = item.dropdownKey || "patients";
                  const isOpen = openDropdowns[dropdownKey];
                  const isChildActive = item.children.some((child) => pathname === child.href);
                  return (
                    <div key={item.label} className="space-y-0.5">
                      <button
                        onClick={() => setOpenDropdowns((prev) => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                        className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isChildActive
                            ? "bg-rose-50 text-rose-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors ${
                            isChildActive
                              ? "bg-rose-100 border-rose-200 text-rose-800"
                              : "bg-slate-100 border-slate-200 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                              isChildActive
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="pl-4 space-y-0.5">
                          {item.children.map((child) => {
                            const isChildItemActive = pathname === child.href;
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                                  isChildItemActive
                                    ? "bg-gradient-to-r from-rose-800 to-rose-900 text-white shadow-sm shadow-rose-900/15"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {ChildIcon && (
                                    <ChildIcon className={`h-3.5 w-3.5 ${isChildItemActive ? "text-rose-300" : "text-slate-400 group-hover:text-slate-600"}`} />
                                  )}
                                  <span>{child.label}</span>
                                </div>
                                {child.badge && (
                                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                                    isChildItemActive
                                      ? "bg-white/20 text-white border border-white/30"
                                      : "bg-slate-100 text-slate-500 border border-slate-200"
                                  }`}>
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-rose-800 to-rose-900 text-white shadow-sm shadow-rose-900/15"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors ${
                        isActive
                          ? "bg-white/15 border-white/20 text-rose-200"
                          : "bg-slate-100 border-slate-200 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white border border-white/30"
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

        {/* Footer Account Widget */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Status Akun</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[9px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {accountStatus.badge}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-rose-700 to-rose-900 ring-2 ring-rose-500/20 shrink-0">
                {getAvatarUrl(currentUser) ? (
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={currentUser?.name || "Foto Profil"}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5 text-white" />}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-extrabold text-slate-800 truncate">{currentUser?.name || accountStatus.title}</p>
                <p className="text-[9px] text-slate-400 font-mono truncate">{currentUser?.email || accountStatus.subtext}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 py-2 px-4 flex items-center justify-around md:hidden" style={{boxShadow: "0 -1px 0 0 rgb(0 0 0 / 0.05), 0 -4px 16px -4px rgb(0 0 0 / 0.06)"}}>
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.children && item.children.some((c) => pathname === c.href));
          const href = item.href || (item.children ? item.children[0].href : "#");
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${
                isActive ? "text-rose-700 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                isActive ? "bg-rose-100 text-rose-800" : "text-slate-400"
              }`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="uppercase tracking-wide">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

