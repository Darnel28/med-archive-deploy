import { api, clearAuthSession, setAuthToken, setAuthUser } from "./client";

export async function login(credentials) {
  const result = await api.post("/login", credentials, { auth: false });

  if (result?.token) {
    setAuthToken(result.token);
  }

  if (result?.user) {
    setAuthUser(result.user);
  }

  return result;
}

export async function register(payload) {
  const result = await api.post("/register", payload, { auth: false });

  if (result?.token) {
    setAuthToken(result.token);
  }

  if (result?.user) {
    setAuthUser(result.user);
  }

  return result;
}

export async function logout() {
  try {
    return await api.post("/logout");
  } finally {
    clearAuthSession();
  }
}

export function getCurrentUser() {
  return api.get("/me");
}

export async function refreshToken() {
  const result = await api.post("/refresh");

  if (result?.token) {
    setAuthToken(result.token);
  }

  return result;
}
