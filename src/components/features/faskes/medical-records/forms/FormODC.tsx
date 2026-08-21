"use client";

import React, { useState, useMemo } from "react";
import DischargeSummary from "./DischargeSummary";
import { createOrUpdateSupportTestRequest } from "@/services/supportTestStorage";
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
} from "lucide-react";
import { searchICD9 } from "@/data/icdData";

export default function FormODC({

	entryDetail = {} as any,
	type = "one_day_care",
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
	// ICD-9 Search state
	const [icd9Search, setIcd9Search] = useState("");
	const [icd9Open, setIcd9Open] = useState(false);
	const icd9Results = useMemo(() => searchICD9(icd9Search), [icd9Search]);

	// Auto-synced Patient Information
	const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
	const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";
	const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || "L";
	const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || "";

	// Auto-synced Doctor Information
	const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.dpjp_doctor || "DPJP Belum Dipilih";
	const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || entryDetail.dpjp_specialty || "Spesialis";

	const handleFieldChange = (field, value) => {
		onUpdateDetailField(type, field, value);
	};

	// Parse Observation Logs Array (Section 4)
	const observationLogs = useMemo(() => {
		try {
			if (Array.isArray(entryDetail.odc_observation_logs)) return entryDetail.odc_observation_logs;
			if (typeof entryDetail.odc_observation_logs === "string") return JSON.parse(entryDetail.odc_observation_logs);
		} catch {
			// fallback
		}
		return [
			{ time: "09:00", bp: "120/80", pulse: "80", temp: "36.5", spo2: "98", gcs: "E4V5M6 (Sadar Penuh)", complaints: "Tidak ada keluhan", fluids: "RL 500ml (20 tpm)" },
			{ time: "10:00", bp: "118/78", pulse: "78", temp: "36.6", spo2: "99", gcs: "E4V5M6 (Sadar Penuh)", complaints: "Nyeri minimal (Skala 2)", fluids: "RL 500ml (20 tpm)" },
		];
	}, [entryDetail.odc_observation_logs]);

	const updateObservationLogs = (newList) => {
		onUpdateDetailField(type, "odc_observation_logs", JSON.stringify(newList));
	};

	const addObservationRow = () => {
		const now = new Date();
		const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
		const newRow = {
			time: timeStr,
			bp: "120/80",
			pulse: "80",
			temp: "36.5",
			spo2: "98",
			gcs: "E4V5M6 (Sadar Penuh)",
			complaints: "Normal",
			fluids: "Infus Drip",
		};
		updateObservationLogs([...observationLogs, newRow]);
	};

	const removeObservationRow = (index) => {
		const updated = observationLogs.filter((_, idx) => idx !== index);
		updateObservationLogs(updated);
	};

	const handleObservationRowChange = (index, key, value) => {
		const updated = observationLogs.map((item, idx) => {
			if (idx === index) return { ...item, [key]: value };
			return item;
		});
		updateObservationLogs(updated);
	};

	// Aldrete Score Calculator (Section 5)
	const aldreteActivity = Number(entryDetail.aldrete_activity ?? 2);
	const aldreteRespiration = Number(entryDetail.aldrete_respiration ?? 2);
	const aldreteCirculation = Number(entryDetail.aldrete_circulation ?? 2);
	const aldreteConsciousness = Number(entryDetail.aldrete_consciousness ?? 2);
	const aldreteSpo2 = Number(entryDetail.aldrete_spo2 ?? 2);

	const totalAldreteScore = aldreteActivity + aldreteRespiration + aldreteCirculation + aldreteConsciousness + aldreteSpo2;

	return (
		<div className="space-y-6 font-sans text-slate-900">
			{/* HEADER DOKUMEN ODC */}
			<div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/90 p-5 text-slate-900 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-black shadow-sm">
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

				{/* IDENTITAS PASIEN SINKRON */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-teal-200/80 text-xs">
					<div>
						<span className="block text-[10px] uppercase font-bold text-teal-800">Nama Pasien :</span>
						<span className="font-extrabold text-slate-900 truncate block">{patientName || "Nama Pasien"}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-teal-800">No. Rekam Medis (RM) :</span>
						<span className="font-extrabold text-teal-900">{noRM}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-teal-800">Jenis Kelamin / Tgl Lahir :</span>
						<span className="font-extrabold text-slate-900">{gender === "L" ? "Laki-laki" : "Perempuan"} ({dob || "-"})</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-teal-800">DPJP Penanggung Jawab :</span>
						<span className="font-extrabold text-emerald-900 truncate block">{doctorName}</span>
					</div>
				</div>
			</div>

			{/* 1. DATA PENDAFTARAN & LOKASI ODC */}
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
							value={entryDetail.odc_bed_number || "Bed ODC-01"}
							onChange={(e) => handleFieldChange("odc_bed_number", e.target.value)}
							placeholder="Contoh: Bed ODC-01 / Ruang Transisi"
							className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
							Jam Masuk Ruang ODC :
						</label>
						<input
							type="time"
							value={entryDetail.odc_entry_time || visitTime || "08:00"}
							onChange={(e) => handleFieldChange("odc_entry_time", e.target.value)}
							className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
							Jam Rencana Keluar ODC :
						</label>
						<input
							type="time"
							value={entryDetail.odc_planned_discharge_time || "16:00"}
							onChange={(e) => handleFieldChange("odc_planned_discharge_time", e.target.value)}
							className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
							Perawat Penanggung Jawab ODC :
						</label>
						<input
							type="text"
							value={entryDetail.odc_nurse_in_charge || "Ns. Rina Rahmawati, S.Kep"}
							onChange={(e) => handleFieldChange("odc_nurse_in_charge", e.target.value)}
							placeholder="Nama Perawat..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 2. ASESMEN AWAL & PERSETUJUAN (PRE-PROCEDURE) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Stethoscope className="h-4 w-4 text-teal-700" />
					2. ASESMEN AWAL & PERSETUJUAN (PRE-PROCEDURE)
				</span>

				<div className="space-y-4 text-xs">
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Keluhan Utama & Alasan Masuk ODC :
						</label>
						<textarea
							rows={3}
							value={entryDetail.complaint || entryDetail.odc_indication || ""}
							onChange={(e) => {
								handleFieldChange("complaint", e.target.value);
								handleFieldChange("odc_indication", e.target.value);
							}}
							placeholder="Jadwal Kemoterapi / Operasi Ekstirpasi Benjolan / Endoskopi / DVI / Observasi Pasca Biopsi..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						{/* Informed Consent */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Persetujuan Tindakan Medis (Informed Consent) :
							</label>
							<div className="flex items-center gap-4">
								{[
									{ key: "Ya", label: "Ditandatangani Pasien / Keluarga" },
									{ key: "Tidak", label: "Belum Ditandatangani" },
								].map((opt) => {
									const active = (entryDetail.informed_consent_signed || "Ya") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
											<input
												type="radio"
												name="informed_consent_signed"
												checked={active}
												onChange={() => handleFieldChange("informed_consent_signed", opt.key)}
												className="accent-teal-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>

						{/* Status Puasa */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Status Puasa Pra-Tindakan (Sedasi/Bius) :
							</label>
							<div className="flex items-center gap-4">
								{[
									{ key: "Ya", label: "Ya (Puasa)" },
									{ key: "Tidak", label: "Tidak Puasa" },
								].map((opt) => {
									const active = (entryDetail.pre_procedure_fasting || "Ya") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
											<input
												type="radio"
												name="pre_procedure_fasting"
												checked={active}
												onChange={() => handleFieldChange("pre_procedure_fasting", opt.key)}
												className="accent-teal-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
								{(entryDetail.pre_procedure_fasting || "Ya") === "Ya" && (
									<input
										type="text"
										value={entryDetail.fasting_duration || "6 Jam"}
										onChange={(e) => handleFieldChange("fasting_duration", e.target.value)}
										placeholder="Durasi (e.g. 6 Jam)..."
										className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
									/>
								)}
							</div>
						</div>
					</div>

					{/* Skrining Tanda Vital Awal */}
					<div className="space-y-2">
						<span className="block text-[10px] font-extrabold uppercase text-slate-600">
							Tanda-Tanda Vital Awal Pra-Tindakan (Pre-Procedure Vitals) :
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3 rounded-xl border border-slate-200">
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Tekanan Darah :</span>
								<input
									type="text"
									value={entryDetail.vitals_bp || "120/80"}
									onChange={(e) => handleFieldChange("vitals_bp", e.target.value)}
									placeholder="120/80"
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Nadi (x/mnt) :</span>
								<input
									type="text"
									value={entryDetail.vitals_pulse || "80"}
									onChange={(e) => handleFieldChange("vitals_pulse", e.target.value)}
									placeholder="80"
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Suhu (°C) :</span>
								<input
									type="text"
									value={entryDetail.vitals_temp || "36.5"}
									onChange={(e) => handleFieldChange("vitals_temp", e.target.value)}
									placeholder="36.5"
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Respirasi (x/mnt) :</span>
								<input
									type="text"
									value={entryDetail.vitals_resp || "18"}
									onChange={(e) => handleFieldChange("vitals_resp", e.target.value)}
									placeholder="18"
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Skala Nyeri (0-10) :</span>
								<input
									type="text"
									value={entryDetail.vitals_pain_score || "0 (Tidak Nyeri)"}
									onChange={(e) => handleFieldChange("vitals_pain_score", e.target.value)}
									placeholder="0-10"
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 3. LAPORAN TINDAKAN / PROSEDUR MEDIS ODC */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Activity className="h-4 w-4 text-teal-700" />
					3. LAPORAN TINDAKAN / PROSEDUR MEDIS ODC
				</span>

				<div className="space-y-4 text-xs">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* ICD-9 / Nama Tindakan Search */}
						<div className="md:col-span-2 relative">
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Nama Prosedur / Tindakan Medis (Cari ICD-9-CM) :
							</label>
							<div className="relative">
								<input
									type="text"
									value={entryDetail.procedure_name || icd9Search}
									onChange={(e) => {
										setIcd9Search(e.target.value);
										setIcd9Open(true);
										handleFieldChange("procedure_name", e.target.value);
									}}
									onFocus={() => setIcd9Open(true)}
									placeholder="Cari Kode / Nama Prosedur ICD-9-CM (misal: Ekstirpasi, Endoskopi, Biopsi)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
								<Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
							</div>

							{/* Dropdown ICD-9 */}
							{icd9Open && icd9Results.length > 0 && (
								<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
									{icd9Results.map((item) => (
										<button
											key={item.code}
											type="button"
											onClick={() => {
												handleFieldChange("procedure_name", `${item.code} - ${item.name}`);
												setIcd9Search(`${item.code} - ${item.name}`);
												setIcd9Open(false);
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

						{/* Jenis Anestesi */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Jenis Anestesi / Bius :
							</label>
							<select
								value={entryDetail.anesthesia_type || "Lokal"}
								onChange={(e) => handleFieldChange("anesthesia_type", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							>
								<option value="Lokal">Lokal (Anestesi Lokal)</option>
								<option value="Sedasi Ringan">Sedasi Ringan / Sedatif</option>
								<option value="General">General / Bius Umum</option>
								<option value="Tanpa Anestesi">Tanpa Anestesi</option>
							</select>
						</div>
					</div>

					{/* Jam Tindakan & Jaringan Eksisi */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
								Jam Tindakan Dimulai :
							</label>
							<input
								type="time"
								value={entryDetail.procedure_start_time || "09:15"}
								onChange={(e) => handleFieldChange("procedure_start_time", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
								Jam Tindakan Selesai :
							</label>
							<input
								type="time"
								value={entryDetail.procedure_end_time || "10:00"}
								onChange={(e) => handleFieldChange("procedure_end_time", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
								Jaringan Biopsi / PA :
							</label>
							<div className="flex items-center gap-3 py-1.5 font-bold">
								{[
									{ key: "Ya (PA)", label: "Dikirim ke PA" },
									{ key: "Tidak", label: "Tidak Ada PA" },
								].map((opt) => {
									const active = (entryDetail.pathology_sample_sent || "Tidak") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="pathology_sample_sent"
												checked={active}
												onChange={() => handleFieldChange("pathology_sample_sent", opt.key)}
												className="accent-teal-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* Laporan Ringkas Prosedur */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Laporan Ringkas Prosedur Medis :
						</label>
						<textarea
							rows={3}
							value={entryDetail.procedure_report || ""}
							onChange={(e) => handleFieldChange("procedure_report", e.target.value)}
							placeholder="Jalannya tindakan medis, resep obat anestesi yang dipakai, alat/implan dipasang, komplikasi..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 4. LEMBAR OBSERVASI JAM-JAMAN (POST-PROCEDURE MONITORING) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
					<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
						<Clock className="h-4 w-4 text-teal-700" />
						4. LEMBAR OBSERVASI JAM-JAMAN (POST-PROCEDURE MONITORING)
					</span>
					<button
						type="button"
						onClick={addObservationRow}
						className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
					>
						<Plus className="h-3.5 w-3.5" />
						<span>Tambah Log Observasi</span>
					</button>
				</div>

				<div className="overflow-x-auto no-scrollbar">
					<table className="w-full text-left text-xs border-collapse">
						<thead>
							<tr className="bg-slate-100 text-slate-700 uppercase text-[9px] font-black tracking-wider border-b border-slate-200">
								<th className="p-2.5 w-20">Jam Check</th>
								<th className="p-2.5 w-24">TD (mmHg)</th>
								<th className="p-2.5 w-20">Nadi (/m)</th>
								<th className="p-2.5 w-20">Suhu (°C)</th>
								<th className="p-2.5 w-20">SpO2 (%)</th>
								<th className="p-2.5 w-36">GCS / Kesadaran</th>
								<th className="p-2.5">Keluhan Pasien</th>
								<th className="p-2.5">Cairan / Drips Infus</th>
								<th className="p-2.5 text-center w-12">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
							{observationLogs.map((row, idx) => (
								<tr key={idx} className="hover:bg-slate-50/80 transition">
									<td className="p-2">
										<input
											type="text"
											value={row.time || ""}
											onChange={(e) => handleObservationRowChange(idx, "time", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.bp || ""}
											onChange={(e) => handleObservationRowChange(idx, "bp", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.pulse || ""}
											onChange={(e) => handleObservationRowChange(idx, "pulse", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.temp || ""}
											onChange={(e) => handleObservationRowChange(idx, "temp", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.spo2 || ""}
											onChange={(e) => handleObservationRowChange(idx, "spo2", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-teal-800"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.gcs || ""}
											onChange={(e) => handleObservationRowChange(idx, "gcs", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.complaints || ""}
											onChange={(e) => handleObservationRowChange(idx, "complaints", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.fluids || ""}
											onChange={(e) => handleObservationRowChange(idx, "fluids", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2 text-center">
										<button
											type="button"
											onClick={() => removeObservationRow(idx)}
											className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
											title="Hapus Baris"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* 5. KRITERIA PEMULANGAN PASIEN (DISCHARGE CRITERIA / ALDRETE SCORE) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
					<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
						<ShieldCheck className="h-4 w-4 text-teal-700" />
						5. KRITERIA PEMULANGAN PASIEN (ALDRETE SCORE & DISCHARGE CRITERIA)
					</span>
					<div className="flex items-center gap-2">
						<span className="text-[10px] font-black uppercase text-slate-500">Skor Aldrete Total :</span>
						<span className={`px-3 py-0.5 rounded-full text-xs font-black border shadow-2xs ${
							totalAldreteScore >= 9 ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-amber-100 text-amber-900 border-amber-300"
						}`}>
							{totalAldreteScore} / 10 ({totalAldreteScore >= 9 ? "LAYAK PULANG" : "PERLU OBSERVASI"})
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
					{/* Aktivitas */}
					<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
						<span className="block text-[10px] font-black uppercase text-slate-700">1. Aktivitas Motorik</span>
						<select
							value={aldreteActivity}
							onChange={(e) => handleFieldChange("aldrete_activity", Number(e.target.value))}
							className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-900"
						>
							<option value={2}>2 - Bergerak 4 Ekstremitas Mandiri</option>
							<option value={1}>1 - Bergerak 2 Ekstremitas / Bantuan</option>
							<option value={0}>0 - Tidak Mampu Bergerak</option>
						</select>
					</div>

					{/* Respirasi */}
					<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
						<span className="block text-[10px] font-black uppercase text-slate-700">2. Respirasi / Napas</span>
						<select
							value={aldreteRespiration}
							onChange={(e) => handleFieldChange("aldrete_respiration", Number(e.target.value))}
							className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-900"
						>
							<option value={2}>2 - Napas Bebas & Batuk Efektif</option>
							<option value={1}>1 - Sesak Ringan / Napas Dangkal</option>
							<option value={0}>0 - Apnea / Dibantu Alat</option>
						</select>
					</div>

					{/* Sirkulasi */}
					<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
						<span className="block text-[10px] font-black uppercase text-slate-700">3. Sirkulasi (TD)</span>
						<select
							value={aldreteCirculation}
							onChange={(e) => handleFieldChange("aldrete_circulation", Number(e.target.value))}
							className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-900"
						>
							<option value={2}>2 - TD ±20% dari Pra-Tindakan</option>
							<option value={1}>1 - TD ±20-50% dari Pra-Tindakan</option>
							<option value={0}>0 - TD &gt;50% Beda Pra-Tindakan</option>
						</select>
					</div>

					{/* Kesadaran */}
					<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
						<span className="block text-[10px] font-black uppercase text-slate-700">4. Kesadaran</span>
						<select
							value={aldreteConsciousness}
							onChange={(e) => handleFieldChange("aldrete_consciousness", Number(e.target.value))}
							className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-900"
						>
							<option value={2}>2 - Sadar Penuh & Orientasi Baik</option>
							<option value={1}>1 - Terbangun Jika Dipanggil</option>
							<option value={0}>0 - Tidak Berorientasi / Unrespon</option>
						</select>
					</div>

					{/* SpO2 */}
					<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
						<span className="block text-[10px] font-black uppercase text-slate-700">5. Saturasi Oksigen</span>
						<select
							value={aldreteSpo2}
							onChange={(e) => handleFieldChange("aldrete_spo2", Number(e.target.value))}
							className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-bold text-slate-900"
						>
							<option value={2}>2 - SpO2 &gt;92% Udara Bebas</option>
							<option value={1}>1 - Perlu Tambahan O2 untuk SpO2 &gt;90%</option>
							<option value={0}>0 - SpO2 &lt;90% Walau Diberi O2</option>
						</select>
					</div>
				</div>

				{/* KEPUTUSAN PEMULANGAN */}
				<div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200/90 space-y-3">
					<span className="block text-xs font-black uppercase text-teal-950">Keputusan Pemulangan ODC :</span>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
						{[
							{ value: "Boleh Pulang", label: "Boleh Pulang (Rawat Jalan)" },
							{ value: "Rawat Inap", label: "Alih Rawat ke Rawat Inap (Ranap)" },
							{ value: "Rujuk ke Faskes Lain", label: "Rujuk Faskes Lain" },
						].map((opt) => {
							const isSelected = (entryDetail.discharge_decision || entryDetail.status || "Boleh Pulang") === opt.value;
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => {
										handleFieldChange("discharge_decision", opt.value);
										handleFieldChange("status", opt.value);
										if (opt.value === "Rawat Inap") {
											onEnsureRanapStep?.();
										}
									}}
									className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
										isSelected
											? "bg-teal-800 text-white border-teal-800 shadow-md ring-2 ring-teal-600/30 font-black"
											: "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
									}`}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>



			{/* 6. EDUKASI & RESUME PULANG (DISCHARGE INSTRUCTIONS) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<FileText className="h-4 w-4 text-teal-700" />
					6. EDUKASI & RESUME PULANG (DISCHARGE INSTRUCTIONS)
				</span>

				<div className="space-y-4 text-xs">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Instruksi Pasca Tindakan */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Instruksi Pasca-Tindakan Medis di Rumah :
							</label>
							<textarea
								rows={4}
								value={entryDetail.post_op_instructions || ""}
								onChange={(e) => handleFieldChange("post_op_instructions", e.target.value)}
								placeholder="Perawatan luka jahitan, pantangan makanan, istirahat cukup, hindari mengangkat beban berat..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Resep Obat Pulang */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Resep Obat Bawa Pulang :
							</label>
							<textarea
								rows={4}
								value={entryDetail.take_home_meds || ""}
								onChange={(e) => handleFieldChange("take_home_meds", e.target.value)}
								placeholder="Resep obat pereda nyeri/antibiotik bawa pulang..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
						{/* Jadwal Kontrol Ulang */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Jadwal Kontrol Ulang Poliklinik :
							</label>
							<input
								type="date"
								value={entryDetail.control_date || ""}
								onChange={(e) => handleFieldChange("control_date", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Verifikasi DPJP */}
						<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
							<div>
								<span className="block text-[9px] font-extrabold uppercase text-slate-500">DPJP ODC Bertanggung Jawab :</span>
								<span className="block text-xs font-black text-slate-900">{doctorName}</span>
								<span className="block text-[10px] text-teal-800 font-bold">{doctorSpecialty}</span>
							</div>
							<div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-teal-200 text-teal-700 text-[10px] font-extrabold shadow-2xs">
								<CheckCircle2 className="h-4 w-4 text-teal-600" />
								<span>Verified</span>
							</div>
						</div>
					</div>

					<DischargeSummary
						processName="One Day Care"
						currentStatus={entryDetail.discharge_status || entryDetail.status || "Membaik"}
						onUpdateStatus={(val) => {
							handleFieldChange("discharge_status", val);
							handleFieldChange("status", val);

							const activeVisitId = visitId || entryDetail.visit_id || "VISIT-20260821-SEDC";
							const pName = selectedPatient?.name || entryDetail.patient_name || "Pasien ODC";
							const nRm = selectedPatient?.mr_number || entryDetail.no_rm || "RM-00129";
							const docName = doctorName || "Dokter ODC";

							if (val.includes("Rawat Inap") || val === "Rawat Inap") {
								createOrUpdateSupportTestRequest({
									category: "ranap",
									visitId: activeVisitId,
									patientName: pName,
									noRm: nRm,
									requestOrigin: "One Day Care (ODC)",
									testDetails: "Permintaan Transfer & Pendaftaran Rawat Inap Pasien ODC",
									doctorName: docName,
								});
							} else if (val.includes("Rujuk") || val.includes("Faskes")) {
								createOrUpdateSupportTestRequest({
									category: "rujuk",
									visitId: activeVisitId,
									patientName: pName,
									noRm: nRm,
									requestOrigin: "One Day Care (ODC)",
									testDetails: "Permintaan Rujukan Medis & Transfer Pasien ODC ke Faskes Lain",
									doctorName: docName,
								});
							} else if (val.includes("Meninggal") || val === "Meninggal") {
								createOrUpdateSupportTestRequest({
									category: "death",
									visitId: activeVisitId,
									patientName: pName,
									noRm: nRm,
									requestOrigin: "One Day Care (ODC)",
									testDetails: "Permintaan Verifikasi & Penerbitan Surat Keterangan Kematian Pasien ODC",
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
				</div>
			</div>
		</div>
	);
}
