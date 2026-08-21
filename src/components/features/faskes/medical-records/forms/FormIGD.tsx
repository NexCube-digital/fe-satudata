"use client";

import React, { useState, useEffect } from "react";
import DischargeSummary from "./DischargeSummary";
import {
	Sparkles,
	ShieldAlert,
	HeartPulse,
	Zap,
	RotateCcw,
	CheckCircle2,
	ArrowRight,
	TestTube,
	FileText,
	Send,
	Clock,
	CheckCircle,
	AlertCircle,
	Scissors,
	Activity,
} from "lucide-react";
import {
	createOrUpdateSupportTestRequest,
	getSupportTestRequestByVisit,
	SupportTestRequest,
} from "@/services/supportTestStorage";

export function IgdTriaseForm(props: any) {
	const {
		field,
		entryDetail = {},
		type = "igd",
		parseVitalSigns,
		onUpdateDetailField,
		visitId = "VISIT-20260821-SEDC",
		selectedPatient,
		selectedDoctor,
	} = props;

	const triaseData = parseVitalSigns(entryDetail.igd_triase_data);
	const vs = parseVitalSigns(entryDetail.vital_signs);

	const activeVisitId = visitId || entryDetail.visit_id || "VISIT-20260821-SEDC";
	const [labReq, setLabReq] = useState<SupportTestRequest | undefined>(undefined);
	const [radReq, setRadReq] = useState<SupportTestRequest | undefined>(undefined);
	const [bedahReq, setBedahReq] = useState<SupportTestRequest | undefined>(undefined);
	const [rehabReq, setRehabReq] = useState<SupportTestRequest | undefined>(undefined);

	useEffect(() => {
		const refreshRequests = () => {
			setLabReq(getSupportTestRequestByVisit(activeVisitId, "lab"));
			setRadReq(getSupportTestRequestByVisit(activeVisitId, "radiologi"));
			setBedahReq(getSupportTestRequestByVisit(activeVisitId, "bedah"));
			setRehabReq(getSupportTestRequestByVisit(activeVisitId, "rehab"));
		};
		refreshRequests();
		const interval = setInterval(refreshRequests, 2000);
		return () => clearInterval(interval);
	}, [activeVisitId]);

	const handleTriaseChange = (key: string, val: any) => {
		const current = parseVitalSigns(entryDetail.igd_triase_data);
		const updated = { ...current, [key]: val };
		onUpdateDetailField(type, "igd_triase_data", JSON.stringify(updated));
	};

	const handleVitalSignChange = (key: string, val: any) => {
		const current = parseVitalSigns(entryDetail.vital_signs);
		const updated = { ...current, [key]: val };
		onUpdateDetailField(type, "vital_signs", JSON.stringify(updated));
	};

	// Calculate Total GCS dynamically
	const totalGCS =
		(Number(triaseData.gcs_e || 0) || 0) +
		(Number(triaseData.gcs_v || 0) || 0) +
		(Number(triaseData.gcs_m || 0) || 0);

	// Quick Preset Functions
	const applyGcsPreset = (e: number, v: number, m: number, statusText: string) => {
		const current = parseVitalSigns(entryDetail.igd_triase_data);
		const updated = {
			...current,
			gcs_e: String(e),
			gcs_v: String(v),
			gcs_m: String(m),
			kesadaran_text: statusText,
			triage_kesadaran: statusText.includes("Compos") ? "Sadar" : "Kesadaran menurun",
		};
		onUpdateDetailField(type, "igd_triase_data", JSON.stringify(updated));
	};

	const applyVitalSignPreset = (presetType: string) => {
		const current = parseVitalSigns(entryDetail.vital_signs);
		let updated = { ...current };

		if (presetType === "normal") {
			updated = {
				...updated,
				rr: "20",
				pulse: "80",
				bp_systolic: "120",
				bp_diastolic: "80",
				temp: "36.5",
				spo2: "98",
			};
		} else if (presetType === "kritis") {
			updated = {
				...updated,
				rr: "32",
				pulse: "135",
				bp_systolic: "85",
				bp_diastolic: "50",
				temp: "39.2",
				spo2: "86",
			};
		}
		onUpdateDetailField(type, "vital_signs", JSON.stringify(updated));
	};

	const patientName = selectedPatient?.name || selectedPatient?.patientName || entryDetail.patient_name || "Pasien IGD";
	const noRm = selectedPatient?.mr_number || selectedPatient?.no_rm || entryDetail.no_rm || "RM-00129";
	const doctorName = selectedDoctor?.name || entryDetail.dpjp_doctor || "Dokter Jaga IGD";

	const handleSendLabRequest = () => {
		const testDetails = triaseData.lab_test_notes || "Darah Lengkap (DL), Gula Darah Sewaktu (GDS), Ureum & Kreatinin";
		const created = createOrUpdateSupportTestRequest({
			visitId: activeVisitId,
			patientName,
			noRm,
			category: "lab",
			requestOrigin: "Instalasi Gawat Darurat (IGD)",
			doctorName,
			testDetails,
		});
		setLabReq(created);
		handleTriaseChange("need_lab_test", "Ya");
	};

	const handleSendRadRequest = () => {
		const testDetails = triaseData.rad_test_notes || "Rontgen Thorax AP/PA, CT Scan Kepala tanpa kontras";
		const created = createOrUpdateSupportTestRequest({
			visitId: activeVisitId,
			patientName,
			noRm,
			category: "radiologi",
			requestOrigin: "Instalasi Gawat Darurat (IGD)",
			doctorName,
			testDetails,
		});
		setRadReq(created);
		handleTriaseChange("need_rad_test", "Ya");
	};

	const handleSendBedahRequest = () => {
		const testDetails = triaseData.bedah_test_notes || "Operasi Cito / Laparatomi / Debridement";
		const created = createOrUpdateSupportTestRequest({
			visitId: activeVisitId,
			patientName,
			noRm,
			category: "bedah",
			requestOrigin: "Instalasi Gawat Darurat (IGD)",
			doctorName,
			testDetails,
		});
		setBedahReq(created);
		handleTriaseChange("need_bedah_procedure", "Ya");
	};

	const handleSendRehabRequest = () => {
		const testDetails = triaseData.rehab_test_notes || "Fisioterapi Pemulihan / Terapi Latihan";
		const created = createOrUpdateSupportTestRequest({
			visitId: activeVisitId,
			patientName,
			noRm,
			category: "rehab",
			requestOrigin: "Instalasi Gawat Darurat (IGD)",
			doctorName,
			testDetails,
		});
		setRehabReq(created);
		handleTriaseChange("need_rehab_procedure", "Ya");
	};

	return (
		<div className="space-y-4 font-sans text-xs">
			<div className="border border-slate-300 rounded-xl bg-white shadow-xs overflow-hidden">
				{/* HEADER DOKUMEN REPLIKA */}
				<div className="bg-rose-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-rose-800">
					<div className="flex items-center gap-2">
						<ShieldAlert className="h-5 w-5 text-rose-300 animate-pulse" />
						<div>
							<h3 className="font-black text-sm uppercase tracking-wider">FORM GAWAT DARURAT MEDIS (TRIAGE &amp; ANAMNESIS)</h3>
							<p className="text-[10px] text-rose-200">Formulir Rekam Medis Integrasi Instalasi Gawat Darurat</p>
						</div>
					</div>
					<div className="text-right text-[10px] font-mono bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-700/50">
						<div>Status: PERIKSA IGD</div>
						<div className="text-rose-200">Visit ID: {activeVisitId}</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					{/* TRIASE WARNA QUICK SELECT BAR */}
					<div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
						<div className="flex items-center justify-between">
							<span className="font-extrabold uppercase text-slate-800 text-[11px]">Kategori Triase Gawat Darurat :</span>
							<span className="text-[10px] font-semibold text-slate-500">* Pilih zona tingkat kegawatan pasien</span>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							<button
								type="button"
								onClick={() => handleTriaseChange("triage_category", "Resusitasi (Merah)")}
								className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
									triaseData.triage_category === "Resusitasi (Merah)"
										? "bg-rose-600 text-white border-rose-700 shadow-sm"
										: "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
								}`}
							>
								<div className="font-black text-xs">P1 - Merah</div>
								<div className="text-[10px] opacity-90 font-medium">Resusitasi / Kritis (0 menit)</div>
							</button>

							<button
								type="button"
								onClick={() => handleTriaseChange("triage_category", "Emergensi (Kuning)")}
								className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
									triaseData.triage_category === "Emergensi (Kuning)"
										? "bg-amber-500 text-white border-amber-600 shadow-sm"
										: "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
								}`}
							>
								<div className="font-black text-xs">P2 - Kuning</div>
								<div className="text-[10px] opacity-90 font-medium">Emergensi / Berat (&lt; 15 mnt)</div>
							</button>

							<button
								type="button"
								onClick={() => handleTriaseChange("triage_category", "Urgent (Hijau)")}
								className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
									triaseData.triage_category === "Urgent (Hijau)"
										? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
										: "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
								}`}
							>
								<div className="font-black text-xs">P3 - Hijau</div>
								<div className="text-[10px] opacity-90 font-medium">Non-Emergensi (&lt; 60 mnt)</div>
							</button>

							<button
								type="button"
								onClick={() => handleTriaseChange("triage_category", "Non-Urgent (Hitam/DOA)")}
								className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
									triaseData.triage_category === "Non-Urgent (Hitam/DOA)"
										? "bg-slate-800 text-white border-slate-900 shadow-sm"
										: "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
								}`}
							>
								<div className="font-black text-xs">P0 - Hitam / DOA</div>
								<div className="text-[10px] opacity-90 font-medium">Meninggal di tempat</div>
							</button>
						</div>
					</div>

					{/* GRID INPUT UTAMA: ANAMNESIS & KESADARAN */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* KOLOM KIRI: ANAMNESIS & TRIAGE */}
						<div className="space-y-4">
							<div className="space-y-1.5">
								<label className="block font-extrabold text-slate-800 uppercase text-[11px]">
									Keluhan Utama &amp; Anamnesis Singkat * :
								</label>
								<textarea
									rows={3}
									value={triaseData.keluhan_utama || entryDetail.complaint || ""}
									onChange={(e) => {
										handleTriaseChange("keluhan_utama", e.target.value);
										onUpdateDetailField(type, "complaint", e.target.value);
									}}
									placeholder="Tuliskan keluhan utama pasien saat tiba di IGD (misal: Nyeri dada mendadak, Sesak napas 2 jam, Penurunan kesadaran)..."
									className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-rose-600 focus:outline-none"
								/>
							</div>

							<div className="space-y-1.5">
								<label className="block font-extrabold text-slate-800 uppercase text-[11px]">
									Riwayat Alergi Obat / Makanan :
								</label>
								<input
									type="text"
									value={triaseData.riwayat_alergi || ""}
									onChange={(e) => handleTriaseChange("riwayat_alergi", e.target.value)}
									placeholder="Contoh: Alergi Penisilin, Seafood, Tidak ada alergi..."
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-rose-600 focus:outline-none"
								/>
							</div>

							{/* GCS & KESADARAN */}
							<div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
								<div className="flex items-center justify-between">
									<span className="font-extrabold text-slate-800 uppercase text-[11px]">
										Penilaian Kesadaran &amp; GCS :
									</span>
									<span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
										Total GCS: {totalGCS}
									</span>
								</div>

								<div className="grid grid-cols-3 gap-2">
									<div>
										<label className="block text-[10px] font-bold text-slate-600">Eye (E)</label>
										<input
											type="number"
											min="1"
											max="4"
											value={triaseData.gcs_e || ""}
											onChange={(e) => handleTriaseChange("gcs_e", e.target.value)}
											placeholder="1-4"
											className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-[10px] font-bold text-slate-600">Verbal (V)</label>
										<input
											type="number"
											min="1"
											max="5"
											value={triaseData.gcs_v || ""}
											onChange={(e) => handleTriaseChange("gcs_v", e.target.value)}
											placeholder="1-5"
											className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-[10px] font-bold text-slate-600">Motorik (M)</label>
										<input
											type="number"
											min="1"
											max="6"
											value={triaseData.gcs_m || ""}
											onChange={(e) => handleTriaseChange("gcs_m", e.target.value)}
											placeholder="1-6"
											className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
										/>
									</div>
								</div>

								<div className="flex flex-wrap gap-1.5 pt-1">
									<button
										type="button"
										onClick={(ev) => applyGcsPreset(4, 5, 6, "Compos Mentis (E4V5M6)")}
										className="text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition"
									>
										CM (15)
									</button>
									<button
										type="button"
										onClick={(ev) => applyGcsPreset(3, 4, 5, "Somnolen (E3V4M5)")}
										className="text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition"
									>
										Somnolen (12)
									</button>
									<button
										type="button"
										onClick={(ev) => applyGcsPreset(2, 2, 4, "Sopor (E2V2M4)")}
										className="text-[10px] font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition"
									>
										Sopor (8)
									</button>
									<button
										type="button"
										onClick={(ev) => applyGcsPreset(1, 1, 1, "Koma (E1V1M1)")}
										className="text-[10px] font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 px-2 py-0.5 rounded cursor-pointer transition"
									>
										Koma (3)
									</button>
								</div>
							</div>
						</div>

						{/* KOLOM KANAN: TANDA VITAL & NYERI */}
						<div className="space-y-4">
							<div className="space-y-1.5">
								<label className="block font-extrabold text-slate-800 uppercase text-[11px]">
									Cara Datang Pasien :
								</label>
								<select
									value={triaseData.cara_datang || "Jalan Tanpa Bantuan"}
									onChange={(e) => handleTriaseChange("cara_datang", e.target.value)}
									className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-rose-600 focus:outline-none"
								>
									<option value="Jalan Tanpa Bantuan">Jalan Tanpa Bantuan</option>
									<option value="Kursi Roda">Kursi Roda</option>
									<option value="Brankar / Stretcher">Brankar / Stretcher</option>
									<option value="Diapit / Digendong">Diapit / Digendong</option>
									<option value="Ambulans Gawat Darurat">Ambulans Gawat Darurat</option>
								</select>
							</div>

							{/* Vital Signs (RR, Nadi, TD, Suhu) */}
							<div className="space-y-2.5">
								<div className="flex items-center justify-between">
									<span className="block font-bold text-slate-800 uppercase text-[11px]">Vital Signs :</span>
									<button
										type="button"
										onClick={() => applyVitalSignPreset("normal")}
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
											value={vs.rr || ""}
											onChange={(e) => handleVitalSignChange("rr", e.target.value)}
											placeholder="20"
											className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-[10px] font-semibold text-slate-500">Nadi (x/mnt)</label>
										<input
											type="number"
											value={vs.pulse || ""}
											onChange={(e) => handleVitalSignChange("pulse", e.target.value)}
											placeholder="80"
											className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
										/>
									</div>
									<div>
										<label className="block text-[10px] font-semibold text-slate-500">Tekanan Darah (Sistolik/Diastolik)</label>
										<div className="flex items-center gap-1">
											<input
												type="text"
												value={vs.bp_systolic || ""}
												onChange={(e) => handleVitalSignChange("bp_systolic", e.target.value)}
												placeholder="120"
												className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
											/>
											<span>/</span>
											<input
												type="text"
												value={vs.bp_diastolic || ""}
												onChange={(e) => handleVitalSignChange("bp_diastolic", e.target.value)}
												placeholder="80"
												className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
											/>
										</div>
									</div>
									<div>
										<label className="block text-[10px] font-semibold text-slate-500">Suhu (°C) &amp; SpO2 (%)</label>
										<div className="flex items-center gap-1">
											<input
												type="text"
												value={vs.temp || ""}
												onChange={(e) => handleVitalSignChange("temp", e.target.value)}
												placeholder="36.5"
												className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
											/>
											<input
												type="text"
												value={vs.spo2 || ""}
												onChange={(e) => handleVitalSignChange("spo2", e.target.value)}
												placeholder="98%"
												className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-center font-bold text-slate-900 focus:border-rose-600 focus:outline-none"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* SKALA NYERI (NRS 0-10) */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<label className="block font-bold text-slate-800 uppercase text-[11px]">
										Skala Nyeri (NRS 0-10) :
									</label>
									<span className="text-[10px] font-black text-rose-700">
										Skor: {triaseData.skala_nyeri || "0 (Tidak Nyeri)"}
									</span>
								</div>
								<div className="flex items-center gap-1">
									{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
										<button
											key={num}
											type="button"
											onClick={() => handleTriaseChange("skala_nyeri", `${num}`)}
											className={`flex-1 py-1 rounded text-[10px] font-black transition cursor-pointer ${
												String(triaseData.skala_nyeri) === String(num)
													? "bg-rose-600 text-white shadow-xs"
													: "bg-slate-100 hover:bg-slate-200 text-slate-700"
											}`}
										>
											{num}
										</button>
									))}
								</div>
								<div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
									<span>0: No Pain</span>
									<span>1-3: Mild</span>
									<span>4-6: Mod</span>
									<span>7-9: Sev</span>
									<span>10: Worst</span>
								</div>
							</div>
						</div>
					</div>

					{/* 16 ORGAN HEAD-TO-TOE PEMERIKSAAN JASMANI */}
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
										const organs = [
											"kepala",
											"mata",
											"telinga",
											"hidung",
											"mulut",
											"gigi",
											"tenggorokan",
											"leher",
											"dada",
											"jantung",
											"paru",
											"abdomen",
											"genetalia",
											"kandungan",
											"ekstremitas_atas",
											"ekstremitas_bawah",
										];
										const updated = { ...current };
										organs.forEach((o) => {
											updated[`organ_${o}`] = "dbn (dalam batas normal)";
										});
										onUpdateDetailField(type, "igd_triase_data", JSON.stringify(updated));
									}}
									className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
								>
									<CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Set Semua Normal (DBN)
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
							{/* Kolom Kiri */}
							<div className="space-y-2">
								{[
									{ key: "kepala", label: "Kepala", example: "dbn / Jejas (-)" },
									{ key: "mata", label: "Mata", example: "dbn / Anemis (-/-)" },
									{ key: "telinga", label: "Telinga", example: "dbn / Otore (-/-)" },
									{ key: "hidung", label: "Hidung", example: "dbn / Epistaksis (-)" },
									{ key: "mulut", label: "Mulut", example: "dbn / Sianosis (-)" },
									{ key: "gigi", label: "Gigi", example: "dbn / Caries (-)" },
									{ key: "tenggorokan", label: "Tenggorokan", example: "dbn / T1-T1" },
									{ key: "leher", label: "Leher", example: "dbn / JVP meningkat (-)" },
									{ key: "dada", label: "Dada", example: "dbn / Simetris (+)" },
									{ key: "jantung", label: "Jantung", example: "dbn / S1 S2 tunggal" },
								].map((organ) => (
									<div key={organ.key} className="flex items-center gap-2">
										<label className="w-24 text-[11px] font-semibold text-slate-700 shrink-0">{organ.label} :</label>
										<input
											type="text"
											value={triaseData[`organ_${organ.key}`] || ""}
											onChange={(e) => handleTriaseChange(`organ_${organ.key}`, e.target.value)}
											placeholder={`Contoh: ${organ.example}`}
											className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:outline-none focus:border-rose-600 font-medium text-slate-900"
										/>
										<button
											type="button"
											onClick={() => handleTriaseChange(`organ_${organ.key}`, "dbn (dalam batas normal)")}
											className="text-[10px] font-extrabold text-teal-700 hover:text-emerald-800 bg-teal-50 hover:bg-emerald-100 border border-teal-200 px-2 py-0.5 rounded cursor-pointer shrink-0 transition"
											title="Set DBN"
										>
											dbn
										</button>
									</div>
								))}
							</div>

							{/* Kolom Kanan */}
							<div className="space-y-2">
								{[
									{ key: "paru", label: "Paru", example: "dbn / Vesikuler (+/+)" },
									{ key: "abdomen", label: "Abdomen", example: "dbn / Supel, BU (+)" },
									{ key: "genetalia", label: "Genetalia", example: "dbn / Kelainan (-)" },
									{ key: "kandungan", label: "Kandungan", example: "dbn / TFU DBN" },
									{ key: "ekstremitas_atas", label: "Ekstremitas atas", example: "dbn / Akral hangat" },
									{ key: "ekstremitas_bawah", label: "Ekstremitas bawah", example: "dbn / Edema (-/-)" },
								].map((organ) => (
									<div key={organ.key} className="flex items-center gap-2">
										<label className="w-32 text-[11px] font-semibold text-slate-700 shrink-0">{organ.label} :</label>
										<input
											type="text"
											value={triaseData[`organ_${organ.key}`] || ""}
											onChange={(e) => handleTriaseChange(`organ_${organ.key}`, e.target.value)}
											placeholder={`Contoh: ${organ.example}`}
											className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:outline-none focus:border-rose-600 font-medium text-slate-900"
										/>
										<button
											type="button"
											onClick={() => handleTriaseChange(`organ_${organ.key}`, "dbn (dalam batas normal)")}
											className="text-[10px] font-extrabold text-teal-700 hover:text-emerald-800 bg-teal-50 hover:bg-emerald-100 border border-teal-200 px-2 py-0.5 rounded cursor-pointer shrink-0 transition"
											title="Set DBN"
										>
											dbn
										</button>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* CARD PEMERIKSAAN PENUNJANG (LABORATORIUM & RADIOLOGI) */}
					<div className="space-y-4 pt-4 border-t-2 border-slate-200">
						<div className="flex items-center gap-2">
							<TestTube className="h-5 w-5 text-indigo-600" />
							<span className="block font-black text-slate-900 uppercase text-xs tracking-wider">
								Pemeriksaan Penunjang (Laboratorium &amp; Radiologi)
							</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* PEMERIKSAAN LABORATORIUM */}
							<div className="p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-xs font-black uppercase text-indigo-950 flex items-center gap-1.5">
										<TestTube className="h-4 w-4 text-indigo-600" /> 1. Pemeriksaan Laboratorium
									</label>
									<div className="flex items-center gap-3 text-xs font-extrabold">
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_lab_test"
												value="Ya"
												checked={triaseData.need_lab_test === "Ya"}
												onChange={(e) => handleTriaseChange("need_lab_test", e.target.value)}
												className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
											/>
											<span>Ya</span>
										</label>
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_lab_test"
												value="Tidak"
												checked={triaseData.need_lab_test === "Tidak"}
												onChange={(e) => handleTriaseChange("need_lab_test", e.target.value)}
												className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
											/>
											<span>Tidak</span>
										</label>
									</div>
								</div>

								{triaseData.need_lab_test === "Ya" && (
									<div className="space-y-2 pt-1 border-t border-indigo-100">
										<label className="block text-[11px] font-bold text-slate-700">
											Catatan / Detail Pemeriksaan Lab yang Diminta:
										</label>
										<textarea
											rows={2}
											value={triaseData.lab_test_notes || ""}
											onChange={(e) => handleTriaseChange("lab_test_notes", e.target.value)}
											placeholder="Contoh: Darah Lengkap, Gula Darah Sewaktu (GDS), Ureum, Kreatinin, Elektrolit..."
											className="w-full rounded-xl border border-indigo-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
										/>

										{/* Direct Action or Status */}
										{(!labReq || labReq.status !== "SELESAI") && (
											<button
												type="button"
												onClick={handleSendLabRequest}
												className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
											>
												<Send className="h-3.5 w-3.5" />
												<span>Kirim Permintaan ke /dashboard/faskes/medical-records/lab/request</span>
											</button>
										)}

										{/* Display Status or Results */}
										{labReq?.status === "MENUNGGU_PROSES" && (
											<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
												<Clock className="h-4 w-4 text-amber-600 shrink-0 animate-spin" />
												<div>
													<div className="font-extrabold">Permintaan Lab Telah Dikirim</div>
													<div className="text-[10px] text-amber-700">Menunggu diproses di halaman Lab Request.</div>
												</div>
											</div>
										)}

										{labReq?.status === "SELESAI" && labReq.resultData && (
											<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
												<div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
													<CheckCircle className="h-4 w-4 text-emerald-600" />
													<span>Hasil Laboratorium Terlampir (Dikirim Kembali dari Lab)</span>
												</div>
												<div className="bg-white p-2.5 rounded-lg border border-emerald-100 font-mono text-[11px] space-y-1 text-slate-800">
													{labReq.resultData.hb && <div>• Hb: <span className="font-bold">{labReq.resultData.hb}</span> g/dL</div>}
													{labReq.resultData.leukosit && <div>• Leukosit: <span className="font-bold">{labReq.resultData.leukosit}</span> /uL</div>}
													{labReq.resultData.trombosit && <div>• Trombosit: <span className="font-bold">{labReq.resultData.trombosit}</span> /uL</div>}
													{labReq.resultData.gds && <div>• GDS: <span className="font-bold">{labReq.resultData.gds}</span> mg/dL</div>}
													{labReq.resultData.labNotes && <div className="text-slate-600 pt-1 font-sans">Catatan Lab: {labReq.resultData.labNotes}</div>}
												</div>
											</div>
										)}
									</div>
								)}
							</div>

							{/* PEMERIKSAAN RADIOLOGI */}
							<div className="p-4 rounded-2xl border-2 border-cyan-100 bg-cyan-50/40 space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-xs font-black uppercase text-cyan-950 flex items-center gap-1.5">
										<FileText className="h-4 w-4 text-cyan-600" /> 2. Pemeriksaan Radiologi
									</label>
									<div className="flex items-center gap-3 text-xs font-extrabold">
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_rad_test"
												value="Ya"
												checked={triaseData.need_rad_test === "Ya"}
												onChange={(e) => handleTriaseChange("need_rad_test", e.target.value)}
												className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
											/>
											<span>Ya</span>
										</label>
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_rad_test"
												value="Tidak"
												checked={triaseData.need_rad_test === "Tidak"}
												onChange={(e) => handleTriaseChange("need_rad_test", e.target.value)}
												className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
											/>
											<span>Tidak</span>
										</label>
									</div>
								</div>

								{triaseData.need_rad_test === "Ya" && (
									<div className="space-y-2 pt-1 border-t border-cyan-100">
										<label className="block text-[11px] font-bold text-slate-700">
											Catatan / Jenis Foto Radiologi yang Diminta:
										</label>
										<textarea
											rows={2}
											value={triaseData.rad_test_notes || ""}
											onChange={(e) => handleTriaseChange("rad_test_notes", e.target.value)}
											placeholder="Contoh: Rontgen Thorax AP/PA, CT Scan Kepala tanpa kontras, USG Abdomen..."
											className="w-full rounded-xl border border-cyan-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-cyan-600"
										/>

										{/* Direct Action or Status */}
										{(!radReq || radReq.status !== "SELESAI") && (
											<button
												type="button"
												onClick={handleSendRadRequest}
												className="w-full py-2.5 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-700/20 cursor-pointer"
											>
												<Send className="h-3.5 w-3.5" />
												<span>Kirim Permintaan ke /dashboard/faskes/medical-records/radiologi/request</span>
											</button>
										)}

										{/* Display Status or Results */}
										{radReq?.status === "MENUNGGU_PROSES" && (
											<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
												<Clock className="h-4 w-4 text-amber-600 shrink-0 animate-spin" />
												<div>
													<div className="font-extrabold">Permintaan Radiologi Telah Dikirim</div>
													<div className="text-[10px] text-amber-700">Menunggu diproses di halaman Radiologi Request.</div>
												</div>
											</div>
										)}

										{radReq?.status === "SELESAI" && radReq.resultData && (
											<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
												<div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
													<CheckCircle className="h-4 w-4 text-emerald-600" />
													<span>Hasil Expertise Radiologi Terlampir (Dikirim Kembali dari Radiologi)</span>
												</div>
												<div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-[11px] space-y-1 text-slate-800 font-sans">
													{radReq.resultData.radExpertise && (
														<div>
															<span className="font-bold text-slate-700">Hasil Ekspertisi:</span> {radReq.resultData.radExpertise}
														</div>
													)}
													{radReq.resultData.radImpression && (
														<div>
															<span className="font-bold text-slate-700">Kesan:</span> {radReq.resultData.radImpression}
														</div>
													)}
													{radReq.resultData.doctorExpertise && (
														<div className="text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
															Radiolog: {radReq.resultData.doctorExpertise}
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* PROSEDUR KHUSUS (BEDAH OK & REHAB MEDIS) */}
					<div className="space-y-4 pt-4 border-t-2 border-slate-200">
						<div className="flex items-center gap-2">
							<Scissors className="h-5 w-5 text-rose-600" />
							<span className="block font-black text-slate-900 uppercase text-xs tracking-wider">
								PROSEDUR KHUSUS (BEDAH OK &amp; REHAB MEDIS)
							</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* KELOLA BEDAH (OK) */}
							<div className="p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/40 space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
										<Scissors className="h-4 w-4 text-rose-600" /> 1. KELOLA BEDAH (OK)
									</label>
									<div className="flex items-center gap-3 text-xs font-extrabold">
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_bedah_procedure"
												value="Ya"
												checked={triaseData.need_bedah_procedure === "Ya"}
												onChange={(e) => handleTriaseChange("need_bedah_procedure", e.target.value)}
												className="h-4 w-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
											/>
											<span>Ya</span>
										</label>
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_bedah_procedure"
												value="Tidak"
												checked={triaseData.need_bedah_procedure === "Tidak"}
												onChange={(e) => handleTriaseChange("need_bedah_procedure", e.target.value)}
												className="h-4 w-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
											/>
											<span>Tidak</span>
										</label>
									</div>
								</div>

								{triaseData.need_bedah_procedure === "Ya" && (
									<div className="space-y-2 pt-1 border-t border-rose-100">
										<label className="block text-[11px] font-bold text-slate-700">
											Rincian / Indikasi Tindakan Bedah (OK) yang Diminta:
										</label>
										<textarea
											rows={2}
											value={triaseData.bedah_test_notes || ""}
											onChange={(e) => handleTriaseChange("bedah_test_notes", e.target.value)}
											placeholder="Contoh: Operasi Cito Laparatomi, Appendektomi Cito, Debridement..."
											className="w-full rounded-xl border border-rose-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-600"
										/>

										{(!bedahReq || bedahReq.status !== "SELESAI") && (
											<button
												type="button"
												onClick={handleSendBedahRequest}
												className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
											>
												<Send className="h-3.5 w-3.5" />
												<span>Kirim Permintaan ke /dashboard/faskes/medical-records/bedah/request</span>
											</button>
										)}

										{bedahReq?.status === "MENUNGGU_PROSES" && (
											<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
												<Clock className="h-4 w-4 text-amber-600 shrink-0 animate-spin" />
												<div>
													<div className="font-extrabold">Permintaan Bedah Telah Dikirim</div>
													<div className="text-[10px] text-amber-700">Menunggu diproses di halaman Bedah Request.</div>
												</div>
											</div>
										)}

										{bedahReq?.status === "SELESAI" && bedahReq.resultData && (
											<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
												<div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
													<CheckCircle className="h-4 w-4 text-emerald-600" />
													<span>Hasil Laporan Bedah Terlampir (Dikirim Kembali dari Kamar Operasi)</span>
												</div>
												<div className="bg-white p-2.5 rounded-lg border border-emerald-100 font-sans text-[11px] space-y-1 text-slate-800">
													{bedahReq.resultData.opProcedure && <div>• Tindakan Bedah: <span className="font-bold">{bedahReq.resultData.opProcedure}</span></div>}
													{bedahReq.resultData.opDiagnosis && <div>• Diagnosa Pasca Op: <span className="font-bold">{bedahReq.resultData.opDiagnosis}</span></div>}
													{bedahReq.resultData.doctorExpertise && <div>• Ahli Bedah: <span className="font-bold">{bedahReq.resultData.doctorExpertise}</span></div>}
													{bedahReq.resultData.opNotes && <div className="text-slate-600 pt-1 border-t border-slate-100">Catatan Operasi: {bedahReq.resultData.opNotes}</div>}
												</div>
											</div>
										)}
									</div>
								)}
							</div>

							{/* KELOLA REHAB MEDIS */}
							<div className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
										<Activity className="h-4 w-4 text-emerald-600" /> 2. KELOLA REHAB MEDIS
									</label>
									<div className="flex items-center gap-3 text-xs font-extrabold">
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_rehab_procedure"
												value="Ya"
												checked={triaseData.need_rehab_procedure === "Ya"}
												onChange={(e) => handleTriaseChange("need_rehab_procedure", e.target.value)}
												className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
											/>
											<span>Ya</span>
										</label>
										<label className="flex items-center gap-1 cursor-pointer">
											<input
												type="radio"
												name="need_rehab_procedure"
												value="Tidak"
												checked={triaseData.need_rehab_procedure === "Tidak"}
												onChange={(e) => handleTriaseChange("need_rehab_procedure", e.target.value)}
												className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
											/>
											<span>Tidak</span>
										</label>
									</div>
								</div>

								{triaseData.need_rehab_procedure === "Ya" && (
									<div className="space-y-2 pt-1 border-t border-emerald-100">
										<label className="block text-[11px] font-bold text-slate-700">
											Catatan / Program Terapi Rehab Medis yang Diminta:
										</label>
										<textarea
											rows={2}
											value={triaseData.rehab_test_notes || ""}
											onChange={(e) => handleTriaseChange("rehab_test_notes", e.target.value)}
											placeholder="Contoh: Fisioterapi Pemulihan Pasca Stroke, Terapi Latihan, TENS, IR..."
											className="w-full rounded-xl border border-emerald-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
										/>

										{(!rehabReq || rehabReq.status !== "SELESAI") && (
											<button
												type="button"
												onClick={handleSendRehabRequest}
												className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
											>
												<Send className="h-3.5 w-3.5" />
												<span>Kirim Permintaan ke /dashboard/faskes/medical-records/rehab/request</span>
											</button>
										)}

										{rehabReq?.status === "MENUNGGU_PROSES" && (
											<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
												<Clock className="h-4 w-4 text-amber-600 shrink-0 animate-spin" />
												<div>
													<div className="font-extrabold">Permintaan Rehab Medis Telah Dikirim</div>
													<div className="text-[10px] text-amber-700">Menunggu diproses di halaman Rehab Request.</div>
												</div>
											</div>
										)}

										{rehabReq?.status === "SELESAI" && rehabReq.resultData && (
											<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
												<div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
													<CheckCircle className="h-4 w-4 text-emerald-600" />
													<span>Hasil Catatan Terapi Rehab Terlampir (Dikirim Kembali dari Rehab)</span>
												</div>
												<div className="bg-white p-2.5 rounded-lg border border-emerald-100 font-sans text-[11px] space-y-1 text-slate-800">
													{rehabReq.resultData.rehabProgram && <div>• Program Terapi: <span className="font-bold">{rehabReq.resultData.rehabProgram}</span></div>}
													{rehabReq.resultData.rehabDiagnosis && <div>• Diagnosa Fungsi: <span className="font-bold">{rehabReq.resultData.rehabDiagnosis}</span></div>}
													{rehabReq.resultData.rehabNotes && <div className="text-slate-600 pt-1 border-t border-slate-100">Evaluasi Pemulihan: {rehabReq.resultData.rehabNotes}</div>}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* FOOTER BAR DOKUMEN REPLIKA */}
				<div className="bg-slate-100 px-5 py-2 text-slate-600 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold border-t border-slate-200">
					<span>FORM GAWAT DARURAT MEDIS</span>
					<span>Visit ID: {activeVisitId}</span>
					<span>Halaman 1</span>
				</div>
			</div>
		</div>
	);
}

export function UgdDischargeSummary(props: any) {
	const {
		entryDetail = {},
		onUpdateDetailField,
		type = "igd",
		field = { name: "ugd_discharge_status", label: "Ringkasan Kondisi Sebelum Meninggalkan UGD" },
		onNavigateToRanap,
		onNavigateToRujuk,
		onNavigateToDeath,
	} = props;

	const currentObj = (() => {
		const raw = entryDetail[field.name];
		try {
			return typeof raw === "string" ? JSON.parse(raw) : raw || {};
		} catch {
			return {};
		}
	})();

	const currentStatus = (() => {
		if (currentObj.status) return currentObj.status;
		if (entryDetail.discharge_status) return entryDetail.discharge_status;
		if (entryDetail.status) return entryDetail.status;
		const raw = entryDetail[field.name];
		if (typeof raw === "string" && raw.trim()) return raw;
		return "Membaik";
	})();

	const updateStatus = (val: string) => {
		const updated = { ...currentObj, status: val };
		onUpdateDetailField?.(type, field.name, JSON.stringify(updated));
		onUpdateDetailField?.(type, "discharge_status", val);
		onUpdateDetailField?.(type, "status", val);

		const activeVisitId = props.visitId || entryDetail.visit_id || "VISIT-20260821-SEDC";
		const patientName = props.selectedPatient?.name || entryDetail.patient_name || "Pasien IGD";
		const noRm = props.selectedPatient?.mr_number || entryDetail.no_rm || "RM-00129";
		const doctorName = props.selectedDoctor?.name || entryDetail.dpjp_doctor || "Dokter Jaga IGD";

		if (val.includes("Rawat Inap") || val === "Rawat Inap") {
			createOrUpdateSupportTestRequest({
				category: "ranap",
				visitId: activeVisitId,
				patientName,
				noRm,
				requestOrigin: "Instalasi Gawat Darurat (IGD)",
				testDetails: "Permintaan Transfer & Pendaftaran Rawat Inap Pasien IGD",
				doctorName,
			});
		} else if (val.includes("Rujuk") || val.includes("Faskes")) {
			createOrUpdateSupportTestRequest({
				category: "rujuk",
				visitId: activeVisitId,
				patientName,
				noRm,
				requestOrigin: "Instalasi Gawat Darurat (IGD)",
				testDetails: "Permintaan Rujukan Medis & Transfer Pasien IGD ke Faskes Lain",
				doctorName,
			});
		} else if (val.includes("Meninggal") || val === "Meninggal") {
			createOrUpdateSupportTestRequest({
				category: "death",
				visitId: activeVisitId,
				patientName,
				noRm,
				requestOrigin: "Instalasi Gawat Darurat (IGD)",
				testDetails: "Permintaan Verifikasi & Penerbitan Surat Keterangan Kematian Pasien IGD",
				doctorName,
			});
		}
	};

	const updateExtraField = (key: string, val: any) => {
		const updated = { ...currentObj, [key]: val };
		onUpdateDetailField?.(type, field.name, JSON.stringify(updated));
		onUpdateDetailField?.(type, key, val);
	};

	return (
		<DischargeSummary
			processName="UGD"
			currentStatus={currentStatus}
			onUpdateStatus={updateStatus}
			onNavigateToRanap={onNavigateToRanap}
			onNavigateToRujuk={onNavigateToRujuk}
			onNavigateToDeath={onNavigateToDeath}
			transport={currentObj.transport || "Ambulans"}
			onTransportChange={(val) => updateExtraField("transport", val)}
			targetFacility={currentObj.target_facility || ""}
			onTargetFacilityChange={(val) => updateExtraField("target_facility", val)}
			includeObat={props.includeObat}
			onToggleIncludeObat={props.onToggleIncludeObat}
		/>
	);
}

export default function FormIGD(props: any) {
	return (
		<div className="space-y-6">
			<IgdTriaseForm {...props} />
			<UgdDischargeSummary {...props} field={{ name: "ugd_discharge_status", label: "Ringkasan Kondisi Sebelum Meninggalkan UGD" }} />
		</div>
	);
}
