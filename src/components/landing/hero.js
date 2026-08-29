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
    <section id="top" className="w-full my-2 mb-10 sm:mb-16 lg:mb-20">
      {/* 1 Frame Container */}
      <div className="glass-panel w-full rounded-3xl border border-teal-100/80 bg-white p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[calc(100vh-6.5rem)] lg:min-h-0">
        {/* Brand Partnership Logos (Separate frames per logo, responsive layout) */}
        <div className="flex lg:absolute top-0 lg:top-8 left-0 lg:left-12 items-center justify-center lg:justify-start gap-2.5 sm:gap-3 z-10 pt-1 lg:pt-0 mb-4 lg:mb-0 w-full lg:w-auto overflow-x-auto overflow-y-hidden scrollbar-none py-1">
          <div className="bg-white/95 backdrop-blur-md h-[48px] sm:h-[60px] lg:h-[72px] px-3 sm:px-4 rounded-xl sm:rounded-2xl shadow-2xs flex items-center justify-center shrink-0 border border-slate-100">
            <img src="/images/logo.png" alt="SatuData" className="h-12 sm:h-16 lg:h-22 w-auto object-contain" />
          </div>
          
          <div className="bg-white/95 backdrop-blur-md h-[48px] sm:h-[60px] lg:h-[72px] px-3 sm:px-4 rounded-xl sm:rounded-2xl shadow-2xs flex items-center justify-center shrink-0 border border-slate-100">
            <img src="/images/satusehat.jfif" alt="SatuSehat" className="h-8 sm:h-11 lg:h-14 w-auto object-contain" />
          </div>
          
          <div className="bg-white/95 backdrop-blur-md h-[48px] sm:h-[60px] lg:h-[72px] w-[120px] sm:w-[150px] lg:w-[160px] rounded-xl sm:rounded-2xl shadow-2xs flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
            <img src="/images/kemenkes.jfif" alt="Kemenkes" className="h-10 sm:h-14 lg:h-18 w-auto object-contain scale-[1.5] lg:scale-[1.6] transform-gpu" />
          </div>
        </div>

        {/* Background glowing gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,148,136,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(15,118,110,0.06),transparent_35%)]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-800/10 blur-[120px]" />

        <div className="relative grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 z-10 my-auto">
          {/* Left Column: Heading and Info (Centered on Mobile, Left-aligned on Desktop) */}
          <div className="space-y-4 sm:space-y-6 reveal-left flex flex-col items-center justify-center text-center lg:items-start lg:text-left pt-4 lg:pt-24 max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-[#E6F4F1]/80 px-3.5 py-1 text-[11px] sm:text-xs font-semibold tracking-wide text-[#0D9488] shadow-2xs max-w-full">
              <Sparkles className="h-3.5 w-3.5 text-[#0D9488] animate-pulse shrink-0" />
              <span className="truncate">Integrasi Official SATUSEHAT Kemenkes & Web3</span>
            </div>

            <div className="space-y-2.5 sm:space-y-3 w-full">
              <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#0D9488]">
                SatuData Healthcare Hub v2.5
              </p>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl/tight font-extrabold tracking-tight text-slate-950">
                Data Kesehatan Anda, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-teal-950 bg-clip-text text-transparent">
                  100% Hak Kendali Anda.
                </span>
              </h1>
              <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600 mx-auto lg:mx-0">
                Platform manajemen rekam medis berbasis blockchain yang memberikan persetujuan eksplisit digital kepada pasien. Rumah sakit atau dokter hanya dapat membaca data medis Anda setelah mendapatkan verifikasi otorisasi Smart Contract.
              </p>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col gap-3.5 sm:flex-row justify-center lg:justify-start w-full sm:w-auto">
              <a
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0F766E] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-teal-900/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-900/30"
              >
                Mulai Sekarang
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Column: High Fidelity Mockup Dashboard (Hidden on Mobile) */}
          <div className="relative lg:ml-4 reveal-right hidden lg:block">
            <div className="absolute inset-0 bg-radial-glow blur-2xl pointer-events-none" />

            {/* Base Mockup Container */}
            <div className="glass-panel relative rounded-3xl border border-[#E2E8F0] bg-white/95 p-5 shadow-[0_24px_70px_rgba(13,148,136,0.14)] animate-float">
              {/* Header elements */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F4F1] text-[#0D9488] border border-teal-200">
                    <Activity className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold tracking-wide text-[#334155]">SatuData Patient Hub</h4>
                    <p className="text-[10px] text-[#64748B] font-mono">ID: {walletConnected ? "0x3171...0002" : "Mode Tamu"}</p>
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
                    className="flex items-center gap-1.5 rounded-full bg-[#E6F4F1] px-2.5 py-1 text-[10px] font-bold text-[#0D9488] border border-teal-200 hover:bg-teal-100 transition cursor-pointer"
                  >
                    <Wallet className="h-3 w-3" />
                    Konek MetaMask
                  </button>
                )}
              </div>

              {/* Content area */}
              <div className="relative space-y-4">
                {/* Patient Info Card */}
                <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-[#E2E8F0]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-[#0D9488]">Pasien Terverifikasi</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/80 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> NIK Active
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[#334155]">Budi Santoso, S.Kom</h3>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="rounded-xl bg-white p-2 border border-slate-200/80">
                      <p className="text-[#64748B] font-semibold">Gol. Darah</p>
                      <p className="font-extrabold text-[#334155] mt-0.5">O RH+</p>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-slate-200/80">
                      <p className="text-[#64748B] font-semibold">Alergi Obat</p>
                      <p className="font-extrabold text-[#D97706] mt-0.5">Penicillin</p>
                    </div>
                    <div className="rounded-xl bg-white p-2 border border-slate-200/80">
                      <p className="text-[#64748B] font-semibold">Dokumen EHR</p>
                      <p className="font-extrabold text-[#0D9488] mt-0.5">14 Berkas</p>
                    </div>
                  </div>
                </div>

                {/* Live Interactive Consent Request Box */}
                <div className="relative overflow-hidden rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl bg-[#E6F4F1] text-[#0D9488] border border-teal-100">
                        <Key className="h-4 w-4" />
                      </span>
                      <div>
                        <h5 className="text-xs font-extrabold text-[#334155]">Permintaan Izin Rekam Medis</h5>
                        <p className="text-[10px] text-[#64748B] font-medium">Pemohon: RS Cipto Mangunkusumo</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                      consentStatus === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : consentStatus === "rejected"
                        ? "bg-teal-50 text-[#0D9488] border border-teal-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {consentStatus === "approved" ? "Izin Diberikan" : consentStatus === "rejected" ? "Izin Ditolak" : "Pending Action"}
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] text-[#64748B] leading-normal">
                    Permohonan hak akses data: Diagnosis, Resep Obat, dan Hasil Lab untuk Poli Bedah.
                  </p>

                  {/* Interactive Action Buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    {consentStatus === "pending" ? (
                      <>
                        <button
                          onClick={handleApprove}
                          className="flex-1 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#0F766E] px-3 py-2 text-center text-[10px] font-extrabold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
                        >
                          Setujui & Tandatangani (Web3)
                        </button>
                        <button
                          onClick={handleReject}
                          className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center text-[10px] font-bold text-[#64748B] hover:bg-slate-200 transition cursor-pointer"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center text-[10px] font-bold text-[#334155] hover:bg-slate-200 transition cursor-pointer"
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
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-[#0D9488]" />
                    Audit Trail Blockchain Real-time
                  </p>
                  <div className="space-y-1.5 text-[9px] font-mono">
                    <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-2.5 py-1.5 text-[#64748B] border border-[#E2E8F0]">
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
      </div>
    </section>
  );
}