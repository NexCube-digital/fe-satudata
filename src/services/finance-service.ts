import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { Invoice, ServiceTariff } from '@/types/finance';

export const getInvoices = async (params: Record<string, any> = {}): Promise<ApiResponse<Invoice[]>> => {
  return await apiGet('/api/finance/invoices', params);
};

export const getInvoiceById = async (invoiceId: string | number, payload: any = {}): Promise<ApiResponse<Invoice>> => {
  return await apiGet(`/api/invoice/${invoiceId}`, payload);
};

export const getServiceTariffs = async (category?: string): Promise<ApiResponse<ServiceTariff[]>> => {
  return await apiGet('/api/finance/tariffs', { category });
};

export const getServicePrices = async (params: Record<string, any> = {}) => {
  return await apiGet('/api/hospital/finance/service-prices', params);
};

export const getServicePriceMedis = async (params: Record<string, any> = {}) => {
  return await apiGet('/api/hospital/finance/service-prices/medis', params);
};

export const getServicePriceKlinik = async (params: Record<string, any> = {}) => {
  return await apiGet('/api/hospital/finance/service-prices/klinik', params);
};

export const createServicePrice = async (payload: any) => {
  return await apiPost('/api/hospital/finance/service-prices', payload);
};

export const updateServicePrice = async (id: string | number, payload: any) => {
  return await apiPut(`/api/hospital/finance/service-prices/${id}`, payload);
};

export const deleteServicePrice = async (id: string | number) => {
  return await apiDelete(`/api/hospital/finance/service-prices/${id}`);
};

export const getInvoicePatients = async () => {
  return await apiGet('/api/invoice/patients');
};

export const getAdditionalCharges = async () => {
  return await apiGet('/api/invoice/additional-charges');
};

export const getPatientOverview = async (patientId: string | number) => {
  return await apiGet(`/api/invoice/patients/${patientId}/overview`);
};

export const createInvoice = async (patientId: string | number, payload: any) => {
  return await apiPost(`/api/invoice/patients/${patientId}`, payload);
};

export const listInvoices = async (patientId?: string | number) => {
  return await apiGet('/api/invoice/list', { patientId });
};

export const payInvoice = async (invoiceId: string | number, payload: any = {}) => {
  return await apiPost(`/api/invoice/${invoiceId}/pay`, payload);
};

export const payInvoiceMidtrans = async (invoiceId: string | number) => {
  const response = await apiPost(`/api/invoice/${invoiceId}/pay/midtrans`);
  const snapToken =
    response?.data?.snap_token ||
    response?.data?.snapToken ||
    response?.data?.token ||
    response?.snap_token ||
    response?.snapToken ||
    response?.token;

  if (!snapToken) return response;

  return {
    ...response,
    data: {
      ...(response.data || {}),
      snap_token: snapToken,
      snapToken,
    },
  };
};

export const checkoutPOS = async (payload: any) => {
  return await apiPost('/api/hospital/pharmacy/pos/checkout', payload);
};

export const listMyInvoices = async () => {
  return await apiGet('/api/patient/invoices');
};

export const getMyInvoiceDetail = async (invoiceId: string | number) => {
  return await apiGet(`/api/patient/${invoiceId}`);
};

export const payMyInvoiceCash = async (invoiceId: string | number) => {
  return await apiPost(`/api/patient/${invoiceId}/pay/cash`);
};

export const payMyInvoiceMidtrans = async (invoiceId: string | number) => {
  return await apiPost(`/api/patient/${invoiceId}/pay/midtrans`);
};

export default {
  getInvoices,
  getInvoiceById,
  getServiceTariffs,
  getServicePrices,
  getServicePriceMedis,
  getServicePriceKlinik,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  getInvoicePatients,
  getAdditionalCharges,
  getPatientOverview,
  createInvoice,
  listInvoices,
  payInvoice,
  payInvoiceMidtrans,
  checkoutPOS,
  listMyInvoices,
  getMyInvoiceDetail,
  payMyInvoiceCash,
  payMyInvoiceMidtrans,
};
