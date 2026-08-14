'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';

export default function FaskesStaffsPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStaffs() {
      try {
        const res = await apiGet('/api/hospital/staffs');
        if (res.success && Array.isArray(res.data)) {
          setStaffs(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadStaffs();
  }, []);

  const columns = [
    { header: 'Nama Staf', accessor: 'nama' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Jabatan / Peran', accessor: 'jabatan' as const },
    { header: 'Status', accessor: (row: any) => <Badge variant="success">Aktif</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Staf & Non-Medis Faskes</h1>
        <p className="text-xs text-slate-500 mt-1">Kelola akun staf registrasi, kasir, dan apoteker.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat daftar staf...</div>
      ) : (
        <Table columns={columns} data={staffs} emptyMessage="Belum ada staf terdaftar." />
      )}
    </div>
  );
}
