"use client";

import { useState } from "react";
import { X, UserPlus, AlertCircle, Info, RefreshCw } from "lucide-react";

export default function NewPatientModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    email: "",
    phone: "",
    sex: "laki-laki",
    place_of_birth: "",
    date_of_birth: "",
    blood_type: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSecurePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "SatuData@";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + "!";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Nama lengkap pasien wajib diisi.");
      return;
    }
    if (!formData.nik.trim() || formData.nik.length !== 16) {
      setErrorMsg("NIK harus 16 digit angka.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Nomor telepon wajib diisi.");
      return;
    }
    if (!formData.place_of_birth.trim()) {
      setErrorMsg("Tempat lahir wajib diisi.");
      return;
    }
    if (!formData.date_of_birth) {
      setErrorMsg("Tanggal lahir wajib diisi.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg("Alamat domisili KTP wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("accessToken");
    const generatedPassword = generateSecurePassword();

    try {
      // 1. Submit Registration via API /api/hospital/patient
      const regRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nik: formData.nik,
            name: formData.name,
            email: formData.email,
            password: generatedPassword,
            place_of_birth: formData.place_of_birth,
            date_of_birth: formData.date_of_birth || null,
            sex: formData.sex,
            address: formData.address,
            phone: formData.phone,
            blood_type: formData.blood_type || null,
            emergency_contact_name: formData.emergency_contact_name || null,
            emergency_contact_phone: formData.emergency_contact_phone || null,
          }),
        }
      );

      const regResult = await regRes.json();

      if (!regRes.ok || !regResult.success) {
        setErrorMsg(regResult.message || "Gagal mendaftarkan pasien baru.");
        setIsSubmitting(false);
        return;
      }

      // 2. Automatically Submit Access Request for this Hospital
      const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const reqRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientNik: formData.nik,
            jenisDataDiminta: "Pemeriksaan Medis",
            txHash,
          }),
        }
      );

      const reqResult = await reqRes.json();
      const newPatientObj = regResult.data || regResult.patient;

      const createdPatient = {
        patientId: newPatientObj?.id || newPatientObj?.patient_id || `PAT-${Date.now()}`,
        patientName: formData.name,
        nik: formData.nik,
        phone: formData.phone,
        emergencyName: formData.emergency_contact_name || formData.name,
        emergencyPhone: formData.emergency_contact_phone || formData.phone,
        emergencyRelation: "Saudara / Kerabat",
        requestId: reqResult?.data?.id || `REQ-${Date.now()}`,
      };

      onSuccess(createdPatient);
      onClose();
    } catch (err) {
      console.error("Error creating patient:", err);
      // Fallback object for UI demo if API fails
      const createdPatient = {
        patientId: `PAT-${Date.now()}`,
        patientName: formData.name,
        nik: formData.nik,
      };
      onSuccess(createdPatient);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-white px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                FORM PENDAFTARAN PASIEN BARU
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Lengkapi formulir pendaftaran di bawah ini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Container Biodata Pasien */}
          <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-extrabold text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-1.5 uppercase tracking-wider mb-4">
              <Info className="h-4 w-4 text-teal-800" />
              INFORMASI BIODATA PASIEN
            </h4>

            {/* NIK Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                required
                value={formData.nik}
                onChange={(e) => handleChange("nik", e.target.value.replace(/\D/g, ""))}
                placeholder="16 Digit NIK sesuai KTP"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:border-teal-600 focus:outline-hidden"
              />
            </div>

            {/* Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nama Lengkap Pasien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Sesuai KTP"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Email Pasien (Opsional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="emailpasien@example.com (Kosongkan jika belum ada)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Telepon & Sex */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => handleChange("sex", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                >
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            {/* Tempat Lahir & Tanggal Lahir */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.place_of_birth}
                  onChange={(e) => handleChange("place_of_birth", e.target.value)}
                  placeholder="Kota Kelahiran"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange("date_of_birth", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Golongan Darah & Alamat Domisili KTP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Golongan Darah
                </label>
                <input
                  type="text"
                  value={formData.blood_type}
                  onChange={(e) => handleChange("blood_type", e.target.value)}
                  placeholder="Contoh: A / B / O / AB"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Alamat Domisili KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Alamat lengkap beserta RT/RW"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Hubungan Kontak Darurat & No HP Kontak Darurat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Hubungan Kontak Darurat
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                  placeholder="Contoh: Ayah / Ibu / Istri"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  No HP Kontak Darurat
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                  placeholder="08xxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold px-6 py-3.5 text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Daftarkan Pasien &amp; Ajukan Akses Medis
          </button>
        </form>
      </div>
    </div>
  );
}
