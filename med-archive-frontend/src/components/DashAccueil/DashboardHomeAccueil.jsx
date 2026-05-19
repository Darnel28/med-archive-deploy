import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import '../../assets/css/DashboardReceptionniste.css'; 

const DashboardHomeAccueil = () => {
  // Données statiques enrichies
  const stats = {
    patientsAujourdhui: 42,
    rendezVous: 18,
    litsDisponibles: 23,
    medecinsPresent: 12,
    tauxOccupation: 78,
    prochainRendezVous: { heure: "14:30", patient: "Mme Dupont", medecin: "Dr. Martin" },
    patientsEnAttente: 7,
    tempsAttenteMoyen: "12 min"
  };

  // Données pour le graphique d'affluence par heure
  const attendanceData = [
    { heure: "08:00", patients: 4, attente: 5 },
    { heure: "09:00", patients: 12, attente: 12 },
    { heure: "10:00", patients: 18, attente: 18 },
    { heure: "11:00", patients: 15, attente: 15 },
    { heure: "12:00", patients: 10, attente: 10 },
    { heure: "13:00", patients: 8, attente: 8 },
    { heure: "14:00", patients: 14, attente: 14 },
    { heure: "15:00", patients: 16, attente: 16 },
    { heure: "16:00", patients: 11, attente: 11 },
  ];

  // Répartition des admissions par service
  const admissionsByService = [
    { service: "Consultation", admissions: 45, color: "#17b8b0" },
    { service: "Urgences", admissions: 28, color: "#e76f51" },
    { service: "Radiologie", admissions: 22, color: "#f4a261" },
    { service: "Laboratoire", admissions: 34, color: "#2a9d8f" },
    { service: "Cardiologie", admissions: 18, color: "#e9c46a" }
  ];

  const activitesRecentes = [
    { id: 1, patient: "Jean Dupont", service: "Consultation", heure: "09:00", statut: "Arrivé", urgent: false },
    { id: 2, patient: "Marie Curie", service: "Radiologie", heure: "10:15", statut: "En attente", urgent: false },
    { id: 3, patient: "Pierre Dubois", service: "Laboratoire", heure: "11:00", statut: "Terminé", urgent: false },
    { id: 4, patient: "Sophie Martin", service: "Cardiologie", heure: "13:30", statut: "Programmé", urgent: true, note: "Douleurs thoraciques" }
  ];

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="receptionniste-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Tableau de bord – Accueil</h1>
          <p className="subtitle">Bienvenue, Réceptionniste</p>
        </div>
        <div className="header-datetime">
          <i className="fa-regular fa-calendar"></i>
          <span>{formattedDate}</span>
          <i className="fa-regular fa-clock"></i>
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-user-plus"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.patientsAujourdhui}</span>
            <span className="stat-label">Patients aujourd'hui</span>
            <span className="stat-trend up">+8% vs hier</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-regular fa-calendar-check"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.rendezVous}</span>
            <span className="stat-label">Rendez-vous</span>
            <span className="stat-trend up">+3</span>
          </div>
        </div>
        {/* <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-bed-pulse"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.litsDisponibles}</span>
            <span className="stat-label">Lits disponibles</span>
            <span className="stat-trend down">-2</span>
          </div>
        </div> */}
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-user-doctor"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.medecinsPresent}</span>
            <span className="stat-label">Médecins présents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fa-solid fa-hourglass-half"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.patientsEnAttente}</span>
            <span className="stat-label">En salle d'attente</span>
            <span className="stat-trend neutral">{stats.tempsAttenteMoyen}</span>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-row">
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-line"></i> Affluence par heure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e6ed" />
              <XAxis dataKey="heure" tick={{ fill: '#6c86a3' }} />
              <YAxis tick={{ fill: '#6c86a3' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="patients" stroke="#17b8b0" fill="#17b8b0" fillOpacity={0.2} name="Patients" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3><i className="fa-solid fa-chart-simple"></i> Admissions par service</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={admissionsByService} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: '#6c86a3' }} />
              <YAxis type="category" dataKey="service" tick={{ fill: '#6c86a3' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="admissions" fill="#17b8b0" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deux colonnes : hôpital + activités */}
      <div className="dashboard-grid">
        <div className="hospital-info">
          <div className="info-card">
            <h3><i className="fa-solid fa-chart-line"></i> Taux d'occupation</h3>
            <div className="occupancy-bar">
              <div className="occupancy-fill" style={{ width: `${stats.tauxOccupation}%` }}></div>
            </div>
            <p className="occupancy-text">{stats.tauxOccupation}% des lits occupés</p>
          </div>
          <div className="info-card">
            <h3><i className="fa-regular fa-clock"></i> Prochain rendez-vous</h3>
            <p><strong>{stats.prochainRendezVous.heure}</strong> – {stats.prochainRendezVous.patient}</p>
            <p>Avec {stats.prochainRendezVous.medecin}</p>
            <button className="btn-confirm">Confirmer arrivée</button>
          </div>
          <div className="info-card">
            <h3><i className="fa-solid fa-building"></i> À propos de l'hôpital</h3>
            <p>Hôpital Central – 150 lits, urgences 24/7, laboratoire, imagerie.</p>
            <p>Certifié ISO 9001, 45 médecins spécialistes.</p>
          </div>
        </div>

        <div className="recent-activities">
          <div className="activity-card">
            <h3><i className="fa-regular fa-bell"></i> Activités récentes</h3>
            <div className="activity-list">
              {activitesRecentes.map(act => (
                <div className={`activity-item ${act.urgent ? 'urgent' : ''}`} key={act.id}>
                  <div className="activity-time">{act.heure}</div>
                  <div className="activity-details">
                    <strong>{act.patient}</strong> – {act.service}
                    {act.note && <span className="activity-note">{act.note}</span>}
                  </div>
                  <div className={`activity-status status-${act.statut.toLowerCase().replace(/[^a-z]/g, '')}`}>
                    {act.statut}
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