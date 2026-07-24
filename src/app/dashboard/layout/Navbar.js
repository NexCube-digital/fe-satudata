"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  LogOut, 
  Settings, 
  ChevronDown, 
  User as UserIcon, 
  Bell, 
  ShieldCheck, 
  FileText, 
  Lock, 
  CheckCircle, 
  ExternalLink,
  Activity,
  Building2,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { apiGet, getAvatarUrl } from "@/lib/api";

export default function Navbar({ user: initialUser, roleLabel, onLogout }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState("all");

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setCurrentUser(JSON.parse(stored)); } catch (e) {}
      }
    };
    handleSync();
    window.addEventListener("userUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("userUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const user = currentUser;

  const fetchNotifications = async () => {
    try {
      const result = await apiGet("/api/notifications?limit=20");
      if (result.success && result.data?.items) {
        const mapped = result.data.items.map((item) => {
          let title = "Notifikasi";
          let category = "security";
          let link = "#";
          let icon = ShieldCheck;

          if (item.tipe === "permintaan_akses") {
            title = "Permintaan Akses Rekam Medis";
            category = "consent";
            link = currentUser?.role === "pasien" ? "/dashboard/pasien/consent" : "/dashboard/faskes/requests";
            icon = Building2;
          } else if (item.tipe === "akses_disetujui") {
            title = "Permintaan Akses Disetujui";
            category = "consent";
            link = currentUser?.role === "pasien" ? "/dashboard/pasien/consent" : "/dashboard/faskes/requests";
            icon = CheckCircle;
          } else if (item.tipe === "akses_ditolak") {
            title = "Permintaan Akses Ditolak";
            category = "consent";
            link = currentUser?.role === "pasien" ? "/dashboard/pasien/consent" : "/dashboard/faskes/requests";
            icon = XCircle;
          } else if (item.tipe === "akses_dicabut") {
            title = "Akses Rekam Medis Dicabut";
            category = "consent";
            link = currentUser?.role === "pasien" ? "/dashboard/pasien/consent" : "/dashboard/faskes/requests";
            icon = Lock;
          } else if (item.tipe === "rekam_medis_baru") {
            title = "Rekam Medis Baru Diunggah";
            category = "ehr";
            link = currentUser?.role === "pasien" ? "/dashboard/pasien/records" : "/dashboard/faskes/patients";
            icon = FileText;
          }

          const diffMs = Date.now() - new Date(item.created_at).getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHrs = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHrs / 24);
          
          let timestamp = "Baru saja";
          if (diffDays > 0) timestamp = `${diffDays} hari yang lalu`;
          else if (diffHrs > 0) timestamp = `${diffHrs} jam yang lalu`;
          else if (diffMins > 0) timestamp = `${diffMins} menit yang lalu`;

          return {
            id: item.id,
            title,
            actor: currentUser?.role === "pasien" ? "Fasilitas Kesehatan" : "Pasien",
            actorRole: item.tipe.replace("_", " "),
            description: item.message,
            timestamp,
            category,
            link,
            read: item.reading,
            icon
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat notifikasi", err);
    }

    try {
      const resCountJson = await apiGet("/api/notifications/unread-count");
      if (resCountJson.success && resCountJson.data) {
        setUnreadCount(resCountJson.data.unread_count || 0);
      }
    } catch (err) {
      console.error("Gagal memuat jumlah notifikasi", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  // Polling notifications every 10 seconds to keep it updated
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Otomatis menutup dropdown & notifikasi ketika pengguna mengklik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSettingsHref = () => {
    switch (user?.role) {
      case "admin":
        return "/dashboard/admin/settings";
      case "rumah_sakit":
      case "faskes":
      case "dokter":
        return "/dashboard/faskes/settings";
      case "pasien":
      default:
        return "/dashboard/pasien/settings";
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (id) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ read: true })
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (err) {
      console.error(err);
    }
    setIsNotifOpen(false);
  };

  const displayRoleLabel = roleLabel || (user?.role === "admin" ? "Administrator" : user?.role === "rumah_sakit" ? "Fasilitas Kesehatan" : "Pasien Terdaftar");

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === "all") return true;
    return n.category === notifFilter;
  });

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex items-center justify-between px-6 py-3.5">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs ring-1 ring-slate-200">
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">Satu Data</div>
              <div className="text-[11px] font-bold text-rose-800">{roleLabel || "Dashboard"}</div>
            </div>
          </Link>
        </div>

        {/* Right Action Icons: Notification Bell & Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* TOMBOL NOTIFIKASI & POPUP HISTORY INTERAKSI */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 transition hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200"
              aria-label="Notifikasi & Riwayat Interaksi"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* POPUP NOTIFIKASI & RIWAYAT INTERAKSI */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Popup */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-rose-600" />
                      Notifikasi & Riwayat Interaksi
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Aktivitas terkini pengguna & fasilitas kesehatan
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 border-b border-slate-100 pb-2 mb-3 text-[10px] font-bold">
                  <button
                    onClick={() => setNotifFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      notifFilter === "all" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setNotifFilter("consent")}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      notifFilter === "consent" ? "bg-rose-800 text-white" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Izin Akses
                  </button>
                  <button
                    onClick={() => setNotifFilter("ehr")}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      notifFilter === "ehr" ? "bg-rose-800 text-white" : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Rekam Medis
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {filteredNotifs.map((n) => {
                    const IconComponent = n.icon;
                    return (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => handleNotifClick(n.id)}
                        className={`group flex items-start gap-3 rounded-2xl p-3 transition border text-xs ${
                          n.read
                            ? "bg-slate-50/50 border-slate-100/80 hover:bg-slate-100/80"
                            : "bg-rose-50/40 border-rose-200/80 hover:bg-rose-50"
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-bold ${
                          n.read
                            ? "bg-white border-slate-200 text-slate-500"
                            : "bg-rose-800 border-rose-700 text-white shadow-2xs"
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-bold text-slate-900 truncate">{n.title}</span>
                            {!n.read && (
                              <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-tight">
                            <strong className="font-bold text-rose-900">{n.actor}</strong> ({n.actorRole}) {n.description}
                          </p>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                            {n.timestamp}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-slate-100 mt-3 text-center">
                  <Link
                    href="/dashboard/pasien/records"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-rose-800 hover:text-rose-900 inline-flex items-center gap-1"
                  >
                    Lihat Seluruh Log Audit Trail <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profil & Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 p-1.5 transition hover:bg-rose-50/60 hover:border-rose-200"
              aria-expanded={isDropdownOpen}
            >
              {/* Foto Profil / Avatar Placeholder */}
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-rose-800 to-red-900 ring-2 ring-rose-500/20 shrink-0">
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
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                  </div>
                )}
              </div>

              {/* Nama & Role Info */}
              <div className="hidden text-left sm:block">
                <div className="text-xs font-extrabold text-slate-900">
                  {currentUser?.name || "Pengguna"}
                </div>
                <div className="text-[10px] font-bold text-rose-800">{displayRoleLabel}</div>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menu Dropdown Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Header ringkasan profil khusus tampilan mobile */}
                <div className="border-b border-slate-100 px-3 py-2.5 sm:hidden">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name || "Pengguna"}</p>
                  <p className="text-[10px] font-semibold text-rose-800">{currentUser?.email || displayRoleLabel}</p>
                </div>

                {/* Tombol Settings */}
                <Link
                  href={getSettingsHref()}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-900"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  Setting Akun & Wallet
                </Link>

                {/* Garis Pemisah */}
                <div className="my-1 border-t border-slate-100" />

                {/* Tombol Logout */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}