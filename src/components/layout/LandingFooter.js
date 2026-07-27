import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, Radio, Server, FileText, Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-linear-to-b from-slate-50 to-slate-100/80 pt-16 pb-10 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xs ring-1 ring-slate-200">
                <Image
                  src="/images/logo.png"
                  alt="Satu Data logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <span className="text-sm font-extrabold uppercase tracking-widest text-slate-900 block">Satu Data</span>
                <span className="text-[10px] font-bold text-rose-800">Sovereign Health Infrastructure</span>
              </div>
            </a>

            <p className="text-slate-500 leading-relaxed max-w-sm">
              SatuData adalah platform pertukaran rekam medis elektronik (RME) terdesentralisasi berstandar 2026 berbasis *patient-consent*. Menjamin kedaulatan data medis pasien dan efisiensi operasional fasilitas kesehatan.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-800">
                <ShieldCheck className="h-4 w-4 text-rose-700" />
                Sesuai UU PDP No. 27/2022
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800">
                <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                SATUSEHAT v2.5 Ready
              </div>
            </div>
          </div>

          {/* Column 1: Navigasi Sistem */}
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3.5 uppercase tracking-wider text-[11px]">Navigasi Utama</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/" className="hover:text-rose-800 transition">Beranda Utama</Link>
              </li>
              <li>
                <Link href="/faskes" className="hover:text-rose-800 transition">Peta Sebaran Faskes</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-rose-800 transition">Tanya Jawab (FAQ)</Link>
              </li>
              <li>
                <Link href="/#fitur" className="hover:text-rose-800 transition">Fitur Infrastruktur</Link>
              </li>
              <li>
                <Link href="/#alur" className="hover:text-rose-800 transition">Alur Pendaftaran</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Akses & Portal */}
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3.5 uppercase tracking-wider text-[11px]">Akses Portal</h4>
            <ul className="space-y-2.5 font-medium">
              <li>
                <Link href="/auth/login" className="hover:text-rose-800 transition">Masuk Portal (Login)</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-rose-800 transition">Daftar Pasien Baru</Link>
              </li>
              <li>
                <Link href="/auth/forgot-password" className="hover:text-rose-800 transition">Lupa Kata Sandi</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Keamanan & Web3 */}
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3.5 uppercase tracking-wider text-[11px]">Infrastruktur & Web3</h4>
            <ul className="space-y-2.5 font-medium">
              <li><span className="text-slate-650">Smart Contract EIP-2771</span></li>
              <li><span className="text-slate-650">Off-chain Enkripsi AES-256</span></li>
              <li><span className="text-slate-650">Sovereign Data Storage</span></li>
              <li>
                <Link href="/faq" className="text-rose-800 font-bold hover:underline transition">Bantuan & FAQ (/faq)</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[11px]">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} <strong className="font-bold text-slate-800">Satu Data</strong>. Kedaulatan Rekam Medis Indonesia.
          </p>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
            <span>Build v2.5.0</span>
            <span>•</span>
            <span>Next.js 16 App Router</span>
            <span>•</span>
            <span className="text-rose-800 font-bold">SATUSEHAT Integrated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
