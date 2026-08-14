'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import { Users, FileText, Building2, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiGet('/api/dashboard/admin/stats');
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
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Administrator</h1>
        <p className="text-xs text-slate-500 mt-1">Overview tata kelola sistem SatuData & EMR Blockchain.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Pengguna</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_users || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Faskes</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_hospitals || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Rekam Medis (EHR)</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.total_records || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Blockchain Tx</p>
            <h3 className="text-xl font-extrabold text-slate-900">{loading ? '...' : stats.blockchain_transactions || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
