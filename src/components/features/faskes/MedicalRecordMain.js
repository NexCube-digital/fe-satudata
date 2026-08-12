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
} from "lucide-react";
import MedicalRecordUpdateActions from "@/components/features/faskes/MedicalRecordUpdate";

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
		patientId,
		onPatientChange,
		patientOptions,
		loadingPatients,
		recordId,
		approvedPatients,
		title,
		onTitleChange,
		visitDate,
		onVisitDateChange,
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
				{currentStep === stepJenis && (
					<div className="space-y-6">
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
									Jenis Rekam Medis / Pelayanan Medis (bisa pilih lebih dari satu)
								</label>
								<span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/80 px-2 py-0.5 rounded-full">
									Data Pelayanan Medis
								</span>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{recordTypes.map((option) => {
									const active = selectedTypes.includes(option.value);
									return (
										<button
											key={option.value}
											type="button"
											onClick={() => onToggleRecordType(option.value)}
											className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition cursor-pointer text-left ${
												active
													? "border-teal-700 bg-teal-800 text-white shadow-md"
													: "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-slate-100/80"
											}`}
										>
											<div className="flex items-center gap-2">
												<Stethoscope className={`h-4 w-4 shrink-0 ${active ? "text-teal-200" : "text-teal-700"}`} />
												<span>{option.label}</span>
											</div>
											{active ? (
												<Check className="h-4 w-4 shrink-0 text-white" />
											) : (
												<span className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
											)}
										</button>
									);
								})}
							</div>
							<p className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
								<Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
								Pilih satu atau beberapa jenis Pelayanan Medis utama yang dilaksanakan pada kunjungan pasien ini.
							</p>
						</div>

						{/* Section Pilihan Layanan Penunjang (Opsional) */}
						<div className="pt-5 border-t border-slate-200/80">
							<div className="flex items-center justify-between mb-2">
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
									Pilihan Layanan Penunjang <span className="text-amber-600 font-semibold">(Opsional)</span>
								</label>
								<span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200/80 px-2 py-0.5 rounded-full">
									Data Layanan Penunjang
								</span>
							</div>
							<p className="text-xs text-slate-500 mb-3">
								Pilih kategori penunjang (Laboratorium / Radiologi). Setelah dipilih, turunan pemeriksaan akan muncul di bawahnya.
							</p>

							{/* 1. Main Category Selector (Laboratorium & Radiologi) */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
								{penunjangMainCategories.map((cat) => {
									const active = selectedPenunjangCategories.includes(cat.value);
									return (
										<button
											key={cat.value}
											type="button"
											onClick={() => onTogglePenunjangCategory && onTogglePenunjangCategory(cat.value)}
											className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-sm font-bold transition cursor-pointer text-left ${
												active
													? "border-purple-600 bg-purple-800 text-white shadow-md"
													: "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50/40"
											}`}
										>
											<div className="flex items-center gap-3">
												<Activity className={`h-5 w-5 shrink-0 ${active ? "text-purple-200" : "text-purple-600"}`} />
												<div>
													<span className="block text-sm font-extrabold">{cat.label}</span>
													<span className={`text-xs ${active ? "text-purple-200" : "text-slate-400"}`}>
														{active ? "Klik untuk menyembunyikan turunan" : "Klik untuk menampilkan turunan pemeriksaan"}
													</span>
												</div>
											</div>
											{active ? (
												<Check className="h-5 w-5 shrink-0 text-white" />
											) : (
												<span className="h-5 w-5 rounded-full border border-slate-300 shrink-0" />
											)}
										</button>
									);
								})}
							</div>

							{/* 2. Sub-Items (Turunan) per Selected Category */}
							{selectedPenunjangCategories.map((catName) => {
								const subList = penunjangSubItems.filter((item) => item.category === catName);
								if (subList.length === 0) return null;

								return (
									<div key={catName} className="mt-4 p-4 rounded-2xl border border-purple-100 bg-purple-50/20 space-y-3">
										<div className="flex items-center justify-between border-b border-purple-100 pb-2">
											<span className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
												<Activity className="h-3.5 w-3.5 text-purple-600" />
												Turunan Pemeriksaan {catName} ({subList.length} Opsi)
											</span>
											<span className="text-[10px] font-semibold text-purple-700">
												{selectedPenunjangSubItems.filter((id) => subList.some((s) => s.id === id)).length} terpilih
											</span>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
											{subList.map((sub) => {
												const active = selectedPenunjangSubItems.includes(sub.id);
												return (
													<button
														key={sub.id}
														type="button"
														onClick={() => onTogglePenunjangSubItem && onTogglePenunjangSubItem(sub.id)}
														className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition cursor-pointer text-left ${
															active
																? "border-purple-600 bg-purple-700 text-white shadow-xs"
																: "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50/40"
														}`}
													>
														<span className="truncate">{sub.name}</span>
														{active ? (
															<Check className="h-3.5 w-3.5 shrink-0 text-white" />
														) : (
															<span className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />
														)}
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{currentStep === stepKunjungan && (
					<div className="space-y-5">
						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
								Pilih Pasien Terotorisasi
							</label>
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

						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Judul Rekam Medis</label>
								<input
									value={title}
									onChange={(e) => onTitleChange(e.target.value)}
									type="text"
									placeholder="Contoh: Pemeriksaan Gula Darah"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
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
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
									required
								/>
							</div>
						</div>

						<div className="grid gap-6 md:grid-cols-3">
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jenis Layanan</label>
								<SearchableSelect
									value={typeOfTreatment}
									onChange={onTypeOfTreatmentChange}
									options={typeOfTreatmentOptions}
									placeholder="-- Pilih Jenis Layanan --"
									emptyText="Jenis layanan tidak ditemukan."
									required
								/>
							</div>
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
									Dokter Penanggung Jawab <span className="text-slate-400 font-medium normal-case ml-1">(opsional)</span>
								</label>
								<SearchableSelect
									value={doctorId}
									onChange={onDoctorChange}
									options={doctorOptions}
									isLoading={loadingDoctors}
									loadingText="Memuat daftar dokter..."
									placeholder="-- Tidak ditentukan --"
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

						return (
							<div className="space-y-5">
								<span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">Data: {typeLabel}</span>
								<div className="grid gap-6">
									{detailFields.map((field) => (
										<div key={field.name}>
											<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{field.label}</label>
											<textarea
												value={entryDetail[field.name] || ""}
												onChange={(e) => onUpdateDetailField(type, field.name, e.target.value)}
												rows={3}
												placeholder={field.label}
												className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
											/>
										</div>
									))}
								</div>
							</div>
						);
					})()}

				{currentStep === stepLampiran && (
					<div className="space-y-8">
						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
								Obat <span className="text-slate-400 font-medium normal-case ml-1">(opsional, bisa lebih dari satu)</span>
							</label>

							<div className="space-y-3">
								{prescriptionItems.length === 0 ? (
									<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-400">
										Belum ada obat ditambahkan.
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
						</div>

						<div>
							<label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
								Lampiran <span className="text-slate-400 font-medium normal-case ml-1">(opsional, maks. {maxAttachments} file)</span>
							</label>
							<label
								htmlFor="attachments-input"
								className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-teal-300 bg-teal-50/40 px-4 py-6 text-sm font-semibold text-teal-800 hover:bg-teal-50 transition cursor-pointer"
							>
								<Paperclip className="h-4 w-4" /> Klik untuk pilih file lampiran
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
