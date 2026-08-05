"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import Toast from "@/components/ui/Toast";
import notify from "@/lib/notify";
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

function AdminGeotaggingContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const searchParams = useSearchParams();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success", title = "", tipe) =>
    notify(setToast, { type, title, message: msg, tipe });

  useEffect(() => {
    const toastVal = searchParams.get("toast");
    const actionVal = searchParams.get("action");
    if (toastVal === "success") {
      const actionName = actionVal === "edit" ? "diperbarui" : "ditambahkan";
      showToast(`Data geotagging berhasil ${actionName}.`, "success");
      router.replace("/dashboard/admin/faskes");
    }
  }, [searchParams]);

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

  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const modalMapRef = useRef(null);
  const modalMarkerRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      if (window.L) {
        setMapLoaded(true);
      }
    }
  }, []);

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
    router.push("/dashboard/admin/faskes/add");
  };

  const openEditModal = (f) => {
    router.push(`/dashboard/admin/faskes/add?id=${f.id}`);
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

  useEffect(() => {
    if (!mapLoaded || !window.L) return;

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {}
      mapRef.current = null;
    }

    const container = document.getElementById("leaflet-map");
    if (!container) return;

    let center = [-2.5489, 118.0149];
    let zoom = 5;

    const validFaskes = filteredFaskes.filter(
      (f) => f.latitude && f.longitude && !isNaN(parseFloat(f.latitude)) && !isNaN(parseFloat(f.longitude))
    );

    if (validFaskes.length > 0) {
      center = [parseFloat(validFaskes[0].latitude), parseFloat(validFaskes[0].longitude)];
      zoom = 12;
    }

    try {
      const map = window.L.map("leaflet-map").setView(center, zoom);
      mapRef.current = map;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const hospitalIcon = window.L.divIcon({
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-800 text-white shadow-md border-2 border-white hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 22V11A2 2 0 0 0 17 9H7a2 2 0 0 0-2 2v11"/>
              <path d="M4 22h16"/>
              <path d="M12 14v4"/>
              <path d="M10 16h4"/>
              <path d="M12 5V3"/>
              <path d="M10 4h4"/>
            </svg>
          </div>
        `,
        className: 'custom-hospital-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      validFaskes.forEach((f) => {
        const marker = window.L.marker([parseFloat(f.latitude), parseFloat(f.longitude)], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
              <b style="color: #6b0c0c; font-size: 12px;">${f.name || "Faskes"}</b><br/>
              <span style="color: #666;">${f.address || "-"}</span><br/>
              <div style="margin-top: 5px; font-weight: bold; color: #333;">Koordinat: ${f.latitude}, ${f.longitude}</div>
            </div>
          `);

        marker.bindTooltip(`<b>${f.name || "Faskes"}</b>`, {
          direction: 'top',
          offset: [0, -10]
        });
      });
    } catch (e) {
      console.error("Map initialization failed", e);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
    };
  }, [mapLoaded, filteredFaskes]);

  const hasCoordinates = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar role="admin" activePath="/dashboard/admin/faskes" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onLogout={handleLogout} title="Manajemen Geotagging Faskes" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6">
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

          {/* Map View */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Visualisasi Peta Geotagging</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Peta Sebaran Faskes Terdaftar</span>
            </div>
            <div 
              id="leaflet-map" 
              style={{ height: "350px", zIndex: 1 }} 
              className="rounded-2xl border border-slate-150 shadow-inner bg-slate-50"
            />
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

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-lg transition-all animate-in slide-in-from-top-5 duration-300">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            toast.type === "success" 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
            {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          </div>
          <div className="space-y-0.5 pr-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {toast.type === "success" ? "Sukses" : "Pemberitahuan"}
            </span>
            <p className="text-xs font-bold text-slate-800 leading-tight">{toast.message}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToast({ ...toast, show: false })}
            className="text-slate-400 hover:text-slate-650 font-extrabold text-sm p-1 ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminGeotagging() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-bold text-slate-500 gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-rose-600" />
        Memuat...
      </div>
    }>
      <AdminGeotaggingContent />
    </Suspense>
  );
}
