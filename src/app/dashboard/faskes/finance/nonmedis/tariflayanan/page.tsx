"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { DollarSign, Plus, Search, Filter, Pencil, Trash2, X, Loader2, FileText } from "lucide-react";
import nonmedisService, {
  type NonMedisPrice,
  type NonMedisService,
  type NonMedisStatus,
} from "@/services/nonmedisService";

const getStatusLabel = (value?: string) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "aktif") return "Aktif";
  if (normalized === "nonaktif") return "Non-Aktif";
  return "-";
};

const statusFilterOptions: { label: string; value: "" | NonMedisStatus }[] = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "aktif" },
  { label: "Non-Aktif", value: "nonaktif" },
];

const LIMIT = 10;

type FormState = {
  id: number | null;
  servicenonmedis_id: string;
  name: string;
  category: string;
  kptl: string; // dipakai sebagai "Satuan" (mis. per hari, per kunjungan)
  price: string;
  status: NonMedisStatus;
};

const emptyForm: FormState = {
  id: null,
  servicenonmedis_id: "",
  name: "",
  category: "",
  kptl: "",
  price: "",
  status: "aktif",
};

// Debounce kecil untuk search, biar ga fetch tiap ketikan
function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Bikin daftar nomor halaman: selalu tampilkan halaman pertama, terakhir,
// halaman sekitar current, sisanya diringkas dengan "..."
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function TarifLayananPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<"" | NonMedisStatus>("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<NonMedisPrice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [services, setServices] = useState<NonMedisService[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NonMedisPrice | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ambil daftar layanan non medis (untuk dropdown pilih layanan di form) sekali di awal
  useEffect(() => {
    (async () => {
      try {
        const res = await nonmedisService.getNonMedisServices({ limit: 500 });
        setServices(res.data ?? []);
      } catch {
        // gagal ambil daftar layanan tidak menghentikan halaman utama, cuma dropdown jadi kosong
        setServices([]);
      }
    })();
  }, []);

  // reset ke halaman 1 tiap kali filter/search berubah
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await nonmedisService.getNonMedisPrices({
        page,
        limit: LIMIT,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      });
      setItems(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
      setTotalPages(res.meta?.totalPages ?? 1);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal memuat data tarif layanan non medis.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: NonMedisPrice) => {
    setForm({
      id: item.id,
      servicenonmedis_id: String(item.servicenonmedis_id ?? ""),
      name: item.name ?? "",
      category: item.category ?? "",
      kptl: item.kptl ?? "",
      price: String(item.price ?? ""),
      status: item.status,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.servicenonmedis_id || !form.name.trim() || form.price === "") {
      setFormError("Layanan, nama tarif, dan harga wajib diisi.");
      return;
    }
    const priceNumber = Number(form.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      setFormError("Harga harus berupa angka dan tidak boleh negatif.");
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      const payload = {
        servicenonmedis_id: form.servicenonmedis_id,
        name: form.name.trim(),
        category: form.category.trim() || null,
        kptl: form.kptl.trim() || null,
        price: priceNumber,
        status: form.status,
      };
      if (form.id) {
        await nonmedisService.updateNonMedisPrice(form.id, payload);
      } else {
        await nonmedisService.createNonMedisPrice(payload);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Gagal menyimpan data tarif.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await nonmedisService.deleteNonMedisPrice(deleteTarget.id);
      setDeleteTarget(null);
      // kalau baris terakhir di halaman ini dihapus, mundur 1 halaman
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal menghapus data tarif.");
    } finally {
      setDeleting(false);
    }
  };

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
              <DollarSign className="h-3.5 w-3.5" />
              Tarif Layanan
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Tarif Layanan Non Medis</h1>
            <p className="mt-1 text-sm text-slate-500">Kelola harga layanan support rumah sakit sesuai satuan dan status aktif.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-amber-600 to-orange-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Tarif
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.5fr_0.8fr]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama tarif layanan..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | NonMedisStatus)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
            >
              {statusFilterOptions.map((opt) => (
                <option key={opt.label} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Daftar Tarif</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">
            <FileText className="h-3.5 w-3.5" /> {total} item
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat data tarif...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Belum ada tarif layanan non medis yang cocok dengan filter ini.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Layanan</th>
                    <th className="px-4 py-3">Jenis</th>
                    <th className="px-4 py-3">Satuan</th>
                    <th className="px-4 py-3">Harga</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const statusLabel = getStatusLabel(item.status);
                    const layananName = item.serviceNonMedis?.name || item.name || "-";
                    return (
                      <tr key={item.id} className="border-b border-slate-100 align-middle hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-900">{layananName}</div>
                          {item.serviceNonMedis?.name && (
                            <div className="text-[10px] text-slate-400">{item.name}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-600">{item.category || "-"}</td>
                        <td className="px-4 py-4 text-slate-600">{item.kptl || "-"}</td>
                        <td className="px-4 py-4 font-mono text-slate-900">
                          Rp {Number(item.price ?? 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              statusLabel === "Aktif"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              aria-label={`Hapus ${item.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <span className="text-[11px] font-semibold text-slate-400">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                >
                  Prev
                </button>
                {pageNumbers.map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 min-w-[2rem] rounded-xl px-2 text-xs font-bold ${
                        p === page
                          ? "bg-linear-to-r from-amber-600 to-orange-700 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                {form.id ? "Edit Tarif" : "Tambah Tarif"}
              </h3>
              <button onClick={closeModal} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Layanan Non Medis</label>
                <select
                  value={form.servicenonmedis_id}
                  onChange={(e) => setForm((f) => ({ ...f, servicenonmedis_id: e.target.value }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
                >
                  <option value="">Pilih layanan...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.class})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Nama Tarif / Sub Layanan</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="mis. Sewa Kamar VIP"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Jenis / Kategori</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="mis. Akomodasi"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Satuan</label>
                  <input
                    value={form.kptl}
                    onChange={(e) => setForm((f) => ({ ...f, kptl: e.target.value }))}
                    placeholder="mis. per hari"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Harga (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="mis. 150000"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NonMedisStatus }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-amber-600 focus:bg-white focus:outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Non-Aktif</option>
                </select>
              </div>

              {formError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-amber-600 to-orange-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-900">Hapus Tarif?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Tarif <span className="font-bold text-slate-700">{deleteTarget.name}</span> akan dihapus permanen.
              Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}