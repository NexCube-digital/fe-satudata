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
 * Main API Fetch Wrapper with Interceptor
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
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

  let response = await fetch(url, config);

  // If 401 Unauthorized, attempt token refresh and retry request once
  if (response.status === 401 && accessToken && !options._isRetry) {
    const newAccessToken = await refreshAuthToken();
    if (newAccessToken) {
      headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        ...config,
        headers,
        _isRetry: true,
      });
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
export const apiGet = (endpoint, options = {}) => apiFetch(endpoint, { method: "GET", ...options });
export const apiPost = (endpoint, body, options = {}) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(body), ...options });
export const apiPut = (endpoint, body, options = {}) => apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body), ...options });
export const apiDelete = (endpoint, options = {}) => apiFetch(endpoint, { method: "DELETE", ...options });

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  getUser,
  setUser,
  clearAuth,
  refreshAuthToken,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
