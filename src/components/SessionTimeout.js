"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { clearAuth, getAccessToken } from "@/lib/api";
import { Clock } from "lucide-react";

export default function SessionTimeout() {
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Time constants in seconds
  const IDLE_LIMIT = 5 * 60; // 5 minutes (300 seconds)
  const WARNING_LIMIT = IDLE_LIMIT - 30; // 4 minutes 30 seconds (270 seconds)

  const warningActive = useRef(false);

  // Reset activity function
  const resetTimer = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem("session_last_active", Date.now().toString());
    if (warningActive.current) {
      warningActive.current = false;
      setShowWarning(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if token exists
    const token = getAccessToken();
    if (!token) return;

    // Define public routes that do not need monitoring
    const isPublicRoute = 
      pathname.startsWith("/auth") || 
      pathname.startsWith("/activate") || 
      pathname.startsWith("/reset-password") || 
      pathname === "/";

    if (isPublicRoute) return;

    // Initialize last active timestamp on load
    localStorage.setItem("session_last_active", Date.now().toString());

    // Track user interaction events
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    const interval = setInterval(() => {
      const lastActive = parseInt(localStorage.getItem("session_last_active") || "0", 10);
      const elapsedSeconds = Math.floor((Date.now() - lastActive) / 1000);

      // Check if user is active in another tab
      if (elapsedSeconds < WARNING_LIMIT) {
        if (warningActive.current) {
          warningActive.current = false;
          setShowWarning(false);
          setCountdown(30);
        }
        return;
      }

      // Enter warning state
      if (elapsedSeconds >= WARNING_LIMIT && elapsedSeconds < IDLE_LIMIT) {
        warningActive.current = true;
        setShowWarning(true);
        setCountdown(IDLE_LIMIT - elapsedSeconds);
      }

      // Exceeded idle limit -> Auto Logout
      if (elapsedSeconds >= IDLE_LIMIT) {
        clearInterval(interval);
        clearAuth();
        window.location.href = "/auth/login?reason=timeout";
      }
    }, 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/auth/login?reason=logout";
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="relative mx-4 w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Animated warning circle */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-4 ring-amber-100/50 mb-4 animate-bounce">
          <Clock className="h-8 w-8" />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 mb-2">
          Sesi Anda Akan Berakhir
        </h3>
        
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Anda tidak melakukan aktivitas selama beberapa waktu. Demi keamanan, sesi Anda akan disudahi secara otomatis dalam{" "}
          <span className="font-extrabold text-amber-600 text-base">{countdown}</span> detik.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={resetTimer}
            className="flex-1 cursor-pointer rounded-2xl bg-slate-950 py-3 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
          >
            Tetap Masuk
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            Keluar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
