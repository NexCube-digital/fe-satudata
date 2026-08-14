'use client';

import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api-client';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

export default function FaskesRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRequests = async () => {
    try {
      const res = await apiGet('/api/hospital/consent/requests');
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const columns = [
    { header: 'Nama Pasien', accessor: 'patientName' as const },
    { header: 'Dokter Pengaju', accessor: 'doctorName' as const },
    { header: 'Tujuan Akses', accessor: 'reason' as const },
    { header: 'Status Consent', accessor: (row: any) => <Badge variant={row.status === 'approved' ? 'success' : 'warning'}>{row.status || 'pending'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Permintaan Izin Akses Medis</h1>
        <p className="text-xs text-slate-500 mt-1">Permintaan izin buka rekam medis pasien oleh dokter Faskes.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat permintaan izin akses...</div>
      ) : (
        <Table columns={columns} data={requests} emptyMessage="Belum ada permintaan izin akses." />
      )}
    </div>
  );
}
