'use client';

import { useState, useEffect } from 'react';
import { getHospitalMedicalRecords } from '@/services/medical-record-service';
import { MedicalRecord } from '@/types/medical-record';

export function useMedicalRecords(initialParams: Record<string, any> = {}) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async (params = initialParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHospitalMedicalRecords(params);
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data rekam medis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return { records, loading, error, refetch: fetchRecords };
}

export default useMedicalRecords;
