import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/LandingFooter';

export default function FAQPage() {
  const faqs = [
    {
      q: 'Apa itu SatuData?',
      a: 'SatuData adalah platform rekam medis terpadu berbasis blockchain yang menghubungkan Pasien, Fasilitas Kesehatan (Faskes), dan Tenaga Medis.',
    },
    {
      q: 'Bagaimana kebersihan dan keamanan data rekam medis dijaga?',
      a: 'Setiap rekam medis diverifikasi menggunakan hash cryptographic yang ditambatkan ke Ethereum Sepolia Smart Contract.',
    },
    {
      q: 'Apakah pasien memiliki kontrol atas izin akses rekam medis?',
      a: 'Ya, pasien memiliki akses penuh (Sovereign Health Consent) untuk menyetujui atau menghentikan izin akses rekam medis oleh Faskes.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Frequently Asked Questions (FAQ)</h1>
        <p className="text-sm text-slate-500 mb-8">Pertanyaan yang sering diajukan mengenai sistem SatuData & EMR Blockchain.</p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
