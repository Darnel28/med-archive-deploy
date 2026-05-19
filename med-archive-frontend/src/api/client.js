const DEFAULT_API_URL = "http://localhost:8000/api";
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getApiUrl() {
  return API_URL;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthUser() {
  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setAuthUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(USER_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function buildUrl(endpoint, query) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item));
        return;
      }

      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

async function parseResponse(response, responseType) {
  if (response.status === 204) {
    return null;
  }

  if (responseType === "blob") {
    return response.blob();
  }

  if (responseType === "text") {
    return response.text();
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest(endpoint, options = {}) {
  const {
    body,
    headers = {},
    query,
    responseType,
    auth = true,
    ...fetchOptions
  } = options;

  const token = getAuthToken();
  const isFormData = body instanceof FormData;
  const requestHeaders = {
    Accept: responseType === "blob" ? "*/*" : "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(buildUrl(endpoint, query), {
    ...fetchOptions,
    body: isFormData || typeof body === "string" ? body : body ? JSON.stringify(body) : undefined,
    headers: requestHeaders,
  });

  const data = await parseResponse(response, responseType);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error || "Erreur API"
        : data || "Erreur API";

    throw new ApiError(message, {
      status: response.status,
      data,
    });
  }

  return data;
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: "PUT", body }),
  patch: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: "PATCH", body }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: "DELETE" }),
};
