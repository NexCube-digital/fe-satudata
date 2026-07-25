"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import {
  MapPin,
  Navigation,
  Info,
  RefreshCw,
  ArrowLeft,
  Building2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function AddGeotagForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hospitalAccounts, setHospitalAccounts] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Form State
  const [entryType, setEntryType] = useState("registered"); // "registered" or "custom"
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [medicalLicense, setMedicalLicense] = useState("");

  // Map state
  const [mapLoaded, setMapLoaded] = useState(false);
  const modalMapRef = useRef(null);
  const modalMarkerRef = useRef(null);

  // Authenticate user & load lists
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
    fetchHospitalAccounts();
  }, []);

  // Fetch registered hospital accounts
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

  // If in edit mode, fetch specific geotag details
  useEffect(() => {
    if (!editId) return;

    const fetchGeotagDetails = async () => {
      setLoading(true);
      try {
        const res = await apiGet("/api/admin/faskes");
        if (res.success && res.data) {
          const item = res.data.find((x) => String(x.id) === String(editId));
          if (item) {
            setLatitude(String(item.latitude));
            setLongitude(String(item.longitude));
            if (item.hospital_id) {
              setEntryType("registered");
              setSelectedHospitalId(String(item.hospital_id));
            } else {
              setEntryType("custom");
              setCustomName(item.name || "");
              setCustomAddress(item.address || "");
            }
          } else {
            setMessage({ type: "error", text: "Data geotagging tidak ditemukan." });
          }
        }
      } catch (err) {
        console.error("Error loading geotag:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeotagDetails();
  }, [editId]);

  // Inject Leaflet Scripts dynamically
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

  // Initialize Modal Map
  useEffect(() => {
    if (!mapLoaded || !window.L) return;

    const timer = setTimeout(() => {
      const mapContainer = document.getElementById("modal-leaflet-map");
      if (!mapContainer) return;

      if (modalMapRef.current) {
        try {
          modalMapRef.current.remove();
        } catch (e) {}
        modalMapRef.current = null;
        modalMarkerRef.current = null;
      }

      let center = [-6.2088, 106.8456]; // Jakarta
      let zoom = 12;

      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);
      const hasCoords = !isNaN(latVal) && !isNaN(lngVal);

      if (hasCoords) {
        center = [latVal, lngVal];
        zoom = 15;
      }

      try {
        const map = window.L.map("modal-leaflet-map").setView(center, zoom);
        modalMapRef.current = map;

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

        const marker = window.L.marker(center, { draggable: true, icon: hospitalIcon }).addTo(map);
        modalMarkerRef.current = marker;

        const markerLabel = customName || "Geser Pin untuk Pilih Lokasi";
        marker.bindTooltip(`<b>${markerLabel}</b>`, {
          direction: 'top',
          offset: [0, -10]
        });

        if (hasCoords) {
          marker.bindPopup("Lokasi Geotagging").openPopup();
        }

        marker.on("dragend", function (e) {
          const position = marker.getLatLng();
          setLatitude(String(position.lat.toFixed(7)));
          setLongitude(String(position.lng.toFixed(7)));
        });

        map.on("click", function (e) {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          marker.setLatLng([lat, lng]);
          setLatitude(String(lat.toFixed(7)));
          setLongitude(String(lng.toFixed(7)));
          map.panTo([lat, lng]);
        });

      } catch (e) {
        console.error("Modal map initialization failed", e);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (modalMapRef.current) {
        try {
          modalMapRef.current.remove();
        } catch (e) {}
        modalMapRef.current = null;
        modalMarkerRef.current = null;
      }
    };
  }, [mapLoaded, loading]); // Redraw when Leaflet is ready or edit loading completes

  // Sync Input Fields coordinates back to Map Pin
  useEffect(() => {
    if (!modalMapRef.current || !modalMarkerRef.current || !window.L) return;

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    if (!isNaN(latVal) && !isNaN(lngVal)) {
      const currentPos = modalMarkerRef.current.getLatLng();
      if (currentPos.lat !== latVal || currentPos.lng !== lngVal) {
        modalMarkerRef.current.setLatLng([latVal, lngVal]);
        modalMapRef.current.panTo([latVal, lngVal]);
      }
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation tidak didukung oleh browser Anda.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude.toFixed(7)));
        setLongitude(String(position.coords.longitude.toFixed(7)));
        showToast("Lokasi GPS berhasil dideteksi.", "success");
      },
      (error) => {
        console.error("Geolocation error:", error);
        showToast("Gagal mendeteksi lokasi GPS secara otomatis.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      showToast("Koordinat Latitude & Longitude wajib diisi.", "error");
      return;
    }

    const payload = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    if (entryType === "registered") {
      if (!selectedHospitalId) {
        showToast("Silakan pilih Rumah Sakit terdaftar.", "error");
        return;
      }
      payload.hospital_id = parseInt(selectedHospitalId);
    } else {
      if (!customName.trim() || !customAddress.trim()) {
        showToast("Nama dan Alamat Faskes kustom wajib diisi.", "error");
        return;
      }
      payload.name = customName;
      payload.address = customAddress;
      payload.hospital_id = null;

      // detail pembuatan akun
      payload.create_account = createAccount;
      if (createAccount) {
        if (!email.trim() || !password.trim()) {
          showToast("Email dan Password akun wajib diisi.", "error");
          return;
        }
        if (password.length < 6) {
          showToast("Password akun minimal harus 6 karakter.", "error");
          return;
        }
        payload.email = email;
        payload.password = password;
        payload.medical_license = medicalLicense;
      }
    }

    setSubmitting(true);
    try {
      let res;
      if (!editId) {
        res = await apiPost("/api/admin/faskes", payload);
      } else {
        res = await apiPut(`/api/admin/faskes/${editId}`, payload);
      }

      if (res.success) {
        const actionText = !editId ? "tambah" : "edit";
        router.push(`/dashboard/admin/faskes?toast=success&action=${actionText}`);
      } else {
        showToast(res.message || "Terjadi kesalahan.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal menghubungi server.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar role="admin" activePath="/dashboard/admin/faskes" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onLogout={() => {
          localStorage.clear();
          router.push("/auth/login");
        }} title="Geotagging Faskes" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6">
          {message.text && (
            <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-semibold bg-rose-50 border-rose-250 text-rose-800`}>
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{message.text}</span>
            </div>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-500 font-bold gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-rose-600" />
              Memuat data...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Input fields */}
              <div className="lg:col-span-5 bg-white border border-slate-200/85 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Form Informasi Geotag
                  </h3>
                </div>

                {/* Entry Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sumber Informasi Faskes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEntryType("registered")}
                      className={`py-2.5 px-3 rounded-xl border text-center font-bold transition cursor-pointer text-[11px] ${
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
                      className={`py-2.5 px-3 rounded-xl border text-center font-bold transition cursor-pointer text-[11px] ${
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
                  <div className="space-y-1.5 text-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Akun Rumah Sakit Terdaftar
                    </label>
                    <select
                      value={selectedHospitalId}
                      onChange={(e) => setSelectedHospitalId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-semibold text-slate-800 focus:border-rose-600 focus:outline-hidden bg-white text-xs cursor-pointer"
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
                  <>
                    <div className="space-y-1.5 text-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Nama Faskes / RS Kustom
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Contoh: Klinik Pratama Medika Baru"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-rose-600 focus:outline-hidden text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Alamat Lengkap Kustom
                      </label>
                      <textarea
                        rows={3}
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan, kota..."
                        className="w-full rounded-xl border border-slate-200 p-3 focus:border-rose-600 focus:outline-hidden text-xs"
                      />
                    </div>

                    {/* Opsi pembuatan akun (hanya muncul saat tambah/baru) */}
                    {!editId && (
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer py-1.5 select-none">
                          <input
                            type="checkbox"
                            checked={createAccount}
                            onChange={(e) => setCreateAccount(e.target.checked)}
                            className="rounded border-slate-300 text-rose-800 focus:ring-rose-500 h-4 w-4"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            Sekaligus Buatkan Akun Faskes
                          </span>
                        </label>

                        {createAccount && (
                          <div className="space-y-3.5 pl-4 border-l-2 border-rose-200/60 animate-in fade-in duration-200">
                            <div className="space-y-1.5 text-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Email Akun Faskes *
                              </label>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contoh: admin@klinikmedika.com"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-rose-600 focus:outline-hidden text-xs"
                                required={createAccount}
                              />
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Password Akun *
                              </label>
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-rose-600 focus:outline-hidden text-xs"
                                required={createAccount}
                              />
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Nomor Izin Operasional (SIP/License)
                              </label>
                              <input
                                type="text"
                                value={medicalLicense}
                                onChange={(e) => setMedicalLicense(e.target.value)}
                                placeholder="Contoh: 503/SIP-RS/2026"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-rose-600 focus:outline-hidden text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Coordinates inputs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
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
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono focus:border-rose-600 focus:outline-hidden text-xs"
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
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono focus:border-rose-600 focus:outline-hidden text-xs"
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

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <Link
                    href="/dashboard/admin/faskes"
                    className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-rose-800 text-white font-bold text-xs hover:bg-rose-900 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Simpan Geotag"
                    )}
                  </button>
                </div>
              </div>

              {/* Map Preview */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[450px]">
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 block">
                      Visualisasi Peta & Pin Marker
                    </span>
                    <span className="text-[10px] text-rose-800 font-extrabold animate-pulse">
                      *Klik / Geser Pin untuk Set Lokasi
                    </span>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 flex-1 relative bg-white min-h-[350px] shadow-inner">
                    <div 
                      id="modal-leaflet-map" 
                      style={{ height: "100%", width: "100%", minHeight: "350px", zIndex: 1 }} 
                      className="absolute inset-0 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-amber-50/50 border border-amber-250/30 rounded-xl text-[9px] text-amber-900 font-semibold mt-3">
                  <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>
                    Klik pada peta atau geser pin marker untuk mengisi otomatis koordinat. Contoh koordinat Jakarta: Latitude <code>-6.2088</code>, Longitude <code>106.8456</code>.
                  </span>
                </div>
              </div>

            </form>
          )}

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

export default function AddGeotagPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-bold text-slate-500 gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-rose-600" />
        Memuat...
      </div>
    }>
      <AddGeotagForm />
    </Suspense>
  );
}
