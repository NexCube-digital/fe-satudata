import { Building, ArrowRight, Activity, ShieldCheck } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#0D9488]/40 bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-teal-950 px-5 py-8 sm:px-10 sm:py-14 lg:px-14 lg:py-16 text-white shadow-xl reveal-scale my-2 mb-10 sm:mb-16 lg:mb-20">
      {/* Decorative Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-teal-500/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-3.5 sm:space-y-5">
        {/* Visual icon */}
        <span className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-xs">
          <Activity className="h-4.5 w-4.5 sm:h-6 sm:w-6 animate-pulse text-teal-200" />
        </span>

        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/10 px-3 sm:px-3.5 py-1 text-[10px] sm:text-xs font-semibold text-teal-100">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-200 shrink-0" />
          <span className="truncate">SATUSEHAT & Web3 Sovereign Protocol</span>
        </div>

        <h2 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Siap Mengintegrasikan Faskes Anda ke SatuData?
        </h2>
        
        <p className="max-w-2xl text-xs sm:text-sm leading-normal sm:leading-relaxed text-teal-100/90 font-medium">
          Tingkatkan kedaulatan data pasien, penuhi standar kepatuhan SATUSEHAT Kemenkes, dan percepat otorisasi medis klinik Anda dengan teknologi desentralisasi SatuData.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 w-full sm:w-auto pt-2">
          <a
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white px-5 py-3 sm:px-7 sm:py-3.5 text-xs font-extrabold text-[#0F766E] shadow-md transition-all duration-200 hover:bg-teal-50 hover:scale-[1.02]"
          >
            <Building className="h-4 w-4 text-[#0D9488]" />
            Daftarkan Rumah Sakit / Klinik
          </a>
          <a
            href="/auth/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-white/30 bg-white/10 px-5 py-3 sm:px-7 sm:py-3.5 text-xs font-bold text-white transition-all duration-200 hover:bg-white/20"
          >
            Masuk Portal Pasien
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
