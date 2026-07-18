"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Send,
  CheckCircle,
  Database,
  Wallet,
  Activity,
  ArrowRight,
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";

const encryptedText = "U2FsdGVkX1+9M2Y5NzhkYTUxNmFkOTY5Y2QwMzgxM2I5Mzg5YTI0ZjM0MmQwNmJiMDRkMmU0ZTVmMWY5OTMwZWY1NWY2ZTEyYTU3MWQzNGExMTk0ZmUwOTkyMGMzZjg1NDNhMzNkZTcxZjk4MTIyMmQ0NDMwOTg1MmNlYTkyOQ==";

const decryptedJSON = `{
  "Pasien": "Budi Santoso, S.Kom",
  "NIK": "3171010509840002",
  "Status": "TERVERIFIKASI (SATUSEHAT)",
  "Diagnosis": "Infeksi Saluran Pernapasan (ISPA)",
  "Resep Obat": [
    "Amoxicillin 500mg (3x1)",
    "Paracetamol 500mg (P.R.N)"
  ],
  "Faskes Rujukan": "RS Cipto Mangunkusumo",
  "Dokter": "dr. Amanda, Sp.PD"
}`;

export default function ConsentSimulator({ walletConnected, setWalletConnected }) {
  // states: 'idle', 'requested', 'signing', 'approved', 'revoking'
  const [simulatorState, setSimulatorState] = useState("idle");
  const [displayedText, setDisplayedText] = useState(encryptedText);
  const [nikInput, setNikInput] = useState("3171010509840002");
  
  // Audit Trail Logs State
  const [logs, setLogs] = useState([
    {
      hash: "0x3f5b...e21a",
      timestamp: "10 menit yang lalu",
      action: "Registrasi NIK Pasien & Pemetaan Wallet",
      type: "info"
    }
  ]);

  const addLog = (action, type = "success") => {
    const randomHash = "0x" + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "..." + Array.from({ length: 4 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newLog = {
      hash: randomHash,
      timestamp: "Baru saja",
      action,
      type
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Synchronize state when wallet connects/disconnects
  useEffect(() => {
    if (!walletConnected) {
      setSimulatorState("idle");
    }
  }, [walletConnected]);

  // Request Access handler (Doctor)
  const handleRequestAccess = () => {
    if (!walletConnected) {
      alert("Hubungkan MetaMask Pasien terlebih dahulu untuk memulai simulasi!");
      return;
    }
    setSimulatorState("requested");
    addLog(`Faskes RSCM memanggil requestAccess() untuk NIK ${nikInput}`, "warning");
  };

  // Grant Access handler (Patient approves in MetaMask)
  const handleGrantAccess = () => {
    setSimulatorState("signing");
    addLog("Pasien mengesahkan transaksi di MetaMask (Memproses grantAccess)", "info");
    
    setTimeout(() => {
      setSimulatorState("approved");
      addLog("Fungsi grantAccess() sukses dieksekusi di Blockchain Hardhat", "success");
    }, 1200);
  };

  // Revoke Access handler (Patient revokes)
  const handleRevokeAccess = () => {
    setSimulatorState("revoking");
    addLog("Pasien memanggil revokeAccess() di MetaMask", "info");

    setTimeout(() => {
      setSimulatorState("idle");
      addLog("Hak akses RSCM berhasil dicabut (Akses dinonaktifkan di Blockchain)", "error");
    }, 1200);
  };

  // Reject Request handler (Patient rejects)
  const handleRejectRequest = () => {
    setSimulatorState("idle");
    addLog("Pasien menolak permintaan akses (Request ditolak)", "error");
  };

  // Decryption effect animation
  useEffect(() => {
    if (simulatorState === "approved") {
      let iterations = 0;
      const target = decryptedJSON;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
      
      const interval = setInterval(() => {
        setDisplayedText((prev) => {
          return target
            .split("")
            .map((char, index) => {
              // Preserve spacing and structural symbols for formatting
              if (char === "\n" || char === " " || char === ":" || char === "{" || char === "}" || char === "[" || char === "]" || char === ",") {
                return char;
              }
              if (index < iterations * 5) {
                return target[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        });
        
        iterations += 1;
        if (iterations * 5 >= target.length) {
          setDisplayedText(target);
          clearInterval(interval);
        }
      }, 25);
      
      return () => clearInterval(interval);
    } else {
      setDisplayedText(encryptedText);
    }
  }, [simulatorState]);

  return (
    <section id="simulator" className="scroll-mt-24 py-8">
      {/* Header section */}
      <div className="max-w-3xl mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-rose-600">Demo Interaktif</p>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
          Consent Simulator Live
        </h2>
        <p className="mt-3.5 text-sm leading-relaxed text-slate-500">
          Uji coba secara real-time bagaimana interaksi antara **Smart Contract Blockchain** dan **Database MySQL Terenkripsi** mengamankan data medis Anda dari akses tak berizin.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        {/* Left Side: Doctor's Dashboard Panel */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_12px_40px_rgba(225,29,72,0.03)] border border-slate-200/80 flex flex-col justify-between">
          <div>
            {/* Header Portal Dokter */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">Rumah Sakit Cipto Mangunkusumo</h4>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Portal Dokter (dr. Amanda, Sp.PD)</p>
                </div>
              </div>
              
              {/* Access Status badge */}
              {simulatorState === "approved" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 animate-pulse">
                  <ShieldCheck className="h-4 w-4" />
                  Akses Terbuka
                </span>
              ) : simulatorState === "requested" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 animate-pulse">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Menunggu Persetujuan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-200">
                  <ShieldAlert className="h-4 w-4" />
                  Akses Terkunci
                </span>
              )}
            </div>

            {/* Input & Action */}
            <div className="mb-5 rounded-2xl bg-slate-50 p-4 border border-slate-200/50">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">NIK Pasien Sasaran</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={nikInput}
                  onChange={(e) => setNikInput(e.target.value)}
                  className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-rose-500 font-mono shadow-inner-sm"
                  placeholder="Masukkan NIK Pasien"
                  disabled={simulatorState !== "idle"}
                />
                <button
                  onClick={handleRequestAccess}
                  disabled={simulatorState !== "idle" || !walletConnected}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    simulatorState !== "idle" || !walletConnected
                      ? "bg-slate-300 cursor-not-allowed text-slate-500"
                      : "bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 hover:scale-[1.02]"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  requestAccess()
                </button>
              </div>
              {!walletConnected && (
                <p className="mt-2 text-[10px] text-amber-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Harap hubungkan MetaMask Pasien terlebih dahulu di sebelah kanan.
                </p>
              )}
            </div>

            {/* High Tech Terminal for Data Display */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-rose-500" />
                  Data EHR Terenkripsi (MySQL Cold Storage)
                </p>
                {simulatorState === "approved" ? (
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 font-mono">
                    <Unlock className="h-3 w-3" /> AES-256 Decrypted Successfully
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 font-mono">
                    <Lock className="h-3 w-3" /> AES-256 ENCRYPTED
                  </span>
                )}
              </div>
              
              <div className={`relative rounded-2xl bg-slate-950 p-4 border shadow-inner transition-all duration-300 ${
                simulatorState === "approved" ? "border-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-slate-800"
              }`}>
                <div className="absolute right-3 top-3 z-10 flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    simulatorState === "approved" ? "bg-emerald-400" : "bg-red-400"
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    simulatorState === "approved" ? "bg-emerald-500" : "bg-red-500"
                  }`} />
                </div>
                
                <pre className={`text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-[220px] transition-colors duration-300 ${
                  simulatorState === "approved" ? "text-emerald-400" : "text-rose-500/70"
                }`}>
                  <code>{displayedText}</code>
                </pre>
              </div>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-slate-400 leading-normal border-t border-slate-100 pt-4">
            * Dokter mengirim permohonan ke blockchain $\rightarrow$ blockchain memverifikasi ACL $\rightarrow$ MetaMask pasien berdering memberikan consent secara gasless.
          </p>
        </div>

        {/* Right Side: MetaMask Wallet Mockup */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-5 text-white shadow-2xl flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-amber-500" />
          
          <div>
            {/* MetaMask Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-xs font-extrabold tracking-wide font-mono text-slate-200">MetaMask Extension</h4>
                  <p className="text-[9px] text-slate-500 font-mono">{walletConnected ? "0xPasien...89AB" : "Not Connected"}</p>
                </div>
              </div>

              {walletConnected ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Hardhat Node
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-bold text-rose-400 border border-rose-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Offline
                </div>
              )}
            </div>

            {/* Wallet Not Connected Screen */}
            {!walletConnected && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md animate-pulse" />
                  <Wallet className="relative h-14 w-14 text-amber-500" />
                </div>
                <h5 className="text-sm font-bold text-white">Hubungkan MetaMask Pasien</h5>
                <p className="text-[10px] text-slate-400 mt-2 max-w-[240px] leading-relaxed">
                  Untuk mencoba simulasi persetujuan rekam medis, pasien harus menautkan dompet MetaMask.
                </p>
                <button
                  onClick={() => {
                    setWalletConnected(true);
                    addLog("Pasien menyambungkan dompet MetaMask (Status Terhubung)", "success");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-xs font-bold text-slate-900 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-lg shadow-amber-500/10"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Hubungkan Wallet
                </button>
              </div>
            )}

            {/* Connected & Waiting in Idle state */}
            {walletConnected && simulatorState === "idle" && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-3 border border-white/5">
                  <RefreshCw className="h-5 w-5 animate-pulse" />
                </div>
                <h5 className="text-xs font-bold text-slate-300">Siap Menerima Permintaan</h5>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                  Kirim permintaan akses dari **Panel Dokter (Kiri)** untuk melihat alur smart contract.
                </p>
                <button
                  onClick={() => setWalletConnected(false)}
                  className="mt-4 text-[9px] font-bold text-slate-500 hover:text-slate-400 transition"
                >
                  Putuskan Wallet
                </button>
              </div>
            )}

            {/* Requested state - Signature Prompt (THE CRITICAL PIECE) */}
            {walletConnected && simulatorState === "requested" && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-[0_0_30px_rgba(245,158,11,0.06)] animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3">
                  <RefreshCw className="h-4.5 w-4.5 text-amber-500 animate-spin" />
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Persetujuan Transaksi (Signature)</h5>
                </div>
                
                <div className="space-y-2.5 text-[10px] font-mono text-slate-300">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Method</span>
                    <span className="text-amber-400 font-bold">grantAccess(address,uint256)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Faskes Pemohon</span>
                    <span className="text-white">RS Cipto Mangunkusumo</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Gas Fee Estimasi</span>
                    <span className="text-emerald-400 font-bold">0 ETH (Gasless - EIP-2771)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500">Subsidi Oleh</span>
                    <span className="text-slate-400">Kas Faskes RSCM (Relayer)</span>
                  </div>
                </div>

                <div className="mt-4.5 flex gap-2">
                  <button
                    onClick={handleGrantAccess}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-center text-xs font-bold text-white transition-all cursor-pointer shadow-sm shadow-emerald-950/20"
                  >
                    Approve Transaksi
                  </button>
                  <button
                    onClick={handleRejectRequest}
                    className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-center text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            )}

            {/* Signing Transaction screen */}
            {walletConnected && simulatorState === "signing" && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mb-4" />
                <h5 className="text-xs font-bold text-slate-300">Menandatangani & Merekam ke Blockchain...</h5>
                <p className="text-[9px] text-slate-500 mt-1 max-w-[220px]">
                  Smart contract memvalidasi tanda tangan digital dan memperbarui Access Control List.
                </p>
              </div>
            )}

            {/* Approved state - Dashboard for revoking */}
            {walletConnected && simulatorState === "approved" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-[0_0_35px_rgba(16,185,129,0.06)] animate-fade-in">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                  <h5 className="text-xs font-bold uppercase tracking-wider">Hak Akses RSCM Aktif</h5>
                </div>
                
                <div className="space-y-2 text-[10px] text-slate-300 font-mono mb-4">
                  <p className="text-slate-400 leading-normal">
                    Faskes RSCM saat ini memegang hak akses baca data rekam medis terenkripsi Anda di database.
                  </p>
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20 text-emerald-400">
                    <span className="font-bold">EHR Status:</span> Dekripsi Aktif secara lokal di klien dokter.
                  </div>
                </div>

                <button
                  onClick={handleRevokeAccess}
                  className="w-full rounded-xl bg-rose-600/90 hover:bg-rose-500 py-2.5 text-center text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-rose-950/20"
                >
                  Cabut Izin Akses (revokeAccess)
                </button>
              </div>
            )}

            {/* Revoking state */}
            {walletConnected && simulatorState === "revoking" && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                <RefreshCw className="h-10 w-10 text-rose-500 animate-spin mb-4" />
                <h5 className="text-xs font-bold text-slate-300">Memproses Pencabutan Hak Akses...</h5>
                <p className="text-[9px] text-slate-500 mt-1 max-w-[200px]">
                  Mengirimkan transaksi ke blockchain untuk membatalkan hak akses RSCM seketika.
                </p>
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-500 leading-relaxed mt-4 border-t border-white/5 pt-3 flex items-center justify-between">
            <span>Network: Hardhat (Localhost)</span>
            <span>EIP-2771 Gasless</span>
          </div>
        </div>
      </div>

      {/* Ledger Audit Trail Section */}
      <div className="mt-8">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Database className="h-4.5 w-4.5 text-rose-600" />
          Audit Trail Ledger Blockchain (Real-time Logs)
        </p>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 shadow-inner-sm max-h-40 overflow-y-auto space-y-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-[11px] font-mono rounded-lg border border-slate-100 bg-white p-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${
                  log.type === "success" ? "bg-emerald-500" :
                  log.type === "warning" ? "bg-amber-500" :
                  log.type === "error" ? "bg-rose-500" : "bg-blue-500"
                }`} />
                <span className="text-rose-600 font-semibold">{log.hash}</span>
                <span className="text-slate-700">{log.action}</span>
              </div>
              <span className="text-[10px] text-slate-400 self-end sm:self-center shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
