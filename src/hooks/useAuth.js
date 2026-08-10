"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user session:", e);
      }
    }
    setLoading(false);
  }, []);

  const isStaff = user?.role === "staf_rs";
  const userPerms = user?.staff_profile?.permissions || user?.permissions || null;

  const hasPermission = (code) => {
    if (!isStaff) return true;
    if (!Array.isArray(userPerms)) return false;
    return userPerms.includes(code);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return {
    user,
    setUser,
    loading,
    isStaff,
    userPerms,
    hasPermission,
    handleLogout
  };
}

export default useAuth;
