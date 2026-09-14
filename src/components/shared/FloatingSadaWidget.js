"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Stethoscope } from "lucide-react";
import AiPage from "@/components/landing/faq/AiPage";

export default function FloatingSadaWidget() {
  const pathname = usePathname() || "";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { 
          setUser(JSON.parse(stored)); 
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    handleSync();
    window.addEventListener("userUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("userUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  useEffect(() => {
    const handleOpenSada = () => {
      setIsChatOpen(true);
    };
    window.addEventListener("openSadaChat", handleOpenSada);
    return () => {
      window.removeEventListener("openSadaChat", handleOpenSada);
    };
  }, []);

  // SADA appears on landing pages AND /dashboard/*
  // Excluded routes: /auth/*, /reset-password/*, /reset-pin/*, /activate/*, 404/not-found
  const isExcluded = 
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/reset-pin") ||
    pathname.startsWith("/activate") ||
    pathname === "/404" ||
    pathname === "/not-found";

  if (isExcluded) return null;

  const isDashboard = pathname.startsWith("/dashboard");
  const isPatient = user?.role === "pasien";
  const patientId = user?.patient_id || user?.patientId || user?.patient?.id || user?.id || "";

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      {!isChatOpen ? (
        /* FLOATING PILL TRIGGER BUTTON (HALODOC HILDA STYLE) */
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="group flex items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xl hover:shadow-teal-900/20 hover:border-teal-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Tanya SADA by SatuData AI"
          aria-label="Tanya SADA by SatuData AI"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#0D9488] via-[#0F766E] to-teal-500 text-white shadow-md group-hover:rotate-6 transition-transform">
            <Stethoscope className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold tracking-tight text-[#0D9488]">SADA</span>
              <span className="text-[10px] font-bold text-[#0D9488] bg-teal-50 px-1.5 py-0.2 rounded-md">AI</span>
            </div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">by SatuData AI</span>
          </div>
        </button>
      ) : (
        /* FLOATING CHAT POPOVER WINDOW (HALODOC HILDA STYLE) */
        <div className="w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200">
          <AiPage
            mode={isDashboard && isPatient ? "medical" : "system"}
            patientId={patientId}
            isFloating={true}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
