"use client";

import { useState, useEffect, useRef } from "react";
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
  Award,
  X
} from "lucide-react";
import Navbar from "@/components/layout/LandingNavbar";
import Footer from "@/components/layout/LandingFooter";

export default function FaskesDirectory() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFaskes, setSelectedFaskes] = useState(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const markersRef = useRef({});

  // Dynamic Leaflet loading
  useEffect(() => {
    const markMapLoaded = () => {
      window.requestAnimationFrame(() => setMapLoaded(true));
    };

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
      script.onload = markMapLoaded;
      document.head.appendChild(script);
    } else {
      if (window.L) {
        markMapLoaded();
      }
    }
  }, []);

  // Fetch hospital data
  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/auth/hospitals`);
        const result = await res.json();
        if (res.ok && result.success) {
          setHospitals(result.data || []);
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !window.L || loading) return;

    const timer = setTimeout(() => {
      const container = document.getElementById("leaflet-map");
      if (!container || mapRef.current) return;

      const map = window.L.map("leaflet-map").setView([-2.5489, 118.0149], 5);
      mapRef.current = map;

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      markersGroupRef.current = window.L.layerGroup().addTo(map);
      setMapReady(true);

      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
        markersGroupRef.current = null;
        setMapReady(false);
      }
    };
  }, [mapLoaded, loading]);

  // Update Markers when data or map loads
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current || !window.L) return;

    markersGroupRef.current.clearLayers();
    markersRef.current = {};

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
      className: "custom-hospital-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    const validFaskes = filteredHospitals.filter(
      (f) => f.latitude && f.longitude && !isNaN(parseFloat(f.latitude)) && !isNaN(parseFloat(f.longitude))
    );

    validFaskes.forEach((f) => {
      const marker = window.L.marker([parseFloat(f.latitude), parseFloat(f.longitude)], { icon: hospitalIcon })
        .addTo(markersGroupRef.current)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px; line-height: 1.4;">
            <b style="color: #9f1239; font-size: 12px;">${f.user?.name || f.name}</b><br/>
            <span style="color: #64748b;">${f.address || "-"}</span><br/>
            <div style="margin-top: 5px; font-weight: bold; color: #334155;">Koordinat: ${f.latitude}, ${f.longitude}</div>
          </div>
        `);

      marker.bindTooltip(`<b>${f.user?.name || f.name}</b>`, {
        direction: 'top',
        offset: [0, -10]
      });

      marker.on("click", () => {
        setSelectedFaskes(f);
      });

      markersRef.current[f.id] = marker;
    });
  }, [filteredHospitals, mapReady]);

  // Handle flyTo when selectedFaskes changes
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (selectedFaskes) {
      const { latitude, longitude, id } = selectedFaskes;
      if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
        mapRef.current.flyTo([parseFloat(latitude), parseFloat(longitude)], 13, {
          animate: true,
          duration: 1.5
        });

        const marker = markersRef.current[id];
        if (marker) {
          marker.openPopup();
        }
      }
    } else {
      mapRef.current.flyTo([-2.5489, 118.0149], 5, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedFaskes]);

  return (
    <div className="min-h-screen flex flex-col font-sans pt-20 sm:pt-24 bg-slate-50/20">
      {/* Premium Landing Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* Top Section: Map Viewer (Landscape) */}
        <div className="w-full h-[450px] md:h-[500px] bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-lg shadow-rose-950/5 flex flex-col shrink-0">
          
          {/* Selected Faskes Info Header Overlay (floating at the top of the map container) */}
          {selectedFaskes && (
            <div className="absolute top-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-md p-4 border border-slate-200 rounded-2xl flex items-center justify-between shadow-md">
              <div className="space-y-0.5 max-w-[70%]">
                <h4 className="text-xs font-extrabold text-slate-900 truncate">{selectedFaskes.user?.name || selectedFaskes.name}</h4>
                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-600" />
                  {selectedFaskes.latitude && selectedFaskes.longitude 
                    ? `${selectedFaskes.latitude}, ${selectedFaskes.longitude}` 
                    : "Koordinat belum diatur"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedFaskes.latitude && selectedFaskes.longitude && (
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFaskes.latitude},${selectedFaskes.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 px-3.5 py-2 text-[10px] font-bold text-white shadow-md transition cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Petunjuk Arah
                  </a>
                )}
                <button 
                  onClick={() => setSelectedFaskes(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition cursor-pointer"
                  title="Tutup & Reset Peta"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Leaflet Map Div (always visible) */}
          <div className="flex-1 w-full h-full relative">
            <div id="leaflet-map" className="absolute inset-0 w-full h-full bg-slate-50" style={{ zIndex: 1 }} />
            
            {/* If leaflet is loading */}
            {!mapLoaded && (
              <div className="absolute inset-0 z-2 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Compass className="h-12 w-12 text-rose-800 animate-spin" style={{ animationDuration: "10s" }} />
                <p className="text-xs text-slate-500 font-extrabold uppercase">Memuat Peta...</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Directory & Filters & List */}
        <div className="w-full flex flex-col gap-6">
          
          {/* Header & Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Compass className="h-6 w-6 text-rose-800" />
                Direktori Lokasi Faskes
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Cari dan temukan fasilitas kesehatan terdekat yang terhubung dengan infrastruktur SatuData EHR terenkripsi dan blockchain.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari RS atau kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-hidden transition placeholder:text-slate-400 font-medium shadow-2xs"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:border-rose-500 focus:outline-hidden font-medium cursor-pointer shadow-2xs"
              >
                <option value="all">Semua Tipe Faskes</option>
                {hospitalTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Faskes Cards Grid */}
          <div className="pb-8">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">Memuat data faskes...</div>
            ) : filteredHospitals.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">Tidak ada faskes yang cocok dengan pencarian Anda.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                {filteredHospitals.map((faskes) => (
                  <div 
                    key={faskes.id}
                    onClick={() => setSelectedFaskes(faskes)}
                    className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 relative overflow-hidden group ${
                      selectedFaskes?.id === faskes.id 
                        ? "border-rose-500 bg-rose-50/40 shadow-xs" 
                        : "border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white/80"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      selectedFaskes?.id === faskes.id ? "bg-rose-100 text-rose-850" : "bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-rose-700"
                    }`}>
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-bold text-slate-800 group-hover:text-rose-950 transition truncate">
                        {faskes.user?.name || faskes.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{faskes.hospital_type || "Rumah Sakit"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
