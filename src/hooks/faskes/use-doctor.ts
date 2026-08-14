'use client';

import { useState, useEffect } from 'react';
import { getDoctors } from '@/services/doctor-service';
import { Doctor } from '@/types/faskes';

export function useDoctor() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDoctors();
      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      } else {
        setDoctors([]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dokter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, refetch: fetchDoctors };
}

export default useDoctor;
