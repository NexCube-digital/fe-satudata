"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";
import ModernSelect from "@/components/ui/ModernSelect";
import {
  HeartPulse,
  UserPlus,
  Search,
  RefreshCw,
  X,
  Phone,
  ShieldCheck,
  Building2,
  Trash2,
  Edit,
  Activity,
  CheckCircle2,
  Clock,
  Filter,
  User,
} from "lucide-react";
import { getNurses, deleteNurse, updateNurse } from "@/services/nurseService";

const NURSE_UNITS = [
  "Semua Unit",
  "Instalasi Gawat Darurat (IGD)",
  "Instalasi Rawat Inap (Ranap)",
  "Instalasi Rawat Jalan (Rajal)",
  "Instalasi Bedah Sentral (IBS)",
  "Intensive Care Unit (ICU)",
  "One Day Care (ODC)",
];

const UNIT_OPTIONS = NURSE_UNITS.filter((u) => u !== "Semua Unit");

export default function FaskesNurseListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nurses, setNurses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("Semua Unit");
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [editingNurse, setEditingNurse] = useState<any>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  const showToast = (message: string, type = "success", title = "") =>
    notify(setToast, { type, title, message });

  const fetchNursesList = async () => {
    setLoading(true);
    try {
      const res = await getNurses();
      if (res && res.success && Array.isArray(res.data)) {
        setNurses(res.data);
      } else if (Array.isArray(res)) {
        setNurses(res);
      }
    } catch (err) {
      console.error("Error fetching nurses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNursesList();
  }, []);

  const filteredNurses = useMemo(() => {
    return nurses.filter((nurse) => {
      const matchesUnit =
        selectedUnit === "Semua Unit" ||
        (nurse.unit || "").toLowerCase().includes(selectedUnit.toLowerCase().replace(/.*?\((.*?)\).*/, "$1"));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (nurse.name || "").toLowerCase().includes(q) ||
        (nurse.str_number || "").toLowerCase().includes(q) ||
        (nurse.nira_number || "").toLowerCase().includes(q) ||
        (nurse.unit || "").toLowerCase().includes(q);

      return matchesUnit && matchesSearch;
    });
  }, [nurses, selectedUnit, searchQuery]);

  const handleDeleteNurse = async (id: number | string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data perawat ${name}?`)) return;

    try {
      const res = await deleteNurse(id);
      if (res.success) {
        showToast(`Data perawat ${name} berhasil dihapus.`, "success", "Berhasil");
        fetchNursesList();
      } else {
        showToast(res.message || "Gagal menghapus perawat", "error", "Gagal");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus perawat", "error", "Gagal");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNurse) return;

    setSubmittingEdit(true);
    try {
      const res = await updateNurse(editingNurse.id, {
        name: editingNurse.name,
        unit: editingNurse.unit,
        str_number: editingNurse.str_number,
        nira_number: editingNurse.nira_number,
        phone: editingNurse.phone,
        shift: editingNurse.shift,
        status: editingNurse.status,
      });

      if (res.success) {
        showToast("Data perawat berhasil diperbarui.", "success", "Berhasil");
        setEditingNurse(null);
        fetchNursesList();
      } else {
        showToast(res.message || "Gagal memperbarui perawat", "error", "Gagal");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui perawat", "error", "Gagal");
    } finally {
      setSubmittingEdit(false);
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

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0">
            <HeartPulse className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Kelola Data Perawat</h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                Master Data
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Daftar tenaga keperawatan terdaftar yang bertugas di fasilitas kesehatan Anda
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchNursesList}
            className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
          </button>

          <Link
            href="/dashboard/faskes/nurse/add"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 text-white font-black text-xs hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 active:scale-98 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Perawat Baru</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Perawat</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{nurses.length}</p>
          <span className="text-[10px] font-semibold text-teal-600 mt-1 inline-block">Terhubung dengan Faskes</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Status Aktif</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {nurses.filter((n) => (n.status || "Aktif") === "Aktif").length}
          </p>
          <span className="text-[10px] font-semibold text-emerald-600 mt-1 inline-block">Siap Bertugas / Jadwal Shift</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Unit Terbanyak</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">IGD &amp; Ranap</p>
          <span className="text-[10px] font-semibold text-indigo-600 mt-1 inline-block">Alokasi Pelayanan Utama</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama perawat, STR, NIRA, atau unit tugas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* ModernSelect Dropdown Filter Unit */}
          <div className="w-full sm:w-72">
            <ModernSelect
              options={NURSE_UNITS}
              value={selectedUnit}
              onChange={(val) => setSelectedUnit(val)}
              placeholder="Pilih Filter Unit..."
              icon={Filter}
            />
          </div>

          <div className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Menampilkan <span className="text-teal-700 font-extrabold">{filteredNurses.length}</span> dari {nurses.length} perawat
          </div>
        </div>
      </div>

      {/* Main Table / Nurse Grid */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500">Memuat data perawat...</span>
          </div>
        ) : filteredNurses.length === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <HeartPulse className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">Belum Ada Data Perawat</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
              Data perawat belum tersedia atau tidak cocok dengan kriteria filter Anda.
            </p>
            <Link
              href="/dashboard/faskes/nurse/add"
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
            >
              + Tambah Perawat Pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Nama Perawat</th>
                  <th className="py-3.5 px-4">Unit Tugas</th>
                  <th className="py-3.5 px-4">Nomor STR &amp; NIRA</th>
                  <th className="py-3.5 px-4">Kontak / HP</th>
                  <th className="py-3.5 px-4">Shift &amp; Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredNurses.map((nurse, idx) => {
                  return (
                    <tr key={nurse.id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                            <HeartPulse className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs">{nurse.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {nurse.sex === "laki-laki" ? "Laki-laki" : "Perempuan"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-extrabold">
                          {nurse.unit || "Umum"}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-mono text-xs text-slate-800 font-bold">STR: {nurse.str_number || "-"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIRA: {nurse.nira_number || "-"}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{nurse.phone || "-"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                              (nurse.status || "Aktif") === "Aktif"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {nurse.status || "Aktif"}
                          </span>
                          {nurse.shift && <div className="text-[10px] text-slate-500 font-medium">{nurse.shift}</div>}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNurse(nurse)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-teal-600 hover:border-teal-300 transition cursor-pointer"
                            title="Edit Perawat"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNurse(nurse.id, nurse.name)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                            title="Hapus Perawat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Edit Perawat */}
      {editingNurse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Data Perawat</h3>
              <button
                onClick={() => setEditingNurse(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={editingNurse.name || ""}
                  onChange={(e) => setEditingNurse({ ...editingNurse, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Tugas</label>
                  <ModernSelect
                    options={UNIT_OPTIONS}
                    value={editingNurse.unit || "Instalasi Gawat Darurat (IGD)"}
                    onChange={(val) => setEditingNurse({ ...editingNurse, unit: val })}
                    placeholder="Pilih Unit Tugas..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Aktivitas</label>
                  <ModernSelect
                    options={[
                      { value: "Aktif", label: "Aktif" },
                      { value: "Nonaktif", label: "Nonaktif" },
                    ]}
                    value={editingNurse.status || "Aktif"}
                    onChange={(val) => setEditingNurse({ ...editingNurse, status: val })}
                    placeholder="Pilih Status..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor STR</label>
                  <input
                    type="text"
                    value={editingNurse.str_number || ""}
                    onChange={(e) => setEditingNurse({ ...editingNurse, str_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor NIRA PPNI</label>
                  <input
                    type="text"
                    value={editingNurse.nira_number || ""}
                    onChange={(e) => setEditingNurse({ ...editingNurse, nira_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift / Jadwal Tugas</label>
                <input
                  type="text"
                  value={editingNurse.shift || ""}
                  onChange={(e) => setEditingNurse({ ...editingNurse, shift: e.target.value })}
                  placeholder="Contoh: Shift Pagi & Malam"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNurse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
                >
                  {submittingEdit ? "Simpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
