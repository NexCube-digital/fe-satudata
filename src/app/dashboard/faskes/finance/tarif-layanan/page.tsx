"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { notify } from "@/lib/notify";
import ModernSelect from "@/components/ui/ModernSelect";
import {
	DollarSign,
	Plus,
	RefreshCw,
	Search,
	Pencil,
	Trash2,
	CheckCircle2,
	ArrowRight,
	SlidersHorizontal,
	X,
	FileText,
	Layers,
	FolderTree,
	Stethoscope,
	Sparkles,
	Loader2,
	Building2,
	ChevronLeft,
	ChevronRight,
	Info,
	Download,
} from "lucide-react";
import {
	getServicePriceKlinik,
	createServicePriceKlinik,
	updateServicePriceKlinik,
	deleteServicePriceKlinik,
} from "@/services/servicePriceService";
import { getServiceUnits } from "@/services/serviceUnitService";

const formatRupiah = (value) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value || 0);

// Kategori level UNIT (utama/penunjang/ruangan/admin) - dipakai untuk badge
// & konteks unit di form. Ini BEDA dari kategori sub layanan (di bawah),
// yang levelnya per-item tarif dan mengikuti nama unit yang dipilih.
const CATEGORY_META = {
	utama: { label: "Pelayanan Utama", icon: "🩺", badge: "bg-teal-50 text-teal-800 border-teal-200" },
	penunjang: { label: "Penunjang", icon: "🧪", badge: "bg-cyan-50 text-cyan-800 border-cyan-200" },
	ruangan: { label: "Ruangan", icon: "🛏", badge: "bg-amber-50 text-[#B45309] border-amber-200" },
	admin: { label: "Administrasi", icon: "📋", badge: "bg-slate-100 text-slate-700 border-slate-200" },
};

const CLASS_LABEL = { umum: "Umum", eksekutif: "Eksekutif" };
const CLASS_BADGE = {
	umum: "bg-teal-50 text-teal-800 border-teal-200",
	eksekutif: "bg-amber-50 text-[#B45309] border-amber-200",
};

// ==== Aturan kategori sub layanan, mengikuti nama Unit Layanan ====
// Sama persis dengan yang dipakai di SubLayananPage & TarifLayananMedisPage,
// supaya konsisten di seluruh modul.
const UNIT_CATEGORY_RULES = [
	{
		key: "pendaftaran",
		match: ["pendaftaran", "administrasi"],
		options: ["Pendaftaran", "Administrasi"],
	},
	{
		key: "akomodasi",
		match: ["akomodasi"],
		options: null,
	},
	{
		key: "pelayanan_medis",
		match: ["pelayanan medis"],
		options: ["Visit", "Pemeriksaan", "Konsultasi", "Konseling"],
	},
	{
		key: "gawat_darurat",
		match: ["gawat darurat", "igd"],
		options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Lainnya"],
	},
	{
		key: "rawat_inap",
		match: ["rawat inap", "ranap"],
		options: [
			"Kelas II Tindakan Kecil",
			"Kelas II Tindakan Sedang",
			"Kelas II Tindakan Besar",
			"Kelas II Tindakan Lainnya",
		],
	},
	{
		key: "rawat_jalan",
		match: ["rawat jalan", "rajal"],
		options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Lainnya"],
	},
	{
		key: "icu",
		match: ["icu", "intensive"],
		options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Khusus"],
	},
	{
		key: "bedah",
		match: ["bedah", "operasi"],
		options: ["Tindakan Kecil", "Tindakan Sedang", "Tindakan Besar", "Tindakan Khusus"],
	},
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
	{
		key: "radiologi",
		match: ["radiologi", "rontgen"],
		options: ["Sederhana", "Sedang", "Sulit", "Khusus"],
	},
	{
		key: "rehab_medik",
		match: ["rehab medik", "rehabilitasi", "fisioterapi"],
		options: ["Kecil", "Sedang", "Besar"],
	},
];

function resolveCategoryRule(unitName) {
	const name = (unitName || "").toLowerCase();
	return UNIT_CATEGORY_RULES.find((rule) => rule.match.some((kw) => name.includes(kw))) || null;
}

// mode: "free" (input bebas, unit tidak dikenali), "none" (tidak pakai kategori),
// "select" (harus pilih dari daftar tetap)
function getCategoryConfig(unitName) {
	const rule = resolveCategoryRule(unitName);
	const mode = !rule ? "free" : rule.options === null ? "none" : "select";
	return { rule, mode, options: rule?.options || [] };
}

const emptyForm = {
	service_unit_id: "",
	kptl: "",
	name: "",
	satuan: "Per Tindakan",
	class: "umum",
	category: "",
	price: "",
	status: "active",
};

const statusOptionsForFilter = [
	{ value: "all", label: "Semua Status", sublabel: "Aktif & Non-Aktif", badge: "All" },
	{ value: "active", label: "✔ Aktif", sublabel: "Dapat digunakan untuk transaksi", badge: "Aktif" },
	{ value: "inactive", label: "✖ Non-Aktif", sublabel: "Disembunyikan dari transaksi", badge: "Non-Aktif" },
];

export default function TarifLayananKlinikPage() {
	const router = useRouter();
	const [user, setUser] = useState(() => {
		if (typeof window === "undefined") return null;
		try {
			const stored = window.localStorage.getItem("user");
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	});

	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [prices, setPrices] = useState([]);
	const [units, setUnits] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [unitFilter, setUnitFilter] = useState("all");
	// Filter kelas: "all" | "umum" | "eksekutif" — ditampilkan sebagai
	// tombol kecil (bukan dropdown) sesuai permintaan.
	const [classFilter, setClassFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage] = useState(10);
	const [toast, setToast] = useState({ show: false });
	const [deletingId, setDeletingId] = useState(null);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
	const [submitting, setSubmitting] = useState(false);

	// NOTE: apiFetch (lib/api.js) melempar error kalau request gagal dan
	// hanya mengembalikan { message, data } (tanpa `success`) kalau berhasil.
	// Jadi kalau lolos dari await tanpa exception, itu sudah pasti sukses.
	const loadData = async ({ silent = false } = {}) => {
		silent ? setRefreshing(true) : setLoading(true);
		try {
			const [priceRes, unitRes] = await Promise.all([
				getServicePriceKlinik(),
				getServiceUnits(),
			]);
			setPrices(Array.isArray(priceRes?.data) ? priceRes.data : []);
			setUnits(Array.isArray(unitRes?.data) ? unitRes.data : []);
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Gagal memuat data tarif layanan klinik." });
		} finally {
			silent ? setRefreshing(false) : setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const unitMap = useMemo(() => {
		const map = {};
		units.forEach((u) => (map[u.id] = u));
		return map;
	}, [units]);

	// Opsi dropdown Unit Layanan untuk ModernSelect di FORM Tambah/Edit —
	// tetap menampilkan semua unit (termasuk Akomodasi).
	const unitOptionsForModal = useMemo(() => {
		return units.map((u) => {
			const meta = CATEGORY_META[u.category] || { label: u.category, icon: "⚡" };
			return {
				value: String(u.id),
				label: u.name,
				sublabel: meta.label,
				badge: `${meta.icon} ${meta.label}`,
			};
		});
	}, [units]);

	// Unit yang dipakai khusus untuk dropdown FILTER tabel. Unit "Akomodasi"
	// sengaja disembunyikan dari filter ini (bukan dari form Tambah/Edit)
	// karena tidak relevan untuk tarif layanan klinik.
	const filterableUnits = useMemo(
		() => units.filter((u) => !/akomodasi/i.test(u.name || "")),
		[units]
	);

	const unitOptionsForFilter = useMemo(() => {
		const opts = filterableUnits.map((u) => {
			const meta = CATEGORY_META[u.category] || { label: u.category, icon: "⚡" };
			return {
				value: String(u.id),
				label: u.name,
				sublabel: meta.label,
				badge: `${meta.icon} ${meta.label}`,
			};
		});
		return [
			{ value: "all", label: "Semua Unit Layanan", sublabel: `${filterableUnits.length} unit terdaftar`, badge: "All" },
			...opts,
		];
	}, [filterableUnits]);

	// Konteks dinamis pada form, mengikuti kategori unit yang dipilih (bukan lagi kategori teks bebas)
	const selectedUnit = unitMap[Number(form.service_unit_id)];
	const categoryContext = useMemo(() => {
		const meta = CATEGORY_META[selectedUnit?.category] || null;
		if (!meta) {
			return {
				badgeIcon: "⚡",
				badgeText: "Pilih unit layanan terlebih dahulu",
				badgeStyle: "bg-slate-100 text-slate-500 border-slate-200",
			};
		}
		return {
			badgeIcon: meta.icon,
			badgeText: `${selectedUnit.name} • ${meta.label}`,
			badgeStyle: meta.badge,
		};
	}, [selectedUnit]);

	// Aturan kategori SUB LAYANAN untuk unit yang sedang dipilih di form (dari nama unitnya)
	const categoryConfig = useMemo(() => getCategoryConfig(selectedUnit?.name), [selectedUnit]);

	const filteredPrices = useMemo(() => {
		return prices.filter((item) => {
			const q = searchTerm.trim().toLowerCase();
			if (q) {
				const haystack = `${(item as any).name || ""} ${item.kptl || ""} ${item.category || ""}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			if (statusFilter !== "all" && item.status !== statusFilter) return false;
			if (unitFilter !== "all" && String(item.service_unit_id) !== String(unitFilter)) return false;
			if (classFilter !== "all" && item.class !== classFilter) return false;
			return true;
		});
	}, [prices, searchTerm, statusFilter, unitFilter, classFilter]);

	const totalItems = filteredPrices.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const paginatedPrices = filteredPrices.slice((safeCurrentPage - 1) * perPage, safeCurrentPage * perPage);

	// Nomor halaman yang ditampilkan dipadatkan (contoh: 1, 2, 3 ... 10)
	// supaya tidak render semua nomor halaman saat datanya banyak.
	const pageNumbers = useMemo(() => {
		const delta = 1;
		const range = [];
		const withDots = [];
		let last;

		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
				range.push(i);
			}
		}

		range.forEach((i) => {
			if (last !== undefined) {
				if (i - last === 2) {
					withDots.push(last + 1);
				} else if (i - last !== 1) {
					withDots.push("...");
				}
			}
			withDots.push(i);
			last = i;
		});

		return withDots;
	}, [totalPages, safeCurrentPage]);

	const activeCount = useMemo(() => prices.filter((i) => i.status === "active").length, [prices]);
	const averagePrice = useMemo(() => {
		if (prices.length === 0) return 0;
		const sum = prices.reduce((acc, cur) => acc + (Number(cur.price) || 0), 0);
		return Math.round(sum / prices.length);
	}, [prices]);
	const ruanganCount = useMemo(() => prices.filter((i) => unitMap[i.service_unit_id]?.category === "ruangan").length, [prices, unitMap]);

	// Hitung default kategori sub layanan untuk sebuah unit id (dipakai saat ganti unit / buka form)
	const getDefaultCategoryForUnit = (unitId) => {
		const unit = units.find((u) => String(u.id) === String(unitId));
		const config = getCategoryConfig(unit?.name);
		return config.mode === "select" ? config.options[0] || "" : "";
	};

	const openAdd = () => {
		setEditingItem(null);
		const defaultUnitId = unitFilter !== "all" ? unitFilter : (units[0]?.id ? String(units[0].id) : "");
		setForm({
			...emptyForm,
			service_unit_id: defaultUnitId,
			category: getDefaultCategoryForUnit(defaultUnitId),
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const openEdit = (item) => {
		setEditingItem(item);
		setForm({
			service_unit_id: item.service_unit_id ? String(item.service_unit_id) : "",
			kptl: item.kptl || "",
			name: (item as any).name || "",
			satuan: item.satuan || "Per Tindakan",
			class: item.class || "umum",
			category: item.category || "",
			price: (item as any).price !== undefined && (item as any).price !== null ? String((item as any).price) : "",
			status: item.status || "active",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const closeModal = () => {
		if (submitting) return;
		setIsModalOpen(false);
	};

	const handleUnitChange = (newUnitId) => {
		setForm((prev) => ({
			...prev,
			service_unit_id: newUnitId,
			category: getDefaultCategoryForUnit(newUnitId),
		}));
		if (formErrors.service_unit_id) setFormErrors((prev) => ({ ...prev, service_unit_id: null }));
		if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: null }));
	};

	const validate = () => {
		const errors: Record<string, string> = {};
		if (!form.service_unit_id) errors.service_unit_id = "Unit layanan wajib dipilih.";
		if (!form.name.trim()) errors.name = "Nama layanan wajib diisi.";
		if (categoryConfig.mode === "select" && !form.category) {
			errors.category = "Kategori wajib dipilih.";
		}
		if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
			errors.price = "Tarif harus berupa angka dan tidak boleh negatif.";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setSubmitting(true);
		try {
			const payload = {
				service_unit_id: Number(form.service_unit_id),
				kptl: form.kptl.trim() || null,
				name: form.name.trim(),
				satuan: form.satuan.trim() || "Per Tindakan",
				class: form.class,
				category: categoryConfig.mode === "none" ? null : form.category.trim() || null,
				price: Number(form.price),
				status: form.status,
			};

			if (editingItem) {
				await updateServicePriceKlinik(editingItem.id, payload);
				notify(setToast, { type: "success", message: `Tarif "${payload.name}" berhasil diperbarui.` });
			} else {
				await createServicePriceKlinik(payload);
				notify(setToast, { type: "success", message: `Tarif "${payload.name}" berhasil ditambahkan.` });
			}

			setIsModalOpen(false);
			loadData({ silent: true });
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Gagal menyimpan tarif layanan klinik." });
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id, name) => {
		if (!confirm(`Hapus tarif layanan klinik "${name}"?`)) return;
		setDeletingId(id);
		try {
			await deleteServicePriceKlinik(id);
			notify(setToast, { type: "success", message: `Tarif "${name}" berhasil dihapus.` });
			loadData({ silent: true });
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Gagal menghapus tarif layanan klinik." });
		} finally {
			setDeletingId(null);
		}
	};

	// Ringkasan filter yang sedang aktif, ditampilkan di kop laporan PDF/cetak.
	const filterSummaryText = () => {
		const parts = [];
		if (searchTerm.trim()) parts.push(`Pencarian: "${searchTerm.trim()}"`);
		if (unitFilter !== "all") {
			const u = unitMap[unitFilter];
			parts.push(`Unit: ${u?.name || "-"}`);
		}
		if (classFilter !== "all") parts.push(`Kelas: ${CLASS_LABEL[classFilter] || classFilter}`);
		if (statusFilter !== "all") parts.push(`Status: ${statusFilter === "active" ? "Aktif" : "Non-Aktif"}`);
		return parts.length ? parts.join(" • ") : "Semua data (tanpa filter)";
	};

	// Unduh PDF: memakai dialog print bawaan browser (Ctrl+P). Area yang
	// dicetak hanya bagian laporan (.print-area) berisi SELURUH data yang
	// sesuai filter aktif, bukan cuma satu halaman tabel yang tampil.
	const handleDownloadPdf = () => {
		window.print();
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<RefreshCw className="h-8 w-8 animate-spin text-indigo-800" />
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6 no-print">

				<div>

					<div className="space-y-6">
						{/* Header Banner */}
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
							<div className="flex-1 min-w-0">
								<div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-800 mb-2">
									<Layers className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Tarif Layanan Klinik
								</div>
								<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
									Master Data Tarif Layanan Klinik
								</h1>
								<p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
									Kelola tarif layanan klinik per unit layanan (poliklinik, kamar rawat inap, penunjang, administrasi), terpisah untuk kelas <strong>Umum</strong> dan <strong>Eksekutif</strong>.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
								<button
									onClick={handleDownloadPdf}
									disabled={filteredPrices.length === 0}
									title={filteredPrices.length === 0 ? "Tidak ada data untuk diunduh" : "Unduh data sesuai filter yang aktif sebagai PDF"}
									className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-extrabold shadow-xs hover:shadow-sm transition cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Download className="h-4 w-4" /> Unduh PDF
								</button>
								<button
									onClick={openAdd}
									disabled={units.length === 0}
									title={units.length === 0 ? "Buat Unit Layanan terlebih dahulu" : undefined}
									className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-700 to-cyan-800 hover:from-indigo-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Plus className="h-4 w-4" /> Tambah Tarif Klinik
								</button>
								<button
									onClick={() => router.push("/dashboard/faskes/finance/pelayanan-medis")}
									className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 px-4 py-2.5 text-xs font-bold transition cursor-pointer whitespace-nowrap"
								>
									<Stethoscope className="h-4 w-4 text-teal-700" /> Ke Tarif Medis <ArrowRight className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>

						{units.length === 0 && (
							<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-[#B45309] flex items-center gap-2">
								<Building2 className="h-4 w-4 shrink-0" />
								Belum ada Unit Layanan. Buat Unit Layanan dulu di halaman Master Unit Layanan sebelum menambah tarif klinik.
							</div>
						)}

						{/* Quick Metrics */}
						<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
							<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tarif Klinik</p>
									<p className="text-2xl font-extrabold text-slate-900 mt-1">{prices.length} Item</p>
								</div>
								<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-800 font-bold">
									<FileText className="h-5 w-5" />
								</span>
							</div>

							<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tarif Aktif</p>
									<p className="text-2xl font-extrabold text-[#16A34A] mt-1">{activeCount} Aktif</p>
								</div>
								<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#16A34A] font-bold">
									<CheckCircle2 className="h-5 w-5" />
								</span>
							</div>

							<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
								<div>
									<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Terkait Unit Ruangan</p>
									<p className="text-2xl font-extrabold text-cyan-900 mt-1">{ruanganCount} Item</p>
								</div>
								<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 font-bold">
									<FolderTree className="h-5 w-5" />
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

						{/* Search & Filter Bar */}
						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs mb-6 space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
								<div className="relative sm:col-span-2">
									<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
									<input
										type="text"
										placeholder="Cari nama layanan, kode KPTL, atau kategori..."
										value={searchTerm}
										onChange={(e) => {
											setSearchTerm(e.target.value);
											setCurrentPage(1);
										}}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-indigo-600 focus:bg-white focus:outline-hidden font-medium"
									/>
								</div>

								<div>
									<ModernSelect
										options={unitOptionsForFilter}
										value={unitFilter}
										onChange={(val) => {
											setUnitFilter(val);
											setCurrentPage(1);
										}}
										placeholder="Semua Unit Layanan"
										icon={FolderTree}
										searchable={true}
									/>
								</div>

								<div>
									<ModernSelect
										options={statusOptionsForFilter}
										value={statusFilter}
										onChange={(val) => {
											setStatusFilter(val);
											setCurrentPage(1);
										}}
										placeholder="Semua Status"
										searchable={false}
									/>
								</div>
							</div>

							{/* Filter Kelas — tombol kecil, bukan dropdown */}
							<div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
								<span className="text-[11px] font-bold text-slate-500 mr-1">Kelas:</span>
								<button
									type="button"
									onClick={() => {
										setClassFilter("all");
										setCurrentPage(1);
									}}
									className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition cursor-pointer ${
										classFilter === "all"
											? "bg-slate-800 text-white border-slate-800"
											: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
									}`}
								>
									Semua
								</button>
								<button
									type="button"
									onClick={() => {
										setClassFilter("umum");
										setCurrentPage(1);
									}}
									className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition cursor-pointer ${
										classFilter === "umum"
											? "bg-teal-700 text-white border-teal-700"
											: "bg-white text-teal-800 border-teal-200 hover:bg-teal-50"
									}`}
								>
									Umum
								</button>
								<button
									type="button"
									onClick={() => {
										setClassFilter("eksekutif");
										setCurrentPage(1);
									}}
									className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition cursor-pointer ${
										classFilter === "eksekutif"
											? "bg-amber-600 text-white border-amber-600"
											: "bg-white text-[#B45309] border-amber-200 hover:bg-amber-50"
									}`}
								>
									Eksekutif
								</button>
							</div>
						</div>

						{/* Table */}
						<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
							<div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
								<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
									<SlidersHorizontal className="h-5 w-5 text-indigo-800" />
									Katalog Tarif Layanan Klinik ({filteredPrices.length})
								</h3>
								<button
									onClick={() => loadData({ silent: true })}
									disabled={refreshing}
									className="text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
								>
									<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
								</button>
							</div>

							{totalItems === 0 ? (
								<div className="py-12 text-center text-slate-400 italic text-xs">
									{prices.length === 0 ? "Belum ada tarif layanan klinik." : "Tidak ada data yang cocok dengan pencarian/filter."}
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left text-xs border-collapse">
										<thead>
											<tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
												<th className="py-3.5 px-4">KPTL</th>
												<th className="py-3.5 px-4">Nama Layanan</th>
												<th className="py-3.5 px-4">Unit Layanan</th>
												<th className="py-3.5 px-4">Kategori</th>
												<th className="py-3.5 px-4">Kelas</th>
												<th className="py-3.5 px-4">Satuan</th>
												<th className="py-3.5 px-4 text-right">Tarif (Rp)</th>
												<th className="py-3.5 px-4">Status</th>
												<th className="py-3.5 px-4 text-right">Aksi</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100 font-medium text-slate-700">
											{paginatedPrices.map((item: any) => {
												const unit = unitMap[item.service_unit_id];
												const meta = CATEGORY_META[unit?.category];
												return (
													<tr key={item.id} className="hover:bg-slate-50/60 transition">
														<td className="py-4 px-4 font-mono font-bold text-indigo-900 whitespace-nowrap">{item.kptl || "-"}</td>
														<td className="py-4 px-4 font-extrabold text-slate-900">{(item as any).name}</td>
														<td className="py-4 px-4">
															{unit ? (
																<span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
																	{meta?.icon} {unit.name}
																</span>
															) : (
																<span className="italic text-slate-400">Unit tidak ditemukan</span>
															)}
														</td>
														<td className="py-4 px-4">
															{item.category ? (
																<span className="text-[10px] px-2.5 py-1 rounded-full font-bold border bg-slate-100 border-slate-200 text-slate-700">
																	{item.category}
																</span>
															) : (
																<span className="text-[10px] text-slate-400 italic">-</span>
															)}
														</td>
														<td className="py-4 px-4">
															<span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${CLASS_BADGE[item.class] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
																{CLASS_LABEL[item.class] || item.class}
															</span>
														</td>
														<td className="py-4 px-4 text-slate-500">{item.satuan || "-"}</td>
														<td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
															{formatRupiah((item as any).price)}
														</td>
														<td className="py-4 px-4">
															<span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold ${item.status === "active" ? "bg-emerald-50 text-[#16A34A]" : "bg-slate-100 text-slate-500"}`}>
																<span className={`h-1.5 w-1.5 rounded-full ${item.status === "active" ? "bg-[#16A34A]" : "bg-slate-400"}`} />
																{item.status === "active" ? "Aktif" : "Non-Aktif"}
															</span>
														</td>
														<td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
															<button
																onClick={() => openEdit(item)}
																className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
															>
																<Pencil className="h-3.5 w-3.5" /> Edit
															</button>
															<button
																onClick={() => handleDelete(item.id, (item as any).name)}
																disabled={deletingId === item.id}
																className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold disabled:opacity-50 transition inline-flex items-center"
															>
																{deletingId === item.id ? (
																	<Loader2 className="h-3.5 w-3.5 animate-spin" />
																) : (
																	<Trash2 className="h-3.5 w-3.5" />
																)}
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}

							{/* Pagination */}
							{totalItems > 0 && (
								<div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
									<div className="text-[11px] text-slate-500 font-medium">
										Menampilkan {Math.min((safeCurrentPage - 1) * perPage + 1, totalItems)}–{Math.min(safeCurrentPage * perPage, totalItems)} dari {totalItems} tarif
									</div>
									<div className="flex items-center gap-1.5">
										<button
											disabled={safeCurrentPage === 1}
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
										>
											<ChevronLeft className="h-3.5 w-3.5" />
										</button>
										{pageNumbers.map((p, idx) =>
											p === "..." ? (
												<span
													key={`dots-${idx}`}
													className="h-8 w-8 flex items-center justify-center text-slate-400 text-[11px] font-bold select-none"
												>
													…
												</span>
											) : (
												<button
													key={p}
													onClick={() => setCurrentPage(p)}
													className={`h-8 w-8 flex items-center justify-center rounded-xl text-[11px] font-bold transition ${
														safeCurrentPage === p ? "bg-indigo-700 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
													}`}
												>
													{p}
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
									{/* Header */}
									<div className="relative bg-gradient-to-r from-indigo-700 to-cyan-800 px-6 sm:px-8 py-6 shrink-0">
										<button
											onClick={closeModal}
											disabled={submitting}
											className="absolute top-4 right-4 rounded-xl p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
										>
											<X className="h-4 w-4" />
										</button>
										<div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-cyan-100 mb-1.5">
											<Sparkles className="h-3.5 w-3.5" /> Terhubung ke Unit Layanan Sungguhan
										</div>
										<div className="flex items-center gap-3">
											<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
												<DollarSign className="h-5 w-5" />
											</span>
											<div>
												<h3 className="text-base font-extrabold text-white">
													{editingItem ? "Edit Tarif Layanan Klinik" : "Tambah Tarif Layanan Klinik"}
												</h3>
												<p className="text-[11px] text-indigo-50/80 mt-0.5">
													{editingItem ? `Perbarui data untuk "${editingItem.name}"` : "Tambahkan layanan klinik baru beserta tarifnya"}
												</p>
											</div>
										</div>
									</div>

									{/* Body */}
									<form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4 overflow-y-auto">
										{/* Unit Layanan (ModernSelect, mengganti dropdown "5 kategori" lama) */}
										<div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
											<label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
												<FolderTree className="h-4 w-4 text-indigo-600" />
												Unit Layanan <span className="text-[#DC2626]">*</span>
											</label>
											<ModernSelect
												options={unitOptionsForModal}
												value={form.service_unit_id}
												onChange={handleUnitChange}
												placeholder="Pilih unit layanan..."
												icon={FolderTree}
												searchable={true}
											/>
											{formErrors.service_unit_id && (
												<p className="text-[10px] text-[#DC2626] font-semibold">{formErrors.service_unit_id}</p>
											)}
											<div className="flex items-center gap-2 pt-1">
												<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold ${categoryContext.badgeStyle}`}>
													<span>{categoryContext.badgeIcon}</span>
													<span>{categoryContext.badgeText}</span>
												</span>
											</div>
										</div>

										{/* Kategori sub layanan - otomatis mengikuti unit yang dipilih di atas */}
										{form.service_unit_id && categoryConfig.mode !== "none" && (
											<div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200/80 space-y-2">
												<label className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
													Kategori Layanan {categoryConfig.mode === "select" && <span className="text-[#DC2626]">*</span>}
												</label>
												{categoryConfig.mode === "select" ? (
													<select
														value={form.category}
														onChange={(e) => {
															setForm({ ...form, category: e.target.value });
															if (formErrors.category) setFormErrors({ ...formErrors, category: null });
														}}
														className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-bold focus:outline-hidden transition ${
															formErrors.category
																? "border-red-300 bg-red-50/40 focus:border-red-500"
																: "border-indigo-200 bg-white focus:border-indigo-600"
														}`}
													>
														<option value="">Pilih kategori...</option>
														{categoryConfig.options.map((c) => (
															<option key={c} value={c}>{c}</option>
														))}
													</select>
												) : (
													<input
														value={form.category}
														onChange={(e) => setForm({ ...form, category: e.target.value })}
														placeholder="Kategori (opsional)"
														className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:outline-hidden transition"
													/>
												)}
												{formErrors.category && (
													<p className="text-[10px] text-[#DC2626] font-semibold">{formErrors.category}</p>
												)}
											</div>
										)}
										{form.service_unit_id && categoryConfig.mode === "none" && (
											<div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 flex items-start gap-2">
												<Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
												<span>Unit ini tidak memakai kategori sub layanan.</span>
											</div>
										)}

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kode KPTL</label>
												<input
													value={form.kptl}
													onChange={(e) => setForm({ ...form, kptl: e.target.value })}
													placeholder="Contoh: KLN-0012"
													className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono focus:border-indigo-600 focus:bg-white focus:outline-hidden transition"
												/>
											</div>
											<div>
												<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Satuan</label>
												<input
													value={form.satuan}
													onChange={(e) => setForm({ ...form, satuan: e.target.value })}
													placeholder="Per Tindakan"
													className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium focus:border-indigo-600 focus:bg-white focus:outline-hidden transition"
												/>
											</div>
										</div>

										<div>
											<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
												Nama Layanan <span className="text-[#DC2626]">*</span>
											</label>
											<input
												value={form.name}
												onChange={(e) => {
													setForm({ ...form, name: e.target.value });
													if (formErrors.name) setFormErrors({ ...formErrors, name: null });
												}}
												placeholder="Contoh: Konsultasi Klinik Jantung"
												className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-bold focus:outline-hidden transition ${
													formErrors.name
														? "border-red-300 bg-red-50/40 focus:border-red-500"
														: "border-indigo-200/90 bg-indigo-50/20 focus:border-indigo-600 focus:bg-white"
												}`}
											/>
											{formErrors.name && (
												<p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.name}</p>
											)}
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
												Nominal Tarif (Rp) <span className="text-[#DC2626]">*</span>
											</label>
											<div className="relative">
												<span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">Rp</span>
												<input
													type="number"
													min="0"
													step="1000"
													value={form.price}
													onChange={(e) => {
														setForm({ ...form, price: e.target.value });
														if (formErrors.price) setFormErrors({ ...formErrors, price: null });
													}}
													placeholder="150000"
													className={`w-full rounded-2xl border pl-10 pr-4 py-2.5 text-xs font-mono font-bold focus:outline-hidden transition ${
														formErrors.price
															? "border-red-300 bg-red-50/40 focus:border-red-500"
															: "border-slate-200 bg-slate-50/50 focus:border-indigo-600 focus:bg-white"
													}`}
												/>
											</div>
											{formErrors.price && (
												<p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.price}</p>
											)}
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
												className="rounded-2xl bg-gradient-to-r from-indigo-700 to-cyan-800 text-white px-5 py-2.5 text-xs font-extrabold hover:from-indigo-800 hover:to-cyan-900 transition disabled:opacity-60 inline-flex items-center gap-2"
											>
												{submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
												{submitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Simpan Tarif"}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}

						<Toast toast={toast} onClose={() => setToast({ show: false })} />
					</div>
				</div>
			</div>

			{/* ==== Area khusus cetak/PDF ====*/}
			<div className="print-area hidden print:block p-6">
				<div className="mb-5 border-b-2 border-slate-800 pb-3">
					<h1 className="text-lg font-extrabold text-slate-900">Master Data Tarif Layanan Klinik</h1>
					<p className="text-[11px] text-slate-600 mt-1">
						Dicetak pada: {new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
					</p>
					<p className="text-[11px] text-slate-600">Filter aktif: {filterSummaryText()}</p>
					<p className="text-[11px] text-slate-600">Total data: {filteredPrices.length} item</p>
				</div>

				{filteredPrices.length === 0 ? (
					<p className="text-xs italic text-slate-500">Tidak ada data untuk ditampilkan.</p>
				) : (
					<table className="w-full text-left text-[10px] border-collapse">
						<thead>
							<tr className="border-b-2 border-slate-800 text-[9px] uppercase font-bold text-slate-700">
								<th className="py-2 px-2">KPTL</th>
								<th className="py-2 px-2">Nama Layanan</th>
								<th className="py-2 px-2">Unit Layanan</th>
								<th className="py-2 px-2">Kategori</th>
								<th className="py-2 px-2">Kelas</th>
								<th className="py-2 px-2">Satuan</th>
								<th className="py-2 px-2 text-right">Tarif (Rp)</th>
								<th className="py-2 px-2">Status</th>
							</tr>
						</thead>
						<tbody>
							{filteredPrices.map((item: any) => {
								const unit = unitMap[item.service_unit_id];
								return (
									<tr key={item.id} className="border-b border-slate-200">
										<td className="py-1.5 px-2 font-mono">{item.kptl || "-"}</td>
										<td className="py-1.5 px-2 font-bold">{item.name}</td>
										<td className="py-1.5 px-2">{unit?.name || "-"}</td>
										<td className="py-1.5 px-2">{item.category || "-"}</td>
										<td className="py-1.5 px-2">{CLASS_LABEL[item.class] || item.class}</td>
										<td className="py-1.5 px-2">{item.satuan || "-"}</td>
										<td className="py-1.5 px-2 text-right font-mono font-bold">{formatRupiah(item.price)}</td>
										<td className="py-1.5 px-2">{item.status === "active" ? "Aktif" : "Non-Aktif"}</td>
									</tr>
								);
							})}
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
					.no-print {
						display: none !important;
					}
					.print-area {
						display: block !important;
					}
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
		</>
	);
}