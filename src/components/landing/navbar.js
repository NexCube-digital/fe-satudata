"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LogIn, 
  Menu, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Settings, 
  LayoutDashboard 
} from "lucide-react";
import { 
  RiLoginCircleLine, 
  RiUserAddLine, 
  RiArrowRightSLine 
} from "react-icons/ri";
import { apiGet, getAvatarUrl } from "@/lib/api";

const links = [
  { href: "#fitur", label: "Fitur Unggulan" },
  { href: "#panel", label: "Dasbor Interaktif" },
  { href: "#alur", label: "Alur Sistem" },
  { href: "/faskes", label: "Peta & Lokasi Faskes" },
  { href: "/faq", label: "FAQ & Bantuan" },
];

export default function Navbar({ walletConnected, setWalletConnected }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const profileRef = useRef(null);

  // Load user from localStorage & sync profile picture from BE on mount
  useEffect(() => {
    const storedUserStr = localStorage.getItem("user");
    let storedUser = null;
    if (storedUserStr) {
      try {
        storedUser = JSON.parse(storedUserStr);
        setUser(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
      }
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      const endpoint = (storedUser?.role === "rumah_sakit" || storedUser?.role === "faskes")
        ? "/api/hospital/profile"
        : "/api/patient/profile";

      apiGet(endpoint)
        .then((res) => {
          if (res.success && res.data) {
            const u = res.data;
            const computedAvatar = getAvatarUrl(u);
            const updatedUser = {
              ...(storedUser || {}),
              ...u,
              avatarUrl: computedAvatar || getAvatarUrl(storedUser),
            };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        })
        .catch((err) => {
          // Ignore profile sync errors
        });
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch (e) {}
      }
    };
    window.addEventListener("userUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("userUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Track active scroll section for navbar indicator
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ["fitur", "panel", "alur", "faq"];
      const scrollPosition = window.scrollY + 250;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(`#${id}`);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const getDashboardHref = () => {
    switch (user?.role) {
      case "admin":
        return "/dashboard/admin";
      case "rumah_sakit":
      case "faskes":
        return "/dashboard/faskes";
      case "pasien":
      default:
        return "/dashboard/pasien";
    }
  };

  const getSettingsHref = () => {
    switch (user?.role) {
      case "admin":
        return "/dashboard/admin/settings";
      case "rumah_sakit":
      case "faskes":
      case "dokter":
        return "/dashboard/faskes/settings";
      case "pasien":
      default:
        return "/dashboard/pasien/settings";
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "admin":
        return "Administrator";
      case "rumah_sakit":
      case "faskes":
        return "Fasilitas Kesehatan";
      case "pasien":
      default:
        return "Pasien Terdaftar";
    }
  };

  const getNavLink = (linkHref) => {
    if (linkHref.startsWith("/")) {
      return { targetHref: linkHref, isRoute: true, isActive: pathname === linkHref };
    }
    const isActive = pathname === "/" && activeSection === linkHref;
    const targetHref = pathname === "/" ? linkHref : `/${linkHref}`;
    return { targetHref, isRoute: pathname !== "/", isActive };
  };

  return (
    <header className="fixed left-0 right-0 top-3 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-md shadow-rose-950/5 transition-all duration-300">
        <div className="flex items-center justify-between px-5 py-3 sm:px-8">
          
          {/* Logo Section */}
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200 bg-white shadow-2xs transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Satu Data logo"
                width={36}
                height={36}
                priority
                className="h-8 w-8 object-contain"
              />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="block text-sm font-extrabold uppercase tracking-[0.2em] text-rose-800 transition-colors duration-300">
                  Satu Data
                </span>
              </div>
              <span className="block text-[10px] font-medium text-slate-500">
                Hub Rekam Medis Berbasis Sovereign Blockchain
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            {links.map((link) => {
              const { targetHref, isRoute, isActive } = getNavLink(link.href);
              const Component = isRoute ? Link : "a";

              return (
                <Component
                  key={link.href}
                  href={targetHref}
                  onClick={() => !isRoute && setActiveSection(link.href)}
                  className={`group relative px-4 py-2 transition-colors duration-200 ${
                    isActive ? "text-rose-900 font-extrabold" : "text-slate-600 hover:text-rose-900 font-bold"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-rose-800 to-red-600 transition-transform duration-300 ease-out origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`} />
                </Component>
              );
            })}
          </nav>

          {/* Desktop Right CTA / Logged In User Profile Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 pr-3 transition hover:bg-rose-50/60 hover:border-rose-200"
                  aria-expanded={isDropdownOpen}
                >
                  {/* Avatar Photo / Placeholder */}
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-rose-800 to-red-900 ring-2 ring-rose-500/20 shrink-0">
                    {getAvatarUrl(user) ? (
                      <img
                        src={getAvatarUrl(user)}
                        alt={user?.name || "Foto Profil"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                      </div>
                    )}
                  </div>

                  {/* User Name & Role */}
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900">
                      {user?.name || "Pengguna"}
                    </div>
                    <div className="text-[10px] font-bold text-rose-800">{getRoleLabel()}</div>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Popup */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 rounded-3xl border border-slate-200 bg-white p-2.5 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header Ringkasan Profil */}
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="text-xs font-extrabold text-slate-900">{user?.name || "Pengguna"}</p>
                      <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="pt-1.5 space-y-1">
                      {/* Tombol Dashboard */}
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-rose-50 hover:text-rose-900"
                      >
                        <LayoutDashboard className="h-4 w-4 text-rose-800" />
                        Buka Dashboard
                      </Link>

                      {/* Tombol Settings */}
                      <Link
                        href={getSettingsHref()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-900"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        Setting Akun & Wallet
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-1.5 border-t border-slate-100" />

                    {/* Tombol Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4 text-rose-600" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Link
                  href="/auth/register"
                  className="group hidden sm:inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-rose-900 hover:bg-rose-50/80 transition-all duration-200"
                >
                  <RiUserAddLine className="h-4 w-4 text-slate-400 group-hover:text-rose-800 group-hover:scale-110 transition-all duration-200" />
                  <span>Daftar</span>
                </Link>

                <Link
                  href="/auth/login"
                  className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-800 via-rose-700 to-red-800 px-4.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-900/25 hover:shadow-xl hover:shadow-rose-700/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 border border-rose-500/30 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white shadow-xs group-hover:bg-white group-hover:text-rose-900 group-hover:rotate-6 transition-all duration-300">
                    <RiLoginCircleLine className="h-3.5 w-3.5" />
                  </span>
                  <span className="tracking-wide">Masuk</span>
                  <RiArrowRightSLine className="h-3.5 w-3.5 -ml-1 text-rose-200 group-hover:translate-x-0.5 transition-transform duration-300" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-rose-50 hover:text-rose-800 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 p-4 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {links.map((link) => {
                const { targetHref, isRoute, isActive } = getNavLink(link.href);
                const Component = isRoute ? Link : "a";

                return (
                  <Component
                    key={link.href}
                    href={targetHref}
                    onClick={() => {
                      if (!isRoute) setActiveSection(link.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center justify-between ${
                      isActive
                        ? "bg-rose-50 text-rose-900 border border-rose-200/60"
                        : "text-slate-700 hover:bg-rose-50/50 hover:text-rose-800"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-rose-700" />}
                  </Component>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-800 to-red-900 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Buka Dashboard
                  </Link>
                  <Link
                    href={getSettingsHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700"
                  >
                    <Settings className="h-4 w-4" /> Setting Akun & Wallet
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-800 via-rose-700 to-red-800 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/20 active:scale-[0.98] transition-all overflow-hidden"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white">
                      <RiLoginCircleLine className="h-3.5 w-3.5" />
                    </span>
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-900 transition-colors"
                  >
                    <RiUserAddLine className="h-3.5 w-3.5 text-slate-500" />
                    <span>Daftar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
