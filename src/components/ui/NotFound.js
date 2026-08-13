"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFoundComponent() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="h-screen h-dvh w-full flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden bg-slate-50 text-slate-800 select-none">
      {/* Background Gradients & Ambient Soft Orbs (Light Mode) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-teal-200/40 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-cyan-200/40 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[120px]" />
        {/* Subtle light grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Brand Header */}
      <div className="z-10 pt-2 sm:pt-4">
        <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs">
          <Image
            src="/images/logo.png"
            alt="Satu Data Logo"
            width={22}
            height={22}
            className="object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 leading-none">
              Satu Data
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold leading-tight mt-0.5">
              Sistem Informasi Kesehatan
            </span>
          </div>
        </div>
      </div>

      {/* Main 404 Card Container (Compact & 1 Frame) */}
      <div className="z-10 w-full max-w-md my-auto flex flex-col items-center">
        <div className="w-full rounded-2xl border border-slate-200/90 bg-white/85 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-slate-200/60 flex flex-col items-center text-center">
          
          {/* Icon Badge */}
          <div className="relative mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-teal-50/90 text-teal-600 border border-teal-200/60 shadow-xs">
            <FileQuestion className="h-7 w-7 sm:h-8 sm:w-8 text-teal-600 stroke-[1.75]" />
          </div>

          {/* 404 Typography */}
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 font-mono mb-1">
            404
          </h1>

          <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5 tracking-tight">
            Halaman Tidak Ditemukan
          </h2>

          <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
            Maaf, halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau alamat URL kurang tepat.
          </p>

          {/* Countdown Indicator Pill */}
          <div className="flex items-center gap-2 mb-5 bg-teal-50/90 border border-teal-200/70 px-3.5 py-1.5 rounded-full text-xs font-medium text-teal-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span>
              Pengalihan otomatis dalam{" "}
              <strong className="font-extrabold text-teal-700 font-mono">
                {countdown}
              </strong>{" "}
              detik
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition duration-150 cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Sebelumnya</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-xs font-semibold text-white shadow-md shadow-teal-600/20 transition duration-150 cursor-pointer active:scale-[0.98]"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Beranda</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 pb-1 sm:pb-2">
        <p className="text-[11px] text-slate-400 font-medium text-center">
          &copy; {new Date().getFullYear()} Satu Data. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}

