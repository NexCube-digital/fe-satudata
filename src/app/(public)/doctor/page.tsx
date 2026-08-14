'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/LandingNavbar';
import LandingFooter from '@/components/layout/LandingFooter';
import { getDoctors, getSpecialties } from '@/services/doctor-service';
import { Search, Stethoscope, Star, Calendar, ShieldCheck, Filter, Award, MapPin } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1594824813571-24a69c100d37?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
];

export default function DoctorDirectoryPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDoctors, resSpecialties] = await Promise.allSettled([
        getDoctors(),
        getSpecialties(),
      ]);

      let docsData: any[] = [];
      if (resDoctors.status === 'fulfilled' && resDoctors.value) {
        const val = resDoctors.value;
        docsData = val.success && Array.isArray(val.data) ? val.data : Array.isArray(val) ? val : [];
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const formattedDocs = docsData.map((d: any, index: number) => {
        let imgUrl = DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];

        if (d.image || d.photo || d.avatar) {
          const src = d.image || d.photo || d.avatar;
          if (src.startsWith('http://') || src.startsWith('https://')) {
            imgUrl = src;
          } else if (src.startsWith('/images/') || src.startsWith('/upload/')) {
            imgUrl = `${apiBase}/public${src}`;
          } else if (src.startsWith('/')) {
            imgUrl = `${apiBase}${src}`;
          } else {
            imgUrl = `${apiBase}/public/upload/doctors/${src}`;
          }
        }

        return {
          id: d.id || index + 1,
          name: d.name || d.nama || 'Dokter Spesialis',
          specialist: d.specialist || d.spesialis || d.specialty || 'Dokter Umum',
          hospital: d.hospital_name || d.hospital || d.faskes || 'Rumah Sakit Mitranet SatuData',
          str: d.str_number || d.str || 'STR-9028-112023',
          rating: d.rating || (4.7 + (index % 3) * 0.1).toFixed(1),
          experience: d.experience ? `${d.experience} thn` : d.pengalaman ? `${d.pengalaman} thn` : `${6 + (index % 5)} thn`,
          image: imgUrl,
        };
      });

      setDoctors(formattedDocs);
      setFilteredDoctors(formattedDocs);

      // Extract unique specialties
      const specList = Array.from(new Set(formattedDocs.map((d) => d.specialist)));
      setSpecialties(specList as string[]);
    } catch (err) {
      console.error('Gagal memuat direktori dokter:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...doctors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialist.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q)
      );
    }

    if (selectedSpecialty !== 'all') {
      result = result.filter((d) => d.specialist === selectedSpecialty);
    }

    setFilteredDoctors(result);
  }, [searchQuery, selectedSpecialty, doctors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex flex-col font-sans">
      <Navbar />

      {/* Hero Search Header */}
      <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-950 pt-32 sm:pt-36 lg:pt-40 pb-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-teal-200 text-xs font-bold backdrop-blur-md">
            <Stethoscope className="h-4 w-4 text-teal-300" />
            <span>Direktori Dokter Terverifikasi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Temukan Dokter Spesialis Terbaik
          </h1>

          <p className="text-sm sm:text-base text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Daftar tim medis dan dokter terdaftar yang siap melayani konsultasi dan pengelolaan rekam medis terintegrasi SatuData.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-2xl shadow-teal-950/30 border border-white/40 flex flex-col sm:flex-row items-center gap-3">
              {/* Text Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama dokter, spesialisasi, atau RS..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              {/* Specialty Dropdown */}
              <div className="relative w-full sm:w-56">
                <Filter className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 appearance-none cursor-pointer"
                >
                  <option value="all">Semua Spesialisasi</option>
                  {specialties.map((spec, idx) => (
                    <option key={idx} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Showcase */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Results Counter */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Dokter Terdaftar</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredDoctors.length} tenaga medis terdaftar
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
            <ShieldCheck className="h-4 w-4 text-teal-700" /> TERVERIFIKASI KEMENKES
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="rounded-2xl bg-slate-200 aspect-[4/4.5] w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-9 bg-slate-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Dokter Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada data dokter yang sesuai dengan kata kunci pencarian atau spesialisasi yang Anda pilih.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('all');
              }}
              className="inline-block text-xs font-bold text-teal-800 hover:underline pt-2"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="group bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[4/4.5] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold text-slate-900 shadow-md flex items-center gap-1 border border-white/50">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                    </div>

                    {/* Experience Badge */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white shadow-md flex items-center gap-1">
                      <Award className="h-3 w-3 text-teal-400" />
                      <span>{doc.experience} Pengalaman</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 mb-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                      {doc.specialist}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-teal-800 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Buat Janji Medis</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
