"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import {
  Stethoscope,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Save,
  X,
  BadgeCheck,
  BadgeAlert,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from "lucide-react";
import {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty
} from "@/services/specialtyService";
import SearchableSelect from "@/components/ui/SearchableSelect";

const emptyForm = {
  code: "",
  name: "",
  category: "",
  status: "active",
};

export default function DoctorSpecialtiesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Gagal membaca user dari localStorage", error);
      }
    }
    fetchSpecialtiesData();
  }, []);

  useEffect(() => {
    if (isModalOpen || deletingItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, deletingItem]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const fetchSpecialtiesData = async () => {
    setLoading(true);
    try {
      const res: any = await getSpecialties();
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setSpecialties(rawList);
    } catch (err) {
      console.error("Gagal memuat data spesialisasi", err);
      showFeedback("error", "Gagal memuat data spesialisasi.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    const count = specialties.length + 1;
    setForm({
      code: `POLI-${String(count).padStart(3, "0")}`,
      name: "",
      category: "Poliklinik",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      code: item.code || "",
      name: item.name || "",
      category: item.category || "",
      status: item.status || "active",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const code = form.code.trim();
    const name = form.name.trim();

    if (!code || !name) {
      showFeedback("error", "Kode dan Nama Spesialisasi wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        updateSpecialty(editingId, {
          code,
          name,
          category: form.category,
          status: form.status,
        });
        showFeedback("success", `Spesialisasi "${name}" berhasil diperbarui.`);
      } else {
        createSpecialty({
          code,
          name,
          category: form.category,
          status: form.status,
        });
        showFeedback("success", `Spesialisasi baru "${name}" berhasil ditambahkan.`);
      }

      closeModal();
      fetchSpecialtiesData();
    } catch (err) {
      console.error("Error saving specialty:", err);
      showFeedback("error", "Gagal menyimpan spesialisasi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      deleteSpecialty(deletingItem.id);
      showFeedback("success", `Spesialisasi "${deletingItem.name}" berhasil dihapus.`);
      setDeletingItem(null);
      fetchSpecialtiesData();
    } catch (err) {
      showFeedback("error", "Gagal menghapus spesialisasi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSpecialties = useMemo(() => {
    let result = specialties;

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    const keyword = searchTerm.trim().toLowerCase();
    if (keyword) {
      result = result.filter((item) => {
        const haystack = [item.code, item.name, item.category, item.status].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(keyword);
      });
    }

    return result;
  }, [specialties, searchTerm, statusFilter]);

  const activeCount = useMemo(() => specialties.filter((s) => s.status === "active").length, [specialties]);
  const inactiveCount = useMemo(() => specialties.filter((s) => s.status === "inactive").length, [specialties]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {/* Header Banner */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-200 border border-teal-500/30 mb-2">
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Kelola Dokter & Poliklinik</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Manajemen Spesialisasi Dokter
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-2xl">
                Kelola daftar spesialisasi dan poliklinik dokter yang akan menjadi pilihan dropdown pada form Tambah Dokter dan Edit Dokter.
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <button
                type="button"
                onClick={fetchSpecialtiesData}
                disabled={loading}
                className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md border border-white/10"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-extrabold px-5 py-3 text-sm shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Tambah Spesialisasi Baru</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert Toast */}
          {feedback && (
            <div
              className={`mb-6 rounded-2xl border p-4 text-sm font-medium flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Total Spesialisasi</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{specialties.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Stethoscope className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">Aktif</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-800">{activeCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BadgeCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-700">Tidak Aktif</p>
                <p className="mt-1 text-3xl font-extrabold text-amber-800">{inactiveCount}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <BadgeAlert className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Controls Bar & Table Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              {/* Search input */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari spesialisasi, kode, atau kategori..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <div className="w-40">
                  <SearchableSelect
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    options={[
                      { value: "all", label: "Semua Status" },
                      { value: "active", label: "Aktif" },
                      { value: "inactive", label: "Tidak Aktif" },
                    ]}
                    searchable={false}
                  />
                </div>
              </div>
            </div>

            {/* Table Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-slate-400 gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-teal-600" />
                <p className="text-sm font-semibold">Memuat daftar spesialisasi...</p>
              </div>
            ) : filteredSpecialties.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 mb-3">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {searchTerm ? "Spesialisasi tidak ditemukan" : "Belum ada spesialisasi terdaftar"}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md">
                  {searchTerm
                    ? "Coba gunakan kata kunci pencarian yang berbeda."
                    : "Tambahkan spesialisasi dokter pertama Anda."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                      <th className="py-3.5 px-4">Kode</th>
                      <th className="py-3.5 px-4">Nama Spesialisasi / Poli</th>
                      <th className="py-3.5 px-4">Kategori / Divisi</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSpecialties.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-bold font-mono text-slate-700">
                            {item.code}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-900 text-sm">
                          {item.name}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-600 text-xs">
                          {item.category || "Poliklinik"}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              item.status === "active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {item.status === "active" ? (
                              <BadgeCheck className="h-3.5 w-3.5" />
                            ) : (
                              <BadgeAlert className="h-3.5 w-3.5" />
                            )}
                            {item.status === "active" ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-teal-800 transition cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingItem(item)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FORM MODAL: Tambah / Edit Spesialisasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4 py-6 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Stethoscope className="h-5 w-5 text-teal-300" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {editingId ? "Edit Spesialisasi Dokter" : "Tambah Spesialisasi Baru"}
                  </h2>
                  <p className="text-xs text-teal-100/70">
                    Isi detail spesialisasi / poliklinik yang dapat dipilih pada form Dokter.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                    Kode Spesialisasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="Contoh: POLI-PD"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold font-mono text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                    Status
                  </label>
                  <SearchableSelect
                    value={form.status}
                    onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
                    options={[
                      { value: "active", label: "Aktif" },
                      { value: "inactive", label: "Tidak Aktif" },
                    ]}
                    searchable={false}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                  Nama Spesialisasi / Poliklinik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Spesialis Penyakit Dalam"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                  Kategori / Divisi
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Contoh: Rawat Jalan / Inap"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-800 to-cyan-900 px-6 py-3 text-sm font-bold text-white shadow-md hover:from-teal-900 hover:to-slate-900 disabled:opacity-60 transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Spesialisasi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4 py-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Hapus Spesialisasi</h3>
                <p className="text-xs text-slate-500">Konfirmasi penghapusan master spesialisasi.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus spesialisasi <span className="font-extrabold text-slate-900">"{deletingItem.name}"</span> ({deletingItem.code})?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-60"
              >
                {isDeleting ? "Menghapus..." : "Hapus Spesialisasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
