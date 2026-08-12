"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import {
  Coins,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Save,
  X,
  BadgeCheck,
  BadgeAlert,
} from "lucide-react";
import {
  createServicePrice,
  deleteServicePrice,
  getServicePrices,
  updateServicePrice,
} from "@/services/layananservice";

const emptyForm = {
  code: "",
  name: "",
  price: "",
  status: "active",
  type: "layanan",
  category: "Rawat Jalan",
};

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ServicePriceManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [servicePrices, setServicePrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Gagal membaca user dari localStorage", error);
      }
    }

    fetchServicePrices();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const fetchServicePrices = async () => {
    try {
      setLoading(true);
      const response = await getServicePrices();
      if (response?.success && Array.isArray(response.data)) {
        setServicePrices(response.data);
      } else {
        setServicePrices([]);
      }
    } catch (error) {
      console.error("Gagal memuat service price", error);
      showFeedback("error", error.message || "Gagal memuat data service price");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      code: item.code || "",
      name: item.name || "",
      price: item.price ?? "",
      status: item.status || "active",
      type: item.type || "layanan",
      category: item.category || "Rawat Jalan",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const code = form.code.trim();
    const name = form.name.trim();
    const price = Number(form.price);

    if (!code || !name || Number.isNaN(price) || price < 0) {
      showFeedback("error", "Kode, nama, dan harga wajib diisi dengan benar.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        name,
        price,
        status: form.status || "active",
        type: form.type || "layanan",
        category: form.category || null,
      };

      if (editingId) {
        await updateServicePrice(editingId, payload);
        showFeedback("success", "Service price berhasil diperbarui.");
      } else {
        await createServicePrice(payload);
        showFeedback("success", "Service price berhasil ditambahkan.");
      }

      closeModal();
      await fetchServicePrices();
    } catch (error) {
      showFeedback("error", error.message || "Gagal menyimpan data service price");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Hapus service price ini?");
    if (!confirmed) return;

    try {
      await deleteServicePrice(id);
      showFeedback("success", "Service price berhasil dihapus.");
      await fetchServicePrices();
    } catch (error) {
      showFeedback("error", error.message || "Gagal menghapus service price");
    }
  };

  const filteredPrices = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return servicePrices;

    return servicePrices.filter((item) => {
      const haystack = [item.code, item.name, item.status].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [searchTerm, servicePrices]);

  const activeCount = servicePrices.filter((item) => item.status === "active").length;
  const inactiveCount = servicePrices.length - activeCount;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />
      <div className="flex flex-1">
        <Sidebar role="faskes" />
        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-rose-700">Dashboard Faskes</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Manajemen Service Price</h1>
              <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                Kelola daftar tarif layanan rumah sakit yang dipakai pada proses rekam medis dan tagihan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard/faskes/medical-records")}
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <Plus className="h-4 w-4" />
                Tambah Service Price
              </button>
            </div>
          </div>

          {feedback && (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {feedback.message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Total Data</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{servicePrices.length}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Aktif</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">{activeCount}</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Tidak Aktif</p>
              <p className="mt-2 text-2xl font-extrabold text-amber-700">{inactiveCount}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari kode, nama, atau status"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-rose-300 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={fetchServicePrices}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-sm font-medium text-slate-500">
                Memuat data service price...
              </div>
            ) : filteredPrices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <Coins className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-extrabold text-slate-800">Belum ada service price</h2>
                <p className="mt-1 text-sm text-slate-500">Tambahkan tarif layanan pertama Anda untuk mulai menggunakannya.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr className="text-left text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                      <th className="py-3 pr-4">Kode</th>
                      <th className="py-3 pr-4">Nama</th>
                      <th className="py-3 pr-4">Harga</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrices.map((item) => (
                      <tr key={item.id} className="align-top text-sm text-slate-700">
                        <td className="py-3 pr-4 font-semibold text-slate-900">{item.code}</td>
                        <td className="py-3 pr-4">
                          <div className="font-semibold">{item.name}</div>
                        </td>
                        <td className="py-3 pr-4 font-semibold">{formatCurrency(item.price)}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {item.status === "active" ? <BadgeCheck className="h-3.5 w-3.5" /> : <BadgeAlert className="h-3.5 w-3.5" />}
                            {item.status || "active"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{editingId ? "Edit Service Price" : "Tambah Service Price"}</h2>
                <p className="text-sm text-slate-500">Isi detail tarif layanan yang akan dipakai sistem.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <span className="mb-1.5 block">Kode</span>
                  <input
                    value={form.code}
                    onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white"
                    placeholder="CON-001"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  <span className="mb-1.5 block">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                <span className="mb-1.5 block">Nama Layanan</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white"
                  placeholder="Konsultasi Dokter Spesialis"
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                <span className="mb-1.5 block">Harga</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white"
                  placeholder="150000"
                  required
                />
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-70"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan Service Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
