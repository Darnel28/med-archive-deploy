import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import '../../assets/css/Hopital.css'; 

const DashHomeHopital = () => {
  // Données statiques pour les graphiques et tableaux
  const patientsActifsData = [
    { mois: 'Jan', actifs: 320 },
    { mois: 'Fév', actifs: 345 },
    { mois: 'Mar', actifs: 378 },
    { mois: 'Avr', actifs: 410 },
    { mois: 'Mai', actifs: 456 },
    { mois: 'Juin', actifs: 490 },
  ];

  const activiteServices = [
    { service: 'Hématologie', examens: 124 },
    { service: 'Biochimie', examens: 98 },
    { service: 'Microbiologie', examens: 76 },
    { service: 'Immunologie', examens: 52 },
    { service: 'Anatomopatho', examens: 38 },
  ];

  const examensJour = [
    { patient: 'Mme A. Kouassi', examen: 'NFS', priorite: 'Haute', statut: 'En attente', heure: '09:30' },
    { patient: 'M. B. N\'dri', examen: 'Bilan rénal', priorite: 'Moyenne', statut: 'Réalisé', heure: '11:00' },
    { patient: 'Mme C. Zongo', examen: 'Hémoculture', priorite: 'Basse', statut: 'Programmé', heure: '08:15' },
    { patient: 'M. D. Koffi', examen: 'Glycémie', priorite: 'Haute', statut: 'En cours', heure: '14:00' },
    { patient: 'Mme E. Traoré', examen: 'Bilan lipidique', priorite: 'Moyenne', statut: 'En attente', heure: '15:30' },
  ];

  const transfertsRecents = [
    { patient: 'M. F. Diop', de: 'Urgences', vers: 'Laboratoire', date: '2026-05-09', statut: 'En traitement' },
    { patient: 'Mme G. Koné', de: 'Cardiologie', vers: 'Biochimie', date: '2026-05-09', statut: 'Terminé' },
    { patient: 'M. H. Ouattara', de: 'Pédiatrie', vers: 'Hématologie', date: '2026-05-08', statut: 'Terminé' },
  ];

  const pieData = [
    { name: 'En attente', value: 24, color: '#f4a261' },
    { name: 'Réalisés', value: 42, color: '#17b8b0' },
    { name: 'Programmés', value: 18, color: '#2a9d8f' },
  ];

  return (
    <div className="dashboard-accueil">
      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord</h1>
          <p className="subtitle">Vue d'ensemble du laboratoire</p>
        </div>
        <div className="header-date">
          <i className="fa-regular fa-calendar-alt"></i>
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f7f5' }}>
            <i className="fa-solid fa-users" style={{ color: '#17b8b0' }}></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">490</span>
            <span className="kpi-label">Patients actifs</span>
            <span className="kpi-trend up">+12%</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f7f5' }}>
            <i className="fa-solid fa-user-plus" style={{ color: '#17b8b0' }}></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">86</span>
            <span className="kpi-label">Nouveaux patients</span>
            <span className="kpi-trend up">+8%</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f7f5' }}>
            <i className="fa-solid fa-arrow-right-arrow-left" style={{ color: '#17b8b0' }}></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">12</span>
            <span className="kpi-label">Transferts récents</span>
            <span className="kpi-trend neutral">→ 0%</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e0f7f5' }}>
            <i className="fa-solid fa-microscope" style={{ color: '#17b8b0' }}></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">47</span>
            <span className="kpi-label">Examens du jour</span>
            <span className="kpi-trend up">+5%</span>
          </div>
        </div>
      </div>

      {/* Graphiques ligne + barres */}
      <div className="charts-row">
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-line"></i> Évolution patients actifs</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={patientsActifsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fa" />
              <XAxis dataKey="mois" stroke="#5f7f9e" />
              <YAxis stroke="#5f7f9e" />
              <Tooltip />
              <Line type="monotone" dataKey="actifs" stroke="#17b8b0" strokeWidth={2} dot={{ fill: '#17b8b0' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-simple"></i> Activité par service</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={activiteServices} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fa" />
              <XAxis type="number" stroke="#5f7f9e" />
              <YAxis type="category" dataKey="service" stroke="#5f7f9e" width={100} />
              <Tooltip />
              <Bar dataKey="examens" fill="#17b8b0" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section basse : tableau examens + pie + transferts */}
      <div className="bottom-section">
        {/* Tableau examens du jour */}
        <div className="exam-card">
          <h3><i className="fa-regular fa-clock"></i> Examens du jour</h3>
          <div className="table-wrapper">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Examen</th>
                  <th>Priorité</th>
                  <th>Heure</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {examensJour.map((ex, idx) => (
                  <tr key={idx}>
                    <td>{ex.patient}</td>
                    <td>{ex.examen}</td>
                    <td><span className={`priority-badge ${ex.priorite === 'Haute' ? 'high' : ex.priorite === 'Moyenne' ? 'medium' : 'low'}`}>{ex.priorite}</span></td>
                    <td>{ex.heure}</td>
                    <td><span className={`status-badge ${ex.statut.replace(' ', '-').toLowerCase()}`}>{ex.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bloc droit : camembert + transferts récents */}
        <div className="right-col">
          <div className="chart-card pie-card">
            <h3><i className="fa-solid fa-chart-pie"></i> Répartition statuts examens</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="transfer-card">
            <h3><i className="fa-solid fa-truck-medical"></i> Transferts récents</h3>
            <ul className="transfer-list">
              {transfertsRecents.map((t, idx) => (
                <li key={idx}>
                  <div className="transfer-info">
                    <strong>{t.patient}</strong>
                    <span>{t.de} → {t.vers}</span>
                    <small>{t.date}</small>
                  </div>
                  <span className={`transfer-status ${t.statut === 'Terminé' ? 'done' : 'pending'}`}>{t.statut}</span>
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