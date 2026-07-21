import { Building, ArrowRight, Activity, ShieldCheck } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-950 px-6 py-12 text-white shadow-xl sm:px-10 lg:px-14 lg:py-16">
      {/* Decorative Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-rose-500/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-5">
        {/* Visual icon */}
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-sm">
          <Activity className="h-6 w-6 animate-pulse text-rose-300" />
        </span>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-rose-200">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-300" />
          SATUSEHAT & Web3 Sovereign Protocol
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
          Siap Mengintegrasikan Faskes Anda ke SatuData?
        </h2>
        
        <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-rose-100/90 font-medium">
          Tingkatkan kedaulatan data pasien, penuhi standar kepatuhan SATUSEHAT Kemenkes, dan percepat otorisasi medis klinik Anda dengan teknologi desentralisasi SatuData.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3.5 sm:flex-row pt-3">
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-xs font-extrabold text-rose-950 shadow-md transition-all duration-200 hover:bg-rose-50 hover:scale-[1.02]"
          >
            <Building className="h-4 w-4 text-rose-800" />
            Daftarkan Rumah Sakit / Klinik
          </a>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-xs font-bold text-white transition-all duration-200 hover:bg-white/20"
          >
            Masuk Portal Pasien
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
