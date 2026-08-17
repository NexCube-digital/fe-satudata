"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  DollarSign,
  Layers,
  Info,
  Printer,
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

const getClassLabel = (value?: string) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "utama") return "Utama";
  if (normalized === "klinik") return "Klinik";
  return value || "-";
};

const formatRupiah = (value?: number | string) => {
  const num = Number(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
};

// ===================== MAPPING KATEGORI PER JENIS LAYANAN =====================
// Key = code ServiceNonMedis (lihat servicenonmedisSeeder.js).
// Array kosong = "non category" -> kategori dibiarkan bebas diketik / boleh kosong.
const CATEGORY_OPTIONS_BY_SERVICE_CODE: Record<string, string[]> = {
  "NM-AMB": [
    "Ambulance dalam kota",
    "Mobil jenazah dalam kota",
    "Ambulance luar kota",
    "Mobil jenazah luar kota",
  ],
  "NM-PRL": [
    "Elektronik",
    "Peralatan khusus",
    "Akomodasi fasilitas",
    "Alat kesehatan",
    "Lainnya",
  ],
  "NM-LHN": ["Ruangan", "Bangunan/tempat usaha", "Sarana", "Lainnya"],
  "NM-BKP": [
    "Pendidikan",
    "PKL",
    "Praktikum",
    "Praktikum di lab",
    "Ujian praktik",
    "Co-ass",
    "Bimbingan",
    "Pelatihan",
    "Magang",
    "Kunjungan/observasi",
    "Studi banding",
    "Kredensial",
    "Lainnya",
  ],
  "NM-LIT": ["Penelitian", "Etik penelitian"],
  "NM-CSSD": [], // non category
  "NM-LDR": ["Jasa boga (catering)", "Binatu (laundry)", "Lainnya"],
  "NM-BKS": [], // non category
};

const ITEMS_PER_PAGE = 10;

type FormState = {
  kptl: string;
  name: string;
  category: string;
  class: "utama" | "klinik";
  price: string;
  status: "aktif" | "nonaktif";
};

const emptyForm: FormState = {
  kptl: "",
  name: "",
  category: "",
  class: "utama",
  price: "",
  status: "aktif",
};

function getPaginationRange(current: number, total: number): (number | "...")[] {
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

// Label filter aktif dipakai di badge layar & header cetak PDF
function buildActiveFilterLabels(params: {
  searchTerm: string;
  categoryFilter: string;
  classFilter: "all" | "utama" | "klinik";
  statusFilter: "all" | "active" | "inactive";
}): string[] {
  const labels: string[] = [];
  if (params.searchTerm.trim()) labels.push(`Pencarian: "${params.searchTerm.trim()}"`);
  if (params.categoryFilter !== "all") labels.push(`Kategori: ${params.categoryFilter}`);
  if (params.classFilter !== "all") labels.push(`Kelas: ${getClassLabel(params.classFilter)}`);
  if (params.statusFilter !== "all") labels.push(`Status: ${params.statusFilter === "active" ? "Aktif" : "Non-Aktif"}`);
  return labels;
}

// ===================== COMBOBOX KATEGORI (BISA DIKETIK / DIPILIH) =====================
function CategoryCombobox({
  value,
  onChange,
  options,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val); // tetap terima input bebas, kategori tidak wajib cocok dengan daftar
    setOpen(true);
  };

  const handleSelect = (opt: string) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={options.length ? "Ketik atau pilih kategori (opsional)..." : "Kategori (opsional)"}
        className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium focus:outline-hidden transition ${
          hasError
            ? "border-red-300 bg-red-50/40 focus:border-red-500"
            : "border-teal-200 bg-white focus:border-teal-600"
        }`}
      />
      {open && options.length > 0 && filteredOptions.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          {filteredOptions.map((opt) => (
            <button
              type="button"
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(opt)}
              className="block w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-teal-50"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== KONTEN HALAMAN (butuh useSearchParams) =====================
function SubLayananNonMedisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceId = searchParams.get("service_id") || "";
  const serviceNameParam = searchParams.get("service_name") || "";

  const [serviceDetail, setServiceDetail] = useState<NonMedisService | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<NonMedisPrice[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [classFilter, setClassFilter] = useState<"all" | "utama" | "klinik">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(ITEMS_PER_PAGE);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<NonMedisPrice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<NonMedisPrice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [printedAt, setPrintedAt] = useState("");

  const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!serviceId) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [priceResponse, serviceResponse] = await Promise.all([
        getNonMedisPricesByService(serviceId),
        // Data detail service dipakai untuk header (code) & untuk menentukan
        // daftar kategori yang relevan, tidak wajib berhasil
        getNonMedisServiceById(serviceId).catch(() => null),
      ]);
      setItems(normalizeList(priceResponse));
      if (serviceResponse) setServiceDetail(normalizeItem(serviceResponse));
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data sub layanan.");
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, classFilter, statusFilter]);

  // Daftar kategori mengikuti kode service non medis saat ini.
  // Kalau kode tidak dikenali / belum ada mapping -> daftar kosong,
  // artinya kategori bebas diketik (tidak ada saran/opsi).
  const serviceDetailAny = serviceDetail as any;
  const displayName = String(serviceDetailAny?.name ?? serviceDetailAny?.nama ?? (serviceNameParam || "-"));
  const displayCode = String(serviceDetailAny?.code || "-");

  const categoryOptions = useMemo(() => {
    const code = String(serviceDetailAny?.code || "").toUpperCase();
    return CATEGORY_OPTIONS_BY_SERVICE_CODE[code] || [];
  }, [serviceDetailAny?.code]);
  const categoryMode: "free" | "none" | "select" =
    categoryOptions.length === 0 && !CATEGORY_OPTIONS_BY_SERVICE_CODE.hasOwnProperty(String(serviceDetailAny?.code || "").toUpperCase())
      ? "free"
      : categoryOptions.length === 0
      ? "none"
      : "select";

  const usedCategories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)));
    return Array.from(set).sort();
  }, [items]);

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const itemAny = item as any;
      const nama = String(itemAny.name ?? itemAny.nama ?? "").toLowerCase();
      const kptl = String(item.kptl || "").toLowerCase();
      const category = String(item.category || "").toLowerCase();
      const classLabel = getClassLabel(itemAny.class ?? itemAny.kelas);
      const statusLabel = getStatusLabel(item.status);

      if (q && !`${nama} ${kptl} ${category}`.includes(q)) return false;
      if (categoryFilter !== "all" && (item.category || "") !== categoryFilter) return false;
      if (classFilter !== "all" && classLabel !== getClassLabel(classFilter)) return false;
      if (statusFilter === "active" && statusLabel !== "Aktif") return false;
      if (statusFilter === "inactive" && statusLabel !== "Non-Aktif") return false;
      return true;
    });
  }, [items, searchTerm, categoryFilter, classFilter, statusFilter]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safeCurrentPage - 1) * perPage, safeCurrentPage * perPage);
  const paginationRange = useMemo(() => getPaginationRange(safeCurrentPage, totalPages), [safeCurrentPage, totalPages]);

  const activeCount = items.filter((i) => getStatusLabel(i.status) === "Aktif").length;
  const averagePrice = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, cur) => acc + (Number((cur as any).price ?? (cur as any).harga) || 0), 0);
    return Math.round(sum / items.length);
  }, [items]);

  // Rata-rata tarif khusus untuk data yang sedang tampil/tercetak (mengikuti filter aktif)
  const filteredAveragePrice = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, cur) => acc + (Number((cur as any).price ?? (cur as any).harga) || 0), 0);
    return Math.round(sum / filteredData.length);
  }, [filteredData]);

  const activeFilterLabels = useMemo(
    () => buildActiveFilterLabels({ searchTerm, categoryFilter, classFilter, statusFilter }),
    [searchTerm, categoryFilter, classFilter, statusFilter]
  );

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setClassFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handlePrint = () => {
    setPrintedAt(new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }));
    // Beri waktu 1 tick agar state printedAt sempat ter-render sebelum dialog print muncul
    setTimeout(() => window.print(), 50);
  };

  const openAdd = () => {
    setModalMode("create");
    setEditing(null);
    setForm({ ...emptyForm, category: categoryMode === "select" ? categoryOptions[0] : "" });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (item: NonMedisPrice) => {
    const itemAny = item as any;
    setModalMode("edit");
    setEditing(item);
    setForm({
      kptl: String(item.kptl || ""),
      name: String(itemAny.name ?? itemAny.nama ?? ""),
      category: String(item.category || ""),
      class: (String(itemAny.class ?? itemAny.kelas ?? "utama").toLowerCase() === "klinik" ? "klinik" : "utama") as FormState["class"],
      price: String(item.price ?? itemAny.harga ?? ""),
      status: (String(item.status || "aktif").toLowerCase() === "nonaktif" ? "nonaktif" : "aktif") as FormState["status"],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  const validateForm = () => {
    const errors: Record<string, string | undefined> = {};
    if (!form.name.trim()) errors.name = "Nama sub layanan wajib diisi.";
    if (form.price.trim() === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = "Harga harus berupa angka dan tidak boleh negatif.";
    }
    if (categoryMode === "select" && !form.category.trim()) {
      errors.category = "Kategori wajib dipilih.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e && e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const trimmedCategory = form.category.trim();
      const payload = {
        servicenonmedis_id: serviceId,
        kptl: form.kptl.trim() || null,
        name: form.name.trim(),
        category: categoryMode === "none" ? null : trimmedCategory || null, // kategori opsional -> null kalau kosong
        class: form.class,
        price: Number(form.price),
        status: form.status,
      };
      if (modalMode === "create") {
        await createNonMedisPrice(payload);
      } else if (editing?.id !== undefined) {
        await updateNonMedisPrice(editing.id, payload);
      }
      setIsModalOpen(false);
      await fetchData({ silent: true });
    } catch (err: any) {
      setFormErrors((prev) => ({ ...prev, _api: err?.message || "Gagal menyimpan sub layanan." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await deleteNonMedisPrice(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData({ silent: true });
    } catch (err: any) {
      setError(err?.message || "Gagal menghapus sub layanan.");
    } finally {
      setDeleting(false);
    }
  };

  const parentRoute = "/dashboard/faskes/finance/nonmedis/layanannonmedis";

  if (!serviceId) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-[#DC2626]">
        Service non medis tidak ditemukan pada URL. Kembali ke halaman{" "}
        <button className="font-bold underline" onClick={() => router.push(parentRoute)}>
          Layanan Non Medis
        </button>{" "}
        dan klik tombol Sub Layanan pada baris yang diinginkan.
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
              onClick={() => router.push(parentRoute)}
              className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800 font-bold text-sm mb-3 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Layanan Non Medis
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
              <Tag className="h-3.5 w-3.5" /> {displayCode} • Sub Layanan
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sub Layanan: {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kelola sub layanan/tarif yang tersedia di bawah layanan non medis <span className="font-bold">{displayName}</span>.
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
              Layanan ini memakai kategori: <strong>{categoryOptions.join(", ")}</strong>. Pilih salah satu saat menambah sub layanan.
            </span>
          </div>
        )}
        {categoryMode === "none" && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Layanan ini tidak memakai kategori sub layanan.</span>
          </div>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sub Layanan</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{items.length} Item</p>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
              />
            </div>

            {categoryMode !== "none" && (
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Non-Aktif</option>
              </select>
            </div>

            <div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
              {(["all", "utama", "klinik"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setClassFilter(opt)}
                  className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                    classFilter === opt ? "bg-white text-teal-800 shadow-sm" : "text-slate-400"
                  }`}
                >
                  {opt === "all" ? "Semua" : getClassLabel(opt)}
                </button>
              ))}
            </div>
          </div>

          {(searchTerm || categoryFilter !== "all" || classFilter !== "all" || statusFilter !== "all") && (
            <div className="flex justify-end">
              <button onClick={resetFilters} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition">
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
              Daftar Sub Layanan ({filteredData.length})
            </h3>
            <button
              onClick={() => fetchData({ silent: true })}
              disabled={refreshing}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
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
                ? 'Belum ada sub layanan untuk layanan ini. Klik "Tambah Sub Layanan" untuk membuat yang pertama.'
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
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4 text-right">Tarif (Rp)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedData.map((item) => {
                    const itemAny = item as any;
                    const statusLabel = getStatusLabel(item.status);
                    const classLabel = getClassLabel(itemAny.class ?? itemAny.kelas);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{item.kptl || "-"}</td>
                        <td className="py-4 px-4 font-bold text-slate-900">{itemAny.name ?? itemAny.nama ?? "-"}</td>
                        {categoryMode !== "none" && (
                          <td className="py-4 px-4">
                            {item.category ? (
                              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold border bg-slate-100 border-slate-200 text-slate-700">
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">-</span>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-4">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                              classLabel === "Klinik"
                                ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                                : "bg-teal-50 text-teal-800 border-teal-200"
                            }`}
                          >
                            {classLabel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                          {formatRupiah(item.price ?? itemAny.harga)}
                        </td>
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
                        <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 font-bold inline-flex items-center gap-2 transition"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold transition inline-flex items-center"
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
                {paginationRange.map((p, idx) =>
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
                      {modalMode === "create" ? "Tambah Sub Layanan" : "Edit Sub Layanan"}
                    </h3>
                    <p className="text-[11px] text-teal-50/80 mt-0.5">
                      {modalMode === "create" ? `Untuk layanan "${displayName}"` : `Perbarui data untuk "${editing?.name ?? (editing as any)?.nama}"`}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4 overflow-y-auto">
                {categoryMode !== "none" && (
                  <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-2">
                    <label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                      Kategori Sub Layanan {categoryMode === "select" && <span className="text-[#DC2626]">*</span>}
                    </label>
                    <CategoryCombobox
                      value={form.category}
                      onChange={(val) => {
                        setForm({ ...form, category: val });
                        if (formErrors.category) setFormErrors({ ...formErrors, category: undefined });
                      }}
                      options={categoryOptions}
                      hasError={!!formErrors.category}
                    />
                    {formErrors.category && <p className="text-[10px] text-[#DC2626] font-semibold">{formErrors.category}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kode KPTL</label>
                    <input
                      value={form.kptl}
                      onChange={(e) => setForm({ ...form, kptl: e.target.value })}
                      placeholder="Contoh: ADM-001"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kelas</label>
                    <div className="flex rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, class: "utama" })}
                        className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                          form.class === "utama" ? "bg-white text-teal-800 shadow-sm" : "text-slate-400"
                        }`}
                      >
                        Utama
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, class: "klinik" })}
                        className={`flex-1 rounded-xl py-1.5 text-[11px] font-bold transition ${
                          form.class === "klinik" ? "bg-white text-cyan-800 shadow-sm" : "text-slate-400"
                        }`}
                      >
                        Klinik
                      </button>
                    </div>
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
                    placeholder="Contoh: Ambulance dalam kota"
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
                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                      Harga (Rp) <span className="text-[#DC2626]">*</span>
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
                          if (formErrors.price) setFormErrors({ ...formErrors, price: undefined });
                        }}
                        placeholder="0"
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
                </div>

                {formErrors._api && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-[#DC2626]">
                    {formErrors._api}
                  </div>
                )}

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
                    {submitting ? "Menyimpan..." : modalMode === "create" ? "Simpan Sub Layanan" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-base font-extrabold text-slate-900">Hapus Sub Layanan</h3>
              <p className="mt-2 text-sm text-slate-500">
                Yakin ingin menghapus{" "}
                <span className="font-bold text-slate-700">
                  {(deleteTarget as any).name ?? (deleteTarget as any).nama ?? "sub layanan ini"}
                </span>
                ? Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== TAMPILAN CETAK PDF (hanya muncul saat print) ==================== */}
      <div className="hidden print:block text-slate-900">
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-4">
          <div>
            <h1 className="text-lg font-extrabold">Daftar Tarif Sub Layanan Non Medis</h1>
            <p className="text-sm font-bold mt-0.5">
              Layanan: {displayName} {displayCode !== "-" && `(${displayCode})`}
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <p>RSP Rotinsulu</p>
            {printedAt && <p>Dicetak: {printedAt}</p>}
          </div>
        </div>

        {activeFilterLabels.length > 0 && (
          <p className="text-[11px] text-slate-600 mb-3">Filter aktif: {activeFilterLabels.join(" · ")}</p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4 text-[11px]">
          <div className="border border-slate-300 rounded p-2">
            <p className="text-slate-500">Jumlah Sub Layanan</p>
            <p className="font-extrabold text-sm">{filteredData.length} Item</p>
          </div>
          <div className="border border-slate-300 rounded p-2">
            <p className="text-slate-500">Sub Layanan Aktif</p>
            <p className="font-extrabold text-sm">
              {filteredData.filter((i) => getStatusLabel(i.status) === "Aktif").length} Item
            </p>
          </div>
          <div className="border border-slate-300 rounded p-2">
            <p className="text-slate-500">Rata-Rata Tarif</p>
            <p className="font-extrabold text-sm">{formatRupiah(filteredAveragePrice)}</p>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <p className="text-xs italic text-slate-500">Tidak ada data sub layanan untuk dicetak.</p>
        ) : (
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 text-left uppercase font-bold">
                <th className="py-1.5 pr-2">KPTL</th>
                <th className="py-1.5 pr-2">Nama Sub Layanan</th>
                {categoryMode !== "none" && <th className="py-1.5 pr-2">Kategori</th>}
                <th className="py-1.5 pr-2">Kelas</th>
                <th className="py-1.5 pr-2 text-right">Tarif (Rp)</th>
                <th className="py-1.5 pl-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const itemAny = item as any;
                return (
                  <tr key={`print-${item.id}`} className="border-b border-slate-200 break-inside-avoid">
                    <td className="py-1.5 pr-2 font-mono">{item.kptl || "-"}</td>
                    <td className="py-1.5 pr-2 font-bold">{itemAny.name ?? itemAny.nama ?? "-"}</td>
                    {categoryMode !== "none" && <td className="py-1.5 pr-2">{item.category || "-"}</td>}
                    <td className="py-1.5 pr-2">{getClassLabel(itemAny.class ?? itemAny.kelas)}</td>
                    <td className="py-1.5 pr-2 text-right font-mono font-bold">{formatRupiah(item.price ?? itemAny.harga)}</td>
                    <td className="py-1.5 pl-2">{getStatusLabel(item.status)}</td>
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

// useSearchParams wajib dibungkus Suspense di Next.js App Router agar tidak error saat build
export default function SubLayananNonMedisPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Memuat halaman...</div>}>
      <SubLayananNonMedisContent />
    </Suspense>
  );
}