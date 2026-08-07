"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import TxHashLink from "@/components/ui/TxHashLink";
import {
  Activity,
  Search,
  RefreshCw,
  Building2,
  Stethoscope,
  Pill,
  Receipt,
  CheckCircle2,
  User,
  Clock,
  ChevronRight,
  ArrowRight,
  Filter,
  AlertCircle,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { getHospitalMedicalRecords } from "@/services/hospitalService";

export default function FaskesPatientFlowPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Active Visits List State
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Invalid user data", e);
      }
    }

    fetchRealDataFromBE().finally(() => setLoading(false));
  }, []);

  const determineStageFromStatus = (item) => {
    const status = (item.status || "").toLowerCase();
    const type = (item.record_type || item.recordType || "").toLowerCase();
    const title = (item.title || "").toLowerCase();

    if (status === "draft") {
      return 2; // Step 2: Draft Rekam Medis Dokter
    }

    if (status === "final" || status === "terverifikasi") {
      // Jika status rekam medis / resep sudah FINAL di BE -> Indikator Otomatis terupdate ke Step 3 (Farmasi)
      if (type.includes("resep") || title.includes("resep")) {
        return 3; // Step 3: Layanan Farmasi (Apotek Resep)
      }
      return 3; // Step 3: Rekam Medis Final -> Otomatis Terupdate ke Farmasi
    }

    return 1; // Step 1: Pendaftaran
  };

  const fetchRealDataFromBE = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      // 1. Fetch real Medical Records from BE
      const recRes = await getHospitalMedicalRecords();
      let bePatients = [];

      // 2. Fetch real Prescriptions status from BE
      let prescriptionMap = {};
      try {
        const presRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/pharmacy/prescriptions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const presData = await presRes.json();
        if (presRes.ok && Array.isArray(presData.data)) {
          presData.data.forEach(p => {
            prescriptionMap[p.record_id || p.id] = p.status_resep;
          });
        }
      } catch (e) {
        console.error("Error fetching pharmacy prescription status:", e);
      }

      // 3. Fetch real Invoices status from BE
      let invoiceMap = {};
      try {
        const invRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/invoice/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const invData = await invRes.json();
        if (invRes.ok && Array.isArray(invData.data)) {
          invData.data.forEach(inv => {
            if (inv.patient_id) {
              invoiceMap[inv.patient_id] = inv.status;
            }
          });
        }
      } catch (e) {
        console.error("Error fetching invoice status in patient flow:", e);
      }

      if (recRes?.success && Array.isArray(recRes.data) && recRes.data.length > 0) {
        bePatients = recRes.data.map((item) => {
          const patientObj = item.patient || {};
          const doctorObj = item.doctor || {};
          const pName = patientObj.name || item.patientName || "pasien 1";
          const patientId = item.user_id || patientObj.id;
          const pStatusResep = prescriptionMap[item.id] || item.detailResep?.status_resep;
          const pInvoiceStatus = invoiceMap[patientId];

          let calculatedStage = 1;
          let beStatusText = "Pendaftaran (Step 1)";

          if (item.status === "draft") {
            calculatedStage = 2; // Step 2: Draft Dokter
            beStatusText = "DRAFT (Step 2 Dokter)";
          } else if (item.status === "final" || item.status === "terverifikasi") {
            if (pInvoiceStatus === "paid") {
              calculatedStage = 5; // Step 5: Selesai & Lunas (Di Histori Invoice)
              beStatusText = "Selesai & Lunas (Step 5 Kasir)";
            } else if (pInvoiceStatus === "unpaid" || pStatusResep === "Selesai" || pStatusResep === "Siap Diambil") {
              calculatedStage = 4; // Step 4: Resep Siap Diambil / Tagihan Diterbitkan Kasir
              beStatusText = pInvoiceStatus === "unpaid"
                ? "Tagihan Diterbitkan - Menunggu Bayar (Step 4)"
                : `Resep ${pStatusResep} (Auto → Step 4 Tagihan Pelunasan)`;
            } else {
              calculatedStage = 3; // Step 3: Layanan Farmasi / Apotek
              beStatusText = `FINAL - Resep ${pStatusResep || "Menunggu"} (Step 3 Farmasi)`;
            }
          }

          return {
            id: item.id,
            name: pName,
            nik: patientObj.nik || "3273012938470001",
            poli: doctorObj.specialist ? `Spesialis ${doctorObj.specialist}` : "Poliklinik Kesehatan",
            doctor: doctorObj.name ? `dr. ${doctorObj.name}` : "dr. Herudian Ahmadin, Sp.P(K)",
            time: item.visit_date ? new Date(item.visit_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Hari Ini, 08.00 WIB",
            stage: calculatedStage,
            beStatus: beStatusText,
            billingCode: `BILL-2026-0806-${9920 + item.id}`,
            totalBill: item.record_type === "resep" ? 325000 : 250000,
            paymentStatus: pInvoiceStatus === "paid" ? "paid" : "pending",
            txHash: item.tx_hash || null,
            title: item.title || "Konsultasi Medis"
          };
        });

        // Sync calculated stage from backend to localStorage so Patient side gets real updated stage
        if (bePatients.length > 0) {
          localStorage.setItem("activePatientStage", bePatients[0].stage.toString());
          window.dispatchEvent(new Event("storage"));
        }
      }

      // 2. Fetch real Access Requests from BE to include new patients in queue
      try {
        const reqRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/hospital/access-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reqData = await reqRes.json();
        if (reqRes.ok && Array.isArray(reqData.data)) {
          const approvedReqs = reqData.data.filter(r => r.status === "approved");
          approvedReqs.forEach((r, idx) => {
            const pName = r.patient_name || r.Patient?.name || r.patient?.name || `pasien ${idx + 1}`;
            if (!bePatients.some(p => p.name.toLowerCase() === pName.toLowerCase())) {
              bePatients.push({
                id: 100 + r.id,
                name: pName,
                nik: r.patient_nik || r.Patient?.profil?.nik || r.patient?.profil?.nik || "3273012938470002",
                poli: r.requested_data || "Poli Rawat Jalan",
                doctor: "dr. Herudian Ahmadin, Sp.P(K)",
                time: "Hari Ini, " + new Date(r.created_at || Date.now()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
                stage: 1,
                beStatus: "approved_access",
                billingCode: `BILL-2026-0806-${9950 + r.id}`,
                totalBill: 200000,
                paymentStatus: "pending",
                txHash: r.tx_hash || null,
                title: "Pendaftaran Pasien Baru"
              });
            }
          });
        }
      } catch (err) {
        console.error("Error fetching access requests for flow:", err);
      }

      // Fallback sample data if empty
      if (bePatients.length === 0) {
        bePatients = [
          {
            id: 1,
            name: "pasien 1",
            nik: "3273012938470001",
            poli: "Spesialis Paru & Pulmonologi",
            doctor: "dr. Herudian Ahmadin, Sp.P(K), FISR, FISQua",
            time: "Hari Ini, 08.00 WIB",
            stage: parseInt(localStorage.getItem("activePatientStage") || "3", 10),
            billingCode: "BILL-2026-0806-9921",
            totalBill: 325000,
            paymentStatus: "pending",
            txHash: "0x5be5fa3c626f6b35e26c9ad71d3a504620b9652de0fd63d0e93a771e6c976e92"
          }
        ];
      }

      setPatients(bePatients);
    } catch (err) {
      console.error("Error fetching real flow data from BE:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRealDataFromBE();
    setRefreshing(false);
  };

  const handleUpdateStage = (patientId, newStage, stageLabel) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, stage: newStage } : p))
    );

    // Save active patient stage to sync with Patient side
    if (patientId === 1 || patients[0]?.id === patientId) {
      localStorage.setItem("activePatientStage", newStage.toString());
      window.dispatchEvent(new Event("storage"));
    }

    // Toast Feedback
    setToastMessage(`Status Alur Pasien Berhasil Diperbarui ke: "${stageLabel}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const stageConfigs = {
    1: { name: "1. Pendaftaran Faskes", badgeClass: "bg-blue-50 text-blue-700 border-blue-200", icon: Building2 },
    2: { name: "2. Rekam Medis (Dokter)", badgeClass: "bg-rose-50 text-rose-700 border-rose-200", icon: Stethoscope },
    3: { name: "3. Layanan Farmasi", badgeClass: "bg-amber-50 text-amber-700 border-amber-200", icon: Pill },
    4: { name: "4. Tagihan & Pelunasan", badgeClass: "bg-purple-50 text-purple-700 border-purple-200", icon: Receipt },
    5: { name: "5. Selesai & Lunas", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nik.includes(searchTerm) ||
      p.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || p.stage.toString() === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] via-[#fdfbf7] to-[#f5efe6] flex flex-col pb-16 md:pb-0">
      <Navbar user={user} roleLabel="Staf Rumah Sakit / Faskes" onLogout={() => router.push("/auth/login")} />

      <div className="flex flex-1">
        <Sidebar role="faskes" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Toast Alert Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 rounded-2xl bg-emerald-900 text-white px-5 py-3.5 shadow-2xl border border-emerald-700 flex items-center gap-3 animate-fade-in text-xs font-bold">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
                  <Activity className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                  Live Real-Time Patient Journey Monitoring (Automatic)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Monitoring Alur Pelayanan Pasien
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Memantau posisi alur pelayanan pasien secara real-time yang ter-update otomatis sesuai status dokumen tindakan staf RS (Pendaftaran → Rekam Medis → Farmasi → Pelunasan).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh Sync Backend
                </button>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md text-xs font-mono">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Pasien Real BE</p>
                  <p className="font-bold text-white text-lg mt-0.5">{patients.length} Berkas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pasien, NIK, atau dokter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-rose-500 focus:bg-white focus:outline-hidden transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-700 focus:border-rose-500 focus:bg-white focus:outline-hidden transition cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Semua Tahap Alur ({patients.length})</option>
                <option value="1">Step 1: Pendaftaran Faskes</option>
                <option value="2">Step 2: Rekam Medis (Dokter)</option>
                <option value="3">Step 3: Layanan Farmasi</option>
                <option value="4">Step 4: Tagihan & Pelunasan</option>
                <option value="5">Step 5: Selesai & Lunas</option>
              </select>
            </div>
          </div>

          {/* Patient Active Flow Cards & Read-Only Stepper */}
          <div className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-12 text-center text-xs text-slate-500">
                Tidak ada data alur pasien yang sesuai pencarian.
              </div>
            ) : (
              filteredPatients.map((p) => {
                const currentCfg = stageConfigs[p.stage] || stageConfigs[2];
                const IconComp = currentCfg.icon;

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-5 shadow-2xs hover:border-rose-300 transition-all duration-200 space-y-4"
                  >
                    {/* Top Row Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 font-bold text-rose-700 text-xs shadow-2xs">
                          <User className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-slate-900">{p.name}</h3>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 border border-slate-200">
                              NIK: {p.nik}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
                              Status BE: {p.beStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                            {p.doctor} <span className="text-slate-300">•</span> {p.poli}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Posisi Tahap Saat Ini:</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border mt-0.5 ${currentCfg.badgeClass}`}>
                            <IconComp className="h-3.5 w-3.5" />
                            {currentCfg.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Read-Only Automatic Flow Stepper Bar (Horizontal Line) */}
                    <div className="py-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-4">
                        Indikator Alur Pelayanan Pasien (Ter-update Otomatis):
                      </span>

                      <div className="relative px-2 sm:px-6">
                        {/* Connecting Line Background */}
                        <div className="absolute top-[20px] left-8 right-8 h-1 -translate-y-1/2 bg-slate-100 rounded-full z-0" />

                        {/* Active Connecting Progress Fill Line */}
                        <div
                          className="absolute top-[20px] left-8 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-400 via-rose-700 to-rose-900 rounded-full transition-all duration-500 z-0"
                          style={{ width: `calc(${((p.stage - 1) / 4) * 100}% - 0px)` }}
                        />

                        {/* 5 Step Nodes Grid */}
                        <div className="relative z-10 grid grid-cols-5 text-center">
                          {[
                            { step: 1, label: "Pendaftaran", desc: "Loket Faskes", icon: User },
                            { step: 2, label: "Rekam Medis", desc: "Upload Dokter", icon: Stethoscope },
                            { step: 3, label: "Layanan Farmasi", desc: "Apotek Resep", icon: Pill },
                            { step: 4, label: "Pelunasan Billing", desc: "Billing Gateway", icon: Receipt },
                            { step: 5, label: "Selesai & Lunas", desc: "Kwitansi Lunas", icon: CheckCircle2 }
                          ].map((item) => {
                            const isCurrent = p.stage === item.step;
                            const isPassed = p.stage > item.step;
                            const StepIcon = item.icon;

                            return (
                              <div key={item.step} className="flex flex-col items-center group">
                                {/* Circle Node Icon */}
                                <div
                                  className={`flex items-center justify-center transition-all duration-300 rounded-full select-none ${
                                    isCurrent
                                      ? "h-11 w-11 bg-rose-900 text-white ring-4 ring-rose-900/20 shadow-md scale-110 -mt-1"
                                      : isPassed
                                      ? "h-7 w-7 bg-emerald-500 text-white border-2 border-white shadow-2xs mt-1"
                                      : "h-6 w-6 bg-slate-100 text-slate-400 border border-slate-200 mt-1.5"
                                  }`}
                                >
                                  {isCurrent ? (
                                    <StepIcon className="h-5 w-5 text-white animate-pulse" />
                                  ) : isPassed ? (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  ) : (
                                    <span className="text-[9px] font-bold font-mono">{item.step}</span>
                                  )}
                                </div>

                                {/* Text Labels */}
                                <div className="mt-2 space-y-0.5">
                                  <p
                                    className={`transition-all duration-200 ${
                                      isCurrent
                                        ? "text-xs font-black text-rose-950 uppercase tracking-tight scale-105"
                                        : isPassed
                                        ? "text-[10px] font-semibold text-slate-500"
                                        : "text-[9px] font-normal text-slate-400"
                                    }`}
                                  >
                                    {item.label}
                                  </p>
                                  <p
                                    className={`${
                                      isCurrent
                                        ? "text-[10px] font-extrabold text-rose-800"
                                        : "text-[8px] text-slate-400"
                                    }`}
                                  >
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Info & Nav Action Links */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 flex-wrap">
                        {p.stage >= 4 ? (
                          <>
                            <span>Kode Billing RS: <strong className="text-slate-800">{p.billingCode}</strong></span>
                            <span>• Tagihan: <strong className="text-rose-700">Rp {p.totalBill.toLocaleString("id-ID")}</strong></span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic font-sans text-[11px]">Billing & Tagihan muncul pada Step 04 (Pelunasan)</span>
                        )}
                        {p.txHash && (
                          <span className="inline-flex items-center gap-1 text-[10px]">
                            • Tx: <TxHashLink txHash={p.txHash} className="text-rose-600 font-bold" title={p.txHash}><span>{p.txHash.slice(0, 10)}...</span></TxHashLink>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {p.stage <= 2 && (
                          <button
                            onClick={() => router.push("/dashboard/faskes/medical-records")}
                            className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 font-bold text-slate-700 transition flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            Lihat Rekam Medis Faskes →
                          </button>
                        )}
                        {p.stage >= 3 && (
                          <button
                            onClick={() => router.push("/dashboard/faskes/pharmacy/prescriptions")}
                            className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 font-bold text-rose-700 transition flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            Lihat Farmasi / Resep →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
