import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAnalyses } from '../../api/analyseApi';
import '../../assets/css/Examen.css';

const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (value, date) => {
  if (!value) return false;
  return startOfDay(new Date(value)).getTime() === startOfDay(date).getTime();
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
  return amount.toLocaleString('fr-FR');
};

const statusLabel = (status) => ({
  prescrit: 'En attente',
  preleve: 'Preleve',
  en_cours: 'En cours',
  termine: 'Termine',
}[status] || status || '-');

const palette = ['#17b8b0', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#3b82f6'];

const DashboardLabo = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setMessage('');
      try {
        const response = await getAnalyses({ per_page: 100 });
        if (active) setAnalyses(unwrapRows(response));
      } catch (error) {
        if (active) {
          setAnalyses([]);
          setMessage(error?.response?.data?.message || 'Impossible de charger les donnees du laboratoire.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dashboard = useMemo(() => {
    const today = startOfDay(currentTime);
    const month = currentTime.getMonth();
    const year = currentTime.getFullYear();
    const analysesToday = analyses.filter((analysis) => sameDay(analysis.date_prelevement || analysis.created_at, today));
    const pendingResults = analyses.filter((analysis) => analysis.statut !== 'termine').length;
    const completed = analyses.filter((analysis) => analysis.statut === 'termine').length;
    const servedPatients = new Set(
      analyses
        .filter((analysis) => analysis.statut === 'termine')
        .map((analysis) => analysis.consultation?.dossier?.patient?.id || analysis.consultation?.dossier?.patient?.user?.id)
        .filter(Boolean)
    ).size;
    const monthlyRevenue = analyses
      .filter((analysis) => {
        const date = new Date(analysis.created_at || analysis.date_prelevement);
        return date.getMonth() === month && date.getFullYear() === year && analysis.statut_paiement === 'payee';
      })
      .reduce((sum, analysis) => sum + Number(analysis.montant_analyse || 0), 0);

    const dailyTests = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const rows = analyses.filter((analysis) => sameDay(analysis.date_prelevement || analysis.created_at, date));
      return {
        name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        tests: rows.length,
        completed: rows.filter((analysis) => analysis.statut === 'termine').length,
      };
    });

    const typeCounts = analyses.reduce((acc, analysis) => {
      const name = analysis.type_analyse || 'Autre';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const testTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({ name, value, color: palette[index % palette.length] }));

    const recentActivities = analyses.slice(0, 5).map((analysis) => ({
      id: analysis.id,
      patient: analysis.consultation?.dossier?.patient?.user?.name || 'Patient',
      test: analysis.type_analyse || 'Analyse',
      statut: statusLabel(analysis.statut),
      time: new Date(analysis.updated_at || analysis.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      urgent: analysis.statut_paiement !== 'payee' || ['prescrit', 'preleve'].includes(analysis.statut),
    }));

    return {
      stats: [
        { label: "Analyses aujourd'hui", value: analysesToday.length, icon: 'fa-flask', change: loading ? '...' : 'En direct', color: '#17b8b0' },
        { label: 'Resultats en attente', value: pendingResults, icon: 'fa-hourglass-half', change: loading ? '...' : `${analyses.length} total`, color: '#f4a261' },
        { label: 'Patients servis', value: servedPatients, icon: 'fa-users', change: loading ? '...' : 'Termines', color: '#2a9d8f' },
        { label: "Chiffre d'affaires (mois)", value: formatMoney(monthlyRevenue), icon: 'fa-euro-sign', change: loading ? '...' : 'Payes', color: '#e76f51' },
      ],
      dailyTests,
      testTypes,
      recentActivities,
      completed,
      completionRate: analyses.length ? Math.round((completed / analyses.length) * 100) : 0,
      paidPending: analyses.filter((analysis) => analysis.statut_paiement === 'payee' && analysis.statut !== 'termine').length,
      unpaid: analyses.filter((analysis) => analysis.statut_paiement !== 'payee').length,
      analysesToday: analysesToday.length,
      pendingResults,
    };
  }, [analyses, currentTime, loading]);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="labo-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Laboratoire</h1>
          <p className="subtitle">Suivi dynamique des activites et analyses</p>
        </div>
        <div className="header-date">
          <i className="fa-regular fa-calendar"></i>
          <span>{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <i className="fa-regular fa-clock"></i>
          <span>{formattedTime}</span>
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}

      <div className="stats-grid">
        {dashboard.stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-change" style={{ color: '#2a9d8f' }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card half">
          <h3><i className="fa-solid fa-chart-line"></i> Analyses quotidiennes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboard.dailyTests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ed" />
              <XAxis dataKey="name" tick={{ fill: '#6c86a3' }} />
              <YAxis tick={{ fill: '#6c86a3' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
              <Legend />
              <Area type="monotone" dataKey="tests" stroke="#17b8b0" fill="#17b8b0" fillOpacity={0.2} name="Prescrits" />
              <Area type="monotone" dataKey="completed" stroke="#2a9d8f" fill="#2a9d8f" fillOpacity={0.3} name="Termines" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card half">
          <h3><i className="fa-solid fa-chart-pie"></i> Repartition par type d'analyse</h3>
          {dashboard.testTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dashboard.testTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {dashboard.testTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={40} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: 280, display: 'grid', placeItems: 'center' }}>
              {loading ? 'Chargement...' : 'Aucune analyse disponible'}
            </div>
          )}
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-activities">
          <h3><i className="fa-regular fa-clock"></i> Activites recentes</h3>
          <div className="activity-list">
            {loading && <div className="activity-item"><div className="activity-details">Chargement des activites...</div></div>}
            {!loading && dashboard.recentActivities.map((act) => (
              <div className={`activity-item ${act.urgent ? 'urgent' : ''}`} key={act.id}>
                <div className="activity-time">{act.time}</div>
                <div className="activity-details">
                  <strong>{act.patient}</strong> - {act.test}
                </div>
                <div className="activity-status">
                  <span className={`status-badge ${String(act.statut).toLowerCase().replace(/ /g, '-')}`}>{act.statut}</span>
                </div>
                {act.urgent && <div className="urgent-icon"><i className="fa-solid fa-circle-exclamation"></i></div>}
              </div>
            ))}
            {!loading && dashboard.recentActivities.length === 0 && (
              <div className="activity-item"><div className="activity-details">Aucune activite recente.</div></div>
            )}
          </div>
        </div>

        <div className="lab-info">
          <div className="info-card">
            <h3><i className="fa-solid fa-flask"></i> Performance labo</h3>
            <div className="performance-item">
              <span>Analyses terminees</span>
              <strong>{dashboard.completed}</strong>
            </div>
            <div className="performance-item">
              <span>Taux de completion</span>
              <strong>{dashboard.completionRate}%</strong>
            </div>
            <div className="performance-item">
              <span>Demandes payees en attente</span>
              <strong>{dashboard.paidPending}</strong>
            </div>
          </div>
          <div className="info-card">
            <h3><i className="fa-regular fa-bell"></i> Alertes & rappels</h3>
            <ul className="alert-list">
              <li><i className="fa-solid fa-vial"></i> {dashboard.pendingResults} resultat(s) a traiter</li>
              <li><i className="fa-solid fa-calendar-week"></i> {dashboard.analysesToday} demande(s) aujourd'hui</li>
              <li><i className="fa-regular fa-envelope"></i> {dashboard.unpaid} analyse(s) en attente de paiement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLabo;
