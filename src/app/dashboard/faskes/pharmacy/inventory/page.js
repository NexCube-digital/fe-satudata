"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { apiGet, apiPost } from "@/lib/api";
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Pill,
  Filter,
  X,
  Save
} from "lucide-react";

export default function PharmacyInventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Analgesik / Anti-Piretik",
    sku: "",
    stock: 100,
    unit: "Tablet",
    price: 10000
  });

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/hospital/pharmacy/medicines");
      if (res.success) {
        setMedicines(res.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat obat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
    fetchMedicines();
  }, []);

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      category: "Analgesik / Anti-Piretik",
      sku: `OBT-${Math.floor(100 + Math.random() * 900)}`,
      stock: 100,
      unit: "Tablet",
      price: 10000
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingMedicine(item);
    setFormData({
      name: item.name,
      category: item.category,
      sku: item.sku,
      stock: item.stock,
      unit: item.unit,
      price: item.price
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...(editingMedicine ? { id: editingMedicine.id } : {}),
        ...formData
      };
      const res = await apiPost("/api/hospital/pharmacy/medicines", payload);
      if (res.success) {
        fetchMedicines();
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Gagal menyimpan obat:", err);
    }
  };

  const categories = Array.from(new Set(medicines.map(m => m.category)));

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.sku.toLowerCase().includes(search.toLowerCase()) ||
                        m.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role={user?.role || "staf_rs"} />

      <div className="flex flex-1 flex-col transition-all duration-300">
        <Navbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-1">
                <Package className="h-4 w-4" /> Manajemen Inventaris Obat
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Katalog & Stok Obat Farmasi</h1>
              <p className="text-xs text-slate-500">Kelola ketersediaan produk obat, SKU, satuan, dan penyesuaian harga.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchMedicines}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-rose-700" : ""}`} /> Refresh
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-800 text-white font-extrabold text-xs shadow-md hover:bg-rose-900 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Obat Baru
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari obat berdasarkan nama, SKU, atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:border-rose-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-rose-700"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of Medicines */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-rose-700 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Memuat katalog obat...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Package className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700">Tidak Ada Data Obat</p>
                <p className="text-xs text-slate-400">Silakan tambahkan produk obat baru atau ubah kata kunci pencarian.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4">Kode SKU</th>
                      <th className="px-5 py-4">Nama Produk Obat</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">Jumlah Stok</th>
                      <th className="px-5 py-4">Harga / Satuan</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">{item.sku}</td>
                        <td className="px-5 py-4 font-extrabold text-slate-900">{item.name}</td>
                        <td className="px-5 py-4">{item.category}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {item.stock} {item.unit}
                        </td>
                        <td className="px-5 py-4 font-extrabold text-emerald-700">
                          Rp {item.price.toLocaleString('id-ID')} / {item.unit}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-1 rounded-full text-[10px] uppercase ${
                            item.status === "Habis"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : item.status === "Stok Menipis"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit / Update
                          </button>
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

      {/* Modal Add / Edit Obat */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingMedicine ? "Edit Data Obat" : "Tambah Produk Obat Baru"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Nama Produk Obat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paracetamol 500mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-medium focus:border-rose-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono font-bold focus:border-rose-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-rose-700 focus:outline-none bg-white"
                  >
                    <option value="Analgesik / Anti-Piretik">Analgesik / Anti-Piretik</option>
                    <option value="Antibiotik">Antibiotik</option>
                    <option value="Suplemen & Vitamin">Suplemen & Vitamin</option>
                    <option value="Obat Batuk & Flu">Obat Batuk & Flu</option>
                    <option value="Anti-Histamin / Alergi">Anti-Histamin / Alergi</option>
                    <option value="Obat Lambung / Maag">Obat Lambung / Maag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-rose-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Satuan</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-rose-700 focus:outline-none bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Kaplet">Kaplet</option>
                    <option value="Kapsul">Kapsul</option>
                    <option value="Strip">Strip</option>
                    <option value="Botol">Botol</option>
                    <option value="Tube">Tube</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-rose-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-800 text-white font-extrabold hover:bg-rose-900 transition"
                >
                  <Save className="h-4 w-4" /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
