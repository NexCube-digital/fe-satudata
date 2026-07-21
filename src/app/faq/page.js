"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Lock, 
  Database, 
  Wallet, 
  Building2, 
  User, 
  Mail, 
  MessageSquare, 
  ExternalLink,
  CheckCircle2,
  FileText,
  Sparkles
} from "lucide-react";
import { faqQuestions } from "@/components/landing/landing-data";

export default function FAQPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState(1);

  const categories = [
    { id: "all", label: "Semua Pertanyaan", icon: HelpCircle },
    { id: "privasi", label: "Keamanan & Privasi", icon: ShieldCheck },
    { id: "web3", label: "Web3 & Smart Contract", icon: Database },
    { id: "pasien", label: "Panduan Pasien", icon: User },
    { id: "faskes", label: "Integrasi Faskes & API", icon: Building2 },
  ];

  const filteredFaqs = faqQuestions.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pt-16 sm:pt-20">
      <Navbar walletConnected={walletConnected} setWalletConnected={setWalletConnected} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        
        {/* Banner Hero FAQ & Search Box */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-500/10 blur-[80px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold text-rose-200">
              <Sparkles className="h-4 w-4 text-rose-300 animate-pulse" />
              Pusat Bantuan & Dokumentasi Terpadu
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Ada yang Bisa Kami Bantu?
            </h1>

            <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl mx-auto leading-relaxed">
              Cari jawaban seputar enkripsi rekam medis AES-256, kedaulatan hak akses pasien, integrasi SATUSEHAT, dan dompet MetaMask Web3.
            </p>

            {/* Search Input Bar */}
            <div className="relative max-w-xl mx-auto pt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pertanyaan... (cth: AES-256, MetaMask, Gas Fee, NIK)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/30 bg-white px-11 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-lg focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-rose-800 to-red-900 text-white shadow-md shadow-rose-900/20"
                    : "bg-white border border-slate-200/80 text-slate-600 hover:bg-rose-50 hover:text-rose-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-rose-300" : "text-slate-400"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Menampilkan {filteredFaqs.length} Pertanyaan
            </h2>
            {searchTerm && (
              <p className="text-xs text-rose-800 font-bold">
                Kata kunci: "{searchTerm}"
              </p>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-3">
              <HelpCircle className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Pertanyaan Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Coba gunakan kata kunci lain seperti "gas fee", "smart contract", "NIK", atau "faskes".
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-bold text-rose-800"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-rose-300 bg-white shadow-md ring-1 ring-rose-300/50"
                        : "border-slate-200/80 bg-white/90 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 text-[10px] font-bold">
                          {faq.categoryLabel}
                        </span>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-rose-800" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 text-xs leading-relaxed text-slate-600 border-t border-slate-100 mt-1 pt-3 animate-in fade-in duration-200 space-y-3">
                        <p>{faq.answer}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Diverifikasi Tim Pengembang SatuData
                          </span>
                          <span>Apakah jawaban ini membantu?</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Support Options Cards */}
        <div className="pt-6 border-t border-slate-200/80">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-extrabold text-slate-900">Belum Menemukan Jawaban?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tim dukungan teknis dan spesialis privasi medis kami siap membantu Anda 24/7.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-100">
                <Mail className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Bantuan Email Teknis</h4>
              <p className="text-xs text-slate-500">Kirimkan pertanyaan atau kendala integrasi API Faskes ke tim teknis kami.</p>
              <a href="mailto:support@satudata.id" className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 hover:underline">
                support@satudata.id <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-md transition space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Dokumentasi REST API v2.5</h4>
              <p className="text-xs text-slate-500">Panduan integrasi Web3 SDK, endpoint NIK SATUSEHAT, dan arsitektur hybrid.</p>
              <Link href="/dashboard/faskes" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline">
                Lihat Panduan Integrasi <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-md transition space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Portal Pasien & Consent</h4>
              <p className="text-xs text-slate-500">Kelola izin rekam medis secara langsung dari dashboard akun pasien Anda.</p>
              <Link href="/dashboard/pasien" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline">
                Buka Portal Pasien <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
