"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

/**
 * ModernSelect - Generic modern searchable dropdown component
 *
 * Props:
 *   options     - Array of { value, label, sublabel?, icon?: Component, badge?, disabled? }
 *                 OR Array of strings e.g. ["Semua Status", "Approved", "Pending"]
 *   value       - Current selected value
 *   onChange    - Callback (value) => void
 *   placeholder - Placeholder string when no value is selected
 *   icon        - Lead icon for trigger button
 *   searchable  - boolean (default: auto if > 4 options)
 *   className   - Custom container classes
 *   disabled    - boolean
 */
export default function ModernSelect({
  options = [],
  value,
  onChange,
  placeholder = "Pilih opsi...",
  icon: LeadIcon,
  searchable,
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Normalize options array
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value,
        label: opt.label || String(opt.value),
        sublabel: opt.sublabel || null,
        icon: opt.icon || null,
        badge: opt.badge || null,
        disabled: !!opt.disabled,
      };
    }
    return {
      value: opt,
      label: String(opt),
      sublabel: null,
      icon: null,
      badge: null,
      disabled: false,
    };
  });

  const isSearchable = searchable !== undefined ? searchable : normalizedOptions.length > 7;

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

  // Auto focus search input
  useEffect(() => {
    if (open && isSearchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, isSearchable]);

  const filtered = normalizedOptions.filter((opt) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  });

  const selectedOpt = normalizedOptions.find((opt) => String(opt.value) === String(value));

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          ${
            open
              ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-xs"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
          }
          ${!selectedOpt && !open ? "text-slate-400" : "text-slate-900"}
        `}
      >
        <span className="flex items-center gap-2 min-w-0">
          {LeadIcon && (
            <span
              className={`shrink-0 h-6 w-6 rounded-lg flex items-center justify-center border transition-colors ${
                selectedOpt
                  ? "bg-teal-50 text-teal-800 border-teal-200"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              <LeadIcon className="h-3.5 w-3.5" />
            </span>
          )}

          <span className="min-w-0 flex items-center gap-2">
            {selectedOpt ? (
              <span className="font-bold text-slate-800 text-xs truncate">
                {selectedOpt.label}
              </span>
            ) : (
              <span className="text-slate-400 text-xs truncate">{placeholder}</span>
            )}
            {selectedOpt?.badge && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                {selectedOpt.badge}
              </span>
            )}
          </span>
        </span>

        <ChevronDown
          className={`shrink-0 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-teal-700" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1.5 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 min-w-full w-max max-w-xs sm:max-w-sm">
          {isSearchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {filtered.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-xs text-slate-400">Tidak ada pilihan</p>
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const OptIcon = opt.icon;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`
                      w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-xl transition-all duration-100 cursor-pointer text-xs
                      ${
                        isSelected
                          ? "bg-teal-50 text-teal-900 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }
                      ${opt.disabled ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                    style={{ width: "calc(100% - 8px)", margin: "0 4px" }}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {OptIcon && (
                        <OptIcon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected ? "text-teal-700" : "text-slate-400"
                          }`}
                        />
                      )}
                      <span className="truncate whitespace-nowrap font-medium">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 truncate whitespace-nowrap">
                          ({opt.sublabel})
                        </span>
                      )}
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-teal-700" />
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
