'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Stethoscope,
  FileText,
  CheckCircle2,
  User,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Search,
  Building2,
  Check,
  RotateCcw,
  HeartPulse,
  Zap,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { searchICD10 } from '@/data/icdData';

export default function FormRehab({
  entryDetail = {},
  type = 'rehab_medik',
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
  const [icdSearch, setIcdSearch] = useState<string>('');
  const [icdOpen, setIcdOpen] = useState<boolean>(false);
  const icdResults = useMemo(() => searchICD10(icdSearch), [icdSearch]);

  const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || '';
  const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || '-------';
  const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || 'L';
  const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || '';

  const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.kfr_doctor || 'dr. KFR Sp.KFR';
  const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || 'Kedokteran Fisik & Rehabilitasi (Sp.KFR)';

  const handleFieldChange = (field: string, value: any) => {
    onUpdateDetailField(type, field, value);
  };

  const selectedTherapyTypes = useMemo(() => {
    try {
      if (Array.isArray(entryDetail.therapy_types)) return entryDetail.therapy_types;
      if (typeof entryDetail.therapy_types === 'string') return JSON.parse(entryDetail.therapy_types);
    } catch {}
    return ['Fisioterapi'];
  }, [entryDetail.therapy_types]);

  const toggleTherapyType = (itemLabel: string) => {
    const updated = selectedTherapyTypes.includes(itemLabel)
      ? selectedTherapyTypes.filter((t: string) => t !== itemLabel)
      : [...selectedTherapyTypes, itemLabel];
    onUpdateDetailField(type, 'therapy_types', JSON.stringify(updated));
  };

  const selectedModalities = useMemo(() => {
    try {
      if (Array.isArray(entryDetail.modalities_prescribed)) return entryDetail.modalities_prescribed;
      if (typeof entryDetail.modalities_prescribed === 'string') return JSON.parse(entryDetail.modalities_prescribed);
    } catch {}
    return ['Diathermy / Ultrasound (US) / TENS (Penghilang nyeri)', 'Exercise / Terapi Latihan (Strengthening, Stretching)'];
  }, [entryDetail.modalities_prescribed]);

  const toggleModality = (modalityLabel: string) => {
    const updated = selectedModalities.includes(modalityLabel)
      ? selectedModalities.filter((m: string) => m !== modalityLabel)
      : [...selectedModalities, modalityLabel];
    onUpdateDetailField(type, 'modalities_prescribed', JSON.stringify(updated));
  };

  const sessionLogs = useMemo(() => {
    try {
      if (Array.isArray(entryDetail.rehab_session_logs)) return entryDetail.rehab_session_logs;
      if (typeof entryDetail.rehab_session_logs === 'string') return JSON.parse(entryDetail.rehab_session_logs);
    } catch {}
    return [
      { session: 'Sesi 1', date: visitDate || '2026-08-10', therapist: 'Ftr. Budi Santoso, S.Fis', action: 'US & TENS lumbal + stretching hamstring', response: 'Nyeri VAS berkurang dari 6 ke 4' },
      { session: 'Sesi 2', date: visitDate || '2026-08-12', therapist: 'Ftr. Budi Santoso, S.Fis', action: 'Exercise strengthening quadriceps', response: 'MMT meningkat dari 3 jadi 4' },
    ];
  }, [entryDetail.rehab_session_logs, visitDate]);

  const updateSessionLogs = (newList: any[]) => {
    onUpdateDetailField(type, 'rehab_session_logs', JSON.stringify(newList));
  };

  const addSessionRow = () => {
    const nextNum = sessionLogs.length + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const newRow = {
      session: `Sesi ${nextNum}`,
      date: todayStr,
      therapist: 'Ftr. Budi Santoso, S.Fis',
      action: 'Modalitas & Terapi Latihan',
      response: 'Respon baik, toleransi terapi adekuat',
    };
    updateSessionLogs([...sessionLogs, newRow]);
  };

  const removeSessionRow = (index: number) => {
    const updated = sessionLogs.filter((_: any, idx: number) => idx !== index);
    updateSessionLogs(updated);
  };

  const handleSessionRowChange = (index: number, key: string, value: string) => {
    const updated = sessionLogs.map((item: any, idx: number) => {
      if (idx === index) return { ...item, [key]: value };
      return item;
    });
    updateSessionLogs(updated);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/90 p-5 text-slate-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-black shadow-xs">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider uppercase text-teal-950">
                FORMULIR REHABILITASI MEDIK & FISIOTERAPI
              </h1>
              <p className="text-xs font-semibold text-teal-800">
                PELAYANAN KEDOKTERAN FISIK & REHABILITASI (KFR) SINKRON RME KEMENKES RI
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-900">
              KFR-ADM-01 / REKAM MEDIS RESMI
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-teal-200/80 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-teal-800">Nama Pasien :</span>
            <span className="font-extrabold text-slate-900 truncate block">{patientName || 'Nama Pasien'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-teal-800">No. Rekam Medis (RM) :</span>
            <span className="font-extrabold text-teal-900">{noRM}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-teal-800">Jenis Kelamin / Tgl Lahir :</span>
            <span className="font-extrabold text-slate-900">{gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({dob || '-'})</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-teal-800">Dokter Spesialis KFR :</span>
            <span className="font-extrabold text-emerald-900 truncate block">{doctorName}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building2 className="h-4 w-4 text-teal-700" />
          1. DATA LEMBAR RUJUKAN & PENDAFTARAN REHAB MEDIK
        </span>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                Dokter Spesialis KFR / DPJP Utama :
              </label>
              <input
                type="text"
                value={entryDetail.kfr_doctor || doctorName}
                onChange={(e) => handleFieldChange('kfr_doctor', e.target.value)}
                placeholder="Nama dokter Sp.KFR..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
                Dokter Perujuk (Spesialis Lain / Poli Asal) :
              </label>
              <input
                type="text"
                value={entryDetail.referring_doctor || 'dr. Saraf Sp.N / dr. Bedah Orthopedi Sp.OT'}
                onChange={(e) => handleFieldChange('referring_doctor', e.target.value)}
                placeholder="Dokter perujuk..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
