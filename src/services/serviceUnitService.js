import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

// Robust array extraction from various response formats
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

export const getServiceUnits = async (params = {}) => {
	const res = await apiGet("/api/service/service-units", params);
	// Ensure data field is always an array
	return {
		...res,
		data: extractArray(res)
	};
};

export const getServiceUnitById = (id) =>
	apiGet(`/api/service/service-units/${id}`);

export const createServiceUnit = (payload) =>
	apiPost("/api/service/service-units", payload);

export const updateServiceUnit = (id, payload) =>
	apiPut(`/api/service/service-units/${id}`, payload);

export const deleteServiceUnit = (id) =>
	apiDelete(`/api/service/service-units/${id}`);

export default {
	getServiceUnits,
	getServiceUnitById,
	createServiceUnit,
	updateServiceUnit,
	deleteServiceUnit,
};