"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { HeartHandshake, Plus, Search, Filter, Pencil, Trash2, X, Loader2 } from "lucide-react";
import {
  getNonMedisServicesByClass,
  createNonMedisService,
  updateNonMedisService,
  deleteNonMedisService,
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
  code: string;
  name: string;
  status: NonMedisStatus;
};

const emptyForm: FormState = { id: null, code: "", name: "", status: "aktif" };

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

export default function NonMedisKlinikPage() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [status, setStatus] = useState<"" | NonMedisStatus>("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<NonMedisService[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NonMedisService | null>(null);
  const [deleting, setDeleting] = useState(false);

  // reset ke halaman 1 tiap kali filter/search berubah
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNonMedisServicesByClass("klinik", {
        page,
        limit: LIMIT,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      });
      setItems(res.data ?? []);
      setTotal(res.meta?.total ?? res.meta?.totalItems ?? 0);
      setTotalPages(res.meta?.totalPages ?? 1);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal memuat data layanan non medis klinik.");
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

  const openEditModal = (item: NonMedisService) => {
    setForm({ id: item.id, code: item.code, name: item.name, status: item.status });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setFormError("Kode dan nama layanan wajib diisi.");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      if (form.id) {
        await updateNonMedisService(form.id, {
          code: form.code.trim(),
          name: form.name.trim(),
          status: form.status,
        });
      } else {
        await createNonMedisService({
          code: form.code.trim(),
          name: form.name.trim(),
          class: "klinik",
          status: form.status,
        });
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteNonMedisService(deleteTarget.id);
      setDeleteTarget(null);
      // kalau baris terakhir di halaman ini dihapus, mundur 1 halaman
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Gagal menghapus data.");
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
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">
              <HeartHandshake className="h-3.5 w-3.5" />
              Klinik Non Medis
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Layanan Non Medis Klinik</h1>
            <p className="mt-1 text-sm text-slate-500">Kelola layanan non medis kategori klinik.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-violet-700 to-indigo-800 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Layanan
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
              placeholder="Cari kode atau nama layanan..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:border-violet-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | NonMedisStatus)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-xs text-slate-700 focus:border-violet-600 focus:bg-white focus:outline-none"
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
          <h2 className="text-base font-extrabold text-slate-900">Daftar Layanan</h2>
          <span className="text-xs font-semibold text-slate-400">{total} layanan</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat data layanan...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Belum ada layanan non medis klinik yang cocok dengan filter ini.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Nama Layanan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const statusLabel = getStatusLabel(item.status);
                    return (
                      <tr key={item.id} className="border-b border-slate-100 align-middle hover:bg-slate-50">
                        <td className="px-4 py-4 font-mono text-slate-600">{item.code}</td>
                        <td className="px-4 py-4 font-bold text-slate-900">{item.name}</td>
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
                          ? "bg-linear-to-r from-violet-700 to-indigo-800 text-white"
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
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                {form.id ? "Edit Layanan" : "Tambah Layanan"}
              </h3>
              <button onClick={closeModal} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Kode</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="mis. NM-KLN-001"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-violet-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Nama Layanan</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="mis. Konsultasi Gizi Klinik"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-violet-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NonMedisStatus }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-violet-600 focus:bg-white focus:outline-none"
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-violet-700 to-indigo-800 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm disabled:opacity-60"
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
            <h3 className="text-base font-extrabold text-slate-900">Hapus Layanan?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Layanan <span className="font-bold text-slate-700">{deleteTarget.name}</span> akan dihapus permanen.
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