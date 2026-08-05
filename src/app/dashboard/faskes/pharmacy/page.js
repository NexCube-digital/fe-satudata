"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { apiGet } from "@/lib/api";
import { 
  Pill, 
  ShoppingCart, 
  Package, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Plus,
  RefreshCw,
  Search
} from "lucide-react";

export default function PharmacyDashboardPage() {
  const [stats, setStats] = useState({
    total_medicines: 0,
    low_stock_count: 0,
    today_sales: 0,
    total_transactions: 0,
    pending_prescriptions: 0
  });

  const [recentSales, setRecentSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, medRes] = await Promise.all([
        apiGet("/api/hospital/pharmacy/stats"),
        apiGet("/api/hospital/pharmacy/pos/sales"),
        apiGet("/api/hospital/pharmacy/medicines")
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (salesRes.success) setRecentSales(salesRes.data || []);
      if (medRes.success) setMedicines(medRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data apoteker:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
    fetchData();
  }, []);

  const lowStockItems = medicines.filter(m => m.stock <= 50);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role={user?.role || "staf_rs"} />

      <div className="flex flex-1 flex-col transition-all duration-300">
        <Navbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-rose-900 via-rose-800 to-red-950 p-6 md:p-8 rounded-3xl text-white shadow-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-700/50 border border-rose-500/30 text-rose-100 text-xs font-bold uppercase tracking-wider">
                <Pill className="h-3.5 w-3.5" /> Modul Farmasi & POS Kasir Obat
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Portal Apoteker & Penjualan Obat</h1>
              <p className="text-rose-100 text-xs md:text-sm max-w-xl">
                Kelola resep medis pasien, katalog obat, serta transaksi kasir POS secara terintegrasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition cursor-pointer border border-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <Link
                href="/dashboard/faskes/pharmacy/pos"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-rose-900 font-extrabold text-xs shadow-lg hover:bg-rose-50 transition cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" /> Buka Kasir POS
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Omzet Hari Ini</span>
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-4">
                Rp {stats.today_sales ? stats.today_sales.toLocaleString('id-ID') : "0"}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{stats.total_transactions || 0} Transaksi Kasir</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Antrean Resep</span>
                <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-4">{stats.pending_prescriptions || 0}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Perlu Penyerahan Obat</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Katalog Obat</span>
                <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Package className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-4">{stats.total_medicines || 0}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Jenis Produk Terdaftar</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Peringatan Stok</span>
                <div className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-red-600 mt-4">{stats.low_stock_count || 0}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Stok Menipis / Habis</p>
            </div>
          </div>

          {/* Navigation Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/faskes/pharmacy/prescriptions"
              className="group p-6 bg-linear-to-br from-white to-rose-50/50 rounded-3xl border border-rose-200/80 shadow-xs hover:shadow-lg transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-rose-800 text-white flex items-center justify-center font-bold">
                  <FileText className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-rose-700 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Antrean Resep Obat</h3>
                <p className="text-xs text-slate-500 mt-1">Verifikasi resep dokter dan proses penyerahan obat ke pasien.</p>
              </div>
            </Link>

            <Link
              href="/dashboard/faskes/pharmacy/inventory"
              className="group p-6 bg-linear-to-br from-white to-slate-50 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold">
                  <Package className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-slate-700 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Katalog & Stok Obat</h3>
                <p className="text-xs text-slate-500 mt-1">Kelola daftar obat, harga, kategori, unit, serta penambahan stok.</p>
              </div>
            </Link>

            <Link
              href="/dashboard/faskes/pharmacy/pos"
              className="group p-6 bg-linear-to-br from-white to-emerald-50/50 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-lg transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-700 group-hover:translate-x-1 transition" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Kasir POS Obat Interaktif</h3>
                <p className="text-xs text-slate-500 mt-1">Transaksi penjualan cepat, cetak faktur struk, dan pemotongan stok otomatis.</p>
              </div>
            </Link>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent POS Sales */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-rose-800" />
                  <h2 className="font-extrabold text-slate-900 text-base">Transaksi POS Terbaru</h2>
                </div>
                <Link href="/dashboard/faskes/pharmacy/sales-history" className="text-xs font-bold text-rose-700 hover:underline">
                  Lihat Semua
                </Link>
              </div>

              {recentSales.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">Belum ada transaksi kasir hari ini.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentSales.slice(0, 5).map((trx) => (
                    <div key={trx.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{trx.id}</p>
                        <p className="text-[11px] text-slate-500">{trx.patient_name} • {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-emerald-700">Rp {trx.total_amount.toLocaleString('id-ID')}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
                          {trx.payment_method}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Warnings */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h2 className="font-extrabold text-slate-900 text-base">Peringatan Stok Menipis</h2>
                </div>
                <Link href="/dashboard/faskes/pharmacy/inventory" className="text-xs font-bold text-rose-700 hover:underline">
                  Kelola Stok
                </Link>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Semua Stok Obat Aman</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lowStockItems.map((med) => (
                    <div key={med.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-[11px] text-slate-500">{med.category} • SKU: {med.sku}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          med.stock === 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          Sisa: {med.stock} {med.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
