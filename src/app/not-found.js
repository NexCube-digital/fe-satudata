"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Redirect back
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 text-white px-6">
      {/* Premium Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px] translate-x-[-50%] translate-y-[-50%]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-red-900/20 blur-[150px] translate-x-[50%] translate-y-[50%]" />
      </div>

      <div className="z-10 w-full max-w-2xl text-center flex flex-col items-center">
        {/* Animated Brand Header */}
        <div className="flex items-center gap-2.5 mb-10 animate-fade-in">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <Image
              src="/images/logo.png"
              alt="Satu Data Logo"
              width={24}
              height={24}
              className="object-contain invert brightness-200"
            />
          </div>
          <span className="text-md font-bold tracking-wider uppercase text-slate-300">
            Satu Data
          </span>
        </div>

        {/* 404 Glassmorphic Card */}
        <div className="relative w-full rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 backdrop-blur-xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          {/* Holographic Question Icon */}
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-500 border border-rose-500/30 shadow-lg">
            <FileQuestion className="h-12 w-12 stroke-[1.5]" />
            <div className="absolute -inset-0.5 rounded-3xl bg-rose-500/30 blur opacity-30 -z-10 animate-pulse" />
          </div>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500 mb-4 font-mono">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 mb-3">
            Halaman Tidak Ditemukan
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-md mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>

          {/* Countdown indicator */}
          <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-semibold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            Mengalihkan Anda kembali secara otomatis dalam{" "}
            <span className="font-extrabold text-rose-400 text-sm font-mono">{countdown}</span> detik
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Sebelumnya
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-xs font-bold text-slate-900 transition hover:bg-slate-150 cursor-pointer shadow-lg"
            >
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} Satu Data. All rights reserved.
        </p>
      </div>
    </div>
  );
}
