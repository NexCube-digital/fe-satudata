"use client";

import { useState, useEffect, useRef } from "react";
import { maskSip } from "@/utils/masking";
import {
  getMyInvoiceDetail,
  listMyInvoices,
  payMyInvoiceCash,
  payMyInvoiceMidtrans,
} from "@/services/invoiceService";

export function usePatientRecords() {
  const stepperContainerRef = useRef(null);
  const pollingActiveRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  const [activeStage, setActiveStage] = useState(3);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [midtransReady, setMidtransReady] = useState(false);

  const [paymentFlowStage, setPaymentFlowStage] = useState(null);
  const [paymentFlowInvoiceId, setPaymentFlowInvoiceId] = useState(null);
  const [pollAttemptsExceeded, setPollAttemptsExceeded] = useState(false);

  const [decryptedState, setDecryptedState] = useState({});
  const [decryptedDetails, setDecryptedDetails] = useState({});
  const [decryptingIds, setDecryptingIds] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchInvoicesFromBE() {
    setInvoiceLoading(true);
    setInvoiceError("");
    try {
      const result = await listMyInvoices();
      const invoiceList = Array.isArray(result?.data) ? result.data : [];
      setInvoices(invoiceList);
      setSelectedInvoiceId((currentId) => {
        if (currentId && invoiceList.some((invoice) => invoice.id === currentId)) return currentId;
        return invoiceList.find((invoice) => ["unpaid", "pending_cash"].includes(invoice.status))?.id || invoiceList[0]?.id || null;
      });
      if (invoiceList.length > 0) setActiveStage(4);
    } catch (err) {
      console.error("Error fetching patient invoices", err);
      setInvoiceError(err.message || "Gagal memuat daftar invoice pasien.");
    } finally {
      setInvoiceLoading(false);
      setLoading(false);
    }
  }

  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) || null;
  const paymentStatus = selectedInvoice?.status || "pending";

  useEffect(() => {
    if (stepperContainerRef.current) {
      const activeEl = stepperContainerRef.current.children[activeStage - 1];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [activeStage, loading]);

  async function fetchHistoryFromBE() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const publishedRecords = result.data.filter(item => item.status === "final" || item.status !== "draft");
        const beRecords = publishedRecords.map((item) => ({
          id: item.id,
          hospitalName: item.hospital?.user?.name || item.hospital_name || item.hospital?.name || "Faskes tidak tersedia",
          hospitalCode: maskSip(item.hospital?.medical_license),
          doctorName: item.doctor?.name || "Dokter tidak tersedia",
          specialty: item.doctor?.specialist || "-",
          category: item.record_type || "resep",
          status: item.status || "final",
          date: new Date(item.visit_date || item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
          time: new Date(item.visit_date || item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          txHash: item.tx_hash || null,
          encryptedData: item.encrypted_data || null,
          diagnosis: item.title || "Rekam medis",
          prescriptions: Array.isArray(item.prescriptions) ? item.prescriptions : [],
          vitals: item.vitals || {},
          notes: item.notes || ""
        }));
        setRecords(beRecords);
      }
    } catch (err) {
      console.log("Error fetching history", err);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      fetchHistoryFromBE();
      fetchInvoicesFromBE();
    });

    const syncStage = () => {
      const saved = localStorage.getItem("activePatientStage");
      if (saved) setActiveStage(parseInt(saved, 10));
    };
    syncStage();
    window.addEventListener("storage", syncStage);
    const interval = setInterval(syncStage, 800);
    return () => {
      window.removeEventListener("storage", syncStage);
      clearInterval(interval);
      pollingActiveRef.current = false;
    };
  }, []);

  const mapBackendDetailToFrontend = (rec, backendData) => {
    const detail = backendData.detail || {};
    const summary = backendData.summary || backendData.title || rec.diagnosis;

    let diagnosis = summary;
    let prescriptions = rec.prescriptions;
    let vitals = rec.vitals;
    let notes = rec.notes || "Telah didekripsi secara aman dari jaringan SatuData Blockchain.";

    if (rec.category === "umum") {
      diagnosis = detail.diagnosis || summary;
      notes = detail.note_doctor || notes;
    } else if (rec.category === "resep") {
      diagnosis = "Resep Obat Rawat Jalan";
      notes = detail.note || notes;
      if (detail.list_of_medicines) {
        const meds = detail.list_of_medicines.split(";").map((item) => {
          const parts = item.split(":");
          return {
            medicine: parts[0]?.trim() || "Obat",
            dosage: parts[1]?.trim() || "Sesuai petunjuk"
          };
        });
        prescriptions = meds;
      }
    } else if (rec.category === "lab") {
      diagnosis = `Pemeriksaan Laboratorium: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}\nNilai Rujukan: ${detail.reference_values || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Lab: " + (detail.checkup_result || "-") };
    } else if (rec.category === "radiologi") {
      diagnosis = `Pemeriksaan Radiologi: ${summary}`;
      notes = `Kesimpulan: ${detail.conclusion || "-"}`;
      vitals = { bp: "N/A", pulse: "N/A", temp: "N/A", weight: "Hasil Radiologi: " + (detail.checkup_result || "-") };
    }

    return {
      ...rec,
      diagnosis,
      prescriptions,
      vitals,
      notes,
      isRealDecrypted: true
    };
  };

  const toggleDecryptRecord = async (id) => {
    const isCurrentlyDecrypted = decryptedState[id];
    setDecryptedState((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!isCurrentlyDecrypted && !decryptedDetails[id]) {
      setDecryptingIds((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const originalRecord = records.find((r) => r.id === id);
          const mappedRecord = mapBackendDetailToFrontend(originalRecord, result.data);
          setDecryptedDetails((prev) => ({ ...prev, [id]: mappedRecord }));
        }
      } catch (err) {
        console.error("Error decrypting record:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleOpenDetailModal = async (rec) => {
    setSelectedRecord(rec);
    const id = rec.id;
    if (!decryptedDetails[id]) {
      setDecryptingIds((prev) => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/patient/history/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok && result.data) {
          const mappedRecord = mapBackendDetailToFrontend(rec, result.data);
          setDecryptedDetails((prev) => ({ ...prev, [id]: mappedRecord }));
        }
      } catch (err) {
        console.error("Error opening modal:", err);
      } finally {
        setDecryptingIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const updateInvoiceFromServer = async (invoiceId) => {
    const result = await getMyInvoiceDetail(invoiceId);
    if (!result?.data) return null;

    setInvoices((current) => current.map((invoice) => (invoice.id === invoiceId ? result.data : invoice)));
    return result.data;
  };

  const pollInvoiceStatus = async (invoiceId, attempt = 0, maxAttempts = 40) => {
    if (!invoiceId || !pollingActiveRef.current) return;
    try {
      const invoice = await updateInvoiceFromServer(invoiceId);
      if (invoice?.status === "paid") {
        setPaymentFlowStage("success");
        pollingActiveRef.current = false;
        return;
      }
    } catch (err) {
      console.error("Error polling invoice status", err);
    }
    if (!pollingActiveRef.current) return;
    if (attempt + 1 >= maxAttempts) {
      setPollAttemptsExceeded(true);
    }
    window.setTimeout(() => pollInvoiceStatus(invoiceId, attempt + 1, maxAttempts), 3000);
  };

  const startPaymentFlow = (invoiceId) => {
    setPaymentFlowInvoiceId(invoiceId);
    setPollAttemptsExceeded(false);
    setPaymentFlowStage("processing");
    pollingActiveRef.current = true;
    pollInvoiceStatus(invoiceId, 0);
  };

  const handleClosePaymentFlow = () => {
    pollingActiveRef.current = false;
    setPaymentFlowStage(null);
    setPaymentFlowInvoiceId(null);
    setPollAttemptsExceeded(false);
    fetchInvoicesFromBE();
  };

  const handleProcessOnlinePayment = async () => {
    if (!selectedInvoice || isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      if (paymentMethod === "cash") {
        const result = await payMyInvoiceCash(selectedInvoice.id);
        if (result?.data) {
          setInvoices((current) => current.map((invoice) => (invoice.id === selectedInvoice.id ? result.data : invoice)));
          setShowPaymentModal(false);
          startPaymentFlow(selectedInvoice.id);
        }
        return;
      }

      if (!midtransReady || typeof window === "undefined" || !window.snap) {
        throw new Error("Payment Gateway belum siap. Coba refresh halaman.");
      }

      const result = await payMyInvoiceMidtrans(selectedInvoice.id);
      const snapToken = result?.data?.snap_token || result?.data?.snapToken || result?.snap_token || result?.snapToken;
      if (!snapToken) throw new Error("Token pembayaran tidak tersedia dari backend.");

      setShowPaymentModal(false);
      window.snap.pay(snapToken, {
        onSuccess: () => startPaymentFlow(selectedInvoice.id),
        onPending: () => startPaymentFlow(selectedInvoice.id),
        onError: () => setInvoiceError("Pembayaran Midtrans gagal diproses."),
        onClose: () => {},
      });
    } catch (err) {
      console.error("Error processing patient payment", err);
      setInvoiceError(err.message || "Gagal memproses pembayaran invoice.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  function parseInvoiceItems(rawItems) {
    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems === "string") {
      try {
        const parsed = JSON.parse(rawItems);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error("Gagal parse invoice.items:", err, rawItems);
        return [];
      }
    }
    return [];
  }

  function getItemCategoryLabel(item) {
    const code = (item.code || "").toLowerCase();
    if (code === "resep") return "Farmasi";
    if (["umum", "lab", "radiologi"].includes(code)) return "Layanan Medis";
    if (item.medical_record_id) return "Layanan Medis";
    return "Administrasi / Biaya Tambahan";
  }

  function getFlatInvoiceItems(invoice) {
    const items = parseInvoiceItems(invoice?.items);
    return items.map((item) => ({
      ...item,
      category: getItemCategoryLabel(item),
      subtotal: item.subtotal ?? Number(item.price || 0) * Number(item.qty || 1),
    }));
  }

  const flatInvoiceItems = getFlatInvoiceItems(selectedInvoice);
  const totalAmount = Number(selectedInvoice?.total_amount || 0);

  const filteredRecords = records.filter((rec) => {
    return (
      rec.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const isCompletedVisit = invoices.length === 0 && activeStage >= 5;

  return {
    stepperContainerRef,
    loading,
    records,
    invoices,
    selectedInvoiceId,
    setSelectedInvoiceId,
    invoiceLoading,
    invoiceError,
    activeStage,
    paymentMethod,
    setPaymentMethod,
    showPaymentModal,
    setShowPaymentModal,
    isProcessingPayment,
    midtransReady,
    setMidtransReady,
    paymentFlowStage,
    paymentFlowInvoiceId,
    pollAttemptsExceeded,
    decryptedState,
    decryptedDetails,
    decryptingIds,
    selectedRecord,
    setSelectedRecord,
    searchTerm,
    setSearchTerm,
    selectedInvoice,
    paymentStatus,
    flatInvoiceItems,
    totalAmount,
    filteredRecords,
    isCompletedVisit,
    toggleDecryptRecord,
    handleOpenDetailModal,
    handleProcessOnlinePayment,
    handleClosePaymentFlow
  };
}

export { usePatientRecords as useRecords };
export default usePatientRecords;
