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
      <div className="glass-panel w-full rounded-3xl border border-[#E2E8F0] bg-white p-4 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
        {/* Ambient Soft Emerald Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#0D9488]/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#0284C7]/5 blur-3xl" />

        {/* Section Header Inside 1 Frame */}
        <div className="max-w-3xl mb-4 sm:mb-10 relative z-10 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-[#E6F4F1] px-3 sm:px-3.5 py-1 text-[10px] sm:text-xs font-bold text-[#0D9488] mb-2 sm:mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
            Keunggulan Utama Platform
          </div>
          <h2 className="text-lg sm:text-3xl lg:text-4xl font-extrabold text-[#334155] leading-tight tracking-tight">
            Arsitektur Hybrid Web3 & SATUSEHAT
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Kombinasi keamanan terdesentralisasi Smart Contract dan efisiensi penyimpanan terenkripsi AES-256 untuk kedaulatan data medis Indonesia.
          </p>
        </div>

        {/* 4 Feature Cards Grid (2-Cols Ultra Compact on Mobile, 4-Cols on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 w-full relative z-10">
          {capabilities.map((item) => {
            const Icon = iconMap[item.icon];

            return (
              <article
                key={item.title}
                className="group relative rounded-xl sm:rounded-2xl border border-[#E2E8F0] bg-slate-50/50 p-2.5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-teal-300 hover:shadow-md flex flex-col justify-between reveal-scale"
              >
                {/* Top Ambient Light Glow */}
                <div className="absolute top-0 right-0 h-14 sm:h-20 w-14 sm:w-20 bg-teal-500/5 blur-xl group-hover:bg-teal-500/10 transition duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-md shadow-teal-900/20 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-3.5 w-3.5 sm:h-5.5 sm:w-5.5" />
                  </div>

                  <h3 className="mt-2 sm:mt-5 text-[11px] sm:text-base font-extrabold text-[#334155] group-hover:text-[#0D9488] transition-colors duration-200 leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs leading-tight sm:leading-relaxed text-[#64748B] group-hover:text-slate-600 font-medium hidden sm:block">
                    {item.text}
                  </p>
                </div>

                <div className="mt-2 sm:mt-5 pt-1.5 sm:pt-3 border-t border-slate-200/60 flex items-center justify-between text-[8px] sm:text-[10px] font-bold text-[#64748B]">
                  <span className="hidden sm:inline">SATUSEHAT Protocol</span>
                  <span className="inline-flex items-center gap-1 text-[#0D9488] font-mono ml-auto sm:ml-0">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-600" />
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
