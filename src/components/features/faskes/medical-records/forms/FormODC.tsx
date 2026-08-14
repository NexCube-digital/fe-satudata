'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Bed,
  Activity,
  ShieldCheck,
  FileText,
  CheckCircle2,
  User,
  Plus,
  Trash2,
  Stethoscope,
  HeartPulse,
  Zap,
  AlertCircle,
  ArrowRight,
  Search,
  Building2,
  Thermometer,
  Check,
  UserCheck,
  FileCheck2,
} from 'lucide-react';
import { searchICD9 } from '@/data/icdData';

export default function FormODC({
  entryDetail = {},
  type = 'one_day_care',
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
  const [icd9Search, setIcd9Search] = useState<string>('');
  const [icd9Open, setIcd9Open] = useState<boolean>(false);
  const icd9Results = useMemo(() => searchICD9(icd9Search), [icd9Search]);

  const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || '';
  const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || '-------';
  const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || 'L';
  const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || '';

  const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.dpjp_doctor || 'DPJP Belum Dipilih';
  const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || entryDetail.dpjp_specialty || 'Spesialis';

  const handleFieldChange = (field: string, value: any) => {
    onUpdateDetailField(type, field, value);
  };

  const observationLogs = useMemo(() => {
    try {
      if (Array.isArray(entryDetail.odc_observation_logs)) return entryDetail.odc_observation_logs;
      if (typeof entryDetail.odc_observation_logs === 'string') return JSON.parse(entryDetail.odc_observation_logs);
    } catch {}
    return [
      { time: '09:00', bp: '120/80', pulse: '80', temp: '36.5', spo2: '98', gcs: 'E4V5M6 (Sadar Penuh)', complaints: 'Tidak ada keluhan', fluids: 'RL 500ml (20 tpm)' },
      { time: '10:00', bp: '118/78', pulse: '78', temp: '36.6', spo2: '99', gcs: 'E4V5M6 (Sadar Penuh)', complaints: 'Nyeri minimal (Skala 2)', fluids: 'RL 500ml (20 tpm)' },
    ];
  }, [entryDetail.odc_observation_logs]);

  const updateObservationLogs = (newList: any[]) => {
    onUpdateDetailField(type, 'odc_observation_logs', JSON.stringify(newList));
  };

  const addObservationRow = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRow = {
      time: timeStr,
      bp: '120/80',
      pulse: '80',
      temp: '36.5',
      spo2: '98',
      gcs: 'E4V5M6 (Sadar Penuh)',
      complaints: 'Normal',
      fluids: 'Infus Drip',
    };
    updateObservationLogs([...observationLogs, newRow]);
  };

  const removeObservationRow = (index: number) => {
    const updated = observationLogs.filter((_: any, idx: number) => idx !== index);
    updateObservationLogs(updated);
  };

  const handleObservationRowChange = (index: number, key: string, value: string) => {
    const updated = observationLogs.map((item: any, idx: number) => {
      if (idx === index) return { ...item, [key]: value };
      return item;
    });
    updateObservationLogs(updated);
  };

  const aldreteActivity = Number(entryDetail.aldrete_activity ?? 2);
  const aldreteRespiration = Number(entryDetail.aldrete_respiration ?? 2);
  const aldreteCirculation = Number(entryDetail.aldrete_circulation ?? 2);
  const aldreteConsciousness = Number(entryDetail.aldrete_consciousness ?? 2);
  const aldreteSpo2 = Number(entryDetail.aldrete_spo2 ?? 2);

  const totalAldreteScore = aldreteActivity + aldreteRespiration + aldreteCirculation + aldreteConsciousness + aldreteSpo2;

  return (
    <div className="space-y-6 font-sans text-slate-900">
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/90 p-5 text-slate-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-black shadow-xs">
              <Bed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider uppercase text-teal-950">
                FORMULIR ONE DAY CARE (ODC) & OBSERVASI SINGKAT
              </h1>
              <p className="text-xs font-semibold text-teal-800">
                STANDAR RUMAH SAKIT & REKAM MEDIS ELEKTRONIK (RME) KEMENKES RI
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-900">
              ODC-ADM-01 / DOKUMEN MEDIS RESMI
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
            <span className="block text-[10px] uppercase font-bold text-teal-800">DPJP Penanggung Jawab :</span>
            <span className="font-extrabold text-emerald-900 truncate block">{doctorName}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Building2 className="h-4 w-4 text-teal-700" />
          1. DATA PENDAFTARAN & LOKASI OBSERVASI ODC
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
              No. Bed / Kamar Observasi ODC :
            </label>
            <input
              type="text"
              value={entryDetail.odc_bed_number || 'Bed ODC-01'}
              onChange={(e) => handleFieldChange('odc_bed_number', e.target.value)}
              placeholder="Contoh: Bed ODC-01 / Ruang Transisi"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
              Jam Masuk Ruang ODC :
            </label>
            <input
              type="time"
              value={entryDetail.odc_entry_time || visitTime || '08:00'}
              onChange={(e) => handleFieldChange('odc_entry_time', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
              Perkiraan Jam Keluar ODC :
            </label>
            <input
              type="time"
              value={entryDetail.odc_exit_time || '16:00'}
              onChange={(e) => handleFieldChange('odc_exit_time', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
              Tipe Layanan ODC :
            </label>
            <select
              value={entryDetail.odc_service_type || 'Bedah Minor'}
              onChange={(e) => handleFieldChange('odc_service_type', e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-hidden cursor-pointer"
            >
              <option value="Bedah Minor">Bedah Minor (One Day Surgery)</option>
              <option value="Observasi Intensif">Observasi Medis / Terapi IV</option>
              <option value="Kemoterapi / Transfusi">Kemoterapi / Transfusi Darah</option>
              <option value="Tindakan Endoskopik">Endoskopi / Tindakan Diagnostik</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
