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
  CreditCard,
  ArrowRight,
  SlidersHorizontal,
  X,
  FileText,
  Layers,
  FolderTree,
  Stethoscope,
  Sparkles
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

const FIVE_MAIN_CATEGORIES = [
  "Rawat Jalan",
  "Rawat Inap",
  "IGD",
  "One Day Care",
  "Administrasi",
];

export default function TarifLayananPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicePrices, setServicePrices] = useState([]);
  const [dbCategories, setDbCategories] = useState(FIVE_MAIN_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Custom Category Input Mode in Modal
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    price: "",
    status: "active",
    type: "layanan",
    category: "Rawat Jalan",
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

      // Filter Layanan for Table
      const layananItems = allItems.filter((i) => (i.type || "layanan") === "layanan");
      setServicePrices(layananItems);

      // Extract Categories from DB
      const catSet = new Set(FIVE_MAIN_CATEGORIES);
      allItems.forEach((i) => {
        if (i.category && FIVE_MAIN_CATEGORIES.includes(i.category)) {
          catSet.add(i.category);
        } else if (i.category) {
          catSet.add(i.category);
        }
      });
      setDbCategories(Array.from(catSet));
    } catch (err) {
      console.error("Error fetching tarif layanan", err);
      setFeedback({ type: "error", message: "Gagal memuat katalog Tarif Layanan RS." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const initialCat = categoryFilter !== "all" ? categoryFilter : "Rawat Jalan";
    setIsCustomCategory(!dbCategories.includes(initialCat));
    setFormData({
      code: "",
      name: "",
      price: "",
      status: "active",
      type: "layanan",
      category: initialCat,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const cat = item.category || "Rawat Jalan";
    setIsCustomCategory(!dbCategories.includes(cat));
    setFormData({
      code: item.code || "",
      name: item.name || "",
      price: item.price !== undefined ? String(item.price) : "",
      status: item.status || "active",
      type: "layanan",
      category: cat,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setFeedback({ type: "error", message: "Nama layanan dan nominal tarif wajib diisi." });
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
        type: "layanan",
        category: formData.category ? formData.category.trim() : null,
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
            ? "Tarif layanan berhasil diperbarui!"
            : "Komponen biaya layanan baru berhasil ditambahkan!",
        });
        setIsModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menyimpan biaya layanan." });
      }
    } catch (err) {
      console.error("Error saving service price", err);
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komponen biaya "${name}"?`)) return;

    try {
      const res = await deleteServicePrice(id);
      if (res?.success) {
        setFeedback({ type: "success", message: `Komponen biaya "${name}" berhasil dihapus.` });
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menghapus komponen biaya." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi kesalahan sistem saat menghapus data." });
    }
  };

  const categoryOptionsForModal = useMemo(() => {
    const list = [
      { value: "Rawat Jalan", label: "Rawat Jalan", sublabel: "Poliklinik & Dokter Spesialis", badge: "Kategori Utama" },
      { value: "Rawat Inap", label: "Rawat Inap", sublabel: "Kamar & Perawatan Inap", badge: "Kategori Utama" },
      { value: "IGD", label: "IGD", sublabel: "Layanan Gawat Darurat", badge: "Kategori Utama" },
      { value: "One Day Care", label: "One Day Care", sublabel: "Perawatan Satu Hari (ODC)", badge: "Kategori Utama" },
      { value: "Administrasi", label: "Administrasi", sublabel: "Pendaftaran, Lab, Radiologi & EHR", badge: "Administrasi" },
    ];

    dbCategories.forEach((cat) => {
      if (!list.some((i) => i.value === cat)) {
        list.push({ value: cat, label: cat, sublabel: "Kategori Lain", badge: "Custom" });
      }
    });

    return list;
  }, [dbCategories]);

  const categoryOptionsForFilter = useMemo(() => {
    return [
      { value: "all", label: "Semua Identitas Kategori (5 Kategori)", sublabel: "Rawat Jalan, Rawat Inap, IGD, ODC, Administrasi", badge: "All" },
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

  const rawatJalanCount = useMemo(() => servicePrices.filter((i) => i.category === "Rawat Jalan").length, [servicePrices]);
  const rawatInapCount = useMemo(() => servicePrices.filter((i) => i.category === "Rawat Inap").length, [servicePrices]);
  const activeCount = useMemo(() => servicePrices.filter((i) => i.status === "active").length, [servicePrices]);
  const averagePrice = useMemo(() => {
    if (servicePrices.length === 0) return 0;
    const sum = servicePrices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return Math.round(sum / servicePrices.length);
  }, [servicePrices]);

  // Context-aware dynamic labels, placeholders, and badge hints for the 5 categories
  const categoryContext = useMemo(() => {
    const cat = (formData.category || "").trim();
    if (cat === "Rawat Jalan") {
      return {
        badgeIcon: "🩺",
        badgeText: "Unit Rawat Jalan (Poliklinik)",
        badgeStyle: "bg-teal-50 text-teal-800 border-teal-200",
        label: "Nama Poliklinik / Spesialis *",
        placeholder: "Contoh: Klinik Eksekutif, Klinik Jantung, Klinik Aster",
        codePrefix: "RJ-",
        helpText: "Masukkan nama unit poliklinik rawat jalan.",
      };
    }
    if (cat === "Rawat Inap") {
      return {
        badgeIcon: "🛏",
        badgeText: "Kamar & Perawatan Rawat Inap",
        badgeStyle: "bg-cyan-50 text-cyan-800 border-cyan-200",
        label: "Tipe / Kelas Kamar Rawat Inap *",
        placeholder: "Contoh: Kelas Utama/VIP, Kelas I, HCU, ICU",
        codePrefix: "RI-",
        helpText: "Masukkan tipe atau nama kelas ruangan rawat inap.",
      };
    }
    if (cat === "IGD") {
      return {
        badgeIcon: "🚨",
        badgeText: "Layanan Gawat Darurat (IGD)",
        badgeStyle: "bg-red-50 text-red-800 border-red-200",
        label: "Nama Layanan IGD *",
        placeholder: "Contoh: Penanganan Triage Gawat Darurat",
        codePrefix: "IGD-",
        helpText: "Masukkan nama tindakan atau layanan IGD.",
      };
    }
    if (cat === "One Day Care") {
      return {
        badgeIcon: "⏱",
        badgeText: "Perawatan Satu Hari (ODC)",
        badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Nama Paket / Layanan One Day Care *",
        placeholder: "Contoh: Paket Operasi Kecil ODC, Ruang Observasi ODC",
        codePrefix: "ODC-",
        helpText: "Masukkan nama tindakan atau paket perawatan ODC.",
      };
    }
    if (cat === "Administrasi") {
      return {
        badgeIcon: "📋",
        badgeText: "Administrasi, Registrasi & EHR",
        badgeStyle: "bg-slate-100 text-slate-800 border-slate-200",
        label: "Nama Biaya Administrasi / Registrasi *",
        placeholder: "Contoh: Pendaftaran Faskes, Administrasi Encrypted EHR",
        codePrefix: "ADM-",
        helpText: "Masukkan jenis biaya administrasi atau pendaftaran.",
      };
    }
    return {
      badgeIcon: "⚡",
      badgeText: `Layanan (${cat || "Umum"})`,
      badgeStyle: "bg-indigo-50 text-indigo-800 border-indigo-200",
      label: "Nama Layanan / Komponen Biaya *",
      placeholder: "Contoh: Konsultasi Dokter Spesialis",
      codePrefix: "SRV-",
      helpText: "Masukkan nama komponen biaya layanan.",
    };
  }, [formData.category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/auth/login")} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-800 mb-2">
                <Layers className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Tarif Layanan
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Master Data Tarif Layanan (Administrasi)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Kelola rincian biaya komponen dan tarif <strong>Administrasi</strong> Faskes (Pendaftaran Pasien, Kartu Berobat, EHR Encrypted, Surat Keterangan Dokter, Pengurusan BPJS/Asuransi, dan Resep Farmasi).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-700 to-cyan-800 hover:from-indigo-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Tambah Tarif Layanan
              </button>
              <button
                onClick={() => router.push("/dashboard/faskes/finance/pelayanan-medis")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 px-4 py-2.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                <Stethoscope className="h-4 w-4 text-teal-700" /> Ke Pelayanan Medis <ArrowRight className="h-3.5 w-3.5" />
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tarif Layanan</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{servicePrices.length} Item</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-800 font-bold">
                <FileText className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Klinik Rawat Jalan</p>
                <p className="text-2xl font-extrabold text-teal-900 mt-1">{rawatJalanCount} Poliklinik</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
                <FolderTree className="h-5 w-5" />
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kamar Rawat Inap</p>
                <p className="text-2xl font-extrabold text-cyan-900 mt-1">{rawatInapCount} Tipe Kamar</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 font-bold">
                <Layers className="h-5 w-5" />
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
                  placeholder="Cari nama komponen biaya administrasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:bg-white focus:outline-hidden font-medium"
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

          {/* Table Master Biaya Layanan */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-800" />
                Katalog Tarif Layanan ({filteredPrices.length})
              </h3>
              <button onClick={fetchData} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {filteredPrices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Tidak ada data tarif layanan yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4 text-center">Identitas Kategori</th>
                      <th className="py-3.5 px-4 text-center">Kode KPTL</th>
                      <th className="py-3.5 px-4 text-center">Nama Komponen Layanan Administrasi</th>
                      <th className="py-3.5 px-4 text-center">Satuan</th>
                      <th className="py-3.5 px-4 text-center">Tarif Standar (Rp)</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredPrices.map((item) => {
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            {item.category ? (
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                                <FolderTree className="h-3.5 w-3.5 text-indigo-700" />
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-indigo-900 whitespace-nowrap">
                            {item.kptl || item.code || "-"}
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                              {item.satuan || "Per Pasien"}
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

          {/* Modal Modern Tambah/Edit Master Biaya Layanan */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 mb-1">
                      <Sparkles className="h-3.5 w-3.5" /> Dropdown 5 Kategori Resmi
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-indigo-800" />
                      {editingItem ? "Edit Komponen Tarif Layanan" : "Tambah Tarif Layanan Baru"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                  {/* Category Selection with ModernSelect (Strict 5 Categories) */}
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <FolderTree className="h-4 w-4 text-indigo-600" />
                        Identitas Kategori (5 Kategori) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(!isCustomCategory)}
                        className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                      >
                        {isCustomCategory ? "← Pilih 5 Kategori" : "+ Ketik Kategori Lain"}
                      </button>
                    </div>

                    {!isCustomCategory ? (
                      <ModernSelect
                        options={categoryOptionsForModal}
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                        placeholder="Pilih Identitas Kategori..."
                        icon={FolderTree}
                        searchable={true}
                      />
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="Ketik nama kategori baru (Contoh: Rehabilitasi, Hemodialisa)"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-2xl border border-indigo-300 bg-white p-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition"
                      />
                    )}

                    {/* Context Badge Hint */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold ${categoryContext.badgeStyle}`}>
                        <span>{categoryContext.badgeIcon}</span>
                        <span>{categoryContext.badgeText}</span>
                      </span>
                    </div>
                  </div>

                  {/* Kode Service / Biaya */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Service / Biaya</label>
                    <input
                      type="text"
                      placeholder={`Contoh: ${categoryContext.codePrefix}01`}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-indigo-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Context-Aware Dynamic Name Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">
                        {categoryContext.label}
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={categoryContext.placeholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-indigo-200/90 bg-indigo-50/20 p-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      💡 {categoryContext.helpText}
                    </p>
                  </div>

                  {/* Nominal Tarif (Rp) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Tarif (Rp) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        required
                        placeholder="Contoh: 150000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-xs text-slate-900 font-mono font-bold focus:border-indigo-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Status Keaktifan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Keaktifan</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
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
                      className="rounded-2xl bg-gradient-to-r from-indigo-700 to-cyan-800 hover:from-indigo-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                      Simpan Tarif Layanan
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
