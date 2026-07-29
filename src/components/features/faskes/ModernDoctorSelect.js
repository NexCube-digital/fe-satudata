"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Stethoscope, AlertCircle } from "lucide-react";

/**
 * ModernDoctorSelect - Custom searchable dropdown for selecting a doctor/poli
 *
 * Props:
 *   doctors   - Array of { id, name, specialist, ... }
 *   value     - Current value (string, e.g. "Kardiologi - Dr. Andi")
 *   onChange  - Callback (value: string) => void
 *   required  - boolean
 */
export default function ModernDoctorSelect({ doctors = [], value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter doctors by search
  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.specialist || "").toLowerCase().includes(q)
    );
  });

  // Find selected doctor label
  const selectedDoctor = doctors.find(
    (d) => `${d.specialist} - ${d.name}` === value
  );

  const handleSelect = (d) => {
    onChange(`${d.specialist} - ${d.name}`);
    setOpen(false);
    setSearch("");
  };

  const getSpecialistBadgeColor = (specialist) => {
    const colors = {
      Kardiologi: "bg-red-50 text-red-700 border-red-200",
      Neurologi: "bg-purple-50 text-purple-700 border-purple-200",
      Ortopedi: "bg-amber-50 text-amber-700 border-amber-200",
      Onkologi: "bg-pink-50 text-pink-700 border-pink-200",
      Pediatri: "bg-sky-50 text-sky-700 border-sky-200",
      Radiologi: "bg-indigo-50 text-indigo-700 border-indigo-200",
      default: "bg-slate-50 text-slate-600 border-slate-200",
    };
    for (const [key, val] of Object.entries(colors)) {
      if (specialist?.includes(key)) return val;
    }
    return colors.default;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer
          ${open
            ? "border-rose-500 bg-rose-50/30 ring-2 ring-rose-200/50 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          }
          ${!value && !open ? "text-slate-400" : "text-slate-900"}
        `}
      >
        <span className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <span className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center border transition-colors
            ${selectedDoctor
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-slate-100 text-slate-400 border-slate-200"
            }`}>
            <Stethoscope className="h-4 w-4" />
          </span>

          {/* Selected label */}
          <span className="min-w-0">
            {selectedDoctor ? (
              <span className="block">
                <span className="font-bold text-slate-900 text-sm">{selectedDoctor.name}</span>
                <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSpecialistBadgeColor(selectedDoctor.specialist)}`}>
                  {selectedDoctor.specialist}
                </span>
              </span>
            ) : (
              <span className="text-slate-400 text-sm">
                {doctors.length === 0
                  ? "Belum ada dokter terhubung"
                  : "Pilih Dokter / Poli Faskes..."}
              </span>
            )}
          </span>
        </span>

        {/* Arrow */}
        <ChevronDown
          className={`shrink-0 h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search box */}
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari dokter atau spesialisasi..."
                className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* No doctors */}
          {doctors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">Belum ada staf dokter</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tambahkan dokter di menu Kelola Dokter</p>
            </div>
          )}

          {/* Filtered list */}
          {doctors.length > 0 && (
            <div className="max-h-64 overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {filtered.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400">Tidak ada dokter yang cocok</p>
                </div>
              ) : (
                filtered.map((d) => {
                  const isSelected = `${d.specialist} - ${d.name}` === value;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelect(d)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 mx-1 text-left rounded-xl transition-all duration-100 cursor-pointer
                        ${isSelected
                          ? "bg-rose-50 text-rose-900"
                          : "hover:bg-slate-50 text-slate-700"
                        }
                      `}
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      {/* Specialist icon */}
                      <span className={`shrink-0 h-8 w-8 rounded-xl border flex items-center justify-center text-xs font-bold
                        ${isSelected ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-500 border-slate-200"}
                      `}>
                        <Stethoscope className="h-3.5 w-3.5" />
                      </span>

                      {/* Labels */}
                      <span className="flex-1 min-w-0">
                        <span className={`block text-xs font-bold truncate ${isSelected ? "text-rose-900" : "text-slate-800"}`}>
                          {d.name}
                        </span>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${getSpecialistBadgeColor(d.specialist)}`}>
                          {d.specialist || "Umum"}
                        </span>
                      </span>

                      {/* Checkmark */}
                      {isSelected && (
                        <Check className="h-4 w-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Footer count */}
          {doctors.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 font-medium">
              {filtered.length} dari {doctors.length} dokter
            </div>
          )}
        </div>
      )}
    </div>
  );
}
