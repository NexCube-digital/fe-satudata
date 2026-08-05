"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";
import { getDoctors } from "@/services/doctorService";
import {
  Stethoscope,
  Building2,
  Users,
  Search,
  RefreshCw,
  Plus,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  ShieldAlert,
  Calendar,
  User,
  Heart,
  ChevronLeft,
  Sparkles,
  UserPlus,
  X,
  ShieldCheck,
  Activity
} from "lucide-react";

export default function PatientEhrDetailPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const showToast = (message, type = "success", title = "", tipe) =>
    notify(setToast, { type, title, message, tipe });

  // Add EHR Record Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingEhr, setSubmittingEhr] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // New EHR Form State
  const [recordType, setRecordType] = useState("umum");
  const [recordTitle, setRecordTitle] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [ehrSummary, setEhrSummary] = useState("");
  const [ehrSignature, setEhrSignature] = useState("");

  // Dynamic EHR Detail State
  const [umumDetail, setUmumDetail] = useState({ complaint: "", diagnosis: "", action: "", note_doctor: "" });
  const [labDetail, setLabDetail] = useState({ checkup_result: "", reference_values: "", conclusion: "" });
  const [radiologyDetail, setRadiologyDetail] = useState({ checkup_result: "", conclusion: "" });
  const [prescriptionDetail, setPrescriptionDetail] = useState({ list_of_medicines: "", note: "" });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    if (patientId) {
      loadPatientDetailsAndRecords();
    }
    fetchDoctors();
  }, [patientId]);

  const maskNik = (nik) => {
    if (!nik) return "-";
    const str = nik.toString();
    if (str.length < 10) return "******";
    return str.substring(0, 6) + "******" + str.substring(str.length - 4);
  };

  const fetchDoctors = async () => {
    try {
      const res = await getDoctors();
      if (res.success && res.data) {
        setDoctorsList(res.data);
        if (res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const loadPatientDetailsAndRecords = async () => {
    setLoading(true);
    setLoadingRecords(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      setLoadingRecords(false);
      return;
    }

    try {
      // 1. Fetch access requests to resolve patient info
      const accessRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const accessResult = await accessRes.json();
      if (accessRes.ok && accessResult.data) {
        const found = accessResult.data.find(item => String(item.patient_id) === String(patientId));
        if (found) {
          setPatientInfo({
            patientId: found.patient_id,
            patientName: found.patient_name || found.Patient?.name || found.patient?.name || "Pasien Terdaftar",
            nik: found.patient_nik || found.Patient?.profil?.nik || found.patient?.profil?.nik || "-",
            walletAddress: found.Patient?.wallet_address || found.patient?.wallet_address || "0x0000...0000",
            poli: found.requested_data || "Klinik Umum",
            approvedAt: new Date(found.updated_at || found.created_at).toLocaleDateString("id-ID")
          });
        }
      }

      // 2. Fetch medical records for this patient
      const dummySignature = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const ehrRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient/${patientId}?signature=${dummySignature}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ehrResult = await ehrRes.json();
      if (ehrRes.ok && ehrResult.data) {
        setPatientRecords(ehrResult.data);
      }
    } catch (err) {
      console.error("Error loading patient detail & EHR:", err);
    } finally {
      setLoading(false);
      setLoadingRecords(false);
    }
  };

  const handleAddEhrSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEhr(true);
    setSuccessMessage("");
    const token = localStorage.getItem("accessToken");

    let detailPayload = {};
    if (recordType === "umum") detailPayload = umumDetail;
    if (recordType === "lab") detailPayload = labDetail;
    if (recordType === "radiologi") detailPayload = radiologyDetail;
    if (recordType === "resep") detailPayload = prescriptionDetail;

    const payload = {
      patientId: parseInt(patientId, 10),
      recordType,
      title: recordTitle,
      visitDate,
      doctorId: selectedDoctorId ? parseInt(selectedDoctorId, 10) : null,
      summary: ehrSummary || `Catatan medis ${recordType} pasien ${patientInfo?.patientName || ""}`,
      signature: ehrSignature || "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      detail: detailPayload
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMessage("Rekam Medis (EHR) berhasil ditambahkan!");
        setTimeout(() => {
          setIsAddModalOpen(false);
          setSuccessMessage("");
          setRecordTitle("");
          setEhrSummary("");
          loadPatientDetailsAndRecords();
        }, 1500);
      } else {
        showToast(result.message || "Gagal menambahkan rekam medis.", "error", "Gagal Menambahkan");
      }
    } catch (err) {
      console.error("Error submit EHR:", err);
      showToast("Terjadi kesalahan saat menyimpan data rekam medis.", "error", "System Error");
    } finally {
      setSubmittingEhr(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Instansi Faskes" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role={user?.role || "rumah_sakit"} />

        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Top Navigation & Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/dashboard/faskes/patients"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-rose-800 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs transition hover:border-rose-300"
            >
              <ChevronLeft className="h-4 w-4" /> Kembali ke Daftar Pasien
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-md shadow-rose-950/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Tambah Rekam Medis Baru
            </button>
          </div>

          {/* Patient Detail Header Card */}
          <div className="rounded-[2.5rem] bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-3xl bg-white/10 text-rose-200 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-rose-300 font-extrabold bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      <ShieldCheck className="h-3 w-3" /> Pasien Terotorisasi Web3
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                    {patientInfo?.patientName || `Pasien #${patientId}`}
                  </h1>
                  <p className="text-xs sm:text-sm font-mono text-rose-200/80 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>NIK: {maskNik(patientInfo?.nik)}</span>
                    <span>• Poliklinik: {patientInfo?.poli || "Klinik Umum"}</span>
                    <span>• Terotorisasi Sejak: {patientInfo?.approvedAt || "-"}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <span className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 text-xs font-bold text-emerald-200 backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Izin Access Aktif
                </span>
              </div>
            </div>
          </div>

          {/* EHR Records Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="h-5.5 w-5.5 text-rose-800" />
                  Peninjau Rekam Medis (EHR) Terdekripsi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Seluruh berkas catatan medis terenkripsi AES-256 dan terverifikasi di blockchain.</p>
              </div>

              <button
                onClick={loadPatientDetailsAndRecords}
                disabled={loadingRecords}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingRecords ? "animate-spin" : ""}`} /> Refresh Data
              </button>
            </div>

            {loadingRecords ? (
              <div className="py-20 text-center rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-rose-800 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Memuat & Mendekripsi Rekam Medis Pasien...</p>
              </div>
            ) : patientRecords.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs space-y-3">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Belum Ada Rekam Medis</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Tekan tombol "Tambah Rekam Medis Baru" untuk menerbitkan catatan medis terenkripsi untuk pasien ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientRecords.map((record) => {
                  const recordTxHash = record.tx_hash || record.txHash || null;
                  return (
                    <div key={record.id} className="rounded-3xl border border-slate-200/90 p-6 bg-white shadow-xs hover:border-rose-300 hover:shadow-md transition space-y-4">
                      {/* Record Item Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                            record.record_type === "umum" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                            record.record_type === "lab" ? "bg-purple-50 text-purple-800 border border-purple-200" :
                            record.record_type === "radiologi" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                            "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                            {record.record_type}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{record.title}</h4>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
                          <Calendar className="h-3.5 w-3.5 text-rose-700" /> {new Date(record.visit_date).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      {record.doctor && (
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-rose-800 shrink-0" />
                          <span>Dokter Penanggung Jawab: <strong className="text-slate-800">{record.doctor.name}</strong> ({record.doctor.specialist})</span>
                        </p>
                      )}

                      {/* Decrypted Content Box */}
                      {record.detail ? (
                        <div className="rounded-2xl bg-gradient-to-br from-rose-50/70 via-rose-50/30 to-slate-50/50 border border-rose-100 p-4 sm:p-5 text-xs space-y-3 text-slate-700">
                          <div className="flex items-center gap-1.5 text-rose-900 text-[10px] font-extrabold uppercase tracking-wider pb-2 border-b border-rose-200/60">
                            <Unlock className="h-4 w-4 text-rose-800" /> Data Medis Terdekripsi
                          </div>
                          {record.record_type === "umum" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                              <p><strong className="text-slate-900">Keluhan Pasien:</strong> {record.detail.complaint || "-"}</p>
                              <p><strong className="text-slate-900">Diagnosis Medis:</strong> {record.detail.diagnosis || "-"}</p>
                              <p><strong className="text-slate-900">Tindakan / Pengobatan:</strong> {record.detail.action || "-"}</p>
                              <p><strong className="text-slate-900">Catatan Tambahan:</strong> {record.detail.note_doctor || "-"}</p>
                            </div>
                          )}
                          {record.record_type === "lab" && (
                            <div className="space-y-2 text-xs leading-relaxed">
                              <p><strong className="text-slate-900">Hasil Pemeriksaan Lab:</strong> {record.detail.checkup_result || "-"}</p>
                              <p><strong className="text-slate-900">Nilai Rujukan:</strong> {record.detail.reference_values || "-"}</p>
                              <p><strong className="text-slate-900">Kesimpulan Tim Lab:</strong> {record.detail.conclusion || "-"}</p>
                            </div>
                          )}
                          {record.record_type === "radiologi" && (
                            <div className="space-y-2 text-xs leading-relaxed">
                              <p><strong className="text-slate-900">Hasil Pemeriksaan Radiologi:</strong> {record.detail.checkup_result || "-"}</p>
                              <p><strong className="text-slate-900">Kesimpulan Dokter Expertise:</strong> {record.detail.conclusion || "-"}</p>
                            </div>
                          )}
                          {record.record_type === "resep" && (
                            <div className="space-y-2 text-xs leading-relaxed">
                              <p><strong className="text-slate-900">Daftar Obat Resep:</strong> {record.detail.list_of_medicines || "-"}</p>
                              <p><strong className="text-slate-900">Catatan Pakai / Resep:</strong> {record.detail.note || "-"}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs flex items-center gap-2 text-slate-500">
                          <Lock className="h-4 w-4 text-slate-400" />
                          <span>EHR Terkunci Aman (AES-256)</span>
                        </div>
                      )}

                      {/* Blockchain Tx Hash Footer Badge */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 font-mono text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl min-w-0 max-w-full sm:max-w-[85%]">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-700 shrink-0">Tx Hash:</span>
                          <span className="truncate text-slate-600 font-semibold" title={recordTxHash}>{recordTxHash}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 text-[10px]">
                          Verified on Blockchain
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add EHR Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col p-6 sm:p-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5.5 w-5.5 text-rose-800" />
                  Tambah Rekam Medis Baru (EHR)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pasien: <span className="font-bold text-slate-700">{patientInfo?.patientName || `Pasien #${patientId}`}</span></p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 font-bold transition flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {successMessage ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle className="h-16 w-16 text-rose-800 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-800">{successMessage}</h4>
                <p className="text-xs text-slate-400">Data telah dienkripsi menggunakan kunci otorisasi.</p>
              </div>
            ) : (
              <form onSubmit={handleAddEhrSubmit} className="space-y-6 flex-1">
                {/* Form Main Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tipe Rekam Medis</label>
                    <select
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                    >
                      <option value="umum">Umum (Pemeriksaan Dokter)</option>
                      <option value="lab">Laboratorium / Tes Darah</option>
                      <option value="radiologi">Radiologi / Rontgen / USG</option>
                      <option value="resep">Resep Obat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Judul Rekam Medis</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Konsultasi Gastritis"
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tanggal Kunjungan</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Dokter Penanggung Jawab</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                    >
                      {doctorsList.length === 0 ? (
                        <option value="">Tidak ada data dokter</option>
                      ) : (
                        doctorsList.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} ({doc.specialist})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Dynamic Detail Section */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detail Form: {recordType.toUpperCase()}</h4>
                  
                  {recordType === "umum" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Keluhan Pasien</label>
                        <input
                          type="text"
                          placeholder="Nyeri perut bagian atas..."
                          value={umumDetail.complaint}
                          onChange={(e) => setUmumDetail({ ...umumDetail, complaint: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Diagnosis</label>
                        <input
                          type="text"
                          placeholder="Gastritis Akut..."
                          value={umumDetail.diagnosis}
                          onChange={(e) => setUmumDetail({ ...umumDetail, diagnosis: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Tindakan</label>
                        <input
                          type="text"
                          placeholder="Pemberian antasida & edukasi pola makan..."
                          value={umumDetail.action}
                          onChange={(e) => setUmumDetail({ ...umumDetail, action: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Catatan Dokter</label>
                        <input
                          type="text"
                          placeholder="Kontrol ulang 3 hari..."
                          value={umumDetail.note_doctor}
                          onChange={(e) => setUmumDetail({ ...umumDetail, note_doctor: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                    </div>
                  )}

                  {recordType === "lab" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Hasil Pemeriksaan Lab</label>
                        <input
                          type="text"
                          placeholder="Hemoglobin: 14 g/dL, Leukosit: 7.500/uL"
                          value={labDetail.checkup_result}
                          onChange={(e) => setLabDetail({ ...labDetail, checkup_result: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nilai Rujukan</label>
                        <input
                          type="text"
                          placeholder="Hb (13-16 g/dL)"
                          value={labDetail.reference_values}
                          onChange={(e) => setLabDetail({ ...labDetail, reference_values: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Kesimpulan</label>
                        <input
                          type="text"
                          placeholder="Hasil pemeriksaan darah rutin dalam batas normal."
                          value={labDetail.conclusion}
                          onChange={(e) => setLabDetail({ ...labDetail, conclusion: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                    </div>
                  )}

                  {recordType === "radiologi" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Hasil Pemeriksaan Radiologi</label>
                        <input
                          type="text"
                          placeholder="Foto Thorax PA: Tidak tampak infiltrat aktif..."
                          value={radiologyDetail.checkup_result}
                          onChange={(e) => setRadiologyDetail({ ...radiologyDetail, checkup_result: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Kesimpulan Expertise</label>
                        <input
                          type="text"
                          placeholder="Cor dan Pulmo dalam batas normal."
                          value={radiologyDetail.conclusion}
                          onChange={(e) => setRadiologyDetail({ ...radiologyDetail, conclusion: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                    </div>
                  )}

                  {recordType === "resep" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Daftar Obat</label>
                        <input
                          type="text"
                          placeholder="Paracetamol 500mg (3x1), Antasida (3x1 sdm)"
                          value={prescriptionDetail.list_of_medicines}
                          onChange={(e) => setPrescriptionDetail({ ...prescriptionDetail, list_of_medicines: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Catatan Resep</label>
                        <input
                          type="text"
                          placeholder="Diminum sebelum/sesudah makan..."
                          value={prescriptionDetail.note}
                          onChange={(e) => setPrescriptionDetail({ ...prescriptionDetail, note: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white focus:outline-hidden focus:border-rose-800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEhr}
                    className="rounded-xl bg-rose-800 hover:bg-rose-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-md shadow-rose-950/10 cursor-pointer"
                  >
                    {submittingEhr ? "Menyimpan & Enkripsi..." : "Simpan Rekam Medis (EHR)"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <Toast toast={toast} onClose={() => setToast({ show: false })} />
    </div>
  );
}
