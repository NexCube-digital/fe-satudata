"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  FileText, 
  Plus,
  Stethoscope, 
  User, 
  ShieldCheck,
  Zap,
  Database,
  UserPlus,
  History,
  MapPin,
  Building2,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  X
} from "lucide-react";
import { apiGet, getAvatarUrl } from "@/lib/api";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({
    users: null,
    logs: null,
    patients: null,
    hospitals: null,
    requests: null,
    records: null,
    consent: null
  });

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

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
    window.addEventListener("userUpdated", fetchBadgeData);
    window.addEventListener("storage", fetchBadgeData);
    window.addEventListener("focus", fetchBadgeData);
    return () => {
      window.removeEventListener("userUpdated", fetchBadgeData);
      window.removeEventListener("storage", fetchBadgeData);
      window.removeEventListener("focus", fetchBadgeData);
    };
  }, [role]);

  // Define categorized menu sections based on role
  const getMenuSections = () => {
    switch (role) {
      case "admin":
        return [
          {
            title: "Umum",
            items: [
              { href: "/dashboard/admin", label: "Overview", icon: Home, badge: null },
              { href: "/dashboard/admin/logs", label: "Audit Trail", icon: FileText, badge: badgeCounts.logs || "Live" }
            ]
          },
          {
            title: "Master Data",
            items: [
              { href: "/dashboard/admin/users/pasien", label: "Akun Pasien", icon: User, badge: badgeCounts.patients },
              { href: "/dashboard/admin/users/faskes", label: "Akun Rumah Sakit", icon: Building2, badge: badgeCounts.hospitals },
              { href: "/dashboard/admin/faskes", label: "Titik Lokasi Faskes", icon: MapPin, badge: null }
            ]
          },
          {
            title: "Kelola Data",
            items: [
              { href: "/dashboard/admin/faskes/add", label: "Tambah Lokasi Baru", icon: Plus, badge: null }
            ]
          }
        ];
      case "faskes":
      case "rumah_sakit":
        return [
          {
            title: "Umum",
            items: [
              { href: "/dashboard/faskes", label: "DASHBOARD", icon: Home, badge: badgeCounts.tokens || null },
              { href: "/dashboard/faskes/requests", label: "REQUEST DATA", icon: UserPlus },
              { href: "/dashboard/faskes/requests/history", label: "HISTORY", icon: History, badge: badgeCounts.requests || "Baru" }
            ]
          },
          {
            title: "Master Data",
            items: [
              { href: "/dashboard/faskes/patients", label: "PATIENT", icon: Database, badge: badgeCounts.patients || "Aktif" },
              { href: "/dashboard/faskes/medical-records", label: "MEDICAL RECORDS", icon: FileText, badge: badgeCounts.records || "EHR" },
              //{ href: "/dashboard/faskes/doctor/list", label: "DOCTOR", icon: Stethoscope },
            ]
          },
        ];
      case "pasien":
      default:
        return [
          {
            title: "Umum",
            items: [
              { href: "/dashboard/pasien", label: "Portal Kesehatan", icon: Home, badge: null }
            ]
          },
          {
            title: "Master Data",
            items: [
              { href: "/dashboard/pasien/records", label: "Rekam Medis (EHR)", icon: FileText, badge: badgeCounts.records || "EHR" }
            ]
          },
          {
            title: "Kelola Data",
            items: [
              { href: "/dashboard/pasien/consent", label: "Permintaan Akses Baru", icon: Clock, badge: badgeCounts.pendingConsent },
              { href: "/dashboard/pasien/consent/history", label: "Riwayat Otorisasi", icon: History, badge: badgeCounts.consent || "Aktif" }
            ]
          }
        ];
    }
  };

  const getRoleHeader = () => {
    switch (role) {
      case "admin":
        return { title: "Admin Center", subtitle: "System Governance", bg: "from-[#0D9488]/15 to-[#0F766E]/15 border-teal-200 text-[#0F766E]" };
      case "faskes":
      case "rumah_sakit":
        return { title: "Hospital Portal", subtitle: "HIS & Medical POS", bg: "from-[#0D9488]/15 to-[#0F766E]/15 border-teal-200 text-[#0F766E]" };
      case "pasien":
      default:
        return { title: "Patient Hub", subtitle: "Sovereign Health", bg: "from-[#0D9488]/15 to-[#0F766E]/15 border-teal-200 text-[#0F766E]" };
    }
  };

  const getAccountStatus = () => {
    switch (role) {
      case "admin":
        return { 
          title: "Administrator", 
          badge: "Aktif", 
          subtext: "Hak Akses System Admin",
          iconColor: "text-[#0D9488] bg-[#E6F4F1] border-teal-200" 
        };
      case "faskes":
      case "rumah_sakit":
        return { 
          title: "Fasilitas Kesehatan", 
          badge: "Terverifikasi", 
          subtext: "Hak Akses Faskes & RS",
          iconColor: "text-[#0D9488] bg-[#E6F4F1] border-teal-200" 
        };
      case "pasien":
      default:
        return { 
          title: "Pasien", 
          badge: "Aktif", 
          subtext: "Hak Akses Rekam Medis",
          iconColor: "text-[#0D9488] bg-[#E6F4F1] border-teal-200" 
        };
    }
  };

  const menuSections = getMenuSections();
  const roleHeader = getRoleHeader();
  const accountStatus = getAccountStatus();
  const allMenuItems = menuSections.flatMap((section) => section.items);

  const getProfileHref = () => {
    switch (role) {
      case "admin": return "/dashboard/admin/settings";
      case "faskes":
      case "rumah_sakit": return "/dashboard/faskes/settings";
      case "pasien":
      default: return "/dashboard/pasien/settings";
    }
  };

  const filteredMenuItems = allMenuItems.filter(item => !item.href.includes("/history"));

  const mobileNavItems = [
    ...filteredMenuItems.slice(0, 3),
    { href: getProfileHref(), label: "PROFIL", icon: User, isProfile: true }
  ];

  const isSettingsPage = pathname?.includes("/settings") || pathname === "/dashboard/pasien/profile";

  return (
    <>
      {/* Desktop Sidebar */}
      {!isSettingsPage && (
        <aside className="sticky top-[57px] self-start h-[calc(100vh-57px)] w-64 border-r border-[#E2E8F0] bg-white hidden md:flex flex-col shrink-0" style={{boxShadow: "inset -1px 0 0 0 rgb(0 0 0 / 0.05)"}}>
          {/* Scrollable Nav Content */}
          <div className="flex-1 p-4 space-y-5 overflow-y-auto min-h-0">
            {/* Role Header */}
            <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r p-4 ${roleHeader.bg}`}>
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                  <Zap className="h-4 w-4 text-[#0D9488]" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider">{roleHeader.title}</span>
                  <p className="text-[9px] font-semibold opacity-70 tracking-wide uppercase mt-0.5">{roleHeader.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Categorized Navigation */}
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2.5 mb-1.5">
                  {section.title}
                </p>
                <nav className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white shadow-sm shadow-teal-900/15"
                            : "text-[#334155] hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors ${
                            isActive
                              ? "bg-white/15 border-white/20 text-teal-100"
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
            ))}
          </div>

          {/* Footer Account Widget */}
          <div className="p-3 border-t border-[#E2E8F0] shrink-0">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#64748B]">Status Akun</span>
                <span className="inline-flex items-center gap-1 text-[#0D9488] font-bold text-[9px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488] animate-pulse" />
                  {accountStatus.badge}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-[#0D9488] to-[#0F766E] ring-2 ring-teal-500/20 shrink-0">
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
                  <p className="text-[11px] font-extrabold text-[#334155] truncate">{currentUser?.name || accountStatus.title}</p>
                  <p className="text-[9px] text-[#64748B] font-mono truncate">{currentUser?.email || accountStatus.subtext}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] py-2 px-2 sm:px-4 flex items-center justify-around md:hidden" style={{boxShadow: "0 -1px 0 0 rgb(0 0 0 / 0.05), 0 -4px 16px -4px rgb(0 0 0 / 0.06)"}}>
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.isProfile && pathname?.includes("/settings"));
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-all ${
                isActive ? "text-[#0D9488] scale-105" : "text-[#64748B] hover:text-slate-800"
              }`}
            >
              <div className={`relative h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                isActive ? "bg-[#E6F4F1] text-[#0D9488]" : "text-slate-400"
              }`}>
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 z-10 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-extrabold shadow-sm ring-2 ring-white animate-pulse">
                    {item.badge.replace(/[^0-9]/g, "") || "!"}
                  </span>
                )}
                {item.isProfile ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] ring-2 ring-teal-500/30 shrink-0">
                    {getAvatarUrl(currentUser) ? (
                      <img
                        src={getAvatarUrl(currentUser)}
                        alt={currentUser?.name || "Foto Profil"}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] font-extrabold text-white">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                      </div>
                    )}
                  </div>
                ) : (
                  <Icon className="h-4.5 w-4.5" />
                )}
              </div>
              <span className="uppercase tracking-wide text-[8px] sm:text-[9px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
