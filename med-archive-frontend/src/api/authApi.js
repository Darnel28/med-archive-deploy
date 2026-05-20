import { apiClient, clearAuthSession, setAuthSession } from "./client";

export async function login(credentials) {
  const response = await apiClient.post("/login", credentials);
  const data = response.data;

  setAuthSession({
    token: data?.token,
    user: data?.user,
  });

  return data;
}

export async function register(payload) {
  const response = await apiClient.post("/register", payload);
  const data = response.data;

  setAuthSession({
    token: data?.token,
    user: data?.user,
  });

  return data;
}

export async function logout() {
  try {
    await apiClient.post("/logout");
  } finally {
    clearAuthSession();
  }
}

export async function getCurrentUser() {
  const response = await apiClient.get("/me");
  return response.data;
}

export async function refreshToken() {
  const response = await apiClient.post("/refresh");
  const token = response.data?.token;

  if (token) {
    setAuthSession({ token });
  }

  return response.data;
}
