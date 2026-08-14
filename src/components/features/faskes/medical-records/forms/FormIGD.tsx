'use client';

import React from 'react';
import { Sparkles, ShieldAlert, HeartPulse, Zap, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';

export function IgdTriaseForm({
  field,
  entryDetail,
  type,
  parseVitalSigns,
  onUpdateDetailField,
}: any) {
  const triaseData = parseVitalSigns(entryDetail.igd_triase_data);
  const vs = parseVitalSigns(entryDetail.vital_signs);

  const handleTriaseChange = (key: string, val: any) => {
    const current = parseVitalSigns(entryDetail.igd_triase_data);
    const updated = { ...current, [key]: val };
    onUpdateDetailField(type, 'igd_triase_data', JSON.stringify(updated));
  };

  const handleVitalSignChange = (key: string, val: any) => {
    const current = parseVitalSigns(entryDetail.vital_signs);
    const updated = { ...current, [key]: val };
    onUpdateDetailField(type, 'vital_signs', JSON.stringify(updated));
  };

  const totalGCS =
    (Number(triaseData.gcs_e || 0) || 0) +
    (Number(triaseData.gcs_v || 0) || 0) +
    (Number(triaseData.gcs_m || 0) || 0);

  const applyGcsPreset = (e: number, v: number, m: number, statusText: string) => {
    const current = parseVitalSigns(entryDetail.igd_triase_data);
    const updated = {
      ...current,
      gcs_e: String(e),
      gcs_v: String(v),
      gcs_m: String(m),
      kesadaran_text: statusText,
      triage_kesadaran: statusText.includes('Compos') ? 'Sadar' : 'Kesadaran menurun',
    };
    onUpdateDetailField(type, 'igd_triase_data', JSON.stringify(updated));
  };

  const applyVitalSignPreset = (presetType: string) => {
    const current = parseVitalSigns(entryDetail.vital_signs);
    let updated = { ...current };

    if (presetType === 'normal') {
      updated = { ...updated, systolic: '120', diastolic: '80', pulse: '80', temp: '36.5', rr: '20', spo2: '98' };
    } else if (presetType === 'demam') {
      updated = { ...updated, temp: '38.5', pulse: '102', rr: '24' };
    } else if (presetType === 'hipertensi') {
      updated = { ...updated, systolic: '165', diastolic: '100', pulse: '88' };
    } else if (presetType === 'hipotensi') {
      updated = { ...updated, systolic: '85', diastolic: '55', pulse: '115', rr: '26' };
    }

    onUpdateDetailField(type, 'vital_signs', JSON.stringify(updated));
  };

  return (
    <div key={field?.name || 'igd_triase'} className="space-y-6 font-sans">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-rose-50 via-rose-50/60 to-slate-50 border-b border-rose-200/90 px-5 py-3.5 text-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white font-black text-xs shadow-xs">
              IGD
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block text-slate-900 flex items-center gap-2">
                TRIAGE STATUS PASIEN
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Tentukan prioritas penanganan medis IGD berdasarkan kriteria triase
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {[
              { key: 'Merah', label: 'Merah (Resusitasi)', color: 'bg-rose-600', activeBg: 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300' },
              { key: 'Kuning', label: 'Kuning (Urgent)', color: 'bg-amber-400', activeBg: 'bg-amber-400 text-slate-950 border-amber-400 ring-2 ring-amber-300' },
              { key: 'Hijau', label: 'Hijau (Non-Urgent)', color: 'bg-emerald-600', activeBg: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300' },
              { key: 'Hitam', label: 'Hitam (Meninggal)', color: 'bg-slate-900', activeBg: 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400' },
            ].map((opt) => {
              const active = triaseData.triage_status === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleTriaseChange('triage_status', opt.key)}
                  className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer text-xs font-extrabold ${
                    active
                      ? `${opt.activeBg} shadow-xs scale-105`
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 space-y-5 text-xs bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="block font-extrabold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs">1. Kesadaran Pasien :</span>
              <div className="space-y-1.5">
                {['Sadar', 'Kesadaran menurun', 'Tidak sadar', 'Gelisah'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium hover:text-slate-900">
                    <input
                      type="radio"
                      name="triage_kesadaran"
                      checked={triaseData.triage_kesadaran === opt}
                      onChange={() => handleTriaseChange('triage_kesadaran', opt)}
                      className="accent-rose-600 h-3.5 w-3.5"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="block font-extrabold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs">2. Pernafasan :</span>
              <div className="space-y-1.5">
                {['Normal', 'Sesak', 'Sumbatan jln nafas', 'Tidak bernafas'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium hover:text-slate-900">
                    <input
                      type="radio"
                      name="triage_pernafasan"
                      checked={triaseData.triage_pernafasan === opt}
                      onChange={() => handleTriaseChange('triage_pernafasan', opt)}
                      className="accent-rose-600 h-3.5 w-3.5"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="block font-extrabold text-slate-800 mb-2 border-b border-slate-100 pb-1 text-xs">3. Sirkulasi Darah :</span>
              <div className="space-y-1.5">
                {['Nadi normal', 'Aritmia', 'Henti jantung', 'Perdarahan'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium hover:text-slate-900">
                    <input
                      type="radio"
                      name="triage_sirkulasi"
                      checked={triaseData.triage_sirkulasi === opt}
                      onChange={() => handleTriaseChange('triage_sirkulasi', opt)}
                      className="accent-rose-600 h-3.5 w-3.5"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <label className="block font-extrabold text-slate-800 mb-1 border-b border-slate-100 pb-1 text-xs">PERTOLONGAN PERTAMA JAM:</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="time"
                  value={triaseData.first_aid_time || ''}
                  onChange={(e) => handleTriaseChange('first_aid_time', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
                />
                <span className="text-slate-600 font-extrabold text-xs">WIB</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-rose-50/70 to-red-50/40 rounded-2xl border border-rose-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-rose-700" />
              <span className="font-black text-rose-950 uppercase text-xs tracking-wider">TINDAKAN RESUSITASI AWAL</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                <span className="block font-bold text-slate-800 mb-1.5">1. Jalan Nafas :</span>
                <div className="space-y-1">
                  {['Hyperekstensi', 'Bersihkan jalan nafas', 'Intubasi'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={(triaseData.resus_airway || []).includes(opt)}
                        onChange={(e) => {
                          const list = triaseData.resus_airway || [];
                          const updated = e.target.checked ? [...list, opt] : list.filter((i: string) => i !== opt);
                          handleTriaseChange('resus_airway', updated);
                        }}
                        className="rounded accent-rose-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                <span className="block font-bold text-slate-800 mb-1.5">2. Bantuan Nafas (Breathing) :</span>
                <div className="space-y-1">
                  {['Mulut ke mulut', 'Bag and Mask', 'Bag and Tube'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={(triaseData.resus_breathing || []).includes(opt)}
                        onChange={(e) => {
                          const list = triaseData.resus_breathing || [];
                          const updated = e.target.checked ? [...list, opt] : list.filter((i: string) => i !== opt);
                          handleTriaseChange('resus_breathing', updated);
                        }}
                        className="rounded accent-rose-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-rose-100">
                <span className="block font-bold text-slate-800 mb-1.5">3. Sirkulasi :</span>
                <div className="space-y-1">
                  {['Massage jantung luar', 'Balut tekan', 'Operasi'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={(triaseData.resus_circulation || []).includes(opt)}
                        onChange={(e) => {
                          const list = triaseData.resus_circulation || [];
                          const updated = e.target.checked ? [...list, opt] : list.filter((i: string) => i !== opt);
                          handleTriaseChange('resus_circulation', updated);
                        }}
                        className="rounded accent-rose-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-slate-100 via-rose-50/30 to-slate-100 px-5 py-3 text-slate-800 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-rose-600" />
            ANAMNESIS & RIWAYAT PASIEN UGD
          </span>
          <span className="text-[11px] italic font-semibold text-slate-500">
            Jika cidera / kecelakaan jelaskan juga mekanisme cideranya
          </span>
        </div>
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-extrabold uppercase text-slate-700 mb-1.5">KELUHAN UTAMA & KRONOLOGI :</label>
            <textarea
              rows={3}
              value={entryDetail.complaint || ''}
              onChange={(e) => onUpdateDetailField(type, 'complaint', e.target.value)}
              placeholder="Contoh: Pasien mengeluh nyeri dada mendadak sejak 1 jam SMRS, disertai sesak nafas..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 focus:outline-hidden font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1">RIWAYAT PENYAKIT :</label>
              <input
                type="text"
                value={triaseData.riwayat_penyakit || ''}
                onChange={(e) => handleTriaseChange('riwayat_penyakit', e.target.value)}
                placeholder="Contoh: Hipertensi (+), DM Type 2 (+)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-600 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1">RIWAYAT PENGOBATAN :</label>
              <input
                type="text"
                value={triaseData.riwayat_pengobatan || ''}
                onChange={(e) => handleTriaseChange('riwayat_pengobatan', e.target.value)}
                placeholder="Contoh: Amlodipin 10mg 1x1, Metformin 500mg 2x1"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-rose-600 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-700 mb-1">RIWAYAT ALERGI :</label>
              <div className="flex items-center gap-3 mb-1.5">
                {['Tidak', 'Ya'].map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="has_allergy"
                      checked={triaseData.has_allergy === opt}
                      onChange={() => handleTriaseChange('has_allergy', opt)}
                      className="accent-rose-600"
                    />
                    <span>{opt === 'Tidak' ? 'Tidak Ada Alergi' : 'Ada Alergi'}</span>
                  </label>
                ))}
              </div>
              {triaseData.has_allergy === 'Ya' && (
                <input
                  type="text"
                  value={triaseData.allergy_note || ''}
                  onChange={(e) => handleTriaseChange('allergy_note', e.target.value)}
                  placeholder="Sebutkan obat/makanan (misal: Penisilin, Udang)"
                  className="w-full rounded-xl border border-rose-300 bg-rose-50/50 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden font-medium"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="bg-gradient-to-r from-slate-100 via-sky-50/30 to-slate-100 px-5 py-3 text-slate-800 flex items-center justify-between border-b border-slate-200">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">PEMERIKSAAN JASMANI & VITAL SIGNS</span>
          <span className="text-[11px] font-extrabold text-slate-600">Skala Nyeri Pasien (0 - 10)</span>
        </div>

        <div className="p-5 space-y-5 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="block font-bold text-slate-800 uppercase text-[11px]">Skala GCS & Kesadaran :</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyGcsPreset(4, 5, 6, 'Compos Mentis')}
                    className="text-[10px] font-extrabold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1"
                    title="Isi GCS 15 Normal"
                  >
                    <Zap className="h-2.5 w-2.5" /> GCS 15
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">E (Eye)</label>
                  <input
                    type="text"
                    value={triaseData.gcs_e || ''}
                    onChange={(e) => handleTriaseChange('gcs_e', e.target.value)}
                    placeholder="4"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">V (Verbal)</label>
                  <input
                    type="text"
                    value={triaseData.gcs_v || ''}
                    onChange={(e) => handleTriaseChange('gcs_v', e.target.value)}
                    placeholder="5"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">M (Motorik)</label>
                  <input
                    type="text"
                    value={triaseData.gcs_m || ''}
                    onChange={(e) => handleTriaseChange('gcs_m', e.target.value)}
                    placeholder="6"
                    className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Σ (Total)</label>
                  <input
                    type="text"
                    readOnly
                    value={totalGCS > 0 ? totalGCS : ''}
                    placeholder="15"
                    className="w-full text-center rounded-lg border border-rose-300 bg-rose-50 py-1 font-black text-rose-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-slate-500">Status Kesadaran :</label>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleTriaseChange('kesadaran_text', 'Compos Mentis')}
                      className="hover:text-teal-700 underline cursor-pointer"
                    >
                      Compos Mentis
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleTriaseChange('kesadaran_text', 'Somnolen')}
                      className="hover:text-amber-700 underline cursor-pointer"
                    >
                      Somnolen
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={triaseData.kesadaran_text || ''}
                  onChange={(e) => handleTriaseChange('kesadaran_text', e.target.value)}
                  placeholder="Contoh: Compos Mentis"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="block font-bold text-slate-800 uppercase text-[11px]">Vital Signs :</span>
                <button
                  type="button"
                  onClick={() => applyVitalSignPreset('normal')}
                  className="text-[10px] font-extrabold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1"
                  title="Isi Tanda Vital Normal"
                >
                  <Zap className="h-2.5 w-2.5" /> Vital Normal
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Resp Rate (x/mnt)</label>
                  <input
                    type="number"
                    value={vs.rr || ''}
                    onChange={(e) => handleVitalSignChange('rr', e.target.value)}
                    placeholder="20"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Nadi (x/mnt)</label>
                  <input
                    type="number"
                    value={vs.pulse || ''}
                    onChange={(e) => handleVitalSignChange('pulse', e.target.value)}
                    placeholder="80"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Tek. Darah (mmHg)</label>
                  <input
                    type="text"
                    value={vs.systolic && vs.diastolic ? `${vs.systolic}/${vs.diastolic}` : vs.systolic || ''}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      handleVitalSignChange('systolic', parts[0] || '');
                      if (parts[1] !== undefined) handleVitalSignChange('diastolic', parts[1]);
                    }}
                    placeholder="120/80"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500">Suhu (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vs.temp || ''}
                    onChange={(e) => handleVitalSignChange('temp', e.target.value)}
                    placeholder="36.5"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-800">
                  PAIN ASSESSMENT TOOL
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500">Skala Nyeri:</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={triaseData.pain_score ?? 0}
                    onChange={(e) => handleTriaseChange('pain_score', Math.min(10, Math.max(0, Number(e.target.value))))}
                    className="w-12 text-center rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-xs font-black py-0.5 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const active = Number(triaseData.pain_score) === score;
                  let badgeColor = 'bg-emerald-500 text-white';
                  if (score >= 1 && score <= 3) badgeColor = 'bg-emerald-400 text-slate-900';
                  if (score >= 4 && score <= 6) badgeColor = 'bg-amber-400 text-slate-900';
                  if (score >= 7 && score <= 9) badgeColor = 'bg-orange-500 text-white';
                  if (score === 10) badgeColor = 'bg-rose-600 text-white';

                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleTriaseChange('pain_score', score)}
                      className={`h-7 w-7 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
                        active ? `${badgeColor} ring-2 ring-slate-900 scale-110 shadow-xs` : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-500 pt-0.5">
                <span>0: No Pain</span>
                <span>1-3: Mild</span>
                <span>4-6: Mod</span>
                <span>7-9: Sev</span>
                <span>10: Worst</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="block font-extrabold text-slate-800 uppercase text-[11px]">
                Pemeriksaan Organ Head to Toe :
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseVitalSigns(entryDetail.igd_triase_data);
                    const organs = ['kepala', 'mata', 'telinga', 'hidung', 'mulut', 'gigi', 'tenggorokan', 'leher', 'dada', 'jantung', 'paru', 'abdomen', 'genetalia', 'kandungan', 'ekstremitas_atas', 'ekstremitas_bawah'];
                    const updated = { ...current };
                    organs.forEach((o) => {
                      updated[`organ_${o}`] = 'dbn (dalam batas normal)';
                    });
                    onUpdateDetailField(type, 'igd_triase_data', JSON.stringify(updated));
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Set Semua Normal (DBN)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
              <div className="space-y-2">
                {[
                  { key: 'kepala', label: 'Kepala', example: 'dbn / Jejas (-)' },
                  { key: 'mata', label: 'Mata', example: 'dbn / Anemis (-/-)' },
                  { key: 'telinga', label: 'Telinga', example: 'dbn / Otore (-/-)' },
                  { key: 'hidung', label: 'Hidung', example: 'dbn / Epistaksis (-)' },
                  { key: 'mulut', label: 'Mulut', example: 'dbn / Sianosis (-)' },
                  { key: 'gigi', label: 'Gigi', example: 'dbn / Caries (-)' },
                  { key: 'tenggorokan', label: 'Tenggorokan', example: 'dbn / T1-T1' },
                  { key: 'leher', label: 'Leher', example: 'dbn / JVP meningkat (-)' },
                  { key: 'dada', label: 'Dada', example: 'dbn / Simetris (+)' },
                  { key: 'jantung', label: 'Jantung', example: 'dbn / S1 S2 tunggal' },
                ].map((organ) => (
                  <div key={organ.key} className="flex items-center gap-2">
                    <label className="w-24 text-[11px] font-semibold text-slate-700 shrink-0">{organ.label} :</label>
                    <input
                      type="text"
                      value={triaseData[`organ_${organ.key}`] || ''}
                      onChange={(e) => handleTriaseChange(`organ_${organ.key}`, e.target.value)}
                      placeholder={`Contoh: ${organ.example}`}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:outline-hidden focus:border-rose-600 font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleTriaseChange(`organ_${organ.key}`, 'dbn (dalam batas normal)')}
                      className="text-[10px] font-extrabold text-teal-700 hover:text-emerald-800 bg-teal-50 hover:bg-emerald-100 border border-teal-200 px-2 py-0.5 rounded-xs cursor-pointer shrink-0 transition"
                      title="Set DBN"
                    >
                      dbn
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { key: 'paru', label: 'Paru', example: 'dbn / Vesikuler (+/+)' },
                  { key: 'abdomen', label: 'Abdomen', example: 'dbn / Supel, BU (+)' },
                  { key: 'genetalia', label: 'Genetalia', example: 'dbn / Kelainan (-)' },
                  { key: 'kandungan', label: 'Kandungan', example: 'dbn / TFU DBN' },
                  { key: 'ekstremitas_atas', label: 'Ekstremitas atas', example: 'dbn / Akral hangat' },
                  { key: 'ekstremitas_bawah', label: 'Ekstremitas bawah', example: 'dbn / Edema (-/-)' },
                ].map((organ) => (
                  <div key={organ.key} className="flex items-center gap-2">
                    <label className="w-32 text-[11px] font-semibold text-slate-700 shrink-0">{organ.label} :</label>
                    <input
                      type="text"
                      value={triaseData[`organ_${organ.key}`] || ''}
                      onChange={(e) => handleTriaseChange(`organ_${organ.key}`, e.target.value)}
                      placeholder={`Contoh: ${organ.example}`}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:outline-hidden focus:border-rose-600 font-medium text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleTriaseChange(`organ_${organ.key}`, 'dbn (dalam batas normal)')}
                      className="text-[10px] font-extrabold text-teal-700 hover:text-emerald-800 bg-teal-50 hover:bg-emerald-100 border border-teal-200 px-2 py-0.5 rounded-xs cursor-pointer shrink-0 transition"
                      title="Set DBN"
                    >
                      dbn
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-5 py-2 text-slate-600 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold border-t border-slate-200">
          <span>FORM GAWAT DARURAT MEDIS</span>
          <span>No. Dokumen : 045/IRM/Rev0/2016</span>
          <span>Halaman 1</span>
        </div>
      </div>
    </div>
  );
}

export function UgdDischargeSummary({
  field,
  entryDetail,
  type,
  onUpdateDetailField,
  onNavigateToRanap,
  onEnsureRanapStep,
  onNavigateToRujuk,
  onEnsureRujukStep,
  onNavigateToDeath,
  onEnsureDeathStep,
}: any) {
  const currentObj = (() => {
    try {
      return typeof entryDetail[field.name] === 'string' ? JSON.parse(entryDetail[field.name]) : entryDetail[field.name] || {};
    } catch {
      return { status: entryDetail[field.name] || '' };
    }
  })();

  const isMatch = (val1: any, val2: any) => {
    if (!val1 || !val2) return false;
    if (val1 === val2) return true;
    const s1 = String(val1).toLowerCase().trim();
    const s2 = String(val2).toLowerCase().trim();
    if (s1 === s2) return true;
    if (s1.includes('membaik') && s2.includes('membaik')) return true;
    if (s1.includes('inap') && s2.includes('inap')) return true;
    if (s1.includes('rujuk') && s2.includes('rujuk')) return true;
    if ((s1.includes('meninggal') || s1.includes('mati')) && (s2.includes('meninggal') || s2.includes('mati'))) return true;
    return false;
  };

  const currentStatus = (() => {
    const raw = currentObj?.status || entryDetail?.discharge_status || entryDetail?.status;
    if (Array.isArray(raw)) return raw[0] || 'Membaik';
    if (typeof raw === 'string' && raw.trim()) return raw;
    return 'Membaik';
  })();

  const updateStatus = (key: string, val: any) => {
    const updated = { ...currentObj, [key]: val };
    onUpdateDetailField?.(type, field.name, JSON.stringify(updated));
    if (key === 'status') {
      onUpdateDetailField?.(type, 'discharge_status', val);
      onUpdateDetailField?.(type, 'status', val);
      if (isMatch(val, 'Rawat Inap')) {
        onEnsureRanapStep?.();
      } else if (isMatch(val, 'Rujuk ke Faskes Lain')) {
        onEnsureRujukStep?.();
      } else if (isMatch(val, 'Meninggal')) {
        onEnsureDeathStep?.();
      }
    }
  };

  return (
    <div key={field.name} className="space-y-4 rounded-2xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-slate-50 p-5 font-sans shadow-2xs">
      <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950">{field.label}</label>

      <div>
        <span className="block text-xs font-bold text-slate-700 mb-2">Kondisi Akhir Pasien UGD :</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { value: 'Membaik', label: 'Membaik / Pulang' },
            { value: 'Rawat Inap', label: 'Rawat Inap' },
            { value: 'Rujuk ke Faskes Lain', label: 'Rujuk Faskes Lain' },
            { value: 'Meninggal', label: 'Meninggal Dunia' },
          ].map((opt) => {
            const isSelected = isMatch(currentStatus, opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateStatus('status', opt.value)}
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-300 font-black'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {isMatch(currentStatus, 'Rawat Inap') && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 flex items-center justify-between">
          <span>Formulir Rawat Inap telah diaktifkan pada tahapan pelayanan rekam medis.</span>
          {onNavigateToRanap && (
            <button
              type="button"
              onClick={() => onNavigateToRanap?.()}
              className="px-3 py-1 bg-purple-800 text-white rounded-lg font-bold text-[11px] hover:bg-purple-900 transition cursor-pointer"
            >
              Buka Form Ranap &rarr;
            </button>
          )}
        </div>
      )}

      {isMatch(currentStatus, 'Rujuk ke Faskes Lain') && (
        <div className="space-y-3 pt-3 border-t border-purple-100">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center justify-between">
            <span>Formulir Rujukan Medis (FormRujuk) telah diaktifkan pada tahapan pelayanan rekam medis.</span>
            {onNavigateToRujuk && (
              <button
                type="button"
                onClick={() => onNavigateToRujuk?.()}
                className="px-3 py-1 bg-indigo-800 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-900 transition cursor-pointer"
              >
                Buka Form Rujuk &rarr;
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Sarana Transportasi Rujukan</label>
              <select
                value={currentObj.transport || 'Ambulans'}
                onChange={(e) => updateStatus('transport', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600 cursor-pointer"
              >
                <option value="Ambulans">Ambulans Faskes / IGD</option>
                <option value="Kendaraan Pribadi">Kendaraan Pribadi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Faskes Tujuan Rujukan</label>
              <input
                type="text"
                value={currentObj.target_facility || ''}
                onChange={(e) => updateStatus('target_facility', e.target.value)}
                placeholder="Contoh: RSUD Dr. Soetomo / RS Tipe A"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>
        </div>
      )}

      {isMatch(currentStatus, 'Meninggal') && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 flex items-center justify-between">
          <span>Formulir Surat Keterangan Kematian (DeathCertificate) telah diaktifkan pada tahapan pelayanan rekam medis.</span>
          {onNavigateToDeath && (
            <button
              type="button"
              onClick={() => onNavigateToDeath?.()}
              className="px-3 py-1 bg-rose-800 text-white rounded-lg font-bold text-[11px] hover:bg-rose-900 transition cursor-pointer"
            >
              Buka Surat Kematian &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FormIGD(props: any) {
  return (
    <div className="space-y-6">
      <IgdTriaseForm {...props} />
      <UgdDischargeSummary {...props} field={{ name: 'ugd_discharge_status', label: 'Ringkasan Kondisi Sebelum Meninggalkan UGD' }} />
    </div>
  );
}
