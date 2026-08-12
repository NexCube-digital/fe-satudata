"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
	Plus,
	RefreshCw,
	Check,
	X,
	Paperclip,
	Info,
	ChevronDown,
	Search,
	Pill,
	AlertTriangle,
	Stethoscope,
	Activity,
	Sparkles,
	Clock,
	CreditCard,
	User,
	Phone,
	PenTool,
	FileText,
	Send,
	ShieldCheck,
	FileCheck,
	CheckCircle2,
	ChevronRight,
	Hospital,
	UserPlus,
	Copy,
	ArrowRightLeft,
	Building2,
} from "lucide-react";
import { FormIGD, FormRanap, FormRajal, FormBedah, FormODC, FormRehab } from "./form";
import MedicalRecordUpdateActions from "@/components/features/faskes/MedicalRecordUpdate";
import { ICD10_DATABASE, ICD9_DATABASE, searchICD10, searchICD9 } from "@/data/icdData";
import DigitalSignatureCanvas from "@/components/ui/DigitalSignatureCanvas";
import NewPatientModal from "@/components/features/faskes/NewPatientModal";

function SearchableSelect({
	value,
	onChange,
	options,
	placeholder = "-- Pilih --",
	isLoading = false,
	loadingText = "Memuat...",
	emptyText = "Tidak ada hasil yang cocok.",
	disabled = false,
	required = false,
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);
	const inputRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setOpen(false);
				setQuery("");
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (open) {
			const t = setTimeout(() => inputRef.current?.focus(), 0);
			return () => clearTimeout(t);
		}
	}, [open]);

	const normalize = (v) => String(v ?? "");
	const selected = options.find((o) => normalize(o.value) === normalize(value));

	const filteredOptions = useMemo(() => {
		if (!query.trim()) return options;
		const q = query.trim().toLowerCase();
		return options.filter((o) => o.label.toLowerCase().includes(q));
	}, [options, query]);

	const toggleOpen = () => {
		if (disabled || isLoading) return;
		setOpen((o) => !o);
	};

	return (
		<div className="relative" ref={containerRef}>
			{required && (
				<input tabIndex={-1} value={value || ""} onChange={() => {}} required className="sr-only" aria-hidden="true" />
			)}

			<button
				type="button"
				onClick={toggleOpen}
				disabled={disabled || isLoading}
				className="w-full flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none disabled:opacity-60 cursor-pointer"
			>
				<span className={`truncate text-left ${selected ? "text-slate-900 font-medium" : "text-slate-400"}`}>
					{isLoading ? loadingText : selected ? selected.label : placeholder}
				</span>
				<ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
			</button>

			{open && !isLoading && (
				<div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
					<div className="p-2 border-b border-slate-100">
						<div className="relative">
							<Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
							<input
								ref={inputRef}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Escape") {
										setOpen(false);
										setQuery("");
									}
								}}
								placeholder="Cari..."
								className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
							/>
						</div>
					</div>

					<ul className="max-h-56 overflow-y-auto py-1">
						{value && (
							<li>
								<button
									type="button"
									onClick={() => {
										onChange("");
										setOpen(false);
										setQuery("");
									}}
									className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 cursor-pointer"
								>
									-- Kosongkan pilihan --
								</button>
							</li>
						)}

						{filteredOptions.length === 0 ? (
							<li className="px-4 py-3 text-sm text-slate-400">{emptyText}</li>
						) : (
							filteredOptions.map((opt) => {
								const isSelected = normalize(opt.value) === normalize(value);
								return (
									<li key={opt.value}>
										<button
											type="button"
											disabled={opt.disabled}
											onClick={() => {
												if (opt.disabled) return;
												onChange(opt.value);
												setOpen(false);
												setQuery("");
											}}
											className={`w-full text-left px-4 py-2 text-sm transition ${
												opt.disabled
													? "text-slate-300 cursor-not-allowed"
													: isSelected
													? "bg-teal-50 text-teal-800 font-semibold cursor-pointer"
													: "text-slate-700 hover:bg-slate-50 cursor-pointer"
											}`}
										>
											{opt.label}
										</button>
									</li>
								);
							})
						)}
					</ul>
				</div>
			)}
		</div>
	);
}

function ComboboxInput({ value, onChange, options, placeholder = "Ketik atau pilih dari daftar..." }) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredOptions = useMemo(() => {
		const q = (value || "").trim().toLowerCase();
		if (!q) return options;
		return options.filter((o) => o.toLowerCase().includes(q));
	}, [options, value]);

	const isCustomValue =
		value && value.trim() !== "" && !options.some((o) => o.toLowerCase() === value.trim().toLowerCase());

	return (
		<div className="relative" ref={containerRef}>
			<input
				value={value}
				onChange={(e) => {
					onChange(e.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				type="text"
				placeholder={placeholder}
				className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
			/>

			{open && (
				<div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
					<ul className="max-h-52 overflow-y-auto py-1">
						{filteredOptions.length === 0 ? (
							<li className="px-4 py-3 text-sm text-slate-400">Tidak ada preset yang cocok, teks kamu tetap dipakai.</li>
						) : (
							filteredOptions.map((opt) => (
								<li key={opt}>
									<button
										type="button"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => {
											onChange(opt);
											setOpen(false);
										}}
										className={`w-full text-left px-4 py-2 text-sm transition cursor-pointer ${
											opt.toLowerCase() === (value || "").trim().toLowerCase()
												? "bg-teal-50 text-teal-800 font-semibold"
												: "text-slate-700 hover:bg-slate-50"
										}`}
									>
										{opt}
									</button>
								</li>
							))
						)}
					</ul>
					{isCustomValue && (
						<div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
							Tidak ada di daftar preset -- teks kustom kamu akan tetap dipakai:{" "}
							<span className="font-semibold text-slate-600">&ldquo;{value}&rdquo;</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function ICD10Autocomplete({ value, onChange, placeholder = "Cari Kode / Nama Diagnosa ICD-10..." }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const searchResults = useMemo(() => searchICD10(query), [query]);

	return (
		<div className="relative" ref={containerRef}>
			<div className="relative">
				<input
					type="text"
					value={value || ""}
					onChange={(e) => {
						onChange(e.target.value);
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					placeholder={placeholder}
					className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none font-medium"
				/>
				<Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
			</div>

			{open && (
				<div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
					<ul className="max-h-60 overflow-y-auto py-1">
						{searchResults.length === 0 ? (
							<li className="px-4 py-3 text-xs text-slate-400">
								Tidak ada hasil ICD-10 yang cocok. Ketik manual jika tidak terdaftar.
							</li>
						) : (
							searchResults.map((item) => (
								<li key={item.code}>
									<button
										type="button"
										onClick={() => {
											onChange(`${item.code} - ${item.name}`);
											setOpen(false);
										}}
										className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50"
									>
										<div>
											<span className="font-mono font-extrabold text-xs text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md mr-2">
												{item.code}
											</span>
											<span className="text-xs font-semibold text-slate-800">{item.name}</span>
										</div>
										<span className="text-[10px] text-slate-400 font-medium shrink-0">{item.category}</span>
									</button>
								</li>
							))
						)}
					</ul>
				</div>
			)}
		</div>
	);
}

function ICD10MultiSelect({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);

	const selectedList = useMemo(() => {
		if (!value) return [];
		if (Array.isArray(value)) return value;
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return value.split(",").map((s) => s.trim()).filter(Boolean);
		}
	}, [value]);

	const updateSelected = (newList) => {
		onChange(JSON.stringify(newList));
	};

	const addCode = (codeStr) => {
		if (!selectedList.includes(codeStr)) {
			updateSelected([...selectedList, codeStr]);
		}
		setQuery("");
		setOpen(false);
	};

	const removeCode = (codeStr) => {
		updateSelected(selectedList.filter((c) => c !== codeStr));
	};

	const searchResults = useMemo(() => searchICD10(query), [query]);

	return (
		<div className="space-y-2" ref={containerRef}>
			<div className="flex flex-wrap gap-1.5 mb-2">
				{selectedList.map((codeStr, idx) => (
					<span
						key={`${codeStr}-${idx}`}
						className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded-xl"
					>
						<span>{codeStr}</span>
						<button
							type="button"
							onClick={() => removeCode(codeStr)}
							className="text-teal-500 hover:text-red-600 transition cursor-pointer"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</span>
				))}
				{selectedList.length === 0 && (
					<span className="text-xs italic text-slate-400">Belum ada diagnosis sekunder dipilih.</span>
				)}
			</div>

			<div className="relative">
				<input
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					placeholder="Cari & tambah Diagnosis Sekunder (ICD-10)..."
					className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none font-medium"
				/>
				<Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

				{open && query.trim() && (
					<div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
						<ul className="max-h-52 overflow-y-auto py-1">
							{searchResults.length === 0 ? (
								<li className="px-4 py-2.5 text-xs text-slate-400">Tidak ada ICD-10 yang cocok.</li>
							) : (
								searchResults.map((item) => {
									const labelStr = `${item.code} - ${item.name}`;
									const isPicked = selectedList.includes(labelStr);
									return (
										<li key={item.code}>
											<button
												type="button"
												onClick={() => addCode(labelStr)}
												disabled={isPicked}
												className={`w-full text-left px-4 py-2 hover:bg-teal-50 transition cursor-pointer flex items-center justify-between text-xs ${
													isPicked ? "opacity-40 cursor-not-allowed bg-slate-50" : ""
												}`}
											>
												<div>
													<span className="font-mono font-bold text-teal-800 mr-2">{item.code}</span>
													<span className="text-slate-800">{item.name}</span>
												</div>
												{isPicked && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
											</button>
										</li>
									);
								})
							)}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}

function ICD9MultiSelect({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const containerRef = useRef(null);

	const selectedList = useMemo(() => {
		if (!value) return [];
		if (Array.isArray(value)) return value;
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return value.split(",").map((s) => s.trim()).filter(Boolean);
		}
	}, [value]);

	const updateSelected = (newList) => {
		onChange(newList);
	};

	const addCode = (codeStr) => {
		if (!selectedList.includes(codeStr)) {
			updateSelected([...selectedList, codeStr]);
		}
		setQuery("");
		setOpen(false);
	};

	const removeCode = (codeStr) => {
		updateSelected(selectedList.filter((c) => c !== codeStr));
	};

	const searchResults = useMemo(() => searchICD9(query), [query]);

	return (
		<div className="space-y-2" ref={containerRef}>
			<div className="flex flex-wrap gap-1.5 mb-2">
				{selectedList.map((codeStr, idx) => (
					<span
						key={`${codeStr}-${idx}`}
						className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-xl"
					>
						<span>{codeStr}</span>
						<button
							type="button"
							onClick={() => removeCode(codeStr)}
							className="text-indigo-500 hover:text-red-600 transition cursor-pointer"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</span>
				))}
				{selectedList.length === 0 && (
					<span className="text-xs italic text-slate-400">Belum ada tindakan ICD-9-CM dipilih.</span>
				)}
			</div>

			<div className="relative">
				<input
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					placeholder="Cari & pilih Tindakan Medis (ICD-9-CM)..."
					className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none font-medium"
				/>
				<Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

				{open && query.trim() && (
					<div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
						<ul className="max-h-52 overflow-y-auto py-1">
							{searchResults.length === 0 ? (
								<li className="px-4 py-2.5 text-xs text-slate-400">Tidak ada prosedur ICD-9-CM yang cocok.</li>
							) : (
								searchResults.map((item) => {
									const labelStr = `${item.code} - ${item.name}`;
									const isPicked = selectedList.includes(labelStr);
									return (
										<li key={item.code}>
											<button
												type="button"
												onClick={() => addCode(labelStr)}
												disabled={isPicked}
												className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition cursor-pointer flex items-center justify-between text-xs ${
													isPicked ? "opacity-40 cursor-not-allowed bg-slate-50" : ""
												}`}
											>
												<div>
													<span className="font-mono font-bold text-indigo-800 mr-2">{item.code}</span>
													<span className="text-slate-800">{item.name}</span>
												</div>
												{isPicked && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
											</button>
										</li>
									);
								})
							)}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}

function CopyResepPreview({ prescriptionItems, patientName = "", doctorName = "", visitDate = "" }) {
	if (!prescriptionItems || prescriptionItems.length === 0) return null;

	const validItems = prescriptionItems.filter((i) => i.medicine || i.medicineId);
	if (validItems.length === 0) return null;

	return (
		<div className="mt-6 rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50/80 via-amber-50/30 to-yellow-50/60 p-6 shadow-sm space-y-4">
			<div className="flex items-center justify-between border-b border-amber-200 pb-3">
				<div className="flex items-center gap-2">
					<Pill className="h-5 w-5 text-amber-700" />
					<span className="text-xs font-black uppercase tracking-wider text-amber-950">AUTO-GENERATED COPY RESEP (E-PRESCRIBING)</span>
				</div>
				<span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
					Salinan Resep Resmi
				</span>
			</div>

			<div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs font-mono text-xs text-slate-800 space-y-3">
				<div className="text-center border-b border-dashed border-slate-300 pb-3">
					<h4 className="font-sans font-black text-sm uppercase tracking-wide text-slate-900">SATUDATA HEALTH SERVICES</h4>
					<p className="font-sans text-[11px] text-slate-500 font-semibold">INSTALASI FARMASI & APOTEK PELAYANAN MEDIS</p>
					<div className="inline-block mt-1 font-sans font-extrabold text-[11px] bg-slate-100 text-slate-700 px-3 py-0.5 rounded-md uppercase">
						COPY RESEP (SALINAN RESEP)
					</div>
				</div>

				<div className="grid grid-cols-2 text-[11px] font-sans text-slate-600 gap-1 border-b border-dashed border-slate-300 pb-2">
					<div>Pasien: <span className="font-bold text-slate-900">{patientName || "-"}</span></div>
					<div>Tanggal: <span className="font-bold text-slate-900">{visitDate || "-"}</span></div>
					<div>Dokter DPJP: <span className="font-bold text-slate-900">{doctorName || "-"}</span></div>
					<div>Status: <span className="font-bold text-emerald-700">Elektronik Terverifikasi</span></div>
				</div>

				<div className="space-y-2 py-1">
					{validItems.map((item, idx) => (
						<div key={item.id || idx} className="flex flex-col gap-0.5">
							<div className="flex items-center justify-between font-bold text-slate-900">
								<span>R/ {item.medicine || "Obat"}</span>
								<span>No. {item.quantity || "1"} {item.unit || "Pcs"}</span>
							</div>
							<div className="pl-6 text-slate-600 text-[11px] italic">
								S. {item.rule || "3x1 sesudah makan"}
							</div>
						</div>
					))}
				</div>

				<div className="border-t border-dashed border-slate-300 pt-3 flex items-center justify-between font-sans text-[10px] text-slate-500">
					<span>* Salinan resep ini dibuat otomatis oleh sistem E-Prescribing SatuData.</span>
					<span className="font-bold text-slate-700">PCC (Pro Copie Conform)</span>
				</div>
			</div>
		</div>
	);
}

function StepIndicator({ steps, currentIndex, onStepClick, disabled, stepJenis, stepKunjungan, stepLampiran, recordTypes }) {
	const stepLabel = (step) => {
		if (step === stepJenis) return "Jenis";
		if (step === stepKunjungan) return "Kunjungan";
		if (step === stepLampiran) return "Lampiran & Obat";
		const type = step.replace("detail_", "");
		const rawLabel = recordTypes.find((t) => t.value === type)?.label || type;
		if (rawLabel.includes("Gawat Darurat") || type === "igd") return "IGD";
		if (rawLabel.includes("Rawat Jalan") || type === "rawat_jalan") return "Rawat Jalan";
		if (rawLabel.includes("Rawat Inap") || type === "rawat_inap") return "Rawat Inap";
		if (rawLabel.includes("Bedah") || type === "bedah_sentral" || type === "bedah_central") return "Bedah Sentral";
		if (rawLabel.includes("Rehab") || type === "rehab_medik") return "Rehab Medik";
		if (rawLabel.includes("One Day Care") || type === "one_day_care") return "One Day Care";
		return rawLabel.replace(/^Instalasi\s+/, "").replace(/^Pelayanan\s+/, "");
	};

	return (
		<div className="mb-6 overflow-x-auto pb-1 no-scrollbar">
			<ol className="flex items-center gap-1.5 min-w-max p-1 bg-slate-100/70 border border-slate-200/60 rounded-2xl">
				{steps.map((step, idx) => {
					const isDone = idx < currentIndex;
					const isActive = idx === currentIndex;
					return (
						<li key={step} className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={() => onStepClick?.(idx)}
								disabled={disabled}
								className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
									isActive
										? "bg-teal-800 text-white shadow-xs"
										: isDone
										? "bg-teal-100/80 text-teal-900 hover:bg-teal-200/80"
										: "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
								} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
							>
								<span
									className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-extrabold ${
										isActive ? "bg-white/20 text-white" : isDone ? "bg-teal-600 text-white" : "bg-slate-300 text-slate-700"
									}`}
								>
									{isDone ? <Check className="h-2.5 w-2.5" /> : idx + 1}
								</span>
								<span className="whitespace-nowrap">{stepLabel(step)}</span>
							</button>
							{idx < steps.length - 1 && (
								<span className="text-slate-300 font-bold text-xs select-none">›</span>
							)}
						</li>
					);
				})}
			</ol>
		</div>
	);
}

export default function MedicalRecordMain(props) {
	const {
		isResuming,
		isEditRoute,
		loadError,
		onBackToList,
		resumedFromDraft,
		onResetWizard,
		isFinalRecord,
		steps,
		currentStepIndex,
		onGoToStep,
		isSavingStep,
		isUploading,
		currentStep,
		stepJenis,
		stepKunjungan,
		stepLampiran,
		recordTypes,
		selectedTypes,
		onToggleRecordType,
		penunjangMainCategories = [],
		selectedPenunjangCategories = [],
		onTogglePenunjangCategory,
		penunjangSubItems = [],
		selectedPenunjangSubItems = [],
		onTogglePenunjangSubItem,
		roomOptions = [],
		layananAdminOptions = [],
		subLayananItems = [],
		patientId,
		onPatientChange,
		patientOptions,
		loadingPatients,
		recordId,
		approvedPatients,
		title,
		onTitleChange,
		visitId,
		onVisitIdChange,
		primaryEntryPoint = "igd",
		onPrimaryEntryPointChange,
		igdDischargeDecision = "pulang",
		onIgdDischargeDecisionChange,
		rujukanData = {},
		onRujukanDataChange,
		deathData = {},
		onDeathDataChange,
		cpptNotes,
		onCpptNotesChange,
		onPatientCreated,
		visitDate,
		onVisitDateChange,
		visitTime,
		onVisitTimeChange,
		paymentType = "BPJS",
		onPaymentTypeChange,
		escortName,
		onEscortNameChange,
		escortRelation,
		onEscortRelationChange,
		escortPhone,
		onEscortPhoneChange,
		nakesName,
		onNakesNameChange,
		doctorSignature,
		onDoctorSignatureChange,
		icd9Procedures = [],
		onIcd9ProceduresChange,
		nursingCareNotes,
		onNursingCareNotesChange,
		penunjangResultText,
		onPenunjangResultTextChange,
		todayStr,
		typeOfTreatment,
		onTypeOfTreatmentChange,
		typeOfTreatmentOptions,
		doctorSpecialtyFilter,
		onDoctorSpecialtyFilterChange,
		specialtiesList = [],
		doctorId,
		onDoctorChange,
		doctorOptions,
		loadingDoctors,
		selectedDoctorInfo,
		doctorsForSelection,
		summary,
		onSummaryChange,
		getDetailFieldsConfig,
		detailsByType,
		buildEmptyDetail,
		onUpdateDetailField,
		prescriptionItems,
		getRowStockError,
		getRemainingStockForRow,
		onRemovePrescriptionRow,
		loadingMedicines,
		medicinesCatalog,
		getMedicineOptionsForRow,
		onSelectMedicineForRow,
		onQuantityChange,
		onUpdatePrescriptionRow,
		dosageRulePresets,
		onAddPrescriptionRow,
		maxAttachments,
		onHandleFilesSelected,
		existingAttachmentsInfo,
		attachmentFiles,
		onRemoveAttachment,
		updateActionsProps,
	} = props;

	const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
	const [copiedVisitId, setCopiedVisitId] = useState(false);

	return isResuming ? (
		<div className="rounded-3xl bg-white border border-slate-200/80 p-10 shadow-xs flex items-center justify-center gap-3 text-slate-500 text-sm">
			<RefreshCw className="h-4 w-4 animate-spin" />
			{isEditRoute ? "Memuat data rekam medis..." : "Memeriksa draft yang belum selesai..."}
		</div>
	) : loadError ? (
		<div className="rounded-3xl bg-white border border-red-200 p-10 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
			<AlertTriangle className="h-8 w-8 text-[#DC2626]" />
			<p className="text-sm font-semibold text-[#DC2626]">{loadError}</p>
			<button
				type="button"
				onClick={onBackToList}
				className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 px-4 py-2.5 text-sm font-bold text-white hover:from-teal-800 hover:to-cyan-900 transition cursor-pointer"
			>
				Kembali ke Daftar Rekam Medis
			</button>
		</div>
	) : (
		<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
			{resumedFromDraft && !isEditRoute && (
				<div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
					<p className="text-xs font-semibold text-[#D97706] flex items-center gap-2">
						<Info className="h-4 w-4 shrink-0" />
						Melanjutkan draft yang belum selesai sebelumnya.
					</p>
					<button
						type="button"
						onClick={onResetWizard}
						className="text-xs font-bold text-[#D97706] underline underline-offset-2 hover:text-amber-800 self-start sm:self-auto"
					>
						Mulai draft baru
					</button>
				</div>
			)}

			{isEditRoute && !isFinalRecord && (
				<div className="mb-5 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
					<Info className="h-4 w-4 shrink-0 text-[#0284C7]" />
					<p className="text-xs font-semibold text-[#0284C7]">
						Mode edit draft -- semua data yang sudah ada terisi otomatis. Klik step di atas untuk lompat langsung, atau
						lengkapi bagian yang kurang lalu lanjutkan sampai step terakhir untuk menyimpan perubahan.
					</p>
				</div>
			)}

			{isEditRoute && isFinalRecord && (
				<div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
					<AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706] mt-0.5" />
					<p className="text-xs font-semibold text-[#D97706]">
						Rekam medis ini sudah <span className="underline">final</span> dan pernah di-anchor ke blockchain. Menyimpan
						perubahan di sini adalah koreksi pasca-publish -- akan memotong 1 token tambahan dan membuat bukti transaksi
						(tx hash) baru menggantikan yang lama.
					</p>
				</div>
			)}

			<StepIndicator
				steps={steps}
				currentIndex={currentStepIndex}
				onStepClick={onGoToStep}
				disabled={isSavingStep || isUploading}
				stepJenis={stepJenis}
				stepKunjungan={stepKunjungan}
				stepLampiran={stepLampiran}
				recordTypes={recordTypes}
			/>

			<div className="space-y-6">
				{currentStep === stepKunjungan && (
					<div className="space-y-6">
						{/* ENCOUNTER VISIT ID BANNER */}
						<div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-800 text-white font-black text-xs shadow-sm">
									ID
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="text-xs font-bold uppercase tracking-wider text-teal-950">Visit / Encounter ID :</span>
										<span className="font-mono font-black text-sm text-teal-900 bg-teal-200/80 px-2.5 py-0.5 rounded-lg border border-teal-300">
											{visitId || "VISIT-20260812-001"}
										</span>
									</div>
									<p className="text-[11px] text-slate-500 font-medium">
										Kode Kunjungan Unik Enterprise yang mengikat seluruh rekam medis &amp; transaksi pasien hari ini.
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => {
									if (typeof window !== "undefined") {
										navigator.clipboard.writeText(visitId || "");
										setCopiedVisitId(true);
										setTimeout(() => setCopiedVisitId(false), 2000);
									}
								}}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-50 transition cursor-pointer shadow-2xs"
							>
								{copiedVisitId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-teal-600" />}
								<span>{copiedVisitId ? "Tersalin!" : "Salin Visit ID"}</span>
							</button>
						</div>

						{/* PILIH PASIEN & TAMBAH PASIEN BARU */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
									Pilih Pasien Terotorisasi
								</label>
								<button
									type="button"
									onClick={() => setIsNewPatientOpen(true)}
									className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-xl transition cursor-pointer"
								>
									<UserPlus className="h-3.5 w-3.5 text-teal-700" /> + Pasien Baru
								</button>
							</div>
							<SearchableSelect
								value={patientId}
								onChange={onPatientChange}
								options={patientOptions}
								isLoading={loadingPatients}
								loadingText="Memuat pasien terotorisasi..."
								placeholder="Pilih pasien yang sudah menyetujui akses"
								emptyText="Tidak ada pasien yang cocok dengan pencarian."
								disabled={!!recordId}
								required
							/>
							{!!recordId && (
								<p className="mt-2 text-xs text-slate-400">
									Pasien tidak bisa diganti setelah rekam medis draft dibuat. Mulai draft baru kalau salah pilih.
								</p>
							)}
							{!loadingPatients && approvedPatients.length === 0 && (
								<p className="mt-2 text-xs text-slate-500">
									Belum ada pasien yang memberi akses. Silakan ajukan permintaan akses terlebih dahulu.
								</p>
							)}
						</div>

						{/* PRIMARY ENTRY POINT PICKER */}
						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-1.5">
								<Building2 className="h-3.5 w-3.5 text-teal-700" /> Pilih Unit Entri Utama (Primary Entry Point)
							</label>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{(recordTypes || []).map((opt) => {
									const isSelected = primaryEntryPoint === opt.value;
									const desc =
										opt.desc ||
										(opt.value === "igd"
											? "Pasien Darurat / Triase Resusitasi"
											: opt.value === "rawat_jalan"
											? "Pemeriksaan Poliklinik Regular"
											: opt.value === "rawat_inap"
											? "Pendaftaran Langsung Kamar/Bangsal"
											: opt.value === "bedah_sentral"
											? "Tindakan Operasi & Bedah"
											: opt.value === "rehab_medik"
											? "Fisioterapi & Terapi Pemulihan"
											: opt.value === "one_day_care"
											? "Perawatan 1 Hari Tanpa Rawat Inap"
											: "Kategori Utama Pelayanan Medis RS");

									return (
										<button
											key={opt.value}
											type="button"
											onClick={() => {
												if (onPrimaryEntryPointChange) onPrimaryEntryPointChange(opt.value);
											}}
											className={`flex flex-col text-left p-3.5 rounded-2xl border transition cursor-pointer ${
												isSelected
													? "bg-teal-800 text-white border-teal-800 shadow-xs"
													: "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-slate-50"
											}`}
										>
											<div className="flex items-center justify-between gap-2">
												<span className="text-xs font-extrabold truncate">{opt.label}</span>
												{isSelected ? (
													<Check className="h-4 w-4 text-white shrink-0" />
												) : (
													<span className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
												)}
											</div>
											<div className="flex items-center justify-between gap-2 mt-1">
												<span className={`text-[10px] truncate ${isSelected ? "text-teal-200" : "text-slate-400"}`}>
													{desc}
												</span>
												{opt.kptl && (
													<span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
														isSelected ? "bg-teal-700 text-teal-100" : "bg-slate-100 text-slate-500"
													}`}>
														{opt.kptl}
													</span>
												)}
											</div>
										</button>
									);
								})}
							</div>
						</div>

						{/* MODAL BUAT PASIEN BARU */}
						<NewPatientModal
							isOpen={isNewPatientOpen}
							onClose={() => setIsNewPatientOpen(false)}
							onSuccess={(newP) => {
								if (onPatientCreated) onPatientCreated(newP);
							}}
						/>

						<div className="grid gap-6 md:grid-cols-3">
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Judul Rekam Medis</label>
								<input
									value={title}
									onChange={(e) => onTitleChange(e.target.value)}
									type="text"
									placeholder="Contoh: Pemeriksaan Gula Darah"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none font-medium"
									required
								/>
							</div>
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Kunjungan</label>
								<input
									value={visitDate}
									onChange={(e) => onVisitDateChange(e.target.value)}
									type="date"
									min={isEditRoute ? undefined : todayStr}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none font-medium"
									required
								/>
							</div>
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-1.5">
									<Clock className="h-3.5 w-3.5 text-teal-700" /> Waktu Kunjungan
								</label>
								<input
									value={visitTime || ""}
									onChange={(e) => onVisitTimeChange && onVisitTimeChange(e.target.value)}
									type="time"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none font-bold text-center"
									required
								/>
							</div>
						</div>

						{/* Jenis Pembayaran */}
						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 flex items-center gap-1.5">
								<CreditCard className="h-3.5 w-3.5 text-teal-700" /> Jenis Pembayaran
							</label>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{[
									{ value: "BPJS", label: "BPJS Kesehatan / KIS", desc: "Peserta JKN / BPJS" },
									{ value: "Umum", label: "Pasien Umum (Bayar Mandiri)", desc: "Pembayaran Tunai / QRIS / Card" },
									{ value: "Asuransi Swasta", label: "Asuransi Swasta", desc: "Prudential, AXA, Manulife, dll" },
								].map((opt) => {
									const isSelected = paymentType === opt.value;
									return (
										<button
											key={opt.value}
											type="button"
											onClick={() => onPaymentTypeChange && onPaymentTypeChange(opt.value)}
											className={`flex flex-col text-left p-3.5 rounded-2xl border transition cursor-pointer ${
												isSelected
													? "bg-teal-800 text-white border-teal-800 shadow-xs"
													: "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-slate-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<span className="text-xs font-black">{opt.label}</span>
												{isSelected ? (
													<Check className="h-4 w-4 text-white shrink-0" />
												) : (
													<span className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
												)}
											</div>
											<span className={`text-[10px] mt-1 ${isSelected ? "text-teal-200" : "text-slate-400"}`}>
												{opt.desc}
											</span>
										</button>
									);
								})}
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
									Spesialisasi Dokter <span className="text-slate-400 font-medium normal-case ml-1">(filter)</span>
								</label>
								<SearchableSelect
									value={doctorSpecialtyFilter}
									onChange={onDoctorSpecialtyFilterChange}
									options={[
										{ value: "all", label: "Semua Spesialisasi" },
										...specialtiesList.map((s) => ({ value: s.name, label: s.name })),
									]}
									placeholder="-- Semua Spesialisasi --"
								/>
							</div>
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
									Dokter Penanggung Jawab (DPJP) <span className="text-slate-400 font-medium normal-case ml-1">(opsional)</span>
								</label>
								<SearchableSelect
									value={doctorId}
									onChange={onDoctorChange}
									options={doctorOptions}
									isLoading={loadingDoctors}
									loadingText="Memuat daftar dokter..."
									placeholder="-- Pilih DPJP --"
									emptyText={
										doctorSpecialtyFilter && doctorSpecialtyFilter !== "all"
											? `Tidak ada dokter dengan spesialisasi ${doctorSpecialtyFilter}.`
											: typeOfTreatment
											? "Tidak ada dokter yang sesuai dengan jenis layanan ini."
											: "Tidak ada dokter yang cocok dengan pencarian."
									}
								/>
								{selectedDoctorInfo?.practice_schedule?.trim() && (
									<p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
										<Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
										Jam praktik: <span className="font-semibold text-slate-700">{selectedDoctorInfo.practice_schedule}</span>
									</p>
								)}
								{!loadingDoctors && doctorsForSelection.length === 0 && (
									<p className="mt-2 text-xs text-[#D97706] font-medium">Belum ada dokter yang terhubung ke Faskes Anda.</p>
								)}
							</div>
						</div>

						{/* Identitas Pengantar (Khusus jika ada / kondisi darurat) */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
							<div className="flex items-center gap-2 border-b border-slate-200 pb-2">
								<User className="h-4 w-4 text-teal-700" />
								<span className="text-xs font-bold uppercase tracking-wider text-slate-800">
									Identitas Pengantar <span className="text-slate-400 font-normal normal-case">(Khusus jika ada / kondisi darurat)</span>
								</span>
							</div>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Pengantar</label>
									<input
										type="text"
										value={escortName || ""}
										onChange={(e) => onEscortNameChange && onEscortNameChange(e.target.value)}
										placeholder="Nama pengantar pasien..."
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
									/>
								</div>
								<div>
									<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hubungan Dengan Pasien</label>
									<input
										type="text"
										value={escortRelation || ""}
										onChange={(e) => onEscortRelationChange && onEscortRelationChange(e.target.value)}
										placeholder="Hubungan dengan pasien (misal: Ayah, Suami, Istri, Kerabat)..."
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
									/>
								</div>
								<div>
									<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">No. Telepon Pengantar</label>
									<input
										type="tel"
										value={escortPhone || ""}
										onChange={(e) => onEscortPhoneChange && onEscortPhoneChange(e.target.value)}
										placeholder="0812xxxxxxx"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
									/>
								</div>
							</div>
						</div>

						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Ringkasan Medis</label>
							<textarea
								value={summary}
								onChange={(e) => onSummaryChange(e.target.value)}
								rows={3}
								placeholder="Ringkasan singkat kondisi pasien"
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
							/>
						</div>
					</div>
				)}

				{currentStep.startsWith("detail_") &&
					(() => {
						const type = currentStep.replace("detail_", "");
						const typeLabel = recordTypes.find((t) => t.value === type)?.label || type;
						const entryDetail = detailsByType[type] || buildEmptyDetail(type);
						const normType = String(type || "").toLowerCase().trim();

						const selectedPatient = (approvedPatients || []).find((p) => String(p.patientId || p.id || p.value) === String(patientId)) ||
							(patientOptions || []).find((p) => String(p.value || p.id || p.patientId) === String(patientId)) ||
							null;
						const selectedDoctor = selectedDoctorInfo || (doctorOptions || []).find((d) => String(d.id || d.value) === String(doctorId)) || null;

						const parseVitalSigns = (raw) => {
							try {
								return typeof raw === "string" ? JSON.parse(raw) : raw || {};
							} catch {
								return {};
							}
						};

						const formProps = {
							entryDetail,
							type,
							parseVitalSigns,
							onUpdateDetailField,
							selectedPatient,
							selectedDoctor,
							visitDate,
							visitTime,
							paymentType,
							escortName,
							escortRelation,
							escortPhone,
							visitId,
							penunjangSubItems,
							penunjangMainCategories,
						};

						return (
							<div className="space-y-6 font-sans">
								{/* Header Bar Unit Entri */}
								<div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
									<div className="flex items-center gap-2.5">
										<div className="h-2.5 w-2.5 rounded-full bg-teal-600 animate-pulse" />
										<span className="text-xs font-black uppercase tracking-wider text-slate-700">
											Unit Entri Pelayanan: <span className="text-teal-700 font-extrabold">{typeLabel}</span>
										</span>
									</div>
									<span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-2xs bg-teal-50 text-teal-700 border-teal-200/90">
										Formulir Rekam Medis Resmi
									</span>
								</div>

								{/* Direct Form Component Dispatcher dari Folder /form */}
								{(() => {
									if (
										normType === "igd" ||
										normType === "gawat_darurat" ||
										normType.includes("igd") ||
										normType.includes("gawat darurat")
									) {
										return <FormIGD {...formProps} field={{ name: "igd_triase_data" }} />;
									}

									if (
										normType === "rawat_inap" ||
										normType.includes("rawat_inap") ||
										normType.includes("rawat inap") ||
										normType.includes("ranap") ||
										normType.includes("ri-")
									) {
										return <FormRanap {...formProps} />;
									}

									if (
										normType === "bedah" ||
										normType.includes("bedah") ||
										normType.includes("operasi")
									) {
										return <FormBedah {...formProps} />;
									}

									if (
										normType === "odc" ||
										normType.includes("odc") ||
										normType.includes("one_day_care")
									) {
										return <FormODC {...formProps} />;
									}

									if (
										normType === "rehab" ||
										normType.includes("rehab") ||
										normType.includes("fisioterapi")
									) {
										return <FormRehab {...formProps} />;
									}

									// Default untuk Rawat Jalan / Poliklinik & Layanan Lainnya
									return <FormRajal {...formProps} />;
								})()}
							</div>
						);
					})()}

				{currentStep === stepLampiran && (
					<div className="space-y-8">
						{/* 1. RESEP & ELECTRONIC PRESCRIBING */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
									<Pill className="h-4 w-4 text-teal-700" />
									Instruksi Obat &amp; Resep (Electronic Prescribing) <span className="text-slate-400 font-medium normal-case ml-1">(opsional)</span>
								</label>
							</div>

							<div className="space-y-3">
								{prescriptionItems.length === 0 ? (
									<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-400">
										Belum ada resep obat ditambahkan.
									</div>
								) : (
									prescriptionItems.map((item, idx) => {
										const stockError = getRowStockError(item);
										const remaining = item.medicineId ? getRemainingStockForRow(item.id, item.medicineId) : null;
										return (
											<div
												key={item.id}
												className={`rounded-2xl border p-4 transition ${
													stockError ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-slate-50/40"
												}`}
											>
												<div className="flex items-center justify-between mb-3">
													<span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
														<Pill className="h-3 w-3 text-teal-700" /> Obat #{idx + 1}
													</span>
													<button
														type="button"
														onClick={() => onRemovePrescriptionRow(item.id)}
														className="text-slate-400 hover:text-[#DC2626] transition cursor-pointer"
														title="Hapus obat"
													>
														<X className="h-4 w-4" />
													</button>
												</div>

												<div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
													<div>
														<label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
															Nama Obat
														</label>
														<SearchableSelect
															value={item.medicineId}
															onChange={(val) => onSelectMedicineForRow(item.id, val)}
															options={getMedicineOptionsForRow(item.id)}
															isLoading={loadingMedicines}
															loadingText="Memuat katalog obat..."
															placeholder="Cari & pilih obat"
															emptyText="Obat tidak ditemukan."
														/>
														{!loadingMedicines && medicinesCatalog.length === 0 && (
															<p className="mt-1.5 text-[10px] text-[#D97706] font-medium">
																Katalog obat masih kosong. Tambahkan dulu di modul Apoteker.
															</p>
														)}
													</div>

													<div>
														<label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
															Jumlah
														</label>
														<div className="flex items-center gap-2">
															<input
																value={item.quantity}
																onChange={(e) => onQuantityChange(item.id, item.medicineId, e.target.value)}
																type="number"
																min={0}
																max={remaining ?? undefined}
																disabled={!item.medicineId}
																placeholder={item.medicineId ? "0" : "Pilih obat dulu"}
																className={`w-full min-w-0 rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
																	stockError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-600"
																}`}
															/>
															{item.unit && (
																<span className="shrink-0 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-500">
																	{item.unit}
																</span>
															)}
														</div>
													</div>
												</div>

												<div className="mt-4">
													<label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-1.5">
														Aturan Pakai
													</label>
													<ComboboxInput
														value={item.rule}
														onChange={(val) => onUpdatePrescriptionRow(item.id, "rule", val)}
														options={dosageRulePresets}
														placeholder="Contoh: 3x1 sesudah makan, atau ketik sendiri"
													/>
												</div>

												{stockError && (
													<p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#DC2626]">
														<AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {stockError}
													</p>
												)}
											</div>
										);
									})
								)}
							</div>

							<button
								type="button"
								onClick={onAddPrescriptionRow}
								className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-teal-300 px-4 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50 transition cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" /> Tambah Obat
							</button>

							{/* Auto-generated Copy Resep Preview */}
							<CopyResepPreview
								prescriptionItems={prescriptionItems}
								patientName={approvedPatients.find((p) => String(p.patientId) === String(patientId))?.patientName}
								doctorName={selectedDoctorInfo?.name || nakesName}
								visitDate={visitDate}
							/>
						</div>

						{/* 2. TINDAKAN & PELAYANAN LAIN (ICD-9-CM) */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
							<div className="flex items-center justify-between border-b border-slate-200 pb-2">
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-950 flex items-center gap-2">
									<Stethoscope className="h-4 w-4 text-indigo-700" />
									Tindakan &amp; Pelayanan Lain (ICD-9-CM)
								</label>
								<span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200 px-2.5 py-0.5 rounded-full">
									Prosedur Medis
								</span>
							</div>

							<div>
								<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
									Input Tindakan Medis (ICD-9-CM)
								</label>
								<ICD9MultiSelect
									value={icd9Procedures}
									onChange={(val) => onIcd9ProceduresChange && onIcd9ProceduresChange(val)}
								/>
							</div>

							<div>
								<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
									Asuhan Keperawatan / Catatan Observasi Singkat
								</label>
								<textarea
									rows={3}
									value={nursingCareNotes || ""}
									onChange={(e) => onNursingCareNotesChange && onNursingCareNotesChange(e.target.value)}
									placeholder="Catatan observasi perawat, pengkajian keperawatan, instruksi khusus..."
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
								/>
							</div>
						</div>

						{/* 3. PEMERIKSAAN PENUNJANG (JIKA CHECKBOX LAB/RADIOLOGI DIAKTIFKAN) */}
						{selectedPenunjangCategories.length > 0 && (
							<div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-5 space-y-4">
								<div className="flex items-center justify-between border-b border-purple-200 pb-2">
									<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-purple-950 flex items-center gap-2">
										<Activity className="h-4 w-4 text-purple-700" />
										Hasil Pemeriksaan Penunjang ({selectedPenunjangCategories.join(", ")})
									</label>
									<span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full">
										Penunjang Aktif
									</span>
								</div>

								<div>
									<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
										Input Teks Hasil Lab &amp; Radiologi
									</label>
									<textarea
										rows={3}
										value={penunjangResultText || ""}
										onChange={(e) => onPenunjangResultTextChange && onPenunjangResultTextChange(e.target.value)}
										placeholder="Input detail angka/kesimpulan hasil laboratorium / radiologi di sini..."
										className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none font-mono"
									/>
								</div>
							</div>
						)}

						{/* 4. FILE LAMPIRAN */}
						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
								Upload File Hasil / Dokumentasi <span className="text-slate-400 font-medium normal-case ml-1">(opsional, maks. {maxAttachments} file)</span>
							</label>
							<label
								htmlFor="attachments-input"
								className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 px-4 py-6 text-sm font-semibold text-teal-800 hover:bg-teal-50 transition cursor-pointer"
							>
								<Paperclip className="h-4 w-4" /> Klik untuk pilih file lampiran (PDF / Gambar / Hasil Lab)
							</label>
							<input
								id="attachments-input"
								type="file"
								multiple
								className="hidden"
								onChange={(e) => {
									onHandleFilesSelected(e.target.files);
									e.target.value = "";
								}}
							/>

							{existingAttachmentsInfo.length > 0 && (
								<p className="mt-3 text-xs text-slate-500">{existingAttachmentsInfo.length} lampiran sudah tersimpan dari sesi sebelumnya.</p>
							)}

							{attachmentFiles.length > 0 && (
								<ul className="mt-3 space-y-2">
									{attachmentFiles.map((file, idx) => (
										<li
											key={`${file.name}-${idx}`}
											className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
										>
											<span className="flex items-center gap-2 min-w-0 text-sm text-slate-700">
												<span className="truncate">{file.name}</span>
											</span>
											<button
												type="button"
												onClick={() => onRemoveAttachment(idx)}
												className="text-slate-400 hover:text-[#DC2626] transition shrink-0 cursor-pointer"
												title="Hapus lampiran"
											>
												<X className="h-4 w-4" />
											</button>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* 5. REVIEW & SUMMARY VALIDATION VIEW (PHASE 4) */}
						<div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-slate-900 via-teal-950 to-cyan-950 text-white p-6 shadow-xl space-y-4">
							<div className="flex items-center justify-between border-b border-teal-800/80 pb-3">
								<div className="flex items-center gap-2.5">
									<ShieldCheck className="h-5 w-5 text-teal-400" />
									<span className="text-xs font-black uppercase tracking-wider text-teal-100">
										ENTERPRISE EMR CLINICAL SUMMARY VALIDATION
									</span>
								</div>
								<span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-800/80 text-teal-200 px-3 py-1 rounded-full border border-teal-600">
									Encounter Ready to Lock &amp; Hash
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
								<div className="bg-slate-950/60 p-4 rounded-2xl border border-teal-900/60 space-y-2">
									<div className="text-[10px] uppercase font-bold text-teal-400 font-sans border-b border-teal-900/40 pb-1">Identitas Encounter &amp; Pasien</div>
									<div className="flex justify-between"><span>Visit ID:</span> <span className="text-teal-300 font-bold">{visitId || "-"}</span></div>
									<div className="flex justify-between"><span>Pasien:</span> <span className="text-white font-bold">{approvedPatients.find((p) => String(p.patientId) === String(patientId))?.patientName || "Pasien Selected"}</span></div>
									<div className="flex justify-between"><span>Pembayaran:</span> <span className="text-cyan-300 font-bold">{paymentType}</span></div>
									<div className="flex justify-between"><span>Unit Utama:</span> <span className="text-emerald-300 font-bold uppercase">{primaryEntryPoint}</span></div>
								</div>

								<div className="bg-slate-950/60 p-4 rounded-2xl border border-teal-900/60 space-y-2">
									<div className="text-[10px] uppercase font-bold text-teal-400 font-sans border-b border-teal-900/40 pb-1">Penanggung Jawab &amp; Status Akhir</div>
									<div className="flex justify-between"><span>Dokter DPJP:</span> <span className="text-white font-bold">{selectedDoctorInfo?.name || nakesName || "DPJP Terpilih"}</span></div>
									<div className="flex justify-between"><span>Status Akhir:</span> <span className="text-emerald-400 font-bold uppercase">{igdDischargeDecision}</span></div>
									<div className="flex justify-between"><span>Resep Obat:</span> <span className="text-amber-300 font-bold">{prescriptionItems.length} Obat Ditambahkan</span></div>
									<div className="flex justify-between"><span>Prosedur ICD-9:</span> <span className="text-indigo-300 font-bold">{icd9Procedures.length} Prosedur</span></div>
								</div>
							</div>

							<div className="text-[11px] font-sans text-teal-200/90 flex items-center gap-2 pt-1 border-t border-teal-900/40">
								<CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
								<span>Seluruh data encounter di atas akan dibungkus menjadi payload terenkripsi dan di-hash ke Smart Contract Blockchain (bc-satudata) setelah difinalisasi.</span>
							</div>
						</div>

						{/* 6. TANDA TANGAN & PENGESAHAN */}
						<div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-4">
							<div className="flex items-center justify-between border-b border-slate-200 pb-2">
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
									<PenTool className="h-4 w-4 text-teal-700" />
									Tanda Tangan &amp; Pengesahan Dokter / Nakes
								</label>
								<span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-200 px-2.5 py-0.5 rounded-full">
									Legalitas Medis
								</span>
							</div>

							<div>
								<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
									Nama Dokter / Tenaga Kesehatan Bertugas
								</label>
								<input
									type="text"
									value={nakesName || selectedDoctorInfo?.name || ""}
									onChange={(e) => onNakesNameChange && onNakesNameChange(e.target.value)}
									placeholder="Nama & Gelar Dokter / Nakes..."
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none font-bold"
								/>
							</div>

							<DigitalSignatureCanvas
								value={doctorSignature}
								onChange={(val) => onDoctorSignatureChange && onDoctorSignatureChange(val)}
								doctorName={selectedDoctorInfo?.name || nakesName}
							/>
						</div>

						<div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs text-teal-800 flex items-start gap-2">
							<Info className="h-4 w-4 mt-0.5 shrink-0" />
							Klik &ldquo;Unggah &amp; Finalisasi&rdquo; untuk mengenkripsi dan menjangkarkan data ke blockchain. Atau simpan
							sebagai draft dulu kalau belum yakin -- data yang sudah diisi (termasuk obat) tidak akan hilang.
						</div>
					</div>
				)}
			</div>

			<MedicalRecordUpdateActions {...updateActionsProps} />
		</div>
	);
}
