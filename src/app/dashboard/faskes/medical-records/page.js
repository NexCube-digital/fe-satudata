"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { FileText, Plus, Search, ArrowUpRight, RefreshCw } from "lucide-react";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

export default function FaskesMedicalRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Invalid user data", e);
      }
    }

    fetchRecords().finally(() => setLoading(false));
  }, []);

  const fetchRecords = async () => {
    try {
      const result = await getHospitalMedicalRecords();
      if (result.success && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.user_id,
          patientName: item.Owner?.name || "Pasien Tidak Diketahui",
          recordType: item.record_type,
          title: item.title,
          visitDate: item.visit_date,
          doctorName: item.doctor?.name || "-",
          status: item.status,
          dataHash: item.data_hash,
          txHash: item.tx_hash || item.data_hash || "Menunggu Konfirmasi Blockchain",
          blockchainStatus: item.blockchain_status || "pending"
        }));
        setRecords(mapped);
        setFilteredRecords(mapped);
      }
    } catch (err) {
      console.error("Error fetching medical records", err);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = records.filter((rec) =>
      [rec.patientName, rec.title, rec.recordType, rec.doctorName, rec.txHash]
        .join(" ")
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700 font-bold">Dashboard Faskes</p>
              <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Upload & Kelola Rekam Medis</h1>
              <p className="max-w-2xl text-sm text-slate-500 mt-2">Unggah rekam medis terenkripsi dengan ketentuan backend, lalu blockchain akan menghasilkan tx hash sebagai bukti rekam.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/faskes/medical-records/upload")}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
            >
              <Plus className="h-4 w-4" /> Upload Baru
            </button>
          </div>

          <div className="space-y-8">
            <section className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Semua Rekam Medis</h2>
                    <p className="text-xs text-slate-500 mt-1">Daftar rekam medis yang sudah diunggah dari rumah sakit Anda.</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">{records.length} Berkas</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-80">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Cari pasien, judul, tx hash..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm text-slate-800 focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 border border-rose-100">{records.filter((r) => r.blockchainStatus === "confirmed").length} On-chain</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200">{records.filter((r) => r.blockchainStatus !== "confirmed").length} Menunggu Chain</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-4 py-3">Pasien</th>
                          <th className="px-4 py-3">Jenis Rekam Medis</th>
                          <th className="px-4 py-3">Dokter</th>
                          <th className="px-4 py-3">Visit Date</th>
                          <th className="px-4 py-3">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((item) => (
                          <tr key={item.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 transition hover:bg-slate-100">
                            <td className="px-4 py-4 font-semibold text-slate-900">{item.patientName}</td>
                            <td className="px-4 py-4 text-slate-700">{item.recordType.toUpperCase()}</td>
                            <td className="px-4 py-4 text-slate-700">{item.doctorName}</td>
                            <td className="px-4 py-4 text-slate-700">{new Date(item.visitDate).toLocaleDateString("id-ID")}</td>
                            <td className="px-4 py-4 font-mono text-xs text-rose-700 break-all">{item.txHash}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredRecords.length === 0 && (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                        Belum ada rekam medis yang cocok dengan pencarian.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
