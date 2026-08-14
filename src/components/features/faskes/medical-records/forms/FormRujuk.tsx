"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { searchICD10 } from "@/data/icdData";

export default function FormRujuk({

	entryDetail = {} as any,
	type = "rujukan_medis",
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
	// ICD-10 Search state
	const [icdSearch, setIcdSearch] = useState("");
	const [icdOpen, setIcdOpen] = useState(false);
	const icdResults = useMemo(() => searchICD10(icdSearch), [icdSearch]);

	// Auto-synced Patient & Doctor Info
	const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
	const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";
	const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || "L";
	const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || "";

	const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.referring_doctor || "dr. DPJP Pengirim";
	const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || "Dokter Penanggung Jawab";

	const handleFieldChange = (field, value) => {
		onUpdateDetailField(type, field, value);
	};

	// Parse Reasons for Referral Array (Section 2)
	const selectedReasons = useMemo(() => {
		try {
			if (Array.isArray(entryDetail.referral_reasons)) return entryDetail.referral_reasons;
			if (typeof entryDetail.referral_reasons === "string") return JSON.parse(entryDetail.referral_reasons);
		} catch {
			// fallback
		}
		return ["Butuh Penanganan Spesialis / Sub-spesialis"];
	}, [entryDetail.referral_reasons]);

	const toggleReason = (reasonLabel) => {
		const updated = selectedReasons.includes(reasonLabel)
			? selectedReasons.filter((r) => r !== reasonLabel)
			: [...selectedReasons, reasonLabel];
		onUpdateDetailField(type, "referral_reasons", JSON.stringify(updated));
	};

	// Parse Attached Files Array (Section 3)
	const selectedAttachments = useMemo(() => {
		try {
			if (Array.isArray(entryDetail.attached_files)) return entryDetail.attached_files;
			if (typeof entryDetail.attached_files === "string") return JSON.parse(entryDetail.attached_files);
		} catch {
			// fallback
		}
		return ["Hasil Laboratorium Terakhir", "Hasil Radiologi / Rontgen"];
	}, [entryDetail.attached_files]);

	const toggleAttachment = (attachmentLabel) => {
		const updated = selectedAttachments.includes(attachmentLabel)
			? selectedAttachments.filter((a) => a !== attachmentLabel)
			: [...selectedAttachments, attachmentLabel];
		onUpdateDetailField(type, "attached_files", JSON.stringify(updated));
	};

	return (
		<div className="space-y-6 font-sans text-slate-900">
			{/* HEADER DOKUMEN RUJUKAN MEDIS */}
			<div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-teal-50/90 p-5 text-slate-900 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black shadow-sm">
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

				{/* IDENTITAS PASIEN SINKRON */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-indigo-200/80 text-xs">
					<div>
						<span className="block text-[10px] uppercase font-bold text-indigo-800">Nama Pasien :</span>
						<span className="font-extrabold text-slate-900 truncate block">{patientName || "Nama Pasien"}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-indigo-800">No. Rekam Medis (RM) :</span>
						<span className="font-extrabold text-indigo-950">{noRM}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-indigo-800">Jenis Kelamin / Tgl Lahir :</span>
						<span className="font-extrabold text-slate-900">{gender === "L" ? "Laki-laki" : "Perempuan"} ({dob || "-"})</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-indigo-800">Dokter Merujuk (DPJP) :</span>
						<span className="font-extrabold text-emerald-900 truncate block">{doctorName}</span>
					</div>
				</div>
			</div>

			{/* 1. DATA IDENTITAS & ADMINISTRASI RUJUKAN */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Building2 className="h-4 w-4 text-indigo-700" />
					1. DATA IDENTITAS & ADMINISTRASI RUJUKAN
				</span>

				<div className="space-y-4 text-xs">
					{/* Jenis Rujukan & Sifat Rujukan */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Jenis Rujukan Medis :
							</label>
							<div className="flex items-center gap-4 font-bold">
								{[
									{ key: "Rujukan Eksternal", label: "Rujukan Eksternal (Antar Faskes)" },
									{ key: "Rujukan Internal", label: "Rujukan Internal (Antar Poli)" },
								].map((opt) => {
									const active = (entryDetail.referral_type || "Rujukan Eksternal") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="referral_type"
												checked={active}
												onChange={() => handleFieldChange("referral_type", opt.key)}
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
									{ key: "Darurat", label: "Darurat (Emergency / Cito)" },
									{ key: "Terencana", label: "Terencana (Rutin / Elektif)" },
								].map((opt) => {
									const active = (entryDetail.referral_urgency || "Darurat") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="referral_urgency"
												checked={active}
												onChange={() => handleFieldChange("referral_urgency", opt.key)}
												className="accent-indigo-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* Faskes Tujuan & Spesialis Tujuan */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="sm:col-span-2">
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Faskes / Rumah Sakit Tujuan Rujukan :
							</label>
							<input
								type="text"
								value={entryDetail.target_faskes_name || "RSUP Dr. Hasan Sadikin Bandung"}
								onChange={(e) => handleFieldChange("target_faskes_name", e.target.value)}
								placeholder="Nama Rumah Sakit / Klinik Tujuan..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Poli / Spesialis Tujuan :
							</label>
							<input
								type="text"
								value={entryDetail.target_specialty || "Spesialis Jantung & Pembuluh Darah"}
								onChange={(e) => handleFieldChange("target_specialty", e.target.value)}
								placeholder="Contoh: Spesialis Bedah, Sp.A, Sp.JP..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Penjamin / Asuransi Rujukan :
							</label>
							<div className="flex items-center gap-2">
								<select
									value={entryDetail.referral_insurance_type || paymentType || "BPJS Kesehatan"}
									onChange={(e) => handleFieldChange("referral_insurance_type", e.target.value)}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
								>
									<option value="BPJS Kesehatan">BPJS Kesehatan</option>
									<option value="Umum / Pribadi">Umum / Pribadi</option>
									<option value="Asuransi Swasta">Asuransi Swasta</option>
								</select>
							</div>
						</div>
					</div>

					{/* No. Kartu BPJS / Asuransi */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							No. Kartu BPJS / Polis Asuransi Pasien :
						</label>
						<input
							type="text"
							value={entryDetail.insurance_card_number || "0001234567890"}
							onChange={(e) => handleFieldChange("insurance_card_number", e.target.value)}
							placeholder="Masukkan Nomor Kartu BPJS / Asuransi Rujukan..."
							className="w-full sm:w-96 rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 2. RESUME KLINIS PASIEN (CLINICAL SUMMARY) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Stethoscope className="h-4 w-4 text-indigo-700" />
					2. RESUME KLINIS PASIEN (CLINICAL SUMMARY)
				</span>

				<div className="space-y-4 text-xs">
					{/* Alasan Merujuk (Multi-select Checklist) */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
							Alasan Utama Merujuk Pasien (Checklist Multi-select) :
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							{[
								"Butuh Penanganan Spesialis / Sub-spesialis Lanjutan",
								"Keterbatasan Fasilitas Alat / Ruang ICU / Bedah OK",
								"Keterbatasan Reagen / Pemeriksaan Penunjang Lab/Radiologi",
								"Atas Permintaan Pasien / Keluarga Pasien",
							].map((reason) => {
								const checked = selectedReasons.includes(reason);
								return (
									<button
										key={reason}
										type="button"
										onClick={() => toggleReason(reason)}
										className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
											checked
												? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400/30 text-indigo-950 font-bold"
												: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
										}`}
									>
										<span className="text-xs">{reason}</span>
										<div className={`h-4 w-4 rounded flex items-center justify-center border ${
											checked ? "bg-indigo-700 border-indigo-700 text-white" : "bg-white border-slate-300"
										}`}>
											{checked && <Check className="h-3 w-3" />}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Anamnesis & Ringkasan Perjalanan Penyakit */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Anamnesis & Ringkasan Perjalanan Penyakit :
						</label>
						<textarea
							rows={4}
							value={entryDetail.complaint || entryDetail.referral_clinical_summary || ""}
							onChange={(e) => {
								handleFieldChange("complaint", e.target.value);
								handleFieldChange("referral_clinical_summary", e.target.value);
							}}
							placeholder="Ringkasan perjalanan penyakit, keluhan utama saat datang, riwayat medis penting hingga keputusan merujuk..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-indigo-700 focus:outline-none"
						/>
					</div>

					{/* Tanda-Tanda Vital Terakhir */}
					<div className="space-y-2">
						<span className="block text-[10px] font-extrabold uppercase text-slate-600">
							Tanda-Tanda Vital Terakhir Saat Akan Dirujuk :
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">TD (mmHg) :</span>
								<input
									type="text"
									value={entryDetail.vitals_bp || "120/80"}
									onChange={(e) => handleFieldChange("vitals_bp", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Nadi (/m) :</span>
								<input
									type="text"
									value={entryDetail.vitals_pulse || "84"}
									onChange={(e) => handleFieldChange("vitals_pulse", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Suhu (°C) :</span>
								<input
									type="text"
									value={entryDetail.vitals_temp || "36.7"}
									onChange={(e) => handleFieldChange("vitals_temp", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">Laju Napas :</span>
								<input
									type="text"
									value={entryDetail.vitals_resp || "20"}
									onChange={(e) => handleFieldChange("vitals_resp", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">SpO2 (%) :</span>
								<input
									type="text"
									value={entryDetail.vitals_spo2 || "98"}
									onChange={(e) => handleFieldChange("vitals_spo2", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-indigo-900"
								/>
							</div>
							<div>
								<span className="block text-[9px] font-extrabold text-slate-500 uppercase">GCS / Kesadaran :</span>
								<input
									type="text"
									value={entryDetail.vitals_gcs || "E4V5M6 (Sadar Penuh)"}
									onChange={(e) => handleFieldChange("vitals_gcs", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
								/>
							</div>
						</div>
					</div>

					{/* ICD-10 Diagnosis Primary */}
					<div className="relative">
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Diagnosis Utama & Sekunder (Cari ICD-10) :
						</label>
						<div className="relative">
							<input
								type="text"
								value={entryDetail.icd10_diagnosis || icdSearch}
								onChange={(e) => {
									setIcdSearch(e.target.value);
									setIcdOpen(true);
									handleFieldChange("icd10_diagnosis", e.target.value);
								}}
								onFocus={() => setIcdOpen(true)}
								placeholder="Cari Kode ICD-10 Diagnosis Rujukan (misal: I21.9 - Acute Myocardial Infarction, E11.9)..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-9 text-xs font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
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
											handleFieldChange("icd10_diagnosis", `${item.code} - ${item.name}`);
											setIcdSearch(`${item.code} - ${item.name}`);
											setIcdOpen(false);
										}}
										className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
									>
										<span className="font-mono font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px] mr-2">{item.code}</span>
										<span className="font-semibold text-slate-800 text-[11px] flex-1">{item.name}</span>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Tindakan & Pengobatan Diberikan */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							Tindakan & Penanganan yang Sudah Diberikan :
						</label>
						<textarea
							rows={3}
							value={entryDetail.treatment_given || ""}
							onChange={(e) => handleFieldChange("treatment_given", e.target.value)}
							placeholder="Pemasangan Oksigen 3 Lpm, Infus RL 500ml (20 tpm), obat-obatan injeksi yang sudah masuk..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-indigo-700 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 3. LAMPIRAN PENUNJANG (ATTACHED MEDICAL FILES) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Paperclip className="h-4 w-4 text-indigo-700" />
					3. LAMPIRAN PENUNJANG TERINTEGRASI (ATTACHED MEDICAL FILES)
				</span>

				<div className="space-y-3 text-xs">
					<label className="block text-[10px] font-extrabold uppercase text-slate-700">
						Dokumen Pendukung Disertakan dalam Berkas Rujukan :
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
						{[
							"Hasil Laboratorium Terakhir",
							"Hasil Radiologi / Rontgen / CT-Scan",
							"Hasil EKG / Rekam Jantung",
							"Copy Resep / Daftar Obat Pasien",
						].map((item) => {
							const checked = selectedAttachments.includes(item);
							return (
								<button
									key={item}
									type="button"
									onClick={() => toggleAttachment(item)}
									className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition ${
										checked
											? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400/30 text-indigo-950 font-bold"
											: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
									}`}
								>
									<span className="text-xs">{item}</span>
									<div className={`h-4 w-4 rounded flex items-center justify-center border ${
										checked ? "bg-indigo-700 border-indigo-700 text-white" : "bg-white border-slate-300"
									}`}>
										{checked && <Check className="h-3 w-3" />}
									</div>
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* 4. TRANSPORTASI & PENDAMPING RUJUKAN (EMERGENCY / IGD) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Ambulance className="h-4 w-4 text-indigo-700" />
					4. TRANSPORTASI & PENDAMPING RUJUKAN (EMERGENCY / IGD)
				</span>

				<div className="space-y-4 text-xs">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						{/* Sarana Transportasi */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Sarana Transportasi Rujukan :
							</label>
							<div className="flex flex-wrap items-center gap-3 font-bold">
								{[
									{ key: "Ambulans Faskes", label: "Ambulans Faskes" },
									{ key: "Ambulans 118", label: "Ambulans 118" },
									{ key: "Kendaraan Pribadi", label: "Kendaraan Pribadi" },
								].map((opt) => {
									const active = (entryDetail.transportation_type || "Ambulans Faskes") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="transportation_type"
												checked={active}
												onChange={() => handleFieldChange("transportation_type", opt.key)}
												className="accent-indigo-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>

						{/* Kondisi Pasien Saat Berangkat */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Kondisi Pasien Saat Berangkat :
							</label>
							<div className="flex flex-wrap items-center gap-3 font-bold">
								{[
									{ key: "Stabil", label: "Stabil" },
									{ key: "Kritis", label: "Kritis" },
									{ key: "Bantuan Oksigen", label: "Bantuan O2" },
									{ key: "Terintubasi", label: "Terintubasi" },
								].map((opt) => {
									const active = (entryDetail.departure_condition || "Stabil") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="departure_condition"
												checked={active}
												onChange={() => handleFieldChange("departure_condition", opt.key)}
												className="accent-indigo-700 h-4 w-4"
											/>
											<span>{opt.label}</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* Tenaga Kesehatan Pendamping */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Tenaga Kesehatan Pendamping (Escort) :
							</label>
							<input
								type="text"
								value={entryDetail.escort_health_worker || "Ns. Andi Pratama, S.Kep & Driver Ambulans"}
								onChange={(e) => handleFieldChange("escort_health_worker", e.target.value)}
								placeholder="Nama Perawat / Dokter Pendamping Rujukan..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Catatan TTV Perjalanan Ambulans (Serah Terima) :
							</label>
							<input
								type="text"
								value={entryDetail.ambulance_travel_notes || "TTV selama perjalanan stabil, O2 terpasang 3 Lpm"}
								onChange={(e) => handleFieldChange("ambulance_travel_notes", e.target.value)}
								placeholder="Catatan TTV & kejadian selama perjalanan..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* 5. PENGESAHAN & PENERIMAAN (SIGN-OFF & HANDOVER SBAR) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<PhoneCall className="h-4 w-4 text-indigo-700" />
					5. PENGESAHAN & TELE-RUJUKAN KONFIRMASI (SBAR / HANDOVER)
				</span>

				<div className="space-y-4 text-xs">
					{/* Status Tele-Rujukan */}
					<div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
						<label className="flex items-center gap-2.5 cursor-pointer font-black text-indigo-950">
							<input
								type="checkbox"
								checked={!!entryDetail.target_faskes_confirmed}
								onChange={(e) => handleFieldChange("target_faskes_confirmed", e.target.checked)}
								className="accent-indigo-700 h-5 w-5"
							/>
							<span>Faskes tujuan sudah dihubungi (Tele-rujukan / SISRUTE) & bersedia menerima pasien</span>
						</label>

						{entryDetail.target_faskes_confirmed && (
							<div className="pt-2 border-t border-indigo-200 flex items-center gap-3">
								<span className="font-bold text-indigo-900 text-[11px]">Nama Petugas / Dokter Faskes Tujuan yang Menerima Konfirmasi :</span>
								<input
									type="text"
									value={entryDetail.target_receiver_name || "dr. Hendra (Dokter Jaga IGD RS Tujuan)"}
									onChange={(e) => handleFieldChange("target_receiver_name", e.target.value)}
									placeholder="Nama Petugas Penerima Konfirmasi..."
									className="flex-1 rounded-xl border border-indigo-300 bg-white px-3 py-1.5 font-bold text-slate-900 focus:border-indigo-700 focus:outline-none"
								/>
							</div>
						)}
					</div>

					{/* Verifikasi Dokter Merujuk */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 pt-3">
						<div>
							<span className="block text-[9px] font-extrabold uppercase text-slate-500">Dokter DPJP Pengirim Rujukan :</span>
							<span className="block text-xs font-black text-slate-900">{doctorName}</span>
							<span className="block text-[10px] text-indigo-800 font-bold">{doctorSpecialty}</span>
						</div>
						<div className="flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-xl border border-indigo-200 text-indigo-800 text-xs font-extrabold shadow-2xs">
							<CheckCircle2 className="h-4 w-4 text-indigo-600" />
							<span>Verified E-Signature</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
