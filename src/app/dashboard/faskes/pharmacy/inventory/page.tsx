'use client';

import React, { useState, useEffect } from 'react';
import { getMedicines } from '@/services/pharmacy-service';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import { formatRupiah } from '@/lib/utils/formatters';

export default function PharmacyInventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMedicines() {
      try {
        const res = await getMedicines();
        if (res.success && Array.isArray(res.data)) {
          setMedicines(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadMedicines();
  }, []);

  const columns = [
    { header: 'Kode Obat', accessor: 'kodeObat' as const },
    { header: 'Nama Obat', accessor: 'namaObat' as const },
    { header: 'Kategori', accessor: 'kategori' as const },
    { header: 'Stok', accessor: (row: any) => <Badge variant={row.stok < 10 ? 'warning' : 'success'}>{row.stok} {row.satuan}</Badge> },
    { header: 'Harga Jual', accessor: (row: any) => formatRupiah(row.hargaJual || 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Katalog & Stok Obat Farmasi</h1>
        <p className="text-xs text-slate-500 mt-1">Daftar obat-obatan terdaftar di depo apotek Faskes.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat stok obat...</div>
      ) : (
        <Table columns={columns} data={medicines} emptyMessage="Belum ada obat di inventaris." />
      )}
    </div>
  );
}
