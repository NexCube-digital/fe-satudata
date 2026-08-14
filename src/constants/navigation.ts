export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export const ADMIN_NAV: NavItem[] = [
  { title: 'Overview', href: '/dashboard/admin', icon: 'LayoutDashboard' },
  { title: 'Kelola User', href: '/dashboard/admin/users', icon: 'Users' },
  { title: 'Log Sistem', href: '/dashboard/admin/logs', icon: 'FileText' },
];

export const FASKES_NAV: NavItem[] = [
  { title: 'Overview', href: '/dashboard/faskes', icon: 'LayoutDashboard' },
  { title: 'Rekam Medis', href: '/dashboard/faskes/medical-records', icon: 'FolderHeart' },
  { title: 'Dokter', href: '/dashboard/faskes/doctor', icon: 'UserCheck' },
  { title: 'Farmasi & POS', href: '/dashboard/faskes/pharmacy/inventory', icon: 'Pill' },
  { title: 'Keuangan & Invoice', href: '/dashboard/faskes/finance/invoice', icon: 'CreditCard' },
];

export const PASIEN_NAV: NavItem[] = [
  { title: 'Ringkasan Kesehatan', href: '/dashboard/pasien', icon: 'Activity' },
  { title: 'Rekam Medis Saya', href: '/dashboard/pasien/records', icon: 'FileSpreadsheet' },
  { title: 'Persetujuan Akses', href: '/dashboard/pasien/consent', icon: 'ShieldCheck' },
];
