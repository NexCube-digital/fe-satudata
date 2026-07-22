"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../layout/Navbar";
import Sidebar from "../../../layout/Sidebar";
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
          patientName: item.patient?.name || "Pasien Terdaftar",
          nik: item.patient?.profil?.nik || "0000000000000000",
          walletAddress: item.patient?.wallet_address || "0x0000...0000",
          poli: item.requested_data || "Instalasi Medis",
          status: item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending Pasien" : item.status === "rejected" ? "Rejected" : "Revoked",
          txHash: item.tx_hash_response || item.tx_hash_request || "Menunggu Signature",
          requestedAt: new Date(item.created_at).toLocaleDateString("id-ID")
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.error("Error loading requests list:", err);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-rose-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-800 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-85 w-85 rounded-full bg-rose-700/10 blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Activity className="h-8 w-8 text-rose-400" />
                Histori Permintaan Akses
              </h1>
              <p className="text-xs sm:text-sm text-rose-200 mt-2 max-w-2xl leading-relaxed">
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
                  <Activity className="h-5 w-5 text-rose-800" />
                  Logs Otorisasi Akses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar permohonan akses data medis yang diajukan</p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-[10px] focus:outline-hidden focus:border-rose-800 bg-slate-50 font-bold"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending pasien">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="revoked">Revoked</option>
                </select>

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
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4 rounded-l-xl">Pasien</th>
                      <th className="py-3 px-4">Spesifikasi Permintaan</th>
                      <th className="py-3 px-4">Status Consent</th>
                      <th className="py-3 px-4">Tgl Pengajuan</th>
                      <th className="py-3 px-4 rounded-r-xl">Tx Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{req.patientName}</p>
                          <p className="font-mono text-[9px] text-slate-400 mt-0.5">NIK: {req.nik}</p>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-700">{req.poli}</td>
                        <td className="py-4 px-4">
                          {req.status === "Approved" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-bold text-rose-900">
                              <CheckCircle className="h-3 w-3" /> Approved
                            </span>
                          ) : req.status === "Pending Pasien" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-250 px-2.5 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-250 px-2.5 py-0.5 text-[9px] font-bold text-rose-700">
                              <AlertCircle className="h-3 w-3" /> {req.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-semibold">{req.requestedAt}</td>
                        <td className="py-4 px-4 font-mono text-[9px] text-rose-900 max-w-[120px] truncate" title={req.txHash}>
                          {req.txHash}
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
