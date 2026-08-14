'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import TxHashLink from '@/components/shared/tx-hash-link';

export default function PasienRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRecords() {
      try {
        const res = await apiGet('/api/patient/medical-records');
        if (res.success && Array.isArray(res.data)) {
          setRecords(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  const columns = [
    { header: 'Fasilitas Kesehatan', accessor: (row: any) => row.faskesName || row.faskes_id },
    { header: 'Dokter DPJP', accessor: (row: any) => row.doctorName || row.doctor_id },
    { header: 'Jenis Pelayanan', accessor: (row: any) => <Badge variant="info">{row.recordType || 'Rajal'}</Badge> },
    { header: 'Tanggal Kunjungan', accessor: 'visitDate' as const },
    { header: 'Verifikasi Blockchain', accessor: (row: any) => <TxHashLink txHash={row.txHash || row.tx_hash} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rekam Medis Saya (Personal EMR)</h1>
        <p className="text-xs text-slate-500 mt-1">Riwayat medis terverifikasi blockchain dari seluruh Faskes terhubung.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat rekam medis Anda...</div>
      ) : (
        <Table columns={columns} data={records} emptyMessage="Belum ada rekam medis terdaftar." />
      )}
    </div>
  );
}
