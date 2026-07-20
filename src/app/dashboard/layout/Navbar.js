"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";

export default function Navbar({ user, roleLabel, onLogout }) {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      <div className="mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-pink-600 to-fuchsia-600 text-white font-bold">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/images/logo.png"
                  alt="Satu Data logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">Satu Data</div>
              <div className="text-xs text-slate-500">{roleLabel || "Dashboard"}</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm font-semibold text-slate-600 hidden sm:inline-block">
              {user.name}
            </span>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
