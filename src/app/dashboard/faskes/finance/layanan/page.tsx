"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { notify } from "@/lib/notify";
import { getServicePrices } from "@/services/servicePriceService";
import {
	getServiceUnits,
	createServiceUnit,
	updateServiceUnit,
	deleteServiceUnit,
} from "@/services/serviceUnitService";
import {
	Plus,
	RefreshCw,
	Trash2,
	Pencil,
	X,
	Search,
	CheckCircle2,
	FileText,
	Building2,
	SlidersHorizontal,
	Loader2,
	Layers,
	ChevronLeft,
	ChevronRight,
	Tag,
	DollarSign,
	Printer,
} from "lucide-react";

const CATEGORY_LABEL = {
	admin: "Admin",
	utama: "Utama",
	penunjang: "Penunjang",
	ruangan: "Ruangan",
};

const CATEGORY_BADGE = {
	admin: "bg-slate-100 text-slate-600 border-slate-200",
	utama: "bg-teal-50 text-teal-800 border-teal-200",
	penunjang: "bg-cyan-50 text-cyan-800 border-cyan-200",
	ruangan: "bg-amber-50 text-[#B45309] border-amber-200",
};

const formatRupiah = (value) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value || 0);

const emptyForm = { code: "", name: "", category: "utama", price: "", status: "active" };

export default function ServiceUnitPage() {
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
	const [servicePrices, setServicePrices] = useState([]);
	const [units, setUnits] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	// Status sekarang dikontrol lewat tombol kecil (bukan dropdown)
	const [statusFilter, setStatusFilter] = useState("all");
	// Filter kategori baru, menggantikan posisi dropdown status sebelumnya
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage] = useState(10);
	const [toast, setToast] = useState({ show: false });

	// Form state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState(emptyForm);
	const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
	const [submitting, setSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState(null);

	const getUnitPrices = (unitId, allPrices) =>
		allPrices.filter((p) => p.service_unit_id === unitId);

	// NOTE: backend (controller/handle()) selalu mengembalikan { message, data }
	// dan MELEMPAR ERROR (bukan { success:false }) kalau gagal. Jadi begitu
	// promise resolve tanpa throw, itu artinya request SUKSES — tidak ada
	// field `success` untuk dicek. Ambil datanya langsung dari `res.data`.
	const loadData = async ({ silent = false } = {}) => {
	silent ? setRefreshing(true) : setLoading(true);
	try {
		const [spRes, uRes] = await Promise.all([
			getServicePrices({ status: "active" }),
			getServiceUnits(),
		]);

		const priceData = spRes?.data || [];
		const unitData = uRes?.data || [];

		const pricesArray = Array.isArray(priceData) ? priceData : [];
		const unitsArray = Array.isArray(unitData) ? unitData : [];

		setServicePrices(pricesArray);
		setUnits(unitsArray);

		return unitsArray;
	} catch (err) {
		console.error("[ERROR] loadData failed:", err);
		notify(setToast, { type: "error", message: err.message || "Gagal memuat data." });
		return null;
	} finally {
		silent ? setRefreshing(false) : setLoading(false);
	}
};

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Derived filtered & paginated data
	const filteredUnits = units.filter((u) => {
		const q = searchTerm.trim().toLowerCase();
		if (q) {
			const haystack = `${u.name || ""} ${u.category || ""} ${u.code || ""}`.toLowerCase();
			if (!haystack.includes(q)) return false;
		}
		if (categoryFilter !== "all" && u.category !== categoryFilter) return false;
		if (statusFilter === "active") return u.status === "active";
		if (statusFilter === "inactive") return u.status === "inactive";
		return true;
	});

	const totalItems = filteredUnits.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
	const safeCurrentPage = Math.min(currentPage, totalPages);
	const paginatedUnits = filteredUnits.slice((safeCurrentPage - 1) * perPage, safeCurrentPage * perPage);

	// Nomor halaman dipadatkan (contoh: 1, 2, 3 ... 10) supaya tidak render
	// semua nomor halaman saat datanya banyak.
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

	const activeCount = units.filter((i) => i.status === "active").length;
	const avgComponents = units.length === 0 ? 0 : Math.round(servicePrices.length / units.length);

	const openAdd = () => {
		setEditing(null);
		setForm({ ...emptyForm });
		setFormErrors({});
		setIsModalOpen(true);
	};

	const openEdit = (item) => {
		setEditing(item);
		setForm({
			code: item.code || "",
			name: item.name || "",
			category: item.category || "utama",
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

	const validateForm = () => {
		const errors: Record<string, string> = {};
		if (!form.name.trim()) errors.name = "Nama unit wajib diisi.";
		else if (form.name.trim().length < 3) errors.name = "Nama unit minimal 3 karakter.";
		if (form.price !== "" && (isNaN(Number(form.price)) || Number(form.price) < 0)) {
			errors.price = "Harga harus berupa angka dan tidak boleh negatif.";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e) => {
	e && e.preventDefault();
	if (!validateForm()) return;

	setSubmitting(true);
	try {
		const payload = {
			code: form.code.trim() || null,
			name: form.name.trim(),
			category: form.category,
			price: form.price === "" ? 0 : Number(form.price),
			status: form.status,
		};

		if (editing) {
			const res = await updateServiceUnit(editing.id, payload);
			const updated = res?.data || { ...editing, ...payload };

			// update langsung di state lokal, tidak nunggu refetch
			setUnits((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...updated } : u)));

			notify(setToast, { type: "success", message: `Unit "${payload.name}" berhasil diperbarui.` });
		} else {
			const res = await createServiceUnit(payload);
			const created = res?.data;

			if (created && created.id) {
				// data baru langsung dimasukkan ke state, tabel tidak pernah kosong
				setUnits((prev) => [created, ...prev]);
			}

			notify(setToast, { type: "success", message: `Unit "${payload.name}" berhasil dibuat.` });
		}

		setIsModalOpen(false);

		// sinkronisasi ulang di background, TAPI kalau hasilnya kosong/gagal,
		// state optimistic di atas tetap dipertahankan (tidak ditimpa jadi kosong)
		const fresh = await loadData({ silent: true });
		if (!fresh || fresh.length === 0) {
			console.warn("[WARN] Refetch setelah submit kosong/gagal — mempertahankan state optimistic.");
		}
	} catch (err) {
		console.error("[ERROR] handleSubmit failed:", err);
		notify(setToast, { type: "error", message: err.message || "Gagal menyimpan unit layanan." });
	} finally {
		setSubmitting(false);
	}
};

	const handleDelete = async (id, name) => {
	if (!confirm(`Hapus unit layanan "${name}"? Tarif medis & klinik yang terkait juga akan ikut terhapus.`)) return;

	setDeletingId(id);
	const prevUnits = units; // simpan untuk rollback kalau gagal
	try {
		setUnits((prev) => prev.filter((u) => u.id !== id)); // optimistic remove
		await deleteServiceUnit(id);
		notify(setToast, { type: "success", message: `Unit "${name}" berhasil dihapus.` });

		const fresh = await loadData({ silent: true });
		if (!fresh) {
			console.warn("[WARN] Refetch setelah delete gagal — mempertahankan state optimistic.");
		}
	} catch (err) {
		console.error(err);
		setUnits(prevUnits); // rollback kalau delete gagal
		notify(setToast, { type: "error", message: err.message || "Gagal menghapus unit layanan." });
	} finally {
		setDeletingId(null);
	}
};

	// Cetak/unduh PDF sederhana — memanggil dialog print bawaan browser (sama seperti Ctrl+P)
	const handlePrint = () => {
		window.print();
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<RefreshCw className="h-8 w-8 animate-spin text-teal-800" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			
			<div>
				
				<div className="space-y-6">
					{/* Header Banner */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full print:hidden">
						<div className="flex-1 min-w-0">
							<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
								<Building2 className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Unit Layanan
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Master Data Unit Layanan
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
								Kelola unit layanan organisasi RS (IGD, Rawat Jalan, Rawat Inap, Farmasi, Laboratorium) dan pilih komponen tarif medis & klinik yang terkait untuk setiap unit.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 sm:ml-auto">
							<button
								onClick={handlePrint}
								className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 text-xs font-extrabold shadow-xs transition cursor-pointer whitespace-nowrap"
								title="Cetak / unduh sebagai PDF"
							>
								<Printer className="h-4 w-4" /> Unduh PDF
							</button>
							<button
								onClick={openAdd}
								className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
							>
								<Plus className="h-4 w-4" /> Tambah Unit Layanan
							</button>
						</div>
					</div>

					{/* Quick Metrics */}
					<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 print:hidden">
						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Unit Layanan</p>
								<p className="text-2xl font-extrabold text-slate-900 mt-1">{units.length} Unit</p>
							</div>
							<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
								<Building2 className="h-5 w-5" />
							</span>
						</div>

						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Aktif</p>
								<p className="text-2xl font-extrabold text-[#16A34A] mt-1">{activeCount} Unit</p>
							</div>
							<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-[#16A34A] font-bold">
								<CheckCircle2 className="h-5 w-5" />
							</span>
						</div>

						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Komponen</p>
								<p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{avgComponents}</p>
							</div>
							<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-[#D97706] font-bold">
								<FileText className="h-5 w-5" />
							</span>
						</div>

						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Komponen</p>
								<p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{servicePrices.length} Komponen</p>
							</div>
							<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 font-bold">
								<FileText className="h-5 w-5" />
							</span>
						</div>
					</div>

					{/* Search & Filters */}
					<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-6 space-y-4 print:hidden">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div className="relative col-span-2">
								<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
								<input
									type="text"
									placeholder="Cari nama, kode, atau kategori unit layanan..."
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
								/>
							</div>
							{/* Filter kategori menggantikan dropdown status */}
							<div className="relative">
								<Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
								<select
									value={categoryFilter}
									onChange={(e) => {
										setCategoryFilter(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium appearance-none"
								>
									<option value="all">Semua Kategori</option>
									<option value="utama">Utama</option>
									<option value="penunjang">Penunjang</option>
									<option value="ruangan">Ruangan</option>
									<option value="admin">Admin</option>
								</select>
							</div>
						</div>

						{/* Toggle status sebagai tombol kecil, bukan dropdown */}
						<div className="flex items-center gap-2 pt-1">
							<span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
							<button
								type="button"
								onClick={() => {
									setStatusFilter("all");
									setCurrentPage(1);
								}}
								className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${
									statusFilter === "all"
										? "bg-slate-800 text-white border-slate-800"
										: "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
								}`}
							>
								Semua
							</button>
							<button
								type="button"
								onClick={() => {
									setStatusFilter("active");
									setCurrentPage(1);
								}}
								className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold border transition ${
									statusFilter === "active"
										? "bg-emerald-600 text-white border-emerald-600"
										: "bg-white text-[#16A34A] border-emerald-200 hover:bg-emerald-50"
								}`}
							>
								<span className={`h-1.5 w-1.5 rounded-full ${statusFilter === "active" ? "bg-white" : "bg-[#16A34A]"}`} />
								Aktif
							</button>
							<button
								type="button"
								onClick={() => {
									setStatusFilter("inactive");
									setCurrentPage(1);
								}}
								className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold border transition ${
									statusFilter === "inactive"
										? "bg-slate-500 text-white border-slate-500"
										: "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
								}`}
							>
								<span className={`h-1.5 w-1.5 rounded-full ${statusFilter === "inactive" ? "bg-white" : "bg-slate-400"}`} />
								Non-Aktif
							</button>
						</div>
					</div>

					<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs print:border-0 print:shadow-none print:p-0">
						<div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 print:border-slate-300">
							<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
								<SlidersHorizontal className="h-5 w-5 text-teal-800 print:hidden" />
								Daftar Unit Layanan ({filteredUnits.length})
							</h3>
							<button
								onClick={() => loadData({ silent: true })}
								disabled={refreshing}
								className="text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:opacity-50 print:hidden"
								title="Muat ulang data"
							>
								<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
							</button>
						</div>
						{totalItems === 0 ? (
							<div className="py-12 text-center text-slate-400 italic text-xs">
								{units.length === 0 ? "Belum ada unit layanan. Klik \"Tambah Unit Layanan\" untuk membuat yang pertama." : "Tidak ada unit yang cocok dengan pencarian/filter."}
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs border-collapse">
									<thead>
										<tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
											<th className="py-3 px-4">Kode</th>
											<th className="py-3 px-4">Nama Unit</th>
											<th className="py-3 px-4">Kategori</th>
											<th className="py-3 px-4 text-right">Harga</th>
											<th className="py-3 px-4">Status</th>
											<th className="py-3 px-4">Komponen Tarif</th>
											<th className="py-3 px-4 text-right print:hidden">Aksi</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 font-medium text-slate-700">
										{paginatedUnits.map((u) => {
											const unitPrices = getUnitPrices(u.id, servicePrices);
											return (
												<tr key={u.id} className="hover:bg-slate-50/60 transition">
													<td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{u.code || "-"}</td>
													<td className="py-4 px-4 font-bold text-slate-900">{u.name}</td>
													<td className="py-4 px-4">
														<span
															className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${CATEGORY_BADGE[u.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}
														>
															{CATEGORY_LABEL[u.category] || u.category}
														</span>
													</td>
													<td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
														{formatRupiah(u.price)}
													</td>
													<td className="py-4 px-4">
														<span
															className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold ${
																u.status === "active" ? "bg-emerald-50 text-[#16A34A]" : "bg-slate-100 text-slate-500"
															}`}
														>
															<span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-[#16A34A]" : "bg-slate-400"}`} />
															{u.status === "active" ? "Aktif" : "Non-Aktif"}
														</span>
													</td>
													<td className="py-4 px-4">
														<div className="flex flex-wrap gap-2 max-w-md">
															{unitPrices.length === 0 ? (
																<span className="text-[10px] text-slate-400 italic">Belum ada komponen</span>
															) : (
																unitPrices.slice(0, 4).map((p) => (
																	<span key={`${p.source}-${p.id}`} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold">
																		{p.name}
																	</span>
																))
															)}
															{unitPrices.length > 4 && (
																<span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
																	+{unitPrices.length - 4} lainnya
																</span>
															)}
														</div>
													</td>
													<td className="py-4 px-4 text-right whitespace-nowrap space-x-2 print:hidden">
														<button
															onClick={() => router.push(`/dashboard/faskes/finance/layanan/sublayanan?unitId=${u.id}&unitName=${encodeURIComponent(u.name)}&category=${u.category}`)}
															className="rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
														>
															<Layers className="h-3.5 w-3.5" /> Sub Layanan
														</button>
														<button
															onClick={() => openEdit(u)}
															className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
														>
															<Pencil className="h-3.5 w-3.5" /> Edit
														</button>
														<button
															onClick={() => handleDelete(u.id, u.name)}
															disabled={deletingId === u.id}
															className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold disabled:opacity-50 transition inline-flex items-center gap-2"
														>
															{deletingId === u.id ? (
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

						{/* Pagination Controls */}
						{totalItems > 0 && (
							<div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
								<div className="text-[11px] text-slate-500 font-medium">
									Menampilkan {Math.min((safeCurrentPage - 1) * perPage + 1, totalItems)}–{Math.min(safeCurrentPage * perPage, totalItems)} dari {totalItems} unit
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

					{/* Modal */}
					{isModalOpen && (
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_.15s_ease-out] print:hidden"
							onClick={closeModal}
						>
							<div
								onClick={(e) => e.stopPropagation()}
								className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-[scaleIn_.15s_ease-out] max-h-[90vh] flex flex-col"
							>
								{/* Modal Header */}
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
												{editing ? "Edit Unit Layanan" : "Tambah Unit Layanan"}
											</h3>
											<p className="text-[11px] text-teal-50/80 mt-0.5">
												{editing ? `Perbarui data untuk "${editing.name}"` : "Buat unit layanan baru untuk faskes ini"}
											</p>
										</div>
									</div>
								</div>

								{/* Modal Body */}
								<form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5 overflow-y-auto">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kode Unit</label>
											<input
												value={form.code}
												onChange={(e) => setForm({ ...form, code: e.target.value })}
												placeholder="Contoh: UNIT-IGD-01"
												className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
											/>
										</div>

										<div>
											<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kategori</label>
											<select
												value={form.category}
												onChange={(e) => setForm({ ...form, category: e.target.value })}
												className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
											>
												<option value="utama">Utama</option>
												<option value="penunjang">Penunjang</option>
												<option value="ruangan">Ruangan</option>
												<option value="admin">Admin</option>
											</select>
										</div>
									</div>

									<div>
										<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
											Nama Unit <span className="text-[#DC2626]">*</span>
										</label>
										<input
											value={form.name}
											onChange={(e) => {
												setForm({ ...form, name: e.target.value });
												if (formErrors.name) setFormErrors({ ...formErrors, name: null });
											}}
											placeholder="Contoh: Instalasi Gawat Darurat"
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
											<label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Harga (Rp)</label>
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
													placeholder="0"
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

									{editing && (
										<div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[11px] text-slate-500">
											{getUnitPrices(editing.id, servicePrices).length} komponen tarif medis/klinik terhubung ke unit ini.
										</div>
									)}

									<div className="flex items-center justify-end gap-2 pt-2">
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
											{submitting ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Unit"}
										</button>
									</div>
								</form>
							</div>
						</div>
					)}

					<Toast toast={toast} onClose={() => setToast({ show: false })} />
				</div>
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
					body { background: #fff !important; }
					.print\\:hidden { display: none !important; }
				}
			`}</style>
		</div>
	);
}