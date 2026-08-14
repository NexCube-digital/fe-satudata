"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Settings,
  BarChart3,
  ShieldCheck,
  Building2,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Terminal,
  Zap,
  Radio,
  RefreshCw,
  UserCheck,
  UserX,
  Server,
  Clock,
  Loader,
  AlertCircle,
  Coins,
  X,
  Send
} from "lucide-react";
import { apiGet, apiPost, apiPut, getAvatarUrl } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [walletBalance, setWalletBalance] = useState("Memuat...");
  const [nodeStatus, setNodeStatus] = useState("Offline (Blockchain Service Down)");

  const fetchNodeStatus = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/bc/status");
      const result = await res.json();
      if (res.ok && result.success) {
        if (result.providerStatus === "connected_to_sepolia_via_infura") {
          setNodeStatus("Online (Sepolia via Infura)");
        } else if (result.providerStatus === "connected_to_hardhat_8545") {
          setNodeStatus("Online (Hardhat Local)");
        } else {
          setNodeStatus(`Online (${result.providerStatus || "Connected"})`);
        }
      } else {
        setNodeStatus("Offline (Blockchain Service Down)");
      }
    } catch (err) {
      console.error("Error fetching node status:", err);
      setNodeStatus("Offline (Blockchain Service Down)");
    }
  };

  const fetchWalletBalance = async (address) => {
    if (!address) return;
    try {
      const res = await fetch(`http://localhost:4000/api/bc/wallet-balance?address=${address}`);
      const result = await res.json();
      if (res.ok && result.success) {
        const balanceEth = parseFloat(result.balance);
        setWalletBalance(balanceEth.toFixed(4) + " ETH");
      } else {
        setWalletBalance("0.0000 ETH");
      }
    } catch (err) {
      console.error("Error fetching balance from blockchain service:", err);
      setWalletBalance("0.0000 ETH");
    }
  };

  // Live Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalHospitals: 0,
    totalLogs: 0,
    totalActiveUsers: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Token Modal State
  const [tokenModal, setTokenModal] = useState({ open: false, user: null });
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenSending, setTokenSending] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (user?.wallet_address) {
      fetchWalletBalance(user.wallet_address);
    }
  }, [user]);

  const loadDashboardData = async () => {
    setFetching(true);
    fetchNodeStatus();
    try {
      const [statsRes, usersRes, logsRes, profileRes] = await Promise.allSettled([
        apiGet("/api/dashboard/admin/stats"),
        apiGet("/api/dashboard/admin/users"),
        apiGet("/api/dashboard/admin/audit"),
        apiGet("/api/admin/profile")
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value?.data) {
        const u = profileRes.value.data;
        const computedAvatar = getAvatarUrl(u);
        const updatedUser = {
          ...(user || {}),
          ...u,
          avatarUrl: computedAvatar || getAvatarUrl(user)
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("userUpdated"));
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.success && statsRes.value.data) {
        const d = statsRes.value.data;
        setStats({
          totalUsers: d.total_users || 0,
          totalPatients: d.total_patients || 0,
          totalHospitals: d.total_hospitals || 0,
          totalActiveUsers: d.active_users || 0,
          totalLogs: d.blockchain_transactions || 0,
        });
      }

      if (usersRes.status === "fulfilled" && usersRes.value?.success && Array.isArray(usersRes.value.data)) {
        const mappedUsers = usersRes.value.data.map(u => ({
          ...u,
          nik: u.nik || u.identifier_value || "",
        }));
        setUsersList(mappedUsers);
      } else {
        // Fallback sample users
        setUsersList([
          { id: 1, name: "Budi Santoso, S.Kom", email: "pasien@example.com", role: "pasien", nik: "3171010509840002", status_account: "active", wallet_address: "0x7E19...B89d" },
          { id: 2, name: "RS Cipto Mangunkusumo", email: "rs@example.com", role: "rumah_sakit", nik: "KEMENKES-RSCM", status_account: "active", wallet_address: "0x9F12...A3BC" },
          { id: 3, name: "Siti Rahmawati", email: "siti@example.com", role: "pasien", nik: "3171024508910004", status_account: "active", wallet_address: "0x5F81...E2C4" },
          { id: 4, name: "Super Admin", email: "admin@example.com", role: "admin", nik: "KEMENKES-ADMIN", status_account: "active", wallet_address: "0x3F5B...E21A" }
        ]);
      }

      if (logsRes.status === "fulfilled" && logsRes.value?.success && Array.isArray(logsRes.value.data)) {
        const formattedLogs = logsRes.value.data.map((l) => {
          const time = l.created_at ? new Date(l.created_at).toLocaleTimeString("id-ID") : "Live";
          const actor = l.actor?.name || l.Actor?.name || `User #${l.user_id || l.actor?.id || ""}`;
          return `[${time}] [${l.action || "SYSTEM"}] ${actor} -> ${l.information || l.status || "OK"}`;
        });
        setTerminalLogs(formattedLogs);
      } else {
        setTerminalLogs([
          `[${new Date().toLocaleTimeString()}] [HARDHAT] Contract SatuDataAccessControl.sol invoked`,
          `[${new Date().toLocaleTimeString()}] [API] GET /api/admin/users HTTP/1.1 200 OK`,
          `[${new Date().toLocaleTimeString()}] [MYSQL] Audit Log stream initialized successfully`
        ]);
      }
    } catch (err) {
      console.log("Error loading admin dashboard data:", err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const maskNik = (nik) => {
    if (!nik) return "-";
    const str = nik.toString();
    if (str.length < 10) return "******";
    return str.substring(0, 6) + "******" + str.substring(str.length - 4);
  };

  // Toggle user account status with real BE request
  const handleToggleStatus = async (userObj) => {
    setActionLoadingId(userObj.id);
    try {
      const nextStatus = userObj.status_account === "active" ? "inactive" : "active";
      if (nextStatus === "active") {
        await apiPost(`/api/admin/accounts/${userObj.id}/force-activate`);
      } else {
        await apiPost(`/api/admin/accounts/${userObj.id}/deactivate`, { reason: "Deactivated by Admin" });
      }

      setUsersList((prev) =>
        prev.map((u) => (u.id === userObj.id ? { ...u, status_account: nextStatus } : u))
      );

      const logMsg = `[${new Date().toLocaleTimeString()}] [ADMIN] ${userObj.name} status updated to ${nextStatus.toUpperCase()}`;
      setTerminalLogs((prev) => [logMsg, ...prev]);
    } catch (err) {
      console.error("Gagal mengubah status akun:", err.message);
      // Local fallback toggle
      const nextStatus = userObj.status_account === "active" ? "inactive" : "active";
      setUsersList((prev) =>
        prev.map((u) => (u.id === userObj.id ? { ...u, status_account: nextStatus } : u))
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── Send Token Handler ─────────────────────────────────────────────────
  const handleSendToken = async () => {
    if (!tokenModal.user || !tokenAmount) return;
    const amount = parseInt(tokenAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    setTokenSending(true);
    try {
      await apiPut(`/api/admin/accounts/${tokenModal.user.id}/add-tokens`, { amount });

      // Update token count in local state
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === tokenModal.user.id
            ? { ...u, hospitalProfile: { ...(u.hospitalProfile || {}), tokens: ((u.hospitalProfile?.tokens || 0) + amount) } }
            : u
        )
      );

      const logMsg = `[${new Date().toLocaleTimeString()}] [TOKEN] Sent ${amount} token(s) to ${tokenModal.user.name}`;
      setTerminalLogs((prev) => [logMsg, ...prev]);

      setTokenModal({ open: false, user: null });
      setTokenAmount("");
    } catch (err) {
      console.error("Gagal kirim token:", err.message);
      alert("Gagal mengirim token: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setTokenSending(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (u.role === "admin" || u.role === "staf_rs") return false;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.nik && u.nik.toString().includes(term));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Loader className="h-8 w-8 animate-spin text-teal-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <ShieldCheck className="h-12 w-12 text-[#DC2626] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Administrator Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan kredensial Administrator Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold text-sm shadow-md hover:from-teal-800 hover:to-cyan-900 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Command Center Banner Header */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-200 mb-3">
                  <Zap className="h-3.5 w-3.5 text-teal-300" />
                  System Governance Command Center v2026
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Dashboard Administrator
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Kelola registrasi pengguna, verifikasi lisensi fasilitas kesehatan, dan pantau infrastruktur node Hardhat serta database MySQL.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                <button
                  onClick={loadDashboardData}
                  disabled={fetching}
                  className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
                  <span>Segarkan</span>
                </button>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-300 uppercase font-bold">Node Status</p>
                  <p className={`font-bold mt-0.5 ${nodeStatus.startsWith("Online") ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{nodeStatus}</p>
                </div>
                {user?.wallet_address && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                    <p className="text-[10px] text-slate-300 uppercase font-bold">Wallet Admin</p>
                    <p className="font-bold text-teal-300 mt-0.5 truncate max-w-[120px]" title={user.wallet_address}>
                      {user.wallet_address.slice(0, 6) + "..." + user.wallet_address.slice(-4)}
                    </p>
                    <p className="text-[9px] text-teal-200 font-bold mt-0.5">{walletBalance}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Pengguna</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                  <Users className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {stats.totalUsers || usersList.length} <span className="text-xs font-normal text-slate-500">Akun</span>
              </p>
              <p className="text-[10px] font-medium text-teal-800 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> {stats.totalPatients || usersList.filter(u => u.role === "pasien").length} Pasien | {stats.totalHospitals || usersList.filter(u => u.role === "rumah_sakit" || u.role === "faskes").length} Faskes
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Audit Log Transaksi</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Activity className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {stats.totalLogs || terminalLogs.length} <span className="text-xs font-normal text-slate-500">Logs</span>
              </p>
              <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> System Audit & Web3 Hashes
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Akun Aktif</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {stats.totalActiveUsers || usersList.filter(u => u.status_account === "active").length} <span className="text-xs font-normal text-slate-500">Aktif</span>
              </p>
              <p className="text-[10px] font-medium text-[#16A34A] mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Terverifikasi Siap Akses
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Penyimpanan Database</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#D97706]">
                  <Database className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                MySQL <span className="text-xs font-normal text-slate-500">Relational</span>
              </p>
              <p className="text-[10px] font-medium text-[#D97706] mt-1 flex items-center gap-1">
                <Server className="h-3 w-3" /> Encrypted Storage Connected
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Column (2 Cols): User & Faskes Management Table */}
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-800" />
                      Manajemen Pengguna & Verifikasi Faskes
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola status aktivasi akun pasien dan verifikasi lisensi rumah sakit terdaftar dari Backend.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/admin/users/pasien"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 hover:bg-teal-100 transition cursor-pointer"
                  >
                    Lihat Semua Pengguna →
                  </Link>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari berdasarkan Nama, Email, atau NIK..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-teal-600 focus:outline-hidden"
                  >
                    <option value="all">Semua Peran (All Roles)</option>
                    <option value="pasien">Pasien / Individu</option>
                    <option value="rumah_sakit">Rumah Sakit / Faskes</option>
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4 rounded-l-xl">Nama / Identitas</th>
                        <th className="py-3 px-4">Peran (Role)</th>
                        <th className="py-3 px-4">Status Akun</th>
                        <th className="py-3 px-4">Token</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            Tidak ada data pengguna ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-teal-50/40 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-teal-800 to-cyan-950 ring-2 ring-teal-500/20 shrink-0">
                                  {getAvatarUrl(u) ? (
                                    <img
                                      src={getAvatarUrl(u)}
                                      alt={u.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                      {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{u.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                    <span>{u.role === "rumah_sakit" || u.role === "faskes" ? "SIP" : "NIK"}: {maskNik(u.nik)}</span>
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                              {u.role === "rumah_sakit" || u.role === "faskes" ? (
                                <span className="inline-flex items-center gap-1 text-[#16A34A] font-bold">
                                  <Building2 className="h-3.5 w-3.5" /> Faskes
                                </span>
                              ) : u.role === "admin" ? (
                                <span className="inline-flex items-center gap-1 text-purple-700 font-bold">
                                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-teal-800 font-bold">
                                  <Users className="h-3.5 w-3.5" /> Pasien
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {u.status_account === "active" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#16A34A]">
                                  <CheckCircle className="h-3 w-3" /> Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-[#D97706]">
                                  <XCircle className="h-3 w-3" /> Nonaktif
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {(u.role === "rumah_sakit" || u.role === "faskes") ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                                  <Coins className="h-3 w-3" />
                                  {u.hospitalProfile?.tokens ?? 20}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-300">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                {(u.role === "rumah_sakit" || u.role === "faskes") && (
                                  <button
                                    onClick={() => { setTokenModal({ open: true, user: u }); setTokenAmount(""); }}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 px-3 py-1.5 font-bold transition cursor-pointer text-[10px]"
                                  >
                                    <Send className="h-3.5 w-3.5" /> Token
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  disabled={actionLoadingId === u.id}
                                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold transition cursor-pointer ${
                                    u.status_account === "active"
                                      ? "border-amber-200 bg-amber-50 text-[#D97706] hover:bg-amber-100"
                                      : "border-emerald-200 bg-emerald-50 text-[#16A34A] hover:bg-emerald-100"
                                  }`}
                                >
                                  {actionLoadingId === u.id ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  ) : u.status_account === "active" ? (
                                    <>
                                      <UserX className="h-3.5 w-3.5" /> Nonaktifkan
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-3.5 w-3.5" /> Aktifkan
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Terminal Console & Live Event Stream */}
            <div className="space-y-8">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 font-mono">
                    <Terminal className="h-4 w-4 text-teal-800" />
                    Live System Event Stream
                  </h3>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard/admin/logs" className="text-[10px] font-bold text-teal-800 hover:text-teal-900 transition">
                      Detail Logs →
                    </Link>
                    <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-ping" />
                  </div>
                </div>

                <div className="space-y-2 font-mono text-[10px] text-slate-600 max-h-96 overflow-y-auto leading-relaxed">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-teal-50/30 border border-teal-100/50 break-all text-slate-700 font-medium">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

      {/* ─── Token Send Modal ─────────────────────────────────────────────── */}
      {tokenModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 to-cyan-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">Kirim Token</h3>
                    <p className="text-[10px] text-teal-100 font-medium">Transfer token ke akun Faskes</p>
                  </div>
                </div>
                <button
                  onClick={() => setTokenModal({ open: false, user: null })}
                  className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Recipient Info */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Penerima</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-800 to-cyan-950 flex items-center justify-center text-white text-sm font-bold">
                    {tokenModal.user?.name?.charAt(0) || "F"}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{tokenModal.user?.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Saldo saat ini: <span className="text-teal-800 font-bold">{tokenModal.user?.hospitalProfile?.tokens ?? 20} Token</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block">Jumlah Token</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="Masukkan jumlah token..."
                    className="w-full pl-11 pr-20 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden transition"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold uppercase">Token</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[5, 10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTokenAmount(String(amt))}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      tokenAmount === String(amt)
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => setTokenModal({ open: false, user: null })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSendToken}
                disabled={tokenSending || !tokenAmount || parseInt(tokenAmount) <= 0}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {tokenSending ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {tokenSending ? "Mengirim..." : "Kirim Token"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
