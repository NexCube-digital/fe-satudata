"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../layout/Navbar";
import Sidebar from "../../layout/Sidebar";
import { getDoctors } from "@/lib/doctorService";
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
  ChevronRight,
  Sparkles,
  UserPlus
} from "lucide-react";

export default function FaskesPatients() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePatients, setActivePatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);

  // Medical records drawer / view state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [decryptionKeys, setDecryptionKeys] = useState({}); // patientId -> key
  const [decryptionErrors, setDecryptionErrors] = useState({});

  // Add EHR record modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPatient, setModalPatient] = useState(null);
  const [submittingEhr, setSubmittingEhr] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // New EHR Form State
  const [recordType, setRecordType] = useState("umum");
  const [recordTitle, setRecordTitle] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [ehrSummary, setEhrSummary] = useState("");
  const [ehrSignature, setEhrSignature] = useState(""); // signature to encrypt/decrypt
  
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
    fetchActivePatients();
    fetchDoctors();
    setLoading(false);
  }, []);

  const fetchActivePatients = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        // Filter approved requests only
        const approvedRequests = result.data.filter(item => item.status === "approved");
        const mapped = approvedRequests.map((item) => ({
          requestId: item.id,
          patientId: item.patient_id,
          patientName: item.patient?.name || "Pasien Terdaftar",
          nik: item.patient?.profil?.nik || "0000000000000000",
          walletAddress: item.patient?.wallet_address || "0x0000...0000",
          poli: item.requested_data || "Klinik Umum",
          approvedAt: new Date(item.updated_at || item.created_at).toLocaleDateString("id-ID"),
          expiryTime: item.expiry_time ? new Date(item.expiry_time).toLocaleDateString("id-ID") : "Selamanya"
        }));
        setActivePatients(mapped);
      }
    } catch (err) {
      console.error("Error loading active patients:", err);
    }
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const loadPatientRecords = async (patient, forceSignature = null) => {
    setLoadingRecords(true);
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Use MetaMask or custom signature key for decryption.
    // If not supplied, we generate a dummy random key (similar to faskes/page.js dashboard)
    const signature = forceSignature || decryptionKeys[patient.patientId] || "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient/${patient.patientId}?signature=${signature}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        setPatientRecords(result.data);
        setSelectedPatient(patient);
        // Save the used key for reference
        setDecryptionKeys(prev => ({ ...prev, [patient.patientId]: signature }));
        setDecryptionErrors(prev => ({ ...prev, [patient.patientId]: null }));
      } else {
        alert(result.message || "Gagal memuat rekam medis");
      }
    } catch (err) {
      console.error(err);
      setDecryptionErrors(prev => ({ ...prev, [patient.patientId]: "Dekripsi Gagal: Kunci Tanda Tangan digital tidak cocok atau data rusak." }));
    } finally {
      setLoadingRecords(false);
    }
  };

  const generateAutoSignature = (patientId) => {
    const randSig = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setDecryptionKeys(prev => ({ ...prev, [patientId]: randSig }));
  };

  const openAddEhrModal = (patient) => {
    setModalPatient(patient);
    setRecordTitle("");
    setEhrSummary("");
    // Generate a default signature for the upload
    const defaultSig = decryptionKeys[patient.patientId] || "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setEhrSignature(defaultSig);
    
    // Clear details
    setUmumDetail({ complaint: "", diagnosis: "", action: "", note_doctor: "" });
    setLabDetail({ checkup_result: "", reference_values: "", conclusion: "" });
    setRadiologyDetail({ checkup_result: "", conclusion: "" });
    setPrescriptionDetail({ list_of_medicines: "", note: "" });

    setIsAddModalOpen(true);
  };

  const handleAddEhrSubmit = async (e) => {
    e.preventDefault();
    if (!recordTitle || !ehrSignature || !selectedDoctorId) {
      alert("Harap lengkapi semua field utama dan pilih dokter");
      return;
    }

    setSubmittingEhr(true);
    const token = localStorage.getItem("accessToken");

    let detail = {};
    if (recordType === "umum") detail = umumDetail;
    else if (recordType === "lab") detail = labDetail;
    else if (recordType === "radiologi") detail = radiologyDetail;
    else if (recordType === "resep") detail = prescriptionDetail;

    const payload = {
      patientId: modalPatient.patientId,
      requestId: modalPatient.requestId,
      recordType,
      title: recordTitle,
      visitDate,
      doctorId: parseInt(selectedDoctorId),
      summary: ehrSummary,
      detail,
      signature: ehrSignature
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/medical-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMessage("Rekam Medis Terenkripsi berhasil diunggah ke Blockchain & Database!");
        // Reload patient records if currently viewing this patient
        if (selectedPatient && selectedPatient.patientId === modalPatient.patientId) {
          loadPatientRecords(selectedPatient, ehrSignature);
        }
        setTimeout(() => {
          setIsAddModalOpen(false);
          setSuccessMessage("");
        }, 3000);
      } else {
        alert(result.message || "Gagal mengunggah rekam medis");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi backend");
    } finally {
      setSubmittingEhr(false);
    }
  };

  const filteredPatients = activePatients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Users className="h-8 w-8 text-rose-400" />
                Data & Rekam Medis Pasien
              </h1>
              <p className="text-xs sm:text-sm text-rose-200 mt-2 max-w-2xl leading-relaxed">
                Kelola data pasien terotorisasi. Tinjau EHR, dekripsi secara aman dengan tanda tangan digital blockchain pasien, dan terbitkan berkas rekam medis terenkripsi baru.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Section - Active Patient List (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                {/* Search Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-rose-800" />
                      Pasien Terotorisasi Aktif
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daftar pasien yang memberikan izin akses EHR ke instansi Anda.</p>
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari pasien / wallet..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-rose-800 transition"
                    />
                  </div>
                </div>

                {/* Patient List Table */}
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <UserPlus className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600">Tidak Ada Pasien Aktif</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Kirim permohonan akses baru ke NIK/wallet pasien terlebih dahulu di menu "Request Akses".</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-3 px-4 rounded-l-xl">Identitas Pasien</th>
                          <th className="py-3 px-4">Poliklinik Tujuan</th>
                          <th className="py-3 px-4">Masa Berlaku Izin</th>
                          <th className="py-3 px-4 text-right rounded-r-xl">Aksi Medis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredPatients.map((patient) => (
                          <tr key={patient.patientId} className="hover:bg-slate-50/50 transition">
                            <td className="py-4 px-4">
                              <p className="font-bold text-slate-900">{patient.patientName}</p>
                              <p className="font-mono text-[10px] text-slate-450 mt-0.5">NIK: {patient.nik}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-medium text-slate-700 bg-rose-50 text-rose-900 border border-rose-100 px-2 py-0.5 rounded-lg text-[10px] font-semibold">{patient.poli}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                {patient.expiryTime}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => loadPatientRecords(patient)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-rose-800 hover:text-white hover:border-rose-800 px-3 py-2 font-semibold transition cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" /> EHR
                              </button>
                              <button
                                onClick={() => openAddEhrModal(patient)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white px-3 py-2 font-bold transition shadow-xs cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" /> Tambah
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - EHR History Viewer (1 Col) */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-rose-800" />
                    Peninjau EHR Terdekripsi
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dekripsi rekam medis pasien real-time</p>
                </div>

                {!selectedPatient ? (
                  <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                    <Lock className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-semibold">Pilih pasien dan klik tombol "EHR" untuk menampilkan visualisasi rekam medis terenkripsi.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selected Patient Mini Profile */}
                    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-50/60 p-4 border border-rose-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-rose-800 font-extrabold">Pasien Terpilih</p>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedPatient.patientName}</h4>
                          <p className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[180px]">NIK: {selectedPatient.nik}</p>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-700/10 text-rose-900">
                          <User className="h-4 w-4" />
                        </span>
                      </div>

                      {/* Decryption Signature Interface */}
                      <div className="mt-4 pt-3 border-t border-rose-700/10">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-rose-900 mb-1.5">
                          Kunci Dekripsi (Signature MetaMask)
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={decryptionKeys[selectedPatient.patientId] || ""}
                            onChange={(e) => setDecryptionKeys(prev => ({ ...prev, [selectedPatient.patientId]: e.target.value }))}
                            className="w-full rounded-xl border border-rose-200 px-3 py-1.5 text-[10px] font-mono focus:border-rose-800 focus:outline-hidden bg-white text-slate-800"
                            placeholder="Kunci signature dekripsi"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadPatientRecords(selectedPatient)}
                              disabled={loadingRecords}
                              className="flex-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold py-1 px-2.5 text-[10px] text-center transition cursor-pointer"
                            >
                              {loadingRecords ? "Proses..." : "Terapkan Kunci"}
                            </button>
                            <button
                              onClick={() => generateAutoSignature(selectedPatient.patientId)}
                              className="rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold py-1 px-2.5 text-[10px] text-center transition cursor-pointer"
                            >
                              Demo Auto
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EHR Lists */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Riwayat Kunjungan Medis ({patientRecords.length})</p>
                      
                      {patientRecords.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Belum ada rekam medis terdaftar.</p>
                      ) : (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                          {patientRecords.map((record) => (
                            <div key={record.id} className="rounded-xl border border-slate-100 p-3.5 bg-slate-50 hover:bg-white hover:shadow-xs transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase ${
                                  record.record_type === "umum" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                  record.record_type === "lab" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                                  record.record_type === "radiologi" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                  "bg-rose-50 text-rose-700 border border-rose-100"
                                }`}>
                                  {record.record_type}
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {new Date(record.visit_date).toLocaleDateString("id-ID")}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-800 mb-1">{record.title}</h5>
                              
                              {record.doctor && (
                                <p className="text-[9px] text-slate-500 font-semibold mb-2">Dokter: {record.doctor.name} ({record.doctor.specialist})</p>
                              )}

                              {/* Decryption Status & Decrypted details */}
                              <div className="mt-2 pt-2 border-t border-slate-200/50">
                                {record.detail ? (
                                  <div className="rounded-lg bg-rose-700/5 border border-rose-700/10 p-2.5 text-[10px] space-y-1.5 leading-relaxed text-slate-700 font-medium">
                                    <div className="flex items-center gap-1 text-rose-900 text-[8px] font-bold uppercase mb-1">
                                      <Unlock className="h-3 w-3" /> Medis Terdekripsi
                                    </div>
                                    {record.record_type === "umum" && (
                                      <>
                                        <p><span className="font-bold text-slate-500">Keluhan:</span> {record.detail.complaint || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Diagnosis:</span> {record.detail.diagnosis || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Tindakan:</span> {record.detail.action || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Catatan:</span> {record.detail.note_doctor || "-"}</p>
                                      </>
                                    )}
                                    {record.record_type === "lab" && (
                                      <>
                                        <p><span className="font-bold text-slate-500">Hasil Cek:</span> {record.detail.checkup_result || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Rujukan:</span> {record.detail.reference_values || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Kesimpulan:</span> {record.detail.conclusion || "-"}</p>
                                      </>
                                    )}
                                    {record.record_type === "radiologi" && (
                                      <>
                                        <p><span className="font-bold text-slate-500">Hasil Cek:</span> {record.detail.checkup_result || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Kesimpulan:</span> {record.detail.conclusion || "-"}</p>
                                      </>
                                    )}
                                    {record.record_type === "resep" && (
                                      <>
                                        <p><span className="font-bold text-slate-500">Daftar Obat:</span> {record.detail.list_of_medicines || "-"}</p>
                                        <p><span className="font-bold text-slate-500">Catatan Resep:</span> {record.detail.note || "-"}</p>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-[9px] flex items-start gap-1.5 text-rose-700">
                                    <Lock className="h-3.5 w-3.5 text-rose-600 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="font-bold">EHR Terkunci Aman (AES-256)</p>
                                      <p className="text-[8px] text-rose-500/80 mt-0.5">Input signature digital valid di atas untuk mendekripsi rekam medis ini.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add EHR Modal */}
      {isAddModalOpen && modalPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6 sm:p-8">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5.5 w-5.5 text-rose-800" />
                  Tambah Rekam Medis Baru (EHR)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pasien: <span className="font-bold text-slate-700">{modalPatient.patientName}</span></p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition text-sm cursor-pointer"
              >
                Tutup [X]
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
                    {doctorsList.length === 0 ? (
                      <div className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs text-rose-600 bg-rose-50 font-bold">
                        Belum ada dokter terdaftar di RS ini!
                      </div>
                    ) : (
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                      >
                        {doctorsList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.specialist})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ringkasan Klinis (Umum)</label>
                  <textarea
                    rows={2}
                    value={ehrSummary}
                    onChange={(e) => setEhrSummary(e.target.value)}
                    placeholder="Tulis ringkasan singkat kondisi pasien..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs focus:border-rose-800 focus:outline-hidden"
                  />
                </div>

                {/* Form Encryption Key/Signature */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Kunci Enkripsi (Signature MetaMask Otorisasi)
                  </label>
                  <input
                    type="text"
                    required
                    value={ehrSignature}
                    onChange={(e) => setEhrSignature(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs font-mono bg-slate-50 focus:bg-white focus:border-rose-800 focus:outline-hidden text-slate-700"
                    placeholder="Signature digital enkripsi"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Gunakan signature MetaMask pasang-non-aktif pasien atau gunakan signature otomatis untuk simulasi.</p>
                </div>

                {/* Dynamic Details Forms based on recordType */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Detail Rekam Medis (Enkripsi AES-256)</h4>
                  
                  {recordType === "umum" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Keluhan Utama</label>
                        <input
                          type="text"
                          value={umumDetail.complaint}
                          onChange={(e) => setUmumDetail({ ...umumDetail, complaint: e.target.value })}
                          placeholder="Keluhan utama pasien"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Diagnosis Kerja</label>
                        <input
                          type="text"
                          value={umumDetail.diagnosis}
                          onChange={(e) => setUmumDetail({ ...umumDetail, diagnosis: e.target.value })}
                          placeholder="Diagnosis medis"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tindakan / Terapi</label>
                        <input
                          type="text"
                          value={umumDetail.action}
                          onChange={(e) => setUmumDetail({ ...umumDetail, action: e.target.value })}
                          placeholder="Tindakan klinis yang diberikan"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Catatan Tambahan Dokter</label>
                        <textarea
                          rows={2}
                          value={umumDetail.note_doctor}
                          onChange={(e) => setUmumDetail({ ...umumDetail, note_doctor: e.target.value })}
                          placeholder="Catatan penunjang kontrol medis"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {recordType === "lab" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hasil Pemeriksaan Lab</label>
                        <textarea
                          rows={2}
                          value={labDetail.checkup_result}
                          onChange={(e) => setLabDetail({ ...labDetail, checkup_result: e.target.value })}
                          placeholder="Contoh: Hb 14.2 g/dL, Kolesterol 190 mg/dL"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nilai Rujukan</label>
                        <input
                          type="text"
                          value={labDetail.reference_values}
                          onChange={(e) => setLabDetail({ ...labDetail, reference_values: e.target.value })}
                          placeholder="Contoh: Hb 13.5-17.5 g/dL"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kesimpulan Lab</label>
                        <input
                          type="text"
                          value={labDetail.conclusion}
                          onChange={(e) => setLabDetail({ ...labDetail, conclusion: e.target.value })}
                          placeholder="Kesimpulan hasil tes laboratorium"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {recordType === "radiologi" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Temuan / Hasil Pemeriksaan Radiologi</label>
                        <textarea
                          rows={2}
                          value={radiologyDetail.checkup_result}
                          onChange={(e) => setRadiologyDetail({ ...radiologyDetail, checkup_result: e.target.value })}
                          placeholder="Contoh: Cor dan Pulmo dalam batas normal"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Kesimpulan Radiologi</label>
                        <input
                          type="text"
                          value={radiologyDetail.conclusion}
                          onChange={(e) => setRadiologyDetail({ ...radiologyDetail, conclusion: e.target.value })}
                          placeholder="Kesimpulan rontgen/USG"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {recordType === "resep" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Daftar Obat & Dosis</label>
                        <textarea
                          rows={2}
                          value={prescriptionDetail.list_of_medicines}
                          onChange={(e) => setPrescriptionDetail({ ...prescriptionDetail, list_of_medicines: e.target.value })}
                          placeholder="Contoh: Amoxicillin 500mg 3x1 (Habiskan), Paracetamol 500mg 3x1 (Bila perlu)"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Catatan Penggunaan</label>
                        <input
                          type="text"
                          value={prescriptionDetail.note}
                          onChange={(e) => setPrescriptionDetail({ ...prescriptionDetail, note: e.target.value })}
                          placeholder="Aturan makan / instruksi khusus resep"
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-xs focus:border-rose-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEhr || doctorsList.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-2.5 text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {submittingEhr ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Upload EHR Terenkripsi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
