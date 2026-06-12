import { getCurrentUser } from '../../api/authApi';
import { getMesAnalyses, getMesConsultations, getMesFactures } from '../../api/patientApi';
import { apiClient } from '../../api/client';

export const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export const unwrapUser = (payload) => payload?.data?.user || payload?.data?.data?.user || payload?.user || null;

export const formatDate = (value, options = { dateStyle: 'medium' }) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', options);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
};

export const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

export const ageFromDate = (value) => {
  if (!value) return '-';
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return `${age} ans`;
};

export async function loadPatientDashboardData() {
  const [me, consultations, ordonnances, analyses, factures] = await Promise.all([
    getCurrentUser(),
    getMesConsultations({ per_page: 100 }),
    apiClient.get('/patients/me/ordonnances', { params: { per_page: 100 } }).then((response) => response.data),
    getMesAnalyses({ per_page: 100 }),
    getMesFactures({ per_page: 100 }),
  ]);

  return {
    user: unwrapUser(me),
    consultations: unwrapRows(consultations),
    ordonnances: unwrapRows(ordonnances),
    analyses: unwrapRows(analyses),
    factures: unwrapRows(factures),
  };
}

export function patientFromUser(user) {
  return user?.patient || user?.data?.patient || null;
}

export function latestByDate(rows, field) {
  return [...rows].sort((a, b) => new Date(b?.[field] || 0) - new Date(a?.[field] || 0))[0] || null;
}
