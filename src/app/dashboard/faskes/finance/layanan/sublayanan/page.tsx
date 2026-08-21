"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { notify } from "@/lib/notify";
import {
	Plus,
	RefreshCw,
	Trash2,
	Pencil,
	X,
	Search,
	CheckCircle2,
	ArrowLeft,
	Layers,
	Loader2,
	ChevronLeft,
	ChevronRight,
	DollarSign,
	Info,
	MoreHorizontal,
	Printer,
} from "lucide-react";
import {
	getServicePriceMedis,
	getServicePriceKlinik,
	createServicePriceMedis,
	createServicePriceKlinik,
	updateServicePriceMedis,
	updateServicePriceKlinik,
	deleteServicePriceMedis,
	deleteServicePriceKlinik,
} from "@/services/servicePriceService";

// ==================== Tipe Data ====================

type SourceType = "medis" | "klinik";
type ClassType = "umum" | "eksekutif";
type StatusType = "active" | "inactive";

interface SubLayananItem {
	id: number;
	source: SourceType;
	service_unit_id: number | string;
	kptl: string | null;
	name: string;
	satuan: string;
	class: ClassType;
	category: string | null;
	price: number;
	status: StatusType;
}

interface SubLayananForm {
	source: SourceType;
	kptl: string;
	name: string;
	satuan: string;
	class: ClassType;
	category: string;
	price: string;
	status: StatusType;
}

type FormErrors = Partial<Record<"name" | "price" | "category", string>>;

interface CategoryRule {
	key: string;
	match: string[];
	options: string[] | null;
}

interface ToastState {
	show: boolean;
	type?: "success" | "error";
	message?: string;
}

interface ApiListResponse<T> {
	data?: T[];
}

// ==================== Konstanta ====================

const CATEGORY_LABEL: Record<string, string> = {
	admin: "Admin",
	utama: "Utama",
	penunjang: "Penunjang",
	ruangan: "Ruangan",
};

const CATEGORY_BADGE: Record<string, string> = {
	admin: "bg-slate-100 text-slate-600 border-slate-200",
	utama: "bg-teal-50 text-teal-800 border-teal-200",
	penunjang: "bg-cyan-50 text-cyan-800 border-cyan-200",
	ruangan: "bg-amber-50 text-[#B45309] border-amber-200",
};

const CLASS_LABEL: Record<ClassType, string> = { umum: "Umum", eksekutif: "Eksekutif" };
const CLASS_BADGE: Record<ClassType, string> = {
	umum: "bg-teal-50 text-teal-800 border-teal-200",
	eksekutif: "bg-amber-50 text-[#B45309] border-amber-200",
};
const SOURCE_LABEL: Record<SourceType, string> = { medis: "Medis", klinik: "Klinik" };
const SOURCE_BADGE: Record<SourceType, string> = {
	medis: "bg-indigo-50 text-indigo-800 border-indigo-200",
	klinik: "bg-cyan-50 text-cyan-800 border-cyan-200",
};

const sourceOptionsForForm: { value: SourceType; label: string }[] = [
	{ value: "klinik", label: "Klinik" },
	{ value: "medis", label: "Medis" },
];

const sourceFilterOptions: { value: "all" | SourceType; label: string }[] = [
	{ value: "all", label: "Semua Sumber" },
	{ value: "medis", label: "Medis" },
	{ value: "klinik", label: "Klinik" },
];

const formatRupiah = (value: number | string | null | undefined): string =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(Number(value) || 0);

const UNIT_CATEGORY_RULES: CategoryRule[] = [
	{ key: "pendaftaran", match: ["pendaftaran", "administrasi"], options: ["Pendaftaran", "Administrasi"] },
	{ key: "akomodasi", match: ["akomodasi"], options: null },
	{ key: "pelayanan_medis", match: ["pelayanan medis"], options: ["Visit", "Pemeriksaan", "Konsultasi", "Konseling"] },
	{ key: "gawat_darurat", match: ["gawat darurat", "igd"], options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Lainnya"] },
	{
		key: "rawat_inap",
		match: ["rawat inap", "ranap"],
		options: ["Kelas II Tindakan Kecil", "Kelas II Tindakan Sedang", "Kelas II Tindakan Besar", "Kelas II Tindakan Lainnya"],
	},
	{ key: "rawat_jalan", match: ["rawat jalan", "rajal"], options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Lainnya"] },
	{ key: "icu", match: ["icu", "intensive"], options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Khusus"] },
	{ key: "bedah", match: ["bedah", "operasi"], options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Khusus"] },
	{
		key: "laboratorium",
		match: ["laboratorium", "lab"],
		options: [
			"Sederhana - Hematologi",
			"Sederhana - Kimia Klinik",
			"Sederhana - Urin Rutin",
			"Sederhana - Imunologi Serologi",
			"Sederhana - Mikrobiologi",
			"Sederhana - Biomolekular",
			"Sedang - Hematologi",
			"Sedang - Kimia Klinik",
			"Sedang - Klinik Rutin",
			"Sedang - Mikrobiologi",
			"Sedang - Patologi Anatomi",
			"Sedang - Biomolekular",
			"Sedang - Imunologi Serologi",
		],
	},
	{ key: "radiologi", match: ["radiologi", "rontgen"], options: ["Sederhana", "Sedang", "Sulit", "Khusus"] },
	{ key: "rehab_medik", match: ["rehab medik", "rehabilitasi", "fisioterapi"], options: ["Kecil", "Sedang", "Besar"] },
	{
		key: "farmasi",
		match: ["farmasi", "pharmacy", "fmi"],
		options: ["Tuslah", "Tindakan Medik Non Operatif", "Visite", "Konseling", "Lainnya"],
	},
];

function resolveCategoryRule(unitName: string | null | undefined): CategoryRule | null {
	const name = (unitName || "").toLowerCase();
	return UNIT_CATEGORY_RULES.find((rule) => rule.match.some((kw) => name.includes(kw))) || null;
}

const emptyForm: SubLayananForm = {
	source: "klinik",
	kptl: "",
	name: "",
	satuan: "Per Tindakan",
	class: "umum",
	category: "",
	price: "",
	status: "active",
};

function getPaginationRange(current: number, total: number): (number | "ellipsis")[] {
	const delta = 1;
	const pages: number[] = [];
	for (let i = 1; i <= total; i++) {
		if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
			pages.push(i);
		}
	}
	const result: (number | "ellipsis")[] = [];
	let previous = 0;
	for (const page of pages) {
		if (previous) {
			if (page - previous === 2) {
				result.push(previous + 1);
			} else if (page - previous > 2) {
				result.push("ellipsis");
			}
		}
		result.push(page);
		previous = page;
	}
	return result;
}

// Label filter aktif dipakai di badge layar & header cetak PDF
function buildActiveFilterLabels(params: {
	searchTerm: string;
	categoryFilter: string;
	sourceFilter: "all" | SourceType;
	classFilter: "all" | ClassType;
}): string[] {
	const labels: string[] = [];
	if (params.searchTerm.trim()) labels.push(`Pencarian: "${params.searchTerm.trim()}"`);
	if (params.categoryFilter !== "all") labels.push(`Kategori: ${params.categoryFilter}`);
	if (params.sourceFilter !== "all") labels.push(`Sumber: ${SOURCE_LABEL[params.sourceFilter]}`);
	if (params.classFilter !== "all") labels.push(`Kelas: ${CLASS_LABEL[params.classFilter]}`);
	return labels;
}

export default function SubLayananPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const unitId = searchParams.get("unitId");
	const unitName = searchParams.get("unitName") || "-";
	const category = searchParams.get("category");

	const [loading, setLoading] = useState<boolean>(true);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [subLayanan, setSubLayanan] = useState<SubLayananItem[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [sourceFilter, setSourceFilter] = useState<"all" | SourceType>("all");
	const [classFilter, setClassFilter] = useState<"all" | ClassType>("all");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage] = useState<number>(10);
	const [toast, setToast] = useState<ToastState>({ show: false });

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [editing, setEditing] = useState<SubLayananItem | null>(null);
	const [form, setForm] = useState<SubLayananForm>(emptyForm);
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const categoryRule = useMemo(() => resolveCategoryRule(unitName), [unitName]);
	const categoryMode: "free" | "none" | "select" = !categoryRule
		? "free"
		: categoryRule.options === null
		? "none"
		: "select";
	const categoryOptions = categoryRule?.options || [];

	const loadData = async ({ silent = false }: { silent?: boolean } = {}) => {
		if (!unitId) return;

		silent ? setRefreshing(true) : setLoading(true);
		try {
			const [medisRes, klinikRes] = await Promise.all([
				getServicePriceMedis({ service_unit_id: unitId }) as Promise<ApiListResponse<SubLayananItem>>,
				getServicePriceKlinik({ service_unit_id: unitId }) as Promise<ApiListResponse<SubLayananItem>>,
			]);

			const medisData = Array.isArray(medisRes?.data) ? medisRes.data : [];
			const klinikData = Array.isArray(klinikRes?.data) ? klinikRes.data : [];

			const combined = [...medisData, ...klinikData].filter(
				(item) => String(item.service_unit_id) === String(unitId)
			);

			setSubLayanan(combined);
		} catch (err) {
			console.error("[ERROR] loadData failed:", err);
			const message = err instanceof Error ? err.message : "Gagal memuat data sub layanan.";
			notify(setToast, { type: "error", message });
		} finally {
			silent ? setRefreshing(false) : setLoading(false);
		}
	};

	useEffect(() => {
		if (unitId) {
			loadData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [unitId]);

	const filteredSubLayanan = useMemo(() => {
		return subLayanan.filter((s) => {
			const q = searchTerm.trim().toLowerCase();
			if (q) {
				const haystack = `${s.name || ""} ${s.kptl || ""} ${s.category || ""}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			if (categoryFilter !== "all" && (s.category || "") !== categoryFilter) return false;
			if (sourceFilter !== "all" && s.source !== sourceFilter) return false;
			if (classFilter !== "all" && s.class !== classFilter) return false;
			return true;
		});
	}, [subLayanan, searchTerm, categoryFilter, sourceFilter, classFilter]);

	const totalItems = filteredSubLayanan.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const paginatedSubLayanan = filteredSubLayanan.slice(
		(safeCurrentPage - 1) * perPage,
		safeCurrentPage * perPage
	);
	const paginationRange = useMemo(
		() => getPaginationRange(safeCurrentPage, totalPages),
		[safeCurrentPage, totalPages]
	);

	const activeCount = subLayanan.filter((i) => i.status === "active").length;
	const averagePrice = useMemo(() => {
		if (subLayanan.length === 0) return 0;
		const sum = subLayanan.reduce((acc, cur) => acc + (Number(cur.price) || 0), 0);
		return Math.round(sum / subLayanan.length);
	}, [subLayanan]);

	// Rata-rata tarif khusus untuk data yang sedang tampil/tercetak (mengikuti filter aktif)
	const filteredAveragePrice = useMemo(() => {
		if (filteredSubLayanan.length === 0) return 0;
		const sum = filteredSubLayanan.reduce((acc, cur) => acc + (Number(cur.price) || 0), 0);
		return Math.round(sum / filteredSubLayanan.length);
	}, [filteredSubLayanan]);

	const usedCategories = useMemo(() => {
		const set = new Set(subLayanan.map((s) => s.category).filter((c): c is string => Boolean(c)));
		return Array.from(set).sort();
	}, [subLayanan]);

	const activeFilterLabels = useMemo(
		() => buildActiveFilterLabels({ searchTerm, categoryFilter, sourceFilter, classFilter }),
		[searchTerm, categoryFilter, sourceFilter, classFilter]
	);

	// Waktu cetak dibekukan sekali per klik supaya tidak berubah selama proses print
	const [printedAt, setPrintedAt] = useState<string>("");

	const resetFilters = () => {
		setSearchTerm("");
		setCategoryFilter("all");
		setSourceFilter("all");
		setClassFilter("all");
		setCurrentPage(1);
	};

	const handlePrint = () => {
		setPrintedAt(
			new Date().toLocaleString("id-ID", {
				dateStyle: "long",
				timeStyle: "short",
			})
		);
		// Beri waktu 1 tick agar state printedAt sempat ter-render sebelum dialog print muncul
		setTimeout(() => window.print(), 50);
	};

	const openAdd = () => {
		setEditing(null);
		setForm({
			...emptyForm,
			category: categoryMode === "select" ? categoryOptions[0] : "",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const openEdit = (item: SubLayananItem) => {
		setEditing(item);
		setForm({
			source: item.source || "klinik",
			kptl: item.kptl || "",
			name: item.name || "",
			satuan: item.satuan || "Per Tindakan",
			class: item.class || "umum",
			category: item.category || "",
			price: item.price !== undefined && item.price !== null ? String(item.price) : "",
			status: item.status || "active",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const closeModal = () => {
		if (submitting) return;
		setIsModalOpen(false);
	};

	const validateForm = (): boolean => {
		const errors: FormErrors = {};
		if (!form.name.trim()) errors.name = "Nama sub layanan wajib diisi.";
		else if (form.name.trim().length < 3) errors.name = "Nama sub layanan minimal 3 karakter.";
		if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
			errors.price = "Tarif harus berupa angka dan tidak boleh negatif.";
		}
		if (categoryMode === "select" && !form.category) {
			errors.category = "Kategori wajib dipilih.";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
		e && e.preventDefault();
		if (!validateForm()) return;

		setSubmitting(true);
		try {
			const payload = {
				service_unit_id: Number(unitId),
				kptl: form.kptl.trim() || null,
				name: form.name.trim(),
				satuan: form.satuan.trim() || "Per Tindakan",
				class: form.class,
				category: categoryMode === "none" ? null : form.category.trim() || null,
				price: Number(form.price),
				status: form.status,
			};

			if (editing) {
				const updateFn = editing.source === "medis" ? updateServicePriceMedis : updateServicePriceKlinik;
				await updateFn(editing.id, payload);
				notify(setToast, { type: "success", message: `Sub layanan "${payload.name}" berhasil diperbarui.` });
			} else {
				const createFn = form.source === "medis" ? createServicePriceMedis : createServicePriceKlinik;
				await createFn(payload);
				notify(setToast, { type: "success", message: `Sub layanan "${payload.name}" berhasil dibuat.` });
			}

			setIsModalOpen(false);
			await loadData({ silent: true });
		} catch (err) {
			console.error("[ERROR] handleSubmit failed:", err);
			const message = err instanceof Error ? err.message : "Gagal menyimpan sub layanan.";
			notify(setToast, { type: "error", message });
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (item: SubLayananItem) => {
		if (!confirm(`Hapus sub layanan "${item.name}"?`)) return;

		setDeletingId(item.id);
		try {
			const deleteFn = item.source === "medis" ? deleteServicePriceMedis : deleteServicePriceKlinik;
			await deleteFn(item.id);
			notify(setToast, { type: "success", message: `Sub layanan "${item.name}" berhasil dihapus.` });
			loadData({ silent: true });
		} catch (err) {
			console.error(err);
			const message = err instanceof Error ? err.message : "Gagal menghapus sub layanan.";
			notify(setToast, { type: "error", message });
		} finally {
			setDeletingId(null);
		}
	};

	// Catatan: Navbar & Sidebar sengaja TIDAK dirender di sini karena sudah
	// disediakan oleh layout.tsx pembungkus route ini. Merender ulang di sini
	// adalah penyebab tampilan header/sidebar dobel pada screenshot.

	if (!unitId) {
		return (
			<div className="space-y-6">
				<div className="text-center">
					<p className="text-slate-600 font-semibold mb-4">Unit ID tidak ditemukan di URL.</p>
					<button onClick={() => router.back()} className="text-teal-700 font-bold hover:underline">
						Kembali
					</button>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
			</div>
		);
	}

	return (
		<div>
			{/* ==================== TAMPILAN LAYAR (disembunyikan saat print) ==================== */}
			<div className="space-y-6 print:hidden">
				{/* Header Banner */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
					<div className="flex-1 min-w-0">
						<button
							onClick={() => router.back()}
							className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 font-bold text-sm mb-3 transition"
						>
							<ArrowLeft className="h-4 w-4" />
							Kembali
						</button>
						<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
							<Layers className="h-3.5 w-3.5" /> Sub Layanan
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
							Sub Layanan: {unitName}
						</h1>
						<p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl flex items-center gap-2 flex-wrap">
							Kelola tarif medis & klinik untuk unit <span className="font-bold">{unitName}</span>
							{category && (
								<span
									className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
										CATEGORY_BADGE[category] || "bg-slate-100 text-slate-600 border-slate-200"
									}`}
								>
									{CATEGORY_LABEL[category] || category}
								</span>
							)}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
						<button
							onClick={handlePrint}
							className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-extrabold shadow-xs transition cursor-pointer whitespace-nowrap"
						>
							<Printer className="h-4 w-4" /> Unduh PDF
						</button>
						<button
							onClick={openAdd}
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
						>
							<Plus className="h-4 w-4" /> Tambah Sub Layanan
						</button>
					</div>
				</div>

				{categoryMode === "select" && (
					<div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-800 flex items-start gap-2">
						<Info className="h-4 w-4 shrink-0 mt-0.5" />
						<span>
							Unit ini memakai kategori: <strong>{categoryOptions.join(", ")}</strong>. Pilih salah satu saat menambah sub layanan.
						</span>
					</div>
				)}
				{categoryMode === "none" && (
					<div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 flex items-start gap-2">
						<Info className="h-4 w-4 shrink-0 mt-0.5" />
						<span>Unit ini tidak memakai kategori sub layanan.</span>
					</div>
				)}

				{/* Quick Metrics */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sub Layanan</p>
							<p className="text-2xl font-extrabold text-slate-900 mt-1">{subLayanan.length} Item</p>
						</div>
						<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
							<Layers className="h-5 w-5" />
						</span>
					</div>

					<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sub Layanan Aktif</p>
							<p className="text-2xl font-extrabold text-[#16A34A] mt-1">{activeCount} Item</p>
						</div>
						<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#16A34A] font-bold">
							<CheckCircle2 className="h-5 w-5" />
						</span>
					</div>

					<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Tarif</p>
							<p className="text-xl font-extrabold text-slate-900 font-mono mt-1">{formatRupiah(averagePrice)}</p>
						</div>
						<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#D97706] font-bold">
							<DollarSign className="h-5 w-5" />
						</span>
					</div>
				</div>

				{/* Search & Filters */}
				<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-6 space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						<div className="relative sm:col-span-2 lg:col-span-1">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								type="text"
								placeholder="Cari nama sub layanan, KPTL, atau kategori..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
							/>
						</div>

						{categoryMode !== "none" && (
							<div>
								<select
									value={categoryFilter}
									onChange={(e) => {
										setCategoryFilter(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
								>
									<option value="all">Semua Kategori</option>
									{(categoryMode === "select" ? categoryOptions : usedCategories).map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
							</div>
						)}

						<div>
							<select
								value={sourceFilter}
								onChange={(e) => {
									setSourceFilter(e.target.value as "all" | SourceType);
									setCurrentPage(1);
								}}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
							>
								{sourceFilterOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
							{(["all", "umum", "eksekutif"] as const).map((opt) => (
								<button
									key={opt}
									type="button"
									onClick={() => {
										setClassFilter(opt);
										setCurrentPage(1);
									}}
									className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
										classFilter === opt
											? opt === "eksekutif"
												? "bg-white text-[#B45309] shadow-sm"
												: "bg-white text-teal-800 shadow-sm"
											: "text-slate-400"
									}`}
								>
									{opt === "all" ? "Semua" : CLASS_LABEL[opt]}
								</button>
							))}
						</div>
					</div>

					{(searchTerm || categoryFilter !== "all" || sourceFilter !== "all" || classFilter !== "all") && (
						<div className="flex justify-end">
							<button
								onClick={resetFilters}
								className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition"
							>
								Reset Filter
							</button>
						</div>
					)}
				</div>

				{/* Table */}
				<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
					<div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
						<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
							<Layers className="h-5 w-5 text-teal-800" />
							Daftar Sub Layanan ({filteredSubLayanan.length})
						</h3>
						<button
							onClick={() => loadData({ silent: true })}
							disabled={refreshing}
							className="text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
							title="Muat ulang data"
						>
							<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
						</button>
					</div>
					{totalItems === 0 ? (
						<div className="py-12 text-center text-slate-400 italic text-xs">
							{subLayanan.length === 0
								? 'Belum ada sub layanan untuk unit ini. Klik "Tambah Sub Layanan" untuk membuat yang pertama.'
								: "Tidak ada sub layanan yang cocok dengan pencarian/filter."}
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs border-collapse">
								<thead>
									<tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
										<th className="py-3 px-4">KPTL</th>
										<th className="py-3 px-4">Nama Sub Layanan</th>
										{categoryMode !== "none" && <th className="py-3 px-4">Kategori</th>}
										<th className="py-3 px-4">Sumber</th>
										<th className="py-3 px-4">Kelas</th>
										<th className="py-3 px-4">Satuan</th>
										<th className="py-3 px-4 text-right">Tarif (Rp)</th>
										<th className="py-3 px-4">Status</th>
										<th className="py-3 px-4 text-right">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 font-medium text-slate-700">
									{paginatedSubLayanan.map((s) => (
										<tr key={`${s.source}-${s.id}`} className="hover:bg-slate-50/60 transition">
											<td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{s.kptl || "-"}</td>
											<td className="py-4 px-4 font-bold text-slate-900">{s.name}</td>
											{categoryMode !== "none" && (
												<td className="py-4 px-4">
													{s.category ? (
														<span className="text-[10px] px-2.5 py-1 rounded-full font-bold border bg-slate-100 border-slate-200 text-slate-700">
															{s.category}
														</span>
													) : (
														<span className="text-[10px] text-slate-400 italic">-</span>
													)}
												</td>
											)}
											<td className="py-4 px-4">
												<span
													className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
														SOURCE_BADGE[s.source] || "bg-slate-100 text-slate-600 border-slate-200"
													}`}
												>
													{SOURCE_LABEL[s.source] || s.source}
												</span>
											</td>
											<td className="py-4 px-4">
												<span
													className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
														CLASS_BADGE[s.class] || "bg-slate-100 text-slate-600 border-slate-200"
													}`}
												>
													{CLASS_LABEL[s.class] || s.class}
												</span>
											</td>
											<td className="py-4 px-4 text-slate-500">{s.satuan || "-"}</td>
											<td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
												{formatRupiah(s.price)}
											</td>
											<td className="py-4 px-4">
												<span
													className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold ${
														s.status === "active" ? "bg-emerald-50 text-[#16A34A]" : "bg-slate-100 text-slate-500"
													}`}
												>
													<span
														className={`h-1.5 w-1.5 rounded-full ${
															s.status === "active" ? "bg-[#16A34A]" : "bg-slate-400"
														}`}
													/>
													{s.status === "active" ? "Aktif" : "Non-Aktif"}
												</span>
											</td>
											<td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
												<button
													onClick={() => openEdit(s)}
													className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
												>
													<Pencil className="h-3.5 w-3.5" /> Edit
												</button>
												<button
													onClick={() => handleDelete(s)}
													disabled={deletingId === s.id}
													className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold disabled:opacity-50 transition inline-flex items-center"
												>
													{deletingId === s.id ? (
														<Loader2 className="h-3.5 w-3.5 animate-spin" />
													) : (
														<Trash2 className="h-3.5 w-3.5" />
													)}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{totalItems > 0 && (
						<div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
							<div className="text-[11px] text-slate-500 font-medium">
								Menampilkan {Math.min((safeCurrentPage - 1) * perPage + 1, totalItems)}–
								{Math.min(safeCurrentPage * perPage, totalItems)} dari {totalItems} sub layanan
							</div>
							<div className="flex items-center gap-1.5">
								<button
									disabled={safeCurrentPage === 1}
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
								>
									<ChevronLeft className="h-3.5 w-3.5" />
								</button>

								{paginationRange.map((page, idx) =>
									page === "ellipsis" ? (
										<span
											key={`ellipsis-${idx}`}
											className="h-8 w-8 flex items-center justify-center text-slate-400"
										>
											<MoreHorizontal className="h-3.5 w-3.5" />
										</span>
									) : (
										<button
											key={page}
											onClick={() => setCurrentPage(page)}
											className={`h-8 min-w-8 px-2 flex items-center justify-center rounded-xl text-[11px] font-bold transition ${
												safeCurrentPage === page
													? "bg-teal-700 text-white shadow-sm"
													: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
											}`}
										>
											{page}
										</button>
									)
								)}

								<button
									disabled={safeCurrentPage === totalPages}
									onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
									className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
								>
									<ChevronRight className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Modal Tambah/Edit */}
				{isModalOpen && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_.15s_ease-out]"
						onClick={closeModal}
					>
						<div
							onClick={(e) => e.stopPropagation()}
							className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-[scaleIn_.15s_ease-out] max-h-[90vh] flex flex-col"
						>
							<div className="relative bg-gradient-to-r from-teal-700 to-cyan-800 px-6 sm:px-8 py-6 shrink-0">
								<button
									onClick={closeModal}
									disabled={submitting}
									className="absolute top-4 right-4 rounded-xl p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
								>
									<X className="h-4 w-4" />
								</button>
								<div className="flex items-center gap-3">
									<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
										<Layers className="h-5 w-5" />
									</span>
									<div>
										<h3 className="text-base font-extrabold text-white">
											{editing ? "Edit Sub Layanan" : "Tambah Sub Layanan"}
										</h3>
										<p className="text-[11px] text-teal-50/80 mt-0.5">
											{editing ? `Perbarui data untuk "${editing.name}"` : `Untuk unit "${unitName}"`}
										</p>
									</div>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4 overflow-y-auto">
								{!editing && (
									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Simpan Sebagai</label>
										<div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
											{sourceOptionsForForm.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => setForm({ ...form, source: opt.value })}
													className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
														form.source === opt.value ? "bg-white text-teal-800 shadow-sm" : "text-slate-400"
													}`}
												>
													{opt.label}
												</button>
											))}
										</div>
									</div>
								)}

								{categoryMode !== "none" && (
									<div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-2">
										<label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
											Kategori Sub Layanan {categoryMode === "select" && <span className="text-[#DC2626]">*</span>}
										</label>
										{categoryMode === "select" ? (
											<select
												value={form.category}
												onChange={(e) => {
													setForm({ ...form, category: e.target.value });
													if (formErrors.category) setFormErrors({ ...formErrors, category: undefined });
												}}
												className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-bold focus:outline-hidden transition ${
													formErrors.category
														? "border-red-300 bg-red-50/40 focus:border-red-500"
														: "border-teal-200 bg-white focus:border-teal-600"
												}`}
											>
												<option value="">Pilih kategori...</option>
												{categoryOptions.map((c) => (
													<option key={c} value={c}>
														{c}
													</option>
												))}
											</select>
										) : (
											<input
												value={form.category}
												onChange={(e) => setForm({ ...form, category: e.target.value })}
												placeholder="Kategori (opsional)"
												className="w-full rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-xs font-medium focus:border-teal-600 focus:outline-hidden transition"
											/>
										)}
										{formErrors.category && (
											<p className="text-[10px] text-[#DC2626] font-semibold">{formErrors.category}</p>
										)}
									</div>
								)}

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kode KPTL</label>
										<input
											value={form.kptl}
											onChange={(e) => setForm({ ...form, kptl: e.target.value })}
											placeholder="Contoh: RJ-KONS-01"
											className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
										/>
									</div>
									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Satuan</label>
										<input
											value={form.satuan}
											onChange={(e) => setForm({ ...form, satuan: e.target.value })}
											placeholder="Per Tindakan"
											className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
										/>
									</div>
								</div>

								<div>
									<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
										Nama Sub Layanan <span className="text-[#DC2626]">*</span>
									</label>
									<input
										value={form.name}
										onChange={(e) => {
											setForm({ ...form, name: e.target.value });
											if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
										}}
										placeholder="Contoh: Konsultasi Umum"
										className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-bold focus:outline-hidden transition ${
											formErrors.name
												? "border-red-300 bg-red-50/40 focus:border-red-500"
												: "border-teal-200 bg-teal-50/20 focus:border-teal-600 focus:bg-white"
										}`}
									/>
									{formErrors.name && <p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.name}</p>}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kelas</label>
										<div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
											<button
												type="button"
												onClick={() => setForm({ ...form, class: "umum" })}
												className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
													form.class === "umum" ? "bg-white text-teal-800 shadow-sm" : "text-slate-400"
												}`}
											>
												Umum
											</button>
											<button
												type="button"
												onClick={() => setForm({ ...form, class: "eksekutif" })}
												className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
													form.class === "eksekutif" ? "bg-white text-[#B45309] shadow-sm" : "text-slate-400"
												}`}
											>
												Eksekutif
											</button>
										</div>
									</div>

									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Status</label>
										<div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
											<button
												type="button"
												onClick={() => setForm({ ...form, status: "active" })}
												className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
													form.status === "active" ? "bg-white text-[#16A34A] shadow-sm" : "text-slate-400"
												}`}
											>
												Aktif
											</button>
											<button
												type="button"
												onClick={() => setForm({ ...form, status: "inactive" })}
												className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
													form.status === "inactive" ? "bg-white text-slate-600 shadow-sm" : "text-slate-400"
												}`}
											>
												Non-Aktif
											</button>
										</div>
									</div>
								</div>

								<div>
									<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
										Tarif (Rp) <span className="text-[#DC2626]">*</span>
									</label>
									<div className="relative">
										<span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
											Rp
										</span>
										<input
											type="number"
											min="0"
											step="1000"
											value={form.price}
											onChange={(e) => {
												setForm({ ...form, price: e.target.value });
												if (formErrors.price) setFormErrors({ ...formErrors, price: undefined });
											}}
											placeholder="150000"
											className={`w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs font-mono font-bold focus:outline-hidden transition ${
												formErrors.price
													? "border-red-300 bg-red-50/40 focus:border-red-500"
													: "border-slate-200 bg-slate-50/50 focus:border-teal-600 focus:bg-white"
											}`}
										/>
									</div>
									{formErrors.price && <p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.price}</p>}
									{!formErrors.price && form.price !== "" && !isNaN(Number(form.price)) && (
										<p className="text-[10px] text-slate-400 font-medium mt-1">{formatRupiah(Number(form.price))}</p>
									)}
								</div>

								<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
									<button
										type="button"
										onClick={closeModal}
										disabled={submitting}
										className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
									>
										Batal
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white px-5 py-2.5 text-xs font-extrabold hover:from-teal-800 hover:to-cyan-900 transition disabled:opacity-60 inline-flex items-center gap-2"
									>
										{submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
										{submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Sub Layanan"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				<Toast toast={toast} onClose={() => setToast({ show: false })} />
			</div>

			{/* ==================== TAMPILAN CETAK PDF (hanya muncul saat print) ==================== */}
			<div className="hidden print:block text-slate-900">
				<div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-4">
					<div>
						<h1 className="text-lg font-extrabold">Daftar Tarif Sub Layanan</h1>
						<p className="text-sm font-bold mt-0.5">
							Unit: {unitName}
							{category && ` — ${CATEGORY_LABEL[category] || category}`}
						</p>
					</div>
					<div className="text-right text-[10px] text-slate-500">
						<p>RSP Rotinsulu</p>
						{printedAt && <p>Dicetak: {printedAt}</p>}
					</div>
				</div>

				{activeFilterLabels.length > 0 && (
					<p className="text-[11px] text-slate-600 mb-3">
						Filter aktif: {activeFilterLabels.join(" · ")}
					</p>
				)}

				<div className="grid grid-cols-3 gap-3 mb-4 text-[11px]">
					<div className="border border-slate-300 rounded p-2">
						<p className="text-slate-500">Jumlah Sub Layanan</p>
						<p className="font-extrabold text-sm">{filteredSubLayanan.length} Item</p>
					</div>
					<div className="border border-slate-300 rounded p-2">
						<p className="text-slate-500">Sub Layanan Aktif</p>
						<p className="font-extrabold text-sm">
							{filteredSubLayanan.filter((i) => i.status === "active").length} Item
						</p>
					</div>
					<div className="border border-slate-300 rounded p-2">
						<p className="text-slate-500">Rata-Rata Tarif</p>
						<p className="font-extrabold text-sm">{formatRupiah(filteredAveragePrice)}</p>
					</div>
				</div>

				{filteredSubLayanan.length === 0 ? (
					<p className="text-xs italic text-slate-500">Tidak ada data sub layanan untuk dicetak.</p>
				) : (
					<table className="w-full text-[10px] border-collapse">
						<thead>
							<tr className="border-b-2 border-slate-800 text-left uppercase font-bold">
								<th className="py-1.5 pr-2">KPTL</th>
								<th className="py-1.5 pr-2">Nama Sub Layanan</th>
								{categoryMode !== "none" && <th className="py-1.5 pr-2">Kategori</th>}
								<th className="py-1.5 pr-2">Sumber</th>
								<th className="py-1.5 pr-2">Kelas</th>
								<th className="py-1.5 pr-2">Satuan</th>
								<th className="py-1.5 pr-2 text-right">Tarif (Rp)</th>
								<th className="py-1.5 pl-2">Status</th>
							</tr>
						</thead>
						<tbody>
							{filteredSubLayanan.map((s) => (
								<tr key={`print-${s.source}-${s.id}`} className="border-b border-slate-200 break-inside-avoid">
									<td className="py-1.5 pr-2 font-mono">{s.kptl || "-"}</td>
									<td className="py-1.5 pr-2 font-bold">{s.name}</td>
									{categoryMode !== "none" && <td className="py-1.5 pr-2">{s.category || "-"}</td>}
									<td className="py-1.5 pr-2">{SOURCE_LABEL[s.source] || s.source}</td>
									<td className="py-1.5 pr-2">{CLASS_LABEL[s.class] || s.class}</td>
									<td className="py-1.5 pr-2">{s.satuan || "-"}</td>
									<td className="py-1.5 pr-2 text-right font-mono font-bold">{formatRupiah(s.price)}</td>
									<td className="py-1.5 pl-2">{s.status === "active" ? "Aktif" : "Non-Aktif"}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<style jsx global>{`
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes scaleIn {
					from { opacity: 0; transform: scale(0.96) translateY(4px); }
					to { opacity: 1; transform: scale(1) translateY(0); }
				}
				@media print {
					@page {
						size: A4 landscape;
						margin: 12mm;
					}
					body {
						-webkit-print-color-adjust: exact;
						print-color-adjust: exact;
					}
				}
			`}</style>
		</div>
	);
}