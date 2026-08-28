"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import {
  Activity,
  Building2,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Inbox,
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
    <div ref={ref} className="relative min-w-[150px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
          open
            ? "border-primary bg-secondary-tint/40 ring-2 ring-teal-200/50 shadow-xs"
            : value !== "all"
            ? "border-teal-300 bg-secondary-tint/30 text-primary"
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
        <div className="absolute top-full right-0 mt-2 z-50 min-w-[180px] w-max rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in max-h-64 overflow-y-auto">
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
                    ? "bg-secondary-tint text-primary"
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

export default function FaskesRequestsHistory() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestsList, setRequestsList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchRequestsList();
    setLoading(false);
  }, []);

  const fetchRequestsList = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.patient_id,
          patientName: item.patient_name || item.Patient?.name || item.patient?.name || "Pasien Terdaftar",
          nik: item.patient_nik || item.Patient?.profil?.nik || item.patient?.profil?.nik || "-",
          walletAddress: item.Patient?.wallet_address || item.patient?.wallet_address || "0x0000...0000",
          poli: item.requested_data || item.poli_dokter || "Instalasi Medis",
          status: item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending Pasien" : item.status === "rejected" ? "Rejected" : "Revoked",
          txHash: item.tx_hash || item.txHash || "0x7f8a3b21c49e0d15a82f",
          requestedAt: new Date(item.created_at).toLocaleDateString("id-ID")
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.error("Error loading requests list:", err);
    }
  };

  const maskNik = (nik) => {
    if (!nik || nik === "-") return "-";
    const str = String(nik);
    if (str.length < 16) return str;
    return str.slice(0, 6) + "******" + str.slice(12);
  };

  const formatTxHash = (hash) => {
    if (!hash) return "0x7f8a3b21c49e0d15...";
    const str = String(hash);
    if (str.length <= 18) return str;
    return str.slice(0, 18) + "...";
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const filteredRequests = requestsList.filter((req) => {
    if (filterStatus !== "all" && req.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    return (
      req.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.poli.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-5 py-4 text-white shadow-md mb-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-2xl" />
            <div className="relative z-10">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Activity className="h-6 w-6 text-teal-200" />
                Histori Permintaan Akses
              </h1>
              <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                Tinjau dan pantau seluruh histori pengajuan izin akses rekam medis (EHR) terenkripsi dari pihak pasien secara real-time.
              </p>
            </div>
          </div>

          {/* Table Card (Full Width) */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Logs Otorisasi Akses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar permohonan akses data medis yang diajukan</p>
              </div>

              {/* Swapped Search and Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. Search Input (First) */}
                <div className="relative w-48 sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari pasien / NIK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-primary focus:outline-hidden transition text-slate-800"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. Modern Filter Select (Second / Swapped) */}
                <ModernFilterSelect
                  icon={Filter}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: "all", label: "Semua Status" },
                    { value: "pending pasien", label: "Pending Pasien" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "revoked", label: "Revoked" }
                  ]}
                />
              </div>
            </div>

            {/* Table Data */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 border border-dashed border-slate-150 rounded-2xl">
                <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Tidak ada data permintaan ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4 text-center rounded-l-xl">Tanggal Pengajuan</th>
                      <th className="py-3 px-4 text-center">Pasien / NIK</th>
                      <th className="py-3 px-4 text-center">Tx Hash</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{req.requestedAt}</td>
                        <td className="py-3.5 px-4 text-center">
                          <p className="font-bold text-slate-900">{req.patientName}</p>
                          <p className="font-mono text-[9px] text-slate-400 mt-0.5">NIK: {maskNik(req.nik)}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-primary font-bold">
                          <TxHashLink txHash={req.txHash || "0x7f8a3b21c49e0d15a82f"} className="inline-flex items-center gap-1 justify-center" title={req.txHash}>
                            <span>{formatTxHash(req.txHash || "0x7f8a3b21c49e0d15a82f")}</span>
                          </TxHashLink>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {req.status === "Approved" ? (
                            <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle className="h-3 w-3 text-emerald-600" /> Approved
                            </span>
                          ) : req.status === "Pending Pasien" ? (
                            <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-50 border border-amber-250 px-3 py-1 text-[10px] font-bold text-amber-700 animate-pulse">
                              <Clock className="h-3 w-3 text-amber-600" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-secondary-tint border border-teal-200 px-3 py-1 text-[10px] font-bold text-primary">
                              <AlertCircle className="h-3 w-3" /> {req.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
