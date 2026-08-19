"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Wallet,
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
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Info,
  Download,
} from "lucide-react";
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

const getClassLabel = (value?: string) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "utama") return "Utama";
  if (normalized === "klinik") return "Klinik";
  return value || "-";
};

const CLASS_LABEL: Record<string, string> = { utama: "Utama", klinik: "Klinik" };
const CLASS_BADGE: Record<string, string> = {
  utama: "bg-teal-50 text-teal-800 border-teal-200",
  klinik: "bg-cyan-50 text-cyan-800 border-cyan-200",
};

const formatRupiah = (value?: number | string) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);

const PER_PAGE = 10;

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

// Saran umum satuan tarif. Field ini tetap bebas diketik (tidak wajib cocok
// dengan daftar), daftar ini hanya membantu supaya penulisan lebih konsisten.
const SATUAN_SUGGESTIONS: string[] = [
  "Per Hari",
  "Per Kunjungan",
  "Per Jam",
  "Per Bulan",
  "Per Kali",
  "Per Unit",
  "Per Paket",
  "Per Orang",
  "Per Tindakan",
  "Per Kilometer",
];

type FormState = {
  id: number | null;
  servicenonmedis_id: string;
  name: string;
  category: string;
  kptl: string; // kode internal tarif (mis. ADM-001)
  satuan: string; // satuan tarif (mis. per hari, per kunjungan)
  class: "utama" | "klinik";
  price: string;
  status: NonMedisStatus;
};

const emptyForm: FormState = {
  id: null,
  servicenonmedis_id: "",
  name: "",
  category: "",
  kptl: "",
  satuan: "",
  class: "utama",
  price: "",
  status: "aktif",
};

// ===================== COMBOBOX BEBAS KETIK (KATEGORI / SATUAN) =====================
// Bisa diketik bebas ATAU dipilih dari daftar saran. Dipakai untuk field
// yang nilainya tidak wajib persis sama dengan daftar (kategori & satuan).
function FreeTextCombobox({
  value,
  onChange,
  options,
  placeholder,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
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
    onChange(val); // tetap terima input bebas, tidak wajib cocok dengan daftar
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
        placeholder={placeholder || (options.length ? "Ketik atau pilih (opsional)..." : "Opsional")}
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

// ===================== DROPDOWN PILIHAN DENGAN PENCARIAN =====================
// Untuk memilih 1 nilai dari daftar tetap (bukan bebas ketik), dengan kotak
// pencarian di dalamnya supaya nyaman dipakai walau daftarnya panjang
// (dipakai untuk memilih Layanan Non Medis, yang bisa berjumlah banyak).
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  hasError,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-medium text-left transition focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
          hasError ? "border-red-300 bg-red-50/40" : "border-slate-200 bg-slate-50/50 hover:bg-white"
        } ${open ? "border-teal-600 bg-white ring-2 ring-teal-100" : ""}`}
      >
        <span className={`truncate ${selectedLabel ? "text-slate-700" : "text-slate-400"}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari layanan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-[11px] italic text-slate-400">Tidak ditemukan.</p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-xs transition ${
                      opt.value === value ? "bg-teal-50 font-bold text-teal-800" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TarifLayananNonMedisPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prices, setPrices] = useState<NonMedisPrice[]>([]);
  const [services, setServices] = useState<NonMedisService[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NonMedisStatus>("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [classFilter, setClassFilter] = useState<"all" | "utama" | "klinik">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState<{ show: boolean; type?: "success" | "error"; message?: string }>({ show: false });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NonMedisPrice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<NonMedisPrice | null>(null);
  const [deleting, setDeleting] = useState(false);

  // NOTE: berbeda dari versi lama yang paginasi di server (page/limit ke API),
  // di sini SEMUA data tarif diambil sekaligus (limit besar) lalu difilter &
  // dipaginasi di client — supaya kartu ringkasan (Total/Aktif/Rata-Rata) dan
  // filter kelas bergaya tombol bisa konsisten dengan Master Data Tarif Layanan
  // Medis. Kalau jumlah tarif non medis sudah sangat banyak, sebaiknya ganti
  // balik ke paginasi server + endpoint agregat terpisah untuk kartu ringkasan.
  const loadData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const [priceRes, serviceRes] = await Promise.all([
        nonmedisService.getNonMedisPrices({ limit: 1000 }),
        nonmedisService.getNonMedisServices({ limit: 500 }),
      ]);
      setPrices(priceRes?.data ?? []);
      setServices(serviceRes?.data ?? []);
      setError(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Gagal memuat data tarif layanan non medis.";
      setError(message);
      setToast({ show: true, type: "error", message });
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const serviceMap = useMemo(() => {
    const map: Record<string, NonMedisService> = {};
    services.forEach((s) => (map[String(s.id)] = s));
    return map;
  }, [services]);

  const serviceSelectOptions = useMemo(
    () =>
      services.map((s) => ({
        value: String(s.id),
        label: (s as any).code ? `${(s as any).code} — ${s.name}` : s.name,
      })),
    [services]
  );

  const serviceFilterOptions = useMemo(
    () => [{ value: "all", label: "Semua Layanan" }, ...serviceSelectOptions],
    [serviceSelectOptions]
  );

  // Daftar satuan yang sudah pernah dipakai, digabung dengan saran umum,
  // supaya kombinasi input bebas ketik tetap punya saran relevan.
  const satuanSuggestions = useMemo(() => {
    const used = prices.map((p) => String((p as any).satuan || "")).filter(Boolean);
    return Array.from(new Set([...used, ...SATUAN_SUGGESTIONS]));
  }, [prices]);

  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      const itemAny = item as any;
      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const layananName = itemAny.serviceNonMedis?.name || "";
        const haystack = `${item.name || ""} ${item.kptl || ""} ${itemAny.satuan || ""} ${item.category || ""} ${layananName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (serviceFilter !== "all" && String(item.servicenonmedis_id) !== String(serviceFilter)) return false;
      const classLabel = getClassLabel(itemAny.class ?? itemAny.kelas);
      if (classFilter !== "all" && classLabel !== getClassLabel(classFilter)) return false;
      return true;
    });
  }, [prices, searchTerm, statusFilter, serviceFilter, classFilter]);

  const totalItems = filteredPrices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPrices = filteredPrices.slice((safeCurrentPage - 1) * PER_PAGE, safeCurrentPage * PER_PAGE);

  // Nomor halaman dipadatkan (contoh: 1, 2, 3 ... 10) supaya tidak render
  // semua nomor halaman saat datanya banyak.
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

  const activeCount = useMemo(() => prices.filter((i) => i.status === "aktif").length, [prices]);
  const averagePrice = useMemo(() => {
    if (prices.length === 0) return 0;
    const sum = prices.reduce((acc, cur) => acc + (Number((cur as any).price) || 0), 0);
    return Math.round(sum / prices.length);
  }, [prices]);

  // Kategori yang disarankan mengikuti code dari layanan non medis yang dipilih di form.
  // Kalau code tidak dikenali/belum ada mapping -> tidak ada saran, kategori bebas diketik.
  const selectedServiceCode = useMemo(() => {
    const svc = services.find((s) => String(s.id) === String(form.servicenonmedis_id));
    return String((svc as any)?.code || "").toUpperCase();
  }, [services, form.servicenonmedis_id]);
  const categoryOptions = useMemo(
    () => CATEGORY_OPTIONS_BY_SERVICE_CODE[selectedServiceCode] || [],
    [selectedServiceCode]
  );
  const categoryMode: "free" | "none" | "select" =
    !form.servicenonmedis_id
      ? "free"
      : !CATEGORY_OPTIONS_BY_SERVICE_CODE.hasOwnProperty(selectedServiceCode)
      ? "free"
      : categoryOptions.length === 0
      ? "none"
      : "select";

  const openAdd = () => {
    setEditingItem(null);
    setForm({ ...emptyForm });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (item: NonMedisPrice) => {
    const itemAny = item as any;
    setEditingItem(item);
    setForm({
      id: item.id,
      servicenonmedis_id: String(item.servicenonmedis_id ?? ""),
      name: item.name ?? "",
      category: item.category ?? "",
      kptl: item.kptl ?? "",
      satuan: String(itemAny.satuan || ""),
      class: (String(itemAny.class ?? itemAny.kelas ?? "utama").toLowerCase() === "klinik" ? "klinik" : "utama") as FormState["class"],
      price: String(item.price ?? ""),
      status: item.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  const handleServiceChange = (newServiceId: string) => {
    setForm((prev) => ({ ...prev, servicenonmedis_id: newServiceId, category: "" }));
    if (formErrors.servicenonmedis_id) setFormErrors((prev) => ({ ...prev, servicenonmedis_id: null }));
  };

  const validate = () => {
    const errors: Record<string, string | null> = {};
    if (!form.servicenonmedis_id) errors.servicenonmedis_id = "Layanan non medis wajib dipilih.";
    if (!form.name.trim()) errors.name = "Nama tarif wajib diisi.";
    if (categoryMode === "select" && !form.category.trim()) errors.category = "Kategori wajib dipilih.";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = "Tarif harus berupa angka dan tidak boleh negatif.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        servicenonmedis_id: form.servicenonmedis_id,
        name: form.name.trim(),
        category: categoryMode === "none" ? null : form.category.trim() || null, // kategori opsional -> null kalau kosong
        kptl: form.kptl.trim() || null,
        satuan: form.satuan.trim() || null, // satuan opsional -> null kalau kosong
        class: form.class,
        price: Number(form.price),
        status: form.status,
      };
      if (form.id) {
        await nonmedisService.updateNonMedisPrice(form.id, payload);
        setToast({ show: true, type: "success", message: `Tarif "${payload.name}" berhasil diperbarui.` });
      } else {
        await nonmedisService.createNonMedisPrice(payload);
        setToast({ show: true, type: "success", message: `Tarif "${payload.name}" berhasil ditambahkan.` });
      }
      setIsModalOpen(false);
      await loadData({ silent: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Gagal menyimpan data tarif.";
      setFormErrors((prev) => ({ ...prev, _api: message }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await nonmedisService.deleteNonMedisPrice(deleteTarget.id);
      setToast({ show: true, type: "success", message: `Tarif "${deleteTarget.name}" berhasil dihapus.` });
      setDeleteTarget(null);
      await loadData({ silent: true });
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Gagal menghapus data tarif.";
      setToast({ show: true, type: "error", message });
    } finally {
      setDeleting(false);
    }
  };

  // Ringkasan filter yang sedang aktif, ditampilkan di kop laporan PDF/cetak.
  const filterSummaryText = () => {
    const parts: string[] = [];
    if (searchTerm.trim()) parts.push(`Pencarian: "${searchTerm.trim()}"`);
    if (serviceFilter !== "all") {
      const svc = serviceMap[serviceFilter];
      parts.push(`Layanan: ${(svc as any)?.name || "-"}`);
    }
    if (classFilter !== "all") parts.push(`Kelas: ${getClassLabel(classFilter)}`);
    if (statusFilter !== "all") parts.push(`Status: ${statusFilter === "aktif" ? "Aktif" : "Non-Aktif"}`);
    return parts.length ? parts.join(" • ") : "Semua data (tanpa filter)";
  };

  // Unduh PDF: memakai dialog print bawaan browser (Ctrl+P), memuat SELURUH
  // data yang sesuai filter aktif (bukan cuma satu halaman tabel yang tampil).
  const handleDownloadPdf = () => {
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
    <>
      <div className="space-y-6 no-print">
        {/* Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8 w-full">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800 mb-2">
              <Wallet className="h-3.5 w-3.5" /> Modul Master Keuangan RS • Tarif Layanan Non Medis
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Master Data Tarif Layanan Non Medis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kelola tarif layanan pendukung rumah sakit per layanan non medis, terpisah untuk kelas <strong>Utama</strong> dan <strong>Klinik</strong>.
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
              disabled={services.length === 0}
              title={services.length === 0 ? "Buat Layanan Non Medis terlebih dahulu" : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 text-white px-5 py-2.5 text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" /> Tambah Tarif Non Medis
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        {services.length === 0 && !error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-[#B45309] flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            Belum ada Layanan Non Medis. Buat dulu di halaman Layanan Non Medis sebelum menambah tarif.
          </div>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tarif Non Medis</p>
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
                placeholder="Cari nama tarif, kode, satuan, kategori, atau layanan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
              />
            </div>

            <SearchableSelect
              value={serviceFilter}
              onChange={(val) => {
                setServiceFilter(val);
                setCurrentPage(1);
              }}
              options={serviceFilterOptions}
              placeholder="Semua Layanan"
            />

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "all" | NonMedisStatus);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-700 focus:border-teal-600 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
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
                classFilter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => {
                setClassFilter("utama");
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition cursor-pointer ${
                classFilter === "utama" ? "bg-teal-700 text-white border-teal-700" : "bg-white text-teal-800 border-teal-200 hover:bg-teal-50"
              }`}
            >
              Utama
            </button>
            <button
              type="button"
              onClick={() => {
                setClassFilter("klinik");
                setCurrentPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold border transition cursor-pointer ${
                classFilter === "klinik" ? "bg-cyan-700 text-white border-cyan-700" : "bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50"
              }`}
            >
              Klinik
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-teal-800" />
              Daftar Tarif Layanan Non Medis ({filteredPrices.length})
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
              {prices.length === 0 ? "Belum ada tarif layanan non medis." : "Tidak ada data yang cocok dengan pencarian/filter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Kode</th>
                    <th className="py-3.5 px-4">Nama Tarif</th>
                    <th className="py-3.5 px-4">Layanan Non Medis</th>
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
                    const itemAny = item as any;
                    const svc = serviceMap[String(item.servicenonmedis_id)];
                    const classLabel = getClassLabel(itemAny.class ?? itemAny.kelas);
                    const statusLabel = getStatusLabel(item.status);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 font-mono font-bold text-teal-900 whitespace-nowrap">{item.kptl || "-"}</td>
                        <td className="py-4 px-4 font-extrabold text-slate-900">{item.name}</td>
                        <td className="py-4 px-4 text-slate-600">
                          {(itemAny.serviceNonMedis?.name || (svc as any)?.name) ?? (
                            <span className="italic text-slate-400">Layanan tidak ditemukan</span>
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
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${CLASS_BADGE[itemAny.class ?? itemAny.kelas] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {classLabel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{itemAny.satuan || "-"}</td>
                        <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                          {formatRupiah(item.price)}
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
                            disabled={deletingId === item.id}
                            className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] px-3 py-1.5 font-bold disabled:opacity-50 transition inline-flex items-center"
                          >
                            {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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
                Menampilkan {Math.min((safeCurrentPage - 1) * PER_PAGE + 1, totalItems)}–
                {Math.min(safeCurrentPage * PER_PAGE, totalItems)} dari {totalItems} tarif
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
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {editingItem ? "Edit Tarif Layanan Non Medis" : "Tambah Tarif Layanan Non Medis"}
                    </h3>
                    <p className="text-[11px] text-teal-50/80 mt-0.5">
                      {editingItem ? `Perbarui data untuk "${editingItem.name}"` : "Tambahkan tarif baru untuk layanan non medis"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                    Layanan Non Medis <span className="text-[#DC2626]">*</span>
                  </label>
                  <SearchableSelect
                    value={form.servicenonmedis_id}
                    onChange={handleServiceChange}
                    options={serviceSelectOptions}
                    placeholder="Pilih layanan..."
                    hasError={!!formErrors.servicenonmedis_id}
                  />
                  {formErrors.servicenonmedis_id && (
                    <p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.servicenonmedis_id}</p>
                  )}
                </div>

                {/* Kategori - otomatis mengikuti layanan yang dipilih di atas */}
                {form.servicenonmedis_id && categoryMode !== "none" && (
                  <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-2">
                    <label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                      Kategori Tarif {categoryMode === "select" && <span className="text-[#DC2626]">*</span>}
                    </label>
                    <FreeTextCombobox
                      value={form.category}
                      onChange={(val) => {
                        setForm({ ...form, category: val });
                        if (formErrors.category) setFormErrors({ ...formErrors, category: null });
                      }}
                      options={categoryOptions}
                      hasError={!!formErrors.category}
                    />
                    {formErrors.category && <p className="text-[10px] text-[#DC2626] font-semibold">{formErrors.category}</p>}
                  </div>
                )}
                {form.servicenonmedis_id && categoryMode === "none" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[10px] font-semibold text-slate-500 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>Layanan ini tidak memakai kategori tarif.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Kode</label>
                    <input
                      value={form.kptl}
                      onChange={(e) => setForm({ ...form, kptl: e.target.value })}
                      placeholder="Contoh: ADM-001"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono focus:border-teal-600 focus:bg-white focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Satuan</label>
                    <FreeTextCombobox
                      value={form.satuan}
                      onChange={(val) => setForm({ ...form, satuan: val })}
                      options={satuanSuggestions}
                      placeholder="Contoh: Per Hari"
                    />
                  </div>
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

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                    Nama Tarif <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                    }}
                    placeholder="Contoh: Sewa Kamar VIP"
                    className={`w-full rounded-2xl border px-4 py-2.5 text-xs font-medium focus:outline-hidden transition ${
                      formErrors.name
                        ? "border-red-300 bg-red-50/40 focus:border-red-500"
                        : "border-slate-200 bg-slate-50/50 focus:border-teal-600 focus:bg-white"
                    }`}
                  />
                  {formErrors.name && <p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.name}</p>}
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
                  {formErrors.price && <p className="text-[10px] text-[#DC2626] font-semibold mt-1">{formErrors.price}</p>}
                  {!formErrors.price && form.price !== "" && !isNaN(Number(form.price)) && (
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{formatRupiah(Number(form.price))}</p>
                  )}
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
                    {submitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Simpan Tarif"}
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
              <h3 className="text-base font-extrabold text-slate-900">Hapus Tarif?</h3>
              <p className="mt-2 text-sm text-slate-500">
                Tarif <span className="font-bold text-slate-700">{deleteTarget.name}</span> akan dihapus permanen.
                Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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

        {toast.show && (
          <div
            className={`fixed bottom-6 right-6 z-[60] rounded-2xl px-4 py-3 text-xs font-bold shadow-xl ${
              toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>

      {/* ==== Area khusus cetak/PDF ==== */}
      <div className="print-area hidden print:block p-6">
        <div className="mb-5 border-b-2 border-slate-800 pb-3">
          <h1 className="text-lg font-extrabold text-slate-900">Master Data Tarif Layanan Non Medis</h1>
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
                <th className="py-2 px-2">Kode</th>
                <th className="py-2 px-2">Nama Tarif</th>
                <th className="py-2 px-2">Layanan Non Medis</th>
                <th className="py-2 px-2">Kategori</th>
                <th className="py-2 px-2">Kelas</th>
                <th className="py-2 px-2">Satuan</th>
                <th className="py-2 px-2 text-right">Tarif (Rp)</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.map((item) => {
                const itemAny = item as any;
                const svc = serviceMap[String(item.servicenonmedis_id)];
                return (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="py-1.5 px-2 font-mono">{item.kptl || "-"}</td>
                    <td className="py-1.5 px-2 font-bold">{item.name}</td>
                    <td className="py-1.5 px-2">{itemAny.serviceNonMedis?.name || (svc as any)?.name || "-"}</td>
                    <td className="py-1.5 px-2">{item.category || "-"}</td>
                    <td className="py-1.5 px-2">{getClassLabel(itemAny.class ?? itemAny.kelas)}</td>
                    <td className="py-1.5 px-2">{itemAny.satuan || "-"}</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold">{formatRupiah(item.price)}</td>
                    <td className="py-1.5 px-2">{getStatusLabel(item.status)}</td>
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