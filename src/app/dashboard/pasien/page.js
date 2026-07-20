"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, FileText, Settings, Home } from "lucide-react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";

export default function PasienDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Akses Ditolak</h1>
          <p className="text-slate-600 mb-6">Silakan login terlebih dahulu.</p>
          <Link href="/auth/login" className="text-pink-600 hover:text-pink-700 font-semibold">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Pasien" onLogout={handleLogout} />
      
      <div className="flex flex-1">
        <Sidebar role="pasien" />
        
        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Selamat Datang, {user.name}!</h1>
          <p className="text-slate-600">Dashboard Pasien - Kelola data kesehatan Anda</p>
        </div>

        {/* User Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-lg font-semibold text-slate-800">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Tipe Akun</p>
                <p className="text-lg font-semibold text-slate-800">Pasien</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-semibold text-slate-800">Aktif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Fitur Pasien</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600 text-sm font-bold">✓</span>
                Lihat rekam medis Anda
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600 text-sm font-bold">✓</span>
                Bagikan akses data ke fasilitas kesehatan
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600 text-sm font-bold">✓</span>
                Monitor riwayat kesehatan
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600 text-sm font-bold">✓</span>
                Kelola pengaturan privasi
              </li>
            </ul>
          </div>

          <div className="bg-linear-to-br from-pink-50 to-fuchsia-50 rounded-xl border border-pink-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Informasi Penting</h2>
            <p className="text-slate-700 mb-4">
              Dashboard Pasien Anda sedang dalam pengembangan. Fitur-fitur lengkap akan segera tersedia untuk memberikan pengalaman terbaik dalam mengelola data kesehatan Anda.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition font-medium text-sm"
            >
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}
