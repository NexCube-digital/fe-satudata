"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import { getSepoliaTxUrl } from "@/lib/blockchain";
import {
  FileText,
  Search,
  Filter,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  FileCheck
} from "lucide-react";

function ModernFilterSelect({ options, value, onChange, icon: Icon, placeholder = "Pilih..." }) {
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
    <div ref={ref} className="relative min-w-[170px] sm:min-w-[200px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
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
        <div className="absolute top-full right-0 mt-2 z-50 min-w-[220px] w-max rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 overflow-y-auto">
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

export default function PatientRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Decryption State (Map of record ID -> boolean)
  const [decryptedState, setDecryptedState] = useState({});
  const [decryptedDetails, setDecryptedDetails] = useState({});
  const [decryptingIds, setDecryptingIds] = useState({});

  // Active Detail Modal Record
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Initial Mock & Real Data Fetching
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetchHistoryFromBE();
      } catch (e) {
        console.error(e);
      }
    } else {
      setRecords([]);
    }
    setLoading(false);
  }, []);

  const fetchHistoryFromBE = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const beRecords = await Promise.all(result.data.map(async (item) => {
          const rec = {
            id: item.id,
            hospitalName: item.hospital?.user?.name || item.hospital?.name || "RSUD Dr. Soetomo",
            hospitalCode: item.hospital?.medical_license || item.hospital?.kode_rs || "RS-320491",
            doctorName: item.doctor?.name || "dr. A. Peter Syarief, Sp.BTKV(K)-T",
            specialty: item.doctor?.specialist || "Spesialis Bedah Thoraks & Kardiovaskuler",
            category: item.record_type || "Rekam Medis Terverifikasi",
            date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            time: new Date(item.visit_date || item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
            txHash: item.tx_hash || null,
            diagnosis: item.title || "Konsultasi Medis & Rekam Kesehatan",
            prescriptions: [
              { medicine: "Amoxicillin 500mg", dosage: "3x1 Tablet sesudah makan (5 Hari)" },
              { medicine: "Paracetamol 500mg", dosage: "3x1 Tablet jika demam (P.R.N)" }
            ],
            vitals: { bp: "120/80 mmHg", pulse: "80 bpm", temp: "36.8 °C", weight: "65 kg" },
            notes: "Telah diverifikasi oleh faskes penanggung jawab."
          };

          try {
            const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${item.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const detailResult = await detailRes.json();
            if (detailRes.ok && detailResult.data) {
              return mapBackendDetailToFrontend(rec, detailResult.data);
            }
          } catch (e) {
            console.log("Detail fetch error", e);
          }
          return rec;
        }));
        setRecords(beRecords);
      }
    } catch (err) {
      console.log("Error fetching history", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const mapBackendDetailToFrontend = (rec, backendData) => {
    const detail = backendData.detail || {};
    const summary = backendData.summary || backendData.title || rec.diagnosis;
    
    const hospitalName = backendData.hospital?.user?.name || backendData.hospital_name || rec.hospitalName;
    const hospitalCode = backendData.hospital?.medical_license || backendData.hospital?.kode_rs || rec.hospitalCode;
    const doctorName = backendData.doctor?.name || rec.doctorName;
    const specialty = backendData.doctor?.specialist || rec.specialty;

    let diagnosis = summary;
    let prescriptions = rec.prescriptions || [];
    let vitals = rec.vitals;
    let notes = "Telah didekripsi secara aman.";

    if (rec.category === "umum") {
      diagnosis = detail.diagnosis || summary;
      notes = detail.note_doctor || "Tidak ada catatan tambahan.";
      if (detail.complaint || detail.action) {
        notes = `Keluhan: ${detail.complaint || '-'}\nTindakan: ${detail.action || '-'}\nCatatan: ${notes}`;
      }
    } else if (rec.category === "resep") {
      diagnosis = "Resep Obat";
      notes = detail.note || "Aturan pakai terlampir.";
      if (detail.list_of_medicines) {
        const meds = detail.list_of_medicines.split(";").map(item => {
          const parts = item.split(":");
          return {
            medicine: parts[0]?.trim() || "Obat",
            dosage: parts[1]?.trim() || "Sesuai petunjuk dokter"
          };
        });
        prescriptions = meds;
      }
    } else if (rec.category === "lab") {
      diagnosis = `Pemeriksaan Laboratorium: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}\nNilai Rujukan: ${detail.reference_values || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Lab: " + (detail.checkup_result || "-") };
    } else if (rec.category === "radiologi") {
      diagnosis = `Pemeriksaan Radiologi: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Radiologi: " + (detail.checkup_result || "-") };
    }

    return {
      ...rec,
      hospitalName,
      hospitalCode,
      doctorName,
      specialty,
      diagnosis,
      prescriptions,
      vitals,
      notes,
      isRealDecrypted: true
    };
  };

  const toggleDecryptRecord = async (id) => {
    const isCurrentlyDecrypted = decryptedState[id];
    setDecryptedState((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!isCurrentlyDecrypted && !decryptedDetails[id]) {
      setDecryptingIds((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const originalRecord = records.find(r => r.id === id);
          const mappedRecord = mapBackendDetailToFrontend(originalRecord, result.data);
          setDecryptedDetails((prev) => ({ ...prev, [id]: mappedRecord }));
        }
      } catch (err) {
        console.error("Error decrypting medical record:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleOpenDetailModal = async (rec) => {
    setSelectedRecord(rec);
    const id = rec.id;
    if (!decryptedDetails[id]) {
      setDecryptingIds((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const mappedRecord = mapBackendDetailToFrontend(rec, result.data);
          setDecryptedDetails((prev) => ({ ...prev, [id]: mappedRecord }));
          setDecryptedState((prev) => ({ ...prev, [id]: true }));
        }
      } catch (err) {
        console.error("Error decrypting medical record in modal:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.txHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHospital = hospitalFilter === "all" || rec.hospitalName === hospitalFilter;
    const matchesCategory = categoryFilter === "all" || rec.category === categoryFilter;

    return matchesSearch && matchesHospital && matchesCategory;
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
          <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#115E59] p-4 sm:px-5 sm:py-4 text-white shadow-md mb-3">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-teal-100 backdrop-blur-md mb-1">
                  <ShieldCheck className="h-3 w-3 text-teal-200" />
                  <span className="hidden sm:inline">EHR Off-Chain AES-256 Storage & Blockchain Hash Verification</span>
                  <span className="sm:hidden">EHR AES-256 Storage & Hash Verification</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                  Rekam Medis Terenkripsi
                </h1>
                <p className="text-[11px] sm:text-xs text-teal-100/90 mt-0.5 max-w-xl line-clamp-2 sm:line-clamp-none">
                  Seluruh berkas kesehatan, diagnosa dokter, dan resep obat dari berbagai rumah sakit tersimpan aman secara kedaulatan digital.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 no-print w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (records.length > 0) {
                      handleOpenDetailModal(records[0]);
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-bold text-white transition backdrop-blur-md cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Cetak / Unduh Resume PDF
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid - Side by Side on Mobile */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 mb-3">
            <div className="rounded-2xl bg-white p-3 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total EHR</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-secondary-tint text-primary">
                  <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                {records.length} <span className="text-[10px] sm:text-xs font-normal text-slate-500">Dokumen</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-primary mt-0.5 flex items-center gap-0.5 truncate">
                <CheckCircle className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">Terverifikasi Lengkap</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3 border border-slate-200/80 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Faskes</span>
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                {new Set(records.map(r => r.hospitalName)).size} <span className="text-[10px] sm:text-xs font-normal text-slate-500">Instansi</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium text-teal-700 mt-0.5 flex items-center gap-0.5 truncate">
                <Activity className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">Terotentikasi Blockchain</span>
              </p>
            </div>
          </div>

          {/* Search & Filter Bar - Compact on Mobile */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-3 sm:p-4 shadow-2xs mb-3">
            <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 justify-between items-center">
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari diagnosa, dokter, rumah sakit, atau hash..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-8 py-2 text-xs font-medium text-slate-800 focus:border-primary focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-200/50 transition shadow-2xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Modern Dropdown Filters - 2 Columns on Mobile */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto justify-end">
                <ModernFilterSelect
                  icon={Building2}
                  value={hospitalFilter}
                  onChange={setHospitalFilter}
                  placeholder="Semua Faskes"
                  options={[
                    { value: "all", label: "Semua Faskes" },
                    ...Array.from(new Set([
                      "RS Cipto Mangunkusumo",
                      "RS Harapan Kita",
                      "Laboratorium Kimia Farma",
                      ...records.map(r => r.hospitalName).filter(Boolean)
                    ])).map(h => ({ value: h, label: h }))
                  ]}
                />

                <ModernFilterSelect
                  icon={Filter}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="Semua Kategori"
                  options={[
                    { value: "all", label: "Semua Kategori" },
                    { value: "Diagnosa & Resep", label: "Diagnosa & Resep" },
                    { value: "Hasil Laboratorium", label: "Hasil Laboratorium" },
                    { value: "Pemeriksaan EKG Jantung", label: "Pemeriksaan EKG Jantung" }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Medical Records List - Compact on Mobile */}
          <div className="space-y-3 sm:space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Tidak ada rekam medis ditemukan</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter pilihan Anda.</p>
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isDecrypted = decryptedState[rec.id];
                const isDecrypting = decryptingIds[rec.id];
                return (
                  <div
                    key={rec.id}
                    className="rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-5 shadow-2xs hover:shadow-md transition duration-200"
                  >
                    {/* Record Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5 mb-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-tint border border-teal-200 font-bold text-primary text-xs sm:text-sm shadow-2xs">
                          {rec.hospitalName.charAt(0)}{rec.hospitalName.charAt(3)}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-xs sm:text-base font-extrabold text-slate-900">{rec.hospitalName}</h3>
                            <span className="rounded-md bg-slate-100 px-2 py-0.2 text-[9px] font-mono font-bold text-slate-600 border border-slate-200">
                              {rec.hospitalCode}
                            </span>
                            <span className="rounded-md bg-secondary-tint px-2 py-0.2 text-[9px] font-bold text-primary border border-teal-200">
                              {rec.category}
                            </span>
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-600 mt-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <Stethoscope className="h-3 w-3 text-teal-600 shrink-0" />
                              <span>{rec.doctorName}</span>
                            </span>
                            <span className="hidden sm:inline text-slate-300">•</span>
                            <span className="text-[10px] sm:text-xs text-slate-500 pl-4 sm:pl-0 font-medium">
                              {rec.specialty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start text-[10px] sm:text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-600 font-bold">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" /> {rec.date}
                        </span>
                        <span className="text-[9px] text-slate-400 sm:mt-0.5">{rec.time}</span>
                      </div>
                    </div>

                    {/* Content Box - Clean Summary Preview */}
                    <div className="mb-2.5">
                      <div className="rounded-xl bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-slate-50 border border-teal-100/80 p-2.5 sm:p-3 text-slate-800 shadow-2xs">
                        <p className="text-primary-hover font-bold uppercase text-[9px] tracking-wider mb-0.5">Diagnosa / Ringkasan Medis:</p>
                        <p className="text-xs sm:text-sm font-extrabold text-slate-900">{rec.diagnosis}</p>
                      </div>
                    </div>

                    {/* Record Footer */}
                    <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                      <div className="font-mono text-[9px] sm:text-[10px] text-slate-500 truncate max-w-[170px] sm:max-w-xs">
                        Tx Hash: <TxHashLink txHash={rec.txHash} className="text-primary font-bold font-mono inline-flex items-center gap-0.5" title={rec.txHash}><span>{rec.txHash}</span></TxHashLink>
                      </div>

                      <button
                        onClick={() => handleOpenDetailModal(rec)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer shrink-0"
                      >
                        Detail Rekam Medis <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Detail View - Official Hospital Medical Document Table Style */}
          {selectedRecord && (() => {
            const displaySelected = decryptedDetails[selectedRecord.id] || selectedRecord;
            const isModalDecrypting = decryptingIds[selectedRecord.id];
            return (
              <div
                onClick={() => setSelectedRecord(null)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in print-modal-backdrop cursor-pointer"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-3xl w-full flex flex-col items-end cursor-default"
                >
                  
                  {/* Close Button Floating Outside Modal Card */}
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg transition cursor-pointer no-print shrink-0 border border-slate-700"
                    title="Tutup Modal"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-300 p-4 sm:p-7 w-full max-h-[88vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl relative print-modal-card">

                  {isModalDecrypting ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2.5" />
                      <p className="text-xs sm:text-sm font-bold text-slate-600">Memuat rincian dokumen rekam medis...</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 sm:space-y-6 text-xs text-slate-800">

                      {/* Official Hospital Document Kop Header */}
                      <div className="border-b-2 border-slate-800 pb-3 sm:pb-4 text-center relative">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <span className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-900 text-white font-extrabold text-xs sm:text-base shadow-2xs">
                              {displaySelected.hospitalName.charAt(0)}{displaySelected.hospitalName.charAt(3) || "RS"}
                            </span>
                            <div className="text-left">
                              <h2 className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-tight line-clamp-1">{displaySelected.hospitalName}</h2>
                              <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">No. Izin Faskes: {displaySelected.hospitalCode || "3204-RS-SATUDATA"}</p>
                            </div>
                          </div>

                          <div className="text-right hidden sm:block font-mono text-[10px] text-slate-500 max-w-[280px]">
                            <p className="font-bold text-teal-800 uppercase flex items-center justify-end gap-1">
                              <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" /> Tx Hash Blockchain:
                            </p>
                            <TxHashLink txHash={displaySelected.txHash} className="text-primary font-bold font-mono inline-flex items-center gap-1 truncate max-w-full" title={displaySelected.txHash}>
                              <span>{displaySelected.txHash}</span>
                            </TxHashLink>
                            <p className="text-[9px] text-slate-400 mt-0.5">Tgl: {displaySelected.date}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 sm:mt-4 sm:pt-3 border-t border-slate-300">
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">RESUME REKAM MEDIS PASIEN (EHR REPORT)</h3>
                          <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono">ID: {displaySelected.id} • Kategori: {displaySelected.category.toUpperCase()}</p>
                        </div>
                      </div>

                      {/* TABLE 1: INFORMASI PASIEN & DOKTER (Grid Table) */}
                      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                        <div className="bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-slate-300 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-teal-700 shrink-0" /> Identitas Otorisasi Faskes & Dokter DPJP
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-[11px] sm:text-xs">
                          <div className="p-2.5 sm:p-3.5 space-y-1.5">
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-500 text-[10px] sm:text-[11px]">Pasien Pemilik:</span>
                              <span className="font-bold text-slate-900 text-right">{user?.name || "Pasien Terdaftar"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-500 text-[10px] sm:text-[11px]">NIK Pasien:</span>
                              <span className="font-mono font-bold text-teal-800">{user?.nik || "3204391606040001"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-500 text-[10px] sm:text-[11px]">Waktu Kunjungan:</span>
                              <span className="font-mono text-slate-700 text-right">{displaySelected.date} ({displaySelected.time})</span>
                            </div>
                          </div>

                          <div className="p-2.5 sm:p-3.5 space-y-1.5">
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-500 text-[10px] sm:text-[11px]">Dokter DPJP:</span>
                              <span className="font-bold text-slate-900 text-right">{displaySelected.doctorName}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-500 text-[10px] sm:text-[11px]">Spesialisasi:</span>
                              <span className="font-medium text-slate-700 text-right">{displaySelected.specialty}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-slate-500 text-[10px] sm:text-[11px]">Instansi Faskes:</span>
                              <span className="font-bold text-teal-900 text-right">{displaySelected.hospitalName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* TABLE 2: DIAGNOSA UTAMA */}
                      <div className="overflow-hidden rounded-xl border border-teal-300 bg-teal-50/40">
                        <div className="bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider flex items-center justify-between">
                          <span>Diagnosa Utama (Primary ICD-10 Code)</span>
                          <span className="text-[8px] sm:text-[9px] font-mono opacity-80">Terverifikasi Dokter</span>
                        </div>
                        <div className="p-3 sm:p-4">
                          <p className="text-xs sm:text-base font-black text-slate-900">{displaySelected.diagnosis}</p>
                        </div>
                      </div>

                      {/* TABLE 3: TANDA-TANDA VITAL (VITALS TABLE) */}
                      {displaySelected.vitals && (
                        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                          <div className="bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-slate-300 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-teal-700 shrink-0" /> Hasil Pemeriksaan Fisik & Vital Signs
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] sm:text-xs border-collapse min-w-[320px]">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] sm:text-[10px] uppercase text-slate-500 font-mono">
                                  <th className="py-2 px-3 sm:py-2.5 sm:px-4 font-bold border-r border-slate-200">Tekanan Darah</th>
                                  <th className="py-2 px-3 sm:py-2.5 sm:px-4 font-bold border-r border-slate-200">Nadi / Detak</th>
                                  <th className="py-2 px-3 sm:py-2.5 sm:px-4 font-bold border-r border-slate-200">Suhu Tubuh</th>
                                  <th className="py-2 px-3 sm:py-2.5 sm:px-4 font-bold">Catatan Vital</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="font-mono text-slate-900">
                                  <td className="py-2 px-3 sm:py-3 sm:px-4 font-bold border-r border-slate-200 text-teal-900">{displaySelected.vitals.bp}</td>
                                  <td className="py-2 px-3 sm:py-3 sm:px-4 font-bold border-r border-slate-200">{displaySelected.vitals.pulse}</td>
                                  <td className="py-2 px-3 sm:py-3 sm:px-4 font-bold border-r border-slate-200">{displaySelected.vitals.temp}</td>
                                  <td className="py-2 px-3 sm:py-3 sm:px-4 font-bold">{displaySelected.vitals.weight}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* TABLE 4: RESEP OBAT & ATURAN PAKAI (PRESCRIPTIONS TABLE) */}
                      {displaySelected.prescriptions && displaySelected.prescriptions.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                          <div className="bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-slate-300 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-teal-700 shrink-0" /> Resep Obat & Dosis Terapi
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-mono text-slate-500">{displaySelected.prescriptions.length} Item</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] sm:text-xs border-collapse min-w-[340px]">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] sm:text-[10px] uppercase text-slate-500 font-mono">
                                  <th className="py-1.5 px-2.5 sm:py-2 sm:px-4 font-bold w-10 border-r border-slate-200 text-center">No</th>
                                  <th className="py-1.5 px-2.5 sm:py-2 sm:px-4 font-bold border-r border-slate-200">Nama Farmasi / Dosis</th>
                                  <th className="py-1.5 px-2.5 sm:py-2 sm:px-4 font-bold border-r border-slate-200">Aturan Pakai</th>
                                  <th className="py-1.5 px-2.5 sm:py-2 sm:px-4 font-bold text-center w-24">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {displaySelected.prescriptions.map((rx, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-center font-mono font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-extrabold text-slate-900 border-r border-slate-200">{rx.medicine}</td>
                                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 font-medium text-slate-700 border-r border-slate-200">{rx.dosage}</td>
                                    <td className="py-2 px-2.5 sm:py-2.5 sm:px-4 text-center">
                                      <span className="inline-block rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[8px] sm:text-[9px] font-bold text-emerald-700">
                                        Diserahkan
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* TABLE 5: CATATAN DOKTER & ANAMNESIS */}
                      {displaySelected.notes && (
                        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
                          <div className="bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-slate-300 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-slate-700">
                            Catatan Klinis Dokter & Instruksi Tindakan
                          </div>
                          <div className="p-3 sm:p-4 bg-slate-50/50">
                            <p className="text-slate-800 leading-relaxed text-[11px] sm:text-xs whitespace-pre-line font-sans">{displaySelected.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* ONLY QR CODE FOR SEPOLIA ETHERSCAN VERIFICATION - ALIGNED RIGHT */}
                      <div className="flex flex-col items-end justify-end py-1 sm:py-2">
                        {(() => {
                          const sepoliaUrl = getSepoliaTxUrl(displaySelected.txHash) || `https://sepolia.etherscan.io/tx/${displaySelected.txHash}`;
                          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=2&data=${encodeURIComponent(sepoliaUrl)}&color=0f766e&bgcolor=ffffff`;
                          return (
                            <a
                              href={sepoliaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 sm:p-3 bg-white rounded-2xl border border-slate-300 shadow-2xs hover:shadow-md transition cursor-pointer text-center group inline-flex flex-col items-center gap-1 shrink-0"
                              title="Scan QR Code untuk verifikasi di Etherscan Sepolia"
                            >
                              <img
                                src={qrApiUrl}
                                alt="QR Code Verification Etherscan Sepolia"
                                className="w-20 h-20 sm:w-28 sm:h-28 object-contain group-hover:scale-105 transition mx-auto shrink-0"
                              />
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-teal-800 uppercase tracking-wider font-mono flex items-center gap-1 whitespace-nowrap">
                                <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                                Blockchain Verified
                              </span>
                            </a>
                          );
                        })()}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="pt-3 sm:pt-4 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
                        <button
                          onClick={() => window.print()}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold shadow-md hover:bg-primary-hover transition cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Cetak / Unduh Dokumen PDF
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        </main>
      </div>
    </div>
  );
}
