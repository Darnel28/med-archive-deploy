import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardStatistiques } from '../../api/statistiqueApi';
import { getUsers } from '../../api/userApi';
import { getServices } from '../../api/serviceApi';
import { getLaboratoires } from '../../api/laboratoireApi';
import { getTransfertDossiers } from '../../api/transfertDossierApi';
import { apiErrorMessage, unwrapList, valueAt } from './AdminCrudPage.jsx';
import '../../assets/css/DashboardAdmin.css';

const COLORS = ['#17b8b0', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#4f8ad9'];

const DashboardAdmin = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboard, setDashboard] = useState(null);
  const [counts, setCounts] = useState({ hopitaux: 0, services: 0, laboratoires: 0, transferts: 0 });
  const [transferts, setTransferts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      try {
        const [statsResponse, hopitauxResponse, servicesResponse, laboratoiresResponse, transfertsResponse] = await Promise.all([
          getDashboardStatistiques(),
          getUsers({ role: 'Responsable Etablissement', per_page: 100 }),
          getServices({ per_page: 100 }),
          getLaboratoires({ per_page: 100 }),
          getTransfertDossiers({ per_page: 10 }),
        ]);

        if (!mounted) return;
        const hopitaux = unwrapList(hopitauxResponse);
        const services = unwrapList(servicesResponse);
        const laboratoires = unwrapList(laboratoiresResponse);
        const transfertsList = unwrapList(transfertsResponse);

        setDashboard(statsResponse?.data ?? statsResponse);
        setCounts({
          hopitaux: hopitaux.total || hopitaux.rows.length,
          services: services.total || services.rows.length,
          laboratoires: laboratoires.total || laboratoires.rows.length,
          transferts: transfertsList.total || transfertsList.rows.length,
        });
        setTransferts(transfertsList.rows.slice(0, 5));
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: 'Hôpitaux', value: counts.hopitaux, icon: 'fa-hospital', change: '', color: '#17b8b0' },
    { label: 'Services', value: counts.services, icon: 'fa-stethoscope', change: '', color: '#2a9d8f' },
    { label: 'Utilisateurs', value: dashboard?.utilisateurs?.total ?? 0, icon: 'fa-users', change: `+${dashboard?.utilisateurs?.nouveaux_mois ?? 0} ce mois`, color: '#e9c46a' },
    { label: 'Transferts', value: counts.transferts, icon: 'fa-arrow-right-arrow-left', change: 'Total', color: '#e76f51' },
  ];

  const userRoles = useMemo(() => {
    const repartition = dashboard?.utilisateurs?.repartition_par_role || [];
    return repartition.map((item, index) => ({
      name: item.role,
      value: item.total,
      color: COLORS[index % COLORS.length],
    }));
  }, [dashboard]);

  const monthlyData = [
    { name: 'Utilisateurs', total: dashboard?.utilisateurs?.nouveaux_mois ?? 0 },
    { name: 'Consultations', total: dashboard?.consultations?.mois ?? 0 },
    { name: 'Analyses terminées', total: dashboard?.analyses?.terminees_mois ?? 0 },
    { name: 'Documents', total: dashboard?.documents?.total ?? 0 },
  ];

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="dashadmin-container">
      <div className="dashadmin-header">
        <div>
          <h1>Tableau de bord administrateur</h1>
          <p className="dashadmin-subtitle">Gestion globale du système</p>
        </div>
        <div className="dashadmin-datetime">
          <i className="fa-regular fa-calendar"></i>
          <span>{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <i className="fa-regular fa-clock"></i>
          <span>{formattedTime}</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashadmin-stats-grid">
        {stats.map((stat) => (
          <div className="dashadmin-stat-card" key={stat.label}>
            <div className="dashadmin-stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="dashadmin-stat-content">
              <span className="dashadmin-stat-value">{stat.value}</span>
              <span className="dashadmin-stat-label">{stat.label}</span>
              <span className="dashadmin-stat-change">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashadmin-charts-row">
        <div className="dashadmin-chart-card half">
          <h3><i className="fa-solid fa-chart-line"></i> Activité du mois</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ed" />
              <XAxis dataKey="name" tick={{ fill: '#6c86a3' }} />
              <YAxis tick={{ fill: '#6c86a3' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Area type="monotone" dataKey="total" stroke="#17b8b0" fill="#17b8b0" fillOpacity={0.25} name="Total" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dashadmin-chart-card half">
          <h3><i className="fa-solid fa-chart-pie"></i> Répartition des utilisateurs</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={userRoles} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" labelLine={false}>
                {userRoles.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={40} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashadmin-bottom-section">
        <div className="dashadmin-activities">
          <h3><i className="fa-regular fa-clock"></i> Transferts récents</h3>
          <div className="dashadmin-activity-list">
            {transferts.length === 0 && <p className="table-meta p-4">Aucun transfert récent.</p>}
            {transferts.map((item) => (
              <div className={`dashadmin-activity-item ${item.statut === 'demande' ? 'urgent' : ''}`} key={item.id}>
                <div className="dashadmin-activity-time">#{item.id}</div>
                <div className="dashadmin-activity-details">
                  <strong>{valueAt(item, 'dossier.patient.user.name', 'Patient')}</strong> - {valueAt(item, 'serviceSource.nom', '-')} vers {valueAt(item, 'serviceDestination.nom', '-')}
                </div>
                <div className="dashadmin-activity-status">
                  <span className={`dashadmin-status-badge ${item.statut}`}>{item.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashadmin-sidecards">
          <div className="dashadmin-info-card">
            <h3><i className="fa-solid fa-gauge-high"></i> Indicateurs clés</h3>
            <div className="dashadmin-metric-item"><span>Patients</span><strong>{dashboard?.patients?.total ?? 0}</strong></div>
            <div className="dashadmin-metric-item"><span>Consultations aujourd'hui</span><strong>{dashboard?.consultations?.aujourdhui ?? 0}</strong></div>
            <div className="dashadmin-metric-item"><span>Labos actifs / total</span><strong>{counts.laboratoires}</strong></div>
          </div>
          {/* <div className="dashadmin-info-card">
            <h3><i className="fa-regular fa-bell"></i> Alertes système</h3>
            <ul className="dashadmin-alert-list">
              <li><i className="fa-solid fa-vial"></i> Analyses en attente: {dashboard?.analyses?.en_attente ?? 0}</li>
              <li><i className="fa-solid fa-file-medical"></i> Documents: {dashboard?.documents?.total ?? 0}</li>
              <li><i className="fa-solid fa-database"></i> Taille documents: {dashboard?.documents?.taille_totale ?? '0 Mo'}</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
