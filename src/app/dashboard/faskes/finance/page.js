"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
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
  Sparkles,
  SlidersHorizontal,
  X,
  FileText
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

export default function FaskesFinanceMasterPricePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicePrices, setServicePrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      const res = await getServicePrices();
      if (res?.success && Array.isArray(res.data)) {
        setServicePrices(res.data);
      } else if (Array.isArray(res)) {
        setServicePrices(res);
      } else {
        setServicePrices([]);
      }
    } catch (err) {
      console.error("Error fetching service prices", err);
      setFeedback({ type: "error", message: "Gagal memuat katalog biaya awal RS." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({ code: "", name: "", price: "", status: "active" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || "",
      name: item.name || "",
      price: item.price !== undefined ? String(item.price) : "",
      status: item.status || "active",
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
            : "Komponen biaya awal baru berhasil ditambahkan!",
        });
        setIsModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: "error", message: res?.message || "Gagal menyimpan biaya." });
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

  const filteredPrices = useMemo(() => {
    return servicePrices.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "active") return item.status === "active";
      if (statusFilter === "inactive") return item.status === "inactive";
      return true;
    });
  }, [servicePrices, searchTerm, statusFilter]);

  const activeCount = useMemo(() => servicePrices.filter((i) => i.status === "active").length, [servicePrices]);
  const averagePrice = useMemo(() => {
    if (servicePrices.length === 0) return 0;
    const sum = servicePrices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    return Math.round(sum / servicePrices.length);
  }, [servicePrices]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
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
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
                <DollarSign className="h-3.5 w-3.5" /> Modul Master Keuangan RS
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pengaturan & Master Biaya Awal RS
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Kelola katalog standar tarif pelayanan medis, konsultasi dokter, pemeriksaan lab/radiologi, dan biaya administrasi awal sebelum diterbitkan dalam invoice pasien.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Tambah Master Biaya Awal
              </button>
              <button
                onClick={() => router.push("/dashboard/faskes/finance/invoice")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 px-4 py-2.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
              >
                <CreditCard className="h-4 w-4 text-teal-800" /> Buat Tagihan Invoice Pasien <ArrowRight className="h-3.5 w-3.5" />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Komponen Biaya</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{servicePrices.length}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
                <FileText className="h-6 w-6" />
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Biaya Aktif</p>
                <p className="text-2xl font-extrabold text-[#16A34A] mt-1">{activeCount} Layanan</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#16A34A] font-bold">
                <CheckCircle2 className="h-6 w-6" />
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Tarif RS</p>
                <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{formatRupiah(averagePrice)}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#D97706] font-bold">
                <DollarSign className="h-6 w-6" />
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
                  placeholder="Cari nama layanan atau kode biaya awal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
                >
                  <option value="all">Semua Status (Aktif & Non-Aktif)</option>
                  <option value="active">✔ Aktif</option>
                  <option value="inactive">✖ Non-Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Master Biaya */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-teal-800" />
                Katalog Biaya Awal RS ({filteredPrices.length})
              </h3>
              <button onClick={fetchData} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {filteredPrices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic text-xs">
                Tidak ada data master biaya awal yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Kode Service</th>
                      <th className="py-3 px-4">Nama Komponen / Layanan</th>
                      <th className="py-3 px-4">Tarif Standar (Rp)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredPrices.map((item) => {
                      const isActive = item.status === "active";
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">
                            {item.code || "-"}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900">
                            {item.name}
                          </td>
                          <td className="py-4 px-4 font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                            {formatRupiah(item.price)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                isActive
                                  ? "bg-emerald-50 text-[#16A34A] border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {isActive ? <CheckCircle2 className="h-3 w-3 text-[#16A34A]" /> : <XCircle className="h-3 w-3 text-slate-400" />}
                              {isActive ? "Aktif" : "Non-Aktif"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-500" /> Edit Tarif
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-2.5 py-1.5 font-bold transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Modal Tambah/Edit Master Biaya */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal-800" />
                    {editingItem ? "Edit Komponen Biaya Awal" : "Tambah Master Biaya Awal"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Service / Biaya</label>
                    <input
                      type="text"
                      placeholder="Contoh: umum, lab, admin, registrasi"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Layanan / Komponen Biaya *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Konsultasi Dokter Umum"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Tarif (Rp) *</label>
                    <input
                      type="number"
                      required
                      placeholder="Contoh: 150000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden"
                    />
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
                      Simpan Biaya Awal
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
