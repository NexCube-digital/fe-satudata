"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { apiGet, apiPost } from "@/lib/api";
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  Printer, 
  RefreshCw, 
  Pill,
  User,
  DollarSign
} from "lucide-react";

export default function PharmacyPOSPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState("Pasien Umum / Walk-in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [user, setUser] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/hospital/pharmacy/medicines");
      if (res.success) {
        setMedicines(res.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat obat POS:", err);
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

  const addToCart = (med) => {
    if (med.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find(item => item.medicine_id === med.id);
      if (existing) {
        if (existing.qty >= med.stock) return prev;
        return prev.map(item => item.medicine_id === med.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { medicine_id: med.id, name: med.name, price: med.price, qty: 1, maxStock: med.stock, unit: med.unit }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => {
      return prev.map(item => {
        if (item.medicine_id === id) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxStock) return item;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.medicine_id !== id));
  };

  const totalAmount = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const paidVal = Number(amountPaid) || totalAmount;
  const changeVal = Math.max(0, paidVal - totalAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const payload = {
        patient_name: patientName,
        items: cart.map(c => ({ medicine_id: c.medicine_id, qty: c.qty })),
        payment_method: paymentMethod,
        amount_paid: paidVal
      };

      const res = await apiPost("/api/hospital/pharmacy/pos/checkout", payload);
      if (res.success) {
        setLastReceipt(res.data);
        setCart([]);
        setAmountPaid("");
        fetchMedicines();
      }
    } catch (err) {
      console.error("Gagal checkout POS:", err);
    } finally {
      setProcessing(false);
    }
  };

  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.sku.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar role={user?.role || "staf_rs"} />

      <div className="flex flex-1 flex-col transition-all duration-300">
        <Navbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-1">
                <ShoppingCart className="h-4 w-4" /> Kasir Penjualan Obat POS
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Point of Sale (POS) Obat</h1>
              <p className="text-xs text-slate-500">Pilih produk obat, kalkulasi otomatis total & kembalian, dan cetak faktur transaksi.</p>
            </div>

            <button
              onClick={fetchMedicines}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-rose-700" : ""}`} /> Refresh Obat
            </button>
          </div>

          {/* POS Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Product Selector (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik untuk mencari produk obat atau SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium focus:border-rose-700 focus:outline-none"
                />
              </div>

              {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <RefreshCw className="h-8 w-8 animate-spin text-rose-700 mx-auto" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => addToCart(med)}
                      className={`p-4 rounded-2xl border bg-white transition cursor-pointer flex flex-col justify-between space-y-3 shadow-xs ${
                        med.stock === 0
                          ? "opacity-50 border-slate-200 cursor-not-allowed"
                          : "border-slate-200 hover:border-rose-700 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{med.sku}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            med.stock === 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            Stok: {med.stock} {med.unit}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1">{med.name}</h4>
                        <p className="text-[11px] text-slate-500">{med.category}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          Rp {med.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5" /> Tambah
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Cart & Checkout (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-rose-800" />
                    <h3 className="font-extrabold text-slate-900 text-base">Keranjang Kasir</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{cart.length} Item</span>
                </div>

                {/* Patient Info */}
                <div className="space-y-1 text-xs">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400">Nama Pasien / Pembeli</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-rose-700 focus:outline-none"
                  />
                </div>

                {/* Cart Items List */}
                {cart.length === 0 ? (
                  <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Pill className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Keranjang masih kosong</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.medicine_id} className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="space-y-0.5 max-w-[160px]">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-emerald-700 font-extrabold">Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                            <button onClick={() => updateQty(item.medicine_id, -1)} className="p-1 hover:bg-slate-100 text-slate-600"><Minus className="h-3 w-3" /></button>
                            <span className="px-2 font-extrabold text-slate-900">{item.qty}</span>
                            <button onClick={() => updateQty(item.medicine_id, 1)} className="p-1 hover:bg-slate-100 text-slate-600"><Plus className="h-3 w-3" /></button>
                          </div>

                          <button onClick={() => removeFromCart(item.medicine_id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calculation Summary */}
                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Metode Pembayaran</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="font-bold text-slate-900 border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
                    >
                      <option value="cash font-bold">Tunai / Cash</option>
                      <option value="qris">QRIS</option>
                      <option value="transfer">Transfer Bank</option>
                      <option value="debit">Kartu Debit</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">Total Belanja</span>
                    <span className="text-lg font-extrabold text-emerald-700">Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-extrabold uppercase text-slate-400">Jumlah Uang Diterima (Rp)</label>
                    <input
                      type="number"
                      placeholder={`Minimal Rp ${totalAmount.toLocaleString('id-ID')}`}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 font-extrabold text-sm focus:border-rose-700 focus:outline-none"
                    />
                  </div>

                  {amountPaid && (
                    <div className="flex justify-between items-center pt-1 font-bold text-slate-700">
                      <span>Kembalian</span>
                      <span className="text-rose-800">Rp {changeVal.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || processing}
                  className={`w-full py-3 rounded-2xl text-white font-extrabold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                    cart.length === 0 || processing ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Proses Transaksi & Bayar
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Struk / Receipt */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-lg">Transaksi Berhasil</h3>
              <p className="text-xs text-slate-500 font-mono">{lastReceipt.id}</p>
            </div>

            <div className="space-y-2 text-xs font-mono border-b border-dashed border-slate-200 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Pembeli:</span>
                <span className="font-bold text-slate-900">{lastReceipt.patient_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Waktu:</span>
                <span>{new Date(lastReceipt.created_at).toLocaleTimeString('id-ID')}</span>
              </div>
              <div className="pt-2 divide-y divide-slate-100">
                {(() => {
                  const rawItems = lastReceipt.items;
                  let itemList = [];
                  if (Array.isArray(rawItems)) {
                    itemList = rawItems;
                  } else if (typeof rawItems === "string") {
                    try {
                      const parsed = JSON.parse(rawItems);
                      if (Array.isArray(parsed)) itemList = parsed;
                    } catch (e) {}
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
                <span>Rp {lastReceipt.total_amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bayar:</span>
                <span>Rp {lastReceipt.amount_paid.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembali:</span>
                <span>Rp {lastReceipt.change.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition"
              >
                <Printer className="h-4 w-4" /> Cetak Struk
              </button>
              <button
                onClick={() => setLastReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-rose-800 text-white font-extrabold text-xs hover:bg-rose-900 transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
