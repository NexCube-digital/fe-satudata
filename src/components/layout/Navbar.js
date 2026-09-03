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

export default function Navbar({ user: initialUser, roleLabel, onLogout, fixed = false }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState("all");
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");
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
    if (!currentUser) return;
    setIsNotifLoading(true);
    setNotifError("");

    try {
      const result = await apiGet("/api/notifications?limit=20");
      const items = Array.isArray(result?.data?.items)
        ? result.data.items
        : Array.isArray(result?.data)
          ? result.data
          : [];
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

        const reqObj = item.access_request || item.AccessRequest || item.request;
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
          read: Boolean(item.reading),
          icon,
        };
      });
      setNotifications(mapped);
    } catch (err) {
      console.warn("Gagal memuat notifikasi:", err.message);
      setNotifError(err.message || "Notifikasi tidak dapat dimuat");
    }

    try {
      const resCountJson = await apiGet("/api/notifications/unread-count");
      const count = Number(resCountJson?.data?.unread_count ?? 0);
      setUnreadCount(Number.isFinite(count) ? Math.max(0, count) : 0);
    } catch (err) {
      console.warn("Gagal memuat jumlah notifikasi:", err.message);
    } finally {
      setIsNotifLoading(false);
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
        return "/dashboard/faskes/settings";
      case "pasien":
      default:
        return "/dashboard/pasien/settings";
    }
  };

  const markAllRead = async () => {
    try {
      const res = await apiPut("/api/notifications/read-all");
      if (res?.success !== false) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Gagal menandai semua dibaca:", err);
    }
  };

  const handleNotifClick = async (id) => {
    const notification = notifications.find((item) => item.id === id);
    if (!notification) return;

    try {
      const res = await apiPut(`/api/notifications/${id}/read`, { read: true });
      if (res?.success !== false) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        if (!notification.read) setUnreadCount((count) => Math.max(0, count - 1));
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
      if (res?.success !== false) {
        const notification = notifications.find((item) => item.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
      }
    } catch (err) {
      console.error("Gagal menghapus notifikasi:", err);
    }
  };

  const displayRoleLabel = roleLabel || (user?.role === "admin" ? "Administrator" : user?.role === "rumah_sakit" ? "Fasilitas Kesehatan" : "Pasien Terdaftar");

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === "all") return true;
    return n.category === notifFilter;
  });

  return (
    <nav className={`${fixed ? "fixed inset-x-0 top-0" : "sticky top-0"} z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl shadow-sm`} style={{boxShadow: "0 1px 0 0 rgb(0 0 0 / 0.06), 0 4px 20px -4px rgb(0 0 0 / 0.05)"}}>
      <div className="mx-auto flex items-center justify-between px-5 py-2.5">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 transition-all duration-200">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shrink-0 shadow-2xs">
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={40}
                height={40}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-[#334155] group-hover:text-[#0D9488] transition-colors">Satu Data</div>
              <div className="text-[10px] font-semibold text-[#0D9488] tracking-wide uppercase">{displayRoleLabel}</div>
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
                  ? "bg-[#E6F4F1] text-[#0F766E] shadow-inner"
                  : "border border-[#E2E8F0] bg-slate-50/60 text-[#64748B] hover:bg-[#E6F4F1] hover:text-[#0D9488] hover:border-teal-200 hover:shadow-sm"
              }`}
              aria-label="Notifikasi"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-[9px] font-extrabold text-white ring-2 ring-white shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* POPUP NOTIFIKASI */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 rounded-3xl border border-[#E2E8F0] bg-white/95 backdrop-blur-xl p-0 shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0D9488] to-[#0F766E] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white">Notifikasi</h3>
                        <p className="text-[10px] text-teal-100/80">Aktivitas terkini sistem</p>
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
                          ? "bg-[#0D9488] text-white shadow-sm"
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
                      <p className="text-xs text-slate-400 font-medium">
                        {isNotifLoading ? "Memuat notifikasi..." : notifError || "Tidak ada notifikasi"}
                      </p>
                    </div>
                  )}
                  {filteredNotifs.map((n) => {
                    const IconComponent = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`group flex items-start gap-3 rounded-2xl p-3 transition-all duration-150 border ${
                          n.read
                            ? "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                            : "bg-[#E6F4F1]/60 border-teal-200/60 hover:bg-[#E6F4F1] hover:border-teal-300/50"
                        }`}
                      >
                        <Link
                          href={n.link}
                          onClick={() => handleNotifClick(n.id)}
                          className="flex items-start gap-3 flex-1 min-w-0"
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                            n.read
                              ? "bg-slate-100 border-slate-200 text-slate-500"
                              : "bg-gradient-to-br from-[#0D9488] to-[#0F766E] border-teal-600 text-white shadow-sm"
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${n.read ? "text-slate-600 font-medium" : "text-slate-900 font-bold"}`}>
                              {n.description || "Tidak ada informasi notifikasi"}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.timestamp}</span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotif(e, n.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                          aria-label="Hapus notifikasi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 text-center">
                  <Link
                    href={
                      currentUser?.role === "admin"
                        ? "/dashboard/admin/logs"
                        : (currentUser?.role === "rumah_sakit" || currentUser?.role === "dokter" || currentUser?.role === "faskes")
                          ? "/dashboard/faskes/requests/history"
                          : "/dashboard/pasien/records"
                    }
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[11px] font-bold text-[#0D9488] hover:text-[#0F766E] inline-flex items-center gap-1.5 transition-colors"
                  >
                    Lihat Semua Log & Audit Trail <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profil & Dropdown (Desktop Only) */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-2.5 py-1.5 transition-all duration-200 ${
                isDropdownOpen
                  ? "border-teal-200 bg-[#E6F4F1]"
                  : "border-[#E2E8F0] bg-slate-50/60 hover:border-teal-200 hover:bg-[#E6F4F1]/60"
              }`}
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="relative h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] ring-2 ring-teal-500/20 shrink-0">
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
                <div className="text-[11px] font-extrabold text-[#334155] leading-tight">
                  {currentUser?.name || "Pengguna"}
                </div>
                <div className="text-[9px] font-bold text-[#0D9488] uppercase tracking-wide">{displayRoleLabel}</div>
              </div>

              <ChevronDown
                className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-52 rounded-2xl border border-[#E2E8F0] bg-white/95 backdrop-blur-xl p-1.5 shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header */}
                <div className="px-3 py-3 mb-1 bg-gradient-to-r from-slate-50 to-[#E6F4F1]/50 rounded-xl border border-slate-100">
                  <p className="text-xs font-extrabold text-[#334155] truncate">{currentUser?.name || "Pengguna"}</p>
                  <p className="text-[9px] text-[#64748B] font-mono truncate mt-0.5">{currentUser?.email || displayRoleLabel}</p>
                </div>

                <Link
                  href={getSettingsHref()}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#334155] transition-all hover:bg-[#E6F4F1] hover:text-[#0F766E]"
                >
                  <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  Setting Akun & Wallet
                </Link>

                <div className="my-1.5 border-t border-[#E2E8F0]" />

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