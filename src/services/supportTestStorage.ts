"use client";

export interface SupportTestRequest {
  id: string;
  visitId: string;
  patientName: string;
  noRm: string;
  category: string; // "lab" | "radiologi" | "ranap" | "rujuk" | "death" | "icu" | "rehab" | "bedah" | "odc"
  requestOrigin: string;
  doctorName?: string;
  testDetails: string;
  status: "MENUNGGU_PROSES" | "DIPROSES" | "SELESAI";
  createdAt: string;
  processedAt?: string;
  resultData?: {
    summary?: string;
    hb?: string;
    leukosit?: string;
    trombosit?: string;
    gds?: string;
    labNotes?: string;
    radExpertise?: string;
    radImpression?: string;
    radNotes?: string;
    doctorExpertise?: string;
    roomType?: string;
    transferNotes?: string;
    referralFacility?: string;
    referralReason?: string;
    deathTime?: string;
    deathCause?: string;
    opProcedure?: string;
    opDiagnosis?: string;
    opNotes?: string;
    rehabProgram?: string;
    rehabDiagnosis?: string;
    rehabNotes?: string;
  };
}

const STORAGE_KEY = "satudata_support_test_requests";

// Initial seed data if empty
const DEFAULT_REQUESTS: SupportTestRequest[] = [
  {
    id: "REQ-LAB-20260821-001",
    visitId: "VISIT-20260821-DX2I",
    patientName: "Budi Santoso",
    noRm: "RM-994201",
    category: "lab",
    requestOrigin: "Instalasi Gawat Darurat (IGD)",
    doctorName: "dr. Ahmad Dahlan, Sp.B",
    testDetails: "Darah Lengkap (DL), Gula Darah Sewaktu (GDS), Ureum & Kreatinin",
    status: "MENUNGGU_PROSES",
    createdAt: new Date().toISOString(),
  },
  {
    id: "REQ-RAD-20260821-001",
    visitId: "VISIT-20260821-DX2I",
    patientName: "Budi Santoso",
    noRm: "RM-994201",
    category: "radiologi",
    requestOrigin: "Instalasi Gawat Darurat (IGD)",
    doctorName: "dr. Ahmad Dahlan, Sp.B",
    testDetails: "Rontgen Thorax AP/PA, CT-Scan Kepala tanpa kontras",
    status: "MENUNGGU_PROSES",
    createdAt: new Date().toISOString(),
  },
];

export function getAllSupportTestRequests(): SupportTestRequest[] {
  if (typeof window === "undefined") return DEFAULT_REQUESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUESTS));
      return DEFAULT_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_REQUESTS;
  }
}

export function getSupportTestRequestsByCategory(category: string): SupportTestRequest[] {
  const all = getAllSupportTestRequests();
  const cat = (category || "").toLowerCase().trim();
  return all.filter((r) => r.category.toLowerCase().trim() === cat);
}

export function getSupportTestRequestByVisit(visitId: string, category: string): SupportTestRequest | undefined {
  const all = getAllSupportTestRequests();
  const cat = (category || "").toLowerCase().trim();
  return all.find((r) => r.visitId === visitId && r.category.toLowerCase().trim() === cat);
}

export function createOrUpdateSupportTestRequest(req: Partial<SupportTestRequest>): SupportTestRequest {
  const all = getAllSupportTestRequests();
  const category = (req.category || "lab").toLowerCase().trim();
  const visitId = req.visitId || "VISIT-20260821-SEDC";

  const existingIndex = all.findIndex((r) => r.visitId === visitId && r.category.toLowerCase().trim() === category);

  let updatedRequest: SupportTestRequest;

  if (existingIndex >= 0) {
    updatedRequest = {
      ...all[existingIndex],
      testDetails: req.testDetails || all[existingIndex].testDetails,
      doctorName: req.doctorName || all[existingIndex].doctorName,
      patientName: req.patientName || all[existingIndex].patientName,
      noRm: req.noRm || all[existingIndex].noRm,
      status: "MENUNGGU_PROSES",
    };
    all[existingIndex] = updatedRequest;
  } else {
    updatedRequest = {
      id: `REQ-${category.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      visitId,
      patientName: req.patientName || "Pasien IGD",
      noRm: req.noRm || "RM-00129",
      category,
      requestOrigin: req.requestOrigin || "Instalasi Gawat Darurat (IGD)",
      doctorName: req.doctorName || "Dokter Jaga IGD",
      testDetails: req.testDetails || "Permintaan Pelayanan Medis Integrasi",
      status: "MENUNGGU_PROSES",
      createdAt: new Date().toISOString(),
    };
    all.unshift(updatedRequest);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  return updatedRequest;
}

export function processSupportTestRequest(requestId: string, resultData: SupportTestRequest["resultData"]): SupportTestRequest | null {
  const all = getAllSupportTestRequests();
  const index = all.findIndex((r) => r.id === requestId);
  if (index === -1) return null;

  all[index].status = "SELESAI";
  all[index].processedAt = new Date().toISOString();
  all[index].resultData = resultData;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  return all[index];
}
