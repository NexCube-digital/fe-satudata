"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { apiGet, apiPost, getAccessToken } from "@/lib/api";
import { getInvoicePatients, payInvoice, payInvoiceMidtrans } from "@/services/invoiceService";
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

const createReceiptId = () => `POS-${Date.now()}`;

export default function PharmacyPOSPage() {
  const router = useRouter();
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
  const [registeredPatients, setRegisteredPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [midtransReady, setMidtransReady] = useState(false);
  const [midtransError, setMidtransError] = useState(null);

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

  const fetchRegisteredPatients = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        console.warn("Tidak ada accessToken saat memuat pasien invoice.");
      }
      const res = await getInvoicePatients();
      const patients = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRegisteredPatients(patients);
    } catch (err) {
      console.error("Gagal memuat pasien invoice:", err);
      setRegisteredPatients([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchMedicines();
      await fetchRegisteredPatients();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Gagal parse user dari localStorage", e);
    }
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
      const normalizedPatientName = patientName?.trim() || "Pasien Umum / Walk-in";
      const matchedPatient = registeredPatients.find((patient) => String(patient.id) === String(selectedPatientId))
        || registeredPatients.find((patient) => patient.name?.toLowerCase() === normalizedPatientName.toLowerCase());

      const note = `Pembelian obat${normalizedPatientName ? ` - ${normalizedPatientName}` : ""}`;
      const payload = {
        patient_name: normalizedPatientName,
        patient_id: matchedPatient?.id || null,
        items: cart.map(c => ({ medicine_id: c.medicine_id, qty: c.qty })),
        payment_method: paymentMethod,
        amount_paid: paymentMethod === "cash" ? paidVal : totalAmount,
        notes: note,
      };

      if (paymentMethod === "cash" && paidVal < totalAmount) {
        window.alert("Jumlah uang diterima harus lebih besar atau sama dengan total belanja untuk pembayaran tunai.");
        setProcessing(false);
        return;
      }

      const checkoutRes = await apiPost("/api/hospital/pharmacy/pos/checkout", payload);
      const invoiceId = checkoutRes?.data?.invoice_id || checkoutRes?.invoice_id || checkoutRes?.data?.id || checkoutRes?.id || null;

      if (paymentMethod === "transfer") {
        if (!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
          window.alert("Midtrans client key belum dikonfigurasi. Hubungi admin sistem.");
          setProcessing(false);
          return;
        }

        if (!invoiceId) {
          console.error("Invoice ID tidak ditemukan pasca checkout transfer", checkoutRes);
          window.alert("Gagal membuat invoice untuk pembayaran transfer.");
          setProcessing(false);
          return;
        }

        const receiptItems = cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          subtotal: item.price * item.qty,
        }));

        const invoiceReceipt = {
          id: checkoutRes?.data?.id || checkoutRes?.invoice_id || invoiceId || createReceiptId(),
          created_at: checkoutRes?.data?.created_at || new Date().toISOString(),
          items: receiptItems,
          total_amount: checkoutRes?.data?.total_amount || totalAmount,
          amount_paid: totalAmount,
          change: 0,
          patient_name: normalizedPatientName,
          invoice_id: invoiceId,
          note,
          payment_method: paymentMethod,
        };

        if (typeof window !== "undefined") {
          sessionStorage.setItem(`pharmacy-pos-invoice-${invoiceId}`, JSON.stringify(invoiceReceipt));
        }

        setCart([]);
        setAmountPaid("");
        fetchMedicines();
        router.push(`/dashboard/faskes/pharmacy/pos/invoice/${encodeURIComponent(invoiceId)}`);
        return;
      }

      if (checkoutRes.success) {
        const receiptItems = cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          subtotal: item.price * item.qty,
        }));

        const receiptId = checkoutRes?.data?.id || checkoutRes?.invoice_id || invoiceId || createReceiptId();
        setLastReceipt({
          id: receiptId,
          created_at: checkoutRes?.data?.created_at || new Date().toISOString(),
          items: receiptItems,
          total_amount: checkoutRes?.data?.total_amount || totalAmount,
          amount_paid: paymentMethod === "cash" ? paidVal : totalAmount,
          change: paymentMethod === "cash" ? changeVal : 0,
          patient_name: normalizedPatientName,
          invoice_id: invoiceId,
          note,
          payment_method: paymentMethod,
        });
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

  const handlePatientSelect = (value) => {
    if (!value || value === "__walkin__") {
      setSelectedPatientId("");
      setPatientName("Pasien Umum / Walk-in");
      return;
    }

    const matched = registeredPatients.find((patient) => String(patient.id) === String(value));
    if (matched) {
      setSelectedPatientId(String(matched.id));
      setPatientName(matched.name || "Pasien Terdaftar");
    }
  };

  const handlePayInvoiceFromReceipt = async (invoiceId) => {
    if (!invoiceId) return;
    router.push(`/dashboard/faskes/pharmacy/pos/invoice/${encodeURIComponent(invoiceId)}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => {
          setMidtransReady(true);
          setMidtransError(null);
        }}
        onError={() => {
          setMidtransReady(false);
          setMidtransError("Gagal memuat Midtrans. Coba refresh halaman.");
        }}
      />
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
                <div className="space-y-2 text-xs">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-400">Nama Pasien / Pembeli</label>
                  <select
                    value={selectedPatientId || "__walkin__"}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold focus:border-rose-700 focus:outline-none bg-white"
                  >
                    <option value="__walkin__">Pasien Umum / Walk-in</option>
                    {registeredPatients.length === 0 ? (
                      <option value="" disabled>Belum ada pasien terdaftar atau login belum dikenali</option>
                    ) : (
                      registeredPatients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))
                    )}
                  </select>

                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => {
                      setPatientName(e.target.value);
                      if (e.target.value.trim() === "") {
                        setSelectedPatientId("");
                      }
                    }}
                    placeholder="Ketik nama pelanggan jika ingin menambah catatan khusus"
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
                  <div className="flex flex-col gap-2">
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
                      <p className="text-[10px] text-rose-700">
                        {midtransError
                          ? midtransError
                          : !midtransReady
                          ? "Menunggu Midtrans siap... refresh halaman jika popup tidak muncul."
                          : "Transfer akan menampilkan popup Midtrans setelah klik Bayar."}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">Total Belanja</span>
                    <span className="text-lg font-extrabold text-emerald-700">Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </div>

                  {paymentMethod === "cash" ? (
                    <>
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
              {lastReceipt.invoice_id ? (
                <div className="flex justify-between text-slate-600">
                  <span>Invoice:</span>
                  <span className="font-bold text-slate-900">{lastReceipt.invoice_id}</span>
                </div>
              ) : null}
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
              {lastReceipt.invoice_id ? (
                <button
                  onClick={() => handlePayInvoiceFromReceipt(lastReceipt.invoice_id)}
                  disabled={payingInvoiceId === lastReceipt.invoice_id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white transition disabled:opacity-60"
                >
                  <CreditCard className="h-4 w-4" /> {payingInvoiceId === lastReceipt.invoice_id ? "Memproses..." : "Bayar Sekarang"}
                </button>
              ) : null}
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
