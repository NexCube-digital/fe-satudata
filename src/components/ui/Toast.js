"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast || !toast.show) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed right-5 top-5 z-[9999] max-w-md w-full animate-in fade-in slide-in-from-top-5 duration-300">
      <div
        className={`relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all ${
          isSuccess
            ? "bg-white/95 border-emerald-200 shadow-emerald-500/10 text-slate-900"
            : isError
            ? "bg-white/95 border-rose-200 shadow-rose-500/10 text-slate-900"
            : "bg-white/95 border-teal-200 shadow-teal-500/10 text-slate-900"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isSuccess
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
                : isError
                ? "bg-rose-50 text-rose-600 border border-rose-200/80"
                : "bg-teal-50 text-teal-600 border border-teal-200/80"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isError ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h4
              className={`text-[10px] font-black uppercase tracking-widest ${
                isSuccess
                  ? "text-emerald-700"
                  : isError
                  ? "text-rose-700"
                  : "text-teal-700"
              }`}
            >
              {toast.title || (isSuccess ? "Berhasil" : isError ? "Perhatian" : "Informasi")}
            </h4>
            <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-relaxed whitespace-pre-line">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
