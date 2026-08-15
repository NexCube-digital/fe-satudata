'use client';

import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';

export const audienceData: Record<string, { label: string; accent: string; checklist: string[] }> = {
  patient: {
    label: 'Dasbor Pasien & Sovereign Consent',
    accent: 'from-teal-600 to-cyan-600',
    checklist: [
      'Kontrol Persetujuan Akses Granular',
      'Linimasa Rekam Medis Terenkripsi',
      'Verifikasi Wallet & Identitas NIK',
    ],
  },
  hospital: {
    label: 'Dasbor Faskes & Billing POS',
    accent: 'from-teal-700 to-cyan-700',
    checklist: [
      'Permohonan Izin Akses Pasien',
      'Billing POS Layanan & Kasir',
      'Audit Trail Log Blockchain',
    ],
  },
};

export const AudienceSwitcher: React.FC = () => {
  const [activeAudience, setActiveAudience] = useState<'patient' | 'hospital'>('patient');

  // Patient Dashboard State
  const [consents, setConsents] = useState<Record<string, boolean>>({
    rscm: true,
    harapanKita: false,
    kimiaFarma: true,
  });

  const toggleConsent = (hospitalKey: string) => {
    setConsents((prev) => ({
      ...prev,
      [hospitalKey]: !prev[hospitalKey],
    }));
  };

  // Hospital Dashboard State
  const [nikInput, setNikInput] = useState<string>('3171010509840002');
  const [clinicInput, setClinicInput] = useState<string>('Klinik Penyakit Dalam');
  const [requests, setRequests] = useState<any[]>([
    { id: 1, hospital: 'RS Cipto Mangunkusumo', clinic: 'Poli Jantung', status: 'Approved' },
    { id: 2, hospital: 'Klinik Kimia Farma', clinic: 'Laboratorium', status: 'Approved' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // POS Billing Simulator State
  const [billItems, setBillItems] = useState<any[]>([
    { id: 1, name: 'Registrasi Pasien', price: 50000 },
    { id: 2, name: 'Konsultasi Dokter Umum', price: 150000 },
  ]);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemPrice, setCustomItemPrice] = useState<string>('');

  const addBillItem = (e: React.FormEvent) => {
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
    setCustomItemName('');
    setCustomItemPrice('');
  };

  const removeBillItem = (id: number) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalBill = useMemo(() => {
    return billItems.reduce((acc, curr) => acc + curr.price, 0);
  }, [billItems]);

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikInput) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setRequests((prev) => [
        {
          id: Date.now(),
          hospital: 'RS Pusat Pertamina',
          clinic: clinicInput,
          status: 'Pending Pasien',
        },
        ...prev,
      ]);
      setIsSubmitting(false);
    }, 800);
  };

  const current = useMemo(() => audienceData[activeAudience], [activeAudience]);

  return (
    <section id="panel" className="grid gap-4 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start py-6 sm:py-8">
      {/* Left Column: Switcher Controls */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-xs reveal-left">
        <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.3em] text-teal-800">Pilih Konteks Pengguna</p>
        <h2 className="mt-1 sm:mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Demo Interaktif Platform
        </h2>
        <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm leading-relaxed text-slate-500">
          Uji coba persetujuan rekam medis pasien & sistem kasir RS secara langsung.
        </p>

        {/* Tab Buttons */}
        <div className="mt-4 sm:mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveAudience('patient')}
            className={`flex-1 rounded-xl sm:rounded-2xl border p-3 sm:py-3.5 text-left transition-all duration-200 cursor-pointer ${
              activeAudience === 'patient'
                ? 'border-teal-300 bg-teal-50/70 shadow-xs ring-1 ring-teal-300/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Stethoscope className={`h-4 w-4 ${activeAudience === 'patient' ? 'text-teal-800' : 'text-slate-500'}`} />
              <span className="text-xs font-extrabold text-slate-900">Portal Pasien</span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500">Kendalikan persetujuan akses & lihat EHR.</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveAudience('hospital')}
            className={`flex-1 rounded-xl sm:rounded-2xl border p-3 sm:py-3.5 text-left transition-all duration-200 cursor-pointer ${
              activeAudience === 'hospital'
                ? 'border-teal-300 bg-teal-50/70 shadow-xs ring-1 ring-teal-300/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className={`h-4 w-4 ${activeAudience === 'hospital' ? 'text-teal-800' : 'text-slate-500'}`} />
              <span className="text-xs font-extrabold text-slate-900">Portal RS / Faskes</span>
            </div>
            <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500">Ajukan permohonan data & billing POS.</p>
          </button>
        </div>

        {/* Feature Checklists */}
        <div className="mt-4 sm:mt-6 space-y-2 border-t border-slate-100 pt-4 sm:pt-5">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kemampuan Modul</p>
          {current.checklist.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-teal-100 bg-teal-50/40 px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Live Simulator Screen */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-7 text-slate-900 shadow-md reveal-right">
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${current.accent}`} />

        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-800">Simulator Aktif</span>
            <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 truncate">{current.label}</h3>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-extrabold text-[#16A34A] flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            Preview Mode
          </span>
        </div>

        {/* PATIENT INTERACTIVE DEMO */}
        {activeAudience === 'patient' && (
          <div className="mt-4 space-y-4 sm:space-y-6">
            {/* Consent Controls */}
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 sm:mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-800" />
                Izin Akses Rumah Sakit (Granular Consent)
              </p>
              <div className="space-y-2">
                {/* RSCM */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-teal-50/60 border border-teal-200/80 p-3 sm:px-4 sm:py-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">RS Cipto Mangunkusumo</h5>
                    <p className="text-[10px] text-slate-500">Akses: Diagnosis & Alergi Obat</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('rscm')}
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition-all cursor-pointer shrink-0 ${
                      consents.rscm
                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                        : 'bg-rose-50 text-[#DC2626] border border-rose-200'
                    }`}
                  >
                    {consents.rscm ? 'Izinkan Akses' : 'Akses Dicabut'}
                  </button>
                </div>

                {/* RS Harapan Kita */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-teal-50/60 border border-teal-200/80 p-3 sm:px-4 sm:py-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">RS Harapan Kita (Jantung)</h5>
                    <p className="text-[10px] text-slate-500">Akses: Rekam Medis Jantung, Lab</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('harapanKita')}
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition-all cursor-pointer shrink-0 ${
                      consents.harapanKita
                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                        : 'bg-rose-50 text-[#DC2626] border border-rose-200'
                    }`}
                  >
                    {consents.harapanKita ? 'Izinkan Akses' : 'Akses Dicabut'}
                  </button>
                </div>

                {/* Kimia Farma */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl sm:rounded-2xl bg-teal-50/60 border border-teal-200/80 p-3 sm:px-4 sm:py-3">
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Laboratorium Kimia Farma</h5>
                    <p className="text-[10px] text-slate-500">Akses: Swab PCR & Vaksin</p>
                  </div>
                  <button
                    onClick={() => toggleConsent('kimiaFarma')}
                    className={`rounded-full px-3 py-1 text-[10px] font-extrabold transition-all cursor-pointer shrink-0 ${
                      consents.kimiaFarma
                        ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                        : 'bg-rose-50 text-[#DC2626] border border-rose-200'
                    }`}
                  >
                    {consents.kimiaFarma ? 'Izinkan Akses' : 'Akses Dicabut'}
                  </button>
                </div>
              </div>
            </div>

            {/* EHR Timeline */}
            <div>
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 sm:mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-800" />
                Linimasa Medis Pasien Terpadu (Encrypted EHR)
              </p>
              <div className="relative border-l border-teal-200 ml-2 pl-3 space-y-3">
                {/* Item 1 */}
                <div className="relative">
                  <span className={`absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full border border-white ${consents.rscm ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                  <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 sm:p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="font-extrabold text-teal-800">RS Cipto Mangunkusumo</span>
                      <span className="font-mono">12 Juli 2026</span>
                    </div>
                    {consents.rscm ? (
                      <div className="mt-1">
                        <h6 className="text-xs font-extrabold text-slate-900">Diagnosa: Infeksi Saluran Pernapasan (ISPA)</h6>
                        <p className="text-[10px] text-slate-500 mt-0.5">dr. Amanda Sp.PD | Amoxicillin 500mg, Paracetamol</p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-[#DC2626] text-[10px] font-extrabold">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Akses Diblokir oleh Pasien</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative">
                  <span className={`absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full border border-white ${consents.kimiaFarma ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                  <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 sm:p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="font-extrabold text-teal-800">Laboratorium Kimia Farma</span>
                      <span className="font-mono">28 Juni 2026</span>
                    </div>
                    {consents.kimiaFarma ? (
                      <div className="mt-1">
                        <h6 className="text-xs font-extrabold text-slate-900">Tes Kolesterol & Gula Darah</h6>
                        <p className="text-[10px] text-slate-500 mt-0.5">Hasil: Kolesterol 190 mg/dL (Normal), Gula Darah 95 mg/dL</p>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-[#DC2626] text-[10px] font-extrabold">
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
        {activeAudience === 'hospital' && (
          <div className="mt-4 space-y-4 sm:space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Request Form */}
              <div className="rounded-xl sm:rounded-2xl border border-teal-200/80 bg-teal-50/50 p-3 sm:p-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-900 mb-2 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-teal-700" />
                  Minta Akses Eksternal
                </h4>
                <form onSubmit={handleRequestAccess} className="space-y-2.5">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">NIK Pasien</label>
                    <input
                      type="text"
                      value={nikInput}
                      onChange={(e) => setNikInput(e.target.value)}
                      className="w-full rounded-lg sm:rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-900 font-mono shadow-2xs"
                      placeholder="Masukkan 16 digit NIK"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">Unit / Poli Dokter</label>
                    <select
                      value={clinicInput}
                      onChange={(e) => setClinicInput(e.target.value)}
                      className="w-full rounded-lg sm:rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-900 shadow-2xs"
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
                    className="w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 py-2 text-center text-xs font-extrabold text-white transition hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
                  </button>
                </form>
              </div>

              {/* Point of Sale / Kasir Medis */}
              <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-900 mb-2 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-teal-700" />
                    Billing Kasir Layanan
                  </h4>

                  <div className="space-y-1 max-h-28 overflow-y-auto mb-2.5">
                    {billItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-white p-2 text-[9px] border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-800 font-extrabold">{item.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-teal-800 font-extrabold font-mono">Rp {item.price.toLocaleString('id-ID')}</span>
                          <button
                            onClick={() => removeBillItem(item.id)}
                            className="text-slate-400 hover:text-[#DC2626] transition cursor-pointer p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-2 mt-auto">
                  <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                    <span className="text-slate-700">Total Tagihan:</span>
                    <span className="text-teal-900 font-mono text-sm">Rp {totalBill.toLocaleString('id-ID')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Transaksi Berhasil! Total tagihan Rp ${totalBill.toLocaleString('id-ID')} telah dikirim dan dicatat pada rekam medis.`)}
                    className="w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 py-2 text-center text-[10px] font-extrabold text-white hover:opacity-95 transition cursor-pointer shadow-md"
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
};

export default AudienceSwitcher;
