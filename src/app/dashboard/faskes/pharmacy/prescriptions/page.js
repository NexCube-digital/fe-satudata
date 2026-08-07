"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { apiGet, apiPut } from "@/lib/api";
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  User, 
  Calendar, 
  Hash, 
  ChevronRight,
  Pill,
  Filter,
  Check
} from "lucide-react";
import TxHashLink from "@/components/ui/TxHashLink";

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/hospital/pharmacy/prescriptions");
      if (res.success) {
        setPrescriptions(res.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat resep:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
    fetchPrescriptions();
  }, []);

  const handleUpdateStatus = async (recordId, newStatus) => {
    setUpdatingId(recordId);
    try {
      const res = await apiPut(`/api/hospital/pharmacy/prescriptions/${recordId}/status`, { status: newStatus });
      if (res.success) {
        setPrescriptions(prev => prev.map(p => p.id === recordId ? { ...p, status_resep: newStatus } : p));
        if (selectedRecord && selectedRecord.id === recordId) {
          setSelectedRecord(prev => ({ ...prev, status_resep: newStatus }));
        }

        // Jika staf farmasi mengubah status resep ke "Siap Diambil" atau "Selesai", otomatis majukan alur pasien ke Step 4 (Pelunasan & Billing)
        if (newStatus === "Siap Diambil" || newStatus === "Selesai") {
          localStorage.setItem("activePatientStage", "4");
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (err) {
      console.error("Gagal memperbarui status resep:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = prescriptions.filter(p => {
    const matchSearch = p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
                        p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.list_of_medicines.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status_resep === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0 font-sans text-slate-900">
      <Navbar user={user} roleLabel="Staf Farmasi & Apotek" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-1">
                <Pill className="h-4 w-4" /> Modul Apoteker & Penyerahan Obat
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Antrean Resep Obat Dokter</h1>
              <p className="text-xs text-slate-500">Daftar resep dari rekam medis pasien yang masuk ke unit farmasi.</p>
            </div>

            <button
              onClick={fetchPrescriptions}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-rose-700" : ""}`} /> Refresh Data
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pasien, obat, atau judul resep..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:border-rose-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["all", "Menunggu", "Diproses", "Siap Diambil", "Selesai"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      statusFilter === st
                        ? "bg-rose-800 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st === "all" ? "Semua Status" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Prescriptions */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-rose-700 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Memuat data resep obat...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700">Tidak Ada Antrean Resep</p>
                <p className="text-xs text-slate-400">Tidak ada data resep yang sesuai dengan kriteria pencarian.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <div key={item.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status_resep === "Selesai"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status_resep === "Siap Diambil"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : item.status_resep === "Diproses"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {item.status_resep}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">{item.patient_name}</h3>
                        <span className="text-xs text-slate-400">• {item.visit_date}</span>
                      </div>

                      <p className="text-xs font-semibold text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-500 font-mono bg-slate-100 px-3 py-1.5 rounded-xl inline-block max-w-xl truncate">
                        {item.list_of_medicines}
                      </p>

                      {item.tx_hash && (
                        <div className="pt-1">
                          <TxHashLink txHash={item.tx_hash} className="text-[10px] text-rose-700 font-bold font-mono">
                            <span>Tx: {item.tx_hash.slice(0, 20)}...</span>
                          </TxHashLink>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {item.status_resep === "Menunggu" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "Diproses")}
                          disabled={updatingId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Mulai Diproses →
                        </button>
                      )}

                      {item.status_resep === "Diproses" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "Siap Diambil")}
                          disabled={updatingId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Tandai Siap Diambil →
                        </button>
                      )}

                      {item.status_resep === "Siap Diambil" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "Selesai")}
                          disabled={updatingId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Tandai Selesai & Diserahkan ✔
                        </button>
                      )}

                      {item.status_resep === "Selesai" && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                          ✔ Selesai Diserahkan
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        Detail Resep
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Detail Resep */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Detail Resep Pasien</h3>
                <p className="text-xs text-slate-500">{selectedRecord.patient_name} • {selectedRecord.visit_date}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Daftar Obat & Aturan Pakai</span>
                <p className="font-mono text-slate-800 text-sm whitespace-pre-line leading-relaxed">{selectedRecord.list_of_medicines}</p>
              </div>

              {selectedRecord.note && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Catatan Dokter</span>
                  <p className="text-slate-700">{selectedRecord.note}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-600">Ubah Status Resep:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleUpdateStatus(selectedRecord.id, "Diproses")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRecord.status_resep === "Diproses" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Diproses
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRecord.id, "Siap Diambil")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRecord.status_resep === "Siap Diambil" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Siap Diambil
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRecord.id, "Selesai")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRecord.status_resep === "Selesai" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-rose-800 text-white font-bold text-xs hover:bg-rose-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
