import { workflowSteps } from "./landing-data";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function WorkflowSection() {
  return (
    <section id="alur" className="glass-panel rounded-[2.5rem] bg-white px-6 py-12 shadow-[0_20px_80px_rgba(225,29,72,0.03)] sm:px-10 lg:px-14 lg:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-pink-600">Alur Keamanan Data</p>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
          Bagaimana SatuData Mengamankan Rekam Medis Anda?
        </h2>
        <p className="mt-3.5 text-sm leading-relaxed text-slate-500">
          Dari registrasi pasien hingga pencatatan audit trail blockchain, sistem kami dirancang dengan prinsip *privacy-first* untuk memastikan data tidak dapat diakses tanpa persetujuan eksplisit.
        </p>
      </div>

      {/* Horizontal Steps Grid */}
      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <div key={step.step} className="group relative flex flex-col items-start rounded-3xl border border-pink-100 bg-pink-50/20 p-6 transition-all duration-350 hover:bg-pink-50/50 hover:border-pink-200">
            {/* Step Bubble Indicator */}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-200 bg-white text-sm font-extrabold text-pink-600 shadow-xs shadow-pink-100 transition-transform duration-300 group-hover:scale-105">
              {step.step}
            </div>

            {/* Content */}
            <h3 className="mt-6 text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
              {step.title}
            </h3>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500 group-hover:text-slate-600">
              {step.text}
            </p>

            {/* Connective arrows (Desktop only, omit for last item) */}
            {index < workflowSteps.length - 1 && (
              <div className="absolute -right-3.5 top-9 z-10 hidden text-pink-300 lg:block animate-pulse">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
