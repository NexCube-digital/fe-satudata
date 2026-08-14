import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Medicine, Prescription, PosTransaction } from '@/types/pharmacy';

export const getMedicines = async (params: Record<string, any> = {}): Promise<ApiResponse<Medicine[]>> => {
  return await apiGet('/api/pharmacy/medicines', params);
};

export const getPrescriptions = async (params: Record<string, any> = {}): Promise<ApiResponse<Prescription[]>> => {
  return await apiGet('/api/pharmacy/prescriptions', params);
};

export const createPosTransaction = async (payload: Partial<PosTransaction>): Promise<ApiResponse<PosTransaction>> => {
  return await apiPost('/api/pharmacy/pos', payload);
};

export const getSalesHistory = async (params: Record<string, any> = {}): Promise<ApiResponse<PosTransaction[]>> => {
  return await apiGet('/api/pharmacy/sales-history', params);
};

export default {
  getMedicines,
  getPrescriptions,
  createPosTransaction,
  getSalesHistory,
};
