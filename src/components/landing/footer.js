import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-slate-50/50 pt-16 pb-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-5 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <a href="#top" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/images/logo.png"
                  alt="Satu Data logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900">Satu Data</span>
            </a>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              SatuData adalah platform infrastruktur pertukaran rekam medis terdesentralisasi berbasis patient-consent. Membantu rumah sakit meningkatkan efisiensi operasional dan menjamin hak privasi pasien.
            </p>
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 w-fit font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Sesuai UU Perlindungan Data Pribadi (PDP)
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3.5">Layanan Utama</h4>
            <ul className="space-y-2.5">
              <li><a href="#panel" className="hover:text-pink-600 transition">Portal Pasien Digital</a></li>
              <li><a href="#panel" className="hover:text-pink-600 transition">Portal Rumah Sakit</a></li>
              <li><a href="#fitur" className="hover:text-pink-600 transition">Manajemen Consent (Persetujuan)</a></li>
              <li><a href="#fitur" className="hover:text-pink-600 transition">Audit Trail Blockchain</a></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3.5">Dokumentasi</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-pink-600 transition">API Integrasi HIS</a></li>
              <li><a href="#" className="hover:text-pink-600 transition">SDK SATUSEHAT</a></li>
              <li><a href="#" className="hover:text-pink-600 transition">Keamanan Enkripsi</a></li>
              <li><a href="#" className="hover:text-pink-600 transition">Audit Keamanan Siber</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3.5">Kebijakan & Hukum</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-pink-600 transition">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-pink-600 transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-pink-600 transition">Kepatuhan Hukum Medis</a></li>
              <li><a href="#" className="hover:text-pink-600 transition">SLA Server API</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-slate-200/60 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[11px]">
          <p>
            © {new Date().getFullYear()} Satu Data. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
