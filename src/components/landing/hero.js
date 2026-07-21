"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, Activity, Key, CheckCircle, Database, Wallet, Sparkles, Lock, RefreshCw, XCircle } from "lucide-react";

export default function Hero({ walletConnected, setWalletConnected }) {
  const [consentStatus, setConsentStatus] = useState("pending"); // "pending", "approved", "rejected"
  const [txHash, setTxHash] = useState(null);

  const handleApprove = () => {
    setConsentStatus("approved");
    const newHash = "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxHash(newHash);
  };

  const handleReject = () => {
    setConsentStatus("rejected");
  };

  const handleReset = () => {
    setConsentStatus("pending");
    setTxHash(null);
  };

  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-3xl border border-rose-100/80 bg-white px-6 py-6 text-slate-900 shadow-[0_20px_70px_rgba(244,114,182,0.08)] sm:px-8 lg:min-h-[calc(100vh-7.5rem)] lg:px-12 lg:py-8 flex flex-col justify-center"
    >
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(225,29,72,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rose-800/10 blur-[120px]" />

      <div className="relative grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10">
        {/* Left Column: Heading and Info */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-rose-800 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
            Integrasi Official SATUSEHAT Kemenkes & Web3 Sovereign
          </div>

          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.4em] text-rose-800">
              SatuData Healthcare Hub v2.5
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl/tight">
              Data Kesehatan Anda, <br />
              <span className="bg-gradient-to-r from-rose-800 via-red-900 to-rose-950 bg-clip-text text-transparent">
                100% Hak Kendali Anda.
              </span>
            </h1>
            <p className="max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Platform manajemen rekam medis berbasis blockchain yang memberikan persetujuan eksplisit digital kepada pasien. Rumah sakit atau dokter hanya dapat membaca data medis Anda setelah mendapatkan verifikasi otorisasi Smart Contract.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-800 to-red-900 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-rose-900/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-900/30"
            >
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#panel"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Coba Live Simulator
            </a>
          </div>
        </div>

        {/* Right Column: High Fidelity Mockup Dashboard */}
        <div className="relative lg:ml-4">
          <div className="absolute inset-0 bg-radial-glow blur-2xl pointer-events-none" />

          {/* Base Mockup Container */}
          <div className="glass-panel relative rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(244,114,182,0.14)]">
            {/* Header elements */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-800 border border-rose-100">
                  <Activity className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide text-slate-900">SatuData Patient Hub</h4>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {walletConnected ? "0x3171...0002" : "Mode Tamu"}</p>
                </div>
              </div>
              {walletConnected ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  MetaMask Ready
                </div>
              ) : (
                <button 
                  onClick={() => setWalletConnected(true)}
                  className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-800 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                >
                  <Wallet className="h-3 w-3" />
                  Konek MetaMask
                </button>
              )}
            </div>

            {/* Content area */}
            <div className="relative space-y-4">
              {/* Patient Info Card */}
              <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-rose-800">Pasien Terverifikasi</p>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/80 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> NIK Active
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Budi Santoso, S.Kom</h3>
                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="rounded-xl bg-white p-2 border border-slate-200/80">
                    <p className="text-slate-400 font-semibold">Gol. Darah</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">O RH+</p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-slate-200/80">
                    <p className="text-slate-400 font-semibold">Alergi Obat</p>
                    <p className="font-extrabold text-rose-600 mt-0.5">Penicillin</p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-slate-200/80">
                    <p className="text-slate-400 font-semibold">Dokumen EHR</p>
                    <p className="font-extrabold text-emerald-600 mt-0.5">14 Berkas</p>
                  </div>
                </div>
              </div>

              {/* Live Interactive Consent Request Box */}
              <div className="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-800 border border-rose-100">
                      <Key className="h-4 w-4" />
                    </span>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900">Permintaan Izin Rekam Medis</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Pemohon: RS Cipto Mangunkusumo</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                    consentStatus === "approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : consentStatus === "rejected"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {consentStatus === "approved" ? "Izin Diberikan" : consentStatus === "rejected" ? "Izin Ditolak" : "Pending Action"}
                  </span>
                </div>

                <p className="mt-2 text-[10px] text-slate-600 leading-normal">
                  Permohonan hak akses data: Diagnosis, Resep Obat, dan Hasil Lab untuk Poli Bedah.
                </p>

                {/* Interactive Action Buttons */}
                <div className="mt-3 flex items-center gap-2">
                  {consentStatus === "pending" ? (
                    <>
                      <button
                        onClick={handleApprove}
                        className="flex-1 rounded-xl bg-gradient-to-r from-rose-800 to-red-900 px-3 py-2 text-center text-[10px] font-extrabold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
                      >
                        Setujui & Tandatangani (Web3)
                      </button>
                      <button
                        onClick={handleReject}
                        className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Tolak
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset Simulasi Izin
                    </button>
                  )}
                </div>

                {/* Live TxHash Banner Feedback */}
                {txHash && (
                  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200/80 p-2 text-[9px] font-mono text-emerald-800 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      Tx Hash Verified on Hardhat:
                    </div>
                    <p className="mt-0.5 truncate text-emerald-700">{txHash}</p>
                  </div>
                )}
              </div>

              {/* Blockchain Audit Trail Log preview */}
              <div className="mt-2">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-rose-800" />
                  Audit Trail Blockchain Real-time
                </p>
                <div className="space-y-1.5 text-[9px] font-mono">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-1.5 text-slate-600 border border-slate-200/60">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span>{txHash || "0x9f12...a3bc"}</span>
                    </span>
                    <span className="truncate max-w-[140px] text-right">
                      {consentStatus === "approved" ? "grantAccess() Executed" : "grantAccess() Active"}
                    </span>
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