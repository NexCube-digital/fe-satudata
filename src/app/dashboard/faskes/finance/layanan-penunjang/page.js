"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ModernSelect from "@/components/ui/ModernSelect";
import {
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  SlidersHorizontal,
  X,
  FileText,
  FolderTree,
  Activity,
  Microscope,
  Binary,
  Layers
} from "lucide-react";
import {
  getServicePrices,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice
} from "@/services/servicePriceService";

const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const PENUNJANG_CATEGORIES = ["Laboratorium", "Radiologi"];

export default function LayananPenunjangPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicePrices, setServicePrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    price: "",
    status: "active",
    type: "penunjang",
    category: "Laboratorium",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resAll = await getServicePrices();
      let allItems = [];
      if (resAll?.success && Array.isArray(resAll.data)) {
        allItems = resAll.data;
      } else if (Array.isArray(resAll)) {
        allItems = resAll;
      }

      // Filter strictly main Penunjang categories (type === "penunjang")
      const penunjangItems = allItems.filter((i) => i.type === "penunjang");
      setServicePrices(penunjangItems);
    } catch (err) {
      console.error("Error fetching layanan penunjang", err);
      setFeedback({ type: "error", message: "Gagal memuat data Layanan Penunjang RS." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const initialCat = categoryFilter !== "all" ? categoryFilter : "Laboratorium";
    setFormData({
      code: "",
      name: "",
      price: "",
      status: "active",
      type: "penunjang",
      category: initialCat,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || "",
      name: item.name || "",
      price: item.price !== undefined ? String(item.price) : "",
      status: item.status || "active",
      type: "penunjang",
      category: item.category || "Laboratorium",
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFeedback({ type: "error", message: "Nama pemeriksaan dan nominal tarif wajib diisi." });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        code: formData.code.trim() || formData.name.toLowerCase().replace(/\s+/g, "_"),
        name: formData.name.trim(),
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        type: "penunjang",
        category: formData.category ? formData.category.trim() : "Laboratorium",
      };

      let res;
      if (editingItem) {
        res = await updateServicePrice(editingItem.id, payload);
      } else {
        res = await createServicePrice(payload);
      }

      if (res?.success || res?.id) {
        setFeedback({
          type: "success",
          message: editingItem
            ? "Tarif layanan penunjang berhasil diperbarui!"
            : "Komponen tarif penunjang baru berhasil ditambahkan!",
        });
        setIsModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menyimpan biaya penunjang." });
      }
    } catch (err) {
      console.error("Error saving penunjang service price", err);
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pemeriksaan penunjang "${name}"?`)) return;

    try {
      const res = await deleteServicePrice(id);
      if (res?.success) {
        setFeedback({ type: "success", message: `Pemeriksaan penunjang "${name}" berhasil dihapus.` });
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menghapus pemeriksaan penunjang." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi kesalahan sistem saat menghapus data." });
    }
  };

  const categoryOptionsForModal = useMemo(() => {
    return [
      { value: "Laboratorium", label: "Laboratorium", sublabel: "Tes Darah, Urine & Hematologi", badge: "Lab" },
      { value: "Radiologi", label: "Radiologi", sublabel: "Rontgen, USG & CT-Scan", badge: "Radiologi" },
    ];
  }, []);

  const categoryOptionsForFilter = useMemo(() => {
    return [
      { value: "all", label: "Semua Layanan Penunjang", sublabel: "Laboratorium & Radiologi", badge: "All" },
      ...categoryOptionsForModal,
    ];
  }, [categoryOptionsForModal]);

  const statusOptionsForFilter = useMemo(() => {
    return [
      { value: "all", label: "Semua Status", sublabel: "Aktif & Non-Aktif", badge: "All" },
      { value: "active", label: "✔ Aktif", sublabel: "Dapat digunakan untuk transaksi", badge: "Aktif" },
      { value: "inactive", label: "✖ Non-Aktif", sublabel: "Disembunyikan dari transaksi", badge: "Non-Aktif" },
    ];
  }, []);

  const filteredPrices = useMemo(() => {
    return servicePrices.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "active" && item.status !== "active") return false;
      if (statusFilter === "inactive" && item.status !== "inactive") return false;
      if (categoryFilter !== "all" && (item.category || "") !== categoryFilter) return false;

      return true;
    });
  }, [servicePrices, searchTerm, statusFilter, categoryFilter]);

  const labCount = useMemo(() => servicePrices.filter((i) => i.category === "Laboratorium").length, [servicePrices]);
  const radCount = useMemo(() => servicePrices.filter((i) => i.category === "Radiologi").length, [servicePrices]);
  const activeCount = useMemo(() => servicePrices.filter((i) => i.status === "active").length, [servicePrices]);
  const averagePrice = useMemo(() => {
    if (servicePrices.length === 0) return 0;
    const sum = servicePrices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return Math.round(sum / servicePrices.length);
  }, [servicePrices]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-800 mb-2">
                <Activity className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Layanan Penunjang
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Master Data Layanan Penunjang (Lab & Radiologi)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Kelola katalog standar tarif pemeriksaan <strong>Laboratorium</strong> dan diagnostic <strong>Radiologi</strong> (Rontgen, USG, CT-Scan).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Tambah Tarif Penunjang
              </button>
            </div>
          </div>

          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-2xs ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-[#16A34A]"
                  : "bg-red-50 border-red-200 text-[#DC2626]"
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback({ type: "", message: "" })} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tarif Penunjang</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{servicePrices.length} Pemeriksaan</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-800 font-bold">
                <FileText className="h-5 w-5" />
              </span>
            </div>

            <div
              onClick={() => router.push("/dashboard/faskes/finance/layanan-penunjang/Laboratorium")}
              className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-600 transition">Laboratorium</p>
                <p className="text-2xl font-extrabold text-purple-900 mt-1">{labCount} Tes Lab</p>
                <span className="text-[10px] font-bold text-purple-700 underline mt-0.5 inline-block">Lihat Sub-Kategori →</span>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-800 font-bold group-hover:bg-purple-100 transition">
                <Microscope className="h-5 w-5" />
              </span>
            </div>

            <div
              onClick={() => router.push("/dashboard/faskes/finance/layanan-penunjang/Radiologi")}
              className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition">Radiologi</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-1">{radCount} Diagnostic</p>
                <span className="text-[10px] font-bold text-blue-700 underline mt-0.5 inline-block">Lihat Sub-Kategori →</span>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 font-bold group-hover:bg-blue-100 transition">
                <Binary className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Tarif</p>
                <p className="text-xl font-extrabold text-slate-900 font-mono mt-1">{formatRupiah(averagePrice)}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#D97706] font-bold">
                <DollarSign className="h-5 w-5" />
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pemeriksaan laboratorium, rontgen, USG, CT-Scan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-purple-600 focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <ModernSelect
                  options={categoryOptionsForFilter}
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  placeholder="Filter Penunjang"
                  icon={FolderTree}
                  searchable={false}
                />
              </div>

              <div>
                <ModernSelect
                  options={statusOptionsForFilter}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  placeholder="Semua Status"
                  searchable={false}
                />
              </div>
            </div>
          </div>

          {/* Table Master Layanan Penunjang */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-purple-800" />
                Katalog Tarif Layanan Penunjang ({filteredPrices.length})
              </h3>
              <button onClick={fetchData} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {filteredPrices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Tidak ada data pemeriksaan penunjang yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4 text-center">Kategori Penunjang</th>
                      <th className="py-3.5 px-4 text-center">Kode KPTL</th>
                      <th className="py-3.5 px-4 text-center">Nama Pemeriksaan / Tindakan Penunjang</th>
                      <th className="py-3.5 px-4 text-center">Satuan</th>
                      <th className="py-3.5 px-4 text-center">Tarif Standar (Rp)</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredPrices.map((item) => {
                      const isLab = item.category === "Laboratorium";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                                isLab
                                  ? "bg-purple-50 text-purple-800 border border-purple-200"
                                  : "bg-blue-50 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {isLab ? <Microscope className="h-3 w-3 text-purple-600" /> : <Binary className="h-3 w-3 text-blue-600" />}
                              {item.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-extrabold text-purple-900 whitespace-nowrap">
                            {item.kptl || "-"}
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                              {item.satuan || "Per Tindakan"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                            {formatRupiah(item.price)}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => router.push(`/dashboard/faskes/finance/layanan-penunjang/${encodeURIComponent(item.category || "laboratorium")}`)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200/80 hover:bg-purple-700 text-purple-800 hover:text-white font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs group"
                                title="Lihat Sub-Kategori"
                              >
                                <span>Sub-Kategori</span>
                                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-800 text-slate-700 hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                                title="Edit Tarif"
                              >
                                <Pencil className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.name)}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-600 text-rose-600 hover:text-white transition-all cursor-pointer"
                                title="Hapus"
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

          {/* Modal Modern Tambah/Edit Master Biaya Layanan Penunjang */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-800" />
                    {editingItem ? "Edit Pemeriksaan Penunjang" : "Tambah Pemeriksaan Penunjang"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                  {/* Category Selection with ModernSelect */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Penunjang *</label>
                    <ModernSelect
                      options={categoryOptionsForModal}
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      placeholder="Pilih Penunjang..."
                      icon={FolderTree}
                      searchable={false}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pemeriksaan</label>
                    <input
                      type="text"
                      placeholder={formData.category === "Laboratorium" ? "Contoh: LAB-01" : "Contoh: RAD-01"}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-purple-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formData.category === "Laboratorium" ? "Nama Tes / Pemeriksaan Lab *" : "Nama Pemeriksaan / Tindakan Radiologi *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={formData.category === "Laboratorium" ? "Contoh: Tes Darah Lengkap & Hematologi" : "Contoh: Foto Rontgen Thoraks / USG Abdomen"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-purple-200 bg-purple-50/20 p-3 text-xs font-bold text-slate-900 focus:border-purple-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Tarif (Rp) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="Contoh: 200000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-xs text-slate-900 font-mono font-bold focus:border-purple-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Keaktifan</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-purple-600 focus:bg-white focus:outline-hidden"
                    >
                      <option value="active">✔ Aktif</option>
                      <option value="inactive">✖ Non-Aktif</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                      Simpan Penunjang
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
