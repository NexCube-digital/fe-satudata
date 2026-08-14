"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TxHashLink from "@/components/ui/TxHashLink";
import ModernSelect from "@/components/ui/ModernSelect";
import {
  Activity,
  Building2,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Inbox
} from "lucide-react";

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
          status: item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending" : item.status === "rejected" ? "Rejected" : "Revoked",
          rawStatus: item.status,
          txHash: item.tx_hash || item.txHash || null,
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
      <div className="space-y-6">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-teal-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-teal-800 text-white font-bold text-sm shadow-md hover:bg-teal-700 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      

      <div>
        

        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-teal-800/40 bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-teal-700/10 blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Activity className="h-8 w-8 text-teal-400" />
                Histori Permintaan Akses
              </h1>
              <p className="text-xs sm:text-sm text-teal-200 mt-2 max-w-2xl leading-relaxed">
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
                  <Activity className="h-5 w-5 text-teal-800" />
                  Logs Otorisasi Akses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar permohonan akses data medis yang diajukan</p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="w-40">
                  <ModernSelect
                    options={[
                      { value: "all", label: "Semua Status" },
                      { value: "approved", label: "Approved" },
                      { value: "pending", label: "Pending" },
                      { value: "rejected", label: "Rejected" },
                      { value: "revoked", label: "Revoked" },
                    ]}
                    value={filterStatus}
                    onChange={(val) => setFilterStatus(val)}
                  />
                </div>

                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-[10px] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden transition"
                  />
                </div>
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
                        <th className="py-3 px-4 rounded-l-xl text-center">Tgl Pengajuan</th>
                        <th className="py-3 px-4 text-center">Pasien</th>
                        <th className="py-3 px-4 text-center">Tx Hash</th>
                        <th className="py-3 px-4 rounded-r-xl text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-4 text-slate-500 font-semibold text-center">{req.requestedAt}</td>
                          <td className="py-4 px-4 text-center">
                            <p className="font-bold text-slate-900">{req.patientName}</p>
                            <p className="font-mono text-[9px] text-slate-400 mt-0.5">NIK: {maskNik(req.nik)}</p>
                          </td>
                          <td className="py-4 px-4 font-mono text-[9px] text-teal-900 text-center max-w-[200px]" title={req.txHash}>
                            {req.txHash ? (
                              <TxHashLink txHash={req.txHash} className="inline-flex items-center justify-center gap-1 font-bold text-teal-700 mx-auto" title={req.txHash}>
                                <span className="truncate max-w-[180px]">{req.txHash}</span>
                              </TxHashLink>
                            ) : (
                              <span className="text-slate-300 italic font-sans">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {req.rawStatus === "approved" || req.status === "Approved" ? (
                              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[9px] font-bold text-[#16A34A] uppercase">
                                <CheckCircle className="h-3 w-3 text-[#16A34A]" /> Approved
                              </span>
                            ) : req.rawStatus === "pending" || req.status === "Pending" ? (
                              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[9px] font-bold text-[#D97706] uppercase animate-pulse">
                                <Clock className="h-3 w-3 text-[#D97706]" /> Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[9px] font-bold text-[#DC2626] uppercase">
                                <AlertCircle className="h-3 w-3 text-[#DC2626]" /> {req.status}
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
        </div>
      </div>
    </div>
  );
}
