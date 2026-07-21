"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
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
  Server
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Registered Users Table State
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Budi Santoso, S.Kom", email: "pasien@example.com", role: "pasien", nik: "3171010509840002", status: "active", wallet: "0x7E19...B89d" },
    { id: 2, name: "RS Cipto Mangunkusumo", email: "rs@example.com", role: "rumah_sakit", nik: "KEMENKES-RSCM", status: "active", wallet: "0x9F12...A3BC" },
    { id: 3, name: "Siti Rahmawati", email: "siti@example.com", role: "pasien", nik: "3171024508910004", status: "active", wallet: "0x5F81...E2C4" },
    { id: 4, name: "RS Harapan Kita", email: "harapankita@example.com", role: "rumah_sakit", nik: "KEMENKES-RSHK", status: "active", wallet: "0x3F5B...E21A" },
    { id: 5, name: "Klinik Kimia Farma", email: "kimiafarma@example.com", role: "rumah_sakit", nik: "KEMENKES-KKF", status: "inactive", wallet: "0x2A11...C990" }
  ]);

  // Live Terminal Logs State
  const [terminalLogs, setTerminalLogs] = useState([
    "[10:14:02] [HARDHAT] Contract SatuDataAccessControl.sol invoked by 0x9F12...A3BC",
    "[10:13:45] [API] PUT /api/patient/profile HTTP/1.1 200 OK - 14ms",
    "[10:12:10] [MYSQL] Encrypted EHR Record #1042 successfully backed up to cold storage",
    "[10:10:05] [AUTH] Wallet signature verified for user ID #2 (0x7E19...B89d)"
  ]);

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Toggle user account status
  const handleToggleStatus = (id) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === "active" ? "inactive" : "active";
          setTerminalLogs((logs) => [
            `[${new Date().toLocaleTimeString()}] [ADMIN] User ID #${id} (${u.name}) status changed to ${newStatus.toUpperCase()}`,
            ...logs
          ]);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.nik.includes(searchTerm);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <ShieldCheck className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Administrator Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan kredensial Administrator Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md hover:bg-rose-500 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Administrator" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Admin Command Center Banner Header */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <Zap className="h-3.5 w-3.5 text-rose-400" />
                  System Governance Command Center v2026
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Dashboard Administrator
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Kelola registrasi pengguna, verifikasi lisensi fasilitas kesehatan, dan pantau infrastruktur node Hardhat serta database MySQL.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Hardhat Block</p>
                  <p className="font-bold text-rose-400 mt-0.5">#14,892 (Active)</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">API Latency</p>
                  <p className="font-bold text-emerald-400 mt-0.5">14ms (Optimal)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Pengguna</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Users className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                1,334 <span className="text-xs font-normal text-slate-500">Akun</span>
              </p>
              <p className="text-[10px] font-medium text-rose-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> 1,248 Pasien | 86 Faskes
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Transaksi Blockchain</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Activity className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                14,890 <span className="text-xs font-normal text-slate-500">Tx</span>
              </p>
              <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> EIP-2771 Gasless Transactions
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Live</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                342 <span className="text-xs font-normal text-slate-500">Grants</span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> ACL Verified di Smart Contract
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Penyimpanan MySQL</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Database className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                2.4 GB <span className="text-xs font-normal text-slate-500">Off-chain</span>
              </p>
              <p className="text-[10px] font-medium text-amber-600 mt-1 flex items-center gap-1">
                <Server className="h-3 w-3" /> Cold Storage AES-256
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
                      <Users className="h-5 w-5 text-rose-600" />
                      Manajemen Pengguna & Verifikasi Faskes
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola status aktivasi akun pasien dan verifikasi lisensi rumah sakit terdaftar.
                    </p>
                  </div>
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-rose-600 focus:outline-hidden"
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
                        <th className="py-3 px-4 rounded-l-xl">Nama / Email</th>
                        <th className="py-3 px-4">Peran (Role)</th>
                        <th className="py-3 px-4">NIK / Lisensi</th>
                        <th className="py-3 px-4">Status Akun</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {u.role === "rumah_sakit" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <Building2 className="h-3.5 w-3.5" /> Faskes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                                <Users className="h-3.5 w-3.5" /> Pasien
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600">{u.nik}</td>
                          <td className="py-3.5 px-4">
                            {u.status === "active" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                <CheckCircle className="h-3 w-3" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                                <XCircle className="h-3 w-3" /> Inaktif
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold transition cursor-pointer ${
                                u.status === "active"
                                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {u.status === "active" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                              {u.status === "active" ? "Suspend" : "Aktivasi"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Terminal Console & Event Stream */}
            <div className="space-y-8">
              <div className="rounded-3xl bg-gradient-to-br from-rose-950 to-red-950 border border-rose-800/40 p-6 text-white shadow-xl">
                <div className="flex items-center justify-between border-b border-rose-800/60 pb-4 mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-2 font-mono">
                    <Terminal className="h-4 w-4" />
                    Live System Event Stream
                  </h3>
                  <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                </div>

                <div className="space-y-2 font-mono text-[10px] text-rose-200 max-h-96 overflow-y-auto leading-relaxed">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-black/30 border border-rose-800/30 break-all text-rose-100">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
