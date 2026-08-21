"use client";

import React, { useState, useMemo } from "react";
import DischargeSummary from "./DischargeSummary";
import ModernSelect from "@/components/ui/ModernSelect";
import {
	createOrUpdateSupportTestRequest,
	getSupportTestRequestByVisit,
	SupportTestRequest,
} from "@/services/supportTestStorage";
import {
	User,
	Users,
	Bed,
	Calendar,
	Clock,
	ShieldCheck,
	FileText,
	CheckCircle2,
	Phone,
	MapPin,
	CreditCard,
	Check,
	Building2,
	Activity,
	HeartPulse,
	Send,
	CheckCircle,
} from "lucide-react";

const FALLBACK_ROOM_CATALOG = [
	{ value: "Paviliun Anggrek VIP 302-A", name: "Paviliun Anggrek", code: "302-A", class: "VIP", room: "302", bed: "A", phone: "Ext. 302", price: 750000 },
	{ value: "Paviliun Anggrek VVIP 301-A", name: "Paviliun Anggrek", code: "301-A", class: "VVIP", room: "301", bed: "A", phone: "Ext. 301", price: 1250000 },
	{ value: "Ruang Mawar Kelas 1 201-A", name: "Ruang Mawar", code: "201-A", class: "Kelas 1", room: "201", bed: "A", phone: "Ext. 201", price: 450000 },
	{ value: "Ruang Melati Kelas 2 105-B", name: "Ruang Melati", code: "105-B", class: "Kelas 2", room: "105", bed: "B", phone: "Ext. 105", price: 300000 },
	{ value: "Ruang Dahlia Kelas 3 101-C", name: "Ruang Dahlia", code: "101-C", class: "Kelas 3", room: "101", bed: "C", phone: "Ext. 101", price: 175000 },
	{ value: "Ruang ICU / HCU 02", name: "Ruang ICU", code: "ICU-02", class: "ICU / HCU", room: "ICU-02", bed: "02", phone: "Ext. 911", price: 1500000 },
];

export default function FormRanap({

	entryDetail = {} as any,
	type = "rawat_inap",
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
	includeObat,
	onToggleIncludeObat,
}: any) {
	// Auto-synced Data Identitas Pasien
	const patientName = selectedPatient?.name || selectedPatient?.patientName || selectedPatient?.patient_name || entryDetail.patient_name || "";
	const noRM = selectedPatient?.mr_number || selectedPatient?.no_rm || selectedPatient?.patientId || entryDetail.no_rm || "-------";
	const gender = selectedPatient?.sex || selectedPatient?.gender || selectedPatient?.jenis_kelamin || entryDetail.gender || "L";
	const dob = selectedPatient?.date_of_birth || selectedPatient?.birth_date || selectedPatient?.dob || entryDetail.dob || "";
	const pob = selectedPatient?.pob || selectedPatient?.tempat_lahir || entryDetail.pob || "";
	const religion = selectedPatient?.religion || selectedPatient?.agama || entryDetail.religion || "Islam";
	const address = selectedPatient?.address || selectedPatient?.alamat || entryDetail.address || "";
	const phone = selectedPatient?.phone || selectedPatient?.telepon || selectedPatient?.no_hp || entryDetail.phone || "";
	const occupation = selectedPatient?.occupation || selectedPatient?.pekerjaan || entryDetail.occupation || "";
	const education = selectedPatient?.education || selectedPatient?.pendidikan || entryDetail.education || "";

	// Auto-synced Data Penanggung Jawab
	const pjName = escortName || selectedPatient?.emergency_contact_name || entryDetail.guarantor_name || "";
	const pjRelation = escortRelation || selectedPatient?.emergency_contact_relation || entryDetail.guarantor_relation || "";
	const pjPhone = escortPhone || selectedPatient?.emergency_contact_phone || entryDetail.guarantor_phone || "";

	// Auto-synced Data DPJP
	const doctorName = selectedDoctor?.name || selectedDoctor?.doctor_name || entryDetail.dpjp_doctor || "DPJP Belum Dipilih";
	const doctorSpecialty = selectedDoctor?.specialist || selectedDoctor?.specialty || entryDetail.dpjp_specialty || "Spesialis";

	// Detect mode penjaminan pembayaran dari Step 2 Kunjungan (paymentType)
	const normPaymentType = (paymentType || "").toLowerCase().trim();
	const isInsuranceType =
		normPaymentType.includes("bpjs") ||
		normPaymentType.includes("asuransi") ||
		normPaymentType.includes("perusahaan") ||
		normPaymentType.includes("inhealth") ||
		normPaymentType.includes("penjamin");

	const currentGuaranteeType = entryDetail.payment_guarantee_type || (isInsuranceType ? "Perusahaan/Asuransi" : "Pribadi");

	// Format No. RM 6 Digit Badge
	const rmDigits = noRM && noRM !== "-------"
		? (String(noRM).replace(/\D/g, "")).padStart(6, "0").slice(-6).split("")
		: ["-", "-", "-", "-", "-", "-"];

	const [icuReq, setIcuReq] = useState<SupportTestRequest | null>(null);
	const activeVisitId = visitId || entryDetail.visit_id || "VISIT-20260821-SEDC";

	React.useEffect(() => {
		const checkIcu = () => {
			const found = getSupportTestRequestByVisit(activeVisitId, "icu");
			setIcuReq(found || null);
		};
		checkIcu();
		const interval = setInterval(checkIcu, 2000);
		return () => clearInterval(interval);
	}, [activeVisitId]);

	const handleSendIcuRequest = () => {
		const pName = selectedPatient?.name || entryDetail.patient_name || "Pasien Rawat Inap";
		const nRm = selectedPatient?.mr_number || entryDetail.no_rm || "RM-00129";
		const docName = doctorName || "Dokter DPJP";

		const newReq = createOrUpdateSupportTestRequest({
			category: "icu",
			visitId: activeVisitId,
			patientName: pName,
			noRm: nRm,
			requestOrigin: "Instalasi Rawat Inap (Ranap)",
			testDetails: entryDetail.icu_notes || "Permintaan Transfer & Perawatan Intensif Pasien di Ruang ICU/HCU",
			doctorName: docName,
		});
		setIcuReq(newReq);
	};

	const handleFieldChange = (field, value) => {
		onUpdateDetailField(type, field, value);
	};

	// Formatted Room Options - Hanya Nama Ruangan Saja
	const masterRoomOptions = useMemo(() => {
		const list = roomOptions.length > 0 ? roomOptions : FALLBACK_ROOM_CATALOG;
		const roomNames = Array.from(
			new Set(list.map((r) => r.name || r.value || r.label).filter(Boolean))
		);
		return roomNames.map((name) => ({
			value: name,
			label: name,
		}));
	}, [roomOptions]);

	// Auto-fill dari Relasi Data Master Finance Ruangan (/dashboard/faskes/finance/ruangan)
	const handleSelectMasterRoom = (selectedVal) => {
		handleFieldChange("selected_master_room", selectedVal);
		
		const list = roomOptions.length > 0 ? roomOptions : FALLBACK_ROOM_CATALOG;
		const found = list.find((r) => r.value === selectedVal || r.name === selectedVal || r.code === selectedVal);
		
		if (found) {
			handleFieldChange("room_type", found.name || found.value);
			
			// Detect Class
			const rawClass = found.class || found.category || "";
			const lower = (found.name || found.value || rawClass).toLowerCase();
			let detectedClass = rawClass || "VIP";
			if (lower.includes("vvip")) detectedClass = "VVIP";
			else if (lower.includes("vip")) detectedClass = "VIP";
			else if (lower.includes("kelas 1") || lower.includes("k1")) detectedClass = "Kelas 1";
			else if (lower.includes("kelas 2") || lower.includes("k2")) detectedClass = "Kelas 2";
			else if (lower.includes("kelas 3") || lower.includes("k3") || lower.includes("bpjs")) detectedClass = "Kelas 3";
			else if (lower.includes("icu") || lower.includes("hcu")) detectedClass = "ICU / HCU";
			
			handleFieldChange("room_class", detectedClass);

			// Detect Kamar & Bed
			if (found.room) handleFieldChange("room_number", found.room);
			else if (found.code && found.code.includes("-")) {
				const parts = found.code.split("-");
				handleFieldChange("room_number", parts[0] || "302");
				if (parts[1]) handleFieldChange("bed_number", parts[1]);
			} else {
				handleFieldChange("room_number", "302");
			}

			if (found.bed) handleFieldChange("bed_number", found.bed);
			else if (!entryDetail.bed_number) handleFieldChange("bed_number", "A");

			if (found.phone) handleFieldChange("room_phone", found.phone);
			else handleFieldChange("room_phone", `Ext. ${entryDetail.room_number || "302"}`);

			if (found.price) handleFieldChange("room_price", String(found.price));
		}
	};

	return (
		<div className="space-y-6 font-sans text-slate-900">
			{/* KARTU FORMULIR DOKUMEN PENDAFTARAN RAWAT INAP */}
			<div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm space-y-6">
				
				{/* DOKUMEN HEADER BAR */}
				<div className="border-b-2 border-slate-900 pb-4 space-y-3">

					{/* REGISTRATION METADATA BAR */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-xs font-semibold">
						{/* No. Register */}
						<div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
							<span className="text-[10px] font-black uppercase text-slate-500 shrink-0">No. Register :</span>
							<input
								type="text"
								value={entryDetail.register_number || visitId || "REG-RANAP-2026-001"}
								onChange={(e) => handleFieldChange("register_number", e.target.value)}
								className="w-full bg-transparent font-bold text-slate-900 focus:outline-none"
							/>
						</div>

						{/* Kode Kategori Pasien (K / P / U / A) */}
						<div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
							<span className="text-[10px] font-black uppercase text-slate-500 shrink-0">Kode Pasien :</span>
							<div className="flex items-center gap-1.5 font-bold">
								{[
									{ key: "K", label: "K (Kebidanan)" },
									{ key: "P", label: "P (Anak)" },
									{ key: "U", label: "U (Umum)" },
									{ key: "A", label: "A (BPJS/Anggota)" },
								].map((cat) => {
									const active = (entryDetail.kode_pasien || "U") === cat.key;
									return (
										<button
											key={cat.key}
											type="button"
											onClick={() => handleFieldChange("kode_pasien", cat.key)}
											className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold cursor-pointer border transition ${
												active ? "bg-teal-800 text-white border-teal-800 shadow-2xs" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
											}`}
											title={cat.label}
										>
											{cat.key}
										</button>
									);
								})}
							</div>
						</div>

						{/* No. Rekam Medis (6 Digit Badges) */}
						<div className="flex items-center justify-between bg-teal-50/60 px-3 py-2 rounded-xl border border-teal-200">
							<span className="text-[10px] font-black uppercase text-teal-900 shrink-0">No. Rekam Medis :</span>
							<div className="flex items-center gap-1">
								{rmDigits.map((digit, idx) => (
									<span
										key={idx}
										className="h-6 w-6 rounded-md bg-white border border-teal-300 text-teal-950 font-mono font-black text-xs flex items-center justify-center shadow-2xs"
									>
										{digit}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* A. IDENTITAS PASIEN */}
				<div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/40">
					<div className="flex items-center gap-2 border-b border-slate-200 pb-2">
						<span className="h-6 w-6 rounded-lg bg-teal-800 text-white font-black text-xs flex items-center justify-center">
							A
						</span>
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
							IDENTITAS PASIEN
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
						{/* Nama Pasien & Gender */}
						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Nama Pasien :</label>
							<div className="flex items-center gap-2">
								<input
									type="text"
									value={entryDetail.patient_name || patientName}
									onChange={(e) => handleFieldChange("patient_name", e.target.value)}
									placeholder="Nama lengkap pasien..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
								<div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-xl border border-slate-300">
									{["L", "P"].map((g) => (
										<button
											key={g}
											type="button"
											onClick={() => handleFieldChange("gender", g)}
											className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition ${
												(entryDetail.gender || gender) === g
													? "bg-teal-800 text-white shadow-2xs"
													: "text-slate-600 hover:bg-slate-100"
											}`}
										>
											{g}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Tempat & Tanggal Lahir | Agama */}
						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-1">
								<label className="block text-[10px] font-extrabold uppercase text-slate-600">Tempat & Tgl Lahir :</label>
								<input
									type="text"
									value={entryDetail.pob_dob || (pob && dob ? `${pob}, ${dob}` : dob || pob)}
									onChange={(e) => handleFieldChange("pob_dob", e.target.value)}
									placeholder="Kota, DD/MM/YYYY"
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div className="space-y-1">
								<label className="block text-[10px] font-extrabold uppercase text-slate-600">Agama :</label>
								<input
									type="text"
									value={entryDetail.religion || religion}
									onChange={(e) => handleFieldChange("religion", e.target.value)}
									placeholder="Agama..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>

						{/* Alamat Rumah Sesuai KTP */}
						<div className="md:col-span-2 space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Alamat Rumah (Sesuai KTP) :</label>
							<input
								type="text"
								value={entryDetail.address || address}
								onChange={(e) => handleFieldChange("address", e.target.value)}
								placeholder="Jl. Jalan No. XX..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Detail Wilayah Alamat Pasien */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:col-span-2">
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Kelurahan :</label>
								<input
									type="text"
									value={entryDetail.kelurahan || ""}
									onChange={(e) => handleFieldChange("kelurahan", e.target.value)}
									placeholder="Kelurahan..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Kecamatan :</label>
								<input
									type="text"
									value={entryDetail.kecamatan || ""}
									onChange={(e) => handleFieldChange("kecamatan", e.target.value)}
									placeholder="Kecamatan..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Kota / Wilayah :</label>
								<input
									type="text"
									value={entryDetail.city || ""}
									onChange={(e) => handleFieldChange("city", e.target.value)}
									placeholder="Kota/Kab..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Telepon / HP :</label>
								<input
									type="text"
									value={entryDetail.phone || phone}
									onChange={(e) => handleFieldChange("phone", e.target.value)}
									placeholder="08xxxxxxxxxx"
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>

						{/* Pekerjaan, Pendidikan & Alamat Kantor */}
						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Pendidikan / Pekerjaan :</label>
							<div className="grid grid-cols-2 gap-2">
								<input
									type="text"
									value={entryDetail.education || education}
									onChange={(e) => handleFieldChange("education", e.target.value)}
									placeholder="Pendidikan..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
								<input
									type="text"
									value={entryDetail.occupation || occupation}
									onChange={(e) => handleFieldChange("occupation", e.target.value)}
									placeholder="Pekerjaan..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Alamat Kantor Pasien :</label>
							<input
								type="text"
								value={entryDetail.office_address || ""}
								onChange={(e) => handleFieldChange("office_address", e.target.value)}
								placeholder="Alamat perusahaan / kantor tempat bekerja..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Riwayat Pernah Dirawat */}
						<div className="md:col-span-2 p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
							<span className="text-[11px] font-bold text-slate-700">
								Apakah pasien pernah dirawat di Rumah Sakit ini sebelumnya?
							</span>
							<div className="flex items-center gap-4 text-xs font-semibold">
								{["Tidak Pernah", "Pernah Dirawat"].map((opt) => {
									const isPernah = opt === "Pernah Dirawat";
									const active = !!entryDetail.has_previous_admission === isPernah;
									return (
										<label key={opt} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
											<input
												type="radio"
												name="has_prev_adm"
												checked={active}
												onChange={() => handleFieldChange("has_previous_admission", isPernah)}
												className="accent-teal-700"
											/>
											<span>{opt}</span>
										</label>
									);
								})}
								{entryDetail.has_previous_admission && (
									<input
										type="text"
										value={entryDetail.prev_admission_date || ""}
										onChange={(e) => handleFieldChange("prev_admission_date", e.target.value)}
										placeholder="Tgl/Bln/Thn pernah dirawat..."
										className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* B. IDENTITAS PENANGGUNG JAWAB */}
				<div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/40">
					<div className="flex items-center gap-2 border-b border-slate-200 pb-2">
						<span className="h-6 w-6 rounded-lg bg-teal-800 text-white font-black text-xs flex items-center justify-center">
							B
						</span>
						<h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
							IDENTITAS PENANGGUNG JAWAB PASIEN
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
						{/* Nama Penanggung Jawab & Hubungan */}
						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Nama (Sesuai KTP) :</label>
							<input
								type="text"
								value={entryDetail.guarantor_name || pjName}
								onChange={(e) => handleFieldChange("guarantor_name", e.target.value)}
								placeholder="Nama lengkap penanggung jawab..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Hubungan dengan Pasien Sebagai :</label>
							<input
								type="text"
								value={entryDetail.guarantor_relation || pjRelation}
								onChange={(e) => handleFieldChange("guarantor_relation", e.target.value)}
								placeholder="Suami / Istri / Orang Tua / Anak / Saudara / Dll..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Alamat Penanggung Jawab */}
						<div className="md:col-span-2 space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Alamat Rumah Penanggung Jawab :</label>
							<input
								type="text"
								value={entryDetail.guarantor_address || address}
								onChange={(e) => handleFieldChange("guarantor_address", e.target.value)}
								placeholder="Alamat rumah penanggung jawab..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						{/* Detail Wilayah Penanggung Jawab */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:col-span-2">
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Kelurahan :</label>
								<input
									type="text"
									value={entryDetail.guarantor_kelurahan || ""}
									onChange={(e) => handleFieldChange("guarantor_kelurahan", e.target.value)}
									placeholder="Kelurahan..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Kecamatan :</label>
								<input
									type="text"
									value={entryDetail.guarantor_kecamatan || ""}
									onChange={(e) => handleFieldChange("guarantor_kecamatan", e.target.value)}
									placeholder="Kecamatan..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Kota / Wilayah :</label>
								<input
									type="text"
									value={entryDetail.guarantor_city || ""}
									onChange={(e) => handleFieldChange("guarantor_city", e.target.value)}
									placeholder="Kota/Kab..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-bold uppercase text-slate-500">Telepon / HP :</label>
								<input
									type="text"
									value={entryDetail.guarantor_phone || pjPhone}
									onChange={(e) => handleFieldChange("guarantor_phone", e.target.value)}
									placeholder="08xxxxxxxxxx"
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>

						{/* Pekerjaan & Alamat Kantor PJ */}
						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Pekerjaan Penanggung Jawab :</label>
							<input
								type="text"
								value={entryDetail.guarantor_occupation || ""}
								onChange={(e) => handleFieldChange("guarantor_occupation", e.target.value)}
								placeholder="Pekerjaan penanggung jawab..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>

						<div className="space-y-1">
							<label className="block text-[10px] font-extrabold uppercase text-slate-600">Alamat Kantor Penanggung Jawab :</label>
							<input
								type="text"
								value={entryDetail.guarantor_office_address || ""}
								onChange={(e) => handleFieldChange("guarantor_office_address", e.target.value)}
								placeholder="Alamat perusahaan tempat bekerja..."
								className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900 focus:border-teal-700 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				{/* C. KELAS PERAWATAN YANG DIMINTA */}
				<div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/40">
					<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
						<div className="flex items-center gap-2">
							<span className="h-6 w-6 rounded-lg bg-teal-800 text-white font-black text-xs flex items-center justify-center">
								C
							</span>
							<h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
								KELAS PERAWATAN YANG DIMINTA
							</h3>
						</div>
						<span className="text-[10px] font-extrabold text-slate-500 italic uppercase">
							(Diisi oleh Petugas Penerimaan Pasien / Admisi)
						</span>
					</div>

					<div className="space-y-4 text-xs">
						{/* Relasi Selector Master Ruangan dari Finance (Hanya Nama Ruangan Saja via ModernSelect) */}
						<div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
							<div className="flex items-center gap-2 text-xs font-black text-teal-950">
								<Building2 className="h-4 w-4 text-teal-700 shrink-0" />
								<span>Relasi Data Master Ruangan Finance :</span>
							</div>
							<div className="w-full sm:w-80">
								<ModernSelect
									options={roomOptions}
									value={entryDetail.selected_master_room || entryDetail.room_type || ""}
									onChange={(val) => handleSelectMasterRoom(val)}
									placeholder="Pilih Nama Ruangan..."
									icon={Building2}
								/>
							</div>
						</div>

						{/* Detail Ruang & Kamar (Synchronized & Editable) */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
							<div>
								<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Jenis Ruang :</label>
								<input
									type="text"
									value={entryDetail.room_type || "Paviliun Anggrek"}
									onChange={(e) => handleFieldChange("room_type", e.target.value)}
									placeholder="Nama ruang..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Kelas Perawatan :</label>
								<select
									value={entryDetail.room_class || "VIP"}
									onChange={(e) => handleFieldChange("room_class", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								>
									<option value="VVIP">VVIP</option>
									<option value="VIP">VIP</option>
									<option value="Kelas 1">Kelas 1</option>
									<option value="Kelas 2">Kelas 2</option>
									<option value="Kelas 3">Kelas 3 / BPJS</option>
									<option value="ICU / HCU">ICU / HCU</option>
								</select>
							</div>
							<div>
								<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">No. Kamar :</label>
								<input
									type="text"
									value={entryDetail.room_number || "302"}
									onChange={(e) => handleFieldChange("room_number", e.target.value)}
									placeholder="No. kamar..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">No. Bed :</label>
								<input
									type="text"
									value={entryDetail.bed_number || "A"}
									onChange={(e) => handleFieldChange("bed_number", e.target.value)}
									placeholder="Bed A/B..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[9px] font-extrabold uppercase text-slate-600 mb-1">Telepon Ruangan :</label>
								<input
									type="text"
									value={entryDetail.room_phone || "Ext. 302"}
									onChange={(e) => handleFieldChange("room_phone", e.target.value)}
									placeholder="Ext..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>

						{/* Tanggal & Jam Masuk | Dokter Pengirim */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div>
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Tanggal Masuk Ranap :</label>
								<input
									type="date"
									value={entryDetail.admission_date || visitDate || new Date().toISOString().split("T")[0]}
									onChange={(e) => handleFieldChange("admission_date", e.target.value)}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Jam Masuk :</label>
								<input
									type="time"
									value={entryDetail.admission_time || visitTime || "09:00"}
									onChange={(e) => handleFieldChange("admission_time", e.target.value)}
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
							<div>
								<label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">Dokter Pengirim / Perujuk :</label>
								<input
									type="text"
									value={entryDetail.referring_doctor || doctorName}
									onChange={(e) => handleFieldChange("referring_doctor", e.target.value)}
									placeholder="Nama dokter pengirim..."
									className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900 focus:border-teal-700 focus:outline-none"
								/>
							</div>
						</div>

						{/* Asal Pasien & Status Pasien */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{/* Asal Pasien Checkboxes */}
							<div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
								<span className="block text-[10px] font-black uppercase text-slate-600">Asal Pasien :</span>
								<div className="grid grid-cols-2 gap-2 font-semibold">
									{[
										{ key: "IGD", label: "Gawat Darurat / IGD" },
										{ key: "Klinik", label: "Poliklinik / Rawat Jalan" },
										{ key: "Rujukan", label: "Rujukan Faskes Luar" },
										{ key: "DokterTamu", label: "Dr. Tamu / Rekanan" },
									].map((opt) => {
										const active = (entryDetail.patient_source || "Klinik") === opt.key;
										return (
											<label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-800">
												<input
													type="radio"
													name="patient_source"
													checked={active}
													onChange={() => handleFieldChange("patient_source", opt.key)}
													className="accent-teal-700 h-4 w-4"
												/>
												<span>{opt.label}</span>
											</label>
										);
									})}
								</div>
							</div>

							{/* Status Pasien Checkboxes */}
							<div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
								<span className="block text-[10px] font-black uppercase text-slate-600">Status Pasien :</span>
								<div className="grid grid-cols-3 gap-2 font-semibold">
									{[
										{ key: "Rumah Sakit", label: "Rumah Sakit" },
										{ key: "Pribadi", label: "Pribadi" },
										{ key: "Rekanan", label: "Rekanan" },
									].map((opt) => {
										const active = (entryDetail.patient_status_category || "Rumah Sakit") === opt.key;
										return (
											<label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-800">
												<input
													type="radio"
													name="patient_status_category"
													checked={active}
													onChange={() => handleFieldChange("patient_status_category", opt.key)}
													className="accent-teal-700 h-4 w-4"
												/>
												<span>{opt.label}</span>
											</label>
										);
									})}
								</div>
							</div>
						</div>

						{/* Biaya Perawatan & Perusahaan / Asuransi (Synced Real-time dari Step 2 Kunjungan) */}
						<div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<span className="text-[10px] font-black uppercase text-slate-600">Biaya Perawatan / Penjaminan :</span>
								<div className="flex items-center gap-5 font-semibold">
									{[
										{ key: "Pribadi", label: "Pribadi / Umum" },
										{ key: "Perusahaan/Asuransi", label: "Perusahaan / Asuransi / BPJS" },
									].map((opt) => {
										const active = currentGuaranteeType === opt.key;
										return (
											<label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-800">
												<input
													type="radio"
													name="payment_guarantee_type"
													checked={active}
													onChange={() => {
														handleFieldChange("payment_guarantee_type", opt.key);
														if (opt.key === "Pribadi") {
															handleFieldChange("insurance_code", "");
															handleFieldChange("insurance_name", "");
														} else {
															if (!entryDetail.insurance_name) {
																handleFieldChange("insurance_name", paymentType || "BPJS KESEHATAN");
															}
															if (!entryDetail.insurance_code) {
																handleFieldChange("insurance_code", normPaymentType.includes("bpjs") ? "INS-BPJS-01" : "INS-ASR-01");
															}
														}
													}}
													className="accent-teal-700 h-4 w-4"
												/>
												<span>{opt.label}</span>
											</label>
										);
									})}
								</div>
							</div>

							{/* Input Perusahaan & Surat Jaminan (Conditional berdasarkan Pilihan Kunjungan) */}
							{currentGuaranteeType === "Perusahaan/Asuransi" ? (
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
									<div>
										<label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">Kode Perusahaan / Asuransi :</label>
										<input
											type="text"
											value={entryDetail.insurance_code || (normPaymentType.includes("bpjs") ? "INS-BPJS-01" : "INS-ASR-01")}
											onChange={(e) => handleFieldChange("insurance_code", e.target.value)}
											placeholder="Kode penjamin..."
											className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">Nama Perusahaan / Asuransi :</label>
										<input
											type="text"
											value={entryDetail.insurance_name || paymentType || (normPaymentType.includes("bpjs") ? "BPJS KESEHATAN" : "ASURANSI / PERUSAHAAN")}
											onChange={(e) => handleFieldChange("insurance_name", e.target.value)}
											placeholder="Nama penjamin..."
											className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-[9px] font-extrabold uppercase text-slate-500 mb-1">Surat Jaminan (SEP / GL) :</label>
										<div className="flex items-center gap-3 py-1 font-semibold">
											{["Ya", "Tidak"].map((opt) => {
												const active = (entryDetail.has_guarantee_letter || "Ya") === opt;
												return (
													<label key={opt} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
														<input
															type="radio"
															name="has_guarantee_letter"
															checked={active}
															onChange={() => handleFieldChange("has_guarantee_letter", opt)}
															className="accent-teal-700"
														/>
														<span>{opt}</span>
													</label>
												);
											})}
										</div>
									</div>
								</div>
							) : (
								<div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-lg">
									<span>Pasien Pembayaran Mandiri / Umum (Tanpa Penjaminan Perusahaan/Asuransi)</span>
									<span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-md border border-teal-200">
										{paymentType || "Pribadi / Umum"}
									</span>
								</div>
							)}

							<div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
								<span className="text-[10px] font-black uppercase text-slate-600">Dokter DPJP Utama Rawat Inap :</span>
								<span className="text-xs font-black text-teal-900 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
									{doctorName} ({doctorSpecialty})
								</span>
							</div>
						</div>
					</div>

				</div>

				{/* CARD PERAWATAN INTENSIF (ICU / HCU) */}
				<div className="p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/40 space-y-3 shadow-2xs">
					<div className="flex items-center justify-between">
						<label className="text-xs font-black uppercase text-rose-950 flex items-center gap-2">
							<HeartPulse className="h-4 w-4 text-rose-600" /> PERAWATAN INTENSIF (ICU / HCU)
						</label>
						<div className="flex items-center gap-3 text-xs font-extrabold">
							<label className="flex items-center gap-1 cursor-pointer">
								<input
									type="radio"
									name="need_icu_care"
									value="Ya"
									checked={entryDetail.need_icu_care === "Ya"}
									onChange={(e) => handleFieldChange("need_icu_care", e.target.value)}
									className="h-4 w-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
								/>
								<span>Ya</span>
							</label>
							<label className="flex items-center gap-1 cursor-pointer">
								<input
									type="radio"
									name="need_icu_care"
									value="Tidak"
									checked={entryDetail.need_icu_care === "Tidak"}
									onChange={(e) => handleFieldChange("need_icu_care", e.target.value)}
									className="h-4 w-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
								/>
								<span>Tidak</span>
							</label>
						</div>
					</div>

					{entryDetail.need_icu_care === "Ya" && (
						<div className="space-y-2 pt-1 border-t border-rose-100">
							<label className="block text-[11px] font-bold text-slate-700">
								Rincian / Indikasi Perawatan Intensif (ICU / HCU) yang Diminta:
							</label>
							<textarea
								rows={2}
								value={entryDetail.icu_notes || ""}
								onChange={(e) => handleFieldChange("icu_notes", e.target.value)}
								placeholder="Contoh: Pasien membutuhkan monitoring hemodinamik ketat, ventilator support, post-op cito..."
								className="w-full rounded-xl border border-rose-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-600"
							/>

							{(!icuReq || icuReq.status !== "SELESAI") && (
								<button
									type="button"
									onClick={handleSendIcuRequest}
									className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
								>
									<Send className="h-3.5 w-3.5" />
									<span>Kirim Permintaan ke /dashboard/faskes/medical-records/icu/request</span>
								</button>
							)}

							{icuReq?.status === "MENUNGGU_PROSES" && (
								<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
									<Clock className="h-4 w-4 text-amber-600 shrink-0 animate-spin" />
									<div>
										<div className="font-extrabold">Permintaan Perawatan ICU Telah Dikirim</div>
										<div className="text-[10px] text-amber-700">Menunggu diproses di halaman ICU Request.</div>
									</div>
								</div>
							)}

							{icuReq?.status === "SELESAI" && icuReq.resultData && (
								<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
									<div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
										<CheckCircle className="h-4 w-4 text-emerald-600" />
										<span>Hasil Observasi / Laporan ICU Terlampir (Dikirim Kembali dari Ruang ICU)</span>
									</div>
									<div className="bg-white p-2.5 rounded-lg border border-emerald-100 font-sans text-[11px] space-y-1 text-slate-800">
										{icuReq.resultData.roomType && <div>• Ruangan/Bed ICU: <span className="font-bold">{icuReq.resultData.roomType}</span></div>}
										{icuReq.resultData.doctorExpertise && <div>• DPJP Intensivis: <span className="font-bold">{icuReq.resultData.doctorExpertise}</span></div>}
										{icuReq.resultData.transferNotes && <div className="text-slate-600 pt-1 border-t border-slate-100">Catatan/Ringkasan ICU: {icuReq.resultData.transferNotes}</div>}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* SURAT PERNYATAAN & SIGNATURE BAR */}
				<div className="rounded-xl border border-slate-900/40 p-5 bg-gradient-to-r from-slate-50 via-teal-50/20 to-slate-50 space-y-4 shadow-2xs">
					<h3 className="text-center text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1.5">
						SURAT PERNYATAAN PERSETUJUAN RAWAT INAP
					</h3>

					<p className="text-xs text-slate-700 leading-relaxed font-medium text-justify italic">
						"Yang bertanda tangan di bawah ini menyatakan bersedia mematuhi seluruh peraturan dan tata tertib rawat inap Rumah Sakit Paru Rotinsulu serta bertanggung jawab penuh atas seluruh biaya perawatan pasien selama masa rawat inap."
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 text-center text-xs">
						{/* Tanda Tangan Penanggung Jawab Pasien */}
						<div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
							<span className="block text-[10px] font-bold text-slate-500 uppercase">
								Jakarta, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
							</span>
							<span className="block font-black text-slate-800 text-[11px]">Penanggung Jawab Pasien</span>
							<div className="h-16 w-full border border-dashed border-slate-300 rounded-lg bg-slate-50/60 flex items-center justify-center text-slate-400 font-semibold text-[10px] italic">
								( Tanda Tangan / E-Signature Penanggung Jawab )
							</div>
							<p className="font-bold text-slate-900 underline text-xs">
								( {entryDetail.guarantor_name || pjName || "........................................................"} )
							</p>
						</div>

						{/* Tanda Tangan Petugas Penerimaan Pasien / Admisi */}
						<div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
							<span className="block text-[10px] font-bold text-slate-500 uppercase">
								Petugas Admisi / Penerimaan Pasien
							</span>
							<span className="block font-black text-teal-800 text-[11px]">Verified Petugas Admisi RS</span>
							<div className="h-16 w-full border border-dashed border-teal-300 rounded-lg bg-teal-50/30 flex flex-col items-center justify-center text-teal-800 font-bold text-[10px]">
								<CheckCircle2 className="h-5 w-5 text-teal-600 mb-1" />
								<span>Verified E-Signature Admisi</span>
							</div>
							<p className="font-bold text-slate-900 underline text-xs">
								( Petugas Admisi RS Sugeng Waras )
							</p>
						</div>
					</div>

					<div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-300">
						<span>Distribusi Dokumen: Putih - Keuangan | Merah - Rekam Medis</span>
						<span>Halaman 1 dari 1</span>
					</div>
				</div>

				{/* RINGKASAN KONDISI SEBELUM MENINGGALKAN RAWAT INAP (DISCHARGE SUMMARY) */}
				<DischargeSummary
					processName="Rawat Inap"
					currentStatus={entryDetail.discharge_status || entryDetail.status || "Membaik"}
					hideRanapOption={true}
					onUpdateStatus={(val) => {
						handleFieldChange("discharge_status", val);
						handleFieldChange("status", val);

						const activeVisitId = visitId || entryDetail.visit_id || "VISIT-20260821-SEDC";
						const pName = selectedPatient?.name || entryDetail.patient_name || "Pasien Rawat Inap";
						const nRm = selectedPatient?.mr_number || entryDetail.no_rm || "RM-00129";
						const docName = doctorName || "Dokter DPJP";

						if (val.includes("Rujuk") || val.includes("Faskes")) {
							createOrUpdateSupportTestRequest({
								category: "rujuk",
								visitId: activeVisitId,
								patientName: pName,
								noRm: nRm,
								requestOrigin: "Instalasi Rawat Inap (Ranap)",
								testDetails: "Permintaan Rujukan Medis & Transfer Pasien Ranap ke Faskes Lain",
								doctorName: docName,
							});
						} else if (val.includes("Meninggal") || val === "Meninggal") {
							createOrUpdateSupportTestRequest({
								category: "death",
								visitId: activeVisitId,
								patientName: pName,
								noRm: nRm,
								requestOrigin: "Instalasi Rawat Inap (Ranap)",
								testDetails: "Permintaan Verifikasi & Penerbitan Surat Keterangan Kematian Pasien Ranap",
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
	);
}
