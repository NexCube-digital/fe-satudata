"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
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

  const pendingRequestsList = requests.filter((r) => r.status === "pending");
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

        <main className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 sm:py-4 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#115E59] p-4 sm:p-5 text-white shadow-md mb-3">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/40 bg-white/15 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-teal-50 backdrop-blur-md mb-1">
                <ShieldCheck className="h-3 w-3 text-teal-200 shrink-0" />
                <span>Kendali Hak Akses Terdesentralisasi (Sovereign Consent)</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                Manajemen Persetujuan Akses Faskes
              </h1>
              <p className="text-[11px] sm:text-xs text-teal-100/90 mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-none">
                Kelola izin baca rekam medis Anda ke fasilitas kesehatan secara granul, transparan, dan dapat dicabut sewaktu-waktu melalui smart contract.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar - 3 Columns Side-by-Side on Mobile */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 mb-3">
            <div className="rounded-2xl bg-white p-2.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Disetujui</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                {requests.filter((r) => r.status === "approved").length} <span className="text-[9px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Faskes</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-emerald-600 mt-0.5 flex items-center gap-0.5 truncate">
                <CheckCircle className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">Hak Baca Aktif</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-2.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Menunggu</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                {requests.filter((r) => r.status === "pending").length} <span className="text-[9px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Req</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-amber-600 mt-0.5 flex items-center gap-0.5 truncate">
                <Radio className="h-2.5 w-2.5 animate-pulse shrink-0" /> <span className="truncate">Butuh Tindakan</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-2.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">Dicabut</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-secondary-tint text-primary shrink-0">
                  <ShieldX className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
                {requests.filter((r) => r.status === "revoked" || r.status === "rejected").length} <span className="text-[9px] sm:text-xs font-normal text-slate-500 hidden sm:inline">Faskes</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-primary mt-0.5 flex items-center gap-0.5 truncate">
                <Lock className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">Dikunci Pasien</span>
              </p>
            </div>
          </div>

          {/* Main Layout */}
          <div className="w-full space-y-4">
            {/* SECTION 1: PERMINTAAN AKSES BARU */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-3.5 sm:p-5 shadow-2xs">
              <div className="border-b border-slate-100 pb-2.5 mb-3">
                <h3 className="text-xs sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
                  Permintaan Akses Baru ({pendingRequestsList.length})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Permintaan akses medis dari rumah sakit yang memerlukan otorisasi Anda.</p>
              </div>

              <div className="space-y-3">
                {pendingRequestsList.length === 0 ? (
                  <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-6 text-center">
                    <ShieldCheck className="h-7 w-7 text-emerald-600/70 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-500">Semua Permintaan Selesai</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada faskes yang sedang mengantre meminta persetujuan Anda.</p>
                  </div>
                ) : (
                  pendingRequestsList.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-slate-200/90 p-3 transition-all duration-200 hover:border-teal-300 hover:shadow-xs bg-slate-50/40"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs font-bold text-slate-800 text-xs">
                            {req.hospitalName.charAt(0)}{req.hospitalName.charAt(3)}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none">{req.hospitalName}</h4>
                              <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">({req.hospitalCode})</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{req.department}</p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse shrink-0">
                          <Clock className="h-2.5 w-2.5 text-amber-600" />
                          Menunggu
                        </span>
                      </div>

                      {/* Scope */}
                      <div className="space-y-1.5 mb-2.5">
                        <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Cakupan Hak Baca Data:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {req.accessScope.map((scope, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-700 border border-slate-200/60"
                            >
                              • {scope}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-slate-200/60 pt-2 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="font-mono text-[9px] text-slate-400 truncate max-w-[180px] sm:max-w-none">
                          Tx Hash: <TxHashLink txHash={req.txHash} className="text-primary font-bold inline-flex items-center gap-0.5" title={req.txHash}><span>{req.txHash}</span></TxHashLink>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAction(req.id, "approved")}
                            disabled={submittingId === req.id}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white transition shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {submittingId === req.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Setujui
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "rejected")}
                            disabled={submittingId === req.id}
                            className="rounded-lg bg-slate-200 hover:bg-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition cursor-pointer disabled:opacity-50"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
