"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Search, 
  Compass, 
  ArrowLeft, 
  HeartPulse,
  Navigation,
  Award
} from "lucide-react";

export default function FaskesDirectory() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFaskes, setSelectedFaskes] = useState(null);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/hospitals`);
        const result = await res.json();
        if (res.ok && result.success) {
          setHospitals(result.data || []);
          if (result.data && result.data.length > 0) {
            setSelectedFaskes(result.data[0]); // Select first hospital by default
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data faskes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((h) => {
    const nameMatches = (h.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (h.address || "").toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatches = selectedType === "all" || h.hospital_type === selectedType;
    return nameMatches && typeMatches;
  });

  // Extract unique hospital types for filtering
  const hospitalTypes = Array.from(new Set(hospitals.map(h => h.hospital_type))).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-950 border border-red-800/40 p-1.5 text-red-500 shadow-md">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="text-base font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                SatuData <span className="text-red-500 font-medium">Maps</span>
              </span>
            </div>
          </div>
          <Link href="/auth/login" className="rounded-xl bg-red-900 hover:bg-red-850 px-4 py-2 text-xs font-bold text-white shadow-lg transition">
            Akses Akun Faskes
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Side: Directory & Filter */}
        <div className="w-full lg:w-[45%] flex flex-col gap-4 overflow-y-auto pr-1">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-6 w-6 text-red-500" />
              Direktori & Peta Lokasi Faskes
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Cari dan temukan fasilitas kesehatan terdekat yang terhubung dengan infrastruktur SatuData EHR terenkripsi dan blockchain.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari RS atau kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-200 focus:border-red-500 focus:outline-hidden transition placeholder:text-slate-650 font-medium"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-350 focus:border-red-500 focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="all">Semua Tipe Faskes</option>
              {hospitalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Faskes List */}
          <div className="space-y-3 flex-1">
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-500 font-medium">Memuat data faskes...</div>
            ) : filteredHospitals.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-medium">Tidak ada faskes yang cocok dengan pencarian Anda.</div>
            ) : (
              filteredHospitals.map((faskes) => (
                <div 
                  key={faskes.id}
                  onClick={() => setSelectedFaskes(faskes)}
                  className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left space-y-3 relative overflow-hidden group ${
                    selectedFaskes?.id === faskes.id 
                      ? "border-red-500/80 bg-red-950/20 shadow-md shadow-red-900/5" 
                      : "border-slate-850 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {faskes.hospital_type}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {faskes.ownership}
                        </span>
                        {faskes.accreditation && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-red-950/50 text-red-400 border border-red-900/30 flex items-center gap-0.5">
                            <Award className="h-3 w-3" />
                            {faskes.accreditation}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-red-450 transition mt-1.5">
                        {faskes.user?.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                    {faskes.description || "Infrastruktur SatuData EHR terhubung."}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-900 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{faskes.address}</span>
                    </div>
                    {faskes.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{faskes.phone}</span>
                      </div>
                    )}
                    {faskes.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <a href={faskes.website} target="_blank" rel="noopener noreferrer" className="hover:text-red-450 hover:underline truncate">
                          {faskes.website.replace(/(^\w+:|^)\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Map Viewer */}
        <div className="w-full lg:w-[55%] h-[400px] lg:h-auto min-h-[450px] bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
          {selectedFaskes ? (
            <>
              {/* Info Header Overlay */}
              <div className="bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="space-y-0.5 max-w-[70%]">
                  <h4 className="text-xs font-extrabold text-white truncate">{selectedFaskes.user?.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-500" />
                    {selectedFaskes.latitude && selectedFaskes.longitude 
                      ? `${selectedFaskes.latitude}, ${selectedFaskes.longitude}` 
                      : "Koordinat belum diatur"}
                  </p>
                </div>
                {selectedFaskes.latitude && selectedFaskes.longitude && (
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFaskes.latitude},${selectedFaskes.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-550 px-3.5 py-2 text-[10px] font-bold text-white shadow-md transition cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Petunjuk Arah
                  </a>
                )}
              </div>

              {/* Map Iframe */}
              <div className="flex-1 bg-slate-900 relative">
                {selectedFaskes.latitude && selectedFaskes.longitude ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }} // Futuristic dark mode map style
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${selectedFaskes.latitude},${selectedFaskes.longitude}&z=15&output=embed`}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <MapPin className="h-10 w-10 text-slate-700 animate-bounce" />
                    <p className="text-xs text-slate-500 font-semibold uppercase">Koordinat Lokasi Belum Diatur</p>
                    <p className="text-[11px] text-slate-600 max-w-xs leading-relaxed">Faskes ini terdaftar di SatuData, namun belum mengatur titik koordinat GPS di dasbor profilnya.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Compass className="h-12 w-12 text-slate-700 animate-spin" style={{ animationDuration: "20s" }} />
              <p className="text-xs text-slate-500 font-extrabold uppercase">Pilih Fasilitas Kesehatan</p>
              <p className="text-[11px] text-slate-600 max-w-xs leading-relaxed">Klik salah satu faskes dari daftar di sebelah kiri untuk melihat lokasi tepatnya pada peta satelit interaktif.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
