"use client";

import { useState, useEffect, useRef } from "react";
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
  History,
  Filter,
  ChevronDown,
  Check,
  X
} from "lucide-react";

function ModernFilterSelect({ options, value, onChange, icon: Icon, placeholder = "Pilih Status..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value.toLowerCase() === value.toLowerCase()) || options[0];

  return (
    <div ref={ref} className="relative min-w-[150px] sm:min-w-[170px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
          open
            ? "border-primary bg-teal-50/60 ring-2 ring-teal-200/60 shadow-xs text-primary"
            : value !== "all"
            ? "border-teal-300 bg-teal-50/40 text-teal-800"
            : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-white"
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${value !== "all" ? "text-primary" : "text-slate-400"}`} />}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 min-w-[170px] w-max rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-teal-50 text-primary"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="leading-snug">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
          duration: item.status === "approved"
            ? "Selamanya (sampai dicabut)"
            : item.status === "revoked" || item.status === "rejected"
              ? "Kadaluarsa"
              : "Menunggu persetujuan",
          status: item.status || "pending",
          txHash: item.tx_hash || item.txHash || "",
          grantedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID"),
          expiresAt: item.status === "approved"
            ? "Selama akses aktif"
            : new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID")
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
      (req.txHash || "").toLowerCase().includes(searchTerm.toLowerCase());

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
          <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#115E59] p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/40 bg-white/15 px-3.5 py-1 text-xs font-semibold text-teal-50 backdrop-blur-md mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-200" />
                  Pusat Kendali Hak Akses Terdesentralisasi (Sovereign Consent)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Riwayat Otorisasi Akses
                </h1>
                <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl leading-relaxed">
                  Daftar lengkap riwayat izin akses faskes beserta verifikasi hash transaksi pada blockchain.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
          </div>

          {/* Main Layout */}
          <div className="w-full space-y-8">
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

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-60">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari dalam histori..."
                      className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-medium focus:border-primary focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-200/50 transition text-slate-800"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Modern Filter Select */}
                  <ModernFilterSelect
                    icon={Filter}
                    value={activeTab}
                    onChange={setActiveTab}
                    options={[
                      { value: "all", label: "Semua Status" },
                      { value: "approved", label: "Aktif (Disetujui)" },
                      { value: "revoked", label: "Dicabut (Revoked)" }
                    ]}
                  />
                </div>
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
                          <span className="text-slate-400 block">Masa Berlaku :</span>
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
