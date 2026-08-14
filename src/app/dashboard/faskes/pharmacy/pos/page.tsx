'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/utils/formatters';

export default function PharmacyPosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [namaObat, setNamaObat] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [harga, setHarga] = useState<number>(10000);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaObat) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        namaObat,
        qty: Number(qty),
        harga: Number(harga),
        subtotal: Number(qty) * Number(harga),
      },
    ]);
    setNamaObat('');
    setQty(1);
  };

  const totalAmount = items.reduce((acc, curr) => acc + curr.subtotal, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kasir Point of Sale (POS) Apotek</h1>
        <p className="text-xs text-slate-500 mt-1">Transaksi penjualan obat langsung di Apotek Faskes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAddItem} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800">Tambah Obat ke Keranjang</h3>
          <Input label="Nama Obat" value={namaObat} onChange={(e) => setNamaObat(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah (Qty)" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} required />
            <Input label="Harga Satuan (Rp)" type="number" value={harga} onChange={(e) => setHarga(Number(e.target.value))} required />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            + Tambah
          </Button>
        </form>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800">Item Pembelian</h3>
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Keranjang masih kosong.</div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs border-b pb-2">
                  <div>
                    <p className="font-bold text-slate-900">{item.namaObat}</p>
                    <p className="text-slate-500">{item.qty} x {formatRupiah(item.harga)}</p>
                  </div>
                  <p className="font-bold text-teal-800">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center font-bold text-sm pt-4 border-t">
                <span>Total Bayar</span>
                <span className="text-emerald-700 text-lg">{formatRupiah(totalAmount)}</span>
              </div>
              <Button variant="primary" className="w-full mt-4">
                Proses Pembayaran POS
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
