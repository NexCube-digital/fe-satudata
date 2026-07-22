"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../layout/Navbar";
import Sidebar from "../../layout/Sidebar";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from "@/lib/doctorService";
import {
  Users,
  Building2,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  User,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function FaskesDoctors() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    specialist: "",
    medical_license: "",
    phone: "",
    sex: "laki-laki",
    practice_schedule: "Senin-Jumat, 08:00-16:00",
    status: "Aktif"
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchDoctorsList();
  }, []);

  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      if (res.success && res.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error("Error loading doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      specialist: "",
      medical_license: "",
      phone: "",
      sex: "laki-laki",
      practice_schedule: "Senin-Jumat, 08:00-16:00",
      status: "Aktif"
    });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setFormData({
      name: doctor.name || "",
      specialist: doctor.specialist || "",
      medical_license: doctor.medical_license || "",
      phone: doctor.phone || "",
      sex: doctor.sex || "laki-laki",
      practice_schedule: doctor.practice_schedule || "Senin-Jumat, 08:00-16:00",
      status: doctor.status || "Aktif"
    });
    setSelectedDoctorId(doctor.id);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.specialist || !formData.medical_license) {
      alert("Harap isi field utama (Nama, Spesialisasi, No Izin)");
      return;
    }
    setSubmitting(true);

    try {
      if (modalMode === "add") {
        const res = await createDoctor(formData);
        if (res.success) {
          alert("Dokter berhasil ditambahkan!");
          fetchDoctorsList();
          setIsModalOpen(false);
        }
      } else {
        const res = await updateDoctor({ ...formData, id: selectedDoctorId });
        if (res.success) {
          alert("Data dokter berhasil diperbarui!");
          fetchDoctorsList();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan data dokter");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data dokter ${name}?`)) {
      return;
    }
    try {
      const res = await deleteDoctor(id);
      if (res.success) {
        alert("Data dokter berhasil dihapus!");
        fetchDoctorsList();
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data dokter");
    }
  };

  if (loading && doctors.length === 0) {
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
          <button onClick={() => router.push("/auth/login")} className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-rose-800 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition">
            Kembali ke Halaman Login
          </button>
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
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <Users className="h-8 w-8 text-rose-400" />
                  Kelola Tenaga Medis (Dokter)
                </h1>
                <p className="text-xs sm:text-sm text-rose-200 mt-2 max-w-2xl leading-relaxed">
                  Kelola staf dokter penanggung jawab poliklinik di instansi Anda. Tautkan dokter untuk keperluan otorisasi rekam medis (EHR) terenkripsi.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-700 hover:bg-rose-400 text-white font-bold px-5 py-3 text-xs sm:text-sm shadow-md transition shrink-0 cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Tambah Dokter Baru
              </button>
            </div>
          </div>

          {/* Doctor Cards Grid */}
          {doctors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Dokter Terdaftar</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto mb-6">Tambahkan dokter baru untuk menghubungkannya dengan unit medis.</p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-4 py-2.5 text-xs transition cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" /> Mulai Tambah Dokter
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div>
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-rose-700 to-rose-800 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                          {doctor.name ? doctor.name.replace("Dr.", "").trim().charAt(0).toUpperCase() : "D"}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{doctor.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-md mt-1 border border-rose-100/50">
                            <Briefcase className="h-3 w-3" /> {doctor.specialist}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        doctor.status === "Aktif"
                          ? "bg-rose-50 border-emerald-250 text-rose-900"
                          : "bg-slate-50 border-slate-250 text-slate-600"
                      }`}>
                        {doctor.status || "Aktif"}
                      </span>
                    </div>

                    {/* Metadata Specs */}
                    <div className="space-y-2 py-3 border-t border-slate-100/80 text-[11px] text-slate-650 font-medium">
                      <p className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-400">Lisensi SIP:</span> <span className="font-mono text-slate-700">{doctor.medical_license}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-400">Jadwal:</span> <span className="text-slate-700">{doctor.practice_schedule || "Senin-Jumat"}</span>
                      </p>
                      {doctor.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-400">Telepon:</span> <span className="text-slate-700">{doctor.phone}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-400">Gender:</span> <span className="capitalize text-slate-700">{doctor.sex || "Laki-laki"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100/80 mt-4">
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-600 p-2.5 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CRUD Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5.5 w-5.5 text-rose-800" />
                  {modalMode === "add" ? "Registrasi Dokter Baru" : "Edit Profil Dokter"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Lengkapi formulir dokter rumah sakit di bawah ini.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold transition text-sm cursor-pointer"
              >
                Tutup [X]
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Lengkap Dokter</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Sarah Wijaya"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Spesialisasi / Poli</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kardiologi"
                    value={formData.specialist}
                    onChange={(e) => setFormData({ ...formData, specialist: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No Izin SIP (Medical License)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SIP-2026-987"
                    value={formData.medical_license}
                    onChange={(e) => setFormData({ ...formData, medical_license: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    placeholder="0812XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                  >
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Jadwal Praktik Dokter</label>
                <input
                  type="text"
                  placeholder="Contoh: Senin - Jumat, 08:00 - 15:00"
                  value={formData.practice_schedule}
                  onChange={(e) => setFormData({ ...formData, practice_schedule: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status Keaktifan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:border-rose-800 focus:outline-hidden"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold px-6 py-2.5 text-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {modalMode === "add" ? "Registrasi Dokter" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
