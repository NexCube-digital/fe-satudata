"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Toast from "@/components/ui/Toast";
import { notify } from "@/lib/notify";
import { getServicePrices } from "@/services/servicePriceService";
import {
	getServiceUnits,
	createServiceUnit,
	updateServiceUnit,
	deleteServiceUnit,
} from "@/services/serviceUnitService";
import { Plus, RefreshCw, Trash2, Pencil, X, Search, CheckCircle2, FileText } from "lucide-react";

export default function ServiceUnitPage() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [servicePrices, setServicePrices] = useState([]);
	const [units, setUnits] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
	const [toast, setToast] = useState({ show: false });

	// Form state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ code: "", name: "", service_price_ids: [] });
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("user");
		if (stored) {
			try {
				setUser(JSON.parse(stored));
			} catch {}
		}
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		try {
			const spRes = await getServicePrices({ status: "active" });
			const prices = spRes?.success && Array.isArray(spRes.data) ? spRes.data : Array.isArray(spRes) ? spRes : [];
			setServicePrices(prices);

			const uRes = await getServiceUnits();
			const unitsData = uRes?.success && Array.isArray(uRes.data) ? uRes.data : Array.isArray(uRes) ? uRes : [];
			setUnits(unitsData);
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Gagal memuat data." });
		} finally {
			setLoading(false);
		}
	};

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter, perPage]);

	// Derived filtered & paginated data
	const filteredUnits = units.filter((u) => {
		const q = searchTerm.trim().toLowerCase();
		if (q) {
			if (!((u.name || "").toLowerCase().includes(q) || (u.code || "").toLowerCase().includes(q))) return false;
		}
		if (statusFilter === "active") return u.status === "active";
		if (statusFilter === "inactive") return u.status === "inactive";
		return true;
	});

	const totalItems = filteredUnits.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
	const paginatedUnits = filteredUnits.slice((currentPage - 1) * perPage, currentPage * perPage);

	const activeCount = units.filter((i) => i.status === "active").length;
	const avgComponents = units.length === 0 ? 0 : Math.round(units.reduce((acc, cur) => acc + ((cur.servicePrices || []).length || 0), 0) / units.length);

	const openAdd = () => {
		setEditing(null);
		setForm({ code: "", name: "", service_price_ids: [] });
		setIsModalOpen(true);
	};

	const openEdit = (item) => {
		setEditing(item);
		setForm({ code: item.code || "", name: item.name || "", service_price_ids: (item.servicePrices || []).map((p) => p.id) });
		setIsModalOpen(true);
	};

	const togglePrice = (id) => {
		setForm((f) => {
			const arr = Array.isArray(f.service_price_ids) ? [...f.service_price_ids] : [];
			const idx = arr.indexOf(id);
			if (idx === -1) arr.push(id);
			else arr.splice(idx, 1);
			return { ...f, service_price_ids: arr };
		});
	};

	const handleSubmit = async (e) => {
		e && e.preventDefault();
		if (!form.name.trim()) return notify(setToast, { type: "error", message: "Nama unit wajib diisi." });
		setSubmitting(true);
		try {
			const payload = { code: form.code.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "_"), name: form.name.trim(), service_price_ids: form.service_price_ids };
			let res;
			if (editing) {
				res = await updateServiceUnit(editing.id, payload);
			} else {
				res = await createServiceUnit(payload);
			}

			if (res?.success) {
				notify(setToast, { type: "success", message: editing ? "Unit layanan berhasil diperbarui." : "Unit layanan berhasil dibuat." });
				setIsModalOpen(false);
				loadData();
			} else {
				notify(setToast, { type: "error", message: res?.message || "Gagal menyimpan unit." });
			}
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Terjadi kesalahan." });
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id, name) => {
		if (!confirm(`Hapus unit layanan \"${name}\"?`)) return;
		try {
			const res = await deleteServiceUnit(id);
			if (res?.success) {
				notify(setToast, { type: "success", message: `Unit \"${name}\" dihapus.` });
				loadData();
			} else {
				notify(setToast, { type: "error", message: res?.message || "Gagal menghapus." });
			}
		} catch (err) {
			console.error(err);
			notify(setToast, { type: "error", message: err.message || "Terjadi kesalahan." });
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
			<Navbar user={user} roleLabel="Staf Keuangan Faskes" onLogout={() => router.push("/auth/login")} />
			<div className="flex flex-1">
				<Sidebar role="faskes" />
				<main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-extrabold text-slate-900">Kelola Unit Layanan</h1>
							<p className="text-xs text-slate-500">Tambah unit (misal IGD) dan pilih komponen tarif yang terkait (admin, lab, umum).</p>
						</div>
						<div className="flex items-center gap-2">
							<button onClick={openAdd} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white px-4 py-2 text-xs font-extrabold">
								<Plus className="h-4 w-4" /> Tambah Unit
							</button>
							<button onClick={loadData} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs">
								<RefreshCw className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Metric Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Unit</p>
								<p className="text-2xl font-extrabold text-slate-900 mt-1">{units.length}</p>
							</div>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
								<FileText className="h-6 w-6" />
							</span>
						</div>

						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Aktif</p>
								<p className="text-2xl font-extrabold text-[#16A34A] mt-1">{activeCount} Unit</p>
							</div>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#16A34A] font-bold">
								<CheckCircle2 className="h-6 w-6" />
							</span>
						</div>

						<div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-rata Komponen</p>
								<p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{avgComponents}</p>
							</div>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#D97706] font-bold">
								<FileText className="h-6 w-6" />
							</span>
						</div>
					</div>

					{/* Search & Filters */}
					<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-6">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div className="relative col-span-2">
								<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
								<input
									type="text"
									placeholder="Cari kode atau nama unit..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
								/>
							</div>
							<div>
								<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700">
									<option value="all">Semua Status</option>
									<option value="active">Aktif</option>
									<option value="inactive">Non-Aktif</option>
								</select>
							</div>
						</div>
					</div>

					<div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
						<h3 className="text-base font-extrabold text-slate-900 mb-4">Daftar Unit ({units.length})</h3>
						{totalItems === 0 ? (
							<div className="py-12 text-center text-slate-400 italic text-xs">Belum ada unit layanan.</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs border-collapse">
									<thead>
										<tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
											<th className="py-3 px-4">Kode</th>
											<th className="py-3 px-4">Nama Unit</th>
											<th className="py-3 px-4">Komponen Tarif</th>
											<th className="py-3 px-4 text-right">Aksi</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 font-medium text-slate-700">
										{paginatedUnits.map((u) => (
											<tr key={u.id} className="hover:bg-slate-50/60 transition">
												<td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{u.code || "-"}</td>
												<td className="py-4 px-4 font-bold text-slate-900">{u.name}</td>
												<td className="py-4 px-4">
													<div className="flex flex-wrap gap-2">
														{(u.servicePrices || []).map((p) => (
															<span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold">{p.name}</span>
														))}
													</div>
												</td>
												<td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
													<button onClick={() => openEdit(u)} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold inline-flex items-center gap-2">
														<Pencil className="h-4 w-4" /> Edit
													</button>
													<button onClick={() => handleDelete(u.id, u.name)} className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold">
														<Trash2 className="h-4 w-4" />
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* Modal */}
					{isModalOpen && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
							<div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-base font-extrabold">{editing ? "Edit Unit Layanan" : "Tambah Unit Layanan"}</h3>
									<button onClick={() => setIsModalOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
								</div>

								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<div className="sm:col-span-1">
											<label className="text-[11px] font-bold text-slate-600">Kode (singkat)</label>
											<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs" />
										</div>
										<div className="sm:col-span-2">
											<label className="text-[11px] font-bold text-slate-600">Nama Unit</label>
											<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs" required />
										</div>
									</div>

									<div>
										<label className="text-[11px] font-bold text-slate-600">Pilih Komponen Tarif yang terkait</label>
										<div className="mt-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-white">
											{servicePrices.length === 0 ? (
												<div className="text-xs text-slate-400">Tidak ada komponen tarif.</div>
											) : (
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
													{servicePrices.map((p) => {
														const checked = (form.service_price_ids || []).includes(p.id);
														return (
															<label key={p.id} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border ${checked ? "border-teal-200 bg-teal-50" : "border-slate-100 bg-white"}`}>
																<input type="checkbox" checked={checked} onChange={() => togglePrice(p.id)} className="w-4 h-4" />
																<div className="text-xs">
																	<div className="font-bold text-slate-800">{p.name}</div>
																	<div className="text-[10px] text-slate-400">{p.code || "-"} • {p.price ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.price) : "-"}</div>
																</div>
															</label>
														);
													})}
												</div>
											)}
										</div>
									</div>

									<div className="flex items-center justify-end gap-2">
										<button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border px-4 py-2 text-xs">Batal</button>
										<button type="submit" disabled={submitting} className="rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white px-4 py-2 text-xs font-extrabold">{submitting ? "Menyimpan..." : "Simpan Unit"}</button>
									</div>
								</form>
							</div>
						</div>
					)}

							{/* Pagination Controls */}
							{totalItems > 0 && (
								<div className="mt-4 flex items-center justify-between">
									<div className="text-xs text-slate-500">Menampilkan {Math.min((currentPage-1)*perPage+1, totalItems)} - {Math.min(currentPage*perPage, totalItems)} dari {totalItems} unit</div>
									<div className="flex items-center gap-2">
										<button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p-1))} className="px-3 py-1 rounded-xl border bg-white text-xs">Prev</button>
										<div className="flex items-center gap-1">
											{Array.from({ length: totalPages }).map((_, i) => (
												<button key={i} onClick={() => setCurrentPage(i+1)} className={`px-3 py-1 rounded-xl text-xs ${currentPage===i+1? 'bg-teal-700 text-white' : 'bg-white border'}`}>
													{i+1}
												</button>
											))}
										</div>
										<button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p+1))} className="px-3 py-1 rounded-xl border bg-white text-xs">Next</button>
									</div>
								</div>
							)}

							<Toast toast={toast} onClose={() => setToast({ show: false })} />
				</main>
			</div>
		</div>
	);
}

