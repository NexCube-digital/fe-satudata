"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { apiGet } from "@/lib/api";
import { 
  History, 
  Search, 
  RefreshCw, 
  ShoppingCart, 
  FileText, 
  Eye, 
  Calendar, 
  CreditCard,
  Pill
} from "lucide-react";

export default function PharmacySalesHistoryPage() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/hospital/pharmacy/pos/sales");
      if (res.success) {
        setSales(res.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
    fetchSales();
  }, []);

  const filtered = sales.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    s.payment_method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0 font-sans text-slate-900">
      <Navbar user={user} roleLabel="Staf Farmasi & Apotek" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-1">
                <History className="h-4 w-4" /> Modul Audit & Histori POS
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Riwayat Transaksi POS Obat</h1>
              <p className="text-xs text-slate-500">Rekapitulasi transaksi kasir farmasi, metode pembayaran, dan item obat terlayani.</p>
            </div>

            <button
              onClick={fetchSales}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-rose-700" : ""}`} /> Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ID transaksi, nama pembeli, atau metode bayar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-medium focus:border-rose-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Table of Sales */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-rose-700 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Memuat riwayat transaksi...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <History className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm font-extrabold text-slate-700">Belum Ada Riwayat Transaksi</p>
                <p className="text-xs text-slate-400">Transaksi kasir POS yang berhasil akan ditampilkan di halaman ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4">ID Transaksi</th>
                      <th className="px-5 py-4">Nama Pasien / Pembeli</th>
                      <th className="px-5 py-4">Waktu Transaksi</th>
                      <th className="px-5 py-4">Metode Bayar</th>
                      <th className="px-5 py-4">Total Belanja</th>
                      <th className="px-5 py-4">Petugas Kasir</th>
                      <th className="px-5 py-4 text-right">Rincian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-4 font-mono font-extrabold text-rose-800">{item.id}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{item.patient_name}</td>
                        <td className="px-5 py-4 text-slate-500">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                            {item.payment_method}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-extrabold text-emerald-700">
                          Rp {item.total_amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-4">{item.staff_name || "Staf Apoteker"}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedTrx(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Lihat Struk
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

      {/* Modal Detail Struk */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Faktur Struk POS</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedTrx.id}</p>
              </div>
              <button onClick={() => setSelectedTrx(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2 text-xs font-mono border-b border-dashed border-slate-200 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Pembeli:</span>
                <span className="font-bold text-slate-900">{selectedTrx.patient_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Metode:</span>
                <span className="uppercase font-bold">{selectedTrx.payment_method}</span>
              </div>
              <div className="pt-2 divide-y divide-slate-100">
                {(() => {
                  const rawItems = selectedTrx.items;
                  let itemList = [];
                  if (Array.isArray(rawItems)) {
                    itemList = rawItems;
                  } else if (typeof rawItems === "string") {
                    try {
                      const parsed = JSON.parse(rawItems);
                      if (Array.isArray(parsed)) itemList = parsed;
                    } catch (e) {}
                  }

                  if (itemList.length === 0) {
                    return <div className="py-1 text-slate-400 italic">Tidak ada rincian item</div>;
                  }

                  return itemList.map((it, idx) => (
                    <div key={idx} className="py-1 flex justify-between">
                      <span>{it.name || "Obat"} x{it.qty || 1}</span>
                      <span>Rp {(Number(it.subtotal) || 0).toLocaleString('id-ID')}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono pt-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total:</span>
                <span className="text-emerald-700">Rp {(Number(selectedTrx.total_amount) || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bayar:</span>
                <span>Rp {(Number(selectedTrx.amount_paid) || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-800">
                <span>Kembali:</span>
                <span>Rp {(Number(selectedTrx.change) || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTrx(null)}
                className="px-5 py-2.5 rounded-xl bg-rose-800 text-white font-extrabold text-xs hover:bg-rose-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
