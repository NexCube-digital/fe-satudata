'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMedicalRecordById } from '@/services/medical-record-service';
import TxHashLink from '@/components/shared/tx-hash-link';

export default function MedicalRecordDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRecord() {
      if (!id) return;
      try {
        const res = await getMedicalRecordById(id);
        if (res.success) {
          setRecord(res.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadRecord();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400 font-semibold">Memuat detail rekam medis...</div>;
  }

  if (!record) {
    return <div className="py-12 text-center text-xs text-slate-400 font-semibold">Rekam medis tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Detail Rekam Medis #{record.id}</h1>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500 font-medium">Nama Pasien</p>
            <p className="font-bold text-slate-900">{record.patientName || record.patient_id}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Dokter DPJP</p>
            <p className="font-bold text-slate-900">{record.doctorName || record.doctor_id}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Jenis Pelayanan</p>
            <p className="font-bold text-teal-800 uppercase">{record.recordType || 'Rajal'}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Blockchain Hash</p>
            <TxHashLink txHash={record.txHash || record.tx_hash} />
          </div>
        </div>
      </div>
    </div>
  );
}
