"use client";

import { useState, useEffect } from "react";
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
  Zap,
  ChevronDown,
  Database,
  UserPlus,
  History,
  MapPin,
  Building2
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
    users: pathname.startsWith("/dashboard/admin/users")
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
              patients: `${res.data.totalPatients || res.data.patientsCount || 0} Pasien`,
              requests: `${res.data.pendingRequests || res.data.consentRequestsCount || 0} Baru`
            }));
          }
        } catch (e) {}
      } else if (currentUser?.id) {
        try {
          const res = await apiGet(`/api/dashboard/patient/${currentUser.id}/stats`);
          if (res.success && res.data) {
            setBadgeCounts((prev) => ({
              ...prev,
              records: `${res.data.totalMedicalRecords || res.data.recordsCount || 0} EHR`,
              consent: `${res.data.activeConsents || res.data.consentCount || 0} Aktif`
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
          { href: "/dashboard/admin/faskes", label: "Geotagging Faskes", icon: MapPin, badge: null },
          { href: "/dashboard/admin/logs", label: "Audit Trail", icon: FileText, badge: badgeCounts.logs || "Live" },
        ];
      case "faskes":
      case "rumah_sakit":
        return [
          { href: "/dashboard/faskes", label: "Dasbor Dokter", icon: Home, badge: null },
          { 
            label: "Data Pasien", 
            icon: Stethoscope,
            children: [
              { href: "/dashboard/faskes/patients", label: "Semua Data Pasien", badge: badgeCounts.patients || "Aktif", icon: Database },
              { href: "/dashboard/faskes/requests", label: "Tambah Data Pasien", badge: null, icon: UserPlus },
              { href: "/dashboard/faskes/requests/history", label: "Histori Permintaan", badge: badgeCounts.requests || "Baru", icon: History }
            ]
          },
          { href: "/dashboard/faskes/doctor", label: "Kelola Dokter", icon: Users, badge: null },
        ];
      case "pasien":
      default:
        return [
          { href: "/dashboard/pasien", label: "Portal Kesehatan", icon: Home, badge: null },
          { href: "/dashboard/pasien/records", label: "Rekam Medis", icon: FileText, badge: badgeCounts.records || "EHR" },
          { href: "/dashboard/pasien/consent", label: "Kelola Izin", icon: ShieldCheck, badge: badgeCounts.consent || "Aktif" },
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
                if (item.children) {
                  const dropdownKey = item.dropdownKey || "patients";
                  const isOpen = openDropdowns[dropdownKey];
                  const isChildActive = item.children.some((child) => pathname === child.href);
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        onClick={() => setOpenDropdowns((prev) => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                        className={`group relative flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isChildActive
                            ? "bg-rose-50/80 text-rose-900 border border-rose-900/10"
                            : "text-slate-600 hover:bg-rose-50/90 hover:text-rose-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                            isChildActive ? "text-rose-800" : "text-slate-400 group-hover:text-slate-700"
                          }`} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                              isChildActive
                                ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="pl-9 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                                  isChildActive
                                    ? "bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-md shadow-rose-900/10"
                                    : "text-slate-600 hover:bg-rose-50/90 hover:text-rose-800"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {ChildIcon && <ChildIcon className={`h-3.5 w-3.5 ${isChildActive ? "text-rose-300" : "text-slate-400 group-hover:text-rose-800"}`} />}
                                  <span>{child.label}</span>
                                </div>
                                {child.badge && (
                                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                                    isChildActive
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
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
              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-rose-800 to-red-900 ring-2 ring-rose-500/20 shrink-0">
                {getAvatarUrl(currentUser) ? (
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={currentUser?.name || "Foto Profil"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-4 w-4 text-white" />}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold text-slate-800 truncate">{currentUser?.name || accountStatus.title}</p>
                <p className="text-[9px] text-slate-400 font-mono truncate">{currentUser?.email || accountStatus.subtext}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 flex items-center justify-around md:hidden shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.children && item.children.some((c) => pathname === c.href));
          const href = item.href || (item.children ? item.children[0].href : "#");
          return (
            <Link
              key={item.label}
              href={href}
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
