'use client';

import React, { useState, useMemo } from 'react';
import {
  Scissors,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Activity,
  FileText,
  Building2,
  Search,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  ArrowRight,
  User,
  Stethoscope,
  HeartPulse,
  Zap,
  Award,
  FileCheck,
  Syringe,
  Thermometer,
} from 'lucide-react';
import { searchICD10, searchICD9 } from '@/data/icdData';

export default function FormBedah({
  entryDetail = {},
  type = 'bedah_sentral',
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
  roomOptions = [],
  onNavigateToRanap,
  onEnsureRanapStep,
}: any) {
  const [icd10PreSearch, setIcd10PreSearch] = useState<string>('');
  const [icd10PreOpen, setIcd10PreOpen] = useState<boolean>(false);
  const icd10PreResults = useMemo(() => searchICD10(icd10PreSearch), [icd10PreSearch]);

  const [icd10PostSearch, setIcd10PostSearch] = useState<string>('');
  const [icd10PostOpen, setIcd10PostOpen] = useState<boolean>(false);
  const icd10PostResults = useMemo(() => searchICD10(icd10PostSearch), [icd10PostSearch]);

  const [icd9Search, setIcd9Search] = useState<string>('');
  const [icd9Open, setIcd9Open] = useState<boolean>(false);
  const icd9Results = useMemo(() => searchICD9(icd9Search), [icd9Search]);

  const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || '';
  const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || '-------';
  const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || 'L';
  const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || '';

  const primaryOperatorDoctor = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.operator_doctor || 'dr. Bedah Sp.B';
  const primarySpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || 'Spesialis Bedah';

  const handleFieldChange = (field: string, value: any) => {
    onUpdateDetailField(type, field, value);
  };

  const whoChecklist = useMemo(() => {
    try {
      if (typeof entryDetail.who_checklist === 'object' && entryDetail.who_checklist !== null) return entryDetail.who_checklist;
      if (typeof entryDetail.who_checklist === 'string') return JSON.parse(entryDetail.who_checklist);
    } catch {}
    return {
      signin_identity: true,
      signin_anesthesia_ready: true,
      signin_airway_risk: true,
      signin_pulse_oximeter: true,
      timeout_team_intro: true,
      timeout_confirm_procedure: true,
      timeout_antibiotic_prophylaxis: true,
      timeout_critical_steps: true,
      signout_count_instruments: true,
      signout_specimen_labeled: true,
      signout_recovery_notes: true,
    };
  }, [entryDetail.who_checklist]);

  const updateWhoChecklist = (key: string, value: boolean) => {
    const updated = { ...whoChecklist, [key]: value };
    onUpdateDetailField(type, 'who_checklist', JSON.stringify(updated));
  };

  const whoTotalChecked = Object.values(whoChecklist).filter(Boolean).length;

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/90 via-red-50/60 to-slate-50 p-5 text-slate-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white font-black shadow-xs">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider uppercase text-rose-950">
                FORMULIR LAPORAN BEDAH SENTRAL & KAMAR OPERASI (OK)
              </h1>
              <p className="text-xs font-semibold text-rose-800">
                INTEGRASI WHO SURGICAL SAFETY CHECKLIST & LAPORAN OPERASI RESMI RME
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900">
              OK-SURG-01 / DOKUMEN REKAM MEDIS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-rose-200/80 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-rose-800">Nama Pasien :</span>
            <span className="font-extrabold text-slate-900 truncate block">{patientName || 'Nama Pasien'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-rose-800">No. Rekam Medis (RM) :</span>
            <span className="font-extrabold text-rose-900">{noRM}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-rose-800">Jenis Kelamin / Tgl Lahir :</span>
            <span className="font-extrabold text-slate-900">{gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({dob || '-'})</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-rose-800">Dokter Operator Utama :</span>
            <span className="font-extrabold text-slate-900 truncate block">{primaryOperatorDoctor}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Clock className="h-4 w-4 text-rose-700" />
          FASE 1: PRA-BEDAH / PRE-OPERATIF (SEBELUM MASUK KAMAR OPERASI)
        </span>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Tanggal & Jam Operasi :
              </label>
              <input
                type="datetime-local"
                value={entryDetail.op_datetime || `${visitDate || '2026-08-13'}T${visitTime || '09:00'}`}
                onChange={(e) => handleFieldChange('op_datetime', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Kamar Operasi (OK No.) :
              </label>
              <select
                value={entryDetail.op_room_number || 'OK 1'}
                onChange={(e) => handleFieldChange('op_room_number', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden cursor-pointer"
              >
                <option value="OK 1">Kamar Operasi 1 (OK Utama)</option>
                <option value="OK 2">Kamar Operasi 2 (OK Bedah Minor)</option>
                <option value="OK 3">Kamar Operasi 3 (OK Kebidanan / VK)</option>
                <option value="OK Emergency">Kamar Operasi Cito / IGD</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Sifat / Jenis Operasi :
              </label>
              <div className="flex items-center gap-4 py-1.5 font-bold">
                {[
                  { key: 'Elektif', label: 'Elektif / Terencana' },
                  { key: 'Cito', label: 'Cito / Darurat' },
                ].map((opt) => {
                  const active = (entryDetail.op_urgency || 'Elektif') === opt.key;
                  return (
                    <label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="op_urgency"
                        checked={active}
                        onChange={() => handleFieldChange('op_urgency', opt.key)}
                        className="accent-rose-700"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Diagnosa Pra-Bedah (ICD-10 Pre-Op) :
              </label>
              <input
                type="text"
                value={entryDetail.icd10_pre_op || icd10PreSearch}
                onChange={(e) => {
                  setIcd10PreSearch(e.target.value);
                  setIcd10PreOpen(true);
                  handleFieldChange('icd10_pre_op', e.target.value);
                }}
                onFocus={() => setIcd10PreOpen(true)}
                placeholder="Cari Diagnosa Pra-Bedah ICD-10..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
              {icd10PreOpen && icd10PreResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-44 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
                  {icd10PreResults.map((item: any) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        handleFieldChange('icd10_pre_op', `${item.code} - ${item.name}`);
                        setIcd10PreSearch(`${item.code} - ${item.name}`);
                        setIcd10PreOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded text-[10px] mr-2">{item.code}</span>
                      <span className="font-semibold text-slate-800 text-[11px] flex-1">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Rencana Tindakan Bedah / Operasi :
              </label>
              <input
                type="text"
                value={entryDetail.planned_procedure || ''}
                onChange={(e) => handleFieldChange('planned_procedure', e.target.value)}
                placeholder="Nama rencana tindakan operasi..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-semibold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-700" />
            FASE 2: WHO SURGICAL SAFETY CHECKLIST (VERIFIKASI SAFETY TIGA FASE)
          </span>
          <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 px-3 py-0.5 rounded-full border border-rose-200">
            Score: {whoTotalChecked} / 11 Checked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>SIGN IN (Before Anesthesia)</span>
              <span className="text-[9px] text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">Fase 1</span>
            </h4>
            {[
              { key: 'signin_identity', label: 'Konfirmasi Identitas Pasien & Area Operasi' },
              { key: 'signin_anesthesia_ready', label: 'Mesin Anestesi & Obat Siap Digunakan' },
              { key: 'signin_airway_risk', label: 'Evaluasi Risiko Jalan Napas & Aspirasi' },
              { key: 'signin_pulse_oximeter', label: 'Pulse Oximeter Terpasang & Berfungsi' },
            ].map((chk) => (
              <label key={chk.key} className="flex items-start gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={!!(whoChecklist as any)[chk.key]}
                  onChange={(e) => updateWhoChecklist(chk.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-700 rounded border-slate-300 cursor-pointer"
                />
                <span className="font-semibold text-[11px] leading-snug">{chk.label}</span>
              </label>
            ))}
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>TIME OUT (Before Incision)</span>
              <span className="text-[9px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Fase 2</span>
            </h4>
            {[
              { key: 'timeout_team_intro', label: 'Seluruh Tim Memperkenalkan Diri & Peran' },
              { key: 'timeout_confirm_procedure', label: 'Verifikasi Nama Pasien & Tindakan Operasi' },
              { key: 'timeout_antibiotic_prophylaxis', label: 'Profilaksis Antibiotik Diberikan (<60 mnt)' },
              { key: 'timeout_critical_steps', label: 'Penyampaian Langkah Kritis Operator & Anestesi' },
            ].map((chk) => (
              <label key={chk.key} className="flex items-start gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={!!(whoChecklist as any)[chk.key]}
                  onChange={(e) => updateWhoChecklist(chk.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-700 rounded border-slate-300 cursor-pointer"
                />
                <span className="font-semibold text-[11px] leading-snug">{chk.label}</span>
              </label>
            ))}
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>SIGN OUT (Before Leaving OK)</span>
              <span className="text-[9px] text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">Fase 3</span>
            </h4>
            {[
              { key: 'signout_count_instruments', label: 'Perhitungan Kassa & Instrumen Lengkap' },
              { key: 'signout_specimen_labeled', label: 'Spesimen Jaringan Diberi Label Nama & RM' },
              { key: 'signout_recovery_notes', label: 'Pencatatan Masalah Peralatan & Instruksi PACU' },
            ].map((chk) => (
              <label key={chk.key} className="flex items-start gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={!!(whoChecklist as any)[chk.key]}
                  onChange={(e) => updateWhoChecklist(chk.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-700 rounded border-slate-300 cursor-pointer"
                />
                <span className="font-semibold text-[11px] leading-snug">{chk.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileText className="h-4 w-4 text-rose-700" />
          FASE 3: LAPORAN TINDAKAN OPERASI & IMPLANTASI
        </span>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Diagnosa Pasca Bedah (ICD-10 Post-Op) :
              </label>
              <input
                type="text"
                value={entryDetail.icd10_post_op || icd10PostSearch}
                onChange={(e) => {
                  setIcd10PostSearch(e.target.value);
                  setIcd10PostOpen(true);
                  handleFieldChange('icd10_post_op', e.target.value);
                }}
                onFocus={() => setIcd10PostOpen(true)}
                placeholder="Cari Diagnosa Pasca Bedah ICD-10..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
              {icd10PostOpen && icd10PostResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-44 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
                  {icd10PostResults.map((item: any) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        handleFieldChange('icd10_post_op', `${item.code} - ${item.name}`);
                        setIcd10PostSearch(`${item.code} - ${item.name}`);
                        setIcd10PostOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded text-[10px] mr-2">{item.code}</span>
                      <span className="font-semibold text-slate-800 text-[11px] flex-1">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Tindakan Operasi Yang Dilakukan (ICD-9-CM) :
              </label>
              <input
                type="text"
                value={entryDetail.icd9_procedure || icd9Search}
                onChange={(e) => {
                  setIcd9Search(e.target.value);
                  setIcd9Open(true);
                  handleFieldChange('icd9_procedure', e.target.value);
                }}
                onFocus={() => setIcd9Open(true)}
                placeholder="Cari Kode Prosedur Bedah ICD-9-CM..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
              {icd9Open && icd9Results.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-44 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
                  {icd9Results.map((item: any) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        handleFieldChange('icd9_procedure', `${item.code} - ${item.name}`);
                        setIcd9Search(`${item.code} - ${item.name}`);
                        setIcd9Open(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-mono font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded text-[10px] mr-2">{item.code}</span>
                      <span className="font-semibold text-slate-800 text-[11px] flex-1">{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
              Rincian Laporan Operasi & Komplikasi :
            </label>
            <textarea
              rows={4}
              value={entryDetail.op_description || ''}
              onChange={(e) => handleFieldChange('op_description', e.target.value)}
              placeholder="Tuliskan temuan klinis, jaringan yang diinsisi, komplikasi, pendarahan..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-medium text-slate-900 focus:border-rose-700 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Jumlah Pendarahan (cc) :</label>
              <input
                type="number"
                value={entryDetail.blood_loss || '50'}
                onChange={(e) => handleFieldChange('blood_loss', e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Pemeriksaan Jaringan (PA) :</label>
              <select
                value={entryDetail.pa_exam || 'Ya'}
                onChange={(e) => handleFieldChange('pa_exam', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden cursor-pointer"
              >
                <option value="Ya">Ya (Dikirim ke Patologi Anatomi)</option>
                <option value="Tidak">Tidak Ada Jaringan PA</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Pemasangan Implan / Alat :</label>
              <input
                type="text"
                value={entryDetail.implant_details || 'Tidak Ada Implan'}
                onChange={(e) => handleFieldChange('implant_details', e.target.value)}
                placeholder="Detail implan / mesh..."
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900 focus:border-rose-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Activity className="h-4 w-4 text-rose-700" />
          FASE 4: INSTRUKSI PASCA-OPERASI & INTEGRASI RAWAT INAP
        </span>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
              Instruksi Dokter Pasca Bedah (Post-Op Instructions PACU / ICU / Ranap) :
            </label>
            <textarea
              rows={3}
              value={entryDetail.post_op_instructions || ''}
              onChange={(e) => handleFieldChange('post_op_instructions', e.target.value)}
              placeholder="Instruksi pengawasan vital signs, analgetik post-op, mobilisasi..."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-medium text-slate-900 focus:border-rose-700 focus:outline-hidden"
            />
          </div>

          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-extrabold text-rose-950 uppercase">
                Tujuan Ruang Perawatan Pasca Bedah :
              </span>
              <p className="text-[11px] text-rose-800 font-semibold mt-0.5">
                Pindahkan pasien ke Ruang Perawatan Rawat Inap / ICU setelah observasi di PACU selesai.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleFieldChange('discharge_status', 'Rawat Inap');
                  onEnsureRanapStep?.();
                  onNavigateToRanap?.();
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Aktifkan &amp; Buka Form Rawat Inap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
