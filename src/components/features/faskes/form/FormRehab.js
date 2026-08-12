"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { searchICD10 } from "@/data/icdData";

export default function FormRehab({
	entryDetail = {},
	type = "rehab_medik",
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
}) {
	// ICD-10 Search state
	const [icdSearch, setIcdSearch] = useState("");
	const [icdOpen, setIcdOpen] = useState(false);
	const icdResults = useMemo(() => searchICD10(icdSearch), [icdSearch]);

	// Auto-synced Patient Info
	const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
	const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";
	const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || "L";
	const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || "";

	// Auto-synced Doctor Info
	const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.kfr_doctor || "dr. KFR Sp.KFR";
	const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || "Kedokteran Fisik & Rehabilitasi (Sp.KFR)";

	const handleFieldChange = (field, value) => {
		onUpdateDetailField(type, field, value);
	};

	// Parse Selected Therapy Types Array (Section 1)
	const selectedTherapyTypes = useMemo(() => {
		try {
			if (Array.isArray(entryDetail.therapy_types)) return entryDetail.therapy_types;
			if (typeof entryDetail.therapy_types === "string") return JSON.parse(entryDetail.therapy_types);
		} catch {
			// fallback
		}
		return ["Fisioterapi"];
	}, [entryDetail.therapy_types]);

	const toggleTherapyType = (itemLabel) => {
		const updated = selectedTherapyTypes.includes(itemLabel)
			? selectedTherapyTypes.filter((t) => t !== itemLabel)
			: [...selectedTherapyTypes, itemLabel];
		onUpdateDetailField(type, "therapy_types", JSON.stringify(updated));
	};

	// Parse Prescribed Modalities Array (Section 4)
	const selectedModalities = useMemo(() => {
		try {
			if (Array.isArray(entryDetail.modalities_prescribed)) return entryDetail.modalities_prescribed;
			if (typeof entryDetail.modalities_prescribed === "string") return JSON.parse(entryDetail.modalities_prescribed);
		} catch {
			// fallback
		}
		return ["Diathermy / Ultrasound (US) / TENS (Penghilang nyeri)", "Exercise / Terapi Latihan (Strengthening, Stretching)"];
	}, [entryDetail.modalities_prescribed]);

	const toggleModality = (modalityLabel) => {
		const updated = selectedModalities.includes(modalityLabel)
			? selectedModalities.filter((m) => m !== modalityLabel)
			: [...selectedModalities, modalityLabel];
		onUpdateDetailField(type, "modalities_prescribed", JSON.stringify(updated));
	};

	// Parse Daily Session Logs (Section 5)
	const sessionLogs = useMemo(() => {
		try {
			if (Array.isArray(entryDetail.rehab_session_logs)) return entryDetail.rehab_session_logs;
			if (typeof entryDetail.rehab_session_logs === "string") return JSON.parse(entryDetail.rehab_session_logs);
		} catch {
			// fallback
		}
		return [
			{ session: "Sesi 1", date: visitDate || "2026-08-10", therapist: "Ftr. Budi Santoso, S.Fis", action: "US & TENS lumbal + stretching hamstring", response: "Nyeri VAS berkurang dari 6 ke 4" },
			{ session: "Sesi 2", date: visitDate || "2026-08-12", therapist: "Ftr. Budi Santoso, S.Fis", action: "Exercise strengthening quadriceps", response: "MMT meningkat dari 3 jadi 4" },
		];
	}, [entryDetail.rehab_session_logs, visitDate]);

	const updateSessionLogs = (newList) => {
		onUpdateDetailField(type, "rehab_session_logs", JSON.stringify(newList));
	};

	const addSessionRow = () => {
		const nextNum = sessionLogs.length + 1;
		const todayStr = new Date().toISOString().split("T")[0];
		const newRow = {
			session: `Sesi ${nextNum}`,
			date: todayStr,
			therapist: "Ftr. Budi Santoso, S.Fis",
			action: "Modalitas & Terapi Latihan",
			response: "Respon baik, toleransi terapi adekuat",
		};
		updateSessionLogs([...sessionLogs, newRow]);
	};

	const removeSessionRow = (index) => {
		const updated = sessionLogs.filter((_, idx) => idx !== index);
		updateSessionLogs(updated);
	};

	const handleSessionRowChange = (index, key, value) => {
		const updated = sessionLogs.map((item, idx) => {
			if (idx === index) return { ...item, [key]: value };
			return item;
		});
		updateSessionLogs(updated);
	};

	return (
		<div className="space-y-6 font-sans text-slate-900">
			{/* HEADER DOKUMEN REHAB MEDIK */}
			<div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/90 via-cyan-50/70 to-emerald-50/90 p-5 text-slate-900 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-black shadow-sm">
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
						<span className="block text-[10px] uppercase font-bold text-teal-800">Dokter Spesialis KFR :</span>
						<span className="font-extrabold text-emerald-900 truncate block">{doctorName}</span>
					</div>
				</div>
			</div>

			{/* 1. DATA LEMBAR RUJUKAN / PENDAFTARAN REHAB MEDIK */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Building2 className="h-4 w-4 text-teal-700" />
					1. DATA LEMBAR RUJUKAN & PENDAFTARAN REHAB MEDIK
				</span>

				<div className="space-y-4 text-xs">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Dokter Spesialis KFR */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Dokter Spesialis KFR Bertanggung Jawab :
							</label>
							<input
								type="text"
								value={entryDetail.kfr_doctor || doctorName}
								onChange={(e) => handleFieldChange("kfr_doctor", e.target.value)}
								placeholder="Nama Dokter KFR..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Di-rujuk Dari Unit */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Di-rujuk Dari Unit Pelayanan :
							</label>
							<div className="flex flex-wrap items-center gap-3 py-1 font-bold">
								{[
									{ key: "Rawat Jalan", label: "Rawat Jalan" },
									{ key: "Rawat Inap", label: "Rawat Inap" },
									{ key: "IGD", label: "IGD" },
									{ key: "Faskes Luar", label: "Faskes Luar" },
								].map((opt) => {
									const active = (entryDetail.referred_from_unit || "Rawat Jalan") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="referred_from_unit"
												checked={active}
												onChange={() => handleFieldChange("referred_from_unit", opt.key)}
												className="accent-teal-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* Jenis Terapi yang Diperlukan (Checklist Multi-select) */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
							Jenis Terapi yang Diperlukan (Multi-select) :
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
							{[
								{ id: "Fisioterapi", label: "Fisioterapi (Gerak & Fungsi Tubuh)" },
								{ id: "Okupasi Terapi", label: "Okupasi Terapi (Latihan Kemandirian ADL)" },
								{ id: "Terapi Wicara", label: "Terapi Wicara (Latihan Bicara & Menelan)" },
								{ id: "Orthotik Prostetik", label: "Orthotik Prostetik (Alat Bantu / Gips)" },
								{ id: "Psikologi / Psikososial", label: "Psikologi / Psikososial" },
							].map((item) => {
								const checked = selectedTherapyTypes.includes(item.id);
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => toggleTherapyType(item.id)}
										className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
											checked
												? "bg-teal-50 border-teal-300 ring-1 ring-teal-400/30 text-teal-950 font-bold"
												: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
										}`}
									>
										<span className="text-xs">{item.label}</span>
										<div className={`h-4 w-4 rounded flex items-center justify-center border ${
											checked ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-slate-300"
										}`}>
											{checked && <Check className="h-3 w-3" />}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* ICD-10 Diagnosis Primary */}
					<div className="relative">
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Diagnosis Medis Utama / Primary (ICD-10) :
						</label>
						<div className="relative">
							<input
								type="text"
								value={entryDetail.icd10_primary || icdSearch}
								onChange={(e) => {
									setIcdSearch(e.target.value);
									setIcdOpen(true);
									handleFieldChange("icd10_primary", e.target.value);
								}}
								onFocus={() => setIcdOpen(true)}
								placeholder="Cari Kode ICD-10 (misal: I69.3 - Stroke, M54.5 - Low Back Pain, S82.0)..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
							<Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
						</div>

						{/* Dropdown ICD-10 */}
						{icdOpen && icdResults.length > 0 && (
							<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
								{icdResults.map((item) => (
									<button
										key={item.code}
										type="button"
										onClick={() => {
											handleFieldChange("icd10_primary", `${item.code} - ${item.name}`);
											setIcdSearch(`${item.code} - ${item.name}`);
											setIcdOpen(false);
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
				</div>
			</div>

			{/* 2. ASESMEN KFR & PEMERIKSAAN FUNGSI TUBUH */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Stethoscope className="h-4 w-4 text-teal-700" />
					2. ASESMEN KFR & PEMERIKSAAN FUNGSI TUBUH
				</span>

				<div className="space-y-4 text-xs">
					{/* Keluhan Utama & Keterbatasan Fungsi */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Keluhan Utama & Keterbatasan Fungsi Pasien :
						</label>
						<textarea
							rows={3}
							value={entryDetail.complaint || entryDetail.functional_limitation || ""}
							onChange={(e) => {
								handleFieldChange("complaint", e.target.value);
								handleFieldChange("functional_limitation", e.target.value);
							}}
							placeholder="Nyeri pinggang bawah saat duduk, tangan kanan lemas pasca stroke, kelemahan tungkai, durasi keterbatasan..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>

					{/* Skala Nyeri VAS & ROM */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						{/* VAS Score Buttons */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Skala Nyeri (VAS / NRS 0-10) :
							</label>
							<div className="flex items-center gap-1 flex-wrap">
								{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
									const active = Number(entryDetail.pain_scale_vas ?? 3) === score;
									return (
										<button
											key={score}
											type="button"
											onClick={() => handleFieldChange("pain_scale_vas", score)}
											className={`h-7 w-7 rounded-lg text-xs font-black transition cursor-pointer border ${
												active
													? "bg-teal-800 text-white border-teal-800 shadow-xs"
													: "bg-white text-slate-700 border-slate-300 hover:bg-slate-200"
											}`}
										>
											{score}
										</button>
									);
								})}
							</div>
						</div>

						{/* ROM */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Range of Motion (ROM / Luas Gerak Sendi) :
							</label>
							<input
								type="text"
								value={entryDetail.rom_assessment || "Fleksi Lutut Kanan terbatas 90°"}
								onChange={(e) => handleFieldChange("rom_assessment", e.target.value)}
								placeholder="misal: Ekstensi bahu terbatas, Fleksi knee 90°..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Postur & Keseimbangan */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Pemeriksaan Postur & Keseimbangan :
							</label>
							<input
								type="text"
								value={entryDetail.posture_balance_assessment || "Postur Asimetris, Keseimbangan Berdiri Baik"}
								onChange={(e) => handleFieldChange("posture_balance_assessment", e.target.value)}
								placeholder="Postur skoliosis, keseimbangan berdiri..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>
					</div>

					{/* Manual Muscle Testing (MMT 0-5) */}
					<div className="space-y-2">
						<span className="block text-[10px] font-extrabold uppercase text-slate-600">
							Manual Muscle Testing (MMT / Kekuatan Otot 0-5 per Anggota Gerak) :
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200">
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Tangan Kanan :</span>
								<select
									value={entryDetail.mmt_right_arm ?? 4}
									onChange={(e) => handleFieldChange("mmt_right_arm", Number(e.target.value))}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-black text-slate-900"
								>
									{[0, 1, 2, 3, 4, 5].map((val) => (
										<option key={val} value={val}>Skor {val} / 5</option>
									))}
								</select>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Tangan Kiri :</span>
								<select
									value={entryDetail.mmt_left_arm ?? 5}
									onChange={(e) => handleFieldChange("mmt_left_arm", Number(e.target.value))}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-black text-slate-900"
								>
									{[0, 1, 2, 3, 4, 5].map((val) => (
										<option key={val} value={val}>Skor {val} / 5</option>
									))}
								</select>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Kaki Kanan :</span>
								<select
									value={entryDetail.mmt_right_leg ?? 4}
									onChange={(e) => handleFieldChange("mmt_right_leg", Number(e.target.value))}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-black text-slate-900"
								>
									{[0, 1, 2, 3, 4, 5].map((val) => (
										<option key={val} value={val}>Skor {val} / 5</option>
									))}
								</select>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Kaki Kiri :</span>
								<select
									value={entryDetail.mmt_left_leg ?? 5}
									onChange={(e) => handleFieldChange("mmt_left_leg", Number(e.target.value))}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-black text-slate-900"
								>
									{[0, 1, 2, 3, 4, 5].map((val) => (
										<option key={val} value={val}>Skor {val} / 5</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Barthel Index / Functional Score */}
					<div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/90 flex flex-wrap items-center justify-between gap-3">
						<span className="text-xs font-black text-teal-950">Skala Kemandirian (Indeks Barthel / FIM Score) :</span>
						<div className="flex items-center gap-2">
							<input
								type="number"
								value={entryDetail.barthel_index_score ?? 85}
								onChange={(e) => handleFieldChange("barthel_index_score", Number(e.target.value))}
								className="w-20 rounded-lg border border-teal-300 bg-white px-2.5 py-1 text-xs font-black text-slate-900"
							/>
							<span className="text-xs font-bold text-teal-900">/ 100 (Ketergantungan Ringan)</span>
						</div>
					</div>
				</div>
			</div>

			{/* 3. DIAGNOSIS FUNGSI (ICF / DIAGNOSIS REHAB MEDIK) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<HeartPulse className="h-4 w-4 text-teal-700" />
					3. DIAGNOSIS FUNGSI (ICF / DIAGNOSIS REHAB MEDIK)
				</span>

				<div className="text-xs">
					<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
						Diagnosis Fungsi / Impairment & Disabilitas (ICF Standard) :
					</label>
					<input
						type="text"
						value={entryDetail.icf_functional_diagnosis || "Gangguan mobilitas fisik ec Hemiparese Dextra, Gangguan Bahasa Ekspresif"}
						onChange={(e) => handleFieldChange("icf_functional_diagnosis", e.target.value)}
						placeholder="Contoh: Gangguan mobilitas fisik ec Hemiparese Dextra, Impairment nyeri Lumbal..."
						className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
					/>
				</div>
			</div>

			{/* 4. PERENCANAAN & PROGRAM TERAPI (PRESKRIPSI REHAB MEDIK) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Sliders className="h-4 w-4 text-teal-700" />
					4. PERENCANAAN & PROGRAM TERAPI (PRESKRIPSI REHAB MEDIK DOKTER KFR)
				</span>

				<div className="space-y-4 text-xs">
					{/* Target Terapi */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Target Jangka Pendek (Short-Term Goal) :
							</label>
							<textarea
								rows={2}
								value={entryDetail.short_term_goal || "Mengurangi nyeri dari VAS 6 ke 2 dalam 2 minggu"}
								onChange={(e) => handleFieldChange("short_term_goal", e.target.value)}
								placeholder="misal: Mengurangi nyeri dari VAS 6 ke 2 dalam 2 minggu..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Target Jangka Panjang (Long-Term Goal) :
							</label>
							<textarea
								rows={2}
								value={entryDetail.long_term_goal || "Pasien mampu berjalan mandiri tanpa alat bantu"}
								onChange={(e) => handleFieldChange("long_term_goal", e.target.value)}
								placeholder="misal: Pasien mampu berjalan mandiri tanpa alat bantu..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>
					</div>

					{/* Modalitas & Tindakan Terapi */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
							Modalitas & Tindakan Terapi Medis (Checklist Preskripsi KFR) :
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							{[
								"Diathermy / Ultrasound (US) / TENS (Penghilang nyeri)",
								"Exercise / Terapi Latihan (Strengthening, Stretching)",
								"Terapi Okupasi (Latihan ADL - Activity of Daily Living)",
								"Terapi Wicara (Latihan Menelan / Bicara)",
								"Pemasangan Alat Bantu / Splinting / Gips",
							].map((modality) => {
								const checked = selectedModalities.includes(modality);
								return (
									<button
										key={modality}
										type="button"
										onClick={() => toggleModality(modality)}
										className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
											checked
												? "bg-teal-50 border-teal-300 ring-1 ring-teal-400/30 text-teal-950 font-bold"
												: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
										}`}
									>
										<span className="text-xs">{modality}</span>
										<div className={`h-4 w-4 rounded flex items-center justify-center border ${
											checked ? "bg-teal-700 border-teal-700 text-white" : "bg-white border-slate-300"
										}`}>
											{checked && <Check className="h-3 w-3" />}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Frekuensi Sesi */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Rencana Frekuensi Sesi Terapi :
						</label>
						<input
							type="text"
							value={entryDetail.session_frequency || "2x Seminggu selama 4 Minggu (Total 8 Sesi)"}
							onChange={(e) => handleFieldChange("session_frequency", e.target.value)}
							placeholder="misal: 2x seminggu selama 4 minggu..."
							className="w-full sm:w-96 rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 5. CATATAN SESI TERAPI BERKALA (DAILY LOGS) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
					<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
						<Calendar className="h-4 w-4 text-teal-700" />
						5. CATATAN SESI TERAPI BERKALA (LEMBAR KONTROL TERAPI / DAILY LOGS)
					</span>
					<button
						type="button"
						onClick={addSessionRow}
						className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
					>
						<Plus className="h-3.5 w-3.5" />
						<span>Tambah Sesi Terapi</span>
					</button>
				</div>

				<div className="overflow-x-auto no-scrollbar">
					<table className="w-full text-left text-xs border-collapse">
						<thead>
							<tr className="bg-slate-100 text-slate-700 uppercase text-[9px] font-black tracking-wider border-b border-slate-200">
								<th className="p-2.5 w-24">Sesi ke-N</th>
								<th className="p-2.5 w-32">Tanggal</th>
								<th className="p-2.5 w-48">Terapis Bertanggung Jawab</th>
								<th className="p-2.5">Tindakan Diberikan</th>
								<th className="p-2.5">Respon & Perkembangan Pasien</th>
								<th className="p-2.5 text-center w-12">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
							{sessionLogs.map((row, idx) => (
								<tr key={idx} className="hover:bg-slate-50/80 transition">
									<td className="p-2">
										<input
											type="text"
											value={row.session || ""}
											onChange={(e) => handleSessionRowChange(idx, "session", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-teal-900"
										/>
									</td>
									<td className="p-2">
										<input
											type="date"
											value={row.date || ""}
											onChange={(e) => handleSessionRowChange(idx, "date", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.therapist || ""}
											onChange={(e) => handleSessionRowChange(idx, "therapist", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.action || ""}
											onChange={(e) => handleSessionRowChange(idx, "action", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2">
										<input
											type="text"
											value={row.response || ""}
											onChange={(e) => handleSessionRowChange(idx, "response", e.target.value)}
											className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
										/>
									</td>
									<td className="p-2 text-center">
										<button
											type="button"
											onClick={() => removeSessionRow(idx)}
											className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
											title="Hapus Sesi"
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

			{/* 6. EVALUASI AKHIR & LEMBAR DISCHARGE (RESUME SERI TERAPI) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<FileText className="h-4 w-4 text-teal-700" />
					6. EVALUASI AKHIR & LEMBAR DISCHARGE (RESUME SERI TERAPI)
				</span>

				<div className="space-y-4 text-xs">
					{/* Hasil Evaluasi Akhir */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
							Hasil Evaluasi Akhir Seri Terapi :
						</label>
						<div className="flex items-center gap-4">
							{[
								{ key: "Membaik", label: "Membaik (Sesuai Target)" },
								{ key: "Tetap", label: "Tetap (Stagnan)" },
								{ key: "Memburuk", label: "Memburuk" },
							].map((opt) => {
								const active = (entryDetail.discharge_evaluation_result || "Membaik") === opt.key;
								return (
									<label key={opt.key} className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
										<input
											type="radio"
											name="discharge_evaluation_result"
											checked={active}
											onChange={() => handleFieldChange("discharge_evaluation_result", opt.key)}
											className="accent-teal-700 h-4 w-4"
										/>
										<span>{opt.label}</span>
									</label>
								);
							})}
						</div>
					</div>

					{/* Keputusan Lanjutan */}
					<div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200/90 space-y-3">
						<span className="block text-xs font-black uppercase text-teal-950">Keputusan Lanjutan / Disposisi Pasien :</span>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
							{[
								{ value: "Program Terapi Selesai", label: "Program Terapi Selesai (Discharge)" },
								{ value: "Perpanjang Paket Terapi", label: "Perpanjang Paket Terapi (Siklus Baru)" },
								{ value: "Rujuk Kembali DPJP Utama", label: "Rujuk Kembali ke DPJP Utama" },
								{ value: "Rawat Inap", label: "Alih Rawat ke Rawat Inap (Ranap)" },
							].map((opt) => {
								const isSelected = (entryDetail.discharge_decision || entryDetail.status || "Program Terapi Selesai") === opt.value;
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
										className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
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

					{/* Verifikasi DPJP & Terapis */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 pt-3">
						<div>
							<span className="block text-[9px] font-extrabold uppercase text-slate-500">Dokter Penanggung Jawab KFR :</span>
							<span className="block text-xs font-black text-slate-900">{doctorName}</span>
							<span className="block text-[10px] text-teal-800 font-bold">{doctorSpecialty}</span>
						</div>
						<div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-xl border border-teal-200 text-teal-800 text-xs font-extrabold shadow-2xs">
							<CheckCircle2 className="h-4 w-4 text-teal-600" />
							<span>Verified E-Signature</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
