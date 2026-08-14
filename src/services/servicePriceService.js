import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const AGGREGATED_ENDPOINT = "/api/service/service-prices";
const LEGACY_ENDPOINTS = {
	medis: "/api/service/service-price-medis",
	klinik: "/api/service/service-price-klinik",
};

const VALID_SOURCES = ["medis", "klinik"];

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

// PENTING: pola fallback-retry ini HANYA aman dipakai untuk operasi READ (GET),
// karena GET bersifat idempotent — dipanggil berkali-kali tidak menimbulkan efek
// samping. JANGAN pakai pola ini untuk create/update/delete (POST/PUT/DELETE):
// kalau primaryCall SUDAH berhasil menyimpan/mengubah/menghapus data di server,
// tapi client salah membaca response-nya sebagai error, maka fallbackCall akan
// mengirim ulang request yang sama dan menghasilkan data duplikat / operasi ganda.
const withFallbackForRead = async (primaryCall, fallbackCall) => {
	try {
		return await primaryCall();
	} catch (error) {
		const status = Number(error?.status || 0);
		// 404/405 = rute memang tidak ada di backend baru -> aman coba endpoint lama.
		// (400 sengaja TIDAK termasuk, karena itu berarti endpoint ADA tapi query-nya ditolak)
		if (status === 404 || status === 405) {
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

// READ - aman pakai fallback, GET idempotent
export const getServicePriceMedis = async (params = {}) => {
	const response = await withFallbackForRead(
		() => fetchAllPages(AGGREGATED_ENDPOINT, { ...params, source: "medis" }),
		() => fetchAllPages(getLegacyEndpoint("medis"), params)
	);
	return normalizeMainListResponse(response, "medis");
};

export const getServicePriceMedisById = async (id) => {
	return withFallbackForRead(
		() => apiGet(`${AGGREGATED_ENDPOINT}/${id}`, { source: "medis" }),
		() => apiGet(`${getLegacyEndpoint("medis")}/${id}`)
	);
};

// WRITE - TIDAK pakai fallback, cukup satu kali panggil ke endpoint baru,
// supaya tidak ada risiko double-submit
export const createServicePriceMedis = async (payload) => {
	return apiPost(AGGREGATED_ENDPOINT, { ...payload, source: "medis" });
};

export const updateServicePriceMedis = async (id, payload) => {
	return apiPut(`${AGGREGATED_ENDPOINT}/${id}`, { ...payload, source: "medis" });
};

export const deleteServicePriceMedis = async (id) => {
	return apiDelete(`${AGGREGATED_ENDPOINT}/${id}?source=medis`);
};

/* ==================== KLINIK ==================== */

// READ - aman pakai fallback, GET idempotent
export const getServicePriceKlinik = async (params = {}) => {
	const response = await withFallbackForRead(
		() => fetchAllPages(AGGREGATED_ENDPOINT, { ...params, source: "klinik" }),
		() => fetchAllPages(getLegacyEndpoint("klinik"), params)
	);
	return normalizeMainListResponse(response, "klinik");
};

export const getServicePriceKlinikById = async (id) => {
	return withFallbackForRead(
		() => apiGet(`${AGGREGATED_ENDPOINT}/${id}`, { source: "klinik" }),
		() => apiGet(`${getLegacyEndpoint("klinik")}/${id}`)
	);
};

// WRITE - TIDAK pakai fallback
export const createServicePriceKlinik = async (payload) => {
	return apiPost(AGGREGATED_ENDPOINT, { ...payload, source: "klinik" });
};

export const updateServicePriceKlinik = async (id, payload) => {
	return apiPut(`${AGGREGATED_ENDPOINT}/${id}`, { ...payload, source: "klinik" });
};

export const deleteServicePriceKlinik = async (id) => {
	return apiDelete(`${AGGREGATED_ENDPOINT}/${id}?source=klinik`);
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

/**
 * Mendukung 3 gaya pemanggilan:
 *  1. updateServicePrice(source, id, payload)   <- dipakai RuanganFinancePage.jsx
 *  2. updateServicePrice(id, payload, source?)  <- gaya lama/alternatif
 *  3. updateServicePrice(itemObject, id?)       <- kalau argumen pertama object utuh
 *
 * PENTING: argumen pertama dicek dulu apakah dia salah satu dari VALID_SOURCES
 * ("medis"/"klinik") sebelum diasumsikan sebagai id. Sebelumnya kode ini cuma
 * cek typeof === "number" || "string", padahal "medis"/"klinik" juga string,
 * jadi ke-detect salah sebagai id -> Number("medis") = NaN.
 */
const normalizeUpdateArgs = (a, b, c) => {
	// Signature 1: (source, id, payload)
	if (typeof a === "string" && VALID_SOURCES.includes(a)) {
		return { source: a, id: Number(b), payload: c || {} };
	}

	// Signature 2: (id, payload, source?)
	if (typeof a === "number" || typeof a === "string") {
		const source = typeof c === "string" && VALID_SOURCES.includes(c) ? c : "medis";
		return { source, id: Number(a), payload: b || {} };
	}

	// Signature 3: (itemObject, id?)
	const payload = { ...a };
	const source = payload.source || "medis";
	return {
		source,
		id: Number(b || payload.id),
		payload,
	};
};

export const createServicePrice = (sourceOrPayload, maybePayload) => {
	const { source, payload } = normalizeCreateArgs(sourceOrPayload, maybePayload);
	return source === "klinik" ? createServicePriceKlinik(payload) : createServicePriceMedis(payload);
};

export const updateServicePrice = (a, b, c) => {
	const { source, id, payload } = normalizeUpdateArgs(a, b, c);
	return source === "klinik" ? updateServicePriceKlinik(id, payload) : updateServicePriceMedis(id, payload);
};

/**
 * Mendukung 3 gaya pemanggilan:
 *  1. deleteServicePrice(source, id)     <- dipakai RuanganFinancePage.jsx
 *  2. deleteServicePrice(id, source?)    <- gaya lama/alternatif
 *  3. deleteServicePrice(itemObject, id?)
 *
 * Sama seperti update: argumen pertama dicek dulu apakah dia valid source
 * sebelum diasumsikan sebagai id.
 */
export const deleteServicePrice = (a, b) => {
	// Signature 1: (source, id)
	if (typeof a === "string" && VALID_SOURCES.includes(a)) {
		return a === "klinik" ? deleteServicePriceKlinik(Number(b)) : deleteServicePriceMedis(Number(b));
	}

	// Signature 2: (id, source?)
	if (typeof a === "number" || typeof a === "string") {
		const source = typeof b === "string" && VALID_SOURCES.includes(b) ? b : "medis";
		return source === "klinik" ? deleteServicePriceKlinik(Number(a)) : deleteServicePriceMedis(Number(a));
	}

	// Signature 3: (itemObject, id?)
	const item = a && typeof a === "object" ? a : {};
	const source = item.source || "medis";
	const id = Number(item.id ?? b ?? 0);
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