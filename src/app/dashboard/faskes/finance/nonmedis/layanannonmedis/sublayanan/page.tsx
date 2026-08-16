"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getNonMedisPricesByService,
  createNonMedisPrice,
  updateNonMedisPrice,
  deleteNonMedisPrice,
  getNonMedisServiceById,
  type NonMedisPrice,
  type NonMedisService,
} from "@/services/nonmedisService";

const normalizeList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;

  if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    if (Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data.items)) return response.data.items;
  }

  return [];
};

const normalizeItem = (response: any): any => {
  if (!response) return null;
  if (response.data && typeof response.data === "object") return response.data;
  return response;
};

const getStatusLabel = (value?: string) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "aktif" || normalized === "active") return "Aktif";
  if (normalized === "nonaktif" || normalized === "inactive") return "Non-Aktif";
  if (!normalized) return "Non-Aktif";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatRupiah = (value?: number | string) => {
  const num = Number(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
};

const statusOptions = ["Semua", "Aktif", "Non-Aktif"];
const ITEMS_PER_PAGE = 10;

type FormState = {
  kptl: string;
  name: string;
  category: string;
  price: string;
  status: "aktif" | "nonaktif";
};

const emptyForm: FormState = {
  kptl: "",
  name: "",
  category: "",
  price: "",
  status: "aktif",
};

// ===================== MODAL FORM (CREATE/EDIT) =====================
function PriceFormModal({
  open,
  mode,
  initialData,
  saving,
  apiError,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  initialData: FormState;
  saving: boolean;
  apiError?: string | null;
  onClose: () => void;
  onSubmit: (data: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(initialData);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialData);
    setFormError(null);
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price.trim() === "") {
      setFormError("Nama sub layanan dan harga wajib diisi.");
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError("Harga harus berupa angka dan tidak boleh negatif.");
      return;
    }
    setFormError(null);
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            {mode === "create" ? "Tambah Sub Layanan" : "Edit Sub Layanan"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Nama Sub Layanan</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contoh: Surat Keterangan Sehat"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Kode (KPTL)</label>
              <input
                value={form.kptl}
                onChange={(e) => setForm({ ...form, kptl: e.target.value })}
                placeholder="contoh: ADM-001"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Kategori</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="contoh: administrasi"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Harga (Rp)</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          {(formError || apiError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError || apiError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-700 to-teal-800 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {mode === "create" ? "Simpan Sub Layanan" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== MODAL KONFIRMASI HAPUS =====================
function ConfirmDeleteModal({
  open,
  itemName,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  itemName?: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-base font-extrabold text-slate-900">Hapus Sub Layanan</h3>
        <p className="mt-2 text-sm text-slate-500">
          Yakin ingin menghapus <span className="font-bold text-slate-700">{itemName || "sub layanan ini"}</span>?
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== PAGINATION =====================
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-5 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-slate-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[2.25rem] rounded-xl px-2.5 py-2 text-xs font-bold ${
              page === currentPage
                ? "bg-linear-to-r from-cyan-700 to-teal-800 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ===================== KONTEN HALAMAN (butuh useSearchParams) =====================
function SubLayananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get("service_id") || "";
  const serviceNameParam = searchParams.get("service_name") || "";

  const [serviceDetail, setServiceDetail] = useState<NonMedisService | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [items, setItems] = useState<NonMedisPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalInitial, setModalInitial] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NonMedisPrice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    if (!serviceId) return;
    try {
      setLoading(true);
      const [priceResponse, serviceResponse] = await Promise.all([
        getNonMedisPricesByService(serviceId),
        // Data detail service dipakai untuk header (code & class), tidak wajib berhasil
        getNonMedisServiceById(serviceId).catch(() => null),
      ]);
      setItems(normalizeList(priceResponse));
      if (serviceResponse) setServiceDetail(normalizeItem(serviceResponse));
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data sub layanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();

    return items.filter((item) => {
      const nama = String(item.name || item.nama || "").toLowerCase();
      const kptl = String(item.kptl || "").toLowerCase();
      const category = String(item.category || "").toLowerCase();
      const statusLabel = getStatusLabel(item.status);

      const matchSearch = nama.includes(q) || kptl.includes(q) || category.includes(q);
      const matchStatus = status === "Semua" || statusLabel === status;
      return matchSearch && matchStatus;
    });
  }, [items, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setModalInitial(emptyForm);
    setEditingId(null);
    setFormNotice(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: NonMedisPrice) => {
    setModalMode("edit");
    setModalInitial({
      kptl: String(item.kptl || ""),
      name: String(item.name || item.nama || ""),
      category: String(item.category || ""),
      price: String(item.price ?? item.harga ?? ""),
      status: (String(item.status || "aktif").toLowerCase() === "nonaktif" ? "nonaktif" : "aktif") as FormState["status"],
    });
    setEditingId(item.id ?? null);
    setFormNotice(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSubmit = async (data: FormState) => {
    try {
      setSaving(true);
      setFormNotice(null);
      const payload = {
        servicenonmedis_id: serviceId,
        kptl: data.kptl || null,
        name: data.name,
        category: data.category || null,
        price: Number(data.price),
        status: data.status,
      };
      if (modalMode === "create") {
        await createNonMedisPrice(payload);
      } else if (editingId !== null) {
        await updateNonMedisPrice(editingId, payload);
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormNotice(err?.message || "Gagal menyimpan sub layanan.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await deleteNonMedisPrice(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus sub layanan.");
    } finally {
      setDeleting(false);
    }
  };

  const displayName = String(serviceDetail?.name || serviceDetail?.nama || serviceNameParam || "-");
  const displayCode = String(serviceDetail?.code || "-");
  const displayClass = String(serviceDetail?.class || serviceDetail?.kelas || "-");

  if (!serviceId) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Service non medis tidak ditemukan pada URL. Kembali ke halaman{" "}
        <button className="font-bold underline" onClick={() => router.push("/layanan-non-medis")}>
          Layanan Non Medis
        </button>{" "}
        dan klik tombol Sub Layanan pada baris yang diinginkan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          onClick={() => router.push("/layanan-non-medis")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Layanan Non Medis
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">
              <Tag className="h-3.5 w-3.5" />
              {displayCode} &middot; {displayClass}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Sub Layanan: {displayName}</h1>
            <p className="mt-1 text-sm text-slate-500">Daftar sub layanan/tarif yang tersedia di bawah layanan ini.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-700 to-teal-800 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" /> Tambah Sub Layanan
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.5fr_0.8fr]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, nama, atau kategori..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-xs text-slate-700 focus:border-cyan-600 focus:bg-white focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Daftar Sub Layanan</h2>
          <button className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Memuat data sub layanan...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Kode (KPTL)</th>
                    <th className="px-4 py-3">Nama Sub Layanan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Harga</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => {
                    const statusLabel = getStatusLabel(item.status);
                    return (
                      <tr key={item.id} className="border-b border-slate-100 align-middle hover:bg-slate-50">
                        <td className="px-4 py-4 font-mono text-slate-500">{item.kptl || "-"}</td>
                        <td className="px-4 py-4 font-bold text-slate-900">{item.name || item.nama || "-"}</td>
                        <td className="px-4 py-4 text-slate-600">{item.category || "-"}</td>
                        <td className="px-4 py-4 font-bold text-slate-700">{formatRupiah(item.price ?? item.harga)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            statusLabel === "Aktif"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
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

            {filteredData.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Belum ada sub layanan untuk layanan ini.
              </div>
            ) : (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>

      <PriceFormModal
        open={modalOpen}
        mode={modalMode}
        initialData={modalInitial}
        saving={saving}
        apiError={formNotice}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        itemName={deleteTarget ? String(deleteTarget.name || deleteTarget.nama || "") : ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// useSearchParams wajib dibungkus Suspense di Next.js App Router agar tidak error saat build
export default function SubLayananPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Memuat halaman...</div>}>
      <SubLayananContent />
    </Suspense>
  );
}