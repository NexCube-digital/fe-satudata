import { BadgeCheck, Database, ShieldCheck, Wallet } from "lucide-react";
import { capabilities } from "./landing-data";

const iconMap = {
  kontrol: ShieldCheck,
  enkripsi: Database,
  gas: Wallet,
  revoke: BadgeCheck,
};

export default function FeatureGrid() {
  return (
    <section id="fitur" className="grid gap-6 md:grid-cols-3 py-4">
      {capabilities.map((item) => {
        const Icon = iconMap[item.icon];

        return (
          <article
            key={item.title}
            className="group glass-panel relative rounded-[2rem] border border-pink-100/80 p-8 shadow-[0_20px_55px_rgba(244,114,182,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_28px_70px_rgba(244,114,182,0.16)] hover:border-pink-300"
          >
            {/* Soft decorative background glow on hover */}
            <div className="absolute inset-0 bg-radial-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#7F1D1D] to-[#A61B2D] text-white shadow-md shadow-rose-200 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 group-hover:text-pink-600 transition-colors duration-200">
                {item.title}
              </h3>
              <p className="mt-3.5 text-sm leading-relaxed text-slate-500 group-hover:text-slate-600">
                {item.text}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
