'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Stethoscope, AlertCircle } from 'lucide-react';

export interface ModernDoctorSelectProps {
  doctors?: any[];
  value?: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function ModernDoctorSelect({ doctors = [], value, onChange, required, placeholder }: ModernDoctorSelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.specialist || '').toLowerCase().includes(q)
    );
  });

  const selectedDoctor = doctors.find(
    (d) => `${d.specialist} - ${d.name}` === value
  );

  const handleSelect = (d: any) => {
    onChange(`${d.specialist} - ${d.name}`);
    setOpen(false);
    setSearch('');
  };

  const getSpecialistBadgeColor = (specialist: string) => {
    const colors: Record<string, string> = {
      Kardiologi: 'bg-red-50 text-red-700 border-red-200',
      Neurologi: 'bg-purple-50 text-purple-700 border-purple-200',
      Ortopedi: 'bg-amber-50 text-amber-700 border-amber-200',
      Onkologi: 'bg-pink-50 text-pink-700 border-pink-200',
      Pediatri: 'bg-sky-50 text-sky-700 border-sky-200',
      Radiologi: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      default: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    for (const [key, val] of Object.entries(colors)) {
      if (specialist?.includes(key)) return val;
    }
    return colors.default;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-200 cursor-pointer
          ${open
            ? 'border-teal-600 bg-teal-50/30 ring-2 ring-teal-500/20 shadow-xs'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }
          ${!value && !open ? 'text-slate-400' : 'text-slate-900'}
        `}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center border transition-colors
            ${selectedDoctor
              ? 'bg-teal-50 text-teal-800 border-teal-200'
              : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}>
            <Stethoscope className="h-4 w-4" />
          </span>

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
                  ? 'Belum ada dokter terhubung'
                  : (placeholder || 'Pilih Dokter / Poli Faskes...')}
              </span>
            )}
          </span>
        </span>

        <ChevronDown
          className={`shrink-0 h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari dokter atau spesialisasi..."
                className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-hidden"
              />
            </div>
          </div>

          {doctors.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">Belum ada staf dokter</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tambahkan dokter di menu Kelola Dokter</p>
            </div>
          )}

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
                          ? 'bg-teal-50 text-teal-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                        }
                      `}
                      style={{ width: 'calc(100% - 8px)' }}
                    >
                      <span className={`shrink-0 h-8 w-8 rounded-xl border flex items-center justify-center text-xs font-bold
                        ${isSelected ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-slate-100 text-slate-500 border-slate-200'}
                      `}>
                        <Stethoscope className="h-3.5 w-3.5" />
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className={`block text-xs font-bold truncate ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                          {d.name}
                        </span>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${getSpecialistBadgeColor(d.specialist)}`}>
                          {d.specialist || 'Umum'}
                        </span>
                      </span>

                      {isSelected && (
                        <Check className="h-4 w-4 text-teal-700 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

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
