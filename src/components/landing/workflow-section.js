import { workflowSteps } from "./landing-data";
import { ChevronRight, ShieldCheck } from "lucide-react";

export default function WorkflowSection() {
  return (
    <section id="alur" className="glass-panel rounded-3xl border border-slate-200/80 bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-14 lg:py-12">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-800 mb-3">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-600" />
          Alur Keamanan Data End-to-End
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Bagaimana SatuData Mengamankan Rekam Medis Anda?
        </h2>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
          Dari otentikasi identitas NIK hingga pencatatan audit trail Smart Contract, sistem dirancang dengan asas *Privacy by Design* untuk menjamin kedaulatan informasi pasien.
        </p>
      </div>

      {/* Horizontal Steps Grid */}
      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <div key={step.step} className="group relative flex flex-col items-start rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-2xs transition-all duration-300 hover:bg-white hover:border-rose-300 hover:shadow-md">
            {/* Step Bubble Indicator */}
            <div className="flex items-center justify-between w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white text-xs font-extrabold text-rose-800 shadow-2xs group-hover:scale-105 transition duration-200">
                {step.step}
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">STEP {step.step}</span>
            </div>

            {/* Content */}
            <h3 className="mt-5 text-sm font-extrabold text-slate-900 group-hover:text-rose-900 transition-colors">
              {step.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 group-hover:text-slate-600">
              {step.text}
            </p>

            {/* Connective arrows (Desktop only, omit for last item) */}
            {index < workflowSteps.length - 1 && (
              <div className="absolute -right-3.5 top-9 z-10 hidden text-rose-400 lg:block">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
