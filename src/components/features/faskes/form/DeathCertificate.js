"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { searchICD10 } from "@/data/icdData";

export default function DeathCertificate({
	entryDetail = {},
	type = "death_certificate",
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
}) {
	// ICD-10 Search states for Chain of Events
	const [icdDirectSearch, setIcdDirectSearch] = useState("");
	const [icdDirectOpen, setIcdDirectOpen] = useState(false);
	const icdDirectResults = useMemo(() => searchICD10(icdDirectSearch), [icdDirectSearch]);

	const [icdInterSearch, setIcdInterSearch] = useState("");
	const [icdInterOpen, setIcdInterOpen] = useState(false);
	const icdInterResults = useMemo(() => searchICD10(icdInterSearch), [icdInterSearch]);

	const [icdUnderlyingSearch, setIcdUnderlyingSearch] = useState("");
	const [icdUnderlyingOpen, setIcdUnderlyingOpen] = useState(false);
	const icdUnderlyingResults = useMemo(() => searchICD10(icdUnderlyingSearch), [icdUnderlyingSearch]);

	// Auto-synced Patient & Doctor Info
	const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
	const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";
	const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || "L";
	const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || "";
	const nik = selectedPatient?.nik || selectedPatient?.identity_number || entryDetail.nik || "";

	const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.declaring_doctor || "dr. DPJP / Dokter Jaga";
	const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || "Dokter Penanggung Jawab";

	const handleFieldChange = (field, value) => {
		onUpdateDetailField(type, field, value);
	};

	return (
		<div className="space-y-6 font-sans text-slate-900">
			{/* HEADER SURAT KETERANGAN KEMATIAN */}
			<div className="rounded-2xl border border-slate-300 bg-gradient-to-r from-slate-100 via-rose-50/60 to-slate-50 p-5 text-slate-900 shadow-2xs">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white font-black shadow-sm">
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

				{/* IDENTITAS ALMARHUM / ALMARHUMAH */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-200 text-xs">
					<div>
						<span className="block text-[10px] uppercase font-bold text-slate-600">Nama Almarhum/ah :</span>
						<span className="font-extrabold text-slate-900 truncate block">{patientName || "Nama Pasien"}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-slate-600">No. RM / NIK :</span>
						<span className="font-extrabold text-slate-900">{noRM} {nik ? `/ ${nik}` : ""}</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-slate-600">Jenis Kelamin / Tgl Lahir :</span>
						<span className="font-extrabold text-slate-900">{gender === "L" ? "Laki-laki" : "Perempuan"} ({dob || "-"})</span>
					</div>
					<div>
						<span className="block text-[10px] uppercase font-bold text-slate-600">Dokter Yang Menyatakan :</span>
						<span className="font-extrabold text-slate-900 truncate block">{doctorName}</span>
					</div>
				</div>
			</div>

			{/* 1. DATA IDENTITAS & WAKTU KEMATIAN */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Clock className="h-4 w-4 text-slate-700" />
					1. WAKTU & LOKASI PERNYATAAN KEMATIAN (PRONOUNCED DEAD)
				</span>

				<div className="space-y-4 text-xs">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{/* Waktu Kematian */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Waktu Dinyatakan Meninggal (Pronounced Dead) :
							</label>
							<input
								type="datetime-local"
								value={entryDetail.death_datetime || `${visitDate || "2026-08-13"}T${visitTime || "10:30"}`}
								onChange={(e) => handleFieldChange("death_datetime", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
							/>
						</div>

						{/* Dokter Yang Menyatakan */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Dokter Yang Menyatakan Kematian :
							</label>
							<input
								type="text"
								value={entryDetail.declaring_doctor || doctorName}
								onChange={(e) => handleFieldChange("declaring_doctor", e.target.value)}
								placeholder="Nama Dokter..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
							/>
						</div>

						{/* No. Bed / Kamar */}
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								No. Kamar / Bed (jika di Ranap) :
							</label>
							<input
								type="text"
								value={entryDetail.death_room_bed || "Bed 302-A"}
								onChange={(e) => handleFieldChange("death_room_bed", e.target.value)}
								placeholder="Contoh: Kamar 302 Bed A / Ruang ICU Bed 2"
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
							/>
						</div>
					</div>

					{/* Lokasi Kematian */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
							Lokasi / Ruangan Kematian Pasien :
						</label>
						<div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-bold">
							{[
								{ key: "IGD", label: "IGD / Triase" },
								{ key: "Rawat Inap", label: "Bangsal Rawat Inap" },
								{ key: "IBS", label: "Kamar Operasi (IBS)" },
								{ key: "ICU", label: "ICU / HCU / ICCU" },
								{ key: "DOA", label: "DOA (Death on Arrival)" },
							].map((opt) => {
								const active = (entryDetail.death_location || "IGD") === opt.key;
								return (
									<label
										key={opt.key}
										className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
											active ? "bg-slate-900 text-white border-slate-900 font-extrabold shadow-2xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
										}`}
									>
										<span className="text-xs">{opt.label}</span>
										<input
											type="radio"
											name="death_location"
											checked={active}
											onChange={() => handleFieldChange("death_location", opt.key)}
											className="accent-rose-500 h-4 w-4"
										/>
									</label>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* 2. KATEGORI & SIFAT KEMATIAN */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<ShieldAlert className="h-4 w-4 text-slate-700" />
					2. KATEGORI & SIFAT KEMATIAN PASIEN
				</span>

				<div className="space-y-4 text-xs">
					{/* Kategori Kematian */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
							Klasifikasi Kategori Kematian :
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							{[
								{ key: "Kematian Wajar", label: "Kematian Wajar (Natural Death)", desc: "Akibat penyakit atau kondisi medis" },
								{ key: "Kematian Tidak Wajar", label: "Kematian Tidak Wajar (Unnatural Death)", desc: "Akibat kecelakaan, trauma, kecacatan berat, dll" },
								{ key: "DOA", label: "Death on Arrival (DOA)", desc: "Pasien sudah meninggal saat tiba di faskes" },
							].map((opt) => {
								const active = (entryDetail.death_category || "Kematian Wajar") === opt.key;
								return (
									<label
										key={opt.key}
										className={`p-3.5 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition ${
											active
												? "bg-rose-50/80 border-rose-300 ring-1 ring-rose-400/30 text-rose-950 font-bold"
												: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
										}`}
									>
										<div className="flex items-center justify-between mb-1">
											<span className="text-xs font-black">{opt.label}</span>
											<input
												type="radio"
												name="death_category"
												checked={active}
												onChange={() => handleFieldChange("death_category", opt.key)}
												className="accent-rose-700 h-4 w-4"
											/>
										</div>
										<span className="text-[10px] text-slate-500 font-medium">{opt.desc}</span>
									</label>
								);
							})}
						</div>
					</div>

					{/* Perlu Otopsi / Visum */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
						<span className="font-bold text-slate-800">
							Perlu Otopsi / Visum et Repertum (Khusus Kematian Tidak Wajar / Laporan Kepolisian) :
						</span>
						<div className="flex items-center gap-4 font-bold">
							{[
								{ key: "Ya", label: "Ya (Perlu Visum/Otopsi)" },
								{ key: "Tidak", label: "Tidak Perlu Visum" },
							].map((opt) => {
								const active = (entryDetail.autopsy_required || "Tidak") === opt.key;
								return (
									<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
										<input
											type="radio"
											name="autopsy_req"
											checked={active}
											onChange={() => handleFieldChange("autopsy_required", opt.key)}
											className="accent-rose-700 h-4 w-4"
										/>
										<span>{opt.label}</span>
									</label>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* 3. PENYEBAB KEMATIAN (SEBAB KEMATIAN BERANTAI WHO / KEMENKES ICD-10) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<Activity className="h-4 w-4 text-slate-700" />
					3. PENYEBAB KEMATIAN BERANTAI (CHAIN OF EVENTS - STANDAR WHO / ICD-10)
				</span>

				<div className="space-y-4 text-xs">
					{/* 3A. Penyebab Langsung (Immediate Cause) */}
					<div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
						<span className="block text-[10px] font-black uppercase text-rose-950">
							A. Penyebab Langsung (Immediate Cause of Death) :
						</span>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div className="md:col-span-2 relative">
								<input
									type="text"
									value={entryDetail.cause_immediate_icd10 || icdDirectSearch}
									onChange={(e) => {
										setIcdDirectSearch(e.target.value);
										setIcdDirectOpen(true);
										handleFieldChange("cause_immediate_icd10", e.target.value);
									}}
									onFocus={() => setIcdDirectOpen(true)}
									placeholder="Cari Kode ICD-10 Penyebab Langsung (misal: I46.9 - Cardiac Arrest, J96.0 - Acute Respiratory Failure)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-rose-700 focus:outline-none"
								/>
								{icdDirectOpen && icdDirectResults.length > 0 && (
									<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
										{icdDirectResults.map((item) => (
											<button
												key={item.code}
												type="button"
												onClick={() => {
													handleFieldChange("cause_immediate_icd10", `${item.code} - ${item.name}`);
													setIcdDirectSearch(`${item.code} - ${item.name}`);
													setIcdDirectOpen(false);
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
							<div>
								<input
									type="text"
									value={entryDetail.cause_immediate_duration || "15 Menit"}
									onChange={(e) => handleFieldChange("cause_immediate_duration", e.target.value)}
									placeholder="Masa/Durasi Sakit (misal: 15 menit)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								/>
							</div>
						</div>
					</div>

					{/* 3B. Penyebab Antara (Intermediate Cause) */}
					<div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
						<span className="block text-[10px] font-black uppercase text-amber-950">
							B. Penyebab Antara (Intermediate Cause of Death) :
						</span>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div className="md:col-span-2 relative">
								<input
									type="text"
									value={entryDetail.cause_intermediate_icd10 || icdInterSearch}
									onChange={(e) => {
										setIcdInterSearch(e.target.value);
										setIcdInterOpen(true);
										handleFieldChange("cause_intermediate_icd10", e.target.value);
									}}
									onFocus={() => setIcdInterOpen(true)}
									placeholder="Cari Kode ICD-10 Penyebab Antara (misal: J18.9 - Pneumonia, J81 - Pulmonary Edema)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-700 focus:outline-none"
								/>
								{icdInterOpen && icdInterResults.length > 0 && (
									<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
										{icdInterResults.map((item) => (
											<button
												key={item.code}
												type="button"
												onClick={() => {
													handleFieldChange("cause_intermediate_icd10", `${item.code} - ${item.name}`);
													setIcdInterSearch(`${item.code} - ${item.name}`);
													setIcdInterOpen(false);
												}}
												className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
											>
												<span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] mr-2">{item.code}</span>
												<span className="font-semibold text-slate-800 text-[11px] flex-1">{item.name}</span>
											</button>
										))}
									</div>
								)}
							</div>
							<div>
								<input
									type="text"
									value={entryDetail.cause_intermediate_duration || "3 Hari"}
									onChange={(e) => handleFieldChange("cause_intermediate_duration", e.target.value)}
									placeholder="Masa/Durasi Sakit (misal: 3 hari)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								/>
							</div>
						</div>
					</div>

					{/* 3C. Penyebab Dasar (Underlying Cause) */}
					<div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2">
						<span className="block text-[10px] font-black uppercase text-teal-950">
							C. Penyebab Dasar Utama (Underlying Cause of Death) :
						</span>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div className="md:col-span-2 relative">
								<input
									type="text"
									value={entryDetail.cause_underlying_icd10 || icdUnderlyingSearch}
									onChange={(e) => {
										setIcdUnderlyingSearch(e.target.value);
										setIcdUnderlyingOpen(true);
										handleFieldChange("cause_underlying_icd10", e.target.value);
									}}
									onFocus={() => setIcdUnderlyingOpen(true)}
									placeholder="Cari Kode ICD-10 Penyebab Dasar Paling Awal (misal: E11.9 - Type 2 Diabetes, I63 - Stroke)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
								{icdUnderlyingOpen && icdUnderlyingResults.length > 0 && (
									<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-lg">
										{icdUnderlyingResults.map((item) => (
											<button
												key={item.code}
												type="button"
												onClick={() => {
													handleFieldChange("cause_underlying_icd10", `${item.code} - ${item.name}`);
													setIcdUnderlyingSearch(`${item.code} - ${item.name}`);
													setIcdUnderlyingOpen(false);
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
							<div>
								<input
									type="text"
									value={entryDetail.cause_underlying_duration || "5 Tahun"}
									onChange={(e) => handleFieldChange("cause_underlying_duration", e.target.value)}
									placeholder="Masa/Durasi Sakit (misal: 5 tahun)..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								/>
							</div>
						</div>
					</div>

					{/* 3D. Kondisi Penyerta Komorbid */}
					<div>
						<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
							D. Kondisi Komorbid / Penyerta Lain (Contributory Causes) :
						</label>
						<input
							type="text"
							value={entryDetail.cause_contributory || "Hipertensi Derajat II, Gagal Ginjal Kronis Stg IV"}
							onChange={(e) => handleFieldChange("cause_contributory", e.target.value)}
							placeholder="Kondisi komorbid lain yang berkontribusi tetapi tidak langsung memicu..."
							className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* 4. TINDAKAN RESUSITASI TERAKHIR (RESUSCITATION LOG / CPR) */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<HeartOff className="h-4 w-4 text-slate-700" />
					4. TINDAKAN RESUSITASI TERAKHIR (RESUSCITATION LOG / CPR)
				</span>

				<div className="space-y-4 text-xs">
					{/* Status Upaya RJP */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
						<span className="font-bold text-slate-800">
							Upaya Resusitasi Jantung Paru (RJP / CPR) :
						</span>
						<div className="flex items-center gap-4 font-bold">
							{[
								{ key: "Dilakukan", label: "Dilakukan RJP / CPR" },
								{ key: "Tidak Dilakukan", label: "Tidak Dilakukan (DNR - Do Not Resuscitate)" },
							].map((opt) => {
								const active = (entryDetail.cpr_performed || "Dilakukan") === opt.key;
								return (
									<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
										<input
											type="radio"
											name="cpr_performed"
											checked={active}
											onChange={() => handleFieldChange("cpr_performed", opt.key)}
											className="accent-slate-900 h-4 w-4"
										/>
										<span>{opt.label}</span>
									</label>
								);
							})}
						</div>
					</div>

					{/* Detail Log RJP jika Dilakukan */}
					{(entryDetail.cpr_performed || "Dilakukan") === "Dilakukan" && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
									Jam Mulai RJP :
								</label>
								<input
									type="time"
									value={entryDetail.cpr_start_time || "10:00"}
									onChange={(e) => handleFieldChange("cpr_start_time", e.target.value)}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								/>
							</div>

							<div>
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
									Jam Selesai / Dihentikan RJP :
								</label>
								<input
									type="time"
									value={entryDetail.cpr_end_time || "10:30"}
									onChange={(e) => handleFieldChange("cpr_end_time", e.target.value)}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								/>
							</div>

							<div>
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
									Penyebab RJP Dihentikan :
								</label>
								<select
									value={entryDetail.cpr_stop_reason || "Asistol Permanen"}
									onChange={(e) => handleFieldChange("cpr_stop_reason", e.target.value)}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								>
									<option value="Asistol Permanen">Asistol Permanen (Flat EKG &gt;20 mnt)</option>
									<option value="Pupil Miosis Total">Pupil Miosis / Midriasis Total Unrespon</option>
									<option value="Tidak Ada Respon">Tidak Ada Respon Autonom/Refleks</option>
								</select>
							</div>

							<div className="md:col-span-3">
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
									Obat-Obatan Emergensi / Defibrilasi yang Diberikan :
								</label>
								<textarea
									rows={2}
									value={entryDetail.cpr_emergency_meds || "Epinefrin 1mg Injeksi IV (3x pemberian tiap 5 mnt), Defibrilasi 200 Joules (1x)"}
									onChange={(e) => handleFieldChange("cpr_emergency_meds", e.target.value)}
									placeholder="Daftar obat resusitasi yang sudah dimasukkan..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900"
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 5. PENYERAHAN JENAZAH & PENERIMA / KELUARGA */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<UserCheck className="h-4 w-4 text-slate-700" />
					5. SERAH TERIMA JENAZAH & KELUARGA PENERIMA
				</span>

				<div className="space-y-4 text-xs">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								Nama Penerima Jenazah (Keluarga / Wali) :
							</label>
							<input
								type="text"
								value={entryDetail.receiver_name || escortName || "Bpk. Bambang Wijaya"}
								onChange={(e) => handleFieldChange("receiver_name", e.target.value)}
								placeholder="Nama Lengkap Penanggung Jawab..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
							/>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								NIK & Hubungan dengan Almarhum/ah :
							</label>
							<div className="flex items-center gap-2">
								<input
									type="text"
									value={entryDetail.receiver_nik || "3273012345670001"}
									onChange={(e) => handleFieldChange("receiver_nik", e.target.value)}
									placeholder="NIK Penerima..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
								/>
								<select
									value={entryDetail.receiver_relation || escortRelation || "Suami / Istri"}
									onChange={(e) => handleFieldChange("receiver_relation", e.target.value)}
									className="w-40 rounded-xl border border-slate-300 bg-white px-2 py-2 font-bold text-slate-900"
								>
									<option value="Suami / Istri">Suami / Istri</option>
									<option value="Anak Kandung">Anak Kandung</option>
									<option value="Orang Tua">Orang Tua</option>
									<option value="Saudara Kandung">Saudara Kandung</option>
									<option value="Wali / Kerabat">Wali / Kerabat</option>
								</select>
							</div>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-1">
								No. Telepon / HP Keluarga :
							</label>
							<input
								type="text"
								value={entryDetail.receiver_phone || escortPhone || "081234567890"}
								onChange={(e) => handleFieldChange("receiver_phone", e.target.value)}
								placeholder="No. Handphone..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
							/>
						</div>
					</div>

					{/* Rencana Pemulasaraan */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Rencana Pemulasaraan Jenazah :
							</label>
							<select
								value={entryDetail.mortuary_plan || "Langsung Dibawa Pulang"}
								onChange={(e) => handleFieldChange("mortuary_plan", e.target.value)}
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
							>
								<option value="Kamar Jenazah Faskes">Ditinggalkan di Pemulasaraan (Kamar Jenazah Faskes)</option>
								<option value="Langsung Dibawa Pulang">Langsung Dibawa Pulang oleh Keluarga</option>
								<option value="Rujuk Visum RS Lain">Di-rujuk ke RS Lain untuk Visum/Otopsi</option>
							</select>
						</div>

						<div>
							<label className="block text-[10px] font-extrabold uppercase text-slate-700 mb-2">
								Kebutuhan Ambulans Jenazah :
							</label>
							<div className="flex items-center gap-4 py-1.5 font-bold">
								{[
									{ key: "Ambulance Faskes", label: "Ambulans Jenazah Faskes" },
									{ key: "Mandiri", label: "Mandiri / Mobil Keluarga" },
								].map((opt) => {
									const active = (entryDetail.hearse_needed || "Ambulance Faskes") === opt.key;
									return (
										<label key={opt.key} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="hearse_opt"
												checked={active}
												onChange={() => handleFieldChange("hearse_needed", opt.key)}
												className="accent-slate-900 h-4 w-4"
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

			{/* 6. PENGESAHAN LEGAL & TANDA TANGAN */}
			<div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
				<span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
					<FileCheck className="h-4 w-4 text-slate-700" />
					6. PENGESAHAN LEGAL MEDIS & TANDA TANGAN SAKSI
				</span>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
					{/* Dokter Menyatakan */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
						<span className="block text-[9px] font-extrabold uppercase text-slate-500">Dokter Yang Menyatakan :</span>
						<span className="block text-xs font-black text-slate-900">{doctorName}</span>
						<span className="block text-[10px] text-slate-600 font-bold">{doctorSpecialty}</span>
						<div className="mt-3 py-1 bg-white rounded-lg border border-slate-300 text-slate-800 text-[10px] font-extrabold flex items-center justify-center gap-1">
							<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
							<span>E-Signature Dokter Verified</span>
						</div>
					</div>

					{/* Saksi Perawat */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
						<span className="block text-[9px] font-extrabold uppercase text-slate-500">Perawat Saksi II :</span>
						<input
							type="text"
							value={entryDetail.nurse_witness || "Ns. Rahmawati, S.Kep"}
							onChange={(e) => handleFieldChange("nurse_witness", e.target.value)}
							placeholder="Nama Perawat..."
							className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-center"
						/>
						<div className="mt-2 py-1 bg-white rounded-lg border border-slate-300 text-slate-700 text-[10px] font-extrabold flex items-center justify-center gap-1">
							<CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
							<span>Saksi Medis Verified</span>
						</div>
					</div>

					{/* Saksi Keluarga */}
					<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-center">
						<span className="block text-[9px] font-extrabold uppercase text-slate-500">Penanggung Jawab Keluarga :</span>
						<span className="block text-xs font-black text-slate-900">{entryDetail.receiver_name || escortName || "Keluarga Pasien"}</span>
						<span className="block text-[10px] text-slate-600 font-bold">{entryDetail.receiver_relation || "Keluarga Kandung"}</span>
						<div className="mt-3 py-1 bg-white rounded-lg border border-slate-300 text-slate-800 text-[10px] font-extrabold flex items-center justify-center gap-1">
							<CheckCircle2 className="h-3.5 w-3.5 text-slate-700" />
							<span>Tandatangan Disetujui</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
