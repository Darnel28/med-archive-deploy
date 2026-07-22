import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  getDashboardStatistiques,
  getEtablissementDashboard,
  getEtablissementStatistiques,
  getMesConsultationsEtablissement,
  getTransfertDossiers,
} from '../../api';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';
import '../../assets/css/Hopital.css';

async function safeLoad(loader, fallback) {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

function payload(response) {
  return response?.data ?? response ?? {};
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatHour(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function isToday(value) {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
}

const DashHomeHopital = () => {
  const [dashboard, setDashboard] = useState({});
  const [statsDetaillees, setStatsDetaillees] = useState({});
  const [consultations, setConsultations] = useState([]);
  const [transferts, setTransferts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [statsResponse, etablissementDashboardResponse, statsDetailleesResponse, consultationsResponse, transfertsResponse] = await Promise.all([
          safeLoad(getDashboardStatistiques, {}),
          safeLoad(getEtablissementDashboard, {}),
          safeLoad(getEtablissementStatistiques, {}),
          safeLoad(() => getMesConsultationsEtablissement({ per_page: 100 }), []),
          safeLoad(() => getTransfertDossiers({ per_page: 20 }), []),
        ]);

        if (!mounted) return;
        setDashboard({ ...payload(statsResponse), ...payload(etablissementDashboardResponse) });
        setStatsDetaillees(payload(statsDetailleesResponse));
        setConsultations(unwrapList(consultationsResponse).rows);
        setTransferts(unwrapList(transfertsResponse).rows);
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const consultationsToday = useMemo(() => consultations.filter((item) => isToday(item.date_consultation)), [consultations]);

  const patientsActifsData = useMemo(() => {
    const parJour = statsDetaillees?.consultations?.par_jour;
    if (Array.isArray(parJour) && parJour.length > 0) {
      return parJour.map((item) => ({
        mois: formatDate(item.date),
        actifs: item.total,
      }));
    }

    const buckets = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour) => ({ mois: jour, actifs: 0 }));
    consultations.forEach((item) => {
      if (!item.date_consultation) return;
      const index = (new Date(item.date_consultation).getDay() + 6) % 7;
      buckets[index].actifs += 1;
    });
    return buckets;
  }, [consultations, statsDetaillees]);

  const activiteServices = useMemo(() => {
    const parMotif = statsDetaillees?.consultations?.par_motif || dashboard?.consultations?.par_motif;
    if (Array.isArray(parMotif) && parMotif.length > 0) {
      return parMotif.map((item) => ({ service: item.motif || 'Consultation', examens: item.total }));
    }

    const counts = consultations.reduce((acc, item) => {
      const service = item.service?.nom || item.medecin?.specialite?.nom || item.motif || 'Consultation';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).slice(0, 6).map(([service, examens]) => ({ service, examens }));
  }, [consultations, dashboard, statsDetaillees]);

  const examensJour = useMemo(() => (
    consultationsToday.slice(0, 8).map((item) => ({
      id: item.id,
      patient: valueAt(item, 'dossier.patient.user.name', 'Patient'),
      examen: item.motif || item.type_consultation || 'Consultation',
      priorite: item.priorite || 'Normale',
      statut: item.statut || 'Planifie',
      heure: formatHour(item.date_consultation),
    }))
  ), [consultationsToday]);

  const transfertsRecents = useMemo(() => transferts.slice(0, 5), [transferts]);

  const kpis = [
    {
      label: 'Patients actifs',
      value: dashboard?.patients_actifs ?? dashboard?.patients?.total ?? 0,
      icon: 'fa-users',
      trend: ` nouveau(x) ce mois`,
    },
    {
      label: 'Nouveaux patients',
      value: dashboard?.patients?.nouveaux_mois ?? statsDetaillees?.patients?.nouveaux ?? 0,
      icon: 'fa-user-plus',
      trend: 'Ce mois',
    },
    {
      label: 'Transferts recents',
      value: transferts.length,
      icon: 'fa-arrow-right-arrow-left',
      trend: 'Total charge',
    },
    {
      label: 'Examens du jour',
      value: dashboard?.consultations_aujourdhui ?? dashboard?.consultations?.aujourdhui ?? consultationsToday.length,
      icon: 'fa-microscope',
      trend: `${dashboard?.analyses_en_cours ?? dashboard?.analyses?.en_attente ?? 0} en cours`,
    },
  ];

  return (
    <div className="dashboard-accueil">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="subtitle">Vue d'ensemble de l'hopital</p>
        </div>
        <div className="header-date">
          <i className="fa-regular fa-calendar-alt"></i>
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div className="kpi-card" key={kpi.label}>
            <div className="kpi-icon" style={{ backgroundColor: '#e0f7f5' }}>
              <i className={`fa-solid ${kpi.icon}`} style={{ color: '#17b8b0' }}></i>
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{loading ? '...' : kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-trend up">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-line"></i> Evolution patients actifs</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={patientsActifsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fa" />
              <XAxis dataKey="mois" stroke="#5f7f9e" />
              <YAxis stroke="#5f7f9e" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="actifs" stroke="#17b8b0" strokeWidth={2} dot={{ fill: '#17b8b0' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-simple"></i> Activite par service</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={activiteServices} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fa" />
              <XAxis type="number" stroke="#5f7f9e" allowDecimals={false} />
              <YAxis type="category" dataKey="service" stroke="#5f7f9e" width={120} />
              <Tooltip />
              <Bar dataKey="examens" fill="#17b8b0" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-section">
        <div className="exam-card">
          <h3><i className="fa-regular fa-clock"></i> Examens du jour</h3>
          <div className="table-wrapper">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Examen</th>
                  <th>Priorite</th>
                  <th>Heure</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="5">Chargement...</td></tr>
                )}
                {!loading && examensJour.length === 0 && (
                  <tr><td colSpan="5">Aucun examen aujourd'hui.</td></tr>
                )}
                {examensJour.map((ex) => (
                  <tr key={ex.id}>
                    <td>{ex.patient}</td>
                    <td>{ex.examen}</td>
                    <td><span className={`priority-badge ${String(ex.priorite).toLowerCase()}`}>{ex.priorite}</span></td>
                    <td>{ex.heure}</td>
                    <td><span className={`status-badge ${String(ex.statut).replace(' ', '-').toLowerCase()}`}>{ex.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-col">
          <div className="transfer-card">
            <h3><i className="fa-solid fa-truck-medical"></i> Transferts recents</h3>
            <ul className="transfer-list">
              {!loading && transfertsRecents.length === 0 && <li>Aucun transfert recent.</li>}
              {transfertsRecents.map((t) => (
                <li key={t.id}>
                  <div className="transfer-info">
                    <strong>{valueAt(t, 'dossier.patient.user.name', 'Patient')}</strong>
                    <span>{valueAt(t, 'serviceSource.nom', '-')} vers {valueAt(t, 'serviceDestination.nom', '-')}</span>
                    <small>{formatDate(t.created_at || t.date_transfert || t.date)}</small>
                  </div>
                  <span className={`transfer-status ${String(t.statut).toLowerCase().includes('termin') ? 'done' : 'pending'}`}>{t.statut || 'En attente'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHomeHopital;
