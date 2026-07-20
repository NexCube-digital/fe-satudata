"use client";

import { ArrowRight, ShieldCheck, Activity, Key, CheckCircle, Database, Wallet } from "lucide-react";
import { heroMetrics } from "./landing-data";

export default function Hero({ walletConnected, setWalletConnected }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-[2.5rem] border border-pink-100/80 bg-white px-6 py-10 text-slate-900 shadow-[0_30px_100px_rgba(244,114,182,0.08)] sm:px-10 lg:h-[calc(100vh-9.5rem)] lg:min-h-160 lg:px-14 lg:py-8"
    >
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(127,29,29,0.12),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(166,27,45,0.08),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.95),transparent_50%)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-800/10 blur-[120px]" />

      <div className="relative grid h-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
        {/* Left Column: Heading and Info */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-pink-500">
            <ShieldCheck className="h-4 w-4 text-pink-300 animate-pulse" />
            Integrasi SatuSehat & Keamanan Blockchain
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-pink-500/80">
              SatuData Healthcare Hub
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl/tight">
              Data Kesehatan Anda, <br />
              <span className="bg-linear-to-r from-[#7F1D1D] via-[#A61B2D] to-[#4C0B14] bg-clip-text text-transparent">
                Sepenuhnya Milik Anda.
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Satu Data adalah platform manajemen rekam medis berbasis blockchain yang memberikan hak kontrol penuh kepada pasien atas data kesehatan mereka. Rumah sakit atau tenaga medis harus mendapatkan izin eksplisit dari pasien untuk mengakses data tersebut.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#7F1D1D] to-[#A61B2D] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:from-[#8E2A3B] hover:to-[#7A1526] hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200/60"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Hero Metrics */}
          <div className="grid gap-4 border-t border-pink-100 pt-8 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="group relative rounded-2xl border border-pink-100 bg-white/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-pink-300/40 hover:bg-pink-50/80">
                <p className="text-xl font-extrabold text-slate-950 sm:text-2xl">{metric.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500 group-hover:text-slate-700">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High Fidelity Mockup Dashboard */}
        <div className="relative animate-float lg:ml-4">
          <div className="absolute inset-0 bg-radial-glow blur-2xl pointer-events-none" />

          {/* Base Mockup Container */}
          <div className="glass-panel relative rounded-4xl border border-pink-100 bg-white/80 p-5 shadow-[0_24px_70px_rgba(244,114,182,0.14)]">
            {/* Header elements */}
            <div className="mb-4 flex items-center justify-between border-b border-pink-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
                  <Activity className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold tracking-wide text-slate-900">SatuData Patient Hub</h4>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {walletConnected ? "0xPasien...89AB" : "Belum Terhubung"}</p>
                </div>
              </div>
              {walletConnected ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Disconnected
                </div>
              )}
            </div>

            {/* Content area with conditional blur overlay */}
            <div className="relative">
              {!walletConnected && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/90 p-6 text-center backdrop-blur-xs border border-pink-100 shadow-lg shadow-pink-100/60">
                  <Wallet className="h-10 w-10 text-pink-500 mb-3 animate-bounce" />
                  <h5 className="text-sm font-bold text-slate-900">Hubungkan Wallet Anda</h5>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-55">
                    SatuData memerlukan MetaMask untuk mengesahkan persetujuan rekam medis Anda.
                  </p>
                  <button
                    onClick={() => setWalletConnected(true)}
                    className="mt-4 rounded-full bg-linear-to-r from-[#7F1D1D] to-[#A61B2D] px-5 py-2 text-xs font-bold text-white hover:from-[#8E2A3B] hover:to-[#7A1526] transition cursor-pointer"
                  >
                    Hubungkan MetaMask
                  </button>
                </div>
              )}

              <div className={!walletConnected ? "filter blur-xs select-none pointer-events-none transition duration-300" : "transition duration-300"}>
                {/* Patient Info Card */}
                <div className="mb-4 rounded-2xl bg-white p-4 border border-pink-100 shadow-[0_8px_20px_rgba(244,114,182,0.08)]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-pink-500">Pasien Utama</p>
                    <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md border border-pink-100">NIK Terverifikasi</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Budi Santoso, S.Kom</h3>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="rounded-lg bg-pink-50 p-1.5 border border-pink-100">
                      <p className="text-slate-500">Golongan Darah</p>
                      <p className="font-bold text-pink-600 mt-0.5">O RH+</p>
                    </div>
                    <div className="rounded-lg bg-pink-50 p-1.5 border border-pink-100">
                      <p className="text-slate-500">Alergi Obat</p>
                      <p className="font-bold text-pink-600 mt-0.5">Penicillin</p>
                    </div>
                    <div className="rounded-lg bg-pink-50 p-1.5 border border-pink-100">
                      <p className="text-slate-500">Tinggi / Berat</p>
                      <p className="font-bold text-pink-600 mt-0.5">173cm / 68kg</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Access Request Modal (FOCAL POINT) */}
                <div className="relative overflow-hidden rounded-2xl border border-pink-200 bg-pink-50 p-4 shadow-[0_10px_28px_rgba(244,114,182,0.14)]">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-radial-glow blur-md" />
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-pink-100 text-pink-500">
                        <Key className="h-3 w-3" />
                      </span>
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-900">Permintaan Izin Rekam Medis</h5>
                        <p className="text-[9px] text-slate-500">Oleh: RS Cipto Mangunkusumo</p>
                      </div>
                    </div>
                    <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[8px] font-bold text-pink-600">
                      Perlu Tindakan
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-600 leading-normal">
                    Meminta akses data: Diagnosis, Resep Obat, dan Hasil Lab (2024 - 2026) untuk Kunjungan Klinik Bedah.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href="#simulator"
                      className="flex-1 rounded-lg bg-pink-500 px-3 py-1.5 text-center text-[10px] font-bold text-white transition hover:bg-pink-400"
                    >
                      Buka Simulator & Setujui
                    </a>
                    <button className="rounded-lg bg-white border border-pink-100 px-3 py-1.5 text-center text-[10px] font-semibold text-slate-500 transition hover:bg-pink-50 hover:text-slate-800">
                      Tolak
                    </button>
                  </div>
                </div>

                {/* Blockchain Audit Trail Log preview */}
                <div className="mt-4">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-pink-500 mb-2 flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-pink-500" />
                    Audit Trail Blockchain
                  </p>
                  <div className="space-y-1.5 text-[9px] font-mono">
                    <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-slate-500 border border-pink-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        <span>0x9f12...a3bc</span>
                      </span>
                      <span>Consent Granted to dr. Amanda Sp.PD</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-slate-500 border border-pink-100">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        <span>0x5f81...e2c4</span>
                      </span>
                      <span>EHR Encrypted & Uploaded (RS Harapan Kita)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}