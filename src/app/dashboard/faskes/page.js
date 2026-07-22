"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import {
  Stethoscope,
  Send,
  Building2,
  Users,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  RefreshCw,
  Receipt
} from "lucide-react";

export default function FaskesDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Minta Akses State (nikInput is the wallet address of the patient in Web3)
  const [nikInput, setNikInput] = useState("");
  const [poliInput, setPoliInput] = useState("Klinik Penyakit Dalam");
  const [purposeInput, setPurposeInput] = useState("Pemeriksaan Rutin & Resep Obat");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // External Requests Table State
  const [requestsList, setRequestsList] = useState([]);

  // Selected Decrypted Record Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);

  // POS Kasir Simulator State
  const [billItems, setBillItems] = useState([
    { id: 1, name: "Registrasi Pasien Baru", price: 50000 },
    { id: 2, name: "Konsultasi Dokter Spesialis (Sp.PD)", price: 250000 },
    { id: 3, name: "Paket Tes Lab Kolesterol & Gula Darah", price: 175000 }
  ]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [receiptSuccess, setReceiptSuccess] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchRequestsList();
    setLoading(false);
  }, []);

  const fetchRequestsList = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const mapped = result.data.map((item) => ({
          id: item.id,
          patientId: item.patient_id,
          patientName: item.patient?.name || "Pasien Terdaftar",
          nik: item.patient?.wallet_address ? `${item.patient.wallet_address.substring(0, 6)}...${item.patient.wallet_address.substring(38)}` : "0x0000...0000",
          poli: item.requested_data || "Instalasi Medis",
          status: item.status === "approved" ? "Approved" : item.status === "pending" ? "Pending Pasien" : item.status === "rejected" ? "Rejected" : "Revoked",
          txHash: item.tx_hash_response || item.tx_hash_request || "Menunggu Signature",
          requestedAt: new Date(item.created_at).toLocaleDateString("id-ID")
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.log("Error loading requests list:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!nikInput) return;
    setSubmittingRequest(true);

    const token = localStorage.getItem("accessToken");
    const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientWalletAddress: nikInput,
          jenisDataDiminta: poliInput,
          txHash
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        fetchRequestsList();
        setNikInput("");
      } else {
        alert(result.message || "Gagal membuat permohonan akses");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirimkan permohonan");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleViewPatientRecords = async (req) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const signature = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/patient/${req.patientId}?signature=${signature}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const recordsStr = result.data.map(r => `• [${r.record_type.toUpperCase()}] ${r.title} (Visit: ${new Date(r.visit_date).toLocaleDateString("id-ID")})`).join("\n") || "Belum ada rekam medis terdaftar untuk pasien ini.";
        setSelectedRecord({
          ...req,
          decryptedData: recordsStr
        });
      } else {
        alert(result.message || "Gagal memuat rekam medis");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses data medis");
    }
  };

  // Add POS item
  const handleAddBillItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    setBillItems([
      ...billItems,
      { id: Date.now(), name: newItemName, price: parseFloat(newItemPrice) }
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleRemoveBillItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const totalBill = billItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleProcessTransaction = () => {
    setReceiptSuccess(true);
    setTimeout(() => setReceiptSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md">
          <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Memerlukan Login</h1>
          <p className="text-sm text-slate-500 mb-6">Silakan masuk dengan akun Fasilitas Kesehatan Anda.</p>
          <Link href="/auth/login" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-500 transition">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Fasilitas Kesehatan" onLogout={handleLogout} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Faskes Banner Header */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-3">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
                  Sistem HIS & Integrated Medis POS Active
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name || "RS Cipto Mangunkusumo"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                  Portal Fasilitas Kesehatan & Dokter Penanggung Jawab. Ajukan permohonan rekam medis eksternal secara terlisensi dan cetak billing kasir.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Lisensi Faskes</p>
                  <p className="font-bold text-emerald-400 mt-0.5">KEMENKES-RSCM-2026</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Integrasi API</p>
                  <p className="font-bold text-teal-300 mt-0.5">SATUSEHAT v2.5 (Ready)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kunjungan Hari Ini</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                48 <span className="text-xs font-normal text-slate-500">Pasien</span>
              </p>
              <p className="text-[10px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Antrean Rawat Jalan Operasional
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Izin Akses Disetujui</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                12 <span className="text-xs font-normal text-slate-500">Berkas Medis</span>
              </p>
              <p className="text-[10px] font-medium text-teal-600 mt-1 flex items-center gap-1">
                <Unlock className="h-3 w-3" /> Dekripsi Diotorisasi Pasien
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Request Pending</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {requestsList.filter((r) => r.status === "Pending Pasien").length} <span className="text-xs font-normal text-slate-500">Menunggu</span>
              </p>
              <p className="text-[10px] font-medium text-amber-600 mt-1 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Notifikasi Dikirim ke Patient Wallet
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Omzet POS Kasir</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <DollarSign className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3">
                Rp 14.5M
              </p>
              <p className="text-[10px] font-medium text-purple-600 mt-1 flex items-center gap-1">
                <Receipt className="h-3 w-3" /> Kasir Pendaftaran Harian
              </p>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            {/* Left Column (2 Cols): Form Request Access & Patients Table */}
            <div className="lg:col-span-2 space-y-8">
              {/* WIDGET 1: FORM MINTA AKSES REKAM MEDIS (requestAccess) */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Send className="h-5 w-5 text-emerald-600" />
                      Pengajuan Izin Akses Rekam Medis (requestAccess)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kirim permintaan otorisasi ke wallet pasien untuk membuka dekripsi rekam medis eksternal.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        NIK Pasien Sasaran
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={nikInput}
                        onChange={(e) => setNikInput(e.target.value)}
                        placeholder="3171010509840002"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:border-emerald-600 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Unit Dokter / Poli
                      </label>
                      <select
                        value={poliInput}
                        onChange={(e) => setPoliInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-hidden"
                      >
                        <option value="Klinik Penyakit Dalam">Klinik Penyakit Dalam (Sp.PD)</option>
                        <option value="Poli Jantung">Poli Jantung (Kardiologi)</option>
                        <option value="Laboratorium Utama">Laboratorium Utama</option>
                        <option value="Instalasi Gawat Darurat">Instalasi Gawat Darurat (UGD)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Tujuan & Klasifikasi Pemeriksaan
                    </label>
                    <input
                      type="text"
                      value={purposeInput}
                      onChange={(e) => setPurposeInput(e.target.value)}
                      placeholder="Contoh: Konsultasi Rawat Jalan & Resep Obat"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-600 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingRequest}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingRequest ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Kirim Permintaan Ke Pasien (requestAccess)
                    </button>
                  </div>
                </form>
              </div>

              {/* WIDGET 2: TABEL STATUS AKSES & DEKRIPSI DATA PASIEN */}
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      Tabel Permintaan & Dekripsi Rekam Medis
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar permohonan rekam medis eksternal yang diajukan oleh dokter rumah sakit.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4 rounded-l-xl">Pasien / NIK</th>
                        <th className="py-3 px-4">Poli Dokter</th>
                        <th className="py-3 px-4">Status Consent</th>
                        <th className="py-3 px-4">Tx Hash</th>
                        <th className="py-3 px-4 text-right rounded-r-xl">Aksi Dekripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requestsList.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{req.patientName}</p>
                            <p className="font-mono text-[10px] text-slate-400">NIK: {req.nik}</p>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">{req.poli}</td>
                          <td className="py-3.5 px-4">
                            {req.status === "Approved" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                <CheckCircle className="h-3 w-3" /> Disetujui
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse">
                                <Clock className="h-3 w-3" /> Pending Pasien
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-emerald-700">{req.txHash}</td>
                          <td className="py-3.5 px-4 text-right">
                            {req.status === "Approved" ? (
                              <button
                                onClick={() => handleViewPatientRecords(req)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 font-bold transition cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" /> Lihat EHR
                              </button>
                            ) : (
                              <span className="text-slate-400 italic font-mono text-[10px]">Terkunci</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal View Decrypted Record */}
                {selectedRecord && (
                  <div className="mt-6 rounded-2xl border border-rose-800/40 bg-gradient-to-br from-rose-950 to-red-950 p-5 text-white animate-fade-in shadow-xl">
                    <div className="flex items-center justify-between border-b border-rose-800/60 pb-3 mb-3">
                      <div className="flex items-center gap-2 text-rose-300">
                        <Unlock className="h-5 w-5" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Rekam Medis Terdekripsi: {selectedRecord.patientName}</h4>
                      </div>
                      <button
                        onClick={() => setSelectedRecord(null)}
                        className="text-xs text-rose-300 hover:text-white"
                      >
                        Tutup [X]
                      </button>
                    </div>

                    <div className="space-y-2 text-xs font-mono text-rose-100">
                      <p><span className="text-rose-300/70">NIK:</span> {selectedRecord.nik}</p>
                      <p><span className="text-rose-300/70">Tx Hash Validasi:</span> {selectedRecord.txHash}</p>
                      <div className="mt-3 rounded-xl bg-black/30 p-3 text-rose-200 border border-rose-800/40 leading-relaxed">
                        {selectedRecord.decryptedData}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (1 Col): POS Billing Kasir Simulator */}
            <div className="space-y-8">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="h-4.5 w-4.5 text-emerald-600" />
                    Kasir & POS Billing Medis
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">POS v2.5</span>
                </div>

                {/* Bill items list */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                  {billItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-600 font-bold">Rp {item.price.toLocaleString("id-ID")}</span>
                        <button
                          onClick={() => handleRemoveBillItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Item Form */}
                <form onSubmit={handleAddBillItem} className="space-y-2 mb-4">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Nama Layanan Medis"
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="Harga (Rp)"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-emerald-600 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah
                    </button>
                  </div>
                </form>

                {/* Total & Checkout */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-sm font-bold mb-3">
                    <span className="text-slate-700">Total Tagihan:</span>
                    <span className="text-emerald-600 font-mono text-base">Rp {totalBill.toLocaleString("id-ID")}</span>
                  </div>

                  {receiptSuccess && (
                    <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>Transaksi kasir sukses! Struk billing tercatat ke rekam medis.</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProcessTransaction}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-center text-xs font-bold text-white transition shadow-md shadow-emerald-950/10 cursor-pointer"
                  >
                    Proses Transaksi Kasir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
