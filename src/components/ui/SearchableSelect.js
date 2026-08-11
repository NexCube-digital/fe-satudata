"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Pilih --",
  searchable = true,
  isLoading = false,
  loadingText = "Memuat...",
  emptyText = "Tidak ada pilihan yang cocok.",
  disabled = false,
  required = false,
  className = "",
  size = "md", // "sm" | "md" | "lg"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize options array: convert strings to { value, label }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt.value,
          label: opt.label ?? String(opt.value),
          badge: opt.badge,
          disabled: opt.disabled || false,
        };
      }
      return { value: opt, label: String(opt), disabled: false };
    });
  }, [options]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, searchable]);

  const normalizeStr = (v) => String(v ?? "");
  const selectedOption = normalizedOptions.find(
    (o) => normalizeStr(o.value) === normalizeStr(value)
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim() || !searchable) return normalizedOptions;
    const q = query.trim().toLowerCase();
    return normalizedOptions.filter((o) =>
      o.label.toLowerCase().includes(q)
    );
  }, [normalizedOptions, query, searchable]);

  const toggleOpen = () => {
    if (disabled || isLoading) return;
    setOpen((o) => !o);
  };

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  // Size variations
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-4 py-2.5 text-xs font-semibold rounded-2xl",
    lg: "px-4 py-3 text-sm font-semibold rounded-2xl",
  }[size] || "px-4 py-2.5 text-xs font-semibold rounded-2xl";

  return (
    <div className="relative w-full" ref={containerRef}>
      {required && (
        <input
          tabIndex={-1}
          value={value || ""}
          onChange={() => {}}
          required
          className="sr-only"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled || isLoading}
        className={`w-full flex items-center justify-between gap-2 border border-slate-200 bg-white text-slate-850 shadow-xs hover:border-teal-400 focus:border-teal-600 focus:outline-none transition-all disabled:opacity-60 cursor-pointer ${sizeClasses} ${className}`}
      >
        <span
          className={`truncate text-left ${
            selectedOption ? "text-slate-900 font-extrabold" : "text-slate-400 font-normal"
          }`}
        >
          {isLoading
            ? loadingText
            : selectedOption
            ? selectedOption.label
            : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-teal-600" : ""
          }`}
        />
      </button>

      {open && !isLoading && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {searchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari..."
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpen(false);
                      setQuery("");
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 outline-none focus:border-teal-500 font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-52 p-1.5 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected =
                  normalizeStr(opt.value) === normalizeStr(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition text-left cursor-pointer ${
                      isSelected
                        ? "bg-teal-50 text-teal-800 font-bold"
                        : opt.disabled
                        ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-teal-600" />}
                    </div>
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
