import React, { useEffect, useMemo, useState } from 'react';
import { getDashboardStatistiques } from '../../api/statistiqueApi';
import { apiErrorMessage } from '../DashAdmin/AdminCrudPage.jsx';

function getPayload(response) {
  return response?.data ?? response ?? {};
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const DashboardHomeMedecin = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const response = await getDashboardStatistiques();
        if (mounted) setDashboard(getPayload(response));
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

  const prochainesConsultations = useMemo(() => {
    const list = dashboard?.consultations?.prochaines;
    return Array.isArray(list) ? list.slice(0, 5) : [];
  }, [dashboard]);

  const stats = [
    {
      label: 'Patients suivis',
      value: dashboard?.patients?.total ?? 0,
      icon: 'fa-user-group',
      meta: `${dashboard?.patients?.vus_mois ?? 0} patient(s) vu(s) ce mois`,
    },
    {
      label: "Rendez-vous aujourd'hui",
      value: dashboard?.consultations?.aujourdhui ?? 0,
      icon: 'fa-calendar-check',
      meta: `${dashboard?.consultations?.mois ?? 0} consultation(s) ce mois`,
    },
    {
      label: 'Analyses prescrites',
      value: dashboard?.analyses?.prescrites ?? 0,
      icon: 'fa-flask',
      meta: 'Total des demandes laboratoire',
    },
    {
      label: 'Examens en attente',
      value: dashboard?.analyses?.en_attente ?? 0,
      icon: 'fa-bell',
      meta: 'Prescrits, preleves ou en cours',
    },
  ];

  return (
    <div className="doctor-main">
      <section className="doctor-card">
        <div className="dashboard-header">
          <div className="dashboard-copy">
            <p className="dashboard-kicker">Vue d'ensemble</p>
            <p>Suivi synthetique de l'activite medicale du jour.</p>
          </div>
          <div className="dashboard-date">
            <i className="fa-regular fa-calendar"></i> {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="quick-stats">
          {stats.map((stat) => (
            <article className="quick-stat" key={stat.label}>
              <div className="quick-stat-top">
                <p className="quick-stat-label">{stat.label}</p>
                <span className="quick-stat-icon"><i className={`fa-solid ${stat.icon}`}></i></span>
              </div>
              <strong>{loading ? '...' : stat.value}</strong>
              <p className="quick-stat-meta">{stat.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="widgets-grid">
        <div className="widget">
          <h3><i className="fa-regular fa-calendar"></i> Prochains rendez-vous</h3>
          {loading && <p className="table-meta">Chargement...</p>}
          {!loading && prochainesConsultations.length === 0 && <p className="table-meta">Aucun rendez-vous a venir.</p>}
          {prochainesConsultations.map((consultation) => (
            <div className="appointment" key={consultation.id}>
              <div>
                <strong>{consultation?.dossier?.patient?.user?.name || 'Patient'}</strong><br />
                {consultation.motif || consultation.type_consultation || 'Consultation'} - {formatDate(consultation.date_consultation)}
              </div>
              <div className="appointment-time">{formatTime(consultation.date_consultation)}</div>
            </div>
          ))}
        </div>

        <div className="widget">
          <h3><i className="fa-solid fa-bell"></i> Alertes medicales</h3>
          <div className="alert-box">
            Analyses en attente : <strong>{dashboard?.analyses?.en_attente ?? 0}</strong>
          </div>
          <div className="alert-box">
            Consultations aujourd'hui : <strong>{dashboard?.consultations?.aujourdhui ?? 0}</strong>
          </div>
        </div>

        <div className="widget">
          <h3><i className="fa-solid fa-user"></i> Activite patients</h3>
          <div className="patient-mini">
            <span>Patients suivis</span>
            <strong>{dashboard?.patients?.total ?? 0}</strong>
          </div>
          <div className="patient-mini">
            <span>Vus ce mois</span>
            <strong>{dashboard?.patients?.vus_mois ?? 0}</strong>
          </div>
          <div className="patient-mini">
            <span>Consultations totales</span>
            <strong>{dashboard?.consultations?.total ?? 0}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHomeMedecin;
