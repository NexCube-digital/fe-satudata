'use client';

import React, { useState, useEffect } from 'react';
import { getInvoices } from '@/services/finance-service';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import { formatRupiah } from '@/lib/utils/formatters';

export default function FinanceInvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await getInvoices();
        if (res.success && Array.isArray(res.data)) {
          setInvoices(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const columns = [
    { header: 'No Invoice', accessor: 'noInvoice' as const },
    { header: 'Nama Pasien', accessor: 'patientName' as const },
    { header: 'Total Tagihan', accessor: (row: any) => formatRupiah(row.totalAmount || 0) },
    { header: 'Status Pembayaran', accessor: (row: any) => <Badge variant={row.status === 'paid' ? 'success' : 'warning'}>{row.status || 'Unpaid'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoice & Tagihan Pasien</h1>
        <p className="text-xs text-slate-500 mt-1">Kelola tagihan pelayanan medis, penunjang, dan kamar inap.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat invoice tagihan...</div>
      ) : (
        <Table columns={columns} data={invoices} emptyMessage="Belum ada invoice diterbitkan." />
      )}
    </div>
  );
}
