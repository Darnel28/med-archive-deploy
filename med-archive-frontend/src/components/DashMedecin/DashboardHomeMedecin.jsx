import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';  

const DashboardHomeMedecin = () => {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
          datasets: [{
            label: 'Consultations',
            data: [5, 8, 6, 9, 7, 4],
            borderColor: '#2c7be5',
            backgroundColor: 'rgba(44,123,229,0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }
    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  }, []);

  return (
    <div className="doctor-main">
      <section className="doctor-card">
        <div className="dashboard-header">
          <div className="dashboard-copy">
            <p className="dashboard-kicker">Vue d'ensemble</p>
            <p>Suivi synthétique de l'activité médicale du jour.</p>
          </div>
          <div className="dashboard-date">
            <i className="fa-regular fa-calendar"></i> 12 mars 2026
          </div>
        </div>
        <div className="quick-stats">
          <article className="quick-stat">
            <div className="quick-stat-top">
              <p className="quick-stat-label">Patients suivis</p>
              <span className="quick-stat-icon"><i className="fa-solid fa-user-group"></i></span>
            </div>
            <strong>120</strong>
            <p className="quick-stat-meta">Dossiers actifs sous votre suivi</p>
          </article>
          <article className="quick-stat">
            <div className="quick-stat-top">
              <p className="quick-stat-label">Rendez-vous aujourd'hui</p>
              <span className="quick-stat-icon"><i className="fa-regular fa-calendar-check"></i></span>
            </div>
            <strong>8</strong>
            <p className="quick-stat-meta">Consultations programmées pour la journée</p>
          </article>
          <article className="quick-stat">
            <div className="quick-stat-top">
              <p className="quick-stat-label">Examens en attente</p>
              <span className="quick-stat-icon"><i className="fa-solid fa-flask"></i></span>
            </div>
            <strong>3</strong>
            <p className="quick-stat-meta">Demandes en cours de traitement laboratoire</p>
          </article>
          <article className="quick-stat">
            <div className="quick-stat-top">
              <p className="quick-stat-label">Alertes résultats disponibles</p>
              <span className="quick-stat-icon"><i className="fa-regular fa-bell"></i></span>
            </div>
            <strong>2</strong>
            <p className="quick-stat-meta">Résultats à consulter dans la file d'attente</p>
          </article>
        </div>
      </section>

      <section className="widgets-grid">
        <div className="widget">
          <h3><i className="fa-regular fa-calendar"></i> Prochains rendez-vous</h3>
          <div className="appointment">
            <div><strong>Jean Dupont</strong><br />Consultation générale</div>
            <div className="appointment-time">09:30</div>
          </div>
          <div className="appointment">
            <div><strong>Amina Bello</strong><br />Suivi hypertension</div>
            <div className="appointment-time">11:00</div>
          </div>
          <div className="appointment">
            <div><strong>Paul Koffi</strong><br />Résultats examens</div>
            <div className="appointment-time">14:00</div>
          </div>
        </div>

        <div className="widget">
          <h3><i className="fa-solid fa-bell"></i> Alertes médicales</h3>
          <div className="alert-box">
            Résultat laboratoire disponible pour <strong>Jean Dupont</strong>
          </div>
          <div className="alert-box">
            Patient <strong>Amina Bello</strong> - tension élevée
          </div>
        </div>

        <div className="widget">
          <h3><i className="fa-solid fa-user"></i> Patients récents</h3>
          <div className="patient-mini">
            <img src="https://i.pravatar.cc/40?img=15" alt="patient" />
            <span>Jean Dupont</span>
          </div>
          <div className="patient-mini">
            <img src="https://i.pravatar.cc/40?img=21" alt="patient" />
            <span>Amina Bello</span>
          </div>
          <div className="patient-mini">
            <img src="https://i.pravatar.cc/40?img=33" alt="patient" />
            <span>Paul Koffi</span>
          </div>
        </div>

        <div className="widget">
          <h3><i className="fa-solid fa-chart-line"></i> Activité de la semaine</h3>
          <canvas ref={chartRef} className="chart-box"></canvas>
        </div>
      </section>
    </div>
  );
};

export default DashboardHomeMedecin;