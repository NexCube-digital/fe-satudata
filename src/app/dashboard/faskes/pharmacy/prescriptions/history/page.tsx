"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
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
  History,
  Check,
  ArrowLeft
} from "lucide-react";
import TxHashLink from "@/components/ui/TxHashLink";
import ModernSelect from "@/components/ui/ModernSelect";

function parseMedicineItems(rawStr: any, generalNote?: string) {
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

export default function PrescriptionHistoryPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/hospital/pharmacy/prescriptions");
      if (res.success) {
        setPrescriptions(res.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat histori resep:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const historyPrescriptions = prescriptions.filter(p => {
    const isFinished = p.status_resep === "Selesai" || p.status_resep === "Siap Diambil" || p.status_resep === "Diserahkan";
    return isFinished;
  });

  const filtered = historyPrescriptions.filter(p => {
    const matchSearch = (p.patient_name || "").toLowerCase().includes(search.toLowerCase()) ||
                        (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
                        (p.list_of_medicines || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status_resep === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
              <History className="h-3.5 w-3.5 text-teal-700" /> Modul Farmasi & Apotek RS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Riwayat Resep Obat
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Arsip resep dokter yang telah selesai diproses dan diserahkan kepada pasien.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/faskes/pharmacy/prescriptions")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-xs font-extrabold hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" /> Ke Antrean Resep
            </button>
            <button
              onClick={fetchPrescriptions}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-800 text-white text-xs font-extrabold hover:bg-teal-900 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Riwayat Resep</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{historyPrescriptions.length} Resep</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resep Selesai</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {historyPrescriptions.filter(p => p.status_resep === "Selesai").length} Selesai
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Siap Diambil</p>
              <p className="text-2xl font-extrabold text-teal-700 mt-1">
                {historyPrescriptions.filter(p => p.status_resep === "Siap Diambil").length} Resep
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Pill className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pasien, judul rekam medis, atau nama obat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Prescription List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-teal-800" /> Memuat riwayat resep...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400 text-xs italic">
            {historyPrescriptions.length === 0 ? "Belum ada riwayat resep obat." : "Tidak ada riwayat resep yang cocok dengan pencarian."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const medicines = parseMedicineItems(item.list_of_medicines, item.medicine_notes);
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-teal-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="h-3 w-3" /> {item.status_resep || "Selesai"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 mb-1 flex items-center gap-2">
                      <User className="h-4 w-4 text-teal-700 shrink-0" /> {item.patient_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      {item.title}
                    </p>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 space-y-1.5">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Rincian Obat:</p>
                      {medicines.map((m: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between gap-2 text-xs font-semibold text-slate-700">
                          <span>• {m.name}</span>
                          <span className="text-[10px] font-medium text-slate-500 shrink-0">{m.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dokter: {item.doctor_name || "Dokter RS"}</span>
                    {item.blockchain_tx_hash && (
                      <TxHashLink txHash={item.blockchain_tx_hash} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
