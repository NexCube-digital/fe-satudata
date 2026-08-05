"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast || !toast.show) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed right-5 bottom-5 z-[9999] max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
        isSuccess
          ? "bg-slate-900/95 border-emerald-500/40 text-white shadow-emerald-950/30"
          : isError
          ? "bg-slate-900/95 border-rose-500/40 text-white shadow-rose-950/30"
          : "bg-slate-900/95 border-sky-500/40 text-white shadow-sky-950/30"
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            isSuccess
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : isError
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
          }`}>
            {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : isError ? <AlertCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {toast.title || (isSuccess ? "Berhasil" : isError ? "Perhatian" : "Informasi")}
            </h4>
            <p className="text-xs font-semibold text-white mt-1 leading-relaxed whitespace-pre-line">
              {toast.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
