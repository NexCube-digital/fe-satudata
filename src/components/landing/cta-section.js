import { Building, ArrowRight, Activity } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-rose-200/40 bg-linear-to-r from-[#7F1D1D] via-[#A61B2D] to-[#4C0B14] px-6 py-12 text-white shadow-[0_20px_60px_rgba(127,29,29,0.16)] sm:px-10 lg:px-14 lg:py-16">
      {/* Decorative Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.15),transparent_40%)]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-white/5 blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
        {/* Heart rate visual icon */}
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white backdrop-blur-xs">
          <Activity className="h-6 w-6 animate-pulse" />
        </span>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Siap Mengintegrasikan Faskes Anda ke SatuData?
        </h2>
        
        <p className="max-w-2xl text-sm leading-relaxed text-pink-50 sm:text-base">
          Tingkatkan keamanan data pasien, penuhi standar kepatuhan SATUSEHAT, dan percepat administrasi medis klinik Anda dengan teknologi desentralisasi SatuData.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3.5 sm:flex-row pt-4">
          <a
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-pink-600 shadow-lg shadow-pink-200/40 transition-all duration-200 hover:bg-pink-50 hover:scale-[1.02] hover:shadow-xl"
          >
            <Building className="h-4.5 w-4.5" />
            Daftarkan Rumah Sakit / Klinik
          </a>
          <a
            href="mailto:partner@satudata.id"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10"
          >
            Hubungi Tim Teknis Kami
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
