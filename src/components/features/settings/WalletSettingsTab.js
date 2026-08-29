"use client";

import Link from "next/link";
import { 
  Server, 
  Wallet, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  Loader, 
  ArrowLeft 
} from "lucide-react";

export default function WalletSettingsTab({
  user,
  systemWallet,
  systemWalletLoading,
  systemWalletBalance,
  fetchSystemWallet,
  walletMsg,
  walletAddress,
  walletBalance,
  handleConnectWallet,
  walletLoading
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-xs max-w-2xl">
      {/* ── ADMIN: tampilkan System Wallet (read-only) ── */}
      {user?.role === "admin" ? (
        <>
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
            <Link
              href="/dashboard/pasien/settings"
              className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer md:hidden shrink-0"
              title="Kembali ke Pilihan Settings"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Server className="h-5 w-5 text-[#0D9488]" />
              Dompet Sistem (Admin Wallet)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 leading-relaxed">
            Wallet di bawah adalah wallet sistem yang digunakan secara otomatis untuk
            menandatangani semua transaksi on-chain (requestAccess, grantAccess, dll).
            Wallet ini dikonfigurasi langsung di server dan tidak perlu dihubungkan secara manual.
          </p>

          <div className="rounded-2xl bg-slate-50/80 border border-slate-200 p-4 sm:p-6 mb-4">
            <div className="flex items-center justify-between mb-4 gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Status Sistem</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                systemWallet?.onChainReady
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-amber-100 text-amber-700 border-amber-200"
              }`}>
                <Zap className="h-3.5 w-3.5" />
                {systemWallet?.onChainReady ? "On-Chain Ready ✅" : "Offline Mode"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Alamat Wallet</p>
                <div className="text-xs sm:text-sm font-mono bg-white p-3 rounded-xl border border-slate-200 break-all text-slate-700">
                  {systemWalletLoading ? "Memuat..." : (systemWallet?.adminWallet || "Tidak terkonfigurasi")}
                </div>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 sm:px-4 sm:py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Sepolia ETH</p>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-800 font-mono mt-0.5">
                    {systemWalletLoading ? "Memuat..." : (systemWalletBalance || "–")}
                  </p>
                </div>
                <button
                  onClick={fetchSystemWallet}
                  disabled={systemWalletLoading}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  title="Refresh saldo"
                >
                  <RefreshCw className={`h-4 w-4 text-slate-500 ${systemWalletLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 sm:px-4 sm:py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">{systemWallet?.network || "sepolia"} (Chain ID: {systemWallet?.chainId || 11155111})</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 sm:px-4 sm:py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Smart Contract</p>
                  <p className="text-[11px] sm:text-xs font-mono text-slate-600 mt-0.5 break-all">{systemWallet?.contractAddress || "–"}</p>
                </div>
              </div>
            </div>
          </div>

          {parseFloat(systemWalletBalance) < 0.001 && !systemWalletLoading && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-700">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Saldo hampir habis!</p>
                <p className="text-xs mt-0.5">Isi wallet dengan Sepolia ETH gratis melalui <a href="https://www.infura.io/faucet/sepolia" target="_blank" rel="noopener noreferrer" className="underline font-bold">infura.io/faucet/sepolia</a></p>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── NON-ADMIN: tampilkan personal MetaMask connect ── */
        <>
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
            <Link
              href="/dashboard/pasien/settings"
              className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition cursor-pointer md:hidden shrink-0"
              title="Kembali ke Pilihan Settings"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#0D9488]" />
              Dompet Web3 & MetaMask
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 leading-relaxed">
            Tautkan alamat wallet MetaMask Anda ke akun SatuData untuk mengotorisasi transaksi *grantAccess()* dan *revokeAccess()* secara terdesentralisasi.
          </p>

          {walletMsg.text && (
            <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-xs sm:text-sm ${
              walletMsg.type === "success" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {walletMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span>{walletMsg.text}</span>
            </div>
          )}

          <div className="rounded-2xl bg-slate-50/80 p-4 sm:p-6 border border-slate-200/80 mb-6">
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Status Kredensial Wallet</span>
              {walletAddress ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-4 w-4" /> Terverifikasi &amp; Ditautkan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                  Belum Ditautkan
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm font-mono bg-white p-3 rounded-xl border border-slate-200 break-all text-slate-700 mb-3">
              {walletAddress || "Alamat wallet belum dikonfigurasi"}
            </div>

            {walletAddress && (
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-bold">Saldo Dompet (Sepolia)</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 font-mono">{walletBalance || "Memuat..."}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConnectWallet}
              disabled={walletLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {walletLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {walletAddress ? "Tautkan Ulang Wallet" : "Tautkan MetaMask Wallet"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
