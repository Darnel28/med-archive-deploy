import { apiClient } from "./client";

const DEFAULT_API_URL = "http://localhost:8000/api";
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export async function listMedecins(params = {}) {
  const res = await apiClient.get(`/medecins`, { params });
  return res.data;
}

export async function createMedecin(payload) {
  const res = await apiClient.post(`/medecins`, payload);
  return res.data;
}

export async function getMedecin(id) {
  const res = await apiClient.get(`/medecins/${id}`);
  return res.data;
}

export async function getMedecinById(medecinId, token) {
  const response = await fetch(`${API_URL}/medecins/${medecinId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message || "Erreur lors de la récupération du médecin");
  }

  return json.data;
}

export async function updateMedecin(id, payload, token) {
  const response = await fetch(`${API_URL}/medecins/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message || "Erreur lors de la mise à jour du médecin");
  }

  return json.data;
}

export async function getPlanning(id) {
  const res = await apiClient.get(`/medecins/${id}/planning`);
  return res.data;
}

export async function getPatients(id) {
  const res = await apiClient.get(`/medecins/${id}/patients`);
  return res.data;
}

export default {
  listMedecins,
  createMedecin,
  getMedecin,
  getMedecinById,
  updateMedecin,
  getPlanning,
  getPatients,
};
