'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import { Heart, ShieldCheck, FileSpreadsheet, Activity } from 'lucide-react';

export default function PasienDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiGet('/api/dashboard/patient/stats');
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
        <h1 className="text-2xl font-bold text-slate-900">Portal Ringkasan Kesehatan Pasien</h1>
        <p className="text-xs text-slate-500 mt-1">Sovereign Health EMR & Blockchain Access Control.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Rekam Medis Saya</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_documents || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Faskes Terhubung</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.connected_hospitals || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Permintaan Akses Baru</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.pending_requests || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
