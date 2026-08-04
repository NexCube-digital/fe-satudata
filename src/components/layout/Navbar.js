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
  AlertCircle,
  Coins,
  Trash2
} from "lucide-react";
import { apiGet, apiPut, apiDelete, getAvatarUrl } from "@/lib/api";

export default function Navbar({ user: initialUser, roleLabel, onLogout }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState("all");
  const [tokenBalance, setTokenBalance] = useState(null);

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
      const items = Array.isArray(result?.data?.items) ? result.data.items : [];
      const mapped = items.map((item) => {
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
        } else if (item.tipe === "rekam_medis_diperbarui") {
          title = "Rekam Medis Diperbarui";
          category = "ehr";
          link = currentUser?.role === "pasien" ? "/dashboard/pasien/records" : "/dashboard/faskes/patients";
          icon = FileText;
        }

        const createdAt = item.created_at ? new Date(item.created_at) : null;
        const diffMs = createdAt ? Date.now() - createdAt.getTime() : 0;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHrs / 24);
        
        let timestamp = "Baru saja";
        if (diffDays > 0) timestamp = `${diffDays} hari yang lalu`;
        else if (diffHrs > 0) timestamp = `${diffHrs} jam yang lalu`;
        else if (diffMins > 0) timestamp = `${diffMins} menit yang lalu`;

        const reqObj = item.access_request || item.AccessRequest;
        let actorName = currentUser?.role === "pasien" ? "Fasilitas Kesehatan" : "Pasien";
        if (reqObj) {
          if (currentUser?.role === "pasien") {
            actorName = reqObj.hospital?.user?.name || "Fasilitas Kesehatan";
          } else {
            actorName = reqObj.Patient?.name || "Pasien";
          }
        }

        let actorRoleName = String(item.tipe || "").replace(/_/g, " ");
        actorRoleName = actorRoleName
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return {
          id: item.id,
          title,
          actor: actorName,
          actorRole: actorRoleName,
          description: item.message,
          timestamp,
          category,
          link,
          read: item.reading,
          icon,
        };
      });
      setNotifications(mapped);
    } catch (err) {
      console.warn("Gagal memuat notifikasi:", err.message);
      setNotifications([]);
    }

    try {
      const resCountJson = await apiGet("/api/notifications/unread-count");
      if (resCountJson && resCountJson.success && resCountJson.data) {
        setUnreadCount(resCountJson.data.unread_count || 0);
      }
    } catch (err) {
      console.warn("Gagal memuat jumlah notifikasi:", err.message);
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

  // Fetch token balance for faskes/rumah_sakit users
  useEffect(() => {
    if (!currentUser || (currentUser.role !== "rumah_sakit" && currentUser.role !== "faskes" && currentUser.role !== "dokter")) return;
    const fetchTokens = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/dashboard/hospital/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          setTokenBalance(result.data.tokens ?? 0);
        }
      } catch (err) {
        console.error("Gagal memuat token balance", err);
      }
    };
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
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
      case "staf_rs":
        return "/dashboard/faskes/settings";
      case "pasien":
      default:
        return "/dashboard/pasien/settings";
    }
  };

  const markAllRead = async () => {
    try {
      const res = await apiPut("/api/notifications/read-all");
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Gagal menandai semua dibaca:", err);
    }
  };

  const handleNotifClick = async (id) => {
    try {
      const res = await apiPut(`/api/notifications/${id}/read`, { read: true });
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (err) {
      console.error("Gagal menandai dibaca:", err);
    }
    setIsNotifOpen(false);
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await apiDelete(`/api/notifications/${id}`);
      if (res && res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        fetchNotifications();
      }
    } catch (err) {
      console.error("Gagal menghapus notifikasi:", err);
    }
  };

  const displayRoleLabel = roleLabel || (
    user?.role === "admin" 
      ? "Administrator" 
      : user?.role === "staf_rs"
      ? (user?.staff_profile?.role_name || "Staf Faskes")
      : user?.role === "rumah_sakit" 
      ? "Fasilitas Kesehatan" 
      : "Pasien Terdaftar"
  );

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === "all") return true;
    return n.category === notifFilter;
  });

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl shadow-sm" style={{boxShadow: "0 1px 0 0 rgb(0 0 0 / 0.06), 0 4px 20px -4px rgb(0 0 0 / 0.05)"}}>
      <div className="mx-auto flex items-center justify-between px-5 py-2.5">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 transition-all duration-200">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-800 to-rose-900 shadow-md shadow-rose-900/20 ring-1 ring-rose-700/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={28}
                height={28}
                className="relative z-10 h-7 w-7 object-contain brightness-0 invert"
              />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-rose-900 transition-colors">Satu Data</div>
              <div className="text-[10px] font-semibold text-rose-700/80 tracking-wide uppercase">{roleLabel || "Dashboard"}</div>
            </div>
          </Link>
        </div>

        {/* Right Action Icons: Notification Bell & Profile Dropdown */}
        <div className="flex items-center gap-2">
          {/* TOKEN BALANCE BADGE (untuk faskes/rumah_sakit) */}
          {tokenBalance !== null && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-xs">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-mono">{tokenBalance}</span>
              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-wide">Token</span>
            </div>
          )}

          {/* TOMBOL NOTIFIKASI & POPUP */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 ${
                isNotifOpen
                  ? "bg-rose-100 text-rose-800 shadow-inner"
                  : "border border-slate-200 bg-slate-50/60 text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 hover:shadow-sm"
              }`}
              aria-label="Notifikasi"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-[9px] font-extrabold text-white ring-2 ring-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* POPUP NOTIFIKASI */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-800 to-rose-900 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Notifikasi</h3>
                        <p className="text-[10px] text-rose-200/80">Aktivitas terkini sistem</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Baca Semua
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
                  {[
                    { key: "all", label: "Semua" },
                    { key: "consent", label: "Izin Akses" },
                    { key: "ehr", label: "Rekam Medis" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setNotifFilter(tab.key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        notifFilter === tab.key
                          ? "bg-rose-800 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-200/60"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Notification Items */}
                <div className="space-y-1.5 max-h-72 overflow-y-auto p-3">
                  {filteredNotifs.length === 0 && (
                    <div className="py-8 text-center">
                      <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">Tidak ada notifikasi</p>
                    </div>
                  )}
                  {filteredNotifs.map((n) => {
                    const IconComponent = n.icon;
                    return (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => handleNotifClick(n.id)}
                        className={`group flex items-start gap-3 rounded-2xl p-3 transition-all duration-150 border ${
                          n.read
                            ? "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                            : "bg-rose-50/60 border-rose-200/60 hover:bg-rose-50 hover:border-rose-300/50"
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                          n.read
                            ? "bg-slate-100 border-slate-200 text-slate-500"
                            : "bg-gradient-to-br from-rose-700 to-rose-900 border-rose-600 text-white shadow-sm"
                        }`}>
                          <IconComponent className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold text-slate-800 truncate">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed pr-6">
                            <strong className="font-semibold text-rose-800">{n.actor}</strong> — {n.description}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] font-mono text-slate-400 block">{n.timestamp}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNotif(e, n.id)}
                              className="text-slate-300 hover:text-rose-600 p-1 transition-colors rounded-md hover:bg-rose-100/50"
                              title="Hapus Notifikasi"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 text-center">
                  <Link
                    href={
                      currentUser?.role === "admin"
                        ? "/dashboard/admin/logs"
                        : (currentUser?.role === "rumah_sakit" || currentUser?.role === "dokter" || currentUser?.role === "faskes" || currentUser?.role === "staf_rs")
                          ? "/dashboard/faskes/requests/history"
                          : "/dashboard/pasien/records"
                    }
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-bold text-rose-800 hover:text-rose-700 inline-flex items-center gap-1.5 transition-colors"
                  >
                    Lihat Semua Log & Audit Trail <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profil & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-2.5 py-1.5 transition-all duration-200 ${
                isDropdownOpen
                  ? "border-rose-200 bg-rose-50"
                  : "border-slate-200/80 bg-slate-50/60 hover:border-rose-200 hover:bg-rose-50/60"
              }`}
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="relative h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-rose-600 to-rose-900 ring-2 ring-rose-500/20 shrink-0">
                {getAvatarUrl(currentUser) ? (
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={currentUser?.name || "Foto Profil"}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-extrabold text-white">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                  </div>
                )}
              </div>

              {/* Name & Role */}
              <div className="hidden text-left sm:block">
                <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
                  {currentUser?.name || "Pengguna"}
                </div>
                <div className="text-[9px] font-bold text-rose-700/80 uppercase tracking-wide">{displayRoleLabel}</div>
              </div>

              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-52 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-1.5 shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header */}
                <div className="px-3 py-3 mb-1 bg-gradient-to-r from-slate-50 to-rose-50/30 rounded-xl border border-slate-100">
                  <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser?.name || "Pengguna"}</p>
                  <p className="text-[9px] text-slate-400 font-mono truncate mt-0.5">{currentUser?.email || displayRoleLabel}</p>
                </div>

                <Link
                  href={getSettingsHref()}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-rose-50 hover:text-rose-900"
                >
                  <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  Setting Akun & Wallet
                </Link>

                <div className="my-1.5 border-t border-slate-100" />

                <button
                  onClick={() => { setIsDropdownOpen(false); onLogout?.(); }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50"
                >
                  <div className="h-6 w-6 rounded-lg bg-rose-50 flex items-center justify-center">
                    <LogOut className="h-3.5 w-3.5 text-rose-600" />
                  </div>
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