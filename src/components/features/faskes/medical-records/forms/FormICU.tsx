"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  HeartPulse,
  Thermometer,
  ShieldCheck,
  FileText,
  CheckCircle2,
  User,
  Stethoscope,
  Building2,
  Wind,
  Droplets,
  AlertCircle,
  ArrowRight,
  PenTool,
  CheckSquare,
  Square,
  FileCheck2,
} from "lucide-react";
import DigitalSignatureCanvas from "@/components/ui/DigitalSignatureCanvas";
import DischargeSummary from "./DischargeSummary";
import { createOrUpdateSupportTestRequest } from "@/services/supportTestStorage";

export default function FormICU({
  entryDetail = {} as any,
  type = "icu",
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
  onNavigateToRujuk,
  onNavigateToDeath,
  onEnsureRanapStep,
  includeObat,
  onToggleIncludeObat,
}: any) {
  // Auto-synced Patient Information
  const patientName =
    selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
  const noRM =
    selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";

  // Auto-synced Doctor Information
  const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.dpjp_doctor || "";
  const hospitalName = selectedDoctor?.hospital_name || "Fasilitas Kesehatan / Rumah Sakit";

  const handleFieldChange = (field: string, value: any) => {
    onUpdateDetailField(type, field, value);
  };

  // Calculate MAP
  const calculateMAP = (sysStr: string, diaStr: string) => {
    const sys = Number(sysStr);
    const dia = Number(diaStr);
    if (sys > 0 && dia > 0) {
      return Math.round((sys + 2 * dia) / 3).toString();
    }
    return "";
  };

  // Helper for toggle checkbox
  const toggleCheckbox = (field: string, optionValue: string) => {
    const current = entryDetail[field] || "";
    if (current === optionValue) {
      handleFieldChange(field, "");
    } else {
      handleFieldChange(field, optionValue);
    }
  };

  return (
    <div className="space-y-6 font-sans border-2 border-red-600 rounded-3xl bg-white p-5 md:p-8 shadow-xl">
      {/* RED HEADER BANNER (FORMULIR KRITERIA PASIEN MASUK ICU) */}
      <div className="bg-red-600 text-white rounded-2xl p-4 md:p-6 text-center shadow-md">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Activity className="h-6 w-6 text-white animate-pulse" />
          <h1 className="text-lg md:text-2xl font-black uppercase tracking-wider">
            FORMULIR KRITERIA PASIEN MASUK ICU
          </h1>
        </div>
        <p className="text-xs font-semibold text-red-100 uppercase tracking-widest">
          Dokumen Rekam Medis Resmi Penilaian &amp; Triase Perawatan Kritis ICU
        </p>
      </div>

      {/* HEADER INFO (ASAL RUANG KONSUL, DOKTER KONSUL, DIAGNOSIS MEDIS) */}
      <div className="grid gap-4 md:grid-cols-3 bg-red-50/50 p-4 rounded-2xl border border-red-200">
        <div>
          <label className="block text-xs font-black uppercase text-slate-800 mb-1">
            Asal Ruang Konsul :
          </label>
          <input
            type="text"
            value={entryDetail.consul_room_origin || ""}
            onChange={(e) => handleFieldChange("consul_room_origin", e.target.value)}
            placeholder="Contoh: IGD / Kamar Operasi / Bangsal Flamboyan..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-800 mb-1">
            Dokter Yang Meminta Konsul :
          </label>
          <input
            type="text"
            value={entryDetail.consul_doctor_name || doctorName || ""}
            onChange={(e) => handleFieldChange("consul_doctor_name", e.target.value)}
            placeholder="Nama Dokter Pengonsul..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase text-slate-800 mb-1">
            Diagnosis Medis :
          </label>
          <input
            type="text"
            value={entryDetail.medical_diagnosis || ""}
            onChange={(e) => handleFieldChange("medical_diagnosis", e.target.value)}
            placeholder="Diagnosis medis utama..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
          />
        </div>
      </div>

      {/* BAGIAN 1: KRITERIA PASIEN MASUK BERDASAR DIAGNOSIS */}
      <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-4">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Kriteria Pasien Masuk Berdasar Diagnosis
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Kolom Kiri */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_cardiovascular}
                  onChange={(e) => handleFieldChange("crit_cardiovascular", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Sistem Kardiovaskuler :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_cardiovascular === "Aktif" ? "" : entryDetail.crit_cardiovascular || ""}
                onChange={(e) => handleFieldChange("crit_cardiovascular", e.target.value)}
                placeholder="Keterangan kardiovaskuler (Infark miokard, syok kardiogenik)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_respiratory}
                  onChange={(e) => handleFieldChange("crit_respiratory", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Sistem Pernafasan :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_respiratory === "Aktif" ? "" : entryDetail.crit_respiratory || ""}
                onChange={(e) => handleFieldChange("crit_respiratory", e.target.value)}
                placeholder="Keterangan pernafasan (Gagal napas, ARDS, gagal napas akut)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_neurological}
                  onChange={(e) => handleFieldChange("crit_neurological", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Penyakit Neurologis :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_neurological === "Aktif" ? "" : entryDetail.crit_neurological || ""}
                onChange={(e) => handleFieldChange("crit_neurological", e.target.value)}
                placeholder="Keterangan neurologis (Stroke hemoragik, cedera kepala berat)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_overdose}
                  onChange={(e) => handleFieldChange("crit_overdose", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Overdosis / Keracunan Obat :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_overdose === "Aktif" ? "" : entryDetail.crit_overdose || ""}
                onChange={(e) => handleFieldChange("crit_overdose", e.target.value)}
                placeholder="Detail racun / overdosis obat..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_gastrointestinal}
                  onChange={(e) => handleFieldChange("crit_gastrointestinal", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Penyakit Gastrointestinal :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_gastrointestinal === "Aktif" ? "" : entryDetail.crit_gastrointestinal || ""}
                onChange={(e) => handleFieldChange("crit_gastrointestinal", e.target.value)}
                placeholder="Keterangan gastrointestinal (Perdarahan masif, peritonitis)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_endocrine}
                  onChange={(e) => handleFieldChange("crit_endocrine", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Endokrin :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_endocrine === "Aktif" ? "" : entryDetail.crit_endocrine || ""}
                onChange={(e) => handleFieldChange("crit_endocrine", e.target.value)}
                placeholder="Keterangan endokrin (Ketoasidosis diabetikum, krisis tiroid)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_surgical}
                  onChange={(e) => handleFieldChange("crit_surgical", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Bedah :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_surgical === "Aktif" ? "" : entryDetail.crit_surgical || ""}
                onChange={(e) => handleFieldChange("crit_surgical", e.target.value)}
                placeholder="Keterangan bedah (Pasca laparatomi, bedah toraks)..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-extrabold text-slate-800 mb-1">
                <input
                  type="checkbox"
                  checked={!!entryDetail.crit_others}
                  onChange={(e) => handleFieldChange("crit_others", e.target.checked ? "Aktif" : "")}
                  className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Lain-lain :</span>
              </label>
              <input
                type="text"
                value={entryDetail.crit_others === "Aktif" ? "" : entryDetail.crit_others || ""}
                onChange={(e) => handleFieldChange("crit_others", e.target.value)}
                placeholder="Kriteria diagnosis lainnya..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN 2: KRITERIA PASIEN MASUK BERDASAR PARAMETER OBJEKTIF */}
      <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-5">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Kriteria Pasien Masuk Berdasar Parameter Objektif
        </h2>

        {/* 1. KESADARAN & GCS */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-black uppercase text-slate-900">1. Kesadaran</div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-800">
            {["Compos mentis", "Apatis", "Somnolen", "Sopor", "Sopor Coma", "Coma"].map((level) => (
              <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="consciousness_level"
                  value={level}
                  checked={entryDetail.consciousness_level === level}
                  onChange={(e) => handleFieldChange("consciousness_level", e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-extrabold text-slate-900">GCS :</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">E</span>
              <input
                type="number"
                min="1"
                max="4"
                value={entryDetail.gcs_e || ""}
                onChange={(e) => handleFieldChange("gcs_e", e.target.value)}
                placeholder="1-4"
                className="w-12 rounded-lg border border-slate-300 p-1 text-center text-xs font-bold text-slate-900 focus:outline-none"
              />
              <span className="text-xs font-bold text-slate-600">M</span>
              <input
                type="number"
                min="1"
                max="6"
                value={entryDetail.gcs_m || ""}
                onChange={(e) => handleFieldChange("gcs_m", e.target.value)}
                placeholder="1-6"
                className="w-12 rounded-lg border border-slate-300 p-1 text-center text-xs font-bold text-slate-900 focus:outline-none"
              />
              <span className="text-xs font-bold text-slate-600">V</span>
              <input
                type="number"
                min="1"
                max="5"
                value={entryDetail.gcs_v || ""}
                onChange={(e) => handleFieldChange("gcs_v", e.target.value)}
                placeholder="1-5"
                className="w-12 rounded-lg border border-slate-300 p-1 text-center text-xs font-bold text-slate-900 focus:outline-none"
              />
              {(entryDetail.gcs_e || entryDetail.gcs_m || entryDetail.gcs_v) && (
                <span className="text-xs font-black text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  Total GCS: {(Number(entryDetail.gcs_e || 0) + Number(entryDetail.gcs_m || 0) + Number(entryDetail.gcs_v || 0))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. TANDA VITAL */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-black uppercase text-slate-900">2. Tanda Vital</div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">TD (Tekanan Darah) :</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={entryDetail.blood_pressure_td || ""}
                  onChange={(e) => {
                    handleFieldChange("blood_pressure_td", e.target.value);
                    const parts = e.target.value.split("/");
                    if (parts.length === 2) {
                      const computedMap = calculateMAP(parts[0], parts[1]);
                      if (computedMap) handleFieldChange("map_val", computedMap);
                    }
                  }}
                  placeholder="120/80"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">mmHg</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">MAP :</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={entryDetail.map_val || ""}
                  onChange={(e) => handleFieldChange("map_val", e.target.value)}
                  placeholder="93"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">mmHg</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">HR (Heart Rate) :</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={entryDetail.heart_rate_hr || ""}
                  onChange={(e) => handleFieldChange("heart_rate_hr", e.target.value)}
                  placeholder="80"
                  className="w-24 rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">x/menit</span>
                <select
                  value={entryDetail.hr_regularity || "regular"}
                  onChange={(e) => handleFieldChange("hr_regularity", e.target.value)}
                  className="rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="regular">regular</option>
                  <option value="irreguler">irreguler</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">RR (Respiratory Rate) :</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={entryDetail.respiratory_rate_rr || ""}
                  onChange={(e) => handleFieldChange("respiratory_rate_rr", e.target.value)}
                  placeholder="20"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">x/menit</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">SpO2 :</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={entryDetail.spo2_val || ""}
                  onChange={(e) => handleFieldChange("spo2_val", e.target.value)}
                  placeholder="98"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. NILAI LABORATORIUM */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-black uppercase text-slate-900">3. Nilai Laboratorium</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">Glukosa :</span>
                <input
                  type="text"
                  value={entryDetail.lab_glucose || ""}
                  onChange={(e) => handleFieldChange("lab_glucose", e.target.value)}
                  placeholder="mg/dl"
                  className="flex-1 rounded-xl border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">mg/dl</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">Ureum :</span>
                <input
                  type="text"
                  value={entryDetail.lab_ureum || ""}
                  onChange={(e) => handleFieldChange("lab_ureum", e.target.value)}
                  placeholder="mg/dl"
                  className="flex-1 rounded-xl border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">mg/dl</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">Kreatinin :</span>
                <input
                  type="text"
                  value={entryDetail.lab_creatinine || ""}
                  onChange={(e) => handleFieldChange("lab_creatinine", e.target.value)}
                  placeholder="mg/dl"
                  className="flex-1 rounded-xl border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">mg/dl</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">Natrium :</span>
                <input
                  type="text"
                  value={entryDetail.lab_sodium || ""}
                  onChange={(e) => handleFieldChange("lab_sodium", e.target.value)}
                  placeholder="mEq/L"
                  className="flex-1 rounded-xl border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">mEq/L</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">Kalium :</span>
                <input
                  type="text"
                  value={entryDetail.lab_potassium || ""}
                  onChange={(e) => handleFieldChange("lab_potassium", e.target.value)}
                  placeholder="mEq/L"
                  className="flex-1 rounded-xl border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">mEq/L</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 w-24">Lain-lain :</span>
                <input
                  type="text"
                  value={entryDetail.lab_others || ""}
                  onChange={(e) => handleFieldChange("lab_others", e.target.value)}
                  placeholder="Lab tambahan..."
                  className="flex-1 rounded-xl border border-slate-300 p-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4, 5, 6, 7. RADIOLOGI, EKG, SINDROM KORONER AKUT, SKOR APACHE */}
        <div className="grid gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-black uppercase text-slate-900 mb-1">
              4. Radiologi :
            </label>
            <input
              type="text"
              value={entryDetail.radiology_result || ""}
              onChange={(e) => handleFieldChange("radiology_result", e.target.value)}
              placeholder="Hasil rontgen thoraks / CT-scan..."
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-900 mb-1">
              5. Elektrokardiogram (EKG) :
            </label>
            <input
              type="text"
              value={entryDetail.ecg_result || ""}
              onChange={(e) => handleFieldChange("ecg_result", e.target.value)}
              placeholder="Hasil interpretasi EKG..."
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase text-slate-900">
                6. Pasien Sindrom Koroner Akut (SKA) :
              </span>
              <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="is_acute_coronary_syndrome"
                  value="Ya"
                  checked={entryDetail.is_acute_coronary_syndrome === "Ya"}
                  onChange={(e) => handleFieldChange("is_acute_coronary_syndrome", e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Ya</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="is_acute_coronary_syndrome"
                  value="Tidak"
                  checked={entryDetail.is_acute_coronary_syndrome === "Tidak"}
                  onChange={(e) => handleFieldChange("is_acute_coronary_syndrome", e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Tidak</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-900">7. Skor APACHE :</span>
              <input
                type="text"
                value={entryDetail.apache_score || ""}
                onChange={(e) => handleFieldChange("apache_score", e.target.value)}
                placeholder="Skor..."
                className="w-32 rounded-xl border border-slate-300 p-1.5 text-xs font-bold text-slate-900 focus:outline-none text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN 3: KESIMPULAN PRIORITAS PASIEN MASUK & PROGNOSA */}
      <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-4">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Kesimpulan Prioritas Pasien Masuk &amp; Prognosa
        </h2>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-black uppercase text-slate-900">
            Kesimpulan Prioritas Pasien Masuk :
          </label>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-800">
            {[
              "Prioritas 1",
              "Prioritas 2",
              "Prioritas 3",
              "Prioritas 4/Pengecualian",
              "Tidak ada indikasi masuk",
            ].map((prio) => (
              <label key={prio} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="priority_conclusion"
                  value={prio}
                  checked={entryDetail.priority_conclusion === prio}
                  onChange={(e) => handleFieldChange("priority_conclusion", e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>{prio}</span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-black uppercase text-slate-900 mb-1">
              Prognosa :
            </label>
            <input
              type="text"
              value={entryDetail.prognosis || ""}
              onChange={(e) => handleFieldChange("prognosis", e.target.value)}
              placeholder="Contoh: Dubia ad bonam / Dubia ad malam..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* BAGIAN 4: TINDAK LANJUT */}
      <div className="border border-slate-300 rounded-2xl p-5 bg-slate-50/50 space-y-4">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Tindak Lanjut
        </h2>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs font-bold text-slate-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="follow_up_action"
              value="Pasien dirawat di ruang ICU RS"
              checked={entryDetail.follow_up_action === "Pasien dirawat di ruang ICU RS"}
              onChange={(e) => handleFieldChange("follow_up_action", e.target.value)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span>Pasien dirawat di ruang ICU RS ({hospitalName})</span>
          </label>

          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="follow_up_action"
                value="Pasien dirawat di ruang ICU di luar RS"
                checked={entryDetail.follow_up_action === "Pasien dirawat di ruang ICU di luar RS"}
                onChange={(e) => handleFieldChange("follow_up_action", e.target.value)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span>Pasien dirawat di ruang ICU di luar RS</span>
            </label>
            {entryDetail.follow_up_action === "Pasien dirawat di ruang ICU di luar RS" && (
              <div className="pl-6">
                <input
                  type="text"
                  value={entryDetail.follow_up_reason || ""}
                  onChange={(e) => handleFieldChange("follow_up_reason", e.target.value)}
                  placeholder="Sebutkan Alasan..."
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="follow_up_action"
                value="Pasien dilanjutkan perawatan di ruang rawat inap biasa"
                checked={entryDetail.follow_up_action === "Pasien dilanjutkan perawatan di ruang rawat inap biasa"}
                onChange={(e) => handleFieldChange("follow_up_action", e.target.value)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span>Pasien dilanjutkan perawatan di ruang rawat inap biasa</span>
            </label>
            {entryDetail.follow_up_action === "Pasien dilanjutkan perawatan di ruang rawat inap biasa" && (
              <div className="pl-6">
                <input
                  type="text"
                  value={entryDetail.follow_up_reason || ""}
                  onChange={(e) => handleFieldChange("follow_up_reason", e.target.value)}
                  placeholder="Sebutkan Alasan..."
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISCHARGE SUMMARY ICU */}
      <DischargeSummary
        processName="ICU"
        currentStatus={entryDetail.discharge_status || entryDetail.status || "Membaik"}
        onUpdateStatus={(val) => {
          handleFieldChange("discharge_status", val);
          handleFieldChange("status", val);

          const activeVisitId = visitId || entryDetail.visit_id || "VISIT-20260821-SEDC";
          const pName = selectedPatient?.name || entryDetail.patient_name || "Pasien ICU";
          const nRm = selectedPatient?.mr_number || entryDetail.no_rm || "RM-00129";
          const docName = doctorName || "DPJP Intensivis ICU";

          if (val.includes("Rawat Inap") || val === "Rawat Inap") {
            createOrUpdateSupportTestRequest({
              category: "ranap",
              visitId: activeVisitId,
              patientName: pName,
              noRm: nRm,
              requestOrigin: "Intensive Care Unit (ICU)",
              testDetails: "Permintaan Transfer Pasien Keluar ICU ke Bangsal Rawat Inap",
              doctorName: docName,
            });
          } else if (val.includes("Rujuk") || val.includes("Faskes")) {
            createOrUpdateSupportTestRequest({
              category: "rujuk",
              visitId: activeVisitId,
              patientName: pName,
              noRm: nRm,
              requestOrigin: "Intensive Care Unit (ICU)",
              testDetails: "Permintaan Rujukan Medis & Transfer Pasien ICU ke RS Lain",
              doctorName: docName,
            });
          } else if (val.includes("Meninggal") || val === "Meninggal") {
            createOrUpdateSupportTestRequest({
              category: "death",
              visitId: activeVisitId,
              patientName: pName,
              noRm: nRm,
              requestOrigin: "Intensive Care Unit (ICU)",
              testDetails: "Permintaan Verifikasi & Penerbitan Surat Keterangan Kematian Pasien ICU",
              doctorName: docName,
            });
          }
        }}
        onNavigateToRanap={onNavigateToRanap}
        onNavigateToRujuk={onNavigateToRujuk}
        onNavigateToDeath={onNavigateToDeath}
        includeObat={includeObat}
        onToggleIncludeObat={onToggleIncludeObat}
      />

      {/* BAGIAN 5: TANDA TANGAN DPJP RUANG ICU & DOKTER DPJP */}
      <div className="border border-slate-300 rounded-2xl p-5 bg-white space-y-4">
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
          Verifikasi &amp; Tanda Tangan Penanggung Jawab
        </h2>

        <div className="grid gap-6 md:grid-cols-2 pt-2">
          {/* TTD DPJP RUANG ICU */}
          <div className="space-y-3 text-center border p-4 rounded-2xl border-slate-200 bg-slate-50/50">
            <div className="text-xs font-black uppercase text-slate-900">DPJP Ruang ICU</div>
            <input
              type="text"
              value={entryDetail.dpjp_icu_name || doctorName || ""}
              onChange={(e) => handleFieldChange("dpjp_icu_name", e.target.value)}
              placeholder="Nama Lengkap & Gelar DPJP ICU..."
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-center text-slate-900 focus:outline-none"
            />
            <div className="border border-dashed border-slate-300 bg-white rounded-xl p-2">
              <DigitalSignatureCanvas
                value={entryDetail.dpjp_icu_signature}
                onChange={(sig) => handleFieldChange("dpjp_icu_signature", sig)}
                doctorName={entryDetail.dpjp_icu_name || doctorName || ""}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Tanda tangan dan nama lengkap</div>
          </div>

          {/* TTD DOKTER DPJP PENGONSUL */}
          <div className="space-y-3 text-center border p-4 rounded-2xl border-slate-200 bg-slate-50/50">
            <div className="text-xs font-black uppercase text-slate-900">Dokter DPJP (Pengonsul)</div>
            <input
              type="text"
              value={entryDetail.requesting_doctor_name || entryDetail.consul_doctor_name || ""}
              onChange={(e) => handleFieldChange("requesting_doctor_name", e.target.value)}
              placeholder="Nama Lengkap & Gelar Dokter Pengonsul..."
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-center text-slate-900 focus:outline-none"
            />
            <div className="border border-dashed border-slate-300 bg-white rounded-xl p-2">
              <DigitalSignatureCanvas
                value={entryDetail.requesting_doctor_signature}
                onChange={(sig) => handleFieldChange("requesting_doctor_signature", sig)}
                doctorName={entryDetail.requesting_doctor_name || entryDetail.consul_doctor_name || ""}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Tanda tangan dan nama lengkap</div>
          </div>
        </div>
      </div>
    </div>
  );
}
