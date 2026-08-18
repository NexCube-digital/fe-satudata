'use client';

import React from 'react';
import { Pill } from 'lucide-react';

export interface DischargeSummaryProps {
  processName: string; // e.g., "UGD", "Rawat Jalan", "Rawat Inap", "Bedah Sentral", "One Day Care", "Rehab Medik", "Rujukan Medis"
  currentStatus: string;
  onUpdateStatus: (newStatus: string) => void;
  onNavigateToRanap?: () => void;
  onNavigateToRujuk?: () => void;
  onNavigateToDeath?: () => void;
  hideRanapOption?: boolean; // Set to true in FormRanap to remove the Rawat Inap button
  hideRujukOption?: boolean;
  transport?: string;
  onTransportChange?: (val: string) => void;
  targetFacility?: string;
  onTargetFacilityChange?: (val: string) => void;
  includeObat?: boolean;
  onToggleIncludeObat?: (val: boolean) => void;
}

const isMatch = (str1: any, str2: any) => {
  if (!str1 || !str2) return false;
  const s1 = String(str1).toLowerCase().trim();
  const s2 = String(str2).toLowerCase().trim();
  return s1.includes(s2) || s2.includes(s1);
};

export default function DischargeSummary({
  processName,
  currentStatus,
  onUpdateStatus,
  onNavigateToRanap,
  onNavigateToRujuk,
  onNavigateToDeath,
  hideRanapOption = false,
  hideRujukOption = false,
  transport = "Ambulans",
  onTransportChange,
  targetFacility = "",
  onTargetFacilityChange,
  includeObat = false,
  onToggleIncludeObat,
}: DischargeSummaryProps) {
  const options = [
    { value: "Membaik", label: "Membaik / Pulang" },
    ...(!hideRanapOption ? [{ value: "Rawat Inap", label: "Rawat Inap" }] : []),
    ...(!hideRujukOption ? [{ value: "Rujuk ke Faskes Lain", label: "Rujuk Faskes Lain" }] : []),
    { value: "Meninggal", label: "Meninggal Dunia" },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-slate-50 p-5 font-sans shadow-2xs">
      <label className="block text-xs font-extrabold uppercase tracking-wider text-purple-950">
        RINGKASAN KONDISI SEBELUM MENINGGALKAN {processName.toUpperCase()}
      </label>

      <div>
        <span className="block text-xs font-bold text-slate-700 mb-2">
          Kondisi Akhir Pasien {processName} :
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {options.map((opt) => {
            const isSelected = isMatch(currentStatus, opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateStatus(opt.value)}
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-purple-900 text-white border-purple-900 shadow-md ring-2 ring-purple-300 font-black"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner & Trigger Rawat Inap */}
      {isMatch(currentStatus, "Rawat Inap") && !hideRanapOption && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 flex flex-wrap items-center justify-between gap-2">
          <span>Formulir Rawat Inap telah diaktifkan pada tahapan pelayanan rekam medis.</span>
          {onNavigateToRanap && (
            <button
              type="button"
              onClick={() => onNavigateToRanap()}
              className="px-3 py-1.5 bg-purple-800 text-white rounded-lg font-bold text-[11px] hover:bg-purple-900 transition cursor-pointer shadow-xs"
            >
              Buka Form Ranap &rarr;
            </button>
          )}
        </div>
      )}

      {/* Banner & Trigger Rujukan Medis */}
      {isMatch(currentStatus, "Rujuk ke Faskes Lain") && !hideRujukOption && (
        <div className="space-y-3 pt-3 border-t border-purple-100">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex flex-wrap items-center justify-between gap-2">
            <span>Formulir Rujukan Medis (FormRujuk) telah diaktifkan pada tahapan pelayanan rekam medis.</span>
            {onNavigateToRujuk && (
              <button
                type="button"
                onClick={() => onNavigateToRujuk()}
                className="px-3 py-1.5 bg-indigo-800 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-900 transition cursor-pointer shadow-xs"
              >
                Buka Form Rujuk &rarr;
              </button>
            )}
          </div>
          {(onTransportChange || onTargetFacilityChange) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {onTransportChange && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Sarana Transportasi Rujukan
                  </label>
                  <select
                    value={transport}
                    onChange={(e) => onTransportChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Ambulans">Ambulans Faskes / IGD</option>
                    <option value="Kendaraan Pribadi">Kendaraan Pribadi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              )}
              {onTargetFacilityChange && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Faskes Tujuan Rujukan
                  </label>
                  <input
                    type="text"
                    value={targetFacility}
                    onChange={(e) => onTargetFacilityChange(e.target.value)}
                    placeholder="Contoh: RSUD Dr. Soetomo / RS Tipe A"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Banner & Trigger Surat Keterangan Kematian */}
      {isMatch(currentStatus, "Meninggal") && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 flex flex-wrap items-center justify-between gap-2">
          <span>Formulir Surat Keterangan Kematian (DeathCertificate) telah diaktifkan pada tahapan pelayanan rekam medis.</span>
          {onNavigateToDeath && (
            <button
              type="button"
              onClick={() => onNavigateToDeath()}
              className="px-3 py-1.5 bg-rose-800 text-white rounded-lg font-bold text-[11px] hover:bg-rose-900 transition cursor-pointer shadow-xs"
            >
              Buka Surat Kematian &rarr;
            </button>
          )}
        </div>
      )}

      {/* Toggle Sisipkan Obat & Lampiran */}
      {onToggleIncludeObat && (
        <div className="pt-3 border-t border-purple-100 flex flex-wrap items-center justify-between gap-3 bg-purple-50/60 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950">
            <Pill className="h-4 w-4 text-purple-700 shrink-0" />
            <span>Sisipkan Resep Obat & Lampiran Rekam Medis?</span>
          </div>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-purple-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onToggleIncludeObat(true)}
              className={`px-3 py-1 rounded-md text-[11px] font-extrabold transition cursor-pointer ${
                includeObat ? "bg-purple-900 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Ya (Aktif)
            </button>
            <button
              type="button"
              onClick={() => onToggleIncludeObat(false)}
              className={`px-3 py-1 rounded-md text-[11px] font-extrabold transition cursor-pointer ${
                !includeObat ? "bg-slate-700 text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tidak
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
