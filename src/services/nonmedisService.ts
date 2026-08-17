import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export type NonMedisClass = "utama" | "klinik";
export type NonMedisStatus = "aktif" | "nonaktif";

export interface NonMedisService {
  id: number;
  code: string;
  name: string;
  class?: NonMedisClass;
  status: NonMedisStatus;
  createdAt?: string;
  updatedAt?: string;
  nama?: string;
  kelas?: string;
}

export interface NonMedisPrice {
  id: number;
  servicenonmedis_id: number;
  nonmedis_service_id?: number | string | null;
  service_nonmedis_id?: number | string | null;
  kptl?: string | null;
  name: string;
  category?: string | null;
  price: number;
  status: NonMedisStatus;
  class?: NonMedisClass;
  createdAt?: string;
  updatedAt?: string;
  serviceNonMedis?: NonMedisService;
  nama?: string;
  kelas?: string;
  harga?: number;
}

export interface PaginationMeta {
  total?: number;
  totalItems?: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  status?: NonMedisStatus;
  search?: string;
}

export interface NonMedisServicePayload {
  code: string;
  name: string;
  class: NonMedisClass;
  status?: NonMedisStatus;
}

export interface NonMedisPricePayload {
  servicenonmedis_id: number | string;
  kptl?: string | null;
  name: string;
  category?: string | null;
  class?: NonMedisClass;
  price: number;
  status?: NonMedisStatus;
}

const SERVICE_ENDPOINT = '/api/nonmedis/service';
const PRICE_ENDPOINT = '/api/nonmedis/price';

// ===================== SERVICE NON MEDIS =====================

// GET /api/nonmedis/service/class/:class -> list per class (utama/klinik) + pagination
export const getNonMedisServicesByClass = async (
  kelas: NonMedisClass,
  params: ListParams = {},
): Promise<ApiResponse<NonMedisService[]>> => {
  return await apiGet(`${SERVICE_ENDPOINT}/class/${encodeURIComponent(kelas)}`, params);
};

// GET /api/nonmedis/service -> list semua class + pagination
export const getNonMedisServices = async (
  params: ListParams & { class?: NonMedisClass } = {},
): Promise<ApiResponse<NonMedisService[]>> => {
  return await apiGet(SERVICE_ENDPOINT, params);
};

// GET /api/nonmedis/service/:id
export const getNonMedisServiceById = async (
  id: string | number,
): Promise<ApiResponse<NonMedisService>> => {
  return await apiGet(`${SERVICE_ENDPOINT}/${encodeURIComponent(String(id))}`);
};

// POST /api/nonmedis/service
export const createNonMedisService = async (
  payload: NonMedisServicePayload,
): Promise<ApiResponse<NonMedisService>> => {
  return await apiPost(SERVICE_ENDPOINT, payload);
};

// PUT /api/nonmedis/service/:id
export const updateNonMedisService = async (
  id: string | number,
  payload: Partial<NonMedisServicePayload>,
): Promise<ApiResponse<NonMedisService>> => {
  return await apiPut(`${SERVICE_ENDPOINT}/${encodeURIComponent(String(id))}`, payload);
};

// DELETE /api/nonmedis/service/:id
export const deleteNonMedisService = async (
  id: string | number,
): Promise<ApiResponse> => {
  return await apiDelete(`${SERVICE_ENDPOINT}/${encodeURIComponent(String(id))}`);
};

// ============== NON MEDIS PRICE (SUB LAYANAN / TARIF) ==============

export const getNonMedisPrices = async (
  params: Record<string, any> = {},
): Promise<ApiResponse<NonMedisPrice[]>> => {
  return await apiGet(PRICE_ENDPOINT, params);
};

export const getNonMedisPricesByService = async (
  serviceNonMedisId: string | number,
): Promise<ApiResponse<NonMedisPrice[]>> => {
  return await apiGet(`${PRICE_ENDPOINT}/service/${encodeURIComponent(String(serviceNonMedisId))}`);
};

export const getNonMedisPriceById = async (
  id: string | number,
): Promise<ApiResponse<NonMedisPrice>> => {
  return await apiGet(`${PRICE_ENDPOINT}/${encodeURIComponent(String(id))}`);
};

export const createNonMedisPrice = async (
  payload: NonMedisPricePayload,
): Promise<ApiResponse<NonMedisPrice>> => {
  return await apiPost(PRICE_ENDPOINT, payload);
};

export const updateNonMedisPrice = async (
  id: string | number,
  payload: Partial<NonMedisPricePayload>,
): Promise<ApiResponse<NonMedisPrice>> => {
  return await apiPut(`${PRICE_ENDPOINT}/${encodeURIComponent(String(id))}`, payload);
};

export const deleteNonMedisPrice = async (
  id: string | number,
): Promise<ApiResponse> => {
  return await apiDelete(`${PRICE_ENDPOINT}/${encodeURIComponent(String(id))}`);
};

const nonmedisService = {
  getNonMedisServices,
  getNonMedisServicesByClass,
  getNonMedisServiceById,
  createNonMedisService,
  updateNonMedisService,
  deleteNonMedisService,
  getNonMedisPrices,
  getNonMedisPricesByService,
  getNonMedisPriceById,
  createNonMedisPrice,
  updateNonMedisPrice,
  deleteNonMedisPrice,
};

export default nonmedisService;