'use client';

import React from 'react';
import { BadgeCheck, Database, ShieldCheck, Wallet, Sparkles } from 'lucide-react';
import { capabilities } from './landing-data';

const iconMap: Record<string, any> = {
  kontrol: ShieldCheck,
  enkripsi: Database,
  gas: Wallet,
  revoke: BadgeCheck,
};

export const FeatureGrid: React.FC = () => {
  return (
    <section id="fitur" className="py-6 sm:py-8 space-y-4 sm:space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2 mb-4 sm:mb-8 reveal-on-scroll px-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-teal-800">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span>Keunggulan Utama Platform</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hybrid Web3 & SATUSEHAT
        </h2>
        <p className="text-[11px] sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Keamanan terdesentralisasi Smart Contract & enkripsi data terpadu AES-256.
        </p>
      </div>

      <div className="grid gap-3.5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((item) => {
          const Icon = iconMap[item.icon] || ShieldCheck;

          return (
            <article
              key={item.title}
              className="group relative rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-950/5 flex flex-col justify-between reveal-scale"
            >
              <div className="absolute top-0 right-0 h-16 w-16 sm:h-20 sm:w-20 bg-teal-500/5 blur-xl group-hover:bg-teal-500/10 transition duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-900/20 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </div>

                <h3 className="mt-3 sm:mt-5 text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-teal-900 transition-colors duration-200">
                  {item.title}
                </h3>

                <p className="mt-1.5 sm:mt-2 text-xs leading-relaxed text-slate-500 group-hover:text-slate-600">
                  {item.text}
                </p>
              </div>

              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-slate-400">
                <span>SATUSEHAT Protocol</span>
                <span className="text-[#16A34A] font-mono">100% Verified</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeatureGrid;
