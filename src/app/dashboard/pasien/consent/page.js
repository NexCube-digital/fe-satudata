"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../layout/Navbar";
import Sidebar from "../../layout/Sidebar";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Building2,
  Lock,
  Unlock,
  Key,
  Database,
  Search,
  ArrowRight,
  Zap,
  Info,
  Radio
} from "lucide-react";

export default function PatientConsentPage() {
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
          txHash: item.tx_hash_response || item.tx_hash_request || "Menunggu Otorisasi",
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

  // Perform Consent Action (Approve / Reject / Revoke)
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

  const filteredRequests = requests.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch =
      r.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hospitalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.txHash.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
                  Pusat Kendali Hak Akses Terdesentralisasi (Sovereign Consent)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Manajemen Persetujuan Akses Faskes
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Kelola izin baca rekam medis Anda ke fasilitas kesehatan secara granul, transparan, dan dapat dicabut sewaktu-waktu melalui smart contract.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Gas Fee Standard</p>
                  <p className="font-bold text-emerald-400 mt-0.5">0 ETH (EIP-2771 Relay)</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Smart Contract</p>
                  <p className="font-bold text-rose-300 mt-0.5">SatuDataAccessControl.sol</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Disetujui</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {requests.filter((r) => r.status === "approved").length} <span className="text-xs font-normal text-slate-500">Faskes</span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Hak Baca Aktif Real-time
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Permintaan Menunggu</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {requests.filter((r) => r.status === "pending").length} <span className="text-xs font-normal text-slate-500">Request</span>
              </p>
              <p className="text-[10px] font-medium text-amber-600 mt-1 flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse" /> Memerlukan Tindakan Pasien
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Akses Dicabut</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShieldX className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {requests.filter((r) => r.status === "revoked" || r.status === "rejected").length} <span className="text-xs font-normal text-slate-500">Faskes</span>
              </p>
              <p className="text-[10px] font-medium text-rose-600 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Dekripsi Dikunci Pasien
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Otorisasi Relay</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Zap className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                EIP-2771 <span className="text-xs font-normal text-slate-500">Relayer</span>
              </p>
              <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Transaksi Tanpa Potongan Gas
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Column (2 Cols): Tabs, Search & Consent Cards List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter Tabs & Search Bar */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Status Tabs */}
                  <div className="flex flex-wrap gap-1 border-b sm:border-b-0 border-slate-100 pb-2 sm:pb-0">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === "all"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Semua ({requests.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("approved")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === "approved"
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Disetujui ({requests.filter((r) => r.status === "approved").length})
                    </button>
                    <button
                      onClick={() => setActiveTab("pending")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === "pending"
                          ? "bg-amber-500 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Menunggu ({requests.filter((r) => r.status === "pending").length})
                    </button>
                    <button
                      onClick={() => setActiveTab("revoked")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeTab === "revoked"
                          ? "bg-rose-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Dicabut ({requests.filter((r) => r.status === "revoked" || r.status === "rejected").length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari faskes atau kode..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Consent Cards List */}
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center">
                    <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-700">Tidak ada persetujuan ditemukan</h3>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pilihan tab atau kata kunci pencarian Anda.</p>
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                        <div className="flex items-start gap-3.5">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 font-bold text-rose-700 text-sm shadow-2xs">
                            {req.hospitalName.charAt(0)}{req.hospitalName.charAt(3)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-slate-900">{req.hospitalName}</h3>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
                                {req.hospitalCode}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{req.department}</p>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div>
                          {req.status === "approved" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              Akses Disetujui
                            </span>
                          )}
                          {req.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 animate-pulse">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              Permintaan Akses Baru
                            </span>
                          )}
                          {(req.status === "revoked" || req.status === "rejected") && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                              <Lock className="h-3.5 w-3.5 text-rose-600" />
                              Izin Akses Dicabut
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scope & Details */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Cakupan Hak Baca Data (Data Scope)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {req.accessScope.map((scope, idx) => (
                              <span
                                key={idx}
                                className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200/60"
                              >
                                • {scope}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Masa Berlaku:</span>
                            <span className="font-bold text-slate-700">{req.duration}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Tanggal Izin:</span>
                            <span className="font-bold text-slate-700">{req.grantedAt}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Kadaluarsa:</span>
                            <span className="font-bold text-slate-700">{req.expiresAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100">
                        <div className="font-mono text-[10px] text-slate-500">
                          Tx Hash: <span className="text-rose-600 font-bold">{req.txHash}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(req.id, "approved")}
                                disabled={submittingId === req.id}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-bold text-white transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                Setujui Akses (grantAccess)
                              </button>
                              <button
                                onClick={() => handleAction(req.id, "rejected")}
                                disabled={submittingId === req.id}
                                className="rounded-xl bg-slate-200 hover:bg-slate-300 px-3.5 py-2 font-semibold text-slate-700 transition cursor-pointer"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          {req.status === "approved" && (
                            <button
                              onClick={() => handleAction(req.id, "revoked")}
                              disabled={submittingId === req.id}
                              className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-4 py-2 font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                              {submittingId === req.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                              Cabut Izin Akses (revokeAccess)
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

            {/* Right Column (1 Col): Audit Trail Feed & Blockchain Info */}
            <div className="space-y-6">
              {/* Audit Logs Console */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Database className="h-4 w-4 text-rose-600" />
                  Live Consent Audit Stream
                </h3>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${log.status === "success" ? "text-emerald-700" : "text-rose-700"}`}>
                          {log.action}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 font-medium text-[11px]">{log.hospital}</p>
                      <p className="text-[9px] font-mono text-rose-600 mt-1">Tx: {log.txHash}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Card */}
              <div className="rounded-3xl bg-gradient-to-br from-rose-950 to-red-950 p-6 text-white shadow-xl border border-rose-800/40">
                <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2 text-rose-300 flex items-center gap-2">
                  <Info className="h-4 w-4 text-rose-400" />
                  Prinsip Kedaulatan Pasien
                </h3>
                <p className="text-xs text-rose-200/80 leading-relaxed mb-4">
                  Setiap kali Anda menekan tombol *grantAccess()* atau *revokeAccess()*, smart contract SatuData memperbarui Access Control List (ACL) secara terdesentralisasi tanpa membebankan biaya gas ke pasien.
                </p>

                <div className="rounded-xl bg-black/30 p-3 text-[10px] font-mono text-rose-300 border border-rose-900/60">
                  <p>✔ EIP-2771 Gasless Meta-Transaction</p>
                  <p>✔ Standardized Medical Data Sovereignty</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
