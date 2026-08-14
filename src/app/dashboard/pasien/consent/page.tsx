'use client';

import React, { useState, useEffect } from 'react';
import { apiGet, apiPut } from '@/lib/api-client';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

export default function PasienConsentPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRequests = async () => {
    try {
      const res = await apiGet('/api/patient/consent/requests');
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

  const handleAction = async (id: string | number, status: 'approved' | 'rejected') => {
    try {
      await apiPut(`/api/patient/consent/${id}`, { status });
      loadRequests();
    } catch (err) {}
  };

  const columns = [
    { header: 'Fasilitas Kesehatan', accessor: (row: any) => row.hospitalName || row.hospital_id },
    { header: 'Tujuan Akses', accessor: 'reason' as const },
    { header: 'Status', accessor: (row: any) => <Badge variant={row.status === 'approved' ? 'success' : 'warning'}>{row.status || 'pending'}</Badge> },
    {
      header: 'Tindakan (Consent)',
      accessor: (row: any) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => handleAction(row.id, 'approved')}>
              Setujui
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleAction(row.id, 'rejected')}>
              Tolak
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-semibold">Sudah Diproses</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kontrol Izin Akses (Consent Management)</h1>
        <p className="text-xs text-slate-500 mt-1">Kelola pemberian dan pencabutan izin akses rekam medis oleh Faskes.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat permintaan izin akses...</div>
      ) : (
        <Table columns={columns} data={requests} emptyMessage="Tidak ada permintaan izin akses pending." />
      )}
    </div>
  );
}
