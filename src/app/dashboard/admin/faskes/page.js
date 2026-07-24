"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../layout/Navbar";
import Sidebar from "../../layout/Sidebar";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  MapPin,
  Compass,
  Navigation,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Info,
  X,
  Link2
} from "lucide-react";

export default function AdminGeotagging() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Data lists
  const [faskesList, setFaskesList] = useState([]);
  const [hospitalAccounts, setHospitalAccounts] = useState([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedFaskesId, setSelectedFaskesId] = useState(null);

  // Form State
  const [entryType, setEntryType] = useState("registered"); // "registered" or "custom"
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchFaskesList();
    fetchHospitalAccounts();
  }, []);

  const fetchFaskesList = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/admin/faskes?limit=100");
      if (res.success && res.data) {
        setFaskesList(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat list faskes:", err);
      setMessage({ type: "error", text: "Gagal mengambil data geotagging faskes." });
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalAccounts = async () => {
    try {
      const res = await apiGet("/api/admin/accounts?role=rumah_sakit&limit=100");
      if (res.success && res.data) {
        setHospitalAccounts(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat akun rumah sakit:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude.toFixed(7)));
        setLongitude(String(position.coords.longitude.toFixed(7)));
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Gagal mendeteksi lokasi GPS secara otomatis.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openAddModal = () => {
    setModalMode("add");
    setEntryType("registered");
    setSelectedHospitalId("");
    setCustomName("");
    setCustomAddress("");
    setLatitude("");
    setLongitude("");
    setSelectedFaskesId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (f) => {
    setModalMode("edit");
    setSelectedFaskesId(f.id);
    setLatitude(String(f.latitude));
    setLongitude(String(f.longitude));
    
    if (f.hospital_id) {
      setEntryType("registered");
      setSelectedHospitalId(String(f.hospital_id));
      setCustomName("");
      setCustomAddress("");
    } else {
      setEntryType("custom");
      setSelectedHospitalId("");
      setCustomName(f.name);
      setCustomAddress(f.address);
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data geotagging ini?")) return;
    
    setActionLoadingId(id);
    try {
      const res = await apiDelete(`/api/admin/faskes/${id}`);
      if (res.success) {
        setMessage({ type: "success", text: "Data geotagging berhasil dihapus." });
        fetchFaskesList();
      } else {
        setMessage({ type: "error", text: res.message || "Gagal menghapus faskes." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Kesalahan koneksi saat menghapus faskes." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      alert("Koordinat Latitude & Longitude wajib diisi.");
      return;
    }

    const payload = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    if (entryType === "registered") {
      if (!selectedHospitalId) {
        alert("Silakan pilih Rumah Sakit terdaftar.");
        return;
      }
      payload.hospital_id = parseInt(selectedHospitalId);
    } else {
      if (!customName.trim() || !customAddress.trim()) {
        alert("Nama dan Alamat Faskes kustom wajib diisi.");
        return;
      }
      payload.name = customName;
      payload.address = customAddress;
      payload.hospital_id = null;
    }

    setSubmitting(true);
    try {
      let res;
      if (modalMode === "add") {
        res = await apiPost("/api/admin/faskes", payload);
      } else {
        res = await apiPut(`/api/admin/faskes/${selectedFaskesId}`, payload);
      }

      if (res.success) {
        setMessage({
          type: "success",
          text: `Data geotagging faskes berhasil ${modalMode === "add" ? "ditambahkan" : "diperbarui"}.`,
        });
        setIsModalOpen(false);
        fetchFaskesList();
      } else {
        alert(res.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi server.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaskes = faskesList.filter((f) => {
    const matchesSearch =
      (f.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.address || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const isLinked = f.hospital_id !== null;
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "linked" && isLinked) ||
      (statusFilter === "custom" && !isLinked);

    return matchesSearch && matchesFilter;
  });

  const hasCoordinates = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar activePath="/dashboard/admin/faskes" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onLogout={handleLogout} title="Manajemen Geotagging Faskes" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shrink-0 border border-rose-100">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-extrabold text-slate-900 font-sans">Geotagging & Peta Faskes</h1>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-medium">
                  Tambahkan dan kelola titik koordinat GPS (geotagging) untuk Fasilitas Kesehatan/Rumah Sakit agar muncul secara akurat di direktori peta publik SatuData.
                </p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-rose-500" />
              Tambah Geotagging
            </button>
          </div>

          {/* Feedback message */}
          {message.text && (
            <div
              className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-semibold ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                  : "bg-rose-50 border-rose-250 text-rose-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-455 text-slate-400" />
              <input
                type="text"
                placeholder="Cari faskes berdasarkan nama atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-rose-600 focus:outline-hidden bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold focus:border-rose-600 focus:outline-hidden bg-white cursor-pointer"
            >
              <option value="all">Semua Tipe Geotagging</option>
              <option value="linked">Terhubung ke Akun RS</option>
              <option value="custom">Entri Kustom (Belum Registrasi)</option>
            </select>
          </div>

          {/* Table list */}
          <div className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-xs text-slate-500 font-bold gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-rose-600" />
                Memuat data faskes...
              </div>
            ) : filteredFaskes.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                Tidak ada data geotagging faskes ditemukan.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className="px-5 py-3.5">Faskes & Alamat</th>
                      <th className="px-5 py-3.5">Tipe Entri</th>
                      <th className="px-5 py-3.5">Koordinat GPS (Lat, Lng)</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredFaskes.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-extrabold text-sm shrink-0">
                              {f.name ? f.name.charAt(0).toUpperCase() : "F"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{f.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{f.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {f.hospital_id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              <Link2 className="h-3 w-3" /> Terverifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-bold text-[10px]">
                              Entri Kustom
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-600">
                          {f.latitude}, {f.longitude}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(f)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                              title="Edit Geotagging"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              disabled={actionLoadingId === f.id}
                              className="p-1.5 rounded-lg border border-slate-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer disabled:opacity-50"
                              title="Hapus"
                            >
                              {actionLoadingId === f.id ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Geotagging Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                <MapPin className="h-5 w-5 text-rose-600" />
                {modalMode === "add" ? "Tambah Geotagging Faskes" : "Edit Geotagging Faskes"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
              {/* Form Input fields */}
              <div className="lg:col-span-5 space-y-4">
                {/* Entry Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sumber Informasi Faskes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEntryType("registered")}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer text-[11px] ${
                        entryType === "registered"
                          ? "border-rose-500 bg-rose-50/50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Pilih dari RS Terdaftar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryType("custom")}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition cursor-pointer text-[11px] ${
                        entryType === "custom"
                          ? "border-rose-500 bg-rose-50/50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Input Faskes Kustom
                    </button>
                  </div>
                </div>

                {entryType === "registered" ? (
                  /* Dropdown hospital list */
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Akun Rumah Sakit Terdaftar
                    </label>
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold text-slate-800 focus:border-rose-600 focus:outline-hidden bg-white"
                    >
                      <option value="">-- Pilih Instansi RS --</option>
                      {hospitalAccounts.map((a) => {
                        const val = a.hospitalProfile ? a.hospitalProfile.id : `user_${a.id}`;
                        const license = a.hospitalProfile?.medical_license || "-";
                        return (
                          <option key={val} value={val}>
                            {a.name} (License: {license})
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      Nama dan Alamat akan disinkronisasikan secara otomatis dari data Profil Rumah Sakit terpilih.
                    </p>
                  </div>
                ) : (
                  /* Custom input fields */
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Nama Faskes / RS Kustom
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Contoh: Klinik Pratama Medika Baru"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-rose-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Alamat Lengkap Kustom
                      </label>
                      <textarea
                        rows={3}
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan, kota..."
                        className="w-full rounded-xl border border-slate-200 p-3 focus:border-rose-600 focus:outline-hidden"
                      />
                    </div>
                  </>
                )}

                {/* Coordinates inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="-6.2088"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="106.8456"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Locator button */}
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[10px] text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation className="h-3.5 w-3.5 text-rose-600" />
                  Gunakan Lokasi Browser Saat Ini (GPS)
                </button>
              </div>

              {/* Map Preview */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-3 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Preview Peta Marker
                  </span>
                  {hasCoordinates ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 flex-1 relative bg-white min-h-[220px]">
                      <iframe
                        title="Location Map Marker"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-350 rounded-xl bg-white text-slate-400 p-6 text-center space-y-2 min-h-[220px]">
                      <MapPin className="h-7 w-7 text-slate-300 animate-bounce" />
                      <p className="font-bold text-[11px] text-slate-700">Peta belum dikonfigurasi</p>
                      <p className="text-[9px] text-slate-400 max-w-xs">
                        Masukkan koordinat Latitude & Longitude untuk memunculkan visualisasi pin lokasi Google Maps.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-amber-50/50 border border-amber-250/30 rounded-xl text-[9px] text-amber-900 font-semibold mt-3">
                  <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>
                    Pastikan koordinat dalam format desimal standar. Contoh koordinat Jakarta: Latitude <code>-6.2088</code>, Longitude <code>106.8456</code>.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Simpan Geotagging"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
