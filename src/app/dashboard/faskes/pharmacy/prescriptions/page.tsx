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
import ModernSelect from "@/components/ui/ModernSelect";

function parseMedicineItems(rawStr, generalNote) {
  if (!rawStr) return [];
  
  if (Array.isArray(rawStr)) {
    return rawStr.map(i => ({
      name: i.medicine || i.name || "Obat",
      dosage: i.dosage || i.rule || i.aturan_pakai || "Sesuai petunjuk dokter",
      quantity: i.quantity || i.qty || i.jumlah || null,
      note: i.note || generalNote || ""
    }));
  }

  if (typeof rawStr === "string") {
    let str = rawStr.trim();
    if (str.startsWith("[") || str.startsWith("{")) {
      try {
        const parsed = JSON.parse(str);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map(i => ({
          name: i.medicine || i.name || "Obat",
          dosage: i.dosage || i.rule || i.aturan_pakai || "Sesuai petunjuk dokter",
          quantity: i.quantity || i.qty || i.jumlah || null,
          note: i.note || generalNote || ""
        }));
      } catch (e) {}
    }

    if (str.includes(";")) {
      return str.split(";").map(part => {
        const p = part.trim();
        if (!p) return null;
        const parts = p.split(":");
        return {
          name: parts[0]?.trim() || "Obat",
          dosage: parts[1]?.trim() || "Sesuai petunjuk dokter",
          quantity: null,
          note: generalNote || ""
        };
      }).filter(Boolean);
    }

    if (str.includes(",")) {
      return str.split(",").map(part => {
        const p = part.trim();
        if (!p) return null;
        if (p.includes(":")) {
          const parts = p.split(":");
          return {
            name: parts[0]?.trim() || "Obat",
            dosage: parts[1]?.trim() || "Sesuai petunjuk dokter",
            quantity: null,
            note: generalNote || ""
          };
        }
        const match = p.match(/^(.*?)(?:\s*\((.*?)\))?$/);
        return {
          name: match && match[1] ? match[1].trim() : p,
          dosage: match && match[2] ? match[2].trim() : "Sesuai petunjuk dokter",
          quantity: null,
          note: generalNote || ""
        };
      }).filter(Boolean);
    }

    if (str.includes(":")) {
      const parts = str.split(":");
      return [{
        name: parts[0]?.trim() || "Obat",
        dosage: parts[1]?.trim() || "Sesuai petunjuk dokter",
        quantity: null,
        note: generalNote || ""
      }];
    }

    const match = str.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    return [{
      name: match && match[1] ? match[1].trim() : str,
      dosage: match && match[2] ? match[2].trim() : "Sesuai petunjuk dokter",
      quantity: null,
      note: generalNote || ""
    }];
  }

  return [{
    name: "Obat",
    dosage: "Sesuai petunjuk dokter",
    quantity: null,
    note: generalNote || ""
  }];
}

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
    router.push("/login");
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
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-800 uppercase tracking-wider mb-1">
                <Pill className="h-4 w-4" /> Modul Apoteker & Penyerahan Obat
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Antrean Resep Obat Dokter</h1>
              <p className="text-xs text-slate-500">Daftar resep dari rekam medis pasien yang masuk ke unit farmasi.</p>
            </div>

            <button
              onClick={fetchPrescriptions}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-700" : ""}`} /> Refresh Data
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
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">Filter Status:</span>
              <div className="w-44">
                <ModernSelect
                  options={[
                    { value: "all", label: "Semua Status" },
                    { value: "Menunggu", label: "Menunggu" },
                    { value: "Diproses", label: "Diproses" },
                    { value: "Siap Diambil", label: "Siap Diambil" },
                    { value: "Selesai", label: "Selesai" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                />
              </div>
            </div>
          </div>

          {/* List of Prescriptions */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-teal-700 mx-auto" />
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
                            ? "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                            : item.status_resep === "Siap Diambil"
                            ? "bg-sky-50 text-[#0284C7] border border-sky-200"
                            : item.status_resep === "Diproses"
                            ? "bg-amber-50 text-[#D97706] border border-amber-200"
                            : "bg-teal-50 text-teal-900 border border-teal-200"
                        }`}>
                          {item.status_resep}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">{item.patient_name}</h3>
                        <span className="text-xs text-slate-400">• {item.visit_date}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                        {parseMedicineItems(item.list_of_medicines, item.note).map((med, mIdx) => (
                          <div key={mIdx} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 text-xs space-y-1">
                            <div className="flex items-center justify-between gap-2 font-bold text-slate-800">
                              <span className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                                <Pill className="h-3.5 w-3.5 text-teal-800 shrink-0" />
                                {med.name}
                              </span>
                              {med.quantity && (
                                <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md font-mono">
                                  {med.quantity}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                              <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">Aturan:</span>
                              <span className="font-semibold text-teal-900">{med.dosage}</span>
                            </p>
                          </div>
                        ))}
                      </div>

                      {item.tx_hash && (
                        <div className="pt-1">
                          <TxHashLink txHash={item.tx_hash} className="text-[10px] text-teal-800 font-bold font-mono">
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
                          className="px-3.5 py-2 rounded-xl bg-[#D97706] hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Mulai Diproses →
                        </button>
                      )}

                      {item.status_resep === "Diproses" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "Siap Diambil")}
                          disabled={updatingId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-[#0284C7] hover:bg-sky-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Tandai Siap Diambil →
                        </button>
                      )}

                      {item.status_resep === "Siap Diambil" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "Selesai")}
                          disabled={updatingId === item.id}
                          className="px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                        >
                          Tandai Selesai & Diserahkan ✔
                        </button>
                      )}

                      {item.status_resep === "Selesai" && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] font-bold text-xs">
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
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Rincian Resep & Catatan Obat Per Obat ({parseMedicineItems(selectedRecord.list_of_medicines, selectedRecord.note).length} Item)
                </span>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {parseMedicineItems(selectedRecord.list_of_medicines, selectedRecord.note).map((med, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-extrabold text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">{med.name}</span>
                        </div>
                        {med.quantity && (
                          <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                            Jumlah: {med.quantity}
                          </span>
                        )}
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 text-slate-700 font-mono text-[11px] flex items-center justify-between">
                        <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Aturan Pakai:</span>
                        <span className="font-extrabold text-teal-800">{med.dosage}</span>
                      </div>
                      {med.note && (
                        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl px-3 py-1.5 text-[11px] text-amber-900">
                          <span className="font-bold text-[10px] uppercase block text-amber-700">Catatan Khusus:</span>
                          <p className="italic">{med.note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-600">Ubah Status Resep:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleUpdateStatus(selectedRecord.id, "Diproses")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRecord.status_resep === "Diproses" ? "bg-[#D97706] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Diproses
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRecord.id, "Siap Diambil")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRecord.status_resep === "Siap Diambil" ? "bg-[#0284C7] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Siap Diambil
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRecord.id, "Selesai")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRecord.status_resep === "Selesai" ? "bg-[#16A34A] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-bold text-xs hover:from-teal-800 hover:to-cyan-900 transition"
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
