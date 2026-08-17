"use client";

import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import SearchableSelect, { SearchableOption } from "@/components/ui/SearchableSelect";
import { 
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
  ChevronLeft,
  Pill,
  ShoppingCart,
  Package,
  Lock,
  DollarSign,
  CreditCard,
  Search,
  X,
  LucideIcon,
  Home,
  FileText,
  Plus,
  Users
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
  category?: string;
  dropdownKey?: string;
  badge?: string | null;
  permissionRequired?: string | string[];
  children?: ChildMenuItem[];
}

interface SidebarProps {
  role?: string;
}

function isRouteActive(currentPath: string, targetHref?: string) {
  if (!currentPath || !targetHref) return false;
  if (currentPath === targetHref) return true;

  if (targetHref === "/dashboard/admin" || targetHref === "/dashboard/faskes" || targetHref === "/dashboard/pasien") {
    return currentPath === targetHref;
  }

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
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebarCollapsed") === "true";
    if (stored) {
      setIsCollapsed(true);
    }
  }, []);

  const [badgeCounts, setBadgeCounts] = useState<Record<string, string | null>>({
    users: null,
    logs: null,
    patients: null,
    hospitals: null,
    requests: null,
    records: null,
    consent: null
  });

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() => {
    const p = pathname || "";
    return {
      patients: p.startsWith("/dashboard/faskes/patients") || p.startsWith("/dashboard/faskes/requests"),
      medicalRecords: p.startsWith("/dashboard/faskes/medical-records"),
      users: p.startsWith("/dashboard/admin/users"),
      doctors: p.startsWith("/dashboard/faskes/doctor"),
      geotagging: p.startsWith("/dashboard/admin/faskes"),
      consent: p.startsWith("/dashboard/pasien/consent"),
      pharmacy: p.startsWith("/dashboard/faskes/pharmacy"),
      masterData: p.startsWith("/dashboard/faskes/finance/tarif-layanan") || p.startsWith("/dashboard/faskes/finance/pelayanan-medis") || p.startsWith("/dashboard/faskes/finance/layanan") || p.startsWith("/dashboard/faskes/finance/ruangan"),
      finance: p.startsWith("/dashboard/faskes/finance/invoice") || p.startsWith("/dashboard/faskes/finance/history")
    };

  });

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebarCollapsed") === "true";
    if (stored) {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutsideSearch = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

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

  const getMenuItems = (): MenuItem[] => {
    switch (role) {
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Overview", icon: Home, category: "MENU UTAMA", badge: null },
          { 
            label: "Kelola Pengguna", 
            icon: Users,
            category: "MANAJEMEN SISTEM",
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
            category: "MANAJEMEN SISTEM",
            dropdownKey: "geotagging",
            badge: null,
            children: [
              { href: "/dashboard/admin/faskes", label: "Semua Lokasi", icon: MapPin, badge: null },
              { href: "/dashboard/admin/faskes/add", label: "Tambah Titik Baru", icon: MapPin, badge: null }
            ]
          },
          { href: "/dashboard/admin/logs", label: "Audit Trail", category: "AUDIT & UTILITY", icon: FileText, badge: badgeCounts.logs || "Live" },
        ];
      case "faskes":
      case "rumah_sakit":
      case "staf_rs":
        const userPerms = currentUser?.staff_profile?.permissions || currentUser?.permissions || null;
        const isStaff = currentUser?.role === "staf_rs";

        const baseFaskesMenu: MenuItem[] = [
          { href: "/dashboard/faskes", label: "DASHBOARD", icon: Home, category: "MENU UTAMA", badge: badgeCounts.tokens || null },
          { href: "/dashboard/faskes/patient-flow", label: "FLOW PASIEN", category: "MENU UTAMA", badge: "Live", icon: Activity, permissionRequired: ["patient:create", "access_request:create", "access_request:read", "patient_flow:read"] },
          { 
            label: "KELOLA PASIEN", 
            icon: Users,
            category: "PELAYANAN MEDIS",
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
            category: "PELAYANAN MEDIS",
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
            category: "PELAYANAN MEDIS",
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
            category: "FARMASI & APOTEK",
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
            category: "DATA & KEUANGAN",
            dropdownKey: "masterData",
            badge: "Master",
            permissionRequired: ["master_data:read", "finance:read", "staff:manage", "role:manage"],
            children: [
              { href: "/dashboard/faskes/finance/layanan", label: "Unit Layanan", icon: Building2, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/pelayanan-medis", label: "Tarif Layanan Medis", icon: Stethoscope, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/tarif-layanan", label: "Tarif Layanan Klinik", icon: DollarSign, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/ruangan", label: "Kelola Ruangan", icon: Building2, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/nonmedis/layanannonmedis", label: "Layanan Non Medis", icon: Activity, permission: "master_data:read" },
              { href: "/dashboard/faskes/finance/nonmedis/tariflayanan", label: "Tarif Layanan", icon: DollarSign, permission: "master_data:read" }
            ]
          },
          { 
            label: "KELOLA KEUANGAN", 
            icon: DollarSign,
            category: "DATA & KEUANGAN",
            dropdownKey: "finance",
            badge: "Finance",
            permissionRequired: ["finance:manage", "finance:read", "staff:manage", "role:manage"],
            children: [
              { href: "/dashboard/faskes/finance/invoice", label: "Invoice & Tagihan", icon: CreditCard, permission: "finance:manage" },
              { href: "/dashboard/faskes/finance/history", label: "Riwayat Invoice Pasien", icon: History, permission: "finance:read" }
            ]
          },
          { href: "/dashboard/faskes/staffs", label: "STAFF MEDIS", category: "MANAJEMEN RS", badge: "RBAC", icon: ShieldCheck, permissionRequired: ["staff:manage", "role:manage"] },
          { href: "/dashboard/faskes/audit", label: "AUDIT", category: "MANAJEMEN RS", badge: "Live", icon: History, permissionRequired: ["staff:manage", "role:manage"] },
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
                filteredChildren.forEach(child => {
                  filtered.push({
                    href: child.href,
                    label: child.label,
                    icon: child.icon || item.icon,
                    category: item.category,
                    badge: child.badge || null
                  });
                });
              } else {
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
          { href: "/dashboard/pasien", label: "Portal Kesehatan", icon: Home, category: "MENU UTAMA", badge: null },
          { href: "/dashboard/pasien/consent", label: "Permintaan Baru", icon: ShieldCheck, category: "REKAM MEDIS PASIEN", badge: badgeCounts.pendingConsent },
          { href: "/dashboard/pasien/records", label: "Rekam Medis Baru", icon: FileText, category: "REKAM MEDIS PASIEN", badge: badgeCounts.records || "EHR" },
          { href: "/dashboard/pasien/history", label: "Riwayat Terpadu", icon: History, category: "REKAM MEDIS PASIEN", badge: "Histori" }
        ];
    }
  };

  useEffect(() => {
    const items = getMenuItems();
    setOpenDropdowns((prev) => {
      const next = { ...prev };
      let updated = false;

      items.forEach((item, index) => {
        if (item.children && item.children.length > 0) {
          const key = item.dropdownKey || `dropdown_${index}`;
          const isChildActive = item.children.some((child) => isRouteActive(pathname || "", child.href));
          if (isChildActive && !next[key]) {
            next[key] = true;
            updated = true;
          }
        }
      });

      return updated ? next : prev;
    });
  }, [pathname, role]);

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

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebarCollapsed", String(nextState));
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sidebarCollapsedChanged"));
      }
    }, 0);
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

  const searchableMenuOptions: SearchableOption[] = useMemo(() => {
    const opts: SearchableOption[] = [];
    menuItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          opts.push({
            value: child.href,
            label: `${item.label} → ${child.label}`,
            badge: child.badge || undefined,
          });
        });
      } else if (item.href) {
        opts.push({
          value: item.href,
          label: item.label,
          badge: item.badge || undefined,
        });
      }
    });
    return opts;
  }, [menuItems]);

  const filteredSearchOptions = useMemo(() => {
    if (!sidebarSearchQuery.trim()) return searchableMenuOptions;
    const q = sidebarSearchQuery.toLowerCase().trim();
    return searchableMenuOptions.filter((opt) =>
      String(opt.label).toLowerCase().includes(q)
    );
  }, [searchableMenuOptions, sidebarSearchQuery]);

  const searchQuery = sidebarSearchQuery.toLowerCase().trim();
  const filteredMenuItems = searchQuery
    ? menuItems
        .filter((item) => {
          const parentMatch = item.label.toLowerCase().includes(searchQuery);
          const childMatch = item.children?.some((c) =>
            c.label.toLowerCase().includes(searchQuery)
          );
          return parentMatch || childMatch;
        })
        .map((item) => {
          if (item.children) {
            const parentMatch = item.label.toLowerCase().includes(searchQuery);
            if (parentMatch) return item;
            return {
              ...item,
              children: item.children.filter((c) =>
                c.label.toLowerCase().includes(searchQuery)
              ),
            };
          }
          return item;
        })
    : menuItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm overflow-visible ${
          mounted ? "transition-all duration-300 ease-in-out" : "transition-none"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        
        {/* Floating Outer Edge Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="absolute -right-3.5 top-20 z-[60] h-7 w-7 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-teal-700 hover:border-teal-400 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          title={isCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
          aria-label={isCollapsed ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-cyan-800 shadow-md shadow-teal-900/20 ring-1 ring-teal-700/30 shrink-0 overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={24}
                height={24}
                className="relative z-10 h-6 w-6 object-contain brightness-0 invert"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  Satu Data
                </span>
                <span className="text-[9px] font-bold text-teal-700 uppercase tracking-wider truncate">
                  {roleHeader.title}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Direct Sidebar Search Input Form with Instant Dropdown Options */}
        {!isCollapsed ? (
          <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50 shrink-0 relative" ref={searchContainerRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-teal-700 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari menu / fitur..."
                value={sidebarSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSidebarSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsSearchOpen(false);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-hidden transition shadow-2xs font-medium"
              />
              {sidebarSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSidebarSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Instant Dropdown Suggestions Popup */}
            {isSearchOpen && (
              <div className="absolute left-3 right-3 top-full mt-1.5 max-h-60 rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-black/5 z-50 overflow-y-auto space-y-0.5 custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
                {filteredSearchOptions.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-slate-400 text-center font-medium">
                    Menu tidak ditemukan
                  </div>
                ) : (
                  filteredSearchOptions.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSidebarSearchQuery("");
                        router.push(opt.value);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-all text-left text-slate-700 hover:bg-teal-50 hover:text-teal-900 cursor-pointer"
                    >
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ml-1.5">
                          {opt.badge}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 border-b border-slate-100 flex justify-center shrink-0">
            <button
              onClick={() => setIsCollapsed(false)}
              title="Cari Menu"
              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-500 hover:text-teal-700 flex items-center justify-center transition cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation Area */}
        <div className={`flex-1 px-3 py-4 space-y-1 custom-scrollbar ${isCollapsed ? "overflow-visible" : "overflow-y-auto"}`}>
          <div className="space-y-1">
            <nav className="space-y-1">
              {filteredMenuItems.length === 0 ? (
                <div className="px-3 py-8 text-center space-y-1">
                  <Search className="h-5 w-5 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-600">Menu tidak ditemukan</p>
                  <p className="text-[10px] text-slate-400">Coba kata kunci lain</p>
                </div>
              ) : (
                filteredMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const prevCategory = index > 0 ? filteredMenuItems[index - 1].category : null;
                  const isNewCategory = item.category && item.category !== prevCategory && !sidebarSearchQuery;

                  const categoryHeader = isNewCategory && (
                    isCollapsed ? (
                      index > 0 ? <div key={`cat_sep_${index}`} className="my-2 border-t border-slate-200/80 mx-2" /> : null
                    ) : (
                      <div key={`cat_head_${index}`} className="pt-4 pb-1.5 px-3.5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-800/80">
                          {item.category}
                        </span>
                        <div className="h-px flex-1 ml-2.5 bg-gradient-to-r from-teal-500/25 to-transparent" />
                      </div>
                    )
                  );

                  // Handling Parent Items with Collapsible Submenu
                  if (hasChildren) {
                    const key = item.dropdownKey || `dropdown_${index}`;
                    const isOpen = Boolean(openDropdowns[key]) || Boolean(searchQuery);
                    const isAnyChildActive = item.children?.some(c => isRouteActive(pathname || "", c.href));

                    if (isCollapsed) {
                      const isHovered = activeHoverMenu === key;

                      return (
                        <React.Fragment key={key}>
                          {categoryHeader}
                          <div 
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

                            {/* Floating Circular Submenu Icon Buttons for Collapsed Sidebar */}
                            {isHovered && (
                              <div className="absolute left-full top-0 ml-3 z-[100] flex flex-col gap-2 p-2.5 bg-white/98 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-left-3 duration-200 min-w-[210px]">
                                {/* Header Title */}
                                <div className="px-2.5 py-1 border-b border-slate-100 mb-0.5 flex items-center justify-between">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-teal-800">{item.label}</span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                                </div>

                                {/* Floating Circular Submenu Buttons */}
                                <div className="space-y-1.5">
                                  {item.children?.map((child) => {
                                    const ChildIcon = child.icon || Icon;
                                    const isChildActive = isRouteActive(pathname || "", child.href);

                                    return (
                                      <Link
                                        key={child.href}
                                        href={child.href}
                                        onClick={() => setActiveHoverMenu(null)}
                                        className={`flex items-center gap-3 p-1.5 pr-3.5 rounded-2xl transition-all duration-200 group cursor-pointer ${
                                          isChildActive
                                            ? "bg-teal-50/90 border border-teal-200/80 shadow-2xs"
                                            : "hover:bg-slate-50 border border-transparent"
                                        }`}
                                      >
                                        {/* Circular Floating Icon Button */}
                                        <div className={`relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 group-hover:scale-110 shadow-md ${
                                          isChildActive
                                            ? "bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 text-white shadow-teal-900/20 ring-2 ring-teal-500/30"
                                            : "bg-slate-100 text-slate-600 group-hover:bg-gradient-to-br group-hover:from-teal-700 group-hover:to-cyan-800 group-hover:text-white border border-slate-200/80"
                                        }`}>
                                          <ChildIcon className="h-4 w-4" />
                                          {child.badge && (
                                            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-600 px-1 text-[8px] font-extrabold text-white ring-2 ring-white shadow-xs">
                                              {child.badge.split(" ")[0]}
                                            </span>
                                          )}
                                        </div>

                                        {/* Submenu Item Label */}
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                          <p className={`text-xs font-bold truncate transition-colors ${
                                            isChildActive ? "text-teal-950 font-black" : "text-slate-700 group-hover:text-teal-900"
                                          }`}>
                                            {child.label}
                                          </p>
                                          {child.badge && (
                                            <span className="text-[9px] font-bold text-slate-400 block truncate">
                                              {child.badge}
                                            </span>
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={key}>
                        {categoryHeader}
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => toggleDropdown(key)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                              isAnyChildActive
                                ? "bg-teal-50/80 text-teal-900 font-extrabold border border-teal-200/60 shadow-2xs"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                                isAnyChildActive
                                  ? "bg-gradient-to-br from-teal-700 to-cyan-800 text-white border-transparent shadow-xs"
                                  : "bg-slate-100 border-slate-200 text-slate-500"
                              }`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="truncate tracking-tight">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.badge && (
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                  isAnyChildActive
                                    ? "bg-teal-700 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180 text-teal-700" : "text-slate-400"}`} />
                            </div>
                          </button>

                          {/* Smooth Height Expandable Submenu */}
                          <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 my-1" : "grid-rows-[0fr] opacity-0 overflow-hidden"}`}>
                            <div className="overflow-hidden">
                              <div className="pl-4 pr-1 py-1 space-y-1.5 border-l-2 border-teal-500/30 ml-5">
                                {item.children?.map((child) => {
                                  const ChildIcon = child.icon;
                                  const isChildItemActive = isRouteActive(pathname || "", child.href);

                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                        isChildItemActive
                                          ? "bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white shadow-md shadow-teal-900/15 font-black translate-x-1"
                                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 overflow-hidden">
                                        {ChildIcon && (
                                          <ChildIcon className={`h-3.5 w-3.5 shrink-0 ${isChildItemActive ? "text-teal-200" : "text-slate-400"}`} />
                                        )}
                                        <span className="truncate">{child.label}</span>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {isChildItemActive && (
                                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-xs animate-pulse" />
                                        )}
                                        {child.badge && (
                                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold ${
                                            isChildItemActive
                                              ? "bg-white/20 text-white border border-white/30"
                                              : "bg-slate-100 text-slate-500 border border-slate-200"
                                          }`}>
                                            {child.badge}
                                          </span>
                                        )}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  }

                  // Handling Single Link Items
                  const isActive = isRouteActive(pathname || "", item.href);

                  if (isCollapsed) {
                    return (
                      <React.Fragment key={item.href || index}>
                        {categoryHeader}
                        <Link
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
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={item.href || index}>
                      {categoryHeader}
                      <Link
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
                          <span className="truncate tracking-tight">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && (
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              isActive
                                ? "bg-white/20 text-white border border-white/30"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    </React.Fragment>
                  );
                })
              )}
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
      {(() => {
        const settingsHref =
          role === "admin"
            ? "/dashboard/admin/settings"
            : role === "rumah_sakit" || role === "faskes" || role === "dokter" || role === "staf_rs"
            ? "/dashboard/faskes/settings"
            : "/dashboard/pasien/settings";

        return (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 py-2 px-4 flex items-center justify-around md:hidden" style={{boxShadow: "0 -1px 0 0 rgb(0 0 0 / 0.05), 0 -4px 16px -4px rgb(0 0 0 / 0.06)"}}>
            {menuItems.slice(0, 4).map((item, idx) => {
              const Icon = item.icon;
              const isActive = (pathname || "") === item.href || (item.children && item.children.some((c) => (pathname || "") === c.href));
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

            {/* Profil Tab */}
            <Link
              href={settingsHref}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${
                pathname?.includes("/settings") ? "text-teal-800 scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
                pathname?.includes("/settings") ? "bg-teal-100 text-teal-800" : "text-slate-400"
              }`}>
                <User className="h-4.5 w-4.5" />
              </div>
              <span className="uppercase tracking-wide">Profil</span>
            </Link>
          </nav>
        );
      })()}
    </>
  );
}
