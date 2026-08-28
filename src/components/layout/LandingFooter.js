import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, Radio, Server, FileText, Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] to-slate-100/80 pt-8 pb-6 sm:pt-16 sm:pb-10 text-xs text-[#64748B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-5 mb-8 sm:mb-12">
          {/* Brand Info (Full Width on Mobile) */}
          <div className="col-span-2 md:col-span-2 space-y-3 sm:space-y-4 mb-2 sm:mb-0">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-2xs ring-1 ring-slate-200">
                <Image
                  src="/images/logo.png"
                  alt="Satu Data logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#334155] block">Satu Data</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#0D9488]">Sovereign Health Infrastructure</span>
              </div>
            </a>

            <p className="text-[#64748B] text-xs leading-relaxed max-w-sm">
              SatuData adalah platform pertukaran rekam medis elektronik (RME) terdesentralisasi berstandar 2026 berbasis *patient-consent*. Menjamin kedaulatan data medis pasien dan efisiensi operasional fasilitas kesehatan.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-teal-200 bg-[#E6F4F1] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-[#0D9488]">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0D9488]" />
                Sesuai UU PDP No. 27/2022
              </div>
              <div className="flex items-center gap-1.5 rounded-lg sm:rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-800">
                <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 animate-pulse" />
                SATUSEHAT v2.5 Ready
              </div>
            </div>
          </div>

          {/* Column 1: Navigasi Utama */}
          <div className="col-span-1">
            <h4 className="font-extrabold text-[#334155] mb-2.5 sm:mb-3.5 uppercase tracking-wider text-[10px] sm:text-[11px]">Navigasi Utama</h4>
            <ul className="space-y-2 font-medium text-[11px] sm:text-xs">
              <li>
                <Link href="/" className="hover:text-[#0D9488] transition">Beranda Utama</Link>
              </li>
              <li>
                <Link href="/faskes" className="hover:text-[#0D9488] transition">Peta Sebaran Faskes</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#0D9488] transition">Tanya Jawab (FAQ)</Link>
              </li>
              <li>
                <Link href="/#fitur" className="hover:text-[#0D9488] transition">Fitur Infrastruktur</Link>
              </li>
              <li>
                <Link href="/#alur" className="hover:text-[#0D9488] transition">Alur Pendaftaran</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Akses & Portal */}
          <div className="col-span-1">
            <h4 className="font-extrabold text-[#334155] mb-2.5 sm:mb-3.5 uppercase tracking-wider text-[10px] sm:text-[11px]">Akses Portal</h4>
            <ul className="space-y-2 font-medium text-[11px] sm:text-xs">
              <li>
                <Link href="/auth/login" className="hover:text-[#0D9488] transition">Masuk Portal (Login)</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#0D9488] transition">Daftar Pasien Baru</Link>
              </li>
              <li>
                <Link href="/auth/forgot-password" className="hover:text-[#0D9488] transition">Lupa Kata Sandi</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Keamanan & Web3 (Full Width or Column) */}
          <div className="col-span-2 sm:col-span-1 mt-2 sm:mt-0">
            <h4 className="font-extrabold text-[#334155] mb-2.5 sm:mb-3.5 uppercase tracking-wider text-[10px] sm:text-[11px]">Infrastruktur & Web3</h4>
            <ul className="space-y-2 font-medium text-[11px] sm:text-xs flex flex-wrap sm:flex-col gap-x-4 gap-y-2 sm:gap-x-0">
              <li><span className="text-slate-650">Smart Contract EIP-2771</span></li>
              <li><span className="text-slate-650">Off-chain Enkripsi AES-256</span></li>
              <li><span className="text-slate-650">Sovereign Data Storage</span></li>
              <li>
                <Link href="/faq" className="text-[#0D9488] font-bold hover:underline transition">Bantuan & FAQ (/faq)</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-[#E2E8F0] pt-6 sm:pt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left text-[10px] sm:text-[11px]">
          <p className="text-[#64748B] font-medium">
            © {new Date().getFullYear()} <strong className="font-bold text-[#334155]">Satu Data</strong>. Kedaulatan Rekam Medis Indonesia.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-[#64748B] font-mono text-[9px] sm:text-[10px]">
            <span>Build v2.5.0</span>
            <span>•</span>
            <span>Next.js 16 App Router</span>
            <span>•</span>
            <span className="text-[#0D9488] font-bold">SATUSEHAT Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
