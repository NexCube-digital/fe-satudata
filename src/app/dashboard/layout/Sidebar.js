"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Stethoscope, 
  Activity, 
  User, 
  ShieldCheck 
} from "lucide-react";

export default function Sidebar({ role }) {
  const pathname = usePathname();

  // Define menu items based on role
  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Dashboard", icon: Home },
          { href: "/dashboard/admin/users", label: "Kelola Pengguna", icon: Users },
          { href: "/dashboard/admin/logs", label: "Audit Trail", icon: FileText },
          { href: "/dashboard/admin/settings", label: "Pengaturan", icon: Settings },
        ];
      case "faskes":
      case "rumah_sakit":
        return [
          { href: "/dashboard/faskes", label: "Dashboard", icon: Home },
          { href: "/dashboard/faskes/patients", label: "Data Pasien", icon: Stethoscope },
          { href: "/dashboard/faskes/requests", label: "Request Akses", icon: Activity },
          { href: "/dashboard/faskes/settings", label: "Pengaturan", icon: Settings },
        ];
      case "pasien":
      default:
        return [
          { href: "/dashboard/pasien", label: "Dashboard", icon: Home },
          { href: "/dashboard/pasien/records", label: "Rekam Medis", icon: FileText },
          { href: "/dashboard/pasien/consent", label: "Kelola Izin", icon: ShieldCheck },
          { href: "/dashboard/pasien/settings", label: "Pengaturan", icon: Settings },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-73px)] hidden md:block shrink-0 shadow-xs">
        <div className="p-6 space-y-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-4 px-3">
              Menu Utama
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-pink-50 text-pink-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-pink-600" : "text-slate-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2.5 px-4 flex items-center justify-around md:hidden shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
                isActive ? "text-pink-600" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
