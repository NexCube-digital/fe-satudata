'use client';

import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import Table from '@/components/ui/table';
import TxHashLink from '@/components/shared/tx-hash-link';

export default function PasienHistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await apiGet('/api/patient/history');
        if (res.success && Array.isArray(res.data)) {
          setLogs(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const columns = [
    { header: 'Aktivitas / Event', accessor: 'action' as const },
    { header: 'Aktor / Faskes', accessor: 'actor' as const },
    { header: 'Tx Hash Blockchain', accessor: (row: any) => <TxHashLink txHash={row.txHash || row.tx_hash} /> },
    { header: 'Waktu', accessor: 'created_at' as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Aktivitas & Consent Log</h1>
        <p className="text-xs text-slate-500 mt-1">Audit log aktivitas rekam medis dan transaksi blockchain Anda.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat riwayat aktivitas...</div>
      ) : (
        <Table columns={columns} data={logs} emptyMessage="Belum ada riwayat aktivitas." />
      )}
    </div>
  );
}
