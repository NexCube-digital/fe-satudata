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
  CreditCard,
  LucideIcon
} from "lucide-react";
import { apiGet, getAvatarUrl } from "@/lib/api";

interface ChildMenuItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | null;
  permission?: string;
}

interface MenuItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  dropdownKey?: string;
  badge?: string | null;
  permissionRequired?: string | string[];
  children?: ChildMenuItem[];
}

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Lazy initialize isCollapsed from localStorage synchronously on client to eliminate page transition jump/flicker
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });
  const [mounted, setMounted] = useState<boolean>(false);

  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);

  const [badgeCounts, setBadgeCounts] = useState<Record<string, string | null>>({
    users: null,
    logs: null,
    patients: null,
    hospitals: null,
    requests: null,
    records: null,
    consent: null
  });

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
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
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest(".floating-dropdown-container")) {
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sidebarCollapsedChanged"));
      }
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
      let currentUserObj: any = null;
      if (userData) {
        try { currentUserObj = JSON.parse(userData); } catch (e) {}
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
      } else if (currentUserObj?.id) {
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
  const getMenuItems = (): MenuItem[] => {
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

        const baseFaskesMenu: MenuItem[] = [
          { href: "/dashboard/faskes", label: "DASHBOARD", icon: Home, badge: badgeCounts.tokens || null },
          { href: "/dashboard/faskes/patient-flow", label: "FLOW PASIEN", badge: "Live", icon: Activity, permissionRequired: ["patient:create", "access_request:create", "access_request:read", "patient_flow:read"] },
          { 
            label: "KELOLA PASIEN", 
            icon: Users,
            permissionRequired: ["patient:create", "access_request:create", "access_request:read"],
            children: [
              { href: "/dashboard/faskes/patients", label: "Semua Data Pasien", badge: badgeCounts.patients || "Aktif", icon: Database },
              { href: "/dashboard/faskes/requests", label: "Tambah Data Pasien", badge: null, icon: UserPlus, permission: "patient:create" },
              { href: "/dashboard/faskes/requests/history", label: "Histori Permintaan", badge: badgeCounts.requests || "Baru", icon: History },
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
          const filtered: MenuItem[] = [];
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

  const isRouteActive = (currentPath: string, targetHref?: string) => {
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

    return currentPath.startsWith(targetHref);
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = getMenuItems();
  const roleHeader = getRoleHeader();
  const accountStatus = getAccountStatus();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-30 bg-white border-r border-slate-200 shadow-sm ${
        mounted ? "transition-all duration-300 ease-in-out" : ""
      } ${isCollapsed ? "w-20" : "w-64"}`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 flex items-center justify-center text-white shadow-md shadow-teal-900/20 shrink-0">
              <Zap className="h-5 w-5 fill-white/20" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  SATUDATA<span className="text-teal-700">MEDIS</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  EHR & Blockchain
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        {/* Dynamic Context Header */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className={`p-2.5 rounded-xl border bg-gradient-to-r ${roleHeader.bg}`}>
              <div className="text-[11px] font-black uppercase tracking-wider truncate">{roleHeader.title}</div>
              <div className="text-[9px] font-semibold opacity-75 truncate">{roleHeader.subtitle}</div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="space-y-1">
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children && item.children.length > 0);

                // Handling Parent Items with Collapsible Submenu
                if (hasChildren) {
                  const key = item.dropdownKey || `dropdown_${index}`;
                  const isOpen = Boolean(openDropdowns[key]);
                  const isAnyChildActive = item.children?.some(c => isRouteActive(pathname, c.href));

                  if (isCollapsed) {
                    const isHovered = activeHoverMenu === key;

                    return (
                      <div 
                        key={key} 
                        className="relative floating-dropdown-container flex justify-center"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHoverMenu(isHovered ? null : key);
                          }}
                          className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 ${
                            isAnyChildActive || isHovered
                              ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/20"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          title={item.label}
                        >
                          <Icon className="h-4 w-4" />
                        </button>

                        {/* Floating Submenu Popup for Collapsed Sidebar */}
                        {isHovered && (
                          <div className="absolute left-full top-0 ml-3 w-56 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-2 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                            <div className="px-3 py-2 border-b border-slate-100 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                            </div>
                            <div className="space-y-1">
                              {item.children?.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildActive = isRouteActive(pathname, child.href);
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setActiveHoverMenu(null)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                      isChildActive
                                        ? "bg-teal-50 text-teal-900 font-black"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      {ChildIcon && <ChildIcon className={`h-3.5 w-3.5 ${isChildActive ? "text-teal-700" : "text-slate-400"}`} />}
                                      <span className="truncate">{child.label}</span>
                                    </div>
                                    {child.badge && (
                                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
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

                  return (
                    <div key={key} className="space-y-1">
                      <button
                        onClick={() => toggleDropdown(key)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                          isAnyChildActive
                            ? "bg-teal-50/80 text-teal-900 border border-teal-100"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                            isAnyChildActive
                              ? "bg-teal-700 border-teal-600 text-white"
                              : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              isAnyChildActive
                                ? "bg-teal-200/60 text-teal-900"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Expandable Submenu */}
                      {isOpen && (
                        <div className="pl-9 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-5">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildItemActive = isRouteActive(pathname, child.href);

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                  isChildItemActive
                                    ? "bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-sm shadow-teal-900/10"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                      key={item.href || index}
                      href={item.href || "#"}
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
                    key={item.href || index}
                    href={item.href || "#"}
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
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
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
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
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
        {menuItems.slice(0, 5).map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.children && item.children.some((c) => pathname === c.href));
          const href = item.href || (item.children ? item.children[0].href : "#");
          return (
            <Link
              key={item.label || idx}
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
