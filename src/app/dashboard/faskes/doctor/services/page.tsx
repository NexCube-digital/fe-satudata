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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coins
} from "lucide-react";
import {
  getServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice
} from "@/services/servicePriceService";

const emptyForm = {
  code: "",
  name: "",
  price: "",
  status: "active",
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DoctorServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
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
    fetchServices();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getServicePrices();
      if (response?.success && Array.isArray(response.data)) {
        setServices(response.data);
      } else if (Array.isArray(response)) {
        setServices(response);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Gagal memuat daftar layanan dokter", error);
      showFeedback("error", error.message || "Gagal memuat data layanan dokter.");
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk membuat kode otomatis jika pengguna belum memasukkan kode
  const generateAutoCode = () => {
    const count = services.length + 1;
    const codeStr = `LYN-${String(count).padStart(3, "0")}`;
    setForm((prev) => ({ ...prev, code: codeStr }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    const count = services.length + 1;
    setForm({
      code: `LYN-${String(count).padStart(3, "0")}`,
      name: "",
      price: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      code: item.code || "",
      name: item.name || "",
      price: item.price ?? "",
      status: item.status || "active",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = form.code.trim();
    const name = form.name.trim();
    const price = Number(form.price);

    if (!code || !name) {
      showFeedback("error", "Kode layanan dan nama layanan wajib diisi.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      showFeedback("error", "Harga tarif harus berupa angka yang valid.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        name,
        price,
        status: form.status || "active",
      };

      if (editingId) {
        await updateServicePrice(editingId, payload);
        showFeedback("success", `Layanan "${name}" berhasil diperbarui.`);
      } else {
        await createServicePrice(payload);
        showFeedback("success", `Layanan baru "${name}" berhasil ditambahkan.`);
      }

      closeModal();
      await fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      showFeedback("error", error.message || "Gagal menyimpan layanan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      await deleteServicePrice(deletingItem.id);
      showFeedback("success", `Layanan "${deletingItem.name}" berhasil dihapus.`);
      setDeletingItem(null);
      await fetchServices();
    } catch (error) {
      showFeedback("error", error.message || "Gagal menghapus layanan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = useMemo(() => {
    let result = services;

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    const keyword = searchTerm.trim().toLowerCase();
    if (keyword) {
      result = result.filter((item) => {
        const haystack = [item.code, item.name, item.status].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(keyword);
      });
    }

    return result;
  }, [services, searchTerm, statusFilter]);

  const activeCount = useMemo(() => services.filter((s) => s.status === "active").length, [services]);
  const inactiveCount = useMemo(() => services.filter((s) => s.status === "inactive").length, [services]);

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
                <Activity className="h-3.5 w-3.5" />
                <span>Kelola Dokter & Faskes</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Manajemen Layanan & Tarif Dokter
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-2xl">
                Kelola daftar layanan medis, konsultasi, dan tindakan dokter yang digunakan dalam pembuatan rekam medis serta tagihan.
              </p>
            </div>

            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <button
                type="button"
                onClick={fetchServices}
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
                <span>Tambah Layanan Baru</span>
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
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Total Layanan</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{services.length}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Layers className="h-6 w-6" />
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">Layanan Aktif</p>
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
                  placeholder="Cari berdasarkan kode atau nama layanan..."
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-600 focus:bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>

            {/* Table Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-slate-400 gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-teal-600" />
                <p className="text-sm font-semibold">Memuat daftar layanan...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 mb-3">
                  <Coins className="h-7 w-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {searchTerm ? "Layanan tidak ditemukan" : "Belum ada layanan terdaftar"}
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md">
                  {searchTerm
                    ? "Coba gunakan kata kunci pencarian yang berbeda."
                    : "Tambahkan tarif dan jenis layanan pertama Anda untuk mulai digunakan pada pembuatan rekam medis."}
                </p>
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-900 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Layanan Sekarang
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                      <th className="py-3.5 px-4">Kode</th>
                      <th className="py-3.5 px-4">Nama Layanan</th>
                      <th className="py-3.5 px-4">Tarif / Harga</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-bold font-mono text-slate-700">
                            {item.code}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-900 text-sm">
                          {item.name}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap font-extrabold text-teal-800 text-sm">
                          {formatCurrency(item.price)}
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

      {/* FORM MODAL: Tambah / Edit Layanan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4 py-6 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Activity className="h-5 w-5 text-teal-300" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {editingId ? "Edit Layanan Dokter" : "Tambah Layanan Baru"}
                  </h2>
                  <p className="text-xs text-teal-100/70">
                    {editingId ? "Perbarui tarif dan informasi layanan." : "Lengkapi formulir di bawah untuk menambah layanan."}
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
                    Kode Layanan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                      placeholder="Contoh: LYN-001"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold font-mono text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                    Status Layanan
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                  Nama Layanan / Tindakan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Konsultasi Dokter Spesialis Penyakit Dalam"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
                  Harga / Tarif (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="150000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition"
                    required
                  />
                </div>
                {form.price && !Number.isNaN(Number(form.price)) && (
                  <p className="mt-1.5 text-xs text-teal-700 font-semibold">
                    Format: {formatCurrency(form.price)}
                  </p>
                )}
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
                  <span>{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Layanan"}</span>
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
                <h3 className="text-lg font-extrabold text-slate-900">Hapus Layanan</h3>
                <p className="text-xs text-slate-500">Konfirmasi penghapusan tarif layanan.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus layanan <span className="font-extrabold text-slate-900">"{deletingItem.name}"</span> ({deletingItem.code})? Tindakan ini tidak dapat dibatalkan.
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
                {isDeleting ? "Menghapus..." : "Hapus Layanan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
