import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../../assets/css/Examen.css'; 

const DashboardLabo = () => {
  // Données stats
  const stats = [
    { label: "Analyses aujourd'hui", value: 87, icon: "fa-flask", change: "+12%", color: "#17b8b0" },
    { label: "Résultats en attente", value: 24, icon: "fa-hourglass-half", change: "-5%", color: "#f4a261" },
    { label: "Patients servis", value: 142, icon: "fa-users", change: "+8%", color: "#2a9d8f" },
    { label: "Chiffre d'affaires (mois)", value: "24.5k", icon: "fa-euro-sign", change: "+3.2%", color: "#e76f51" }
  ];

  // Données pour le graphique des analyses par jour
  const dailyTests = [
    { name: "Lun", tests: 65, completed: 58 },
    { name: "Mar", tests: 72, completed: 64 },
    { name: "Mer", tests: 80, completed: 70 },
    { name: "Jeu", tests: 68, completed: 65 },
    { name: "Ven", tests: 85, completed: 78 },
    { name: "Sam", tests: 45, completed: 42 },
    { name: "Dim", tests: 30, completed: 28 }
  ];

  // Données pour le graphique des types d'analyses
  const testTypes = [
    { name: "Hématologie", value: 42, color: "#17b8b0" },
    { name: "Biochimie", value: 28, color: "#2a9d8f" },
    { name: "Microbiologie", value: 18, color: "#e9c46a" },
    { name: "Immunologie", value: 12, color: "#f4a261" }
  ];

  // Données pour les activités récentes
  const recentActivities = [
    { id: 1, patient: "Sophie Martin", test: "NFS", statut: "Terminé", time: "10:30", urgent: false },
    { id: 2, patient: "Jean Dupont", test: "Glycémie", statut: "En cours", time: "09:45", urgent: true },
    { id: 3, patient: "Marie Curie", test: "CRP", statut: "Validé", time: "08:20", urgent: false },
    { id: 4, patient: "Paul Lefevre", test: "Bactériologie", statut: "En attente", time: "11:00", urgent: true },
    { id: 5, patient: "Claire Rousseau", test: "Ferritine", statut: "Terminé", time: "07:55", urgent: false }
  ];

  // Heure actuelle
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="labo-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Laboratoire Central</h1>
          <p className="subtitle">Suivi des activités et analyses</p>
        </div>
        <div className="header-date">
          <i className="fa-regular fa-calendar"></i>
          <span>{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <i className="fa-regular fa-clock"></i>
          <span>{formattedTime}</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span className="stat-change" style={{ color: stat.change.startsWith('+') ? '#2ecc71' : '#e74c3c' }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card half">
          <h3><i className="fa-solid fa-chart-line"></i> Analyses quotidiennes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyTests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ed" />
              <XAxis dataKey="name" tick={{ fill: '#6c86a3' }} />
              <YAxis tick={{ fill: '#6c86a3' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
              <Legend />
              <Area type="monotone" dataKey="tests" stackId="1" stroke="#17b8b0" fill="#17b8b0" fillOpacity={0.2} name="Prescrits" />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#2a9d8f" fill="#2a9d8f" fillOpacity={0.3} name="Réalisés" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card half">
          <h3><i className="fa-solid fa-chart-pie"></i> Répartition par type d'analyse</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={testTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {testTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={40} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent-activities">
          <h3><i className="fa-regular fa-clock"></i> Activités récentes</h3>
          <div className="activity-list">
            {recentActivities.map(act => (
              <div className={`activity-item ${act.urgent ? 'urgent' : ''}`} key={act.id}>
                <div className="activity-time">{act.time}</div>
                <div className="activity-details">
                  <strong>{act.patient}</strong> – {act.test}
                </div>
                <div className="activity-status">
                  <span className={`status-badge ${act.statut.toLowerCase().replace(/ /g, '-')}`}>
                    {act.statut}
                  </span>
                </div>
                {act.urgent && <div className="urgent-icon"><i className="fa-solid fa-circle-exclamation"></i></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="lab-info">
          <div className="info-card">
            <h3><i className="fa-solid fa-flask"></i> Performance labo</h3>
            <div className="performance-item">
              <span>Délai moyen de rendu</span>
              <strong>2.4 h</strong>
            </div>
            <div className="performance-item">
              <span>Taux de satisfaction</span>
              <strong>98%</strong>
            </div>
            <div className="performance-item">
              <span>Équipements actifs</span>
              <strong>12/14</strong>
            </div>
          </div>
          <div className="info-card">
            <h3><i className="fa-regular fa-bell"></i> Alertes & rappels</h3>
            <ul className="alert-list">
              <li><i className="fa-solid fa-vial"></i> Réactifs en stock bas (Immunologie)</li>
              <li><i className="fa-solid fa-calendar-week"></i> Maintenance programmée samedi</li>
              <li><i className="fa-regular fa-envelope"></i> 3 comptes rendus en attente de signature</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLabo;