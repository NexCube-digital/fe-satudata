"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Toast from "@/components/ui/Toast";
import { notify } from "@/lib/notify";
import {
	Stethoscope,
	Plus,
	RefreshCw,
	Search,
	Pencil,
	Trash2,
	CheckCircle2,
	SlidersHorizontal,
	X,
	Tag,
	DollarSign,
	Layers,
	Loader2,
	Building2,
	ChevronLeft,
	ChevronRight,
	Info,
} from "lucide-react";
import {
	getServicePriceMedis,
	createServicePriceMedis,
	updateServicePriceMedis,
	deleteServicePriceMedis,
} from "@/services/servicePriceService";
import { getServiceUnits } from "@/services/serviceUnitService";

const formatRupiah = (value) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value || 0);

const CLASS_LABEL = { umum: "Umum", eksekutif: "Eksekutif" };
const CLASS_BADGE = {
	umum: "bg-teal-50 text-teal-800 border-teal-200",
	eksekutif: "bg-amber-50 text-[#B45309] border-amber-200",
};

// ==== Aturan kategori sub layanan, mengikuti nama Unit Layanan ====
// Sama persis dengan yang dipakai di SubLayananPage, supaya konsisten
// di seluruh modul: kategori sub layanan ditentukan otomatis dari nama
// unit layanan yang dipilih (bukan input bebas / hardcode).
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

export default function TarifLayananMedisPage() {
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
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage] = useState(10);
	const [toast, setToast] = useState<any>({ show: false });
	const [deletingId, setDeletingId] = useState(null);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [formErrors, setFormErrors] = useState<Record<string, any>>({});
	const [submitting, setSubmitting] = useState(false);

	// NOTE: apiFetch (lib/api.js) melempar error kalau request gagal, dan
	// selalu mengembalikan { message, data } (tanpa field `success`) kalau
	// sukses. Jadi kalau sampai baris setelah await tanpa exception, artinya
	// request PASTI berhasil — ambil isinya langsung dari res.data.
	const loadData = async ({ silent = false } = {}) => {
		silent ? setRefreshing(true) : setLoading(true);
		try {
			const [priceRes, unitRes] = await Promise.all([
				getServicePriceMedis(),
				getServiceUnits(),
			]);

			const priceData = priceRes?.data || [];
			const unitData = unitRes?.data || [];

			const pricesArray = Array.isArray(priceData) ? priceData : [];
			const unitsArray = Array.isArray(unitData) ? unitData : [];

			setPrices(pricesArray);
			setUnits(unitsArray);
		} catch (err) {
			console.error("[ERROR] loadData failed:", err);
			notify(setToast, { type: "error", message: err.message || "Gagal memuat data tarif layanan medis." });
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

	// Unit layanan yang sedang dipilih di form Tambah/Edit, dipakai untuk
	// menentukan aturan kategori sub layanan (mengikuti nama unitnya).
	const selectedUnit = useMemo(
		() => units.find((u) => String(u.id) === String(form.service_unit_id)) || null,
		[units, form.service_unit_id]
	);
	const categoryConfig = useMemo(() => getCategoryConfig(selectedUnit?.name), [selectedUnit]);

	// daftar kategori unik yang benar-benar sudah dipakai di data (untuk filter)
	const usedCategories = useMemo(() => {
		const set = new Set(prices.map((p) => p.category).filter(Boolean));
		return Array.from(set).sort();
	}, [prices]);

	const filteredPrices = useMemo(() => {
		return prices.filter((item) => {
			const q = searchTerm.trim().toLowerCase();
			if (q) {
				const haystack = `${item.name || ""} ${item.kptl || ""} ${item.category || ""}`.toLowerCase();
				if (!haystack.includes(q)) return false;
			}
			if (statusFilter !== "all" && item.status !== statusFilter) return false;
			if (unitFilter !== "all" && String(item.service_unit_id) !== String(unitFilter)) return false;
			return true;
		});
	}, [prices, searchTerm, statusFilter, unitFilter]);

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

	// Hitung default kategori untuk sebuah unit id (dipakai saat ganti unit / buka form)
	const getDefaultCategoryForUnit = (unitId) => {
		const unit = units.find((u) => String(u.id) === String(unitId));
		const config = getCategoryConfig(unit?.name);
		return config.mode === "select" ? config.options[0] || "" : "";
	};

	const openAdd = () => {
		setEditingItem(null);
		const defaultUnitId = units[0]?.id ? String(units[0].id) : "";
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
		if (!form.class) errors.class = "Kelas wajib dipilih.";
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
				await updateServicePriceMedis(editingItem.id, payload);
				notify(setToast, { type: "success", message: `Tarif "${payload.name}" berhasil diperbarui.` });
			} else {
				await createServicePriceMedis(payload);
				notify(setToast, { type: "success", message: `Tarif "${payload.name}" berhasil ditambahkan.` });
			}

			setIsModalOpen(false);
			await loadData({ silent: true });
		} catch (err) {
			console.error("[ERROR] handleSubmit failed:", err);
			notify(setToast, { type: "error", message: err.message || "Gagal menyimpan tarif layanan medis." });
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id, name) => {
		if (!confirm(`Hapus tarif layanan "${name}"?`)) return;
		setDeletingId(id);
		try {
			await deleteServicePriceMedis(id);
			notify(setToast, { type: "success", message: `Tarif "${name}" berhasil dihapus.` });
			loadData({ silent: true });
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Gagal menghapus tarif layanan medis." });
		} finally {
			setDeletingId(null);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
			<Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/login")} />
			<div className="flex flex-1">
				<Sidebar role="faskes" />
				<main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
					{/* Header Banner */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
						<div className="flex-1 min-w-0">
							<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
								<Stethoscope className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Tarif Layanan Medis
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Master Data Tarif Layanan Medis
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
								Kelola tarif tindakan medis per unit layanan, terpisah untuk kelas <strong>Umum</strong> dan <strong>Eksekutif</strong>.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
							<button
								onClick={openAdd}
								disabled={units.length === 0}
								title={units.length === 0 ? "Buat Unit Layanan terlebih dahulu" : undefined}
								className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Plus className="h-4 w-4" /> Tambah Tarif Medis
							</button>
						</div>
					</div>

					{units.length === 0 && (
						<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-[#B45309] flex items-center gap-2">
							<Building2 className="h-4 w-4 shrink-0" />
							Belum ada Unit Layanan. Buat Unit Layanan dulu di halaman Master Unit Layanan sebelum menambah tarif.
						</div>
					)}

					{/* Quick Metrics */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tarif Medis</p>
								<p className="text-2xl font-extrabold text-slate-900 mt-1">{prices.length} Item</p>
							</div>
							<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 font-bold">
								<Tag className="h-5 w-5" />
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
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Tarif</p>
								<p className="text-xl font-extrabold text-slate-900 font-mono mt-1">{formatRupiah(averagePrice)}</p>
							</div>
							<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#D97706] font-bold">
								<DollarSign className="h-5 w-5" />
							</span>
						</div>
					</div>

					{/* Search & Filter */}
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
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
								/>
							</div>

							<div>
								<select
									value={unitFilter}
									onChange={(e) => {
										setUnitFilter(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
								>
									<option value="all">Semua Unit Layanan</option>
									{units.map((u) => (
										<option key={u.id} value={u.id}>{u.name}</option>
									))}
								</select>
							</div>

							<div>
								<select
									value={statusFilter}
									onChange={(e) => {
										setStatusFilter(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
								>
									<option value="all">Semua Status</option>
									<option value="active">Aktif</option>
									<option value="inactive">Non-Aktif</option>
								</select>
							</div>
						</div>
					</div>

					{/* Table */}
					<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
						<div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
							<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
								<SlidersHorizontal className="h-5 w-5 text-teal-800" />
								Daftar Tarif Layanan Medis ({filteredPrices.length})
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
								{prices.length === 0 ? "Belum ada tarif layanan medis." : "Tidak ada data yang cocok dengan pencarian/filter."}
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
										{paginatedPrices.map((item) => {
											const unit = unitMap[item.service_unit_id];
											return (
												<tr key={item.id} className="hover:bg-slate-50/60 transition">
													<td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{item.kptl || "-"}</td>
													<td className="py-4 px-4 font-extrabold text-slate-900">{item.name}</td>
													<td className="py-4 px-4 text-slate-600">{unit?.name || <span className="italic text-slate-400">Unit tidak ditemukan</span>}</td>
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
														{formatRupiah(item.price)}
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
															onClick={() => handleDelete(item.id, item.name)}
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
													safeCurrentPage === p ? "bg-teal-700 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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

					{/* Modal Tambah/Edit Tarif */}
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
											<Stethoscope className="h-5 w-5" />
										</span>
										<div>
											<h3 className="text-base font-extrabold text-white">
												{editingItem ? "Edit Tarif Layanan Medis" : "Tambah Tarif Layanan Medis"}
											</h3>
											<p className="text-[11px] text-teal-50/80 mt-0.5">
												{editingItem ? `Perbarui data untuk "${editingItem.name}"` : "Tambahkan tindakan medis baru beserta tarifnya"}
											</p>
										</div>
									</div>
								</div>

								{/* Body */}
								<form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4 overflow-y-auto">
									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
											Unit Layanan <span className="text-[#DC2626]">*</span>
										</label>
										<select
											value={form.service_unit_id}
											onChange={(e) => handleUnitChange(e.target.value)}
											className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium focus:outline-hidden transition ${
												formErrors.service_unit_id
													? "border-red-300 bg-red-50/40 focus:border-red-500"
													: "border-slate-200 bg-slate-50/50 focus:border-teal-600 focus:bg-white"
											}`}
										>
											<option value="">Pilih unit layanan...</option>
											{units.map((u) => (
												<option key={u.id} value={u.id}>{u.name}</option>
											))}
										</select>
										{formErrors.service_unit_id && (
											<p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.service_unit_id}</p>
										)}
									</div>

									{/* Kategori sub layanan - otomatis mengikuti unit yang dipilih di atas */}
									{form.service_unit_id && categoryConfig.mode !== "none" && (
										<div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-2">
											<label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
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
															: "border-teal-200 bg-white focus:border-teal-600"
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
													className="w-full rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-xs font-medium focus:border-teal-600 focus:outline-hidden transition"
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
												placeholder="Contoh: MED-0012"
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
											Nama Layanan <span className="text-[#DC2626]">*</span>
										</label>
										<input
											value={form.name}
											onChange={(e) => {
												setForm({ ...form, name: e.target.value });
												if (formErrors.name) setFormErrors({ ...formErrors, name: null });
											}}
											placeholder="Contoh: Konsultasi Dokter Umum"
											className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium focus:outline-hidden transition ${
												formErrors.name
													? "border-red-300 bg-red-50/40 focus:border-red-500"
													: "border-slate-200 bg-slate-50/50 focus:border-teal-600 focus:bg-white"
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
											Tarif (Rp) <span className="text-[#DC2626]">*</span>
										</label>
										<div className="relative">
											<span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
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
														: "border-slate-200 bg-slate-50/50 focus:border-teal-600 focus:bg-white"
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
											className="rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white px-5 py-2.5 text-xs font-extrabold hover:from-teal-800 hover:to-cyan-900 transition disabled:opacity-60 inline-flex items-center gap-2"
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
				</main>
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
			`}</style>
		</div>
	);
}