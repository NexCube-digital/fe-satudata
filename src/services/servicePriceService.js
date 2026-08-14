import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const AGGREGATED_ENDPOINT = "/api/service/service-prices";
const LEGACY_ENDPOINTS = {
	medis: "/api/service/service-price-medis",
	klinik: "/api/service/service-price-klinik",
};

const extractArray = (response) => {
	if (!response) return [];
	if (Array.isArray(response)) return response;
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.items)) return response.items;
	if (Array.isArray(response.results)) return response.results;
	if (response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
		if (Array.isArray(response.data.data)) return response.data.data;
		if (Array.isArray(response.data.items)) return response.data.items;
	}
	return [];
};

const extractPagination = (response) => {
	return response?.data?.pagination || response?.pagination || null;
};

const fetchAllPages = async (endpoint, params = {}) => {
	const callerSpecifiedPaging = params.limit !== undefined || params.offset !== undefined || params.page !== undefined;

	if (callerSpecifiedPaging) {
		return apiGet(endpoint, params);
	}

	const pageSize = 100;
	let offset = 0;
	let all = [];
	let total = Infinity;
	let lastRes = null;

	while (offset < total) {
		const res = await apiGet(endpoint, { ...params, limit: pageSize, offset });
		lastRes = res;
		const rows = extractArray(res);
		all = all.concat(rows);

		const pagination = extractPagination(res);
		total = pagination?.total ?? rows.length;

		if (rows.length === 0) break;
		offset += pageSize;
	}

	return {
		...(lastRes || {}),
		data: { data: all, pagination: extractPagination(lastRes) },
	};
};

const withSource = (item, source) => {
	if (!item || typeof item !== "object") return item;
	const itemWithSource = { ...item };
	if (!itemWithSource.source) itemWithSource.source = source;
	return itemWithSource;
};

const getLegacyEndpoint = (source) => LEGACY_ENDPOINTS[source] || LEGACY_ENDPOINTS.medis;

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

const normalizeMainListResponse = (response, source) => {
	const data = extractArray(response).map((item) => withSource(item, source));
	return { ...(response || {}), data };
};

/* ==================== MEDIS ==================== */
export const getServicePriceMedis = async (params = {}) => {
	const response = await withFallback(
		() => fetchAllPages(AGGREGATED_ENDPOINT, { ...params, source: "medis" }),
		() => fetchAllPages(getLegacyEndpoint("medis"), params)
	);
	return normalizeMainListResponse(response, "medis");
};

export const getServicePriceMedisById = async (id) => {
	return withFallback(
		() => apiGet(`${AGGREGATED_ENDPOINT}/${id}`, { source: "medis" }),
		() => apiGet(`${getLegacyEndpoint("medis")}/${id}`)
	);
};

export const createServicePriceMedis = async (payload) => {
	return withFallback(
		() => apiPost(AGGREGATED_ENDPOINT, { ...payload, source: "medis" }),
		() => apiPost(getLegacyEndpoint("medis"), payload)
	);
};

export const updateServicePriceMedis = async (id, payload) => {
	return withFallback(
		() => apiPut(`${AGGREGATED_ENDPOINT}/${id}`, { ...payload, source: "medis" }),
		() => apiPut(`${getLegacyEndpoint("medis")}/${id}`, payload)
	);
};

export const deleteServicePriceMedis = async (id) => {
	return withFallback(
		() => apiDelete(`${AGGREGATED_ENDPOINT}/${id}?source=medis`),
		() => apiDelete(`${getLegacyEndpoint("medis")}/${id}`)
	);
};

/* ==================== KLINIK ==================== */
export const getServicePriceKlinik = async (params = {}) => {
	const response = await withFallback(
		() => fetchAllPages(AGGREGATED_ENDPOINT, { ...params, source: "klinik" }),
		() => fetchAllPages(getLegacyEndpoint("klinik"), params)
	);
	return normalizeMainListResponse(response, "klinik");
};

export const getServicePriceKlinikById = async (id) => {
	return withFallback(
		() => apiGet(`${AGGREGATED_ENDPOINT}/${id}`, { source: "klinik" }),
		() => apiGet(`${getLegacyEndpoint("klinik")}/${id}`)
	);
};

export const createServicePriceKlinik = async (payload) => {
	return withFallback(
		() => apiPost(AGGREGATED_ENDPOINT, { ...payload, source: "klinik" }),
		() => apiPost(getLegacyEndpoint("klinik"), payload)
	);
};

export const updateServicePriceKlinik = async (id, payload) => {
	return withFallback(
		() => apiPut(`${AGGREGATED_ENDPOINT}/${id}`, { ...payload, source: "klinik" }),
		() => apiPut(`${getLegacyEndpoint("klinik")}/${id}`, payload)
	);
};

export const deleteServicePriceKlinik = async (id) => {
	return withFallback(
		() => apiDelete(`${AGGREGATED_ENDPOINT}/${id}?source=klinik`),
		() => apiDelete(`${getLegacyEndpoint("klinik")}/${id}`)
	);
};

/* ==================== GABUNGAN (untuk ringkasan/summary) ==================== */
export const getServicePrices = async (params = {}) => {
	const { source, ...rest } = params;
	if (source) {
		return source === "klinik" ? getServicePriceKlinik(rest) : getServicePriceMedis(rest);
	}

	const results = await Promise.all([getServicePriceMedis(rest), getServicePriceKlinik(rest)]);
	const data = results.flatMap((r) => extractArray(r));
	return { success: true, data };
};

const normalizeCreateArgs = (sourceOrPayload, maybePayload) => {
	if (sourceOrPayload && typeof sourceOrPayload === "object" && !Array.isArray(sourceOrPayload)) {
		const payload = { ...sourceOrPayload };
		const source = payload.source || "medis";
		return { source, payload };
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
	const source = payload.source || "medis";
	return {
		source,
		id: Number(idOrPayload || payload.id),
		payload,
	};
};

export const createServicePrice = (sourceOrPayload, maybePayload) => {
	const { source, payload } = normalizeCreateArgs(sourceOrPayload, maybePayload);
	return source === "klinik" ? createServicePriceKlinik(payload) : createServicePriceMedis(payload);
};

export const updateServicePrice = (sourceOrId, idOrPayload, maybePayload) => {
	const { source, id, payload } = normalizeUpdateArgs(sourceOrId, idOrPayload, maybePayload);
	return source === "klinik" ? updateServicePriceKlinik(id, payload) : updateServicePriceMedis(id, payload);
};

export const deleteServicePrice = (sourceOrId, maybeId) => {
	if (typeof sourceOrId === "number" || typeof sourceOrId === "string") {
		const source = maybeId && typeof maybeId === "string" ? maybeId : "medis";
		return source === "klinik" ? deleteServicePriceKlinik(Number(sourceOrId)) : deleteServicePriceMedis(Number(sourceOrId));
	}

	const item = sourceOrId && typeof sourceOrId === "object" ? sourceOrId : {};
	const source = item.source || "medis";
	const id = Number(item.id ?? maybeId ?? 0);
	return source === "klinik" ? deleteServicePriceKlinik(id) : deleteServicePriceMedis(id);
};

export default {
	getServicePrices,
	getServicePriceMedis,
	getServicePriceKlinik,
	createServicePrice,
	updateServicePrice,
	deleteServicePrice,
};