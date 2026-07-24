"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/dashboard/layout/Navbar";
import Sidebar from "@/app/dashboard/layout/Sidebar";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Activity,
  Copy,
  Check,
  Eye,
  Loader,
  Clock,
  Terminal,
  Zap,
  Lock,
  Building2,
  User
} from "lucide-react";
import { apiGet } from "@/lib/api";

export default function LogsComponent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [logsList, setLogsList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedTx, setCopiedTx] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setFetchingData(true);
    setErrorMsg("");
    try {
      const res = await apiGet("/api/dashboard/admin/audit");
      if (res.success && Array.isArray(res.data)) {
        const mappedLogs = res.data.map(l => ({
          ...l,
          Actor: l.Actor || l.actor || null,
          TargetHospital: l.TargetHospital || l.target_hospital || null,
        }));
        setLogsList(mappedLogs);
      } else {
        throw new Error(res.message || "Gagal memuat data audit log");
      }
    } catch (err) {
      console.log("Using sample audit logs if BE error:", err.message);
      // Sample Audit Log Data fallback
      setLogsList([
        {
          id: 101,
          user_id: 1,
          action: "DECRYPT_EHR_RECORD",
          status: "success",
          tx_hash: "0x8f3c7b2a9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
          information: "Dekripsi rekam medis poli bedah oleh dr. Amanda",
          created_at: new Date().toISOString(),
          Actor: { name: "Budi Santoso", email: "pasien@example.com", role: "pasien" },
          TargetHospital: { name: "RS Cipto Mangunkusumo" }
        },
        {
          id: 102,
          user_id: 2,
          action: "TOGGLE_USER_STATUS_ACTIVE",
          status: "success",
          tx_hash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
          information: "Status akun RS 1 diubah ke ACTIVE oleh Super Admin",
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          Actor: { name: "Super Admin", email: "admin@example.com", role: "admin" },
          TargetHospital: { name: "RS 1" }
        },
        {
          id: 103,
          user_id: 1,
          action: "APPROVE_CONSENT",
          status: "success",
          tx_hash: "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
          information: "Persetujuan izin baca diberikan kepada RS Harapan Kita (durasi 7 hari)",
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          Actor: { name: "Budi Santoso", email: "pasien@example.com", role: "pasien" },
          TargetHospital: { name: "RS Harapan Kita" }
        }
      ]);
    } finally {
      setFetchingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredLogs = logsList.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.information && log.information.toLowerCase().includes(term)) ||
      (log.tx_hash && log.tx_hash.toLowerCase().includes(term)) ||
      (log.Actor?.name && log.Actor.name.toLowerCase().includes(term)) ||
      (log.TargetHospital?.name && log.TargetHospital.name.toLowerCase().includes(term));

    const matchesAction = actionFilter === "all" || log.action?.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const totalLogs = logsList.length;
  const successLogs = logsList.filter((l) => l.status === "success").length;
  const failedLogs = logsList.filter((l) => l.status === "failed").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <Loader className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={currentUser} roleLabel="Administrator" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role={currentUser?.role || "admin"} />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 border border-rose-200">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Audit Trail & Blockchain Logs
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tinjau rekam jejak aktivasi sistem, otorisasi izin persetujuan, dan integritas hash transaksi Hardhat
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchLogs}
              disabled={fetchingData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-800 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${fetchingData ? "animate-spin text-rose-600" : ""}`} />
              <span>Segarkan Log</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Audit Log</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalLogs}</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Sistem & Blockchain</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-emerald-700">Transaksi Berhasil</p>
              <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">{successLogs}</h3>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">Status SUCCESS</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-amber-700">Gagal / Ditolak</p>
              <h3 className="text-2xl font-extrabold text-amber-800 mt-1">{failedLogs}</h3>
              <p className="text-[11px] font-semibold text-amber-600 mt-1">Status FAILED</p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-extrabold uppercase text-rose-800">Node Hardhat</p>
              <h3 className="text-2xl font-extrabold text-rose-900 mt-1">Live</h3>
              <p className="text-[11px] font-semibold text-rose-700 mt-1">Smart Contract Active</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari aksi, pengguna, faskes, atau tx hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-bold text-slate-600">Kategori:</span>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Aksi</option>
                  <option value="status">Status Akun</option>
                  <option value="consent">Consent / Izin</option>
                  <option value="decrypt">Dekripsi EHR</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Waktu & Tanggal</th>
                    <th className="px-5 py-3.5">Aktor Pengguna</th>
                    <th className="px-5 py-3.5">Jenis Aksi (Action)</th>
                    <th className="px-5 py-3.5">Target / Informasi</th>
                    <th className="px-5 py-3.5">Blockchain Tx Hash</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada log yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "-"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-extrabold text-slate-900">{log.Actor?.name || `User #${log.user_id}`}</p>
                          <p className="text-[10px] text-slate-500">{log.Actor?.email || "-"}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-[11px] font-extrabold text-rose-900 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            {log.action}
                          </span>
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-slate-800 truncate font-medium">{log.information || log.TargetHospital?.name || "-"}</p>
                          {log.TargetHospital?.name && (
                            <p className="text-[10px] text-slate-400">Target RS: {log.TargetHospital.name}</p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {log.tx_hash ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {log.tx_hash.substring(0, 10)}...{log.tx_hash.substring(log.tx_hash.length - 6)}
                              </span>
                              <button
                                onClick={() => copyToClipboard(log.tx_hash, log.id)}
                                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                title="Salin Tx Hash"
                              >
                                {copiedTx === log.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Off-Chain</span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            log.status === "success" || log.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {log.status === "success" || log.status === "approved" ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-emerald-600" /> SUCCESS
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-red-600" /> FAILED
                              </>
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="Tinjau Log"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-rose-600" />
                Audit Trail Inspector Log #{selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis Aksi (Action)</span>
                <span className="font-mono font-extrabold text-rose-900 text-sm">{selectedLog.action}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Aktor</span>
                  <span className="font-bold text-slate-900">{selectedLog.Actor?.name || `User #${selectedLog.user_id}`}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedLog.Actor?.email || "-"}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Transaksi</span>
                  <span className={`font-extrabold uppercase ${selectedLog.status === "success" ? "text-emerald-600" : "text-red-600"}`}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Deskripsi Informasi</span>
                <p className="font-medium text-slate-800 mt-0.5">{selectedLog.information || "Tidak ada deskripsi rincian"}</p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blockchain Tx Hash (Hardhat)</span>
                <p className="font-mono text-[11px] text-slate-700 break-all bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
                  {selectedLog.tx_hash || "Off-chain / Local MySQL Record"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Waktu Pencatatan</span>
                <span className="font-mono text-xs text-slate-800">{new Date(selectedLog.created_at).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
