import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

const UNIT_ENDPOINT = "/api/service/service-units";
const LEGACY_ROOM_ENDPOINT = "/api/service/service-units/ruangan";

// Ekstrak array dari berbagai kemungkinan bentuk response
const extractArray = (response: any) => {
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

// Ambil info pagination dari response, dari berbagai kemungkinan lokasi nesting
const extractPagination = (response: any) => {
	return response?.data?.pagination || response?.pagination || null;
};

const fetchAllPages = async (endpoint: string, params: any = {}) => {
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

const fallbackIfNeeded = async (callPrimary, callFallback) => {
	try {
		return await callPrimary();
	} catch (error) {
		const status = Number(error?.status || 0);
		if (status === 404 || status === 405 || status === 400) {
			return callFallback();
		}
		throw error;
	}
};

export const getServiceUnits = async (params: any = {}) => {
	const res = await fetchAllPages(UNIT_ENDPOINT, params);
	return { ...res, data: extractArray(res) };
};

// Unit layanan khusus kategori "ruangan". Backend baru memfilter lewat query param,
// sementara backend lama masih punya endpoint dedicated, jadi kita tetap support fallback.
export const getRuanganUnits = async (params: any = {}) => {
	const res = await fallbackIfNeeded(
		() => fetchAllPages(UNIT_ENDPOINT, { ...params, category: "ruangan" }),
		() => fetchAllPages(LEGACY_ROOM_ENDPOINT, params)
	);
	return { ...res, data: extractArray(res) };
};

export const getServiceUnitById = (id: any) =>
	apiGet(`${UNIT_ENDPOINT}/${id}`);

export const createServiceUnit = (payload) =>
	apiPost(UNIT_ENDPOINT, payload);

export const updateServiceUnit = (id, payload) =>
	apiPut(`${UNIT_ENDPOINT}/${id}`, payload);

export const deleteServiceUnit = (id: any) =>
	apiDelete(`${UNIT_ENDPOINT}/${id}`);

export default {
	getServiceUnits,
	getRuanganUnits,
	getServiceUnitById,
	createServiceUnit,
	updateServiceUnit,
	deleteServiceUnit,
};