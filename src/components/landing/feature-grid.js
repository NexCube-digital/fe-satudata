import { BadgeCheck, Database, ShieldCheck, Wallet, Sparkles, CheckCircle2 } from "lucide-react";
import { capabilities } from "./landing-data";

const iconMap = {
  kontrol: ShieldCheck,
  enkripsi: Database,
  gas: Wallet,
  revoke: BadgeCheck,
};

export default function FeatureGrid() {
  return (
    <section id="fitur" className="w-full my-2 mb-10 sm:mb-16 lg:mb-20">
      {/* 1 Frame Container */}
      <div className="glass-panel w-full rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
        {/* Ambient Soft Emerald Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#0D9488]/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#0284C7]/5 blur-3xl" />

        {/* Section Header Inside 1 Frame */}
        <div className="max-w-3xl mb-10 relative z-10 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-[#E6F4F1] px-3.5 py-1 text-xs font-bold text-[#0D9488] mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
            Keunggulan Utama Platform
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#334155] leading-tight tracking-tight">
            Arsitektur Hybrid Web3 & SATUSEHAT
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Kombinasi keamanan terdesentralisasi Smart Contract dan efisiensi penyimpanan terenkripsi AES-256 untuk kedaulatan data medis Indonesia.
          </p>
        </div>

        {/* 4 Feature Cards Grid Inside 1 Frame */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full relative z-10">
          {capabilities.map((item) => {
            const Icon = iconMap[item.icon];

            return (
              <article
                key={item.title}
                className="group relative rounded-2xl border border-[#E2E8F0] bg-slate-50/50 p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-950/5 flex flex-col justify-between reveal-scale"
              >
                {/* Top Ambient Light Glow */}
                <div className="absolute top-0 right-0 h-20 w-20 bg-teal-500/5 blur-xl group-hover:bg-teal-500/10 transition duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-md shadow-teal-900/20 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5.5 w-5.5" />
                  </div>

                  <h3 className="mt-5 text-base font-extrabold text-[#334155] group-hover:text-[#0D9488] transition-colors duration-200">
                    {item.title}
                  </h3>
                  
                  <p className="mt-2 text-xs leading-relaxed text-[#64748B] group-hover:text-slate-600 font-medium">
                    {item.text}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-[#64748B]">
                  <span>SATUSEHAT Protocol</span>
                  <span className="inline-flex items-center gap-1 text-[#0D9488] font-mono">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
