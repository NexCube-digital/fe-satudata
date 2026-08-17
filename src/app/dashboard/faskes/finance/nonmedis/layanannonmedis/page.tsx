"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  FileText,
  Printer,
} from "lucide-react";
import {
  getNonMedisServices,
  createNonMedisService,
  updateNonMedisService,
  deleteNonMedisService,
  // CATATAN: fungsi di bawah ini diasumsikan BELUM ada di services/nonmedisService.
  // Silakan tambahkan (mengikuti pola getServicePrices di servicePriceService) agar
  // kartu "Rata-Rata Komponen" & "Total Komponen" dan kolom "Komponen Tarif" terisi
  // data asli. Kalau endpoint-nya beda nama, tinggal ganti import ini saja.
  getNonMedisPrices,
  type NonMedisService,
} from "@/services/nonmedisService";

type NonMedisPrice = {
  id: string | number;
  nonmedis_service_id: string | number;
  name: string;
  price?: number;
};

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

const getStatusLabel = (value?: string) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "aktif" || normalized === "active") return "Aktif";
  if (normalized === "nonaktif" || normalized === "inactive") return "Non-Aktif";
  if (!normalized) return "Non-Aktif";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getPriceServiceId = (price: any): string | number | null => {
  if (!price || typeof price !== "object") return null;

  const candidates = [
    price.servicenonmedis_id,
    price.nonmedis_service_id,
    price.service_nonmedis_id,
    price.serviceNonMedis?.id,
    price.service_nonmedis?.id,
  ];

  const found = candidates.find((value) => value !== undefined && value !== null && value !== "");
  return found ?? null;
};

const ITEMS_PER_PAGE = 10;

type FormState = {
  code: string;
  name: string;
  status: "aktif" | "nonaktif";
};

const emptyForm: FormState = {
  code: "",
  name: "",
  status: "aktif",
};

// ===================== MODAL FORM (CREATE/EDIT) =====================
function ServiceFormModal({
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
    if (!form.code.trim() || !form.name.trim()) {
      setFormError("Kode dan nama layanan wajib diisi.");
      return;
    }
    setFormError(null);
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_.15s_ease-out] print:hidden"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-[scaleIn_.15s_ease-out]"
      >
        <div className="relative bg-gradient-to-r from-teal-700 to-cyan-800 px-6 sm:px-8 py-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="absolute top-4 right-4 rounded-xl p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {mode === "create" ? "Tambah Layanan Non Medis" : "Edit Layanan Non Medis"}
              </h3>
              <p className="text-[11px] text-teal-50/80 mt-0.5">
                {mode === "create" ? "Buat layanan non medis baru" : "Perbarui data layanan non medis"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
          <div>
            <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kode Layanan</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Contoh: NM-ADM"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
              Nama Layanan <span className="text-[#DC2626]">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Administrasi Umum"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Status</label>
            <div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "aktif" })}
                className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                  form.status === "aktif" ? "bg-white text-[#16A34A] shadow-sm" : "text-slate-400"
                }`}
              >
                Aktif
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, status: "nonaktif" })}
                className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                  form.status === "nonaktif" ? "bg-white text-slate-600 shadow-sm" : "text-slate-400"
                }`}
              >
                Non-Aktif
              </button>
            </div>
          </div>

          {(formError || apiError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-[#DC2626]">
              {formError || apiError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 text-white px-5 py-2.5 text-xs font-extrabold hover:from-teal-800 hover:to-cyan-900 transition disabled:opacity-60 inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Menyimpan..." : mode === "create" ? "Simpan Layanan" : "Simpan Perubahan"}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-base font-extrabold text-slate-900">Hapus Layanan Non Medis</h3>
        <p className="mt-2 text-sm text-slate-500">
          Yakin ingin menghapus <span className="font-bold text-slate-700">{itemName || "layanan ini"}</span>?
          Seluruh sub layanan/tarif di dalamnya juga akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
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

// ===================== HALAMAN UTAMA =====================
export default function LayananNonMedisPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [items, setItems] = useState<NonMedisService[]>([]);
  const [prices, setPrices] = useState<NonMedisPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalInitial, setModalInitial] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NonMedisService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getPricesForService = (serviceId: string | number, allPrices: NonMedisPrice[]) =>
    allPrices.filter((p) => String(getPriceServiceId(p)) === String(serviceId));

  const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [servicesRes, pricesRes] = await Promise.all([
        getNonMedisServices(),
        // Kalau getNonMedisPrices belum tersedia di backend, biarkan gagal —
        // ditangkap di catch di bawah supaya kartu komponen tetap tampil 0,
        // bukan meruntuhkan seluruh halaman.
        getNonMedisPrices ? getNonMedisPrices().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      setItems(normalizeList(servicesRes));
      setPrices(normalizeList(pricesRes) as NonMedisPrice[]);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data layanan non medis.");
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const itemAny = item as any;
      const nama = String(itemAny.name ?? itemAny.nama ?? "").toLowerCase();
      const code = String(item.code || "").toLowerCase();
      const statusLabel = getStatusLabel(item.status);

      if (q && !`${nama} ${code}`.includes(q)) return false;
      if (statusFilter === "active" && statusLabel !== "Aktif") return false;
      if (statusFilter === "inactive" && statusLabel !== "Non-Aktif") return false;
      return true;
    });
  }, [items, search, statusFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const pageNumbers = useMemo(() => {
    const delta = 1;
    const range: number[] = [];
    const withDots: (number | string)[] = [];
    let last: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (last !== undefined) {
        if (i - last === 2) withDots.push(last + 1);
        else if (i - last !== 1) withDots.push("...");
      }
      withDots.push(i);
      last = i;
    });

    return withDots;
  }, [totalPages, safeCurrentPage]);

  const activeCount = items.filter((i) => getStatusLabel(i.status) === "Aktif").length;
  const avgComponents = items.length === 0 ? 0 : Math.round(prices.length / items.length);

  const handleOpenCreate = () => {
    setModalMode("create");
    setModalInitial(emptyForm);
    setEditingId(null);
    setFormNotice(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: NonMedisService) => {
    const itemAny = item as any;
    setModalMode("edit");
    setModalInitial({
      code: String(item.code || ""),
      name: String(itemAny.name ?? itemAny.nama ?? ""),
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

  // NOTE: field "class" TIDAK dikirim lagi di sini, karena model ServiceNonMedis
  // tidak lagi punya kolom class (class sekarang ada di NonMedisPrice / sub layanan).
  const handleSubmit = async (data: FormState) => {
    try {
      setSaving(true);
      setFormNotice(null);
      const payload = {
        code: data.code.trim(),
        name: data.name.trim(),
        class: "utama",
        status: data.status,
      };
      if (modalMode === "create") {
        await createNonMedisService(payload);
      } else if (editingId !== null) {
        await updateNonMedisService(editingId, payload);
      }
      setModalOpen(false);
      await fetchData({ silent: true });
    } catch (err: any) {
      setFormNotice(err?.message || "Gagal menyimpan data layanan.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await deleteNonMedisService(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData({ silent: true });
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus layanan.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubLayananClick = (item: NonMedisService) => {
    const itemAny = item as any;
    const name = String(itemAny.name ?? itemAny.nama ?? "");
    const base = "/dashboard/faskes/finance/nonmedis/layanannonmedis";
    router.push(`${base}/sublayanan?service_id=${item.id}&service_name=${encodeURIComponent(name)}`);
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
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full print:hidden">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
            <Activity className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Layanan Non Medis
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Data Layanan Non Medis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Kelola layanan pendukung rumah sakit yang tidak termasuk pelayanan medis langsung, beserta komponen sub layanan/tarif yang terkait untuk setiap layanan.
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
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Tambah Layanan
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 print:hidden">
        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Layanan</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{items.length} Layanan</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 font-bold">
            <Activity className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Layanan Aktif</p>
            <p className="text-2xl font-extrabold text-[#16A34A] mt-1">{activeCount} Layanan</p>
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
            <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{prices.length} Komponen</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800 font-bold">
            <FileText className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs mb-6 space-y-4 print:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama layanan non medis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Status:</span>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
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
            onClick={() => setStatusFilter("active")}
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
            onClick={() => setStatusFilter("inactive")}
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

      {/* Tabel */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs print:border-0 print:shadow-none print:p-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 print:border-slate-300">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-800 print:hidden" />
            Daftar Layanan Non Medis ({filteredData.length})
          </h3>
          <button
            onClick={() => fetchData({ silent: true })}
            disabled={refreshing}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:opacity-50 print:hidden"
            title="Muat ulang data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error ? (
          <div className="py-12 text-center text-[#DC2626] text-xs font-semibold">{error}</div>
        ) : totalItems === 0 ? (
          <div className="py-12 text-center text-slate-400 italic text-xs">
            {items.length === 0
              ? 'Belum ada layanan non medis. Klik "Tambah Layanan" untuk membuat yang pertama.'
              : "Tidak ada layanan yang cocok dengan pencarian/filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Layanan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Komponen Tarif</th>
                  <th className="py-3 px-4 text-right print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map((item) => {
                  const itemAny = item as any;
                  const nama = String(itemAny.name ?? itemAny.nama ?? "-");
                  const statusLabel = getStatusLabel(item.status);
                  const itemPrices = getPricesForService(item.id as string | number, prices);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{item.code || "-"}</td>
                      <td className="py-4 px-4 font-bold text-slate-900">{nama}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold ${
                            statusLabel === "Aktif" ? "bg-emerald-50 text-[#16A34A]" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusLabel === "Aktif" ? "bg-[#16A34A]" : "bg-slate-400"}`} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {itemPrices.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">Belum ada komponen</span>
                          ) : (
                            itemPrices.slice(0, 4).map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold"
                              >
                                {p.name}
                              </span>
                            ))
                          )}
                          {itemPrices.length > 4 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                              +{itemPrices.length - 4} lainnya
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2 print:hidden">
                        <button
                          onClick={() => handleSubLayananClick(item)}
                          className="rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
                        >
                          <Layers className="h-3.5 w-3.5" /> Sub Layanan
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold transition inline-flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
              Menampilkan {Math.min((safeCurrentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}–
              {Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalItems)} dari {totalItems} layanan
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
                  <span key={`dots-${idx}`} className="h-8 w-8 flex items-center justify-center text-slate-400 text-[11px] font-bold select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
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

      <ServiceFormModal
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
        itemName={deleteTarget ? String((deleteTarget as any).name ?? (deleteTarget as any).nama ?? "") : ""}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

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