'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user session:', e);
      }
    }
    setLoading(false);
  }, []);

  const isStaff = (user as any)?.role === 'staf_rs' || user?.role === 'staff';
  const userPerms = (user as any)?.staff_profile?.permissions || (user as any)?.permissions || null;

  const hasPermission = (code: string): boolean => {
    if (!isStaff) return true;
    if (!Array.isArray(userPerms)) return false;
    return userPerms.includes(code);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return {
    user,
    setUser,
    loading,
    isStaff,
    userPerms,
    hasPermission,
    handleLogout,
  };
}

export default useAuth;
