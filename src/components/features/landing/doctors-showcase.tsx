'use client';

import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Stethoscope } from 'lucide-react';
import { getDoctors } from '@/services/doctor-service';
import Link from 'next/link';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1594824813571-24a69c100d37?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
];

export const DoctorsShowcase: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBackendDoctors();
  }, []);

  const fetchBackendDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      const apiData = res?.success && Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      if (apiData && apiData.length > 0) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const formatted = apiData.map((d: any, index: number) => {
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
            rating: d.rating || '4.9',
            experience: d.experience ? `${d.experience} thn` : d.pengalaman ? `${d.pengalaman} thn` : '8+ thn',
            image: imgUrl,
          };
        });
        setDoctors(formatted.slice(0, 4));
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data dokter dari backend:', err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-6 sm:py-10 lg:py-14 reveal-on-scroll">
      <div className="flex flex-col gap-2.5 sm:gap-4 md:flex-row md:items-end md:justify-between mb-6 sm:mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 sm:px-3.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-teal-800 mb-2">
            <Stethoscope className="h-3.5 w-3.5 text-teal-700 shrink-0" />
            <span>Dokter Spesialis</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tim Dokter <span className="text-teal-700">Terpercaya</span>
          </h2>
        </div>

        <Link
          href="/doctor"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] sm:text-xs font-bold text-slate-700 hover:border-teal-300 hover:text-teal-800 hover:bg-teal-50/50 transition cursor-pointer self-start md:self-auto shadow-2xs"
        >
          Lihat Semua Dokter <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-2.5">
              <div className="rounded-2xl sm:rounded-[28px] bg-slate-200 aspect-[4/4.5] w-full" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-8 bg-slate-200 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
          Belum ada data dokter terdaftar di sistem.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="group flex flex-col">
              <div className="relative rounded-2xl sm:rounded-[28px] overflow-hidden aspect-[4/4.5] border border-slate-200/80 bg-slate-100 shadow-xs group-hover:shadow-md transition duration-300">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 bg-white/95 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-extrabold text-slate-800 shadow-xs flex items-center gap-1 border border-slate-100">
                  <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{doctor.rating}</span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold text-white shadow-xs border border-white/10">
                  {doctor.experience}
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3.5 space-y-0.5 sm:space-y-1">
                <p className="text-[10px] sm:text-xs font-extrabold text-teal-700 tracking-wide truncate">{doctor.specialist}</p>
                <h3 className="text-xs sm:text-base font-extrabold text-slate-900 line-clamp-1">{doctor.name}</h3>
              </div>

              <Link
                href="/faskes"
                className="mt-2 sm:mt-3 w-full py-2 sm:py-2.5 rounded-full bg-teal-50 hover:bg-teal-100/90 text-teal-800 text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 border border-teal-100 cursor-pointer"
              >
                Profil <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DoctorsShowcase;
