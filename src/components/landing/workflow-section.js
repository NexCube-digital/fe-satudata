"use client";

import { useState, useEffect } from "react";
import { workflowSteps } from "./landing-data";
import { ChevronRight, ShieldCheck, Lock, Key, Wallet, FileText, CheckCircle2, Sparkles, Activity } from "lucide-react";

const stepIcons = [
  Wallet,      // Step 01: Registrasi & Wallet
  FileText,    // Step 02: Request Akses
  Key,         // Step 03: Approve Transaksi
  Lock         // Step 04: Dekripsi Data Medis
];

const stepBadges = [
  "NIK & EIP-712 Signature",
  "API SATUSEHAT v2.5",
  "Meta-Transaction EIP-2771",
  "Off-Chain AES-256 Key"
];

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through steps continuously every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="alur" className="w-full my-2 mb-10 sm:mb-16 lg:mb-20">
      {/* Full-Frame Unified 1-Frame Container */}
      <div className="glass-panel w-full rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
        {/* Ambient Soft Emerald Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#0D9488]/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#0284C7]/5 blur-3xl" />

        {/* Section Header Inside Full-Frame */}
        <div className="w-full mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-[#E6F4F1] px-3.5 py-1 text-xs font-bold text-[#0D9488] mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" />
            Alur Keamanan Data End-to-End
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#334155] leading-tight tracking-tight">
            Bagaimana SatuData Mengamankan Rekam Medis Anda?
          </h2>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#64748B] max-w-3xl">
            Dari otentikasi identitas NIK hingga pencatatan audit trail Smart Contract, sistem dirancang dengan asas *Privacy by Design* untuk menjamin kedaulatan informasi pasien.
          </p>
        </div>

        {/* Full-Width Automatic Glowing Line Pulse Indicator */}
        <div className="relative mb-8 z-10 w-full">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-teal-400 transition-all duration-700 ease-in-out shadow-[0_0_15px_#0D9488]"
              style={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }}
            />
          </div>
          {/* Animated Traveling Pulse Dot */}
          <div
            className="absolute -top-1 transition-all duration-700 ease-in-out hidden sm:block"
            style={{ left: `calc(${((activeStep + 1) / workflowSteps.length) * 100}% - 12px)` }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9488] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0D9488] shadow-[0_0_10px_#0D9488]"></span>
            </span>
          </div>
        </div>

        {/* 4 Interactive Step Cards Grid - Full Width Spanning */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full relative z-10">
          {workflowSteps.map((step, index) => {
            const Icon = stepIcons[index];
            const isActive = activeStep === index;

            return (
              <div
                key={step.step}
                onClick={() => setActiveStep(index)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-300 cursor-pointer w-full ${
                  isActive
                    ? "border-[#0D9488] bg-[#E6F4F1]/60 shadow-lg ring-2 ring-[#0D9488]/20 -translate-y-1"
                    : "border-[#E2E8F0] bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-md"
                }`}
              >
                {/* Active Indicator Top Pulse Bar */}
                {isActive && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0D9488] to-[#0F766E] rounded-t-2xl shadow-[0_2px_8px_rgba(13,148,136,0.4)]" />
                )}

                <div>
                  {/* Step Bubble Header */}
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
                      isActive
                        ? "border-[#0D9488] bg-[#0D9488] text-white shadow-md shadow-teal-500/20 scale-105"
                        : "border-teal-200 bg-white text-[#0D9488] shadow-2xs group-hover:scale-105"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-extrabold font-mono uppercase block ${
                        isActive ? "text-[#0D9488]" : "text-[#64748B]"
                      }`}>
                        STEP {step.step}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full mt-0.5 animate-pulse">
                          <Activity className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-sm font-extrabold transition-colors mb-2 ${
                    isActive ? "text-[#0D9488]" : "text-[#334155] group-hover:text-[#0D9488]"
                  }`}>
                    {step.title}
                  </h3>

                  <p className={`text-xs leading-relaxed transition-colors ${
                    isActive ? "text-[#334155] font-medium" : "text-[#64748B]"
                  }`}>
                    {step.text}
                  </p>
                </div>

                {/* Tech Badge Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border ${
                    isActive
                      ? "bg-white text-[#0D9488] border-teal-200 shadow-2xs"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {stepBadges[index]}
                  </span>

                  {index < workflowSteps.length - 1 && (
                    <ChevronRight className={`h-4 w-4 hidden lg:block transition ${
                      isActive ? "text-[#0D9488] translate-x-1" : "text-slate-300 group-hover:text-teal-400"
                    }`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full-Width Dynamic Active Step Detail Banner */}
        <div className="mt-8 w-full rounded-2xl border border-teal-200/80 bg-[#E6F4F1]/70 p-4 sm:p-5 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D9488] text-white shadow-md shadow-teal-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#334155] uppercase tracking-wider">
                Penjelasan Alur Tahap 0{activeStep + 1}: <span className="text-[#0D9488]">{workflowSteps[activeStep].title}</span>
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5 font-medium leading-relaxed">
                {workflowSteps[activeStep].text}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-teal-200 px-3 py-1.5 text-xs font-bold text-[#0D9488] shadow-2xs font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Verified Protocol
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
