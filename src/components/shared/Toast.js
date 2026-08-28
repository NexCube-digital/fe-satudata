"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "error", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    error: (msg) => addToast(msg, "error"),
    success: (msg) => addToast(msg, "success"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Top-Right Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              t.type === "error"
                ? "bg-white/95 border-red-200 text-red-700 shadow-red-900/10"
                : t.type === "success"
                ? "bg-white/95 border-emerald-200 text-emerald-800 shadow-emerald-900/10"
                : "bg-white/95 border-teal-200 text-[#0D9488] shadow-teal-900/10"
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
              {t.type === "info" && <Info className="h-5 w-5 text-[#0D9488] shrink-0 mt-0.5" />}
              <p className="text-xs font-bold leading-relaxed break-words">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-lg hover:bg-slate-100 transition shrink-0"
              aria-label="Tutup"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      error: (msg) => console.error(msg),
      success: (msg) => console.log(msg),
      info: (msg) => console.log(msg),
    };
  }
  return context;
}
