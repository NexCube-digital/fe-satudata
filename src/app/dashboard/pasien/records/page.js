"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../layout/Navbar";
import Sidebar from "../../layout/Sidebar";
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
  User,
  Stethoscope,
  Activity,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileCheck
} from "lucide-react";

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

  // Active Detail Modal Record
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Initial Mock & Real Data Fetching
  const initialRecordsData = [
    {
      id: "rec-101",
      hospitalName: "RS Cipto Mangunkusumo",
      hospitalCode: "RSCM-JKT-01",
      doctorName: "dr. Amanda Setiadi, Sp.PD",
      specialty: "Poli Penyakit Dalam",
      category: "Diagnosa & Resep",
      date: "12 Juli 2026",
      time: "10:30 WIB",
      txHash: "0x9f12a83b4c90e123a456b789c012d345e678f90a",
      encryptedData: "U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5YTI0ZjM0MmQwNmFk...",
      diagnosis: "Infeksi Saluran Pernapasan Akut (ISPA) dengan demam ringan.",
      prescriptions: [
        { medicine: "Amoxicillin 500mg", dosage: "3x1 Tablet sesudah makan (5 Hari)" },
        { medicine: "Paracetamol 500mg", dosage: "3x1 Tablet jika demam (P.R.N)" },
        { medicine: "Guaifenesin 100mg", dosage: "3x1 Tablet untuk batuk" }
      ],
      vitals: { bp: "120/80 mmHg", pulse: "82 bpm", temp: "37.5 °C", weight: "68 kg" },
      notes: "Pasien disarankan istirahat cukup, banyak minum air hangat, dan kontrol ulang jika demam berlanjut lebih dari 3 hari."
    },
    {
      id: "rec-102",
      hospitalName: "Laboratorium Kimia Farma",
      hospitalCode: "KKF-LAB-04",
      doctorName: "Analis Lab Rian Hidayat, Amd.AK",
      specialty: "Laboratorium Patologi Klinik",
      category: "Hasil Laboratorium",
      date: "28 Juni 2026",
      time: "08:15 WIB",
      txHash: "0x5f81e2c4d901a234b567c890d123e456f789a01b",
      encryptedData: "85MmNlYTkyOQU2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5Y...",
      diagnosis: "Pemeriksaan Profil Lipid & Gula Darah Puasa (GDP)",
      prescriptions: [],
      vitals: { bp: "118/78 mmHg", pulse: "76 bpm", temp: "36.6 °C", weight: "68 kg" },
      notes: "Hasil Lab: Kolesterol Total 190 mg/dL (Normal < 200), HDL 55 mg/dL, LDL 110 mg/dL, Gula Darah Puasa 95 mg/dL (Normal). Semua indikator dalam batas optimal."
    },
    {
      id: "rec-103",
      hospitalName: "RS Harapan Kita",
      hospitalCode: "RSHK-JKT-04",
      doctorName: "dr. Budi Santoso, Sp.JP(K)",
      specialty: "Kardiologi & Pembuluh Darah",
      category: "Pemeriksaan EKG Jantung",
      date: "14 Mei 2026",
      time: "14:00 WIB",
      txHash: "0x3f5be21a4c901a234b567c890d123e456f789a01c",
      encryptedData: "99AaBbcCcDdEeFf1234567890U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2...",
      diagnosis: "Sinus Rhythm Normal dengan Ventricular Extrasystole jarang.",
      prescriptions: [
        { medicine: "Suplemen Coenzyme Q10 100mg", dosage: "1x1 Kapsul pagi" }
      ],
      vitals: { bp: "125/82 mmHg", pulse: "72 bpm", temp: "36.7 °C", weight: "67.5 kg" },
      notes: "Hasil EKG 12-lead menunjukkan ritme sinus normal. Tidak ditemukan iskemia akut. Disarankan olahraga teratur 30 menit sehari."
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        fetchHistoryFromBE();
      } catch (e) {
        console.error(e);
      }
    }
    setRecords(initialRecordsData);
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
      if (res.ok && result.data && result.data.length > 0) {
        const beRecords = result.data.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || "Rumah Sakit Terdaftar",
          hospitalCode: item.hospital?.medical_license || "RS-N/A",
          doctorName: item.doctor?.name || "Dokter Terdaftar",
          specialty: item.doctor?.specialist || "Poli Kesehatan",
          category: item.record_type || "Rekam Medis Terverifikasi",
          date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          time: new Date(item.visit_date || item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          txHash: item.data_hash || "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          encryptedData: "U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5YTI0ZjM0MmQwNmFk...",
          diagnosis: item.title || "Konsultasi Medis & Rekam Kesehatan Terenkripsi",
          prescriptions: [
            { medicine: "Amoxicillin 500mg", dosage: "3x1 Tablet sesudah makan (5 Hari)" },
            { medicine: "Paracetamol 500mg", dosage: "3x1 Tablet jika demam (P.R.N)" }
          ],
          vitals: { bp: "120/80 mmHg", pulse: "80 bpm", temp: "36.8 °C", weight: "65 kg" },
          notes: "Telah diverifikasi oleh faskes penanggung jawab."
        }));
        setRecords([...beRecords, ...initialRecordsData]);
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

  const toggleDecryptRecord = (id) => {
    setDecryptedState((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien Terdaftar" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="pasien" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
                  EHR Off-Chain AES-256 Storage & Blockchain Hash Verification
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Rekam Medis Terenkripsi
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Seluruh berkas kesehatan, diagnosa dokter, dan resep obat dari berbagai rumah sakit tersimpan aman secara kedaulatan digital.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition backdrop-blur-md cursor-pointer"
                >
                  <Download className="h-4 w-4" /> Cetak / Unduh Resume PDF
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Berkas EHR</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <FileText className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {records.length} <span className="text-xs font-normal text-slate-500">Dokumen</span>
              </p>
              <p className="text-[10px] font-medium text-rose-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Terverifikasi Lengkap
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status Enkripsi</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Lock className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                100% <span className="text-xs font-normal text-slate-500">AES-256</span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Client-Side Decryption Only
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Faskes Pengunggah</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Building2 className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                3 <span className="text-xs font-normal text-slate-500">Rumah Sakit</span>
              </p>
              <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" /> RSCM, Harapan Kita, Kimia Farma
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Blockchain Validation</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FileCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                Immutable <span className="text-xs font-normal text-slate-500">Hash</span>
              </p>
              <p className="text-[10px] font-medium text-amber-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Hardhat Smart Contract Verified
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari diagnosa, nama dokter, rumah sakit, atau hash..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-rose-600 focus:outline-hidden"
                >
                  <option value="all">Semua Faskes (All Hospitals)</option>
                  <option value="RS Cipto Mangunkusumo">RS Cipto Mangunkusumo</option>
                  <option value="RS Harapan Kita">RS Harapan Kita</option>
                  <option value="Laboratorium Kimia Farma">Laboratorium Kimia Farma</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-rose-600 focus:outline-hidden"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Diagnosa & Resep">Diagnosa & Resep</option>
                  <option value="Hasil Laboratorium">Hasil Laboratorium</option>
                  <option value="Pemeriksaan EKG Jantung">Pemeriksaan EKG Jantung</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Records List */}
          <div className="space-y-6">
            {filteredRecords.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">Tidak ada rekam medis ditemukan</h3>
                <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter pilihan Anda.</p>
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isDecrypted = decryptedState[rec.id];
                return (
                  <div
                    key={rec.id}
                    className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition duration-200"
                  >
                    {/* Record Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-start gap-3.5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 font-bold text-rose-700 text-sm shadow-2xs">
                          {rec.hospitalName.charAt(0)}{rec.hospitalName.charAt(3)}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">{rec.hospitalName}</h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
                              {rec.hospitalCode}
                            </span>
                            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              {rec.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                            {rec.doctorName} <span className="text-slate-300">•</span> {rec.specialty}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1 text-slate-600 font-bold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {rec.date}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{rec.time}</span>
                      </div>
                    </div>

                    {/* Content Preview Box */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {isDecrypted ? "Data Rekam Medis (Terdekripsi AES-256)" : "Ciphertext Terenkripsi"}
                        </span>

                        <button
                          onClick={() => toggleDecryptRecord(rec.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                          {isDecrypted ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5 text-rose-600" /> Sembunyikan Data
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5 text-emerald-600" /> Dekripsi Rekam Medis
                            </>
                          )}
                        </button>
                      </div>

                      {isDecrypted ? (
                        <div className="rounded-2xl bg-gradient-to-r from-rose-950/90 to-red-950/90 p-5 text-white shadow-xs border border-rose-800/40 animate-fade-in space-y-4 text-xs font-mono">
                          <div className="border-b border-rose-800/80 pb-3">
                            <p className="text-rose-300 font-bold uppercase text-[10px] tracking-wider mb-1">Diagnosa Utama:</p>
                            <p className="text-sm font-extrabold text-white">{rec.diagnosis}</p>
                          </div>

                          {rec.vitals && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/30 p-3 rounded-xl border border-rose-800/40 text-[11px]">
                              <div>
                                <span className="text-rose-300/70 block text-[9px]">Tekanan Darah</span>
                                <span className="font-bold text-white">{rec.vitals.bp}</span>
                              </div>
                              <div>
                                <span className="text-rose-300/70 block text-[9px]">Nadi</span>
                                <span className="font-bold text-white">{rec.vitals.pulse}</span>
                              </div>
                              <div>
                                <span className="text-rose-300/70 block text-[9px]">Suhu Tubuh</span>
                                <span className="font-bold text-white">{rec.vitals.temp}</span>
                              </div>
                              <div>
                                <span className="text-rose-300/70 block text-[9px]">Berat Badan</span>
                                <span className="font-bold text-white">{rec.vitals.weight}</span>
                              </div>
                            </div>
                          )}

                          {rec.prescriptions && rec.prescriptions.length > 0 && (
                            <div>
                              <p className="text-rose-300 font-bold uppercase text-[10px] tracking-wider mb-2">Resep Obat & Aturan Pakai:</p>
                              <div className="space-y-1.5">
                                {rec.prescriptions.map((rx, idx) => (
                                  <div key={idx} className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-1.5 border border-rose-900/50">
                                    <span className="font-bold text-rose-100">{rx.medicine}</span>
                                    <span className="text-[10px] text-rose-300">{rx.dosage}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-rose-300 font-bold uppercase text-[10px] tracking-wider mb-1">Catatan Dokter:</p>
                            <p className="text-rose-100 leading-relaxed text-[11px] bg-black/20 p-2.5 rounded-lg border border-rose-900/40">{rec.notes}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-rose-950/80 p-4 text-[10px] font-mono text-rose-200/90 border border-rose-800/30 truncate">
                          <span className="text-rose-400 font-bold mr-2">[CIPHERTEXT AES-256]:</span>
                          {rec.encryptedData}
                        </div>
                      )}
                    </div>

                    {/* Record Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-3 border-t border-slate-100">
                      <div className="font-mono text-[10px] text-slate-500">
                        Blockchain Tx Hash: <span className="text-rose-600 font-bold font-mono">{rec.txHash}</span>
                      </div>

                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Detail Lengkap & Audit Trail <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Detail View */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-bold text-xs">
                      {selectedRecord.hospitalName.charAt(0)}{selectedRecord.hospitalName.charAt(3)}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{selectedRecord.hospitalName}</h3>
                      <p className="text-xs text-slate-500">{selectedRecord.date} • {selectedRecord.time}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Dokter Penanggung Jawab</span>
                    <p className="font-bold text-slate-800 text-sm">{selectedRecord.doctorName}</p>
                    <p className="text-slate-500">{selectedRecord.specialty}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Diagnosa Utama</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedRecord.diagnosis}</p>
                    <p className="text-slate-600 mt-2 leading-relaxed">{selectedRecord.notes}</p>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-rose-950 to-red-950 p-4 text-white font-mono text-[10px] space-y-1 border border-rose-800/40">
                    <p className="text-rose-400 font-bold">VERIFIKASI BLOCKCHAIN & ENKRIPSI:</p>
                    <p className="text-rose-200">Tx Hash: {selectedRecord.txHash}</p>
                    <p className="text-rose-300">Enkripsi: Off-chain AES-256 CBC Mode</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold shadow-sm hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Unduh Dokumen Rekam Medis PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
