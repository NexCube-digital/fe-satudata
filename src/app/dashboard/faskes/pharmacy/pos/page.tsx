"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, getAccessToken } from "@/lib/api";
import { getInvoicePatients, checkoutPOS } from "@/services/invoiceService";
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
} from "lucide-react";

export default function PharmacyPOSPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [buyerType, setBuyerType] = useState("walkin"); // "walkin" | "registered"
  const [patientName, setPatientName] = useState("");
  const [registeredPatients, setRegisteredPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [user, setUser] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/hospital/pharmacy/medicines");
      if (res.success) setMedicines(res.data || []);
    } catch (err) {
      console.error("Gagal memuat obat POS:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredPatients = async () => {
    try {
      const token = getAccessToken();
      if (!token) console.warn("Tidak ada accessToken saat memuat pasien.");
      const res = await getInvoicePatients();
      const patients = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRegisteredPatients(patients);
    } catch (err) {
      console.error("Gagal memuat pasien:", err);
      setRegisteredPatients([]);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchRegisteredPatients();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error("Gagal parse user dari localStorage", e);
    }
  }, []);

  const addToCart = (med) => {
    if (med.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine_id === med.id);
      if (existing) {
        if (existing.qty >= med.stock) return prev;
        return prev.map((item) =>
          item.medicine_id === med.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { medicine_id: med.id, name: med.name, price: med.price, qty: 1, maxStock: med.stock, unit: med.unit }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicine_id === id) {
            const newQty = item.qty + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) return item;
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.medicine_id !== id));
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const paidVal = Number(amountPaid) || 0;
  const changeVal = Math.max(0, paidVal - totalAmount);

  const handleBuyerTypeChange = (type) => {
    setBuyerType(type);
    setSelectedPatientId("");
    setPatientName("");
  };

  const handlePatientSelect = (value) => {
    setSelectedPatientId(value);
    const matched = registeredPatients.find((p) => String(p.id) === String(value));
    setPatientName(matched ? matched.name : "");
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (buyerType === "registered" && !selectedPatientId) {
      window.alert("Silakan pilih pasien terdaftar terlebih dahulu.");
      return;
    }
    if (paymentMethod === "cash" && paidVal < totalAmount) {
      window.alert("Jumlah uang diterima harus lebih besar atau sama dengan total belanja untuk pembayaran tunai.");
      return;
    }

    setProcessing(true);
    try {
      const normalizedPatientName =
        buyerType === "registered"
          ? patientName
          : (patientName?.trim() || "Pasien Umum / Walk-in");

      const payload = {
        patient_id: buyerType === "registered" ? selectedPatientId : null,
        patient_name: normalizedPatientName,
        items: cart.map((c) => ({ medicine_id: c.medicine_id, qty: c.qty })),
        payment_method: paymentMethod,
        amount_paid: paymentMethod === "cash" ? paidVal : undefined,
        notes: `Pembelian obat - ${normalizedPatientName}`,
      };

      const res = await checkoutPOS(payload);

      if (!res?.success || !res?.data?.id) {
        window.alert(res?.message || "Gagal memproses transaksi.");
        setProcessing(false);
        return;
      }

      const invoiceId = res.data.id;

      if (paymentMethod === "transfer") {
        if (!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
          window.alert("Midtrans client key belum dikonfigurasi. Hubungi admin sistem.");
          setProcessing(false);
          return;
        }
        // Invoice sudah dibuat 'unpaid' di server, arahkan ke halaman bayar Midtrans
        setCart([]);
        setAmountPaid("");
        fetchMedicines();
        router.push(`/dashboard/faskes/pharmacy/pos/invoice/${encodeURIComponent(invoiceId)}`);
        return;
      }

      // Cash: sudah lunas di server, tampilkan struk
      setLastReceipt({
        id: invoiceId,
        created_at: res.data.created_at || new Date().toISOString(),
        items: res.data.items || [],
        total_amount: Number(res.data.total_amount) || totalAmount,
        amount_paid: Number(res.data.total_payment) || paidVal,
        change: Math.max(0, (Number(res.data.total_payment) || paidVal) - (Number(res.data.total_amount) || totalAmount)),
        patient_name: normalizedPatientName,
        invoice_id: invoiceId,
        payment_method: paymentMethod,
      });
      setCart([]);
      setAmountPaid("");
      fetchMedicines();
    } catch (err) {
      console.error("Gagal checkout POS:", err);
      window.alert(err?.message || "Gagal memproses transaksi.");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      

      <div>
        
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-800 uppercase tracking-wider mb-1">
                <ShoppingCart className="h-4 w-4" /> Kasir Penjualan Obat POS
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Point of Sale (POS) Obat</h1>
              <p className="text-xs text-slate-500">Pilih produk obat, kalkulasi otomatis total & kembalian, dan cetak faktur transaksi.</p>
            </div>

            <button
              onClick={fetchMedicines}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-teal-700" : ""}`} /> Refresh Obat
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Product Selector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik untuk mencari produk obat atau SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium focus:border-teal-600 focus:outline-none"
                />
              </div>

              {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <RefreshCw className="h-8 w-8 animate-spin text-teal-700 mx-auto" />
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
                          : "border-slate-200 hover:border-teal-600 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{med.sku}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            med.stock === 0 ? "bg-red-50 text-[#DC2626]" : "bg-emerald-50 text-[#16A34A]"
                          }`}>
                            Stok: {med.stock} {med.unit}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1">{med.name}</h4>
                        <p className="text-[11px] text-slate-500">{med.category}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-extrabold text-[#16A34A] text-sm">
                          Rp {med.price.toLocaleString("id-ID")} / {med.unit || "Strip"}
                        </span>
                        <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5" /> Tambah
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Cart & Checkout */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-teal-800" />
                    <h3 className="font-extrabold text-slate-900 text-base">Keranjang Kasir</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{cart.length} Item</span>
                </div>

                {/* Buyer selector */}
                <div className="space-y-2 text-xs">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400">Nama Pasien / Pembeli</label>

                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleBuyerTypeChange("walkin")}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold transition ${
                        buyerType === "walkin" ? "bg-white shadow-xs text-teal-800" : "text-slate-500"
                      }`}
                    >
                      Input Nama Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyerTypeChange("registered")}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold transition ${
                        buyerType === "registered" ? "bg-white shadow-xs text-teal-800" : "text-slate-500"
                      }`}
                    >
                      Pilih Pasien Terdaftar
                    </button>
                  </div>

                  {buyerType === "registered" ? (
                    <select
                      value={selectedPatientId}
                      onChange={(e) => handlePatientSelect(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-teal-600 focus:outline-none bg-white"
                    >
                      <option value="">-- Pilih pasien terdaftar --</option>
                      {registeredPatients.length === 0 ? (
                        <option value="" disabled>Belum ada pasien terdaftar</option>
                      ) : (
                        registeredPatients.map((patient) => (
                          <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Ketik nama pembeli (kosongkan untuk Pasien Umum/Walk-in)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-teal-600 focus:outline-none"
                    />
                  )}
                </div>

                {/* Cart Items */}
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
                          <p className="text-[11px] text-[#16A34A] font-extrabold">
                            Rp {item.price.toLocaleString("id-ID")} / {item.unit || "Strip"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white px-1 py-0.5">
                            <button onClick={() => updateQty(item.medicine_id, -1)} className="p-1 hover:bg-slate-100 text-slate-600"><Minus className="h-3 w-3" /></button>
                            <span className="px-1.5 font-extrabold text-slate-900 text-[11px]">{item.qty} {item.unit || "Strip"}</span>
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
                      <option value="cash">Tunai / Cash</option>
                      <option value="transfer">Transfer Bank</option>
                    </select>
                  </div>
                  {paymentMethod === "transfer" && (
                    <p className="text-[10px] text-teal-800 font-medium">
                      Invoice akan dibuat lalu diarahkan ke halaman pembayaran Midtrans.
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">Total Belanja</span>
                    <span className="text-lg font-extrabold text-[#16A34A]">Rp {totalAmount.toLocaleString("id-ID")}</span>
                  </div>

                  {paymentMethod === "cash" ? (
                    <>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-extrabold uppercase text-slate-400">Jumlah Uang Diterima (Rp)</label>
                        <input
                          type="number"
                          placeholder={`Minimal Rp ${totalAmount.toLocaleString("id-ID")}`}
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 font-extrabold text-sm focus:border-teal-600 focus:outline-none"
                        />
                      </div>
                      {amountPaid && (
                        <div className="flex justify-between items-center pt-1 font-bold text-slate-700">
                          <span>Kembalian</span>
                          <span className="text-teal-800">Rp {changeVal.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                      Transfer akan memproses pembayaran lewat Midtrans dan otomatis menagih sebesar total belanja.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || processing}
                  className={`w-full py-3 rounded-2xl text-white font-extrabold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2 ${
                    cart.length === 0 || processing ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900"
                  }`}
                >
                  {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Proses Transaksi & Bayar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Struk / Receipt (khusus cash, sudah lunas) */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200">
              <CheckCircle2 className="h-10 w-10 text-[#16A34A] mx-auto" />
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
                <span>{new Date(lastReceipt.created_at).toLocaleTimeString("id-ID")}</span>
              </div>
              <div className="pt-2 divide-y divide-slate-100">
                {lastReceipt.items.map((it, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span>{it.name || "Obat"} x{it.qty || 1}</span>
                    <span>Rp {(Number(it.subtotal) || 0).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono pt-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total:</span>
                <span>Rp {lastReceipt.total_amount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bayar:</span>
                <span>Rp {lastReceipt.amount_paid.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-bold text-[#16A34A]">
                <span>Kembali:</span>
                <span>Rp {lastReceipt.change.toLocaleString("id-ID")}</span>
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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white font-extrabold text-xs hover:from-teal-800 hover:to-cyan-900 transition"
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