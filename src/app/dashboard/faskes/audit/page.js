"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
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
  ExternalLink
} from "lucide-react";

export default function FaskesAuditLogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Invalid user data", e);
      }
    }

    fetchLogs().finally(() => setLoading(false));
  }, []);

  const fetchLogs = async () => {
    try {
      const result = await getHospitalAuditLogs();
      if (result.success && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          action: item.action,
          dataType: item.data_type || "-",
          status: item.status || "success",
          txHash: item.tx_hash || "-",
          information: item.information || "-",
          createdAt: new Date(item.created_at || item.createdAt).toLocaleString("id-ID")
        }));
        setLogs(mapped);
        setFilteredLogs(mapped);
      }
    } catch (err) {
      console.error("Error fetching audit logs", err);
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
          l.txHash.toLowerCase().includes(q)
      );
    }
    setFilteredLogs(result);
  };

  const formatActionName = (action) => {
    switch (action) {
      case "upload_rekam_medis":
        return "Upload Rekam Medis";
      case "update_rekam_medis":
        return "Update Rekam Medis";
      case "request_akses":
        return "Pengajuan Izin Akses";
      case "approve_akses":
        return "Izin Akses Disetujui";
      case "reject_akses":
        return "Izin Akses Ditolak";
      case "revoke_akses":
        return "Izin Akses Dicabut";
      default:
        return action.replace(/_/g, " ").toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-rose-700/10 blur-3xl" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-300 font-bold">Audit Trail Faskes</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-2">
                <Activity className="h-8 w-8 text-rose-400" /> Log Aktivitas & Audit Trail Blockchain
              </h1>
              <p className="text-xs sm:text-sm text-rose-200 mt-2 max-w-2xl leading-relaxed">
                Pelacakan mendetail abadi mengenai seluruh aktivitas unggah rekam medis, permohonan izin akses, dan transaksi terenkripsi yang tercatat di sistem & blockchain.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <section className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-rose-800" /> Log Aktivitas Faskes
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Seluruh log audit transaksi fasilitas kesehatan Anda.</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                    {logs.length} Total Log
                  </span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-2.5 text-xs text-slate-800 focus:border-rose-700 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={filterAction}
                      onChange={(e) => {
                        setFilterAction(e.target.value);
                        handleFilter(searchTerm, e.target.value);
                      }}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 font-semibold focus:border-rose-700 focus:outline-none"
                    >
                      <option value="all">Semua Jenis Aksi</option>
                      <option value="upload">Upload Rekam Medis</option>
                      <option value="request">Request Akses</option>
                      <option value="approve">Akses Disetujui</option>
                      <option value="revoke">Akses Dicabut</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                        <th className="px-4 py-3">Waktu</th>
                        <th className="px-4 py-3">Aksi</th>
                        <th className="px-4 py-3">Spesifikasi / Jenis Data</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Tx Hash Blockchain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.map((item) => (
                        <tr key={item.id} className="rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 transition">
                          <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{item.createdAt}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900">{formatActionName(item.action)}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{item.dataType}</td>
                          <td className="px-4 py-3">
                            {item.status === "success" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                <CheckCircle className="h-3 w-3" /> Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-bold text-rose-800">
                                <XCircle className="h-3 w-3" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-rose-800 max-w-[180px] truncate" title={item.txHash}>
                            {item.txHash}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredLogs.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 mt-3">
                      Belum ada log audit yang cocok dengan pencarian.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
