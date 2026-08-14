'use client';

import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  Search,
  Link2,
  Calendar,
  Activity,
  FileText,
  Zap,
  ShieldCheck,
  HeartPulse,
  Plus,
  Check,
  TestTube,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { searchICD10 } from '@/data/icdData';

const FALLBACK_LAB_ITEMS = [
  'Darah Lengkap / Rutin (Hematologi)',
  'Gula Darah Sewaktu (GDS)',
  'Gula Darah Puasa (GDP)',
  'HbA1c',
  'Fungsi Ginjal (Ureum / Kreatinin)',
  'Fungsi Hati (SGOT / SGPT)',
  'Profil Lipid (Kolesterol / Trigliserida)',
  'Asam Urat (Uric Acid)',
  'Tes Urine Lengkap (Urenalisis)',
  'Widal / Dengue NS1 Rapid',
];

const FALLBACK_RADIOLOGI_ITEMS = [
  'Foto Rontgen Thorax PA/AP',
  'Foto Rontgen Ekstremitas (Foto Polos)',
  'USG Abdomen Upper / Lower',
  'USG Kebidanan / Ginekologi',
  'CT Scan Kepala (Non-Kontras)',
  'CT Scan Abdomen / Thorax',
  'MRI Kepala / Tulang Belakang',
  'Panoramic / Dental X-Ray',
];

export default function FormRajal({
  entryDetail = {},
  type = 'rawat_jalan',
  onUpdateDetailField,
  parseVitalSigns,
  selectedPatient,
  selectedDoctor,
  visitDate,
  visitTime,
  paymentType,
  escortName,
  escortRelation,
  escortPhone,
  visitId,
  penunjangSubItems = [],
  onNavigateToRanap,
  onEnsureRanapStep,
  onNavigateToRujuk,
  onEnsureRujukStep,
  onNavigateToDeath,
  onEnsureDeathStep,
}: any) {
  const vs = parseVitalSigns ? parseVitalSigns(entryDetail.vital_signs) : {};

  const handleVitalChange = (key: string, val: any) => {
    const current = parseVitalSigns ? parseVitalSigns(entryDetail.vital_signs) : {};
    const updated = { ...current, [key]: val };
    onUpdateDetailField(type, 'vital_signs', JSON.stringify(updated));
  };

  const applyVitalNormal = () => {
    const current = parseVitalSigns ? parseVitalSigns(entryDetail.vital_signs) : {};
    const updated = {
      ...current,
      systolic: '120',
      diastolic: '80',
      pulse: '80',
      rr: '20',
      temp: '36.5',
      weight: vs.weight || '65',
    };
    onUpdateDetailField(type, 'vital_signs', JSON.stringify(updated));
  };

  const labBackendItems = useMemo(() => {
    const filtered = penunjangSubItems
      .filter((item: any) => {
        const cat = (item.category || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        return cat.includes('lab') || name.includes('lab') || (!cat.includes('rad') && !name.includes('rad') && !name.includes('ct') && !name.includes('usg') && !name.includes('rontgen') && !name.includes('mri'));
      })
      .map((item: any) => item.name);
    return filtered.length > 0 ? Array.from(new Set(filtered)) : FALLBACK_LAB_ITEMS;
  }, [penunjangSubItems]);

  const radiologiBackendItems = useMemo(() => {
    const filtered = penunjangSubItems
      .filter((item: any) => {
        const cat = (item.category || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        return cat.includes('rad') || cat.includes('radio') || name.includes('rad') || name.includes('ct') || name.includes('usg') || name.includes('rontgen') || name.includes('mri') || name.includes('x-ray');
      })
      .map((item: any) => item.name);
    return filtered.length > 0 ? Array.from(new Set(filtered)) : FALLBACK_RADIOLOGI_ITEMS;
  }, [penunjangSubItems]);

  const selectedPenunjangList = useMemo(() => {
    const raw = entryDetail.selected_penunjang;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return typeof raw === 'string' ? [raw] : [];
    }
  }, [entryDetail.selected_penunjang]);

  const [icdSearch, setIcdSearch] = useState<string>('');
  const [icdOpen, setIcdOpen] = useState<boolean>(false);
  const icdResults = searchICD10 ? searchICD10(icdSearch) : [];

  const [hasPenunjang, setHasPenunjang] = useState<boolean>(!!entryDetail.lab_note || selectedPenunjangList.length > 0);
  const [activePenunjangCategory, setActivePenunjangCategory] = useState<string>('Laboratorium');

  const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || (selectedPatient?.label ? selectedPatient.label.split(' - ')[0] : null) || entryDetail.patient_name || 'Pasien Belum Dipilih';
  const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || (selectedPatient?.label ? selectedPatient.label.split(' - ')[1] : null) || entryDetail.no_rm || '-------';
  const age = selectedPatient?.age ? (String(selectedPatient.age).includes('TH') ? selectedPatient.age : `${selectedPatient.age} TH`) : '-';
  const sex = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || '-';
  const address = selectedPatient?.address || selectedPatient?.alamat || '-';
  const pjName = escortName || selectedPatient?.emergency_contact_name || selectedPatient?.emergencyName || 'Sendiri / Keluarga';

  const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.doctor_name || 'DPJP Belum Dipilih';
  const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || selectedDoctor?.spesialisasi || 'Spesialis / Poliklinik';
  const doctorSIP = selectedDoctor?.medical_license || selectedDoctor?.sip || selectedDoctor?.license || 'SIP-000012';

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/70 via-cyan-50/40 to-slate-50 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
            <span className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center gap-2">
              <Link2 className="h-4 w-4 text-teal-700" />
              RELASI DATA PASIEN & KUNJUNGAN (AUTO-SYNC STEP 2)
            </span>
            <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100/90 px-3 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-teal-700" /> Data Terhubung
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/90 p-3 rounded-xl border border-teal-100 space-y-1 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">IDENTITAS PASIEN</span>
              <p className="font-black text-slate-900 uppercase text-xs truncate">{patientName}</p>
              <p className="text-[11px] text-slate-600 font-semibold">JK: <span className="font-bold text-slate-900">{sex}</span> | {age}</p>
              <p className="text-[10px] text-slate-500 truncate">{address}</p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-teal-100 space-y-1 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">WAKTU KUNJUNGAN</span>
              <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-teal-700" /> {visitDate || new Date().toISOString().split('T')[0]}
              </p>
              <p className="text-[11px] text-slate-600 font-medium">Jam: <span className="font-bold text-slate-900">{visitTime || '08:00 WIB'}</span></p>
              <p className="text-[10px] text-slate-500 font-mono">Visit ID: {visitId || 'VISIT-2026-001'}</p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-teal-100 space-y-1 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">PEMBAYARAN & PENANGGUNG JAWAB</span>
              <p className="font-black text-teal-800 text-xs uppercase">{paymentType || 'BPJS KESEHATAN'}</p>
              <p className="text-[11px] text-slate-600 font-medium truncate">PJ: <span className="font-semibold text-slate-900">{pjName}</span></p>
              {escortRelation && <p className="text-[10px] text-slate-500 font-medium">Hubungan: {escortRelation}</p>}
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-teal-100 space-y-1 shadow-2xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">DOKTER DPJP PEMERIKSA</span>
              <p className="font-black text-slate-900 text-xs truncate">{doctorName}</p>
              <p className="text-[11px] text-teal-800 font-bold">{doctorSpecialty}</p>
              <p className="text-[10px] text-slate-500 font-medium">{doctorSIP}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4.5 w-4.5 text-teal-700" />
              FORM INPUT REKAM MEDIS RAWAT JALAN
            </span>
            <span className="text-[11px] font-bold text-slate-500">Isi data pelayanan poliklinik di bawah ini</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-700" />
                1. VITAL SIGNS (TANDA-TANDA VITAL)
              </span>
              <button
                type="button"
                onClick={applyVitalNormal}
                className="text-[10px] font-extrabold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Zap className="h-3 w-3 text-teal-700" /> Set Vital Signs Normal
              </button>
            </div>

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tek. Darah (mmHg)</label>
                  <input
                    type="text"
                    value={vs.systolic && vs.diastolic ? `${vs.systolic}/${vs.diastolic}` : vs.systolic || ''}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      handleVitalChange('systolic', parts[0] || '');
                      if (parts[1] !== undefined) handleVitalChange('diastolic', parts[1]);
                    }}
                    placeholder="120/80"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 text-xs font-black text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nadi (x/mnt)</label>
                  <input
                    type="number"
                    value={vs.pulse || ''}
                    onChange={(e) => handleVitalChange('pulse', e.target.value)}
                    placeholder="80"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 text-xs font-black text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Resp Rate (x/mnt)</label>
                  <input
                    type="number"
                    value={vs.rr || ''}
                    onChange={(e) => handleVitalChange('rr', e.target.value)}
                    placeholder="20"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 text-xs font-black text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Suhu (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vs.temp || ''}
                    onChange={(e) => handleVitalChange('temp', e.target.value)}
                    placeholder="36.5"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 text-xs font-black text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={vs.weight || ''}
                    onChange={(e) => handleVitalChange('weight', e.target.value)}
                    placeholder="65"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 text-xs font-black text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <HeartPulse className="h-4 w-4 text-teal-700" />
              2. KELUHAN UTAMA, ANAMNESIS & LAYANAN PENUNJANG (BACKEND SYNC)
            </span>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">KELUHAN UTAMA & ANAMNESIS :</label>
                <textarea
                  rows={3}
                  value={entryDetail.complaint || ''}
                  onChange={(e) => onUpdateDetailField(type, 'complaint', e.target.value)}
                  placeholder="Tuliskan keluhan utama yang dirasakan pasien & riwayat anamnesis..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-hidden"
                />
              </div>

              <div className="space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-800 flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-teal-700" />
                    Pemeriksaan Layanan Penunjang (Laboratorium & Radiologi Master Backend) :
                  </label>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    {[
                      { key: false, label: 'Tidak Ada Penunjang' },
                      { key: true, label: 'Ada Layanan Penunjang' },
                    ].map((opt) => (
                      <label key={String(opt.key)} className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                        <input
                          type="radio"
                          name="has_penunjang_radio"
                          checked={hasPenunjang === opt.key}
                          onChange={() => {
                            setHasPenunjang(opt.key);
                            if (!opt.key) {
                              onUpdateDetailField(type, 'lab_note', '');
                              onUpdateDetailField(type, 'selected_penunjang', JSON.stringify([]));
                            }
                          }}
                          className="accent-teal-700"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasPenunjang && (
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mr-1">Kategori Backend:</span>
                      {[
                        { key: 'Laboratorium', label: 'Laboratorium', icon: TestTube, count: labBackendItems.length },
                        { key: 'Radiologi', label: 'Radiologi', icon: Radio, count: radiologiBackendItems.length },
                      ].map((cat) => {
                        const active = activePenunjangCategory === cat.key;
                        const IconComp = cat.icon;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setActivePenunjangCategory(cat.key)}
                            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                              active
                                ? 'bg-teal-700 text-white border-teal-700 shadow-xs ring-2 ring-teal-600/20'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-800'
                            }`}
                          >
                            <IconComp className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-teal-700'}`} />
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {cat.count} Item
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <span>Pilih Tindakan / Pemeriksaan Master {activePenunjangCategory} :</span>
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {(activePenunjangCategory === 'Laboratorium' ? labBackendItems : radiologiBackendItems).filter((i: string) => selectedPenunjangList.includes(i)).length} Terpilih
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-0.5">
                        {(activePenunjangCategory === 'Laboratorium' ? labBackendItems : radiologiBackendItems).map((itemName: string) => {
                          const isSelected = selectedPenunjangList.includes(itemName);
                          return (
                            <label
                              key={itemName}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 text-xs font-semibold select-none ${
                                isSelected
                                  ? 'bg-teal-50/90 border-teal-600 text-teal-950 shadow-2xs ring-1 ring-teal-600/30 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-slate-50/80'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  let updatedList = [...selectedPenunjangList];
                                  if (isSelected) {
                                    updatedList = updatedList.filter((item: string) => item !== itemName);
                                  } else {
                                    updatedList.push(itemName);
                                  }
                                  onUpdateDetailField(type, 'selected_penunjang', JSON.stringify(updatedList));
                                }}
                                className="h-4 w-4 accent-teal-700 rounded border-slate-300 cursor-pointer shrink-0"
                              />
                              <span className="leading-tight">{itemName}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                        CATATAN HASIL PEMERIKSAAN {activePenunjangCategory.toUpperCase()} :
                      </label>
                      <textarea
                        rows={3}
                        value={entryDetail.lab_note || ''}
                        onChange={(e) => onUpdateDetailField(type, 'lab_note', e.target.value)}
                        placeholder={`Tuliskan rincian hasil pemeriksaan ${activePenunjangCategory} pasien...`}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="h-4 w-4 text-teal-700" />
              3. PEMERIKSAAN KLINIS FISIK & PENEGAKAN DIAGNOSIS
            </span>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">PEMERIKSAAN KLINIS FISIK :</label>
                <textarea
                  rows={3}
                  value={entryDetail.physical_exam || ''}
                  onChange={(e) => onUpdateDetailField(type, 'physical_exam', e.target.value)}
                  placeholder="Hasil pemeriksaan fisik klinis poliklinik..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-hidden"
                />
              </div>

              <div className="relative">
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">DIAGNOSA UTAMA (ICD-10) :</label>
                <div className="relative">
                  <input
                    type="text"
                    value={entryDetail.icd10_primary || icdSearch}
                    onChange={(e) => {
                      setIcdSearch(e.target.value);
                      setIcdOpen(true);
                      onUpdateDetailField(type, 'icd10_primary', e.target.value);
                    }}
                    onFocus={() => setIcdOpen(true)}
                    placeholder="Cari Kode / Nama Diagnosa ICD-10 (misal: E11.9, I10, J06.9)..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {icdOpen && icdResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
                    {icdResults.map((item: any) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          onUpdateDetailField(type, 'icd10_primary', `${item.code} - ${item.name}`);
                          setIcdSearch(`${item.code} - ${item.name}`);
                          setIcdOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-mono font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded text-[10px] mr-2">{item.code}</span>
                        <span className="font-semibold text-slate-800 text-[11px] flex-1">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">CATATAN DIAGNOSA DOKTER :</label>
                <textarea
                  rows={2}
                  value={entryDetail.diagnosis || ''}
                  onChange={(e) => onUpdateDetailField(type, 'diagnosis', e.target.value)}
                  placeholder="Catatan diagnosa kerja & diagnosa sekunder dokter..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              4. TERAPI, TINDAKAN MEDIS & VERIFIKASI DPJP
            </span>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">TERAPI & PENATALAKSANAAN :</label>
                  <textarea
                    rows={4}
                    value={entryDetail.action || ''}
                    onChange={(e) => onUpdateDetailField(type, 'action', e.target.value)}
                    placeholder="Rencana pengobatan, terapi obat, resep poliklinik..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">TINDAKAN MEDIS POLIKLINIK :</label>
                  <input
                    type="text"
                    value={entryDetail.procedure_note || ''}
                    onChange={(e) => onUpdateDetailField(type, 'procedure_note', e.target.value)}
                    placeholder="Tindakan medis poliklinik (injeksi, nebulizer, dll)..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between text-center space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Dokter DPJP / Pemeriksa :</span>
                <div className="h-20 w-full border border-dashed border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center p-2 text-slate-400 shadow-2xs">
                  <span className="text-[10px] italic font-bold text-teal-800">Verified E-Signature</span>
                  <CheckCircle2 className="h-6 w-6 text-teal-600 mt-1" />
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-900 border-b border-slate-300 pb-1">
                    {doctorName}
                  </span>
                  <span className="block text-[10px] text-teal-800 font-bold mt-1">{doctorSpecialty}</span>
                  <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">{doctorSIP}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
            <span className="block text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              5. KONDISI AKHIR PASIEN / STATUS PEMULANGAN :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                { value: 'Membaik', label: 'Membaik / Pulang' },
                { value: 'Rawat Inap', label: 'Rawat Inap' },
                { value: 'Rujuk ke Faskes Lain', label: 'Rujuk Faskes Lain' },
                { value: 'Meninggal', label: 'Meninggal Dunia' },
              ].map((opt) => {
                const isSelected = (entryDetail.discharge_status || entryDetail.status || 'Membaik') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onUpdateDetailField(type, 'discharge_status', opt.value);
                      onUpdateDetailField(type, 'status', opt.value);
                      if (opt.value === 'Rawat Inap') {
                        onEnsureRanapStep?.();
                      } else if (opt.value === 'Rujuk ke Faskes Lain') {
                        onEnsureRujukStep?.();
                      } else if (opt.value === 'Meninggal') {
                        onEnsureDeathStep?.();
                      }
                    }}
                    className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-800 text-white border-teal-800 shadow-md ring-2 ring-teal-600/30 font-black'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-teal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {((entryDetail.discharge_status || entryDetail.status) === 'Rawat Inap') && (
              <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-900 flex items-center justify-between">
                <span>Formulir Rawat Inap telah diaktifkan pada tahapan pelayanan rekam medis.</span>
                {onNavigateToRanap && (
                  <button
                    type="button"
                    onClick={() => onNavigateToRanap?.()}
                    className="px-3 py-1 bg-teal-700 text-white rounded-lg font-bold text-[11px] hover:bg-teal-800 transition cursor-pointer"
                  >
                    Buka Form Ranap &rarr;
                  </button>
                )}
              </div>
            )}

            {((entryDetail.discharge_status || entryDetail.status) === 'Rujuk ke Faskes Lain') && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center justify-between">
                <span>Formulir Rujukan Medis (FormRujuk) telah diaktifkan pada tahapan pelayanan rekam medis.</span>
                {onNavigateToRujuk && (
                  <button
                    type="button"
                    onClick={() => onNavigateToRujuk?.()}
                    className="px-3 py-1 bg-indigo-700 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-800 transition cursor-pointer"
                  >
                    Buka Form Rujuk &rarr;
                  </button>
                )}
              </div>
            )}

            {((entryDetail.discharge_status || entryDetail.status) === 'Meninggal') && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 flex items-center justify-between">
                <span>Formulir Surat Keterangan Kematian (DeathCertificate) telah diaktifkan pada tahapan pelayanan rekam medis.</span>
                {onNavigateToDeath && (
                  <button
                    type="button"
                    onClick={() => onNavigateToDeath?.()}
                    className="px-3 py-1 bg-rose-700 text-white rounded-lg font-bold text-[11px] hover:bg-rose-800 transition cursor-pointer"
                  >
                    Buka Surat Kematian &rarr;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
