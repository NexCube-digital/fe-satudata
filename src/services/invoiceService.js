import { apiGet, apiPost } from "@/lib/api";

export const getInvoicePatients = async () => {
  return await apiGet("/api/invoice/patients");
};

export const getAdditionalCharges = async () => {
  return await apiGet("/api/invoice/additional-charges");
};

export const getPatientOverview = async (patientId) => {
  return await apiGet(`/api/invoice/patients/${patientId}/overview`);
};

export const createInvoice = async (patientId, payload) => {
  return await apiPost(`/api/invoice/patients/${patientId}`, payload);
};

export const listInvoices = async (patientId) => {
  return await apiGet("/api/invoice/list", { patientId });
};

export const payInvoice = async (invoiceId, payload = {}) => {
  return await apiPost(`/api/invoice/${invoiceId}/pay`, payload);
};

export const getInvoiceById = async (invoiceId, payload = {}) => {
  return await apiGet(`/api/invoice/${invoiceId}`, payload);
};

export const payInvoiceMidtrans = async (invoiceId) => {
  return await apiPost(`/api/invoice/${invoiceId}/pay/midtrans`);
};

export default {
  getInvoicePatients,
  getAdditionalCharges,
  getPatientOverview,
  createInvoice,
  listInvoices,
  payInvoice,
  payInvoiceMidtrans,
  getInvoiceById,
};
