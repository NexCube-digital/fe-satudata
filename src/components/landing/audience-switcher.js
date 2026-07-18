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
      <div className="glass-panel rounded-3xl p-6 shadow-[0_12px_40px_rgba(225,29,72,0.03)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-600">Pilih Konteks Pengguna</p>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 leading-tight">Dasbor Demo SatuData</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Uji coba secara langsung bagaimana sistem kami mengisolasi data rekam medis demi kepatuhan hukum dan keamanan informasi pasien.
        </p>

        {/* Tab Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveAudience("patient")}
            className={`flex-1 rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
              activeAudience === "patient"
                ? "border-rose-200 bg-rose-50/50 shadow-xs shadow-rose-100"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className={`h-4.5 w-4.5 ${activeAudience === "patient" ? "text-rose-600" : "text-slate-500"}`} />
              <span className="text-sm font-bold text-slate-900">Portal Pasien</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Kendalikan persetujuan akses & lihat EHR.</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveAudience("hospital")}
            className={`flex-1 rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
              activeAudience === "hospital"
                ? "border-rose-200 bg-rose-50/50 shadow-xs shadow-rose-100"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className={`h-4.5 w-4.5 ${activeAudience === "hospital" ? "text-rose-600" : "text-slate-500"}`} />
              <span className="text-sm font-bold text-slate-900">Portal RS / Faskes</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Ajukan permohonan data & billing kasir.</p>
          </button>
        </div>

        {/* Feature Checklists */}
        <div className="mt-8 space-y-3.5 border-t border-slate-100 pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kemampuan Modul</p>
          {current.checklist.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-rose-100/50 bg-rose-50/20 px-4 py-3">
              <CheckCircle2 className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Live Simulator Screen */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-rose-950/10 bg-slate-900 p-5 text-white shadow-2xl sm:p-7">
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${current.accent}`} />

        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-400">Simulator Aktif</span>
            <h3 className="text-xl font-bold">{current.label}</h3>
          </div>
          <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-slate-300">
            Preview Mode
          </span>
        </div>

        {/* PATIENT INTERACTIVE DEMO */}
        {activeAudience === "patient" && (
          <div className="mt-5 space-y-6">
            {/* Consent Controls */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Izin Akses Rumah Sakit (Granular Consent)
              </p>
              <div className="space-y-2.5">
                {/* RSCM */}
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                  <div>
                    <h5 className="text-xs font-bold">RS Cipto Mangunkusumo</h5>
                    <p className="text-[10px] text-slate-400">Akses: Diagnosis & Alergi Obat</p>
                  </div>
                  <button
                    onClick={() => toggleConsent("rscm")}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                      consents.rscm
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {consents.rscm ? "Izinkan Akses" : "Akses Dicabut"}
                  </button>
                </div>

                {/* RS Harapan Kita */}
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                  <div>
                    <h5 className="text-xs font-bold">RS Harapan Kita (Jantung)</h5>
                    <p className="text-[10px] text-slate-400">Akses: Rekam Medis Jantung, Hasil Laboratorium</p>
                  </div>
                  <button
                    onClick={() => toggleConsent("harapanKita")}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                      consents.harapanKita
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {consents.harapanKita ? "Izinkan Akses" : "Akses Dicabut"}
                  </button>
                </div>

                {/* Kimia Farma */}
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                  <div>
                    <h5 className="text-xs font-bold">Laboratorium Kimia Farma</h5>
                    <p className="text-[10px] text-slate-400">Akses: Hasil Swab PCR & Booster Vaksin</p>
                  </div>
                  <button
                    onClick={() => toggleConsent("kimiaFarma")}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                      consents.kimiaFarma
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {consents.kimiaFarma ? "Izinkan Akses" : "Akses Dicabut"}
                  </button>
                </div>
              </div>
            </div>

            {/* EHR Timeline */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-rose-400" />
                Linimasa Medis Pasien Terpadu (Encrypted EHR)
              </p>
              <div className="relative border-l border-white/10 ml-2.5 pl-4 space-y-4">
                {/* Item 1 */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-slate-900 ${consents.rscm ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <div className="rounded-lg bg-white/[0.01] border border-white/5 p-3">
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span className="font-semibold text-rose-400">RS Cipto Mangunkusumo</span>
                      <span>12 Juli 2026</span>
                    </div>
                    {consents.rscm ? (
                      <div className="mt-1">
                        <h6 className="text-xs font-bold">Diagnosa: Infeksi Saluran Pernapasan (ISPA)</h6>
                        <p className="text-[10px] text-slate-400 mt-0.5">Dokter: dr. Amanda Sp.PD | Terapi: Amoxicillin 500mg, Paracetamol 500mg</p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-rose-400/80 text-[10px] font-bold">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Akses Diblokir oleh Pasien</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-slate-900 ${consents.kimiaFarma ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <div className="rounded-lg bg-white/[0.01] border border-white/5 p-3">
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span className="font-semibold text-rose-400">Laboratorium Kimia Farma</span>
                      <span>28 Juni 2026</span>
                    </div>
                    {consents.kimiaFarma ? (
                      <div className="mt-1">
                        <h6 className="text-xs font-bold">Laporan Lab: Tes Kolesterol & Gula Darah</h6>
                        <p className="text-[10px] text-slate-400 mt-0.5">Hasil: Kolesterol 190 mg/dL (Normal), Gula Darah Puasa 95 mg/dL (Normal)</p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-rose-400/80 text-[10px] font-bold">
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
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Minta Akses Eksternal
                </h4>
                <form onSubmit={handleRequestAccess} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">NIK Pasien</label>
                    <input
                      type="text"
                      value={nikInput}
                      onChange={(e) => setNikInput(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-rose-500 font-mono"
                      placeholder="Masukkan 16 digit NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Unit / Poli Dokter</label>
                    <select
                      value={clinicInput}
                      onChange={(e) => setClinicInput(e.target.value)}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-rose-500"
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
                    className="w-full rounded-lg bg-rose-600 py-2 text-center text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
                  >
                    {isSubmitting ? "Mengirim Permintaan..." : "Kirim Permintaan"}
                  </button>
                </form>

                {/* Request list logs */}
                <div className="mt-4 space-y-2">
                  <p className="text-[9px] font-bold uppercase text-slate-500">Riwayat Permintaan Akses</p>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                    {requests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between rounded-lg bg-slate-800/40 border border-white/5 p-2 text-[9px]">
                        <div>
                          <p className="font-bold text-slate-200">{req.clinic}</p>
                          <p className="text-slate-500">{req.hospital}</p>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                            req.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
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
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Billing Kasir Layanan
                  </h4>

                  {/* Bill Items List */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3.5">
                    {billItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-2 text-[9px] border border-white/5">
                        <span className="text-slate-200 font-semibold">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-rose-400 font-mono">Rp {item.price.toLocaleString("id-ID")}</span>
                          <button
                            onClick={() => removeBillItem(item.id)}
                            className="text-slate-500 hover:text-red-400 transition"
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
                      className="col-span-3 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] text-white focus:outline-hidden"
                    />
                    <input
                      type="number"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      placeholder="Harga"
                      className="col-span-2 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[10px] text-white focus:outline-hidden font-mono"
                    />
                    <button
                      type="submit"
                      className="col-span-5 rounded bg-slate-700 hover:bg-slate-600 py-1 text-center text-[10px] font-bold text-white flex items-center justify-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Tambah Item Layanan
                    </button>
                  </form>
                </div>

                {/* Total and Print Receipt */}
                <div className="border-t border-white/5 pt-3 mt-auto">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span>Total Tagihan:</span>
                    <span className="text-rose-400 font-mono">Rp {totalBill.toLocaleString("id-ID")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Transaksi Berhasil! Total tagihan Rp ${totalBill.toLocaleString("id-ID")} telah dikirim dan dicatat pada rekam medis.`)}
                    className="w-full rounded-lg bg-emerald-600 py-1.5 text-center text-[10px] font-bold text-white hover:bg-emerald-500 transition"
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