'use client';

import React from 'react';
import Link from 'next/link';
import { useMedicalRecords } from '@/hooks/faskes/use-medical-records';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import TxHashLink from '@/components/shared/tx-hash-link';

export default function FaskesMedicalRecordsPage() {
  const { records, loading } = useMedicalRecords();

  const columns = [
    { header: 'ID Rekam Medis', accessor: 'id' as const },
    { header: 'Nama Pasien', accessor: (row: any) => row.patientName || row.patient_id },
    { header: 'Dokter DPJP', accessor: (row: any) => row.doctorName || row.doctor_id },
    { header: 'Jenis Layanan', accessor: (row: any) => <Badge variant="info">{row.recordType || 'rajal'}</Badge> },
    { header: 'Tgl Kunjungan', accessor: (row: any) => row.visitDate || row.created_at },
    { header: 'Verifikasi Blockchain', accessor: (row: any) => <TxHashLink txHash={row.txHash || row.tx_hash} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rekam Medis Pasien (EMR)</h1>
          <p className="text-xs text-slate-500 mt-1">Daftar rekam medis elektronik Faskes terverifikasi blockchain.</p>
        </div>
        <Link
          href="/dashboard/faskes/medical-records/upload"
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold text-xs shadow-xs transition"
        >
          + Upload Baru
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat data rekam medis...</div>
      ) : (
        <Table columns={columns} data={records} emptyMessage="Belum ada rekam medis terdaftar." />
      )}
    </div>
  );
}
