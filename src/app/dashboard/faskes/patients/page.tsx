'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import { maskNik } from '@/lib/utils/masking';

export default function FaskesPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await apiGet('/api/hospital/patients');
        if (res.success && Array.isArray(res.data)) {
          setPatients(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  const columns = [
    { header: 'Nama Pasien', accessor: 'nama' as const },
    { header: 'NIK', accessor: (row: any) => maskNik(row.nik || '') },
    { header: 'No Telepon', accessor: 'no_telp' as const },
    { header: 'Alamat', accessor: 'alamat' as const },
    { header: 'Status', accessor: (row: any) => <Badge variant="success">Terdaftar</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Pasien Faskes</h1>
        <p className="text-xs text-slate-500 mt-1">Data master pasien terhubung di Faskes ini.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat daftar pasien...</div>
      ) : (
        <Table columns={columns} data={patients} emptyMessage="Belum ada pasien terdaftar." />
      )}
    </div>
  );
}
