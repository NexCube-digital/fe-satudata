'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'faskes' || user.role === 'doctor' || user.role === 'staff') {
        router.push('/dashboard/faskes');
      } else {
        router.push('/dashboard/pasien');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="py-12 text-center text-xs text-slate-400 font-semibold">
      Mengarahkan ke Dashboard Anda...
    </div>
  );
}
