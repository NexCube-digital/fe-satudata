import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const extractArray = (response) => {
	if (!response) return [];
	if (Array.isArray(response)) return response;
	// Try common field names for array data
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.items)) return response.items;
	if (Array.isArray(response.results)) return response.results;
	// If response.data is nested object, try to extract from it
	if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
		if (Array.isArray(response.data.data)) return response.data.data;
		if (Array.isArray(response.data.items)) return response.data.items;
	}
	return [];
};

const withSource = (item, source) => (item ? { ...item, source } : item);

/* ==================== MEDIS ==================== */
export const getServicePriceMedis = async (params = {}) => {
	const response = await apiGet("/api/service/service-price-medis", params);
	return { ...response, data: extractArray(response).map((i) => withSource(i, "medis")) };
};

export const getServicePriceMedisById = (id) =>
	apiGet(`/api/service/service-price-medis/${id}`);

export const createServicePriceMedis = (payload) =>
	apiPost("/api/service/service-price-medis", payload);

export const updateServicePriceMedis = (id, payload) =>
	apiPut(`/api/service/service-price-medis/${id}`, payload);

export const deleteServicePriceMedis = (id) =>
	apiDelete(`/api/service/service-price-medis/${id}`);

/* ==================== KLINIK ==================== */
export const getServicePriceKlinik = async (params = {}) => {
	const response = await apiGet("/api/service/service-price-klinik", params);
	return { ...response, data: extractArray(response).map((i) => withSource(i, "klinik")) };
};

export const getServicePriceKlinikById = (id) =>
	apiGet(`/api/service/service-price-klinik/${id}`);

export const createServicePriceKlinik = (payload) =>
	apiPost("/api/service/service-price-klinik", payload);

export const updateServicePriceKlinik = (id, payload) =>
	apiPut(`/api/service/service-price-klinik/${id}`, payload);

export const deleteServicePriceKlinik = (id) =>
	apiDelete(`/api/service/service-price-klinik/${id}`);

/* ==================== GABUNGAN (untuk ringkasan/summary) ==================== */
export const getServicePrices = async (params = {}) => {
	const { source, ...rest } = params;
	const calls = [];
	if (!source || source === "medis") calls.push(getServicePriceMedis(rest));
	if (!source || source === "klinik") calls.push(getServicePriceKlinik(rest));

	const results = await Promise.all(calls);
	const data = results.flatMap((r) => extractArray(r));
	return { success: true, data };
};

// source wajib diisi eksplisit ("medis" | "klinik") — tidak ada lagi fallback trial-and-error
export const createServicePrice = (source, payload) =>
	source === "klinik" ? createServicePriceKlinik(payload) : createServicePriceMedis(payload);

export const updateServicePrice = (source, id, payload) =>
	source === "klinik" ? updateServicePriceKlinik(id, payload) : updateServicePriceMedis(id, payload);

export const deleteServicePrice = (source, id) =>
	source === "klinik" ? deleteServicePriceKlinik(id) : deleteServicePriceMedis(id);

export default {
	getServicePrices,
	getServicePriceMedis,
	getServicePriceKlinik,
	createServicePrice,
	updateServicePrice,
	deleteServicePrice,
};