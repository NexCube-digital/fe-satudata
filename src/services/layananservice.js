import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

const normalizeLegacyItem = (item, source = "medis") => {
  if (!item || typeof item !== "object") return item;

  const legacyItem = { ...item };

  if (!legacyItem.type) {
    legacyItem.type = source === "klinik" ? "layanan" : "kategori";
  }

  if (!legacyItem.category) {
    legacyItem.category = source === "klinik" ? "Laboratorium" : "Pelayanan Utama";
  }

  if (!legacyItem.code) {
    legacyItem.code = legacyItem.kptl || `svc-${legacyItem.id || "new"}`;
  }

  if (!legacyItem.satuan) {
    legacyItem.satuan = "Per Tindakan";
  }

  if (!legacyItem.status) {
    legacyItem.status = "active";
  }

  return legacyItem;
};

const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  return [];
};

export const getServicePriceMedis = async (params = {}) => {
  const response = await apiGet("/api/service/service-price-medis", params);
  return {
    ...response,
    data: extractArray(response).map((item) => normalizeLegacyItem(item, "medis")),
  };
};

export const getServicePriceKlinik = async (params = {}) => {
  const response = await apiGet("/api/service/service-price-klinik", params);
  return {
    ...response,
    data: extractArray(response).map((item) => normalizeLegacyItem(item, "klinik")),
  };
};

export const getServicePrices = async (params = {}) => {
  const [medis, klinik] = await Promise.all([
    getServicePriceMedis(params),
    getServicePriceKlinik(params),
  ]);

  const allItems = [...extractArray(medis), ...extractArray(klinik)];

  if (params.type) {
    return {
      success: true,
      data: allItems.filter((item) => item.type === params.type),
    };
  }

  return {
    success: true,
    data: allItems,
  };
};

export const getServicePriceById = async (id) => {
  const response = await apiGet(`/api/service/service-price-medis/${id}`);
  if (response?.success || response?.id) {
    return { ...response, data: normalizeLegacyItem(response.data || response, "medis") };
  }

  const klinikResponse = await apiGet(`/api/service/service-price-klinik/${id}`);
  if (klinikResponse?.success || klinikResponse?.id) {
    return { ...klinikResponse, data: normalizeLegacyItem(klinikResponse.data || klinikResponse, "klinik") };
  }

  return response;
};

export const createServicePrice = async (payload) => {
  const response = await apiPost("/api/service/service-price-medis", payload);
  if (response?.success || response?.id) return response;

  return apiPost("/api/service/service-price-klinik", payload);
};

export const updateServicePrice = async (id, payload) => {
  const response = await apiPut(`/api/service/service-price-medis/${id}`, payload);
  if (response?.success || response?.id) return response;

  return apiPut(`/api/service/service-price-klinik/${id}`, payload);
};

export const deleteServicePrice = async (id) => {
  const response = await apiDelete(`/api/service/service-price-medis/${id}`);
  if (response?.success || response?.id) return response;

  return apiDelete(`/api/service/service-price-klinik/${id}`);
};

export default {
  getServicePrices,
  getServicePriceById,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  getServicePriceMedis,
  getServicePriceKlinik,
};
