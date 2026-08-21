"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";
import ModernSelect from "@/components/ui/ModernSelect";
import {
  HeartPulse,
  ArrowLeft,
  Save,
  CheckCircle2,
  User,
  Phone,
  ShieldCheck,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";
import { createNurse } from "@/services/nurseService";

const NURSE_UNITS = [
  { value: "Instalasi Gawat Darurat (IGD)", label: "Instalasi Gawat Darurat (IGD)", sublabel: "Triase & Darurat Medis" },
  { value: "Instalasi Rawat Inap (Ranap)", label: "Instalasi Rawat Inap (Ranap)", sublabel: "Perawatan Kamar Pasien" },
  { value: "Instalasi Rawat Jalan (Rajal)", label: "Instalasi Rawat Jalan (Rajal)", sublabel: "Pemeriksaan Poliklinik Regular" },
  { value: "Instalasi Bedah Sentral (IBS)", label: "Instalasi Bedah Sentral (IBS)", sublabel: "Operasi & Tindakan Bedah" },
  { value: "Intensive Care Unit (ICU)", label: "Intensive Care Unit (ICU)", sublabel: "Perawatan Kritis & Ventilator" },
  { value: "One Day Care (ODC)", label: "One Day Care (ODC)", sublabel: "Perawatan 1 Hari Tanpa Rawat Inap" },
  { value: "Poliklinik Spesialis", label: "Poliklinik Spesialis", sublabel: "Layanan Spesialisik" },
  { value: "Pelayanan Rehabilitasi Medik", label: "Pelayanan Rehabilitasi Medik", sublabel: "Fisioterapi & Pemulihan" },
  { value: "Unit Perawatan Umum", label: "Unit Perawatan Umum", sublabel: "Layanan Kesehatan Umum" },
];

const GENDER_OPTIONS = [
  { value: "perempuan", label: "Perempuan", sublabel: "Wanita / Perawat Perempuan" },
  { value: "laki-laki", label: "Laki-laki", sublabel: "Pria / Perawat Laki-laki" },
];

const STATUS_OPTIONS = [
  { value: "Aktif", label: "Aktif", sublabel: "Dapat Dijadwalkan Dinas" },
  { value: "Nonaktif", label: "Nonaktif", sublabel: "Cuti / Nonaktif Sementara" },
];

const SHIFT_PRESETS = [
  { id: "pagi", name: "Shift Pagi", start: "07:00", end: "15:00" },
  { id: "siang", name: "Shift Siang", start: "15:00", end: "23:00" },
  { id: "malam", name: "Shift Malam", start: "23:00", end: "07:00" },
  { id: "full", name: "Shift 24 Jam", start: "07:00", end: "07:00" },
  { id: "custom", name: "Kustom Jam", start: "08:00", end: "17:00" },
];

const DAYS_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function FaskesAddNursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const showToast = (message: string, type = "success", title = "") =>
    notify(setToast, { type, title, message });

  // Form State (Kosong secara default agar pengguna memilih sendiri)
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    str_number: "",
    nira_number: "",
    phone: "",
    sex: "",
    shift: "",
    status: "",
  });

  // Shift & Interactive Schedule Picker State (Kosong secara default)
  const [shiftPreset, setShiftPreset] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Auto compile shift string
  const compiledShift = useMemo(() => {
    if (!shiftPreset && !startTime && !endTime && selectedDays.length === 0) {
      return "Belum ada jadwal shift yang dipilih";
    }
    const shiftText = shiftPreset || "Kustom Shift";
    const timeText = startTime || endTime ? `(${startTime || "--:--"} - ${endTime || "--:--"})` : "";
    const daysText = selectedDays.length > 0 ? `Hari: ${selectedDays.join(", ")}` : "Belum memilih hari";
    return `${shiftText} ${timeText} ${timeText ? "|" : ""} ${daysText}`.trim();
  }, [shiftPreset, startTime, endTime, selectedDays]);

  const handleSelectPreset = (preset: typeof SHIFT_PRESETS[0]) => {
    setShiftPreset(preset.name);
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const selectAllWorkDays = () => {
    setSelectedDays(["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]);
  };

  const selectAllDays = () => {
    setSelectedDays([...DAYS_LIST]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Nama perawat wajib diisi.", "error", "Validasi Gagal");
      return;
    }
    if (!formData.unit) {
      showToast("Pilih unit tugas pelayanan terlebih dahulu.", "error", "Validasi Gagal");
      return;
    }
    if (!formData.str_number.trim()) {
      showToast("Nomor STR wajib diisi.", "error", "Validasi Gagal");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: formData.status || "Aktif",
        shift: compiledShift !== "Belum ada jadwal shift yang dipilih" ? compiledShift : "Shift Belum Ditetapkan",
      };

      const res = await createNurse(payload);
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap &amp; Gelar *</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit Tugas Pelayanan *</label>
                <ModernSelect
                  options={NURSE_UNITS}
                  value={formData.unit}
                  onChange={(val) => setFormData({ ...formData, unit: val })}
                  placeholder="Pilih Unit Tugas Pelayanan..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Kelamin</label>
                <ModernSelect
                  options={GENDER_OPTIONS}
                  value={formData.sex}
                  onChange={(val) => setFormData({ ...formData, sex: val })}
                  placeholder="Pilih Jenis Kelamin..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">No. HP / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor STR (Surat Tanda Registrasi) *</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor NIRA PPNI</label>
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

          {/* Pengaturan Dinas & Jadwal Shift Interaktif */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">3. Status &amp; Pengaturan Jadwal Shift Dinas</h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Status Aktivitas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Aktivitas Perawat</label>
                <ModernSelect
                  options={STATUS_OPTIONS}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  placeholder="Pilih Status Aktivitas..."
                />
              </div>

              {/* Preview Formatted Shift */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Format Ringkasan Shift Dinas</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                  <span className={`truncate ${compiledShift === "Belum ada jadwal shift yang dipilih" ? "text-slate-400 font-normal italic" : "text-teal-900 font-bold"}`}>
                    {compiledShift}
                  </span>
                </div>
              </div>
            </div>

            {/* PICKER SHIFT INTERAKSI: PRESET SHIFT + CHECKBOX HARI + JAM DINAS */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              {/* Preset Shift Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Shift Dinas Utama</label>
                <div className="flex flex-wrap gap-2">
                  {SHIFT_PRESETS.map((preset) => {
                    const isSelected = shiftPreset === preset.name;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>{preset.name}</span>
                        <span className="text-[10px] opacity-80">({preset.start} - {preset.end})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jam Dinas Start / End */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Jam Mulai Dinas</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="--:--"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Jam Selesai Dinas</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="--:--"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Checkbox Hari Tugas */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Hari Tugas Perawat <span className="text-slate-400 font-normal">(Centang Hari Dinas)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllWorkDays}
                      className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Senin - Jumat
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                    >
                      Semua Hari
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS_LIST.map((day) => {
                    const isChecked = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? "bg-teal-50 border-teal-300 text-teal-900 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span>{day}</span>
                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
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
