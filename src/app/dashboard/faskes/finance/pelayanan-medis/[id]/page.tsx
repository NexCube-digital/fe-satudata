"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ModernSelect from "@/components/ui/ModernSelect";
import {
  Stethoscope,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  SlidersHorizontal,
  X,
  FileText,
  DollarSign,
  Layers,
  Activity,
  Sparkles,
  ChevronRight,
  Tag
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

const CATEGORY_MAP = {
  "IGD-01": "Instalasi Gawat Darurat",
  "RJ-01": "Instalasi Rawat Jalan",
  "RI-01": "Instalasi Rawat Inap",
  "ODC-01": "One Day Care",
  "IBC-01": "Instalasi Bedah Central",
  "PRM-01": "Pelayanan Rehabilitas Medik",
};

export default function DetailPelayananMedisPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const paramId = rawId ? decodeURIComponent(rawId) : "";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parentCategory, setParentCategory] = useState(null);
  const [subServices, setSubServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Modal State for Add/Edit Sub-Layanan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    kptl: "",
    name: "",
    satuan: "Per Tindakan",
    price: "",
    status: "active",
    type: "sub_layanan",
    category: "",
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
  }, [paramId]);

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

      // 1. Identify parent category by ID or Code
      let parent = allItems.find(
        (i) =>
          String(i.id) === paramId ||
          i.code === paramId ||
          i.name?.toLowerCase() === paramId.toLowerCase() ||
          i.category?.toLowerCase() === paramId.toLowerCase()
      );

      // Fallback from map
      if (!parent && CATEGORY_MAP[paramId]) {
        parent = {
          code: paramId,
          name: CATEGORY_MAP[paramId],
          category: CATEGORY_MAP[paramId],
        };
      }

      const targetCategoryName = parent ? parent.name || parent.category : paramId;
      setParentCategory(parent || { name: targetCategoryName, code: paramId });

      // 2. Filter sub-services matching targetCategoryName
      const matchingSub = allItems.filter((i) => {
        if (i.type === "kategori") return false;
        if (!i.category) return false;
        const catLower = i.category.toLowerCase();
        const targetLower = targetCategoryName.toLowerCase();
        return (
          catLower === targetLower ||
          catLower.includes(targetLower) ||
          targetLower.includes(catLower)
        );
      });

      setSubServices(matchingSub);
    } catch (err) {
      console.error("Error fetching detail pelayanan medis", err);
      setFeedback({ type: "error", message: "Gagal memuat rincian sub-layanan medis." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const catName = parentCategory?.name || parentCategory?.category || "Layanan Medis";
    setFormData({
      code: "",
      kptl: "",
      name: "",
      satuan: "Per Tindakan",
      price: "",
      status: "active",
      type: "sub_layanan",
      category: catName,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || "",
      kptl: item.kptl || "",
      name: item.name || "",
      satuan: item.satuan || "Per Tindakan",
      price: item.price !== undefined ? String(item.price) : "",
      status: item.status || "active",
      type: "sub_layanan",
      category: item.category || parentCategory?.name || "Layanan Medis",
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFeedback({ type: "error", message: "Nama sub-layanan dan nominal tarif wajib diisi." });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        code: formData.code.trim() || formData.name.toLowerCase().replace(/\s+/g, "_"),
        kptl: formData.kptl.trim(),
        name: formData.name.trim(),
        satuan: formData.satuan.trim() || "Per Tindakan",
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        type: "sub_layanan",
        category: formData.category || parentCategory?.name || "Layanan Medis",
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
            ? "Tarif sub-layanan berhasil diperbarui!"
            : "Rincian sub-layanan baru berhasil ditambahkan!",
        });
        setIsModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menyimpan rincian sub-layanan." });
      }
    } catch (err) {
      console.error("Error saving sub-service price", err);
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sub-layanan "${name}"?`)) return;

    try {
      const res = await deleteServicePrice(id);
      if (res?.success) {
        setFeedback({ type: "success", message: `Sub-layanan "${name}" berhasil dihapus.` });
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menghapus sub-layanan." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi kesalahan sistem saat menghapus data." });
    }
  };

  const statusOptionsForFilter = useMemo(() => {
    return [
      { value: "all", label: "Semua Status", sublabel: "Aktif & Non-Aktif", badge: "All" },
      { value: "active", label: "✔ Aktif", sublabel: "Dapat digunakan untuk transaksi", badge: "Aktif" },
      { value: "inactive", label: "✖ Non-Aktif", sublabel: "Disembunyikan dari transaksi", badge: "Non-Aktif" },
    ];
  }, []);

  const filteredSubServices = useMemo(() => {
    return subServices.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kptl?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "active" && item.status !== "active") return false;
      if (statusFilter === "inactive" && item.status !== "inactive") return false;

      return true;
    });
  }, [subServices, searchTerm, statusFilter]);

  const activeCount = useMemo(() => subServices.filter((i) => i.status === "active").length, [subServices]);
  const averagePrice = useMemo(() => {
    if (subServices.length === 0) return 0;
    const sum = subServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return Math.round(sum / subServices.length);
  }, [subServices]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
      </div>
    );
  }

  const categoryTitle = parentCategory?.name || parentCategory?.category || paramId;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4">
            <button
              onClick={() => router.push("/dashboard/faskes/finance/pelayanan-medis")}
              className="hover:text-teal-700 transition cursor-pointer"
            >
              Layanan Medis
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-800">{categoryTitle}</span>
          </div>

          {/* Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
                <Stethoscope className="h-3.5 w-3.5" /> SK Dirut RSP Rotinsulu HK.02.03/D.XLI/11414/2024
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {categoryTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Rincian resmi katalog unit spesialis, KPTL, dan tarif sub-layanan medis yang terikat pada <strong>{categoryTitle}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Tambah Sub-Layanan
              </button>
              <button
                onClick={() => router.push("/dashboard/faskes/finance/pelayanan-medis")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </button>
            </div>
          </div>

          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center justify-between shadow-2xs ${feedback.type === "success"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sub-Layanan</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{subServices.length} Item</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
                <Layers className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Aktif</p>
                <p className="text-2xl font-extrabold text-emerald-800 mt-1">{activeCount} Sub-Layanan</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#16A34A] font-bold">
                <CheckCircle2 className="h-5 w-5" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Cari rincian sub-layanan, kode KPTL, atau kode service...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
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

          {/* Table Sub-Layanan */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-teal-800" />
                Katalog Resmi Sub-Layanan {categoryTitle} ({filteredSubServices.length})
              </h3>
              <button onClick={fetchData} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {filteredSubServices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Belum ada rincian sub-layanan untuk {categoryTitle}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4 text-center">Kode KPTL</th>
                      <th className="py-3.5 px-4 text-center">Nama Sub-Layanan / Klinik / Tindakan</th>
                      <th className="py-3.5 px-4 text-center">Satuan</th>
                      <th className="py-3.5 px-4 text-center">Nominal Tarif (Rp)</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredSubServices.map((item) => {
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-4 text-center font-mono font-extrabold text-teal-900 whitespace-nowrap">
                            {item.kptl || "-"}
                          </td>
                          <td className="py-4 px-4 text-center font-extrabold text-slate-900 text-sm">
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

          {/* Modal Tambah/Edit Sub-Layanan */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-teal-800" />
                    {editingItem ? `Edit Sub-Layanan (${categoryTitle})` : `Tambah Sub-Layanan (${categoryTitle})`}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                  <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-1">
                    <label className="block text-xs font-extrabold text-teal-900 mb-0.5">
                      Induk Layanan Medis *
                    </label>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-xs font-extrabold text-teal-900 shadow-2xs">
                      <Stethoscope className="h-4 w-4 text-teal-700" />
                      <span>{categoryTitle}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kode KPTL</label>
                      <input
                        type="text"
                        placeholder="Contoh: 12802.KM007"
                        value={formData.kptl}
                        onChange={(e) => setFormData({ ...formData, kptl: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kode Service</label>
                      <input
                        type="text"
                        placeholder="Contoh: SUB-01, RJ-SUB-01"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sub-Layanan / Klinik / Tindakan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Klinik Spesialis Paru / Bronchoscopy / Infra Red"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-teal-200 bg-teal-50/20 p-3 text-xs font-bold text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Layanan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Per Tindakan, Per Pasien, Per Hari"
                        value={formData.satuan}
                        onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Tarif (Rp) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                          Rp
                        </span>
                        <input
                          type="number"
                          required
                          placeholder="150000"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-3 text-xs text-slate-900 font-mono font-bold focus:border-teal-600 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Keaktifan</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden"
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
                      className="rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                      Simpan Sub-Layanan
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
