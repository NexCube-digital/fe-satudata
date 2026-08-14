'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Stethoscope,
  Pill,
  DollarSign,
  ShieldAlert,
  Settings,
  Activity,
  History,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  role?: string;
  className?: string;
}

export default function Sidebar({ role = 'pasien', className = '' }: SidebarProps) {
  const pathname = usePathname();

  const patientLinks = [
    { href: '/dashboard/pasien', label: 'Ringkasan Pasien', icon: LayoutDashboard },
    { href: '/dashboard/pasien/records', label: 'Rekam Medis Mandiri', icon: FileText },
    { href: '/dashboard/pasien/consent', label: 'Kontrol Persetujuan (Consent)', icon: Lock },
    { href: '/dashboard/pasien/history', label: 'Riwayat Akses Rekam Medis', icon: History },
    { href: '/dashboard/pasien/settings', label: 'Pengaturan Akun', icon: Settings },
  ];

  const faskesLinks = [
    { href: '/dashboard/faskes', label: 'Overview Faskes', icon: LayoutDashboard },
    { href: '/dashboard/faskes/patient-flow', label: 'Alur Pelayanan Pasien', icon: Activity },
    { href: '/dashboard/faskes/medical-records', label: 'Rekam Medis (EMR)', icon: FileText },
    { href: '/dashboard/faskes/patients', label: 'Data Pasien Faskes', icon: Users },
    { href: '/dashboard/faskes/doctor/list', label: 'Manajemen Dokter', icon: Stethoscope },
    { href: '/dashboard/faskes/pharmacy/inventory', label: 'Farmasi & Stok Obat', icon: Pill },
    { href: '/dashboard/faskes/finance/layanan', label: 'Tarif & Keuangan', icon: DollarSign },
    { href: '/dashboard/faskes/audit', label: 'Audit Trail Faskes', icon: ShieldAlert },
    { href: '/dashboard/faskes/settings', label: 'Profil Faskes', icon: Settings },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/faskes', label: 'Manajemen Faskes', icon: Building2 },
    { href: '/dashboard/admin/users', label: 'Manajemen Pengguna', icon: Users },
    { href: '/dashboard/admin/logs', label: 'Audit Trail System', icon: ShieldAlert },
    { href: '/dashboard/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  let links = patientLinks;
  if (role === 'faskes' || role === 'hospital' || role === 'doctor' || role === 'staff') {
    links = faskesLinks;
  } else if (role === 'admin' || role === 'superadmin') {
    links = adminLinks;
  }

  return (
    <aside className={`w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0 ${className}`}>
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Navigasi Utama
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white shadow-md shadow-teal-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
        <div className="text-[11px] font-bold text-slate-700">SatuData EHR Security</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Blockchain Sepolia Verified</div>
      </div>
    </aside>
  );
}
