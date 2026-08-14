'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import { Stethoscope, FileHeart, Users, CreditCard } from 'lucide-react';

export default function FaskesDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiGet('/api/dashboard/hospital/stats');
        if (res.success) {
          setStats(res.data || {});
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Fasilitas Kesehatan</h1>
        <p className="text-xs text-slate-500 mt-1">Overview operasional pelayanan medis & manajemen rekam medis.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Pasien</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_patients || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Dokter Aktif</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_doctors || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
            <FileHeart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Rekam Medis (EHR)</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_records || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Izin Akses Pending</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.request_pending || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
