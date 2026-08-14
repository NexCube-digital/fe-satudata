// src/lib/api.ts
// API Client wrapper for SatuData Frontend Next.js connecting to Backend Express API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const parseResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text) return {};

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: "Backend mengirim response JSON yang tidak valid." };
    }
  }

  return {
    message: text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")
      ? `Endpoint API tidak ditemukan atau mengembalikan halaman HTML (HTTP ${response.status}).`
      : text.trim(),
  };
};

/**
 * Token & User Local Storage Helpers
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken?: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const getUser = (): any => {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return null;
  }
};

export const setUser = (user: any): void => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

/**
 * Helper to construct full avatar / profile picture / logo URL from backend user object
 */
export const getAvatarUrl = (user: any): string | null => {
  if (!user) return null;

  if (user.avatarUrl && typeof user.avatarUrl === "string" && user.avatarUrl.trim() !== "") {
    if (user.avatarUrl.startsWith("http://") || user.avatarUrl.startsWith("https://") || user.avatarUrl.startsWith("/")) {
      return user.avatarUrl;
    }
  }

  const profilePic = user.profil?.profile_picture || user.profile_picture;
  if (profilePic && typeof profilePic === "string" && profilePic.trim() !== "") {
    if (profilePic.startsWith("http://") || profilePic.startsWith("https://") || profilePic.startsWith("/")) {
      return profilePic;
    }
    return `${API_BASE_URL}/public/upload/profile-picture/${profilePic}`;
  }

  const hospitalLogo = user.hospitalProfile?.logo || user.logo;
  if (hospitalLogo && typeof hospitalLogo === "string" && hospitalLogo.trim() !== "") {
    if (hospitalLogo.startsWith("http://") || hospitalLogo.startsWith("https://") || hospitalLogo.startsWith("/")) {
      return hospitalLogo;
    }
    return `${API_BASE_URL}/public/upload/hospital/${hospitalLogo}`;
  }

  return null;
};

export const clearAuth = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

/**
 * Refresh Access Token Function
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await parseResponse(response);

    if (response.ok && result.success && result.data) {
      setTokens(result.data.accessToken, result.data.refreshToken);
      return result.data.accessToken;
    } else {
      clearAuth();
      return null;
    }
  } catch (err) {
    console.error("Error refreshing token:", err);
    clearAuth();
    return null;
  }
};

/**
 * Build a query string from a plain params object.
 * Skips undefined/null/"" values. Returns "" if there's nothing to add.
 */
const buildQueryString = (params: Record<string, any> = {}): string => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export interface ApiFetchOptions extends RequestInit {
  _isRetry?: boolean;
}

/**
 * Main API Fetch Wrapper with Interceptor
 */
export const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}): Promise<any> => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((options.headers as Record<string, string>) || {}),
  };

  const accessToken = getAccessToken();
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (netErr: any) {
    const error: any = new Error(`Gagal terhubung ke API backend (${netErr?.message || "Network error"}).`);
    error.status = 0;
    error.data = null;
    throw error;
  }

  // If 401 Unauthorized, attempt token refresh and retry request once
  if (response.status === 401 && accessToken && !options._isRetry) {
    const newAccessToken = await refreshAuthToken();
    if (newAccessToken) {
      headers.Authorization = `Bearer ${newAccessToken}`;
      try {
        const { _isRetry: _retry, ...retryConfig } = config;
        response = await fetch(url, {
          ...retryConfig,
          headers,
        });
      } catch (retryErr: any) {
        const error: any = new Error(`Gagal terhubung ke API backend setelah refresh token (${retryErr?.message}).`);
        error.status = 0;
        error.data = null;
        throw error;
      }
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const error: any = new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const apiGet = (endpoint: string, params: Record<string, any> = {}, options: ApiFetchOptions = {}) =>
  apiFetch(`${endpoint}${buildQueryString(params)}`, { method: "GET", ...options });

export const apiPost = (endpoint: string, body?: any, options: ApiFetchOptions = {}) => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  return apiFetch(endpoint, {
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
    ...options,
  });
};

export const apiPut = (endpoint: string, body?: any, options: ApiFetchOptions = {}) => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  return apiFetch(endpoint, {
    method: "PUT",
    body: isFormData ? body : JSON.stringify(body),
    ...options,
  });
};

export const apiDelete = (endpoint: string, options: ApiFetchOptions = {}) => apiFetch(endpoint, { method: "DELETE", ...options });

const api = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  getUser,
  setUser,
  getAvatarUrl,
  clearAuth,
  refreshAuthToken,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};

export default api;
