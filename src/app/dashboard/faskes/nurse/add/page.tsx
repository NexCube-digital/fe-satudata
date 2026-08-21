"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";
import ModernSelect from "@/components/ui/ModernSelect";
import { HeartPulse, ArrowLeft, Save, CheckCircle2, User, Phone, ShieldCheck, Clock, Building2 } from "lucide-react";
import { createNurse } from "@/services/nurseService";

const NURSE_UNITS = [
  "Instalasi Gawat Darurat (IGD)",
  "Instalasi Rawat Inap (Ranap)",
  "Instalasi Rawat Jalan (Rajal)",
  "Instalasi Bedah Sentral (IBS)",
  "Intensive Care Unit (ICU)",
  "One Day Care (ODC)",
  "Poliklinik Spesialis",
  "Pelayanan Rehabilitasi Medik",
  "Unit Perawatan Umum",
];

const GENDER_OPTIONS = [
  { value: "perempuan", label: "Perempuan" },
  { value: "laki-laki", label: "Laki-laki" },
];

const STATUS_OPTIONS = [
  { value: "Aktif", label: "Aktif" },
  { value: "Nonaktif", label: "Nonaktif" },
];

export default function FaskesAddNursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const showToast = (message: string, type = "success", title = "") =>
    notify(setToast, { type, title, message });

  const [formData, setFormData] = useState({
    name: "",
    unit: "Instalasi Gawat Darurat (IGD)",
    str_number: "",
    nira_number: "",
    phone: "",
    sex: "perempuan",
    shift: "Shift Pagi & Malam",
    status: "Aktif",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Nama perawat wajib diisi.", "error", "Validasi Gagal");
      return;
    }
    if (!formData.str_number.trim()) {
      showToast("Nomor STR wajib diisi.", "error", "Validasi Gagal");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createNurse(formData);
      if (res && res.success) {
        showToast("Perawat baru berhasil ditambahkan!", "success", "Berhasil");
        setTimeout(() => {
          router.push("/dashboard/faskes/nurse/list");
        }, 1200);
      } else {
        showToast(res.message || "Gagal menambahkan perawat baru", "error", "Gagal");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan perawat baru", "error", "Gagal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 space-y-6 font-sans">
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/faskes/nurse/list"
            className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Tambah Perawat Baru</h1>
            <p className="text-xs font-medium text-slate-500">
              Registrasikan data tenaga keperawatan ke dalam master data fasilitas kesehatan
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
            <HeartPulse className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Formulir Pendaftaran Perawat</h2>
            <p className="text-xs text-slate-500">Lengkapi informasi identitas, nomor lisensi resmi, dan unit penugasan perawat</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Utama */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">1. Identitas &amp; Unit Kerja</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap &amp; Gelar *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ns. Rahmawati, S.Kep"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Tugas Pelayanan *</label>
                <ModernSelect
                  options={NURSE_UNITS}
                  value={formData.unit}
                  onChange={(val) => setFormData({ ...formData, unit: val })}
                  placeholder="Pilih Unit Tugas..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <ModernSelect
                  options={GENDER_OPTIONS}
                  value={formData.sex}
                  onChange={(val) => setFormData({ ...formData, sex: val })}
                  placeholder="Pilih Jenis Kelamin..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0812xxxxxxx"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Lisensi Keperawatan */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">2. Lisensi &amp; Legalitas Resmi</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor STR (Surat Tanda Registrasi) *</label>
                <input
                  type="text"
                  value={formData.str_number}
                  onChange={(e) => setFormData({ ...formData, str_number: e.target.value })}
                  placeholder="Contoh: STR-PER-1234567"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor NIRA PPNI</label>
                <input
                  type="text"
                  value={formData.nira_number}
                  onChange={(e) => setFormData({ ...formData, nira_number: e.target.value })}
                  placeholder="Contoh: 31710123456"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Pengaturan Dinas */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">3. Status &amp; Pengaturan Dinas</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift / Jadwal Tugas</label>
                <input
                  type="text"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  placeholder="Contoh: Shift Pagi (07:00 - 15:00)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Aktivitas</label>
                <ModernSelect
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  placeholder="Pilih Status..."
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/dashboard/faskes/nurse/list"
              className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xs hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-98 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? "Menyimpan..." : "Simpan Data Perawat"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
