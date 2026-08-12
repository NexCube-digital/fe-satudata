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
						const detailFields = getDetailFieldsConfig(type);
						const entryDetail = detailsByType[type] || buildEmptyDetail(type);

						const SOAP_SECTIONS = {
							S: { label: "Subjektif", color: "bg-blue-600", desc: "Data yang diperoleh dari pasien (keluhan, riwayat)" },
							O: { label: "Objektif", color: "bg-emerald-600", desc: "Data terukur dari pemeriksaan fisik & penunjang" },
							A: { label: "Assessment", color: "bg-amber-600", desc: "Analisis & penegakan diagnosis" },
							P: { label: "Plan", color: "bg-purple-600", desc: "Rencana tindakan, terapi & tindak lanjut" },
						};

						const sections = [...new Set(detailFields.map((f) => f.section))];

						const parseVitalSigns = (raw) => {
							try {
								return typeof raw === "string" ? JSON.parse(raw) : raw || {};
							} catch {
								return {};
							}
						};

						const handleVitalSignChange = (key, value) => {
							const current = parseVitalSigns(entryDetail.vital_signs);
							const updated = { ...current, [key]: value };
							onUpdateDetailField(type, "vital_signs", JSON.stringify(updated));
						};

						const isIGD = type === "igd" || type === "gawat_darurat" || typeLabel.toLowerCase().includes("gawat darurat");

						return (
							<div className="space-y-6">
								<div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
									<span className={`text-xs font-extrabold uppercase tracking-wider ${isIGD ? "text-red-900 flex items-center gap-2" : "text-teal-800"}`}>
										Data: {typeLabel}
									</span>
									<span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
										isIGD
											? "bg-red-50 text-red-700 border-red-200 shadow-2xs"
											: "bg-slate-100 text-slate-500 border-slate-200/80"
									}`}>
										{isIGD ? "Formulir Rekam Medis Gawat Darurat (IGD)" : "Format SOAP"}
									</span>
								</div>

								{sections.map((sectionKey) => {
									const sectionInfo = isIGD
										? {
												S: { label: "1. TRIASI UGD & ANAMNESIS PASIEN", color: "bg-red-600", desc: "Data triase, pengantar, riwayat alergi, skala nyeri, & anamnesis" },
												O: { label: "2. TANDA VITAL & PEMERIKSAAN FISIK UGD", color: "bg-emerald-600", desc: "Vital sign & pemeriksaan fisik / penunjang medik UGD" },
												A: { label: "3. DIAGNOSIS DOKTER UGD", color: "bg-amber-600", desc: "Diagnosis dokter UGD & Kode ICD-10" },
												P: { label: "4. PENGOBATAN, TINDAKAN MEDIS & KONDISI AKHIR", color: "bg-purple-600", desc: "Pengobatan, tindakan medis, & ringkasan kondisi UGD" },
										  }[sectionKey] || { label: sectionKey, color: "bg-slate-600", desc: "" }
										: SOAP_SECTIONS[sectionKey] || { label: sectionKey, color: "bg-slate-600", desc: "" };

									const sectionFields = detailFields.filter((f) => f.section === sectionKey);

									return (
										<div key={sectionKey} className="space-y-4">
											{/* Section Header */}
											<div className="flex items-center gap-3 border-b border-slate-200/60 pb-2">
												<span className={`flex items-center justify-center h-6 w-6 rounded-lg text-[11px] font-black text-white ${sectionInfo.color}`}>
													{sectionKey}
												</span>
												<div>
													<span className="text-xs font-extrabold text-slate-800">{sectionInfo.label}</span>
													{sectionInfo.desc && (
														<p className="text-[10px] text-slate-400 font-medium leading-tight">{sectionInfo.desc}</p>
													)}
												</div>
											</div>

											{/* Section Fields */}
											<div className="grid gap-5 pl-9">
												{sectionFields.map((field) => {
													if (field.inputType === "vital_signs") {
														const vs = parseVitalSigns(entryDetail.vital_signs);
														const vitalFields = [
															{ key: "systolic", label: "TD Sistol", unit: "mmHg", placeholder: "120" },
															{ key: "diastolic", label: "TD Diastol", unit: "mmHg", placeholder: "80" },
															{ key: "pulse", label: "Nadi", unit: "x/mnt", placeholder: "80" },
															{ key: "temp", label: "Suhu", unit: "°C", placeholder: "36.5" },
															{ key: "rr", label: "RR", unit: "x/mnt", placeholder: "20" },
															{ key: "spo2", label: "SpO2", unit: "%", placeholder: "98" },
														];

														return (
															<div key={field.name}>
																<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">{field.label}</label>
																<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
																	{vitalFields.map((vf) => (
																		<div key={vf.key} className="relative">
																			<label className="block text-[10px] font-semibold text-slate-400 mb-1">{vf.label}</label>
																			<div className="relative">
																				<input
																					type="text"
																					inputMode="decimal"
																					value={vs[vf.key] || ""}
																					onChange={(e) => handleVitalSignChange(vf.key, e.target.value)}
																					placeholder={vf.placeholder}
																					className="w-full rounded-xl border border-slate-200 bg-white pl-3 pr-12 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none text-center font-semibold"
																				/>
																				<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none">
																					{vf.unit}
																				</span>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														);
													}

													if (field.inputType === "igd_triase_form") {
														const triaseData = parseVitalSigns(entryDetail.igd_triase_data);
														const vs = parseVitalSigns(entryDetail.vital_signs);

														const handleTriaseChange = (key, val) => {
															const current = parseVitalSigns(entryDetail.igd_triase_data);
															const updated = { ...current, [key]: val };
															onUpdateDetailField(type, "igd_triase_data", JSON.stringify(updated));
														};

														const handleVitalSignChange = (key, val) => {
															const current = parseVitalSigns(entryDetail.vital_signs);
															const updated = { ...current, [key]: val };
															onUpdateDetailField(type, "vital_signs", JSON.stringify(updated));
														};

														return (
															<div key={field.name} className="space-y-6 font-sans">
																{/* 1. TRIAGE STATUS (BANNER ATAS REPLIKA TEMPLATE FOTO) */}
																<div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-xs">
																	<div className="bg-slate-800 px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-2">
																		<span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
																			TRIAGE STATUS
																		</span>
																		<div className="flex flex-wrap items-center gap-2 text-xs font-bold">
																			{[
																				{ key: "Merah", label: "Merah", color: "bg-red-600" },
																				{ key: "Kuning", label: "Kuning", color: "bg-amber-400 text-slate-900" },
																				{ key: "Hijau", label: "Hijau", color: "bg-emerald-600" },
																				{ key: "Hitam", label: "Hitam", color: "bg-slate-950" },
																			].map((opt) => {
																				const active = triaseData.triage_status === opt.key;
																				return (
																					<button
																						key={opt.key}
																						type="button"
																						onClick={() => handleTriaseChange("triage_status", opt.key)}
																						className={`px-3 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
																							active
																								? "border-white bg-white text-slate-900 shadow-xs font-extrabold"
																								: "border-slate-600 bg-slate-700/60 text-slate-200 hover:bg-slate-700"
																						}`}
																					>
																						<span className={`h-3 w-3 rounded ${opt.color}`} />
																						<span>{opt.label}</span>
																					</button>
																				);
																			})}
																		</div>
																	</div>

																	<div className="p-4 space-y-4 text-xs bg-slate-50/50">
																		{/* 1. Kesadaran, 2. Pernafasan, 3. Sirkulasi & Pertolongan Pertama Jam */}
																		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
																			{/* 1. Kesadaran */}
																			<div className="p-3 bg-white rounded-xl border border-slate-200">
																				<span className="block font-bold text-slate-700 mb-1.5">1. Kesadaran :</span>
																				<div className="space-y-1">
																					{["Sadar", "Kesadaran menurun", "Tidak sadar", "Gelisah"].map((opt) => (
																						<label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
																							<input
																								type="radio"
																								name="triage_kesadaran"
																								checked={triaseData.triage_kesadaran === opt}
																								onChange={() => handleTriaseChange("triage_kesadaran", opt)}
																								className="accent-red-600"
																							/>
																							<span>{opt}</span>
																						</label>
																					))}
																				</div>
																			</div>

																			{/* 2. Pernafasan */}
																			<div className="p-3 bg-white rounded-xl border border-slate-200">
																				<span className="block font-bold text-slate-700 mb-1.5">2. Pernafasan :</span>
																				<div className="space-y-1">
																					{["Normal", "Sesak", "Sumbatan jln nafas", "Tidak bernafas"].map((opt) => (
																						<label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
																							<input
																								type="radio"
																								name="triage_pernafasan"
																								checked={triaseData.triage_pernafasan === opt}
																								onChange={() => handleTriaseChange("triage_pernafasan", opt)}
																								className="accent-red-600"
																							/>
																							<span>{opt}</span>
																						</label>
																					))}
																				</div>
																			</div>

																			{/* 3. Sirkulasi */}
																			<div className="p-3 bg-white rounded-xl border border-slate-200">
																				<span className="block font-bold text-slate-700 mb-1.5">3. Sirkulasi :</span>
																				<div className="space-y-1">
																					{["Nadi normal", "Aritmia", "Henti jantung", "Perdarahan"].map((opt) => (
																						<label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
																							<input
																								type="radio"
																								name="triage_sirkulasi"
																								checked={triaseData.triage_sirkulasi === opt}
																								onChange={() => handleTriaseChange("triage_sirkulasi", opt)}
																								className="accent-red-600"
																							/>
																							<span>{opt}</span>
																						</label>
																					))}
																				</div>
																			</div>

																			{/* Pertolongan Pertama Jam */}
																			<div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
																				<label className="block font-bold text-slate-700 mb-1">PERTOLONGAN PERTAMA JAM:</label>
																				<div className="flex items-center gap-1.5">
																					<input
																						type="time"
																						value={triaseData.first_aid_time || ""}
																						onChange={(e) => handleTriaseChange("first_aid_time", e.target.value)}
																						className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-600"
																					/>
																					<span className="text-slate-500 font-bold text-xs">WIB</span>
																				</div>
																			</div>
																		</div>

																		{/* TINDAKAN RESUSITASI */}
																		<div className="p-3.5 bg-red-50/50 rounded-xl border border-red-200/80">
																			<span className="block font-black text-red-900 uppercase text-[11px] mb-2 tracking-wider">TINDAKAN RESUSITASI :</span>
																			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
																				{/* 1. Jalan Nafas */}
																				<div>
																					<span className="block font-bold text-slate-700 mb-1">1. Jalan Nafas :</span>
																					<div className="space-y-1">
																						{["Hyperekstensi", "Bersihkan jalan nafas", "Intubasi"].map((opt) => (
																							<label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
																								<input
																									type="checkbox"
																									checked={(triaseData.resus_airway || []).includes(opt)}
																									onChange={(e) => {
																										const list = triaseData.resus_airway || [];
																										const updated = e.target.checked ? [...list, opt] : list.filter((i) => i !== opt);
																										handleTriaseChange("resus_airway", updated);
																									}}
																									className="rounded accent-red-600"
																								/>
																								<span>{opt}</span>
																							</label>
																						))}
																					</div>
																				</div>

																				{/* 2. Bantuan Nafas (Breathing) */}
																				<div>
																					<span className="block font-bold text-slate-700 mb-1">2. Bantuan Nafas (Breathing) :</span>
																					<div className="space-y-1">
																						{["Mulut ke mulut", "Bag and Mask", "Bag and Tube"].map((opt) => (
																							<label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
																								<input
																									type="checkbox"
																									checked={(triaseData.resus_breathing || []).includes(opt)}
																									onChange={(e) => {
																										const list = triaseData.resus_breathing || [];
																										const updated = e.target.checked ? [...list, opt] : list.filter((i) => i !== opt);
																										handleTriaseChange("resus_breathing", updated);
																									}}
																									className="rounded accent-red-600"
																								/>
																								<span>{opt}</span>
																							</label>
																						))}
																					</div>
																				</div>

																				{/* 3. Sirkulasi */}
																				<div>
																					<span className="block font-bold text-slate-700 mb-1">3. Sirkulasi :</span>
																					<div className="space-y-1">
																						{["Massage jantung luar", "Balut tekan", "Operasi"].map((opt) => (
																							<label key={opt} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
																								<input
																									type="checkbox"
																									checked={(triaseData.resus_circulation || []).includes(opt)}
																									onChange={(e) => {
																										const list = triaseData.resus_circulation || [];
																										const updated = e.target.checked ? [...list, opt] : list.filter((i) => i !== opt);
																										handleTriaseChange("resus_circulation", updated);
																									}}
																									className="rounded accent-red-600"
																								/>
																								<span>{opt}</span>
																							</label>
																						))}
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>

																{/* 2. ANAMNESIS TEMPLATE */}
																<div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-xs">
																	<div className="bg-slate-200 px-4 py-2 text-slate-800 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300">
																		<span className="text-xs font-black uppercase tracking-wider">ANAMNESIS</span>
																		<span className="text-[11px] italic font-semibold text-slate-600">
																			Jika cidera / kecelakaan jelaskan juga mekanisme cidera/kecelakaannya
																		</span>
																	</div>
																	<div className="p-4 space-y-4 text-xs">
																		{/* KELUHAN UTAMA */}
																		<div>
																			<label className="block font-bold uppercase text-slate-700 mb-1">KELUHAN UTAMA :</label>
																			<textarea
																				rows={3}
																				value={entryDetail.complaint || ""}
																				onChange={(e) => onUpdateDetailField(type, "complaint", e.target.value)}
																				placeholder="Keluhan utama pasien & mekanisme cidera / kecelakaannya..."
																				className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:outline-none"
																			/>
																		</div>

																		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																			{/* RIWAYAT PENYAKIT */}
																			<div>
																				<label className="block font-bold uppercase text-slate-700 mb-1">RIWAYAT PENYAKIT :</label>
																				<input
																					type="text"
																					value={triaseData.riwayat_penyakit || ""}
																					onChange={(e) => handleTriaseChange("riwayat_penyakit", e.target.value)}
																					placeholder="Riwayat penyakit dahulu / keluarga..."
																					className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
																				/>
																			</div>

																			{/* RIWAYAT PENGOBATAN */}
																			<div>
																				<label className="block font-bold uppercase text-slate-700 mb-1">RIWAYAT PENGOBATAN :</label>
																				<input
																					type="text"
																					value={triaseData.riwayat_pengobatan || ""}
																					onChange={(e) => handleTriaseChange("riwayat_pengobatan", e.target.value)}
																					placeholder="Obat-obatan yang sedang diminum..."
																					className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
																				/>
																			</div>

																			{/* RIWAYAT ALERGI */}
																			<div>
																				<label className="block font-bold uppercase text-slate-700 mb-1">RIWAYAT ALERGI :</label>
																				<div className="flex items-center gap-2 mb-1.5">
																					{["Tidak", "Ya"].map((opt) => (
																						<label key={opt} className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
																							<input
																								type="radio"
																								name="has_allergy"
																								checked={triaseData.has_allergy === opt}
																								onChange={() => handleTriaseChange("has_allergy", opt)}
																								className="accent-red-600"
																							/>
																							<span>{opt === "Tidak" ? "Tidak" : "Ya, (jelaskan)"}</span>
																						</label>
																					))}
																				</div>
																				{triaseData.has_allergy === "Ya" && (
																					<input
																						type="text"
																						value={triaseData.allergy_note || ""}
																						onChange={(e) => handleTriaseChange("allergy_note", e.target.value)}
																						placeholder="Sebutkan alergi obat / makanan..."
																						className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
																					/>
																				)}
																			</div>
																		</div>
																	</div>
																</div>

																{/* 3. PEMERIKSAAN JASMANI TEMPLATE */}
																<div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-xs">
																	<div className="bg-slate-200 px-4 py-2 text-slate-800 flex items-center justify-between border-b border-slate-300">
																		<span className="text-xs font-black uppercase tracking-wider">PEMERIKSAAN JASMANI</span>
																		<span className="text-[11px] font-bold text-slate-700">Skala Nyeri (0 - 10)</span>
																	</div>

																	<div className="p-4 space-y-5 text-xs">
																		{/* GCS & VITAL SIGNS & PAIN ASSESSMENT TOOL */}
																		<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
																			{/* Skala GCS */}
																			<div className="space-y-2">
																				<span className="block font-bold text-slate-800 uppercase text-[11px]">Skala GCS & Kesadaran :</span>
																				<div className="grid grid-cols-4 gap-1.5">
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">E (Eye)</label>
																						<input
																							type="text"
																							value={triaseData.gcs_e || ""}
																							onChange={(e) => handleTriaseChange("gcs_e", e.target.value)}
																							placeholder="4"
																							className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 font-bold"
																						/>
																					</div>
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">V (Verbal)</label>
																						<input
																							type="text"
																							value={triaseData.gcs_v || ""}
																							onChange={(e) => handleTriaseChange("gcs_v", e.target.value)}
																							placeholder="5"
																							className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 font-bold"
																						/>
																					</div>
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">M (Motorik)</label>
																						<input
																							type="text"
																							value={triaseData.gcs_m || ""}
																							onChange={(e) => handleTriaseChange("gcs_m", e.target.value)}
																							placeholder="6"
																							className="w-full text-center rounded-lg border border-slate-300 bg-white py-1 font-bold"
																						/>
																					</div>
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">Σ (Total)</label>
																						<input
																							type="text"
																							readOnly
																							value={
																								(Number(triaseData.gcs_e || 0) || 0) +
																								(Number(triaseData.gcs_v || 0) || 0) +
																								(Number(triaseData.gcs_m || 0) || 0) || ""
																							}
																							className="w-full text-center rounded-lg border border-slate-300 bg-slate-200 py-1 font-black text-red-700"
																						/>
																					</div>
																				</div>
																				<div>
																					<label className="block text-[10px] font-semibold text-slate-500 mt-1">Kesadaran :</label>
																					<input
																						type="text"
																						value={triaseData.kesadaran_text || ""}
																						onChange={(e) => handleTriaseChange("kesadaran_text", e.target.value)}
																						placeholder="Compos Mentis / Somnolen..."
																						className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
																					/>
																				</div>
																			</div>

																			{/* Vital Signs (RR, Nadi, TD, Suhu) */}
																			<div className="space-y-2">
																				<span className="block font-bold text-slate-800 uppercase text-[11px]">Vital Signs :</span>
																				<div className="grid grid-cols-2 gap-2">
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">Resp Rate (x/mnt)</label>
																						<input
																							type="number"
																							value={vs.rr || ""}
																							onChange={(e) => handleVitalSignChange("rr", e.target.value)}
																							placeholder="20"
																							className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-semibold"
																						/>
																					</div>
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">Nadi (x/mnt)</label>
																						<input
																							type="number"
																							value={vs.pulse || ""}
																							onChange={(e) => handleVitalSignChange("pulse", e.target.value)}
																							placeholder="80"
																							className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-semibold"
																						/>
																					</div>
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">Tek. Darah (mmHg)</label>
																						<input
																							type="text"
																							value={vs.systolic && vs.diastolic ? `${vs.systolic}/${vs.diastolic}` : vs.systolic || ""}
																							onChange={(e) => {
																								const parts = e.target.value.split("/");
																								handleVitalSignChange("systolic", parts[0] || "");
																								if (parts[1] !== undefined) handleVitalSignChange("diastolic", parts[1]);
																							}}
																							placeholder="120/80"
																							className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-semibold"
																						/>
																					</div>
																					<div>
																						<label className="block text-[10px] font-semibold text-slate-500">Suhu (°C)</label>
																						<input
																							type="number"
																							step="0.1"
																							value={vs.temp || ""}
																							onChange={(e) => handleVitalSignChange("temp", e.target.value)}
																							placeholder="36.5"
																							className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-center font-semibold"
																						/>
																					</div>
																				</div>
																			</div>

																			{/* PAIN ASSESSMENT TOOL (Skala Nyeri 0-10) */}
																			<div className="p-2.5 bg-white rounded-xl border border-slate-300 space-y-2">
																				<div className="flex items-center justify-between">
																					<span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-800">
																						PAIN ASSESSMENT TOOL
																					</span>
																					<div className="flex items-center gap-1">
																						<span className="text-[10px] font-bold text-slate-500">Skala Nyeri:</span>
																						<input
																							type="number"
																							min={0}
																							max={10}
																							value={triaseData.pain_score ?? 0}
																							onChange={(e) => handleTriaseChange("pain_score", Math.min(10, Math.max(0, Number(e.target.value))))}
																							className="w-12 text-center rounded-lg border border-red-300 bg-red-50 text-red-700 text-xs font-black py-0.5 focus:outline-none"
																						/>
																					</div>
																				</div>
																				<div className="flex items-center justify-between gap-1">
																					{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
																						const active = Number(triaseData.pain_score) === score;
																						let badgeColor = "bg-emerald-500 text-white";
																						if (score >= 1 && score <= 3) badgeColor = "bg-emerald-400 text-slate-900";
																						if (score >= 4 && score <= 6) badgeColor = "bg-amber-400 text-slate-900";
																						if (score >= 7 && score <= 9) badgeColor = "bg-orange-500 text-white";
																						if (score === 10) badgeColor = "bg-red-600 text-white";

																						return (
																							<button
																								key={score}
																								type="button"
																								onClick={() => handleTriaseChange("pain_score", score)}
																								className={`h-7 w-7 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center ${
																									active ? `${badgeColor} ring-2 ring-slate-900 scale-110 shadow-xs` : "bg-slate-100 text-slate-700 hover:bg-slate-200"
																								}`}
																							>
																								{score}
																							</button>
																						);
																					})}
																				</div>
																				<div className="flex justify-between text-[9px] font-bold text-slate-500 pt-0.5">
																					<span>0: No Pain</span>
																					<span>1-3: Mild</span>
																					<span>4-6: Mod</span>
																					<span>7-9: Sev</span>
																					<span>10: Worst</span>
																				</div>
																			</div>
																		</div>

																		{/* 16 ORGAN HEAD-TO-TOE PEMERIKSAAN JASMANI (2 KOLOM RESMI) */}
																		<div className="space-y-2">
																			<div className="flex items-center justify-between">
																				<span className="block font-bold text-slate-800 uppercase text-[11px]">
																					Pemeriksaan Organ Head to Toe :
																				</span>
																				<button
																					type="button"
																					onClick={() => {
																						const current = parseVitalSigns(entryDetail.igd_triase_data);
																						const organs = ["kepala", "mata", "telinga", "hidung", "mulut", "gigi", "tenggorokan", "leher", "dada", "jantung", "paru", "abdomen", "genetalia", "kandungan", "ekstremitas_atas", "ekstremitas_bawah"];
																						const updated = { ...current };
																						organs.forEach((o) => {
																							updated[`organ_${o}`] = "dbn (dalam batas normal)";
																						});
																						onUpdateDetailField(type, "igd_triase_data", JSON.stringify(updated));
																					}}
																					className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
																				>
																					<Sparkles className="h-3.5 w-3.5 text-emerald-700" /> Set Semua Normal (DBN)
																				</button>
																			</div>
																			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
																				{/* Kolom Kiri */}
																				<div className="space-y-2">
																					{[
																						{ key: "kepala", label: "Kepala" },
																						{ key: "mata", label: "Mata" },
																						{ key: "telinga", label: "Telinga" },
																						{ key: "hidung", label: "Hidung" },
																						{ key: "mulut", label: "Mulut" },
																						{ key: "gigi", label: "Gigi" },
																						{ key: "tenggorokan", label: "Tenggorokan" },
																						{ key: "leher", label: "Leher" },
																						{ key: "dada", label: "Dada" },
																						{ key: "jantung", label: "Jantung" },
																					].map((organ) => (
																						<div key={organ.key} className="flex items-center gap-2">
																							<label className="w-24 text-[11px] font-semibold text-slate-700 shrink-0">{organ.label} :</label>
																							<input
																								type="text"
																								value={triaseData[`organ_${organ.key}`] || ""}
																								onChange={(e) => handleTriaseChange(`organ_${organ.key}`, e.target.value)}
																								placeholder="dbn / kelainan..."
																								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:outline-none focus:border-slate-600 font-medium"
																							/>
																							<button
																								type="button"
																								onClick={() => handleTriaseChange(`organ_${organ.key}`, "dbn (dalam batas normal)")}
																								className="text-[10px] font-extrabold text-slate-500 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-1.5 py-0.5 rounded cursor-pointer shrink-0"
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
																						{ key: "paru", label: "Paru" },
																						{ key: "abdomen", label: "Abdomen" },
																						{ key: "genetalia", label: "Genetalia" },
																						{ key: "kandungan", label: "Kandungan" },
																						{ key: "ekstremitas_atas", label: "Ekstremitas atas" },
																						{ key: "ekstremitas_bawah", label: "Ekstremitas bawah" },
																					].map((organ) => (
																						<div key={organ.key} className="flex items-center gap-2">
																							<label className="w-32 text-[11px] font-semibold text-slate-700 shrink-0">{organ.label} :</label>
																							<input
																								type="text"
																								value={triaseData[`organ_${organ.key}`] || ""}
																								onChange={(e) => handleTriaseChange(`organ_${organ.key}`, e.target.value)}
																								placeholder="dbn / kelainan..."
																								className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs focus:outline-none focus:border-slate-600 font-medium"
																							/>
																							<button
																								type="button"
																								onClick={() => handleTriaseChange(`organ_${organ.key}`, "dbn (dalam batas normal)")}
																								className="text-[10px] font-extrabold text-slate-500 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-1.5 py-0.5 rounded cursor-pointer shrink-0"
																								title="Set DBN"
																							>
																								dbn
																							</button>
																						</div>
																					))}
																				</div>
																			</div>
																		</div>
																	</div>

																	{/* FOOTER BAR DOKUMEN REPLIKA */}
																	<div className="bg-slate-200 px-4 py-1.5 text-slate-600 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold border-t border-slate-300">
																		<span>FORM GAWAT DARURAT MEDIS</span>
																		<span>No. Dokumen : 045/IRM/Rev0/2016</span>
																		<span>Halaman 1</span>
																	</div>
																</div>
															</div>
														);
													}

													if (field.inputType === "icd10_autocomplete") {
														return (
															<div key={field.name}>
																<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
																<ICD10Autocomplete
																	value={entryDetail[field.name] || ""}
																	onChange={(val) => onUpdateDetailField(type, field.name, val)}
																	placeholder="Cari & pilih Diagnosis Utama ICD-10 (misal: A01.0, J18.9, E11.9)..."
																/>
															</div>
														);
													}

													if (field.inputType === "icd10_multiselect") {
														return (
															<div key={field.name}>
																<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
																<ICD10MultiSelect
																	value={entryDetail[field.name] || ""}
																	onChange={(val) => onUpdateDetailField(type, field.name, val)}
																/>
															</div>
														);
													}

													if (field.inputType === "ugd_discharge_summary") {
														const currentObj = (() => {
															try {
																return typeof entryDetail[field.name] === "string" ? JSON.parse(entryDetail[field.name]) : entryDetail[field.name] || {};
															} catch {
																return { status: entryDetail[field.name] || "" };
															}
														})();

														const updateStatus = (key, val) => {
															const updated = { ...currentObj, [key]: val };
															onUpdateDetailField(type, field.name, JSON.stringify(updated));
														};

														return (
															<div key={field.name} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
																<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">{field.label}</label>

																<div>
																	<span className="block text-xs font-semibold text-slate-600 mb-2">Kondisi Akhir Pasien UGD :</span>
																	<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
																		{[
																			{ value: "Membaik", label: "Membaik / Pulang" },
																			{ value: "Rawat Inap", label: "Rawat Inap" },
																			{ value: "Rujuk ke Faskes Lain", label: "Rujuk Faskes Lain" },
																			{ value: "Meninggal", label: "Meninggal Dunia" },
																		].map((opt) => {
																			const isSelected = currentObj.status === opt.value;
																			return (
																				<button
																					key={opt.value}
																					type="button"
																					onClick={() => updateStatus("status", opt.value)}
																					className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
																						isSelected ? "bg-teal-800 text-white border-teal-800 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
																					}`}
																				>
																					{opt.label}
																				</button>
																			);
																		})}
																	</div>
																</div>

																{currentObj.status === "Rujuk ke Faskes Lain" && (
																	<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
																		<div>
																			<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sarana Transportasi Rujukan</label>
																			<select
																				value={currentObj.transport || "Ambulans"}
																				onChange={(e) => updateStatus("transport", e.target.value)}
																				className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
																			>
																				<option value="Ambulans">Ambulans Faskes / IGD</option>
																				<option value="Kendaraan Pribadi">Kendaraan Pribadi</option>
																				<option value="Lainnya">Lainnya</option>
																			</select>
																		</div>
																		<div>
																			<label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Faskes Tujuan Rujukan</label>
																			<input
																				type="text"
																				value={currentObj.target_facility || ""}
																				onChange={(e) => updateStatus("target_facility", e.target.value)}
																				placeholder="Contoh: RSUD Dr. Soetomo / RS Tipe A"
																				className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
																			/>
																		</div>
																	</div>
																)}
															</div>
														);
													}

													if (field.inputType === "text") {
														return (
															<div key={field.name}>
																<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
																<input
																	type="text"
																	value={entryDetail[field.name] || ""}
																	onChange={(e) => onUpdateDetailField(type, field.name, e.target.value)}
																	placeholder={field.placeholder || field.label}
																	className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
																/>
															</div>
														);
													}

													// Filter Sub-Layanan Medis dari Master Data yang sesuai dengan Kategori ini
													const matchingSubLayanan = subLayananItems.filter((sub) => {
														const subCat = (sub.category || "").toLowerCase();
														const tLbl = typeLabel.toLowerCase();
														return subCat.includes(tLbl) || tLbl.includes(subCat) || (type === "igd" && subCat.includes("gawat"));
													});

													const showRoomSelector =
														(type === "rawat_inap" || type === "one_day_care" || typeLabel.toLowerCase().includes("rawat inap")) &&
														field.name === "physical_exam";

													return (
														<div key={field.name} className="space-y-2">
															<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
															
															{/* Widget Pilihan Kamar / Ruangan (Master Data Kelola Ruangan) */}
															{showRoomSelector && roomOptions.length > 0 && (
																<div className="mb-3 p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/30">
																	<span className="block text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-2">
																		🏥 Pilih Kamar / Ruangan Rawat Inap (Master Data Kelola Ruangan):
																	</span>
																	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
																		{roomOptions.map((room) => {
																			const isSelected = (entryDetail.physical_exam || "").includes(room.value);
																			return (
																				<button
																					key={room.value}
																					type="button"
																					onClick={() => {
																						const currentExam = entryDetail.physical_exam || "";
																						if (isSelected) {
																							const updated = currentExam.replace(`Ruangan/Kamar: ${room.value}`, "").trim();
																							onUpdateDetailField(type, "physical_exam", updated);
																						} else {
																							const roomStr = `Ruangan/Kamar: ${room.value}`;
																							const updated = currentExam ? `${currentExam.trim()}\n${roomStr}` : roomStr;
																							onUpdateDetailField(type, "physical_exam", updated);
																						}
																					}}
																					className={`text-xs font-bold px-3 py-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
																						isSelected
																							? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
																							: "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
																					}`}
																				>
																					<span className="truncate">{room.label}</span>
																					{isSelected ? <Check className="h-3.5 w-3.5 text-white shrink-0" /> : <span className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />}
																				</button>
																			);
																		})}
																	</div>
																</div>
															)}

															{/* Widget Prosedur / Tindakan Standar (Master Data Layanan Medis) */}
															{field.name === "action" && (
																<div className="mb-3 p-3.5 rounded-2xl border border-teal-100 bg-teal-50/30">
																	<span className="block text-[11px] font-bold uppercase tracking-wider text-teal-900 mb-2">
																		⚡ Pilih Prosedur & Tindakan Standar {typeLabel} (Master Data Layanan Medis):
																	</span>
																	{matchingSubLayanan.length === 0 ? (
																		<p className="text-xs text-slate-400">Tidak ada rincian tindakan spesifik di Master Data untuk kategori ini.</p>
																	) : (
																		<div className="flex flex-wrap gap-2">
																			{matchingSubLayanan.map((sub) => {
																				const isSelected = (entryDetail.action || "").includes(sub.name);
																				return (
																					<button
																						key={sub.id}
																						type="button"
																						onClick={() => {
																							const currentAction = entryDetail.action || "";
																							if (isSelected) {
																								const updated = currentAction.replace(sub.name, "").replace(/,\s*,/g, ",").replace(/^,\s*|\s*,\s*$/g, "");
																								onUpdateDetailField(type, "action", updated);
																							} else {
																								const updated = currentAction ? `${currentAction.trim()}, ${sub.name}` : sub.name;
																								onUpdateDetailField(type, "action", updated);
																							}
																						}}
																						className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
																							isSelected
																								? "bg-teal-800 text-white border-teal-800 shadow-xs"
																								: "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50"
																						}`}
																					>
																						<span>{sub.name}</span>
																						{isSelected ? <Check className="h-3 w-3 text-white shrink-0" /> : <Plus className="h-3 w-3 text-slate-400 shrink-0" />}
																					</button>
																				);
																			})}
																		</div>
																	)}
																</div>
															)}

															<textarea
																value={entryDetail[field.name] || ""}
																onChange={(e) => onUpdateDetailField(type, field.name, e.target.value)}
																rows={3}
																placeholder={field.placeholder || field.label}
																className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
															/>
														</div>
													);
												})}
											</div>
										</div>
									);
								})}
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
