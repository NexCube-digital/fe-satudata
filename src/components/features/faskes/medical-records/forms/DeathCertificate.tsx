'use client';

import React, { useState, useMemo } from 'react';
import {
  HeartOff,
  Clock,
  Building2,
  ShieldAlert,
  FileText,
  Activity,
  UserCheck,
  CheckCircle2,
  Search,
  Check,
  Plus,
  Trash2,
  Truck,
  Phone,
  ShieldCheck,
  FileCheck,
  User,
  AlertTriangle,
} from 'lucide-react';
import { searchICD10 } from '@/data/icdData';

export default function DeathCertificate({
  entryDetail = {},
  type = 'death_certificate',
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
}: any) {
  const [icdDirectSearch, setIcdDirectSearch] = useState<string>('');
  const [icdDirectOpen, setIcdDirectOpen] = useState<boolean>(false);
  const icdDirectResults = useMemo(() => searchICD10(icdDirectSearch), [icdDirectSearch]);

  const [icdInterSearch, setIcdInterSearch] = useState<string>('');
  const [icdInterOpen, setIcdInterOpen] = useState<boolean>(false);
  const icdInterResults = useMemo(() => searchICD10(icdInterSearch), [icdInterSearch]);

  const [icdUnderlyingSearch, setIcdUnderlyingSearch] = useState<string>('');
  const [icdUnderlyingOpen, setIcdUnderlyingOpen] = useState<boolean>(false);
  const icdUnderlyingResults = useMemo(() => searchICD10(icdUnderlyingSearch), [icdUnderlyingSearch]);

  const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || '';
  const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || '-------';
  const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || 'L';
  const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || '';
  const nik = selectedPatient?.nik || selectedPatient?.identity_number || entryDetail.nik || '';

  const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.declaring_doctor || 'dr. DPJP / Dokter Jaga';
  const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || 'Dokter Penanggung Jawab';

  const handleFieldChange = (field: string, value: any) => {
    onUpdateDetailField(type, field, value);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-slate-100 via-rose-50/60 to-slate-50 p-5 text-slate-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white font-black shadow-xs">
              <HeartOff className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider uppercase text-slate-900">
                SURAT KETERANGAN / AKTA KEMATIAN PASIEN MEDIS
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                FORMULIR RESMI SERTA SEBAB KEMATIAN BERANTAI WHO / KEMENKES RI
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-900">
              DEATH-CERT-01 / DOKUMEN HUKUM & MEDIS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-200 text-xs">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-600">Nama Almarhum/ah :</span>
            <span className="font-extrabold text-slate-900 truncate block">{patientName || 'Nama Pasien'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-600">No. RM / NIK :</span>
            <span className="font-extrabold text-slate-900">{noRM} {nik ? `/ ${nik}` : ''}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-600">Jenis Kelamin / Tgl Lahir :</span>
            <span className="font-extrabold text-slate-900">{gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({dob || '-'})</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-600">Dokter Yang Menyatakan :</span>
            <span className="font-extrabold text-slate-900 truncate block">{doctorName}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Clock className="h-4 w-4 text-slate-700" />
          1. WAKTU & LOKASI PERNYATAAN KEMATIAN (PRONOUNCED DEAD)
        </span>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Waktu Dinyatakan Meninggal (Pronounced Dead) :
              </label>
              <input
                type="datetime-local"
                value={entryDetail.death_datetime || `${visitDate || '2026-08-13'}T${visitTime || '10:30'}`}
                onChange={(e) => handleFieldChange('death_datetime', e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                Dokter Yang Menyatakan Kematian :
              </label>
              <input
                type="text"
                value={entryDetail.declaring_doctor || doctorName}
                onChange={(e) => handleFieldChange('declaring_doctor', e.target.value)}
                placeholder="Nama Dokter..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
                No. Kamar / Bed (jika di Ranap) :
              </label>
              <input
                type="text"
                value={entryDetail.death_room_bed || 'Bed 302-A'}
                onChange={(e) => handleFieldChange('death_room_bed', e.target.value)}
                placeholder="Contoh: Kamar 302 Bed A / Ruang ICU Bed 2"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
              Lokasi / Ruangan Kematian Pasien :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-bold">
              {[
                { key: 'IGD', label: 'IGD / Triase' },
                { key: 'Rawat Inap', label: 'Bangsal Rawat Inap' },
                { key: 'IBS', label: 'Kamar Operasi (IBS)' },
                { key: 'ICU', label: 'ICU / HCU / ICCU' },
                { key: 'DOA', label: 'DOA (Death on Arrival)' },
              ].map((opt) => {
                const active = (entryDetail.death_location || 'IGD') === opt.key;
                return (
                  <label
                    key={opt.key}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      active ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <input
                      type="radio"
                      name="death_location"
                      checked={active}
                      onChange={() => handleFieldChange('death_location', opt.key)}
                      className="accent-rose-500 h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
