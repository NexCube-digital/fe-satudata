'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FormRajal from '@/components/features/faskes/medical-records/forms/FormRajal';
import FormRanap from '@/components/features/faskes/medical-records/forms/FormRanap';
import FormIGD from '@/components/features/faskes/medical-records/forms/FormIGD';
import { createMedicalRecordDraft } from '@/services/medical-record-service';

export default function UploadMedicalRecordPage() {
  const router = useRouter();
  const [formType, setFormType] = useState<'rajal' | 'ranap' | 'igd'>('rajal');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const res = await createMedicalRecordDraft({
        recordType: formType,
        ...formData,
      });
      if (res.success) {
        router.push('/dashboard/faskes/medical-records');
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Rekam Medis Baru</h1>
        <p className="text-xs text-slate-500 mt-1">Isi formulir rekam medis elektronik sesuai jenis pelayanan medis.</p>
      </div>

      <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl">
        {[
          { key: 'rajal', label: 'Rawat Jalan' },
          { key: 'ranap', label: 'Rawat Inap' },
          { key: 'igd', label: 'Gawat Darurat (IGD)' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFormType(item.key as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              formType === item.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {formType === 'rajal' && <FormRajal onSubmit={handleFormSubmit} onCancel={() => router.back()} />}
      {formType === 'ranap' && <FormRanap onSubmit={handleFormSubmit} onCancel={() => router.back()} />}
      {formType === 'igd' && <FormIGD onSubmit={handleFormSubmit} onCancel={() => router.back()} />}
    </div>
  );
}
