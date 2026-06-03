import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getConsultations, getDashboardStatistiques, getMesDonneesEtablissement, getMesMedecinsEtablissement, getMesPatientsEtablissement, getTransfertDossiers, listMedecins } from '../../api';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';
import '../../assets/css/DashboardReceptionniste.css';

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

function formatHour(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function isToday(value) {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
}

const DashboardHomeAccueil = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboard, setDashboard] = useState({});
  const [etablissement, setEtablissement] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [transferts, setTransferts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [statsResponse, etablissementResponse, medecinsResponse, patientsResponse, consultationsResponse, transfertsResponse] = await Promise.all([
          safeLoad(getDashboardStatistiques, {}),
          safeLoad(getMesDonneesEtablissement, {}),
          safeLoad(getMesMedecinsEtablissement, []),
          safeLoad(() => getMesPatientsEtablissement({ per_page: 100 }), []),
          safeLoad(() => getConsultations({ per_page: 100 }), []),
          safeLoad(() => getTransfertDossiers({ per_page: 20 }), []),
        ]);

        let nextMedecins = unwrapList(medecinsResponse).rows;
        if (nextMedecins.length === 0) {
          const medecinsFallback = await safeLoad(() => listMedecins({ per_page: 100 }), []);
          nextMedecins = unwrapList(medecinsFallback).rows;
        }

        if (!mounted) return;
        setDashboard(payload(statsResponse));
        setEtablissement(payload(etablissementResponse)?.etablissement ?? null);
        setMedecins(nextMedecins);
        setPatients(unwrapList(patientsResponse).rows);
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
  const prochainRendezVous = useMemo(() => (
    consultations
      .filter((item) => item.date_consultation && new Date(item.date_consultation) >= new Date())
      .sort((a, b) => new Date(a.date_consultation) - new Date(b.date_consultation))[0]
  ), [consultations]);

  const stats = {
    patientsAujourdhui: dashboard?.consultations?.aujourdhui ?? consultationsToday.length,
    rendezVous: dashboard?.consultations?.total ?? consultations.length,
    medecinsPresent: dashboard?.medecins?.actifs ?? medecins.length,
    patientsEnAttente: transferts.filter((item) => ['demande', 'en_attente', 'en cours', 'en_cours'].includes(String(item.statut).toLowerCase())).length,
    tauxOccupation: Math.min(100, Math.round(((dashboard?.consultations?.aujourdhui ?? consultationsToday.length) / Math.max(1, medecins.length * 8)) * 100)),
    tempsAttenteMoyen: loading ? '...' : `${Math.max(5, Math.min(45, transferts.length * 3 || 10))} min`,
  };

  const attendanceData = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, index) => {
      const hour = index + 8;
      return { heure: `${String(hour).padStart(2, '0')}:00`, patients: 0 };
    });
    consultationsToday.forEach((item) => {
      const hour = new Date(item.date_consultation).getHours();
      const bucket = buckets.find((entry) => Number(entry.heure.slice(0, 2)) === hour);
      if (bucket) bucket.patients += 1;
    });
    return buckets;
  }, [consultationsToday]);

  const admissionsByService = useMemo(() => {
    const counts = consultations.reduce((acc, item) => {
      const service = item.service?.nom || item.medecin?.specialite?.nom || item.motif || 'Consultation';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).slice(0, 6).map(([service, admissions]) => ({ service, admissions }));
  }, [consultations]);

  const activitesRecentes = useMemo(() => (
    consultations
      .slice()
      .sort((a, b) => new Date(b.date_consultation || 0) - new Date(a.date_consultation || 0))
      .slice(0, 6)
  ), [consultations]);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="receptionniste-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord - Accueil</h1>
          <p className="subtitle">Bienvenue, receptionniste</p>
        </div>
        <div className="header-datetime">
          <i className="fa-regular fa-calendar"></i>
          <span>{formattedDate}</span>
          <i className="fa-regular fa-clock"></i>
          <span>{formattedTime}</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-user-plus"></i></div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.patientsAujourdhui}</span>
            <span className="stat-label">Patients aujourd'hui</span>
            <span className="stat-trend up">Consultations du jour</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-regular fa-calendar-check"></i></div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.rendezVous}</span>
            <span className="stat-label">Rendez-vous</span>
            <span className="stat-trend up">Total charge</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-user-doctor"></i></div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.medecinsPresent}</span>
            <span className="stat-label">Medecins presents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-hourglass-half"></i></div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.patientsEnAttente}</span>
            <span className="stat-label">En salle d'attente</span>
            <span className="stat-trend neutral">{stats.tempsAttenteMoyen}</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-line"></i> Affluence par heure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ed" />
              <XAxis dataKey="heure" tick={{ fill: '#6c86a3' }} />
              <YAxis tick={{ fill: '#6c86a3' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="patients" stroke="#17b8b0" fill="#17b8b0" fillOpacity={0.2} name="Patients" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* <div className="chart-card">
          <h3><i className="fa-solid fa-chart-simple"></i> Admissions par service</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={admissionsByService} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: '#6c86a3' }} allowDecimals={false} />
              <YAxis type="category" dataKey="service" tick={{ fill: '#6c86a3' }} width={110} />
              <Tooltip />
              <Legend />
              <Bar dataKey="admissions" fill="#17b8b0" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      <div className="dashboard-grid">
        <div className="hospital-info">
          {/* <div className="info-card">
            <h3><i className="fa-solid fa-chart-line"></i> Taux d'occupation</h3>
            <div className="occupancy-bar">
              <div className="occupancy-fill" style={{ width: `${stats.tauxOccupation}%` }}></div>
            </div>
            <p className="occupancy-text">{stats.tauxOccupation}% de charge estimee aujourd'hui</p>
          </div> */}
          <div className="info-card">
            <h3><i className="fa-regular fa-clock"></i> Prochain rendez-vous</h3>
            {prochainRendezVous ? (
              <>
                <p><strong>{formatHour(prochainRendezVous.date_consultation)}</strong> - {valueAt(prochainRendezVous, 'dossier.patient.user.name', 'Patient')}</p>
                <p>Avec {valueAt(prochainRendezVous, 'medecin.user.name', 'Medecin')}</p>
              </>
            ) : (
              <p>Aucun rendez-vous a venir.</p>
            )}
            <button className="btn-confirm">Confirmer arrivee</button>
          </div>
          <div className="info-card">
            <h3><i className="fa-solid fa-building"></i> A propos de l'hopital</h3>
            <p>{etablissement?.nom || 'Etablissement'} - {etablissement?.type || 'centre medical'}</p>
            <p>{patients.length} patient(s), {medecins.length} medecin(s).</p>
          </div>
        </div>

        <div className="recent-activities">
          <div className="activity-card">
            <h3><i className="fa-regular fa-bell"></i> Activites recentes</h3>
            <div className="activity-list">
              {!loading && activitesRecentes.length === 0 && <p className="table-meta">Aucune activite recente.</p>}
              {activitesRecentes.map((act) => (
                <div className="activity-item" key={act.id}>
                  <div className="activity-time">{formatHour(act.date_consultation)}</div>
                  <div className="activity-details">
                    <strong>{valueAt(act, 'dossier.patient.user.name', 'Patient')}</strong> - {act.motif || 'Consultation'}
                  </div>
                  <div className="activity-status">
                    {act.statut || 'Planifie'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeAccueil;
