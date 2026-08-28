"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ArrowRight, ShieldCheck, MessageSquare } from "lucide-react";
import { faqQuestions } from "./landing-data";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="glass-panel rounded-3xl border border-[#E2E8F0] bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-14 lg:py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-[#E6F4F1] px-3.5 py-1 text-xs font-bold text-[#0D9488] mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-[#0D9488]" />
            FAQ & Pusat Bantuan
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#334155] tracking-tight">
            Pertanyaan Yang Sering Diajukan
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] max-w-xl">
            Temukan jawaban lengkap mengenai keamanan enkripsi, transparansi Smart Contract, dan integrasi SATUSEHAT.
          </p>
        </div>

        <Link
          href="/faq"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#E6F4F1] border border-teal-200 px-5 py-2.5 text-xs font-extrabold text-[#0F766E] hover:bg-teal-100 transition shrink-0 self-start md:self-auto"
        >
          Buka Halaman Bantuan Lengkap
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3 max-w-4xl mx-auto">
        {faqQuestions.slice(0, 5).map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.id || index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-teal-300 bg-[#E6F4F1]/40 shadow-xs"
                  : "border-[#E2E8F0] bg-slate-50/50 hover:bg-white hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer gap-4"
              >
                <span className="text-xs sm:text-sm font-extrabold text-[#334155] flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-[#0D9488] text-[10px] font-mono">
                    0{index + 1}
                  </span>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#0D9488]" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-0 sm:px-5 sm:pb-5 text-xs leading-relaxed text-[#64748B] border-t border-teal-100/60 mt-1 pt-3 animate-in fade-in duration-200">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
