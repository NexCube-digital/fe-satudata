'use client';

import React from 'react';
import { workflowSteps } from './landing-data';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  return (
    <section id="alur" className="glass-panel rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-8 lg:px-12 lg:py-10 shadow-xs">
      <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0 mb-4 sm:mb-8 reveal-on-scroll">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-teal-800 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0" />
          <span>Alur Keamanan Data</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Sistem Keamanan Rekam Medis
        </h2>
        <p className="mt-1.5 text-[11px] sm:text-sm leading-relaxed text-slate-500">
          Verifikasi NIK hingga pencatatan Smart Contract untuk menjamin kedaulatan data pasien.
        </p>
      </div>

      <div className="relative grid gap-3.5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <div key={step.step} className="group relative flex flex-col items-start rounded-xl sm:rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 shadow-2xs transition-all duration-300 hover:bg-white hover:border-teal-300 hover:shadow-md reveal-scale">
            <div className="flex items-center justify-between w-full">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-teal-200 bg-white text-xs font-extrabold text-teal-800 shadow-2xs group-hover:scale-105 transition duration-200">
                {step.step}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 font-mono">STEP {step.step}</span>
            </div>

            <h3 className="mt-3 sm:mt-5 text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-teal-900 transition-colors">
              {step.title}
            </h3>
            <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-500 group-hover:text-slate-600">
              {step.text}
            </p>

            {index < workflowSteps.length - 1 && (
              <div className="absolute -right-3.5 top-9 z-10 hidden text-teal-400 lg:block">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkflowSection;
