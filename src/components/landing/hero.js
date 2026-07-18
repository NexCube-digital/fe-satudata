"use client";

import { ArrowRight, ShieldCheck, Activity, Key, CheckCircle, Database, Wallet } from "lucide-react";
import { heroMetrics } from "./landing-data";

export default function Hero({ walletConnected, setWalletConnected }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-[2.5rem] border border-rose-950/20 bg-slate-950 px-6 py-10 text-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] sm:px-10 lg:h-[calc(100vh-9.5rem)] lg:min-h-[640px] lg:px-14 lg:py-8"
    >
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.18),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(225,29,72,0.12),transparent_30%),linear-gradient(135deg,rgba(159,18,57,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-500/10 blur-[120px]" />

      <div className="relative grid h-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
        {/* Left Column: Heading and Info */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-200">
            <ShieldCheck className="h-4 w-4 text-rose-400 animate-pulse" />
            Integrasi SatuSehat & Keamanan Blockchain
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-rose-400/80">
              SatuData Healthcare Hub
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl/tight bg-linear-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Data Kesehatan Anda, <br />
              <span className="bg-linear-to-r from-rose-400 via-red-500 to-amber-500 bg-clip-text text-transparent">
                Sepenuhnya Milik Anda.
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Kedaulatan data medis mutlak di tangan pasien. Hubungkan identitas medis (NIK) dengan dompet MetaMask untuk mengontrol, mengizinkan, atau mencabut hak akses rekam medis Anda secara instan dalam 3 detik.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <a
              href="#simulator"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-red-600 to-rose-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-950/20 transition-all duration-200 hover:from-red-500 hover:to-rose-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-900/30"
            >
              Mulai Simulasi
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-7 py-3.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:bg-slate-900 hover:text-white hover:border-slate-700 cursor-pointer"
            >
              <Wallet className="h-4 w-4 text-rose-500" />
              {walletConnected ? "Wallet Terhubung (0xPasien...)" : "Hubungkan MetaMask"}
            </button>
          </div>

          {/* Hero Metrics */}
          <div className="grid gap-4 border-t border-slate-900 pt-8 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:border-rose-900/30 hover:bg-white/[0.04]">
                <p className="text-xl font-extrabold text-white sm:text-2xl">{metric.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-400 group-hover:text-slate-300">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High Fidelity Mockup Dashboard */}
        <div className="relative animate-float lg:ml-4">
          <div className="absolute inset-0 bg-radial-glow blur-2xl pointer-events-none" />

          {/* Base Mockup Container */}
          <div className="glass-panel-dark relative rounded-[2rem] p-5 shadow-2xl border border-white/5">
            {/* Header elements */}
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/20 text-rose-400">
                  <Activity className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold tracking-wide">SatuData Patient Hub</h4>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {walletConnected ? "0xPasien...89AB" : "Belum Terhubung"}</p>
                </div>
              </div>
              {walletConnected ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Disconnected
                </div>
              )}
            </div>

            {/* Content area with conditional blur overlay */}
            <div className="relative">
              {!walletConnected && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-slate-950/85 p-6 text-center backdrop-blur-xs border border-white/10 shadow-lg">
                  <Wallet className="h-10 w-10 text-rose-500 mb-3 animate-bounce" />
                  <h5 className="text-sm font-bold text-white">Hubungkan Wallet Anda</h5>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
                    SatuData memerlukan MetaMask untuk mengesahkan persetujuan rekam medis Anda.
                  </p>
                  <button
                    onClick={() => setWalletConnected(true)}
                    className="mt-4 rounded-full bg-linear-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white hover:from-red-500 hover:to-rose-500 transition cursor-pointer"
                  >
                    Hubungkan MetaMask
                  </button>
                </div>
              )}

              <div className={!walletConnected ? "filter blur-xs select-none pointer-events-none transition duration-300" : "transition duration-300"}>
                {/* Patient Info Card */}
                <div className="mb-4 rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pasien Utama</p>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">NIK Terverifikasi</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">Budi Santoso, S.Kom</h3>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="rounded-lg bg-white/[0.02] p-1.5 border border-white/5">
                      <p className="text-slate-500">Golongan Darah</p>
                      <p className="font-bold text-rose-400 mt-0.5">O RH+</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] p-1.5 border border-white/5">
                      <p className="text-slate-500">Alergi Obat</p>
                      <p className="font-bold text-rose-400 mt-0.5">Penicillin</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] p-1.5 border border-white/5">
                      <p className="text-slate-500">Tinggi / Berat</p>
                      <p className="font-bold text-rose-400 mt-0.5">173cm / 68kg</p>
                    </div>
                  </div>
                </div>

                {/* Simulated Access Request Modal (FOCAL POINT) */}
                <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-radial-glow blur-md" />
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-rose-500/20 text-rose-400">
                        <Key className="h-3 w-3" />
                      </span>
                      <div>
                        <h5 className="text-[11px] font-bold text-rose-100">Permintaan Izin Rekam Medis</h5>
                        <p className="text-[9px] text-rose-200/70">Oleh: RS Cipto Mangunkusumo</p>
                      </div>
                    </div>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[8px] font-bold text-rose-300">
                      Perlu Tindakan
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-300 leading-normal">
                    Meminta akses data: Diagnosis, Resep Obat, dan Hasil Lab (2024 - 2026) untuk Kunjungan Klinik Bedah.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href="#simulator"
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-center text-[10px] font-bold text-white transition hover:bg-emerald-500"
                    >
                      Buka Simulator & Setujui
                    </a>
                    <button className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-center text-[10px] font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white">
                      Tolak
                    </button>
                  </div>
                </div>

                {/* Blockchain Audit Trail Log preview */}
                <div className="mt-4">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-rose-500" />
                    Audit Trail Blockchain
                  </p>
                  <div className="space-y-1.5 text-[9px] font-mono">
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.01] px-2.5 py-1.5 text-slate-400 border border-white/[0.02]">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        <span>0x9f12...a3bc</span>
                      </span>
                      <span>Consent Granted to dr. Amanda Sp.PD</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/[0.01] px-2.5 py-1.5 text-slate-400 border border-white/[0.02]">
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