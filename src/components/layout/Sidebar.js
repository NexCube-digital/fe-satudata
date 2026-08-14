"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Pill,
  ShoppingCart,
  Package,
  Lock,
  DollarSign,
  CreditCard
} from "lucide-react";
import { apiGet, getAvatarUrl } from "@/lib/api";

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  // Lazy initialize isCollapsed from localStorage synchronously on client to eliminate page transition jump/flicker
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);

  const [activeHoverMenu, setActiveHoverMenu] = useState(null);

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
    consent: pathname.startsWith("/dashboard/pasien/consent"),
    pharmacy: pathname.startsWith("/dashboard/faskes/pharmacy"),
    masterData: pathname.startsWith("/dashboard/faskes/finance/tarif-layanan") || pathname.startsWith("/dashboard/faskes/finance/pelayanan-medis") || pathname.startsWith("/dashboard/faskes/finance/layanan") || pathname.startsWith("/dashboard/faskes/finance/ruangan"),
    finance: pathname.startsWith("/dashboard/faskes/finance/invoice") || pathname.startsWith("/dashboard/faskes/finance/history")
  });

  // Enable CSS transitions after initial render mount
  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed") === "true";
    setIsCollapsed(stored);
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Close floating dropdown popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".floating-dropdown-container")) {
        setActiveHoverMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const nextState = !prev;
      localStorage.setItem("sidebarCollapsed", String(nextState));
      return nextState;
    });
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
      } else if (role === "faskes" || role === "rumah_sakit" || role === "staf_rs") {
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
      case "staf_rs":
        const userPerms = currentUser?.staff_profile?.permissions || currentUser?.permissions || null;
        const isStaff = currentUser?.role === "staf_rs";

        const baseFaskesMenu = [
          { href: "/dashboard/faskes", label: "DASHBOARD", icon: Home, badge: badgeCounts.tokens || null },
          { href: "/dashboard/faskes/patient-flow", label: "FLOW PASIEN", badge: "Live", icon: Activity, permissionRequired: ["patient:create", "access_request:create", "access_request:read", "patient_flow:read"] },
          { 
            label: "KELOLA PASIEN", 
            icon: Users,
            permissionRequired: ["patient:create", "access_request:create", "access_request:read"],
            children: [
              { href: "/dashboard/faskes/patients", label: "Semua Data Pasien", badge: badgeCounts.patients || "Aktif", icon: Database },
              { href: "/dashboard/faskes/requests", label: "Tambah Data Pasien", badge: null, icon: UserPlus, permission: "patient:create" },
              { href: "/dashboard/faskes/requests/history", label: "Histori Permintaan", badge: badgeCounts.requests || "Baru", icon: History, permissionRequired: "access_request:read" },
            ]
          },
          { 
            label: "KELOLA DOKTER", 
            icon: Stethoscope,
            dropdownKey: "doctors",
            permissionRequired: ["staff:manage", "role:manage"],
            children: [
              { href: "/dashboard/faskes/doctor/list", label: "Semua Dokter", icon: Stethoscope },
              { href: "/dashboard/faskes/doctor/add", label: "Tambah Dokter", icon: UserPlus },
              { href: "/dashboard/faskes/doctor/specialties", label: "Kelola Spesialisasi", icon: Activity }
            ]
          },
          {
            label: "KELOLA REKAM MEDIS",
            icon: FileText,
            dropdownKey: "medicalRecords",
            badge: badgeCounts.records || "EHR",
            permissionRequired: ["medical_record:upload", "medical_record:read"],
            children: [
              { href: "/dashboard/faskes/medical-records", label: "Semua Rekam Medis", icon: FileText, permission: "medical_record:read" },
              { href: "/dashboard/faskes/medical-records/upload", label: "Upload Baru", icon: Plus, permission: "medical_record:upload" },
            ]
          },
          { 
            label: "KELOLA FARMASI", 
            icon: Pill,
            dropdownKey: "pharmacy",
            badge: "POS",
            permissionRequired: ["pharmacy:manage", "pharmacy:pos"],
            children: [
              { href: "/dashboard/faskes/pharmacy/prescriptions", label: "Antrean Resep", icon: FileText, permission: "pharmacy:manage" },
              { href: "/dashboard/faskes/pharmacy/pos", label: "Kasir POS Obat", icon: ShoppingCart, permission: "pharmacy:pos" },
              { href: "/dashboard/faskes/pharmacy/inventory", label: "Katalog & Stok Obat", icon: Package, permission: "pharmacy:manage" },
              { href: "/dashboard/faskes/pharmacy/sales-history", label: "Riwayat Transaksi POS", icon: History, permission: "pharmacy:pos" }
            ]
          },
          { 
            label: "KELOLA DATA UMUM", 
            icon: Database,
            dropdownKey: "masterData",
            badge: "Master",
            permissionRequired: ["master_data:read", "finance:read", "staff:manage", "role:manage"],
            children: [
              { href: "/dashboard/faskes/finance/layanan", label: "Unit Layanan", icon: Building2, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/pelayanan-medis", label: "Tarif Layanan Medis", icon: Stethoscope, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/tarif-layanan", label: "Tarif Layanan Klinik", icon: DollarSign, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/ruangan", label: "Kelola Ruangan", icon: Building2, permission: "master_data:read" }
            ]
          },
          { 
            label: "KELOLA KEUANGAN", 
            icon: DollarSign,
            dropdownKey: "finance",
            badge: "Finance",
            permissionRequired: ["finance:manage", "finance:read", "staff:manage", "role:manage"],
            children: [
              { href: "/dashboard/faskes/finance/invoice", label: "Invoice & Tagihan", icon: CreditCard, permission: "finance:manage" },
              { href: "/dashboard/faskes/finance/history", label: "Riwayat Invoice Pasien", icon: History, permission: "finance:read" }
            ]
          },
          { href: "/dashboard/faskes/staffs", label: "STAFF MEDIS", badge: "RBAC", icon: ShieldCheck, permissionRequired: ["staff:manage", "role:manage"] },
          { href: "/dashboard/faskes/audit", label: "AUDIT", badge: "Live", icon: History, permissionRequired: ["staff:manage", "role:manage"] },
        ];

        if (Array.isArray(userPerms)) {
          const filtered = [];
          baseFaskesMenu.forEach(item => {
            if (item.permissionRequired) {
              const reqs = Array.isArray(item.permissionRequired) ? item.permissionRequired : [item.permissionRequired];
              if (!reqs.some(p => userPerms.includes(p))) return;
            }

            if (item.children) {
              const filteredChildren = item.children.filter(child => {
                if (!child.permission) return true;
                return userPerms.includes(child.permission);
              });
              if (filteredChildren.length === 0) return;

              if (isStaff) {
                // Untuk Staf RS: Keluarkan menu dari dropdown menjadi menu utama terpisah
                filteredChildren.forEach(child => {
                  filtered.push({
                    href: child.href,
                    label: child.label,
                    icon: child.icon || item.icon,
                    badge: child.badge || null
                  });
                });
              } else {
                // Untuk Admin RS (rumah_sakit): Tetap dalam dropdown
                filtered.push({ ...item, children: filteredChildren });
              }
            } else {
              filtered.push(item);
            }
          });
          return filtered;
        }

        return baseFaskesMenu;
      case "pasien":
      default:
        return [
          { href: "/dashboard/pasien", label: "Portal Kesehatan", icon: Home, badge: null },
          { href: "/dashboard/pasien/consent", label: "Permintaan Baru", icon: ShieldCheck, badge: badgeCounts.pendingConsent },
          { href: "/dashboard/pasien/records", label: "Rekam Medis Baru", icon: FileText, badge: badgeCounts.records || "EHR" },
          { href: "/dashboard/pasien/history", label: "Riwayat Terpadu", icon: History, badge: "Histori" }
        ];
    }
  };

  const getRoleHeader = () => {
    switch (role) {
      case "admin":
        return { title: "Admin Center", subtitle: "System Governance", bg: "from-teal-700/10 to-cyan-800/10 border-teal-200 text-teal-800" };
      case "staf_rs":
        return { 
          title: currentUser?.staff_profile?.role_name || "Staf Faskes", 
          subtitle: currentUser?.staff_profile?.hospital_name || "Hospital Sub-Account", 
          bg: "from-teal-800/10 to-cyan-900/10 border-teal-900/20 text-teal-900" 
        };
      case "faskes":
      case "rumah_sakit":
        return { title: "Hospital Portal", subtitle: "HIS & Medical POS", bg: "from-teal-800/10 to-cyan-900/10 border-teal-900/20 text-teal-900" };
      case "pasien":
      default:
        return { title: "Patient Hub", subtitle: "Sovereign Health", bg: "from-teal-700/10 to-cyan-700/10 border-teal-200 text-teal-800" };
    }
  };

  const getAccountStatus = () => {
    switch (role) {
      case "admin":
        return { 
          title: "Administrator", 
          badge: "Aktif", 
          subtext: "Hak Akses System Admin",
          iconColor: "text-teal-700 bg-teal-50 border-teal-200" 
        };
      case "staf_rs":
        return { 
          title: currentUser?.staff_profile?.role_name || "Staf RS", 
          badge: "Sub-Akun", 
          subtext: currentUser?.staff_profile?.position || "Staf Operasional Faskes",
          iconColor: "text-teal-900 bg-teal-50 border-teal-200" 
        };
      case "faskes":
      case "rumah_sakit":
        return { 
          title: "Fasilitas Kesehatan", 
          badge: "Terverifikasi", 
          subtext: "Hak Akses Super Admin Faskes",
          iconColor: "text-teal-900 bg-teal-50 border-teal-200" 
        };
      case "pasien":
      default:
        return { 
          title: "Pasien", 
          badge: "Aktif", 
          subtext: "Hak Akses Rekam Medis",
          iconColor: "text-teal-700 bg-teal-50 border-teal-200" 
        };
    }
  };

  const isRouteActive = (currentPath, targetHref) => {
    if (!currentPath || !targetHref) return false;
    if (currentPath === targetHref) return true;

    // Root dashboard hubs exact match check
    if (targetHref === "/dashboard/admin" || targetHref === "/dashboard/faskes" || targetHref === "/dashboard/pasien") {
      return currentPath === targetHref;
    }

    // Exclude distinct sub-menu routes that share a path prefix with shorter parent menu hrefs
    if (targetHref === "/dashboard/faskes/requests" && currentPath.startsWith("/dashboard/faskes/requests/history")) {
      return false;
    }
    if (targetHref === "/dashboard/faskes/medical-records" && 
       (currentPath.startsWith("/dashboard/faskes/medical-records/upload") ||
        currentPath.startsWith("/dashboard/faskes/medical-records/layanan") ||
        currentPath.startsWith("/dashboard/faskes/medical-records/invoice"))) {
      return false;
    }
    if (targetHref === "/dashboard/faskes/finance/pelayanan-medis" && 
       (currentPath.startsWith("/dashboard/faskes/finance/tarif-layanan") ||
        currentPath.startsWith("/dashboard/faskes/finance/layanan-penunjang") ||
        currentPath.startsWith("/dashboard/faskes/finance/ruangan") ||
        currentPath.startsWith("/dashboard/faskes/finance/invoice") ||
        currentPath.startsWith("/dashboard/faskes/finance/history"))) {
      return false;
    }
    if (targetHref === "/dashboard/faskes/finance/tarif-layanan" && 
       (currentPath.startsWith("/dashboard/faskes/finance/layanan-penunjang") ||
        currentPath.startsWith("/dashboard/faskes/finance/ruangan") ||
        currentPath.startsWith("/dashboard/faskes/finance/invoice") ||
        currentPath.startsWith("/dashboard/faskes/finance/history"))) {
      return false;
    }
    if (targetHref === "/dashboard/faskes/finance/layanan-penunjang" && 
       (currentPath.startsWith("/dashboard/faskes/finance/layanan") ||
        currentPath.startsWith("/dashboard/faskes/finance/ruangan") ||
        currentPath.startsWith("/dashboard/faskes/finance/invoice") ||
        currentPath.startsWith("/dashboard/faskes/finance/history"))) {
      return false;
    }
    if (targetHref === "/dashboard/faskes/finance/layanan" && 
       (currentPath.startsWith("/dashboard/faskes/finance/tarif-layanan") ||
        currentPath.startsWith("/dashboard/faskes/finance/pelayanan-medis") ||
        currentPath.startsWith("/dashboard/faskes/finance/layanan-penunjang") ||
        currentPath.startsWith("/dashboard/faskes/finance/ruangan") ||
        currentPath.startsWith("/dashboard/faskes/finance/invoice") ||
        currentPath.startsWith("/dashboard/faskes/finance/history"))) {
      return false;
    }
    if (targetHref === "/dashboard/faskes/finance/ruangan" && 
       (currentPath.startsWith("/dashboard/faskes/finance/layanan") ||
        currentPath.startsWith("/dashboard/faskes/finance/invoice") ||
        currentPath.startsWith("/dashboard/faskes/finance/history"))) {
      return false;
    }
    if (targetHref === "/dashboard/admin/faskes" && currentPath.startsWith("/dashboard/admin/faskes/add")) {
      return false;
    }
    if (targetHref === "/dashboard/pasien/consent" && currentPath.startsWith("/dashboard/pasien/consent/history")) {
      return false;
    }
    if (targetHref === "/dashboard/pasien/records" && currentPath.startsWith("/dashboard/pasien/records/history")) {
      return false;
    }

    return currentPath.startsWith(targetHref + "/");
  };

  const menuItems = getMenuItems();
  const roleHeader = getRoleHeader();
  const accountStatus = getAccountStatus();

  return (
    <>
      {/* Desktop & Tablet Collapsible Sidebar Container */}
      <aside 
        className={`hidden md:flex flex-col sticky top-[61px] h-[calc(100vh-61px)] border-r border-slate-200/80 bg-white shadow-xs z-30 shrink-0 select-none ${
          mounted ? "transition-all duration-300 ease-in-out" : ""
        } ${isCollapsed ? "w-20" : "w-64"}`} 
        style={{boxShadow: "inset -1px 0 0 0 rgb(0 0 0 / 0.05)"}}
      >
        {/* Top Header & Collapse Toggle Button */}
        <div className={`p-3 border-b border-slate-100 flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pl-1 whitespace-nowrap overflow-hidden transition-opacity duration-300">
              Navigasi Dashboard
            </span>
          )}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? "Tampilkan Sidebar Lengkap (Show)" : "Sembunyikan Teks Sidebar (Hide)"}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-800 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Scrollable Nav Content (overflow-visible when collapsed to prevent popup clipping) */}
        <div className={`flex-1 p-3 space-y-4 ${isCollapsed ? "overflow-visible" : "overflow-y-auto"} min-h-0 scrollbar-none`}>
          {/* Role Header Banner */}
          {!isCollapsed ? (
            <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r p-3.5 transition-all duration-300 ${roleHeader.bg}`}>
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              <div className="relative flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 border border-white/30 shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider truncate">{roleHeader.title}</span>
                  <p className="text-[9px] font-semibold opacity-70 tracking-wide uppercase mt-0.5 truncate">{roleHeader.subtitle}</p>
                </div>
              </div>
            </div>
          ) : (
            <div 
              title={`${roleHeader.title} - ${roleHeader.subtitle}`} 
              className={`flex h-10 w-10 mx-auto items-center justify-center rounded-2xl border bg-gradient-to-r transition-all duration-300 ${roleHeader.bg}`}
            >
              <Zap className="h-4 w-4" />
            </div>
          )}

          <div>
            {!isCollapsed ? (
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-300 mb-2 px-2 whitespace-nowrap">
                Navigasi Utama
              </p>
            ) : (
              <div className="w-8 h-px bg-slate-200 mx-auto mb-3" />
            )}

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                // Handling Dropdown Items
                if (item.children) {
                  const dropdownKey = item.dropdownKey || "patients";
                  const isOpen = openDropdowns[dropdownKey];
                  const isChildActive = item.children.some((child) => isRouteActive(pathname, child.href));

                  // COLLAPSED MODE: FLOATING DROPDOWN POPOVER ONLY ON CLICK
                  if (isCollapsed) {
                    const isOpenMenu = activeHoverMenu === dropdownKey;

                    const handleDropdownIconClick = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveHoverMenu(prev => (prev === dropdownKey ? null : dropdownKey));
                    };

                    return (
                      <div 
                        key={item.label} 
                        className="relative floating-dropdown-container"
                      >
                        <button
                          type="button"
                          onClick={handleDropdownIconClick}
                          title={item.label}
                          className={`flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-200 cursor-pointer ${
                            isChildActive || isOpenMenu
                              ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/20"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>

                        {/* FLOATING SUB-MENU POPOVER (Only visible when clicked) */}
                        {isOpenMenu && (
                          <div className="absolute left-full top-0 ml-3 z-50 w-56 rounded-2xl bg-white border border-slate-200/90 p-2.5 shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95 duration-150">
                            {/* Popover Header */}
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 mb-1.5">
                              <div className="h-6 w-6 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-extrabold text-slate-900 truncate">{item.label}</span>
                            </div>

                            {/* Floating Sub-items */}
                            <div className="space-y-0.5">
                              {item.children.map((child) => {
                                const isChildItemActive = isRouteActive(pathname, child.href);
                                const ChildIcon = child.icon;
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setActiveHoverMenu(null)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                      isChildItemActive
                                        ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/15"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      {ChildIcon && <ChildIcon className={`h-3.5 w-3.5 shrink-0 ${isChildItemActive ? "text-teal-200" : "text-slate-400"}`} />}
                                      <span className="truncate">{child.label}</span>
                                    </div>
                                    {child.badge && (
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                        isChildItemActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                      }`}>
                                        {child.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // EXPANDED FULL MODE
                  return (
                    <div key={item.label} className="space-y-0.5">
                      <button
                        onClick={() => setOpenDropdowns((prev) => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }))}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isChildActive
                            ? "bg-teal-50 text-teal-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                            isChildActive
                              ? "bg-teal-100 border-teal-200 text-teal-800"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                              isChildActive
                                ? "bg-teal-100 text-teal-800 border border-teal-200"
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
                            const isChildItemActive = isRouteActive(pathname, child.href);
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                                  isChildItemActive
                                    ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-sm shadow-teal-900/15"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {ChildIcon && (
                                    <ChildIcon className={`h-3.5 w-3.5 shrink-0 ${isChildItemActive ? "text-teal-200" : "text-slate-400"}`} />
                                  )}
                                  <span className="truncate">{child.label}</span>
                                </div>
                                {child.badge && (
                                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold shrink-0 ${
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

                // Handling Single Link Items
                const isActive = isRouteActive(pathname, item.href);

                if (isCollapsed) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-sm shadow-teal-900/15"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                        isActive
                          ? "bg-white/15 border-white/20 text-teal-200"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0 ${
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
          {!isCollapsed ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Status Akun</span>
                <span className="inline-flex items-center gap-1 text-[#16A34A] font-bold text-[9px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                  {accountStatus.badge}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-teal-700 to-cyan-800 ring-2 ring-teal-500/20 shrink-0">
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
          ) : (
            <div 
              title={`${currentUser?.name || accountStatus.title} (${currentUser?.email || accountStatus.badge})`} 
              className="flex items-center justify-center"
            >
              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-teal-700 to-cyan-800 ring-2 ring-teal-500/20 flex items-center justify-center">
                {getAvatarUrl(currentUser) ? (
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={currentUser?.name || "Foto Profil"}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-4 w-4 text-white" />}
                  </span>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#16A34A] ring-1 ring-white" />
              </div>
            </div>
          )}
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
                isActive ? "text-teal-800 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                isActive ? "bg-teal-100 text-teal-800" : "text-slate-400"
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
