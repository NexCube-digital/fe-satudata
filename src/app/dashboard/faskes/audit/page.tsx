"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import { getHospitalAuditLogs } from "@/services/hospitalService";
import {
  FileText,
  RefreshCw,
  Search,
  Activity,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Hash,
  Zap,
} from "lucide-react";

export default function FaskesAuditLogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [copiedTx, setCopiedTx] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }
    fetchLogs().finally(() => setLoading(false));
  }, []);

  const fetchLogs = async () => {
    setFetchingData(true);
    try {
      const result = await getHospitalAuditLogs();
      if (result.success && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          action: item.action,
          dataType: item.data_type || "-",
          status: item.status || "success",
          txHash: item.tx_hash || null,
          information: item.information || "-",
          createdAt: new Date(item.created_at || item.createdAt).toLocaleString("id-ID"),
        }));
        setLogs(mapped);
        setFilteredLogs(mapped);
      }
    } catch (err) {
      console.error("Error fetching audit logs", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleFilter = (search, actionFilter) => {
    let result = [...logs];
    if (actionFilter !== "all") {
      result = result.filter((l) => l.action.toLowerCase().includes(actionFilter.toLowerCase()));
    }
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.dataType.toLowerCase().includes(q) ||
          (l.txHash || "").toLowerCase().includes(q) ||
          (l.information || "").toLowerCase().includes(q)
      );
    }
    setFilteredLogs(result);
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTx(id);
      setTimeout(() => setCopiedTx(null), 2000);
    } catch {}
  };

  const formatActionName = (action) => {
    switch (action) {
      case "upload_rekam_medis": return "Upload Rekam Medis";
      case "update_rekam_medis": return "Update Rekam Medis";
      case "request_akses": return "Pengajuan Izin Akses";
      case "reupload_blockchain": return "Re-upload Blockchain";
      case "tambah_pasien": return "Pendaftaran Pasien";
      case "tambah_dokter": return "Penambahan Dokter";
      case "pos_transaksi": return "Transaksi Kasir POS";
      case "penyerahan_resep": return "Penyerahan Resep Obat";
      case "approve_akses": return "Izin Akses Disetujui";
      case "reject_akses": return "Izin Akses Ditolak";
      case "revoke_akses": return "Izin Akses Dicabut";
      default: return action.replace(/_/g, " ").toUpperCase();
    }
  };

  const totalLogs = logs.length;
  const successLogs = logs.filter((l) => l.status === "success").length;
  const failedLogs = logs.filter((l) => l.status !== "success").length;
  const onChainLogs = logs.filter((l) => l.txHash).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 sm:p-8 text-white shadow-xl mb-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-teal-600/15 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-300 font-bold">Audit Trail Faskes</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
                  <Activity className="h-7 w-7 text-teal-300" /> Log Aktivitas & Blockchain
                </h1>
                <p className="text-xs text-slate-300 mt-1.5 max-w-xl leading-relaxed">
                  Rekam jejak seluruh aktivitas rekam medis, permohonan izin akses, dan transaksi blockchain.
                </p>
              </div>
              <button
                onClick={fetchLogs}
                disabled={fetchingData}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer backdrop-blur-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetchingData ? "animate-spin" : ""}`} />
                Segarkan
              </button>
            </div>
          </div>

          {/* Unified 1-Frame Card */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100">
              {[
                { label: "Total Log", value: totalLogs, color: "text-slate-900", sub: "Semua Aktivitas" },
                { label: "Berhasil", value: successLogs, color: "text-[#16A34A]", sub: "Status SUCCESS" },
                { label: "Gagal", value: failedLogs, color: "text-[#D97706]", sub: "Status FAILED" },
                { label: "On-Chain", value: onChainLogs, color: "text-teal-800", sub: "Punya Tx Hash" },
              ].map((stat, i) => (
                <div key={i} className="p-4 sm:p-5 border-r border-slate-100 last:border-r-0">
                  <p className={`text-[10px] font-extrabold uppercase tracking-wider ${stat.color}`}>{stat.label}</p>
                  <h3 className={`text-2xl font-extrabold mt-0.5 ${stat.color}`}>{stat.value}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/60">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilter(e.target.value, filterAction);
                  }}
                  placeholder="Cari aksi, jenis data, tx hash..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={filterAction}
                  onChange={(e) => {
                    setFilterAction(e.target.value);
                    handleFilter(searchTerm, e.target.value);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-semibold focus:border-teal-600 focus:outline-none cursor-pointer"
                >
                  <option value="all">Semua Jenis Aksi</option>
                  <option value="upload">Upload Rekam Medis</option>
                  <option value="request">Request Akses</option>
                  <option value="approve">Akses Disetujui</option>
                  <option value="reject">Akses Ditolak</option>
                  <option value="revoke">Akses Dicabut</option>
                </select>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                  {filteredLogs.length} log
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold bg-slate-50/40 border-b border-slate-100">
                    <th className="px-5 py-3.5">Waktu</th>
                    <th className="px-5 py-3.5">Aksi</th>
                    <th className="px-5 py-3.5">Spesifikasi / Jenis Data</th>
                    <th className="px-5 py-3.5">Keterangan</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Blockchain Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="h-8 w-8 text-slate-200" />
                          <span>Belum ada log audit yang cocok.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((item) => (
                      <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                            {item.createdAt}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900">{formatActionName(item.action)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {item.dataType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={item.information}>
                          {item.information}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.status === "success" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[9px] font-bold text-[#16A34A]">
                              <CheckCircle className="h-3 w-3" /> SUCCESS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[9px] font-bold text-[#DC2626]">
                              <XCircle className="h-3 w-3" /> FAILED
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.txHash ? (
                            <div className="flex items-center gap-1.5">
                              <Hash className="h-3 w-3 text-teal-600 shrink-0" />
                              <TxHashLink
                                txHash={item.txHash}
                                className="font-mono text-[10px] text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md max-w-[120px] truncate"
                                title={item.txHash}
                              >
                                <span title={item.txHash}>
                                  {item.txHash.substring(0, 8)}...{item.txHash.slice(-6)}
                                </span>
                              </TxHashLink>
                              <button
                                onClick={() => copyToClipboard(item.txHash, item.id)}
                                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                title="Salin Tx Hash"
                              >
                                {copiedTx === item.id ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                              <Zap className="h-3 w-3 text-slate-300" /> Off-Chain
                            </span>
                          )}
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
    </div>
  );
}
