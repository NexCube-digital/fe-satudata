'use client';

import React from 'react';
import { useDoctor } from '@/hooks/faskes/use-doctor';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';

export default function FaskesDoctorPage() {
  const { doctors, loading } = useDoctor();

  const columns = [
    { header: 'Nama Dokter', accessor: 'nama' as const },
    { header: 'NIP / SIP', accessor: (row: any) => row.nip || row.sip || '-' },
    { header: 'Spesialisasi', accessor: 'spesialisasi' as const },
    { header: 'Status', accessor: (row: any) => <Badge variant="success">Aktif</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Dokter & Tenaga Medis</h1>
        <p className="text-xs text-slate-500 mt-1">Kelola dokter dan spesialisasi pelayanan Faskes.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat daftar dokter...</div>
      ) : (
        <Table columns={columns} data={doctors} emptyMessage="Belum ada dokter terdaftar." />
      )}
    </div>
  );
}
