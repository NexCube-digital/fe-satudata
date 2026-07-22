"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { audienceData } from "./landing-data";

export default function AudienceSwitcher() {
  const [activeAudience, setActiveAudience] = useState("patient");

  // Patient Dashboard State
  const [consents, setConsents] = useState({
    rscm: true,
    harapanKita: false,
    kimiaFarma: true,
  });

  const toggleConsent = (hospitalKey) => {
    setConsents((prev) => ({
      ...prev,
      [hospitalKey]: !prev[hospitalKey],
    }));
  };

  // Hospital Dashboard State
  const [nikInput, setNikInput] = useState("3171010509840002");
  const [clinicInput, setClinicInput] = useState("Klinik Penyakit Dalam");
  const [requests, setRequests] = useState([
    { id: 1, hospital: "RS Cipto Mangunkusumo", clinic: "Poli Jantung", status: "Approved" },
    { id: 2, hospital: "Klinik Kimia Farma", clinic: "Laboratorium", status: "Approved" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // POS Billing Simulator State
  const [billItems, setBillItems] = useState([
    { id: 1, name: "Registrasi Pasien", price: 50000 },
    { id: 2, name: "Konsultasi Dokter Umum", price: 150000 },
  ]);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  const addBillItem = (e) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) return;
    setBillItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: customItemName,
        price: parseFloat(customItemPrice),
      },
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
  };

  const removeBillItem = (id) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalBill = useMemo(() => {
    return billItems.reduce((acc, curr) => acc + curr.price, 0);
  }, [billItems]);

  const handleRequestAccess = (e) => {
    e.preventDefault();
    if (!nikInput) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setRequests((prev) => [
        {
          id: Date.now(),
          hospital: "RS Pusat Pertamina (Cabang Anda)",
          clinic: clinicInput,
          status: "Pending Pasien",
        },
        ...prev,
      ]);
      setIsSubmitting(false);
    }, 800);
  };

  const current = useMemo(() => audienceData[activeAudience], [activeAudience]);

  return (
    <section id="panel" className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start py-8">
      {/* Left Column: Switcher Controls */}
      <div className="glass-panel rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 reveal-left">
        <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-rose-800">Pilih Konteks Pengguna</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Dasbor Demo Interaktif
        </h2>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
          Uji coba secara langsung bagaimana sistem kami mengisolasi data rekam medis demi kepatuhan hukum dan kedaulatan informasi pasien.
        </p>

        {/* Tab Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveAudience("patient")}
            className={`flex-1 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${
              activeAudience === "patient"
                ? "border-rose-300 bg-rose-50/70 shadow-sm ring-1 ring-rose-300/50"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className={`h-4.5 w-4.5 ${activeAudience === "patient" ? "text-rose-800" : "text-slate-500"}`} />
              <span className="text-xs font-extrabold text-slate-900">Portal Pasien</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Kendalikan persetujuan akses & lihat EHR.</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveAudience("hospital")}
            className={`flex-1 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 cursor-pointer ${
              activeAudience === "hospital"
                ? "border-rose-300 bg-rose-50/70 shadow-sm ring-1 ring-rose-300/50"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className={`h-4.5 w-4.5 ${activeAudience === "hospital" ? "text-rose-800" : "text-slate-500"}`} />
              <span className="text-xs font-extrabold text-slate-900">Portal RS / Faskes</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">Ajukan permohonan data & billing POS.</p>
          </button>
        </div>

        {/* Feature Checklists */}
        <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kemampuan Modul</p>
          {current.checklist.map((item) => (
            <div key={item} className="flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/40 px-3.5 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Live Simulator Screen */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 text-slate-900 shadow-md sm:p-7 reveal-right">
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${current.accent}`} />

        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-rose-800">Simulator Aktif</span>
            <h3 className="text-lg font-extrabold text-slate-900">{current.label}</h3>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Preview Mode
          </span>
        </div>

        {/* PATIENT INTERACTIVE DEMO */}
        {activeAudience === "patient" && (
          <div className="mt-5 space-y-6">
            {/* Consent Controls */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-rose-800" />
                Izin Akses Rumah Sakit (Granular Consent)
              </p>
              <div className="space-y-2.5">
                {/* RSCM */}
                <div className="flex items-center justify-between rounded-2xl bg-rose-50/60 border border-rose-200/80 px-4 py-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">RS Cipto Mangunkusumo</h5>
                    <p className="text-[10px] text-slate-500">Akses: Diagnosis & Alergi Obat</p>
                  </div>
                  <button
                    onClick={() => toggleConsent("rscm")}
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
                      consents.rscm
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {consents.rscm ? "Izinkan Akses" : "Akses Dicabut"}
                  </button>
                </div>

                {/* RS Harapan Kita */}
                <div className="flex items-center justify-between rounded-2xl bg-rose-50/60 border border-rose-200/80 px-4 py-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">RS Harapan Kita (Jantung)</h5>
                    <p className="text-[10px] text-slate-500">Akses: Rekam Medis Jantung, Hasil Laboratorium</p>
                  </div>
                  <button
                    onClick={() => toggleConsent("harapanKita")}
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
                      consents.harapanKita
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {consents.harapanKita ? "Izinkan Akses" : "Akses Dicabut"}
                  </button>
                </div>

                {/* Kimia Farma */}
                <div className="flex items-center justify-between rounded-2xl bg-rose-50/60 border border-rose-200/80 px-4 py-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Laboratorium Kimia Farma</h5>
                    <p className="text-[10px] text-slate-500">Akses: Hasil Swab PCR & Booster Vaksin</p>
                  </div>
                  <button
                    onClick={() => toggleConsent("kimiaFarma")}
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
                      consents.kimiaFarma
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {consents.kimiaFarma ? "Izinkan Akses" : "Akses Dicabut"}
                  </button>
                </div>
              </div>
            </div>

            {/* EHR Timeline */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-rose-800" />
                Linimasa Medis Pasien Terpadu (Encrypted EHR)
              </p>
              <div className="relative border-l border-rose-200 ml-2.5 pl-4 space-y-4">
                {/* Item 1 */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-white ${consents.rscm ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <div className="rounded-xl bg-white border border-slate-200/80 p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="font-extrabold text-rose-800">RS Cipto Mangunkusumo</span>
                      <span className="font-mono">12 Juli 2026</span>
                    </div>
                    {consents.rscm ? (
                      <div className="mt-1">
                        <h6 className="text-xs font-extrabold text-slate-900">Diagnosa: Infeksi Saluran Pernapasan (ISPA)</h6>
                        <p className="text-[10px] text-slate-500 mt-0.5">Dokter: dr. Amanda Sp.PD | Terapi: Amoxicillin 500mg, Paracetamol 500mg</p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-rose-600 text-[10px] font-extrabold">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Akses Diblokir oleh Pasien</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-white ${consents.kimiaFarma ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <div className="rounded-xl bg-white border border-slate-200/80 p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="font-extrabold text-rose-800">Laboratorium Kimia Farma</span>
                      <span className="font-mono">28 Juni 2026</span>
                    </div>
                    {consents.kimiaFarma ? (
                      <div className="mt-1">
                        <h6 className="text-xs font-extrabold text-slate-900">Laporan Lab: Tes Kolesterol & Gula Darah</h6>
                        <p className="text-[10px] text-slate-500 mt-0.5">Hasil: Kolesterol 190 mg/dL (Normal), Gula Darah Puasa 95 mg/dL (Normal)</p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-rose-600 text-[10px] font-extrabold">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Akses Diblokir oleh Pasien</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOSPITAL INTERACTIVE DEMO */}
        {activeAudience === "hospital" && (
          <div className="mt-5 space-y-6">
            {/* Split layout: Request and POS */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Request Form */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 mb-3 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-rose-700" />
                  Minta Akses Eksternal
                </h4>
                <form onSubmit={handleRequestAccess} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">NIK Pasien</label>
                    <input
                      type="text"
                      value={nikInput}
                      onChange={(e) => setNikInput(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-rose-600 font-mono shadow-2xs"
                      placeholder="Masukkan 16 digit NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">Unit / Poli Dokter</label>
                    <select
                      value={clinicInput}
                      onChange={(e) => setClinicInput(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-rose-600 shadow-2xs"
                    >
                      <option value="Klinik Jantung">Klinik Jantung (Kardiologi)</option>
                      <option value="Klinik Penyakit Dalam">Klinik Penyakit Dalam</option>
                      <option value="Laboratorium Utama">Laboratorium Utama</option>
                      <option value="Instalasi Gawat Darurat">Instalasi Gawat Darurat (UGD)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-800 to-red-900 py-2.5 text-center text-xs font-extrabold text-white transition hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? "Mengirim Permintaan..." : "Kirim Permintaan"}
                  </button>
                </form>

                {/* Request list logs */}
                <div className="mt-4 space-y-2">
                  <p className="text-[9px] font-extrabold uppercase text-slate-500">Riwayat Permintaan Akses</p>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                    {requests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between rounded-xl bg-white border border-slate-200/80 p-2.5 text-[9px] shadow-2xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{req.clinic}</p>
                          <p className="text-slate-500">{req.hospital}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold ${
                            req.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Point of Sale / Kasir Medis */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900 mb-3 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-rose-700" />
                    Billing Kasir Layanan
                  </h4>

                  {/* Bill Items List */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3.5">
                    {billItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-2.5 text-[9px] border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-800 font-extrabold">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-rose-800 font-extrabold font-mono">Rp {item.price.toLocaleString("id-ID")}</span>
                          <button
                            onClick={() => removeBillItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Item */}
                  <form onSubmit={addBillItem} className="grid grid-cols-5 gap-1.5 mb-3">
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="Nama Layanan"
                      className="col-span-3 rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-rose-600 shadow-2xs font-medium"
                    />
                    <input
                      type="number"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      placeholder="Harga"
                      className="col-span-2 rounded-xl bg-white border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-rose-600 shadow-2xs font-mono font-medium"
                    />
                    <button
                      type="submit"
                      className="col-span-5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 py-1.5 text-center text-[10px] font-extrabold text-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Tambah Item Layanan
                    </button>
                  </form>
                </div>

                {/* Total and Print Receipt */}
                <div className="border-t border-slate-200/80 pt-3 mt-auto">
                  <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                    <span className="text-slate-700">Total Tagihan:</span>
                    <span className="text-rose-900 font-mono text-sm">Rp {totalBill.toLocaleString("id-ID")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Transaksi Berhasil! Total tagihan Rp ${totalBill.toLocaleString("id-ID")} telah dikirim dan dicatat pada rekam medis.`)}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-800 to-red-900 py-2.5 text-center text-[10px] font-extrabold text-white hover:opacity-95 transition cursor-pointer shadow-md"
                  >
                    Proses Transaksi Medis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
