import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

const AGGREGATED_ENDPOINT = "/api/service/service-prices";
const LEGACY_ENDPOINTS = {
  medis: "/api/service/service-price-medis",
  klinik: "/api/service/service-price-klinik",
};

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

const withFallback = async (primaryCall, fallbackCall) => {
  try {
    return await primaryCall();
  } catch (error) {
    const status = Number(error?.status || 0);
    if (status === 404 || status === 405 || status === 400) {
      return fallbackCall();
    }
    throw error;
  }
};

export const getServicePriceMedis = async (params: any = {}) => {
  const response = await withFallback(
    () => apiGet(AGGREGATED_ENDPOINT, { ...params, source: "medis" }),
    () => apiGet(LEGACY_ENDPOINTS.medis, params)
  );

  return {
    ...response,
    data: extractArray(response).map((item) => normalizeLegacyItem(item, "medis")),
  };
};

export const getServicePriceKlinik = async (params: any = {}) => {
  const response = await withFallback(
    () => apiGet(AGGREGATED_ENDPOINT, { ...params, source: "klinik" }),
    () => apiGet(LEGACY_ENDPOINTS.klinik, params)
  );

  return {
    ...response,
    data: extractArray(response).map((item) => normalizeLegacyItem(item, "klinik")),
  };
};

export const getServicePrices = async (params: any = {}) => {
  const { source, ...rest } = params;

  if (source) {
    return source === "klinik" ? getServicePriceKlinik(rest) : getServicePriceMedis(rest);
  }

  const [medis, klinik] = await Promise.all([
    getServicePriceMedis(rest),
    getServicePriceKlinik(rest),
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

export const getServicePriceById = async (id, source = "medis") => {
  const response = await withFallback(
    () => apiGet(`${AGGREGATED_ENDPOINT}/${id}`, { source }),
    () => apiGet(`${LEGACY_ENDPOINTS[source] || LEGACY_ENDPOINTS.medis}/${id}`)
  );

  if (response?.success || response?.id) {
    return { ...response, data: normalizeLegacyItem(response.data || response, source) };
  }

  return response;
};

const normalizeCreateArgs = (sourceOrPayload, maybePayload) => {
  if (sourceOrPayload && typeof sourceOrPayload === "object" && !Array.isArray(sourceOrPayload)) {
    const payload = { ...sourceOrPayload };
    return { source: payload.source || "medis", payload };
  }

  return {
    source: sourceOrPayload || "medis",
    payload: maybePayload || {},
  };
};

const normalizeUpdateArgs = (sourceOrId, idOrPayload, maybePayload) => {
  if (typeof sourceOrId === "number" || typeof sourceOrId === "string") {
    return {
      source: maybePayload?.source || "medis",
      id: Number(sourceOrId),
      payload: idOrPayload || {},
    };
  }

  const payload = { ...sourceOrId };
  return {
    source: payload.source || "medis",
    id: Number(idOrPayload || payload.id),
    payload,
  };
};

export const createServicePrice = async (sourceOrPayload, maybePayload) => {
  const { source, payload } = normalizeCreateArgs(sourceOrPayload, maybePayload);
  return withFallback(
    () => apiPost(AGGREGATED_ENDPOINT, { ...payload, source }),
    () => apiPost(LEGACY_ENDPOINTS[source] || LEGACY_ENDPOINTS.medis, payload)
  );
};

export const updateServicePrice = async (sourceOrId, idOrPayload, maybePayload) => {
  const { source, id, payload } = normalizeUpdateArgs(sourceOrId, idOrPayload, maybePayload);
  return withFallback(
    () => apiPut(`${AGGREGATED_ENDPOINT}/${id}`, { ...payload, source }),
    () => apiPut(`${LEGACY_ENDPOINTS[source] || LEGACY_ENDPOINTS.medis}/${id}`, payload)
  );
};

export const deleteServicePrice = async (sourceOrId, maybeId) => {
  if (typeof sourceOrId === "number" || typeof sourceOrId === "string") {
    const source = maybeId && typeof maybeId === "string" ? maybeId : "medis";
    return withFallback(
      () => apiDelete(`${AGGREGATED_ENDPOINT}/${sourceOrId}?source=${source}`),
      () => apiDelete(`${LEGACY_ENDPOINTS[source] || LEGACY_ENDPOINTS.medis}/${sourceOrId}`)
    );
  }

  const item = sourceOrId && typeof sourceOrId === "object" ? sourceOrId : {};
  const source = item.source || "medis";
  const id = Number(item.id ?? maybeId ?? 0);
  return withFallback(
    () => apiDelete(`${AGGREGATED_ENDPOINT}/${id}?source=${source}`),
    () => apiDelete(`${LEGACY_ENDPOINTS[source] || LEGACY_ENDPOINTS.medis}/${id}`)
  );
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
