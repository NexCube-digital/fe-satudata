'use client';

import React from 'react';
import {
  Wallet,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  Server,
  Zap,
  ArrowLeft,
} from 'lucide-react';

export const DompetMobile = ({
  user,
  walletAddress,
  walletLoading,
  walletMsg,
  walletBalance,
  systemWallet,
  systemWalletBalance,
  systemWalletLoading,
  fetchSystemWallet,
  handleConnectWallet,
  onBack,
}) => {
  return (
    <div className="space-y-4 animate-fade-in pb-24">
      {/* Fixed Flushed Top Header Navigation */}
      <div className="sticky top-0 z-40 -mt-8 -mx-4 pt-4 px-4 pb-3 bg-[#faf7f2] border-b border-slate-200/90 flex items-center gap-3 shadow-2xs">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            {user?.role === 'admin' ? 'Dompet Sistem' : 'Web3 & MetaMask Wallet'}
          </h2>
          <p className="text-[11px] text-slate-500">Kelola koneksi dompet blockchain Anda</p>
        </div>
      </div>

      {walletMsg?.text && (
        <div
          className={`flex items-center gap-3 rounded-xl p-3 text-xs ${
            walletMsg.type === 'success'
              ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
              : 'bg-rose-50 text-[#DC2626] border border-rose-200'
          }`}
        >
          {walletMsg.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
          )}
          <span>{walletMsg.text}</span>
        </div>
      )}

      {user?.role === 'admin' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Server className="h-4 w-4 text-teal-800 shrink-0" />
              Dompet Sistem (Admin Wallet)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Wallet sistem otomatis untuk menandatangani semua transaksi di blockchain.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Sistem</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  systemWallet?.onChainReady
                    ? 'bg-emerald-100 text-[#16A34A] border-emerald-200'
                    : 'bg-amber-100 text-[#D97706] border-amber-200'
                }`}
              >
                <Zap className="h-3 w-3" />
                {systemWallet?.onChainReady ? 'On-Chain Ready ✅' : 'Offline / Sim'}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Alamat Wallet</p>
              <div className="text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200 break-all text-slate-700">
                {systemWalletLoading ? 'Memuat...' : systemWallet?.adminWallet || 'Tidak terkonfigurasi'}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Sepolia ETH</p>
                <p className="text-base font-extrabold text-slate-800 font-mono mt-0.5">
                  {systemWalletLoading ? 'Memuat...' : systemWalletBalance || '–'}
                </p>
              </div>
              <button
                type="button"
                onClick={fetchSystemWallet}
                disabled={systemWalletLoading}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 text-slate-500 ${systemWalletLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-teal-800 shrink-0" />
              Penautan Dompet MetaMask (Web3)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tautkan MetaMask Anda untuk mengotorisasi transaksi rekam medis & hak akses.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Wallet</span>
              {walletAddress ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-[#16A34A] border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" /> Ditautkan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-[#D97706] border border-amber-200">
                  Belum Ditautkan
                </span>
              )}
            </div>

            <div className="text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200 break-all text-slate-700">
              {walletAddress || 'Alamat wallet belum dikonfigurasi'}
            </div>

            {walletAddress && (
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Dompet (Sepolia)</span>
                <span className="font-extrabold text-slate-800 font-mono">{walletBalance || 'Memuat...'}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleConnectWallet}
            disabled={walletLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-800 hover:to-cyan-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {walletLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {walletAddress ? 'Tautkan Ulang Wallet' : 'Tautkan MetaMask Wallet'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DompetMobile;
