"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle,
  RefreshCw,
  Building2,
  Lock,
  Unlock,
  Database,
  Search,
  Zap,
  Info,
  History
} from "lucide-react";

export default function PatientConsentHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  // Tab & Filter State
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Consent list state
  const [requests, setRequests] = useState([]);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        fetchRequestsFromBE();
        fetchAuditLogsFromBE();
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const fetchRequestsFromBE = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const beRequests = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          hospitalCode: item.hospital?.medical_license || "RS-N/A",
          department: "Unit Pelayanan Medis",
          doctorName: "Dokter Penanggung Jawab",
          accessScope: item.requested_data ? item.requested_data.split(",") : ["Riwayat Rekam Medis Terenkripsi"],
          duration: "30 Hari",
          status: item.status || "pending",
          txHash: null,
          grantedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID"),
          expiresAt: item.expire_time ? new Date(item.expire_time).toLocaleDateString("id-ID") : "-"
        }));

        setRequests(beRequests);
      }
    } catch (err) {
      console.log("Error loading requests", err);
    }
  };

  const fetchAuditLogsFromBE = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => {
          let actionText = item.action;
          if (item.action === "approve_akses") actionText = "grantAccess() Approved";
          if (item.action === "reject_akses") actionText = "Request Rejected";
          if (item.action === "revoke_akses") actionText = "revokeAccess() Executed";
          if (item.action === "lihat_detail_rekam_medis") actionText = "decryptEHR() Accessed";

          return {
            id: item.id,
            action: actionText,
            hospital: item.information || "SatuData Core",
            txHash: item.tx_hash ? `${item.tx_hash.substring(0, 6)}...${item.tx_hash.substring(item.tx_hash.length - 4)}` : "0x0000...0000",
            timestamp: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "long" }),
            status: item.status === "success" ? "success" : "error"
          };
        });
        setAuditLogs(mapped);
      }
    } catch (err) {
      console.log("Error loading audit logs", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleAction = async (requestId, targetStatus) => {
    setSubmittingId(requestId);
    const token = localStorage.getItem("accessToken");
    const generatedHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const endpointMap = {
        approved: `/api/patient/access-requests/${requestId}/approve`,
        rejected: `/api/patient/access-requests/${requestId}/reject`,
        revoked: `/api/patient/access-requests/${requestId}/revoke`
      };
      const endpoint = endpointMap[targetStatus];
      if (endpoint && token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ txHash: generatedHash })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          fetchRequestsFromBE();
          fetchAuditLogsFromBE();
        }
      }
    } catch (err) {
      console.log("BE action error", err);
    } finally {
      setSubmittingId(null);
    }
  };

  const historyRequestsList = requests.filter((r) => r.status !== "pending");

  const filteredHistory = requests.filter((req) => {
    if (req.status === "pending") return false;

    const matchesSearch =
      req.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.hospitalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.txHash.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "approved") return req.status === "approved";
    if (activeTab === "revoked") return req.status === "revoked" || req.status === "rejected";
    
    return true; // "all"
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-200 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
                  Pusat Kendali Hak Akses Terdesentralisasi (Sovereign Consent)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Riwayat Otorisasi Akses
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Daftar lengkap riwayat izin akses faskes beserta verifikasi hash transaksi pada blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Faskes</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-tint text-primary">
                  <Building2 className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {new Set(historyRequestsList.map((r) => r.hospitalName)).size} <span className="text-xs font-normal text-slate-500">Mitra</span>
              </p>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">Pernah Terhubung</p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Aktif</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {historyRequestsList.filter((r) => r.status === "approved").length} <span className="text-xs font-normal text-slate-500">Aktif</span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Memiliki Akses Baca
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Akses Dicabut</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-tint text-primary">
                  <ShieldX className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {historyRequestsList.filter((r) => r.status === "revoked" || r.status === "rejected").length} <span className="text-xs font-normal text-slate-500">Faskes</span>
              </p>
              <p className="text-[10px] font-medium text-primary mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Dekripsi Dikunci Pasien
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Otorisasi Relay</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                EIP-2771 <span className="text-xs font-normal text-slate-500">Relayer</span>
              </p>
              <p className="text-[10px] font-medium text-teal-700 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Transaksi Tanpa Potongan Gas
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Column (2 Cols): History list */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* SECTION 2: RIWAYAT PERSATUJUAN */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                      Riwayat & Status Persetujuan ({historyRequestsList.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Daftar izin akses yang telah Anda putuskan sebelumnya.</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setActiveTab("approved")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        activeTab === "approved" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      onClick={() => setActiveTab("revoked")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        activeTab === "revoked" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Dicabut
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari dalam histori..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-primary focus:outline-hidden bg-slate-50/50"
                  />
                </div>

                <div className="space-y-4">
                  {filteredHistory.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-8 text-center">
                      <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Histori Kosong</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada riwayat tindakan medis atau pencarian cocok.</p>
                    </div>
                  ) : (
                    filteredHistory.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-2xl border border-slate-200/90 p-4 transition-all duration-200 hover:border-teal-300 hover:shadow-xs bg-white"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-xs shadow-2xs">
                              {req.hospitalName.charAt(0)}{req.hospitalName.charAt(3)}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{req.hospitalName}</h4>
                                <span className="text-[10px] font-mono text-slate-400">({req.hospitalCode})</span>
                              </div>
                              <p className="text-xs text-slate-500">{req.department}</p>
                            </div>
                          </div>

                          <div>
                            {req.status === "approved" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                Akses Disetujui
                              </span>
                            )}
                            {(req.status === "revoked" || req.status === "rejected") && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-tint border border-teal-200 px-3 py-1 text-xs font-bold text-primary">
                                <Lock className="h-3.5 w-3.5 text-primary" />
                                Izin Akses Dicabut
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                          <div>
                            <span className="text-slate-400 block">Masa Berlaku:</span>
                            <span className="font-bold text-slate-700">{req.duration}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Tanggal Izin:</span>
                            <span className="font-bold text-slate-700">{req.grantedAt}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Kadaluarsa:</span>
                            <span className="font-bold text-slate-700">{req.expiresAt}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="font-mono text-[9px] text-slate-400">
                            Tx Hash: <TxHashLink txHash={req.txHash} className="text-primary font-bold inline-flex items-center gap-1" title={req.txHash}><span>{req.txHash}</span></TxHashLink>
                          </div>

                          <div>
                            {req.status === "approved" && (
                              <button
                                onClick={() => handleAction(req.id, "revoked")}
                                disabled={submittingId === req.id}
                                className="rounded-xl bg-secondary-tint border border-teal-200 text-primary-hover hover:bg-teal-100 px-4 py-2 font-bold transition cursor-pointer flex items-center gap-1.5"
                              >
                                {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                                Cabut Akses
                              </button>
                            )}

                            {req.status === "revoked" && (
                              <button
                                onClick={() => handleAction(req.id, "approved")}
                                disabled={submittingId === req.id}
                                className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-4 py-2 font-bold transition cursor-pointer flex items-center gap-1.5"
                              >
                                {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                                Izinkan Kembali
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Audit Trail Feed & Blockchain Info */}
            <div className="space-y-6">
              {/* Audit Logs Console */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Live Consent Audit Stream
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${log.status === "success" ? "text-emerald-700" : "text-primary"}`}>
                          {log.action}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 font-medium text-[11px]">{log.hospital}</p>
                      <p className="text-[9px] font-mono text-primary mt-1">Tx: <TxHashLink txHash={log.txHash} className="inline-flex items-center gap-1" title={log.txHash}><span>{log.txHash}</span></TxHashLink></p>
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
