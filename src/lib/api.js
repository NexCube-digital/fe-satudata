// src/lib/api.js
// API Client wrapper for SatuData Frontend Next.js connecting to Backend Express API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/**
 * Token & User Local Storage Helpers
 */
export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken, refreshToken) => {
  if (typeof window === "undefined") return;
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return null;
  }
};

export const setUser = (user) => {
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
export const getAvatarUrl = (user) => {
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

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

/**
 * Refresh Access Token Function
 */
export const refreshAuthToken = async () => {
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

    const result = await response.json();

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
const buildQueryString = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

/**
 * Main API Fetch Wrapper with Interceptor
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    // Jangan set Content-Type manual untuk FormData -- browser yang akan
    // menentukan boundary multipart/form-data secara otomatis.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const accessToken = getAccessToken();
  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    const error = new Error(`Gagal terhubung ke API backend (${netErr.message || "Network error"}).`);
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
        response = await fetch(url, {
          ...config,
          headers,
          _isRetry: true,
        });
      } catch (retryErr) {
        const error = new Error(`Gagal terhubung ke API backend setelah refresh token (${retryErr.message}).`);
        error.status = 0;
        error.data = null;
        throw error;
      }
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Convenience shorthand functions
// `params` pada apiGet adalah object query params biasa, misal { page: 1, limit: 20 }
export const apiGet = (endpoint, params = {}, options = {}) =>
  apiFetch(`${endpoint}${buildQueryString(params)}`, { method: "GET", ...options });

// `body` boleh berupa FormData (untuk upload file) atau plain object (otomatis JSON.stringify)
export const apiPost = (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  return apiFetch(endpoint, {
    method: "POST",
    body: isFormData ? body : JSON.stringify(body),
    ...options,
  });
};

export const apiPut = (endpoint, body, options = {}) => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  return apiFetch(endpoint, {
    method: "PUT",
    body: isFormData ? body : JSON.stringify(body),
    ...options,
  });
};

export const apiDelete = (endpoint, options = {}) => apiFetch(endpoint, { method: "DELETE", ...options });

export default {
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