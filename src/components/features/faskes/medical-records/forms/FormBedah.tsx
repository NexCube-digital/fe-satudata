"use client";

import React, { useState, useMemo } from "react";
import DischargeSummary from "./DischargeSummary";
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
} from "lucide-react";
import { searchICD10, searchICD9 } from "@/data/icdData";

export default function FormBedah({

	entryDetail = {} as any,
	type = "bedah_sentral",
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
	// Search states
	const [icd10PreSearch, setIcd10PreSearch] = useState("");
	const [icd10PreOpen, setIcd10PreOpen] = useState(false);
	const icd10PreResults = useMemo(() => searchICD10(icd10PreSearch), [icd10PreSearch]);

	const [icd10PostSearch, setIcd10PostSearch] = useState("");
	const [icd10PostOpen, setIcd10PostOpen] = useState(false);
	const icd10PostResults = useMemo(() => searchICD10(icd10PostSearch), [icd10PostSearch]);

	const [icd9Search, setIcd9Search] = useState("");
	const [icd9Open, setIcd9Open] = useState(false);
	const icd9Results = useMemo(() => searchICD9(icd9Search), [icd9Search]);

	// Auto-synced Patient & Doctor Info
	const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
	const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";
	const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || "L";
	const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || "";

	const primaryOperatorDoctor = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.operator_doctor || "dr. Bedah Sp.B";
	const primarySpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || "Spesialis Bedah";

	const handleFieldChange = (field, value) => {
		onUpdateDetailField(type, field, value);
	};

	// Parse WHO Checklist Items
	const whoChecklist = useMemo(() => {
		try {
			if (typeof entryDetail.who_checklist === "object" && entryDetail.who_checklist !== null) return entryDetail.who_checklist;
			if (typeof entryDetail.who_checklist === "string") return JSON.parse(entryDetail.who_checklist);
		} catch {
			// fallback
		}
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

	const updateWhoChecklist = (key, value) => {
		const updated = { ...whoChecklist, [key]: value };
		onUpdateDetailField(type, "who_checklist", JSON.stringify(updated));
	};

	// Calculate WHO Safety Index Score
	const whoTotalChecked = Object.values(whoChecklist).filter(Boolean).length;

	return (
		<div className="space-y-6 font-sans text-slate-900">
			{/* HEADER DOKUMEN BEDAH SENTRAL */}
			<div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/90 via-red-50/60 to-slate-50 p-5 text-slate-900 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white font-black shadow-sm">
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

				{/* IDENTITAS PASIEN SINKRON */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-rose-200/80 text-xs">
					<div>
						<span className="block text-[10px] uppercase font-bold text-rose-800">Nama Pasien :</span>
						<span className="font-extrabold text-slate-900 truncate block">{patientName || "Nama Pasien"}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-rose-800">No. Rekam Medis (RM) :</span>
						<span className="font-extrabold text-rose-900">{noRM}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-rose-800">Jenis Kelamin / Tgl Lahir :</span>
						<span className="font-extrabold text-slate-900">{gender === "L" ? "Laki-laki" : "Perempuan"} ({dob || "-"})</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-rose-800">Dokter Operator Utama :</span>
						<span className="font-extrabold text-slate-900 truncate block">{primaryOperatorDoctor}</span>
					</div>
				</div>
			</div>

			{/* FASE 1: PRA-BEDAH / PRE-OPERATIF */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Clock className="h-4 w-4 text-rose-700" />
					FASE 1: PRA-BEDAH / PRE-OPERATIF (SEBELUM MASUK KAMAR OPERASI)
				</span>

				<div className="space-y-4 text-xs">
					{/* Detail Jadwal & Jenis Operasi */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Tanggal & Jam Operasi :
							</label>
							<input
								type="datetime-local"
								value={entryDetail.op_datetime || `${visitDate || "2026-08-13"}T${visitTime || "09:00"}`}
								onChange={(e) => handleFieldChange("op_datetime", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Kamar Operasi (OK No.) :
							</label>
							<select
								value={entryDetail.op_room_number || "OK 1"}
								onChange={(e) => handleFieldChange("op_room_number", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-rose-700 focus:outline-none"
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
									{ key: "Elektif", label: "Elektif / Terencana" },
									{ key: "Cito", label: "Cito / Darurat" },
								].map((opt) => {
									const active = (entryDetail.op_urgency || "Elektif") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="op_urgency"
												checked={active}
												onChange={() => handleFieldChange("op_urgency", opt.key)}
												className="accent-rose-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* Tim Medis Operasi */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Ahli Bedah Utama (Operator) :</label>
							<input
								type="text"
								value={entryDetail.operator_doctor || primaryOperatorDoctor}
								onChange={(e) => handleFieldChange("operator_doctor", e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900"
							/>
						</div>
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Asisten Bedah :</label>
							<input
								type="text"
								value={entryDetail.assistant_doctor || "dr. Asisten Bedah"}
								onChange={(e) => handleFieldChange("assistant_doctor", e.target.value)}
								placeholder="Nama Dokter Asisten..."
								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900"
							/>
						</div>
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Spesialis Anestesi :</label>
							<input
								type="text"
								value={entryDetail.anesthesiologist_doctor || "dr. Sp.An KIC"}
								onChange={(e) => handleFieldChange("anesthesiologist_doctor", e.target.value)}
								placeholder="Nama Dokter Anestesi..."
								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900"
							/>
						</div>
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Penata & Scrub Nurse :</label>
							<input
								type="text"
								value={entryDetail.scrub_nurse || "Ns. Rahma & Penata Anestesi"}
								onChange={(e) => handleFieldChange("scrub_nurse", e.target.value)}
								placeholder="Perawat instrumen..."
								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-bold text-slate-900"
							/>
						</div>
					</div>

					{/* Diagnosis Pre-Op & Rencana ICD-9 */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* ICD-10 Pre Op */}
						<div className="relative">
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Diagnosis Pre-Operasi (Cari ICD-10) :
							</label>
							<div className="relative">
								<input
									type="text"
									value={entryDetail.pre_op_diagnosis || icd10PreSearch}
									onChange={(e) => {
										setIcd10PreSearch(e.target.value);
										setIcd10PreOpen(true);
										handleFieldChange("pre_op_diagnosis", e.target.value);
									}}
									onFocus={() => setIcd10PreOpen(true)}
									placeholder="Cari Diagnosa ICD-10 Pra-Bedah (misal: K35.8 - Appendicitis Acute)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-xs font-bold text-slate-900 focus:border-rose-700 focus:outline-none"
								/>
								<Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
							</div>
							{icd10PreOpen && icd10PreResults.length > 0 && (
								<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
									{icd10PreResults.map((item) => (
										<button
											key={item.code}
											type="button"
											onClick={() => {
												handleFieldChange("pre_op_diagnosis", `${item.code} - ${item.name}`);
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

						{/* ICD-9 Rencana Prosedur */}
						<div className="relative">
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Rencana Prosedur Operasi (Cari ICD-9-CM) :
							</label>
							<div className="relative">
								<input
									type="text"
									value={entryDetail.planned_procedure_icd9 || icd9Search}
									onChange={(e) => {
										setIcd9Search(e.target.value);
										setIcd9Open(true);
										handleFieldChange("planned_procedure_icd9", e.target.value);
									}}
									onFocus={() => setIcd9Open(true)}
									placeholder="Cari Prosedur ICD-9-CM (misal: 47.0 - Appendectomy, 54.1 - Laparotomy)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-xs font-bold text-slate-900 focus:border-rose-700 focus:outline-none"
								/>
								<Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
							</div>
							{icd9Open && icd9Results.length > 0 && (
								<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
									{icd9Results.map((item) => (
										<button
											key={item.code}
											type="button"
											onClick={() => {
												handleFieldChange("planned_procedure_icd9", `${item.code} - ${item.name}`);
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

					{/* Checklists Legal & Evaluasi Pra-Bedah */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
						<span className="block text-[10px] font-black uppercase text-slate-700">
							Dokumen Legal & Evaluasi Persiapan Pra-Bedah :
						</span>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							<label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
								<input
									type="checkbox"
									checked={!!entryDetail.consent_surgery_signed}
									onChange={(e) => handleFieldChange("consent_surgery_signed", e.target.checked)}
									className="accent-rose-700 h-4 w-4"
								/>
								<span>Informed Consent Bedah (Tandatangan)</span>
							</label>

							<label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
								<input
									type="checkbox"
									checked={!!entryDetail.consent_anesthesia_signed}
									onChange={(e) => handleFieldChange("consent_anesthesia_signed", e.target.checked)}
									className="accent-rose-700 h-4 w-4"
								/>
								<span>Informed Consent Anestesi (Tandatangan)</span>
							</label>

							<label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
								<input
									type="checkbox"
									checked={!!entryDetail.lab_preop_ready}
									onChange={(e) => handleFieldChange("lab_preop_ready", e.target.checked)}
									className="accent-rose-700 h-4 w-4"
								/>
								<span>Hasil Lab Pra-Op (Gol. Darah, PT/APTT, Hb)</span>
							</label>

							<label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
								<input
									type="checkbox"
									checked={!!entryDetail.site_marking_done}
									onChange={(e) => handleFieldChange("site_marking_done", e.target.checked)}
									className="accent-rose-700 h-4 w-4"
								/>
								<span>Marker / Penandaan Lokasi Operasi</span>
							</label>

							<div className="sm:col-span-2 flex items-center gap-3">
								<span className="font-bold text-slate-700">Persiapan Darah (Blood Bank) :</span>
								{["Ya", "Tidak"].map((opt) => {
									const active = (entryDetail.blood_preparation_needed || "Ya") === opt;
									return (
										<label key={opt} className="flex items-center gap-1 cursor-pointer font-bold text-slate-800">
											<input
												type="radio"
												name="blood_prep"
												checked={active}
												onChange={() => handleFieldChange("blood_preparation_needed", opt)}
												className="accent-rose-700"
											/>
											<span>{opt}</span>
										</label>
									);
								})}
								{entryDetail.blood_preparation_needed === "Ya" && (
									<input
										type="text"
										value={entryDetail.blood_units_count || "2 Kantong (PRC)"}
										onChange={(e) => handleFieldChange("blood_units_count", e.target.value)}
										placeholder="Jumlah kantong..."
										className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* FASE 2: WHO SURGICAL SAFETY CHECKLIST (STANDAR MUTLAK WHO) */}
			<div className="rounded-2xl border border-rose-300 bg-gradient-to-br from-rose-50/40 via-white to-slate-50 p-5 space-y-4 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200 pb-2">
					<div className="flex items-center gap-2">
						<ShieldAlert className="h-5 w-5 text-rose-700 animate-pulse" />
						<h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
							FASE 2: WHO SURGICAL SAFETY CHECKLIST (STANDAR KESELAMATAN PATIEN OK)
						</h2>
					</div>
					<span className="text-xs font-black px-3 py-0.5 rounded-full bg-rose-800 text-white shadow-2xs">
						Checklist Terisi: {whoTotalChecked} / 11 Poin WHO
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
					{/* 1. SIGN IN */}
					<div className="p-4 bg-white rounded-xl border border-rose-200 space-y-3 shadow-2xs">
						<span className="block text-xs font-black uppercase text-rose-900 border-b border-rose-100 pb-1 flex items-center justify-between">
							<span>1. SIGN IN</span>
							<span className="text-[9px] font-bold text-slate-500">(Sebelum Induksi Anestesi)</span>
						</span>
						<div className="space-y-2">
							{[
								{ id: "signin_identity", label: "Konfirmasi identitas, area operasi, & jenis tindakan" },
								{ id: "signin_anesthesia_ready", label: "Konfirmasi mesin anestesi & obat-obatan siap" },
								{ id: "signin_airway_risk", label: "Evaluasi risiko perdarahan (>500ml) & jalan napas" },
								{ id: "signin_pulse_oximeter", label: "Pulse oximeter terpasang & berfungsi baik" },
							].map((item) => (
								<label key={item.id} className="flex items-start gap-2 cursor-pointer font-semibold text-slate-800">
									<input
										type="checkbox"
										checked={!!whoChecklist[item.id]}
										onChange={(e) => updateWhoChecklist(item.id, e.target.checked)}
										className="accent-rose-700 h-4 w-4 mt-0.5 shrink-0"
									/>
									<span className="text-[11px] leading-snug">{item.label}</span>
								</label>
							))}
						</div>
					</div>

					{/* 2. TIME OUT */}
					<div className="p-4 bg-white rounded-xl border border-amber-200 space-y-3 shadow-2xs">
						<span className="block text-xs font-black uppercase text-amber-900 border-b border-amber-100 pb-1 flex items-center justify-between">
							<span>2. TIME OUT</span>
							<span className="text-[9px] font-bold text-slate-500">(Sebelum Insisi Sayatan)</span>
						</span>
						<div className="space-y-2">
							{[
								{ id: "timeout_team_intro", label: "Perkenalan tim OK (Operator, Anestesi, Perawat)" },
								{ id: "timeout_confirm_procedure", label: "Pembacaan ulang diagnosis & tindakan yang dilakukan" },
								{ id: "timeout_antibiotic_prophylaxis", label: "Konfirmasi Profilaksis Antibiotik (<60 mnt lalu)" },
								{ id: "timeout_critical_steps", label: "Antisipasi kejadian kritis, durasi & kehilangan darah" },
							].map((item) => (
								<label key={item.id} className="flex items-start gap-2 cursor-pointer font-semibold text-slate-800">
									<input
										type="checkbox"
										checked={!!whoChecklist[item.id]}
										onChange={(e) => updateWhoChecklist(item.id, e.target.checked)}
										className="accent-amber-700 h-4 w-4 mt-0.5 shrink-0"
									/>
									<span className="text-[11px] leading-snug">{item.label}</span>
								</label>
							))}
						</div>
					</div>

					{/* 3. SIGN OUT */}
					<div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-3 shadow-2xs">
						<span className="block text-xs font-black uppercase text-emerald-900 border-b border-emerald-100 pb-1 flex items-center justify-between">
							<span>3. SIGN OUT</span>
							<span className="text-[9px] font-bold text-slate-500">(Sebelum Keluar OK)</span>
						</span>
						<div className="space-y-2">
							{[
								{ id: "signout_count_instruments", label: "Hitung Kassa, Jarum, & Instrumen (Sesuai/Lengkap)" },
								{ id: "signout_specimen_labeled", label: "Kelengkapan label jaringan biopsi / PA" },
								{ id: "signout_recovery_notes", label: "Catatan khusus pemulihan untuk Tim PACU" },
							].map((item) => (
								<label key={item.id} className="flex items-start gap-2 cursor-pointer font-semibold text-slate-800">
									<input
										type="checkbox"
										checked={!!whoChecklist[item.id]}
										onChange={(e) => updateWhoChecklist(item.id, e.target.checked)}
										className="accent-emerald-700 h-4 w-4 mt-0.5 shrink-0"
									/>
									<span className="text-[11px] leading-snug">{item.label}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* FASE 3: INTRA-OPERATIF / LAPORAN OPERASI */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Activity className="h-4 w-4 text-rose-700" />
					FASE 3: INTRA-OPERATIF & LAPORAN OPERASI RESMI
				</span>

				<div className="space-y-4 text-xs">
					{/* Diagnosis Post-Op & ICD-9 Operasi */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* ICD-10 Post Op */}
						<div className="relative">
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Diagnosis Pasca-Operasi / Post-Op (ICD-10) :
							</label>
							<div className="relative">
								<input
									type="text"
									value={entryDetail.post_op_diagnosis || icd10PostSearch}
									onChange={(e) => {
										setIcd10PostSearch(e.target.value);
										setIcd10PostOpen(true);
										handleFieldChange("post_op_diagnosis", e.target.value);
									}}
									onFocus={() => setIcd10PostOpen(true)}
									placeholder="Cari Diagnosa ICD-10 Pasca Operasi..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-xs font-bold text-slate-900 focus:border-rose-700 focus:outline-none"
								/>
								<Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
							</div>
							{icd10PostOpen && icd10PostResults.length > 0 && (
								<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
									{icd10PostResults.map((item) => (
										<button
											key={item.code}
											type="button"
											onClick={() => {
												handleFieldChange("post_op_diagnosis", `${item.code} - ${item.name}`);
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

						{/* Jenis Anestesi */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Jenis Anestesi / Bius :
							</label>
							<div className="flex items-center gap-4 py-2 font-bold">
								{[
									{ key: "GA", label: "Anestesi Umum (GA)" },
									{ key: "Regional", label: "Regional (Spinal/Epidural)" },
									{ key: "Lokal", label: "Lokal" },
								].map((opt) => {
									const active = (entryDetail.anesthesia_type || "GA") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="anesthesia_type_op"
												checked={active}
												onChange={() => handleFieldChange("anesthesia_type", opt.key)}
												className="accent-rose-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* Rincian Timed Audit Operasi */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Masuk OK :</label>
							<input
								type="time"
								value={entryDetail.time_entry_ok || "08:30"}
								onChange={(e) => handleFieldChange("time_entry_ok", e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
							/>
						</div>
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Mulai Insisi :</label>
							<input
								type="time"
								value={entryDetail.time_incision_start || "09:00"}
								onChange={(e) => handleFieldChange("time_incision_start", e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
							/>
						</div>
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Selesai Insisi :</label>
							<input
								type="time"
								value={entryDetail.time_incision_end || "10:30"}
								onChange={(e) => handleFieldChange("time_incision_end", e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
							/>
						</div>
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Keluar OK :</label>
							<input
								type="time"
								value={entryDetail.time_exit_ok || "11:00"}
								onChange={(e) => handleFieldChange("time_exit_ok", e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
							/>
						</div>
					</div>

					{/* Uraian Jalannya Operasi */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Uraian Jalannya Operasi (Laporan Bedah Lengkap) :
						</label>
						<textarea
							rows={6}
							value={entryDetail.op_report || ""}
							onChange={(e) => handleFieldChange("op_report", e.target.value)}
							placeholder="Pasien posisi supine di bawah GA/Spinal. Disinfeksi lapangan operasi, insisi midline... temuan intra-operatif... perdarahan terkontrol... penutupan luka insisi lapis demi lapis..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-rose-700 focus:outline-none"
						/>
					</div>

					{/* Perdarahan & Jaringan PA */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Estimasi Perdarahan (cc) :</label>
							<input
								type="number"
								value={entryDetail.bleeding_amount_cc ?? 150}
								onChange={(e) => handleFieldChange("bleeding_amount_cc", Number(e.target.value))}
								placeholder="150"
								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-900"
							/>
						</div>

						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Transfusi Darah/Cairan (cc) :</label>
							<input
								type="number"
								value={entryDetail.transfusion_amount_cc ?? 500}
								onChange={(e) => handleFieldChange("transfusion_amount_cc", Number(e.target.value))}
								placeholder="500"
								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-teal-900"
							/>
						</div>

						<div>
							<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Spesimen Jaringan PA :</label>
							<div className="flex items-center gap-2">
								{["Ada", "Tidak"].map((opt) => {
									const active = (entryDetail.pa_sample_present || "Ada") === opt;
									return (
										<label key={opt} className="flex items-center gap-1 cursor-pointer font-bold">
											<input
												type="radio"
												name="pa_sample"
												checked={active}
												onChange={() => handleFieldChange("pa_sample_present", opt)}
												className="accent-rose-700"
											/>
											<span>{opt}</span>
										</label>
									);
								})}
								{entryDetail.pa_sample_present !== "Tidak" && (
									<input
										type="text"
										value={entryDetail.pa_sample_name || "Jaringan Appendix"}
										onChange={(e) => handleFieldChange("pa_sample_name", e.target.value)}
										placeholder="Nama spesimen..."
										className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* FASE 4: PASCA-BEDAH / POST-OPERATIF (PACU & RECOVERY ROOM) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<HeartPulse className="h-4 w-4 text-rose-700" />
					FASE 4: PASCA-BEDAH / POST-OPERATIF (PACU & RECOVERY ROOM)
				</span>

				<div className="space-y-4 text-xs">
					{/* Tanda Vital PACU */}
					<div className="space-y-2">
						<span className="block text-[10px] font-extrabold uppercase text-slate-600">
							Tanda-Tanda Vital Ruang Pemulihan (PACU Vitals) :
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">TD (mmHg) :</span>
								<input
									type="text"
									value={entryDetail.pacu_bp || "118/76"}
									onChange={(e) => handleFieldChange("pacu_bp", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Nadi (/m) :</span>
								<input
									type="text"
									value={entryDetail.pacu_pulse || "78"}
									onChange={(e) => handleFieldChange("pacu_pulse", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Suhu (°C) :</span>
								<input
									type="text"
									value={entryDetail.pacu_temp || "36.6"}
									onChange={(e) => handleFieldChange("pacu_temp", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">SpO2 (%) :</span>
								<input
									type="text"
									value={entryDetail.pacu_spo2 || "99"}
									onChange={(e) => handleFieldChange("pacu_spo2", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-teal-800"
								/>
							</div>
						</div>
					</div>

					{/* Instruksi Pasca Bedah & PACU Orders */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Instruksi Pasca-Bedah (Post-Op Orders Dokter Bedah & Anestesi) :
						</label>
						<textarea
							rows={4}
							value={entryDetail.post_op_instructions || ""}
							onChange={(e) => handleFieldChange("post_op_instructions", e.target.value)}
							placeholder="Manajemen nyeri, resep obat pasca pembedahan, instruksi puasa/diet, perawatan luka & drainase..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-rose-700 focus:outline-none"
						/>
					</div>

					{/* Tujuan Pasca Operasi (Disposisi) */}
					<div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-3">
						<span className="block text-xs font-black uppercase text-rose-950">Tujuan Disposisi Pasca-Operasi :</span>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
							{[
								{ value: "Rawat Inap", label: "Ruang Inap Biasa (Ranap)" },
								{ value: "ICU/HCU", label: "Intensive Care (ICU / HCU)" },
								{ value: "ODC", label: "Boleh Pulang (One Day Care)" },
							].map((opt) => {
								const isSelected = (entryDetail.post_op_disposition || entryDetail.status || "Rawat Inap") === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => {
											handleFieldChange("post_op_disposition", opt.value);
											handleFieldChange("status", opt.value);
											if (opt.value === "Rawat Inap" || opt.value === "ICU/HCU") {
												onEnsureRanapStep?.();
											}
										}}
										className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
											isSelected
												? "bg-rose-900 text-white border-rose-900 shadow-md ring-2 ring-rose-600/30 font-black"
												: "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
										}`}
									>
										{opt.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* RINGKASAN KONDISI SEBELUM MENINGGALKAN BEDAH SENTRAL */}
					<DischargeSummary
						processName="Bedah Sentral"
						currentStatus={entryDetail.discharge_status || entryDetail.status || "Membaik"}
						onUpdateStatus={(val) => {
							handleFieldChange("discharge_status", val);
							handleFieldChange("status", val);
						}}
						onNavigateToRanap={onNavigateToRanap}
						onNavigateToRujuk={onNavigateToRujuk}
						onNavigateToDeath={onNavigateToDeath}
						includeObat={includeObat}
						onToggleIncludeObat={onToggleIncludeObat}
					/>

					{/* Verifikasi DPJP Operator */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 pt-3">
						<div>
							<span className="block text-[9px] font-extrabold uppercase text-slate-500">Ahli Bedah Utama Bertanggung Jawab :</span>
							<span className="block text-xs font-black text-slate-900">{primaryOperatorDoctor}</span>
							<span className="block text-[10px] text-rose-800 font-bold">{primarySpecialty}</span>
						</div>
						<div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-xl border border-rose-200 text-rose-800 text-xs font-extrabold shadow-2xs">
							<CheckCircle2 className="h-4 w-4 text-rose-600" />
							<span>Verified E-Signature</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
