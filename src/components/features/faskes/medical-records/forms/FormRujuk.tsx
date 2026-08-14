'use client';

import React, { useState, useMemo } from 'react';
import {
  Send,
  Building2,
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
  Check,
  AlertCircle,
  Ambulance,
  FileCheck,
  Paperclip,
  PhoneCall,
  HeartPulse,
  ShieldAlert,
} from 'lucide-react';
import { searchICD10 } from '@/data/icdData';

export default function FormRujuk({
  entryDetail = {},
  type = 'rujukan_medis',
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

  const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.referring_doctor || 'dr. DPJP Pengirim';
  const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || 'Dokter Penanggung Jawab';

  const handleFieldChange = (field: string, value: any) => {
    onUpdateDetailField(type, field, value);
  };

  const selectedReasons = useMemo(() => {
    try {
      if (Array.isArray(entryDetail.referral_reasons)) return entryDetail.referral_reasons;
      if (typeof entryDetail.referral_reasons === 'string') return JSON.parse(entryDetail.referral_reasons);
    } catch {}
    return ['Butuh Penanganan Spesialis / Sub-spesialis'];
  }, [entryDetail.referral_reasons]);

  const toggleReason = (reasonLabel: string) => {
    const updated = selectedReasons.includes(reasonLabel)
      ? selectedReasons.filter((r: string) => r !== reasonLabel)
      : [...selectedReasons, reasonLabel];
    onUpdateDetailField(type, 'referral_reasons', JSON.stringify(updated));
  };

  const selectedAttachments = useMemo(() => {
    try {
      if (Array.isArray(entryDetail.attached_files)) return entryDetail.attached_files;
      if (typeof entryDetail.attached_files === 'string') return JSON.parse(entryDetail.attached_files);
    } catch {}
    return ['Hasil Laboratorium Terakhir', 'Hasil Radiologi / Rontgen'];
  }, [entryDetail.attached_files]);

  const toggleAttachment = (attachmentLabel: string) => {
    const updated = selectedAttachments.includes(attachmentLabel)
      ? selectedAttachments.filter((a: string) => a !== attachmentLabel)
      : [...selectedAttachments, attachmentLabel];
    onUpdateDetailField(type, 'attached_files', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-teal-50/90 p-5 text-slate-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black shadow-xs">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider uppercase text-indigo-950">
                FORMULIR RUJUKAN MEDIS & TELE-RUJUKAN ANTER-FASKES
              </h1>
              <p className="text-xs font-semibold text-indigo-800">
                INTEGRASI SISRUTE & SATUSEHAT REKAM MEDIS ELEKTRONIK (RME) KEMENKES RI
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900">
              REF-MED-01 / DOKUMEN RUJUKAN RESMI
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-indigo-200/80 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-800">Nama Pasien :</span>
            <span className="font-extrabold text-slate-900 truncate block">{patientName || 'Nama Pasien'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-800">No. Rekam Medis (RM) :</span>
            <span className="font-extrabold text-indigo-950">{noRM}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-800">Jenis Kelamin / Tgl Lahir :</span>
            <span className="font-extrabold text-slate-900">{gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({dob || '-'})</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-indigo-800">Dokter Merujuk (DPJP) :</span>
            <span className="font-extrabold text-emerald-900 truncate block">{doctorName}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building2 className="h-4 w-4 text-indigo-700" />
          1. DATA IDENTITAS & ADMINISTRASI RUJUKAN
        </span>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
                Jenis Rujukan Medis :
              </label>
              <div className="flex items-center gap-4 font-bold">
                {[
                  { key: 'Rujukan Eksternal', label: 'Rujukan Eksternal (Antar Faskes)' },
                  { key: 'Rujukan Internal', label: 'Rujukan Internal (Antar Poli)' },
                ].map((opt) => {
                  const active = (entryDetail.referral_type || 'Rujukan Eksternal') === opt.key;
                  return (
                    <label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="referral_type"
                        checked={active}
                        onChange={() => handleFieldChange('referral_type', opt.key)}
                        className="accent-indigo-700 h-4 w-4"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
                Sifat / Urgensi Rujukan :
              </label>
              <div className="flex items-center gap-4 font-bold">
                {[
                  { key: 'Darurat', label: 'Darurat (Emergency / Cito)' },
                  { key: 'Terencana', label: 'Terencana (Rutin / Elektif)' },
                ].map((opt) => {
                  const active = (entryDetail.referral_urgency || 'Darurat') === opt.key;
                  return (
                    <label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="referral_urgency"
                        checked={active}
                        onChange={() => handleFieldChange('referral_urgency', opt.key)}
                        className="accent-indigo-700 h-4 w-4"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
