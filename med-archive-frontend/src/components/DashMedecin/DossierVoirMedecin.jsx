// import React, { useState } from 'react';

// import '../../assets/css/DossierDuPatient.css';

// const DossierVoirMedecin = () => {
//     const [activeFilter, setActiveFilter] = useState('date');
//     const [activeTab, setActiveTab] = useState('historique');

//     return (
//         <main className="content page-tight">
//             <nav className="ddp-top-tabs" aria-label="Navigation dossier">
//                 <button
//                     className={`ddp-tab ${activeTab === 'historique' ? 'active' : ''}`}
//                     type="button"
//                     onClick={() => setActiveTab('historique')}
//                 >
//                     Historique medical
//                 </button>
//                 <button
//                     className={`ddp-tab ${activeTab === 'analyses' ? 'active' : ''}`}
//                     type="button"
//                     onClick={() => setActiveTab('analyses')}
//                 >
//                     Resultats d'analyses
//                 </button>
//                 <button
//                     className={`ddp-tab ${activeTab === 'ordonnances' ? 'active' : ''}`}
//                     type="button"
//                     onClick={() => setActiveTab('ordonnances')}
//                 >
//                     Ordonnances <i className="fa-solid fa-chevron-down ddp-tab-caret"></i>
//                 </button>
//                 <button
//                     className={`ddp-tab ${activeTab === 'documents' ? 'active' : ''}`}
//                     type="button"
//                     onClick={() => setActiveTab('documents')}
//                 >
//                     Documents
//                 </button>
//                 <button
//                     className={`ddp-tab ${activeTab === 'hospitalisation' ? 'active' : ''}`}
//                     type="button"
//                     onClick={() => setActiveTab('hospitalisation')}
//                 >
//                     Hospitalisation
//                 </button>
//             </nav>

//             <section className="ddp-board">
//                 <aside className="ddp-aside" aria-label="Resume patient">
//                     <img className="ddp-photo"
//                         src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=480&q=80"
//                         alt="Portrait patient" />

//                     <div className="ddp-patient-id">
//                         <h2>Marie Lefevre</h2>
//                         <span>IMU: MA-24-5108</span>
//                     </div>

//                     <ul className="ddp-facts">
//                         <li><i className="fa-regular fa-calendar"></i> 14/03/1950</li>
//                         <li><i className="fa-solid fa-phone"></i> +229 00 00 00 00</li>
//                         <li><i className="fa-solid fa-droplet"></i> O+ | 163 cm | 78 kg</li>
//                         <li><i className="fa-solid fa-house"></i> Zogbo, Benin Rue 123</li>
//                         <li><i className="fa-solid fa-user-doctor"></i> Medecin referent: Dr Jean Martin</li>
//                     </ul>

//                     <section className="ddp-aside-block" aria-label="Allergies principales">
//                         <div className="ddp-aside-head">
//                             <h3>Allergies</h3>
//                             <a href="#">Voir tout</a>
//                         </div>

//                         <article className="ddp-info-item">
//                             <strong><i className="fa-solid fa-circle ddp-dot-danger"></i> Penicilline</strong>
//                             <span>Reponse severe observee en 2024</span>
//                         </article>

//                         <article className="ddp-info-item">
//                             <strong><i className="fa-solid fa-circle ddp-dot-warning"></i> Ibuprofene</strong>
//                             <span>Reaction moderee, surveillance recommandee</span>
//                         </article>
//                     </section>
//                     <section className="ddp-aside-block">
//                         <div className="ddp-aside-head">
//                             <h3>Antécédents</h3>
//                         </div>

//                         <div className="ddp-info-item">
//                             <strong><i className="fa-solid fa-circle ddp-dot-danger"></i> Hypertension</strong>
//                             <span>Diagnostiquée en 2018 - traitement en cours</span>
//                         </div>

//                         <div className="ddp-info-item">
//                             <strong><i className="fa-solid fa-circle ddp-dot-warning"></i> Diabète type 2</strong>
//                             <span>Suivi régulier - régime contrôlé</span>
//                         </div>
//                     </section>
//                     <section className="ddp-aside-block">
//                         <div className="ddp-aside-head">
//                             <h3>Traitements</h3>
//                         </div>

//                         <div className="ddp-info-item">
//                             <strong><i className="fa-solid fa-circle ddp-dot-info"></i> Metformine 500mg</strong>
//                             <span>2 fois par jour</span>
//                         </div>

//                         <div className="ddp-info-item">
//                             <strong><i className="fa-solid fa-circle ddp-dot-teal"></i> Amlodipine 10mg</strong>
//                             <span>1 fois par jour</span>
//                         </div>
//                     </section>

//                     <section className="ddp-aside-block" aria-label="Derniers resultats">
//                         <div className="ddp-aside-head">
//                             <h3>Derniers resultats</h3>
//                         </div>

//                         <article className="ddp-result-item">
//                             <label><span>Cholesterol total</span><strong>2.15 g/L</strong></label>
//                             <div className="ddp-result-track"><span className="ddp-result-fill warn" style={{ width: '68%' }}></span></div>
//                         </article>

//                         <article className="ddp-result-item">
//                             <label><span>Creatinine</span><strong>12 mg/L</strong></label>
//                             <div className="ddp-result-track"><span className="ddp-result-fill alert" style={{ width: '82%' }}></span></div>
//                         </article>

//                         <article className="ddp-result-item">
//                             <label><span>Glucose a jeun</span><strong>0.98 g/L</strong></label>
//                             <div className="ddp-result-track"><span className="ddp-result-fill" style={{ width: '48%' }}></span></div>
//                         </article>
//                     </section>
//                 </aside>

//                 {activeTab === 'historique' && (
//                     <section className="ddp-history-shell" aria-label="Historique medical">
//                         <header className="ddp-history-toolbar ddp-analyses-toolbar">
//                             <h1>Historique medical</h1>
//                             <div className="ddp-history-filters">
//                                 <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
//                             </div>
//                         </header>

//                         <div className="ddp-history-scale" aria-label="Echelle chronologique">
//                             <div className="ddp-scale-bars">
//                                 <span style={{ height: '11px' }}></span><span style={{ height: '18px' }}></span><span
//                                     style={{ height: '8px' }}></span><span style={{ height: '25px' }}></span><span
//                                         style={{ height: '13px' }}></span><span style={{ height: '22px' }}></span><span
//                                             style={{ height: '9px' }}></span><span style={{ height: '15px' }}></span><span
//                                                 style={{ height: '7px' }}></span><span style={{ height: '19px' }}></span><span
//                                                     style={{ height: '10px' }}></span><span style={{ height: '16px' }}></span><span
//                                                         style={{ height: '23px' }}></span><span style={{ height: '14px' }}></span><span
//                                                             style={{ height: '12px' }}></span><span style={{ height: '9px' }}></span><span
//                                                                 style={{ height: '20px' }}></span><span style={{ height: '6px' }}></span><span
//                                                                     style={{ height: '18px' }}></span><span style={{ height: '13px' }}></span>
//                             </div>
//                             <div className="ddp-scale-steps">
//                                 <span>15</span>
//                                 <span>1M</span>
//                                 <span>3M</span>
//                                 <span>6M</span>
//                                 <span>1A</span>
//                             </div>
//                             <div className="ddp-scale-date">27/10/2024 - 27/04/2026</div>
//                         </div>

//                         <div className="ddp-timeline">
//                             <section className="ddp-year-group">
//                                 <div className="ddp-year-label">2026</div>
//                                 <div className="ddp-year-track">
//                                     <span className="ddp-year-node" aria-hidden="true"></span>
//                                     <div className="ddp-annual-ribbon"><i className="fa-regular fa-file-lines"></i> Voir rapport annuel
//                                     </div>
//                                     <article className="ddp-history-event">
//                                         <span className="ddp-event-day">Lundi</span>
//                                         <h4>Consultation generale</h4>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Jean Martin</p>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Hopital Saint-Antoine,
//                                             Paris</p>
//                                     </article>
//                                     <article className="ddp-history-event">
//                                         <span className="ddp-event-day">Jeudi</span>
//                                         <h4>Controle d'asthme</h4>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Bernard Simon</p>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Clinique du Marais,
//                                             Paris</p>
//                                     </article>
//                                 </div>
//                             </section>

//                             <section className="ddp-year-group">
//                                 <div className="ddp-year-label">2025</div>
//                                 <div className="ddp-year-track">
//                                     <span className="ddp-year-node" aria-hidden="true"></span>
//                                     <div className="ddp-annual-ribbon"><i className="fa-regular fa-file-lines"></i> Voir rapport annuel
//                                     </div>
//                                     <article className="ddp-history-event">
//                                         <span className="ddp-event-day">Mardi</span>
//                                         <h4>Vaccin contre la grippe</h4>
//                                         <p className="ddp-history-meta"><i className="fa-regular fa-calendar"></i> 31 Aout 2025</p>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-location-dot"></i> Cabinet D-attrinand
//                                             Simorkina, Paris</p>
//                                     </article>
//                                     <article className="ddp-history-event">
//                                         <span className="ddp-event-day">Mars</span>
//                                         <h4>Chirurgie de la vesicule biliaire</h4>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Bernard Durnad
//                                         </p>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Hopital Bichat Claude
//                                             Bernard, Paris</p>
//                                     </article>
//                                 </div>
//                             </section>

//                             <section className="ddp-year-group">
//                                 <div className="ddp-year-label">2024</div>
//                                 <div className="ddp-year-track">
//                                     <span className="ddp-year-node" aria-hidden="true"></span>
//                                     <div className="ddp-annual-ribbon"><i className="fa-regular fa-file-lines"></i> Voir rapport annuel
//                                     </div>
//                                     <article className="ddp-history-event">
//                                         <span className="ddp-event-day">Jeudi</span>
//                                         <h4>Consultation de suivi cardiaque</h4>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Jean Martin</p>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Institut Med Archive,
//                                             antenne Cotonou</p>
//                                     </article>
//                                     <article className="ddp-history-event">
//                                         <span className="ddp-event-day">Avril</span>
//                                         <h4>Controle d'asthme chronique</h4>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Bernard Simon</p>
//                                         <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Hopital Saint-Antoine,
//                                             Paris</p>
//                                     </article>
//                                 </div>
//                             </section>
//                         </div>
//                     </section>
//                 )}

//                 {activeTab === 'analyses' && (
//                     <section className="ddp-history-shell ddp-analyses-shell" aria-label="Resultats d'analyses">
//                         <header className="ddp-history-toolbar ddp-analyses-toolbar">
//                             <h1>Resultats d'analyses</h1>
//                             <div className="ddp-history-filters">
//                                 <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
//                             </div>
//                         </header>
//                         <section className="ddp-analyses-card" aria-label="Tableau des resultats d'analyses">
//                             <div className="ddp-analyses-card-head">
//                                 {/* <h3>Resultats d'analyses</h3> */}
//                                 {/* <a href="#">Voir tous les examens</a> */}
//                             </div>
//                             <div className="ddp-analyses-table-wrap">
//                                 <table className="ddp-analyses-table">
//                                     <thead>
//                                         <tr>
//                                             <th>DATE</th>
//                                             <th>EXAMEN</th>
//                                             <th>VALEUR</th>
//                                             <th>STATUT</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         <tr>
//                                             <td>21/03/2026</td>
//                                             <td>Hemoglobine glyquee (HbA1c)</td>
//                                             <td>6.8%</td>
//                                             <td><span className="ddp-status ddp-status-watch">A surveiller</span></td>
//                                         </tr>
//                                         <tr>
//                                             <td>18/03/2026</td>
//                                             <td>Creatinine</td>
//                                             <td>12 mg/L</td>
//                                             <td><span className="ddp-status ddp-status-alert">Eleve</span></td>
//                                         </tr>
//                                         <tr>
//                                             <td>12/03/2026</td>
//                                             <td>Glycemie a jeun</td>
//                                             <td>0.98 g/L</td>
//                                             <td><span className="ddp-status ddp-status-ok">Normal</span></td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </section>
//                     </section>
//                 )}

//                 {activeTab === 'ordonnances' && (
//                     <section className="ddp-history-shell ddp-ord-shell" aria-label="Ordonnances">
//                         <header className="ddp-history-toolbar ddp-analyses-toolbar">
//                             <h1>Ordonnances</h1>
//                             <div className="ddp-history-filters">
//                                 <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
//                             </div>
//                         </header>
//                         <section className="ddp-ord-card" aria-label="Tableau des ordonnances">
//                             <div className="ddp-ord-card-head">
//                                 {/* <h3>Liste Ordonnances </h3> */}
//                                 <a href="#">Nouvelle ordonnance</a>
//                             </div>
//                             <div className="ddp-ord-table-wrap">
//                                 <table className="ddp-ord-table">
//                                     <thead>
//                                         <tr>
//                                             <th>PRESCRIPTION</th>
//                                             <th>POSOLOGIE</th>
//                                             <th>DUREE</th>
//                                             <th>PRESCRIPTEUR</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         <tr>
//                                             <td>Metformine 500mg</td>
//                                             <td>2 fois par jour</td>
//                                             <td>90 jours</td>
//                                             <td>Dr Jean Martin</td>
//                                         </tr>
//                                         <tr>
//                                             <td>Amlodipine 10mg</td>
//                                             <td>1 fois par jour</td>
//                                             <td>60 jours</td>
//                                             <td>Dr Bernard Simon</td>
//                                         </tr>
//                                         <tr>
//                                             <td>Atorvastatine 20mg</td>
//                                             <td>Le soir apres repas</td>
//                                             <td>30 jours</td>
//                                             <td>Dr Jean Martin</td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </section>
//                     </section>
//                 )}

//                 {activeTab === 'documents' && (
//                     <section className="ddp-history-shell ddp-doc-shell" aria-label="Documents patient">
//                         <header className="ddp-history-toolbar ddp-analyses-toolbar">
//                             <h1>Documents medicaux</h1>
//                             <div className="ddp-history-filters">
//                                 <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
//                             </div>
//                         </header>
//                         <section className="ddp-doc-section" aria-label="Grille des documents">
//                             <div className="ddp-doc-section-head">
//                                 {/* <h3>Documents medicaux</h3> */}
//                                 {/* <a href="#">Bibliotheque Med Archive</a> */}
//                             </div>
//                             <div className="ddp-doc-grid">
//                                 <article className="ddp-doc-card">
//                                     <h4>Compte rendu cardiologie</h4>
//                                     <p>PDF · 1.2 Mo · 19/03/2026</p>
//                                 </article>
//                                 <article className="ddp-doc-card">
//                                     <h4>Bilan biologique trimestriel</h4>
//                                     <p>PDF · 0.8 Mo · 18/03/2026</p>
//                                 </article>
//                                 <article className="ddp-doc-card">
//                                     <h4>Ordonnance scannee</h4>
//                                     <p>JPEG · 0.6 Mo · 12/03/2026</p>
//                                 </article>
//                                 <article className="ddp-doc-card">
//                                     <h4>Echo cardiaque</h4>
//                                     <p>PNG · 2.4 Mo · 10/03/2026</p>
//                                 </article>
//                                 <article className="ddp-doc-card">
//                                     <h4>Fiche de suivi diabetologique</h4>
//                                     <p>PDF · 0.5 Mo · 02/03/2026</p>
//                                 </article>
//                                 <article className="ddp-doc-card">
//                                     <h4>Consentement numerise</h4>
//                                     <p>PDF · 0.3 Mo · 27/02/2026</p>
//                                 </article>
//                             </div>
//                         </section>
//                     </section>
//                 )}

//                 {activeTab === 'hospitalisation' && (
//                     <section className="ddp-history-shell ddp-hosp-shell" aria-label="Hospitalisations">
//                         <header className="ddp-history-toolbar ddp-analyses-toolbar">
//                             <h1>Hospitalisations</h1>
//                             <div className="ddp-history-filters">
//                                 <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
//                                 <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
//                             </div>
//                         </header>
//                         <div className="ddp-timeline">
//                             <article className="ddp-history-event">
//                                 <h4>Hospitalisation cardiologie</h4>
//                                 <p className="ddp-history-meta">Hopital Saint-Antoine - 08/04/2026 - 12 jours</p>
//                             </article>
//                             <article className="ddp-history-event">
//                                 <h4>Hospitalisation diabetologie</h4>
//                                 <p className="ddp-history-meta">Clinique du Marais - 22/02/2026 - 5 jours</p>
//                             </article>
//                         </div>
//                     </section>
//                 )}
//             </section>
//         </main>
//     );
// };

// export default DossierVoirMedecin;
import React from 'react';

const DossierVoirMedecin = () => {
  return (
    <main className="content page-tight" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <section className="patient-dossier">
        {/* Carte de profil */}
        <article className="profile-card">
          <div className="profile-head">
            <img
              className="profile-avatar"
              src="https://i.pravatar.cc/140?img=12"
              alt="Photo patient"
            />
            <div className="profile-main">
              <h1>Jean A.</h1>
              <div className="profile-tags">
                <span className="tag tag-neutral">Patient suivi</span>
                <span className="tag tag-vip">Dossier prioritaire</span>
              </div>
              <p>Zogbo, Benin Rue 123</p>
            </div>
            <div className="profile-actions">
              <button className="profile-icon" type="button" title="Appeler">
                <i className="fa-solid fa-phone"></i>
              </button>
              <button className="profile-icon" type="button" title="Message">
                <i className="fa-regular fa-comment"></i>
              </button>
            </div>
          </div>
          <div className="profile-meta">
            <div className="meta-item">
              <strong>45 ans</strong>
              <span>Âge</span>
            </div>
            <div className="meta-item">
              <strong>A+</strong>
              <span>Groupe sanguin</span>
            </div>
            <div className="meta-item">
              <strong>78 kg</strong>
              <span>Poids</span>
            </div>
            <div className="meta-highlight">
              <strong>Prochain RDV: 9:30 AM</strong>
              <span>Aujourd'hui</span>
            </div>
          </div>
        </article>

        {/* Métriques rapides */}
        <section className="metrics-grid" aria-label="Indicateurs rapides">
          <article className="metric-card metric-a">
            <i className="fa-regular fa-heart"></i>
            <div>
              <strong>80</strong>
              <span>bpm</span>
            </div>
          </article>
          <article className="metric-card metric-b">
            <i className="fa-solid fa-gauge-high"></i>
            <div>
              <strong>118/76</strong>
              <span>mmHg Tension</span>
            </div>
          </article>
          <article className="metric-card metric-c">
            <i className="fa-solid fa-lungs"></i>
            <div>
              <strong>14</strong>
              <span>Resp./min</span>
            </div>
          </article>
          <article className="metric-card metric-d">
            <i className="fa-solid fa-cubes"></i>
            <div>
              <strong>65</strong>
              <span>mg/dl Glucose</span>
            </div>
          </article>
        </section>

        {/* Grille principale */}
        <section className="content-grid">
          <div className="stacked-grid">
            {/* Informations générales */}
            <article className="dossier-panel">
              <h3>1. Informations générales</h3>
              <p className="panel-sub">Informations du patient.</p>
              <div className="info-grid">
                <div className="info-item"><span>Nom et prénom</span><strong>Jean A.</strong></div>
                <div className="info-item"><span>Sexe</span><strong>Masculin</strong></div>
                <div className="info-item"><span>Date de naissance</span><strong>18/06/1981</strong></div>
                <div className="info-item"><span>Âge</span><strong>45 ans</strong></div>
                <div className="info-item"><span>Adresse</span><strong>Zogbo, Benin Rue 123</strong></div>
                <div className="info-item"><span>Téléphone</span><strong>+229 00 00 00 00</strong></div>
                <div className="info-item"><span>Email</span><strong>jean.a@email.com</strong></div>
                <div className="info-item"><span>Groupe sanguin</span><strong>A+</strong></div>
                <div className="info-item"><span>Urgence</span><strong>Marie A. +229 00 00 00 00</strong></div>
              </div>
            </article>

            {/* Allergies et antécédents */}
            <article className="dossier-panel">
              <h3>2. Allergies et antécédents</h3>
              <p className="panel-sub">Informations critiques pour la prise en charge médicale.</p>
              <strong className="subsection-title">Allergies</strong>
              <div className="pill-list">
                <span className="pill pill-danger">Pénicilline</span>
                <span className="pill pill-danger">Arachides</span>
                <span className="pill pill-danger">Poussière</span>
              </div>
              <strong className="subsection-title">Antécédents médicaux</strong>
              <div className="pill-list">
                <span className="pill">Diabète</span>
                <span className="pill">Hypertension</span>
                <span className="pill">Asthme</span>
                <span className="pill">Chirurgie passée</span>
                <span className="pill">Maladie chronique</span>
              </div>
              <strong className="subsection-title">Vaccinations</strong>
              <div className="pill-list">
                <span className="pill pill-success">Tétanos</span>
                <span className="pill pill-success">Hépatite B</span>
              </div>
            </article>

            {/* Historique des consultations */}
            <article className="dossier-panel">
              <h3>3. Historique des consultations</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Médecin</th>
                      <th>Motif</th>
                      <th>Diagnostic</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>12/03/2026</td>
                      <td>Dr Alice</td>
                      <td>Fièvre</td>
                      <td>Infection virale</td>
                      <td><a className="action-link" href="#"><i className="fa-regular fa-eye"></i> Voir détails</a></td>
                    </tr>
                    <tr>
                      <td>03/03/2026</td>
                      <td>Dr Martin</td>
                      <td>Suivi</td>
                      <td>Évolution favorable</td>
                      <td><a className="action-link" href="#"><i className="fa-regular fa-eye"></i> Voir détails</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Résultats d'analyses */}
            <article className="dossier-panel">
              <h3>4. Résultats d'analyses</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Analyse</th>
                      <th>Résultat</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>10/03/2026</td>
                      <td>Analyse sanguine</td>
                      <td><span className="pill pill-warning">Normal</span></td>
                      <td><a className="action-link" href="#"><i className="fa-solid fa-download"></i> Télécharger</a></td>
                    </tr>
                    <tr>
                      <td>01/03/2026</td>
                      <td>CRP</td>
                      <td><span className="pill">Légère inflammation</span></td>
                      <td><a className="action-link" href="#"><i className="fa-solid fa-download"></i> Télécharger</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Ordonnances */}
            <article className="dossier-panel">
              <h3>5. Ordonnances</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Médecin</th>
                      <th>Médicaments</th>
                      <th>Télécharger</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>12/03/2026</td>
                      <td>Dr Alice</td>
                      <td>Paracétamol</td>
                      <td><a className="action-link" href="#"><i className="fa-regular fa-file-pdf"></i> PDF</a></td>
                    </tr>
                    <tr>
                      <td>05/03/2026</td>
                      <td>Dr Martin</td>
                      <td>Vitamine C</td>
                      <td><a className="action-link" href="#"><i className="fa-regular fa-file-pdf"></i> PDF</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* Hospitalisations */}
            {/* <article className="dossier-panel">
              <h3>7. Hospitalisations</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date entrée</th>
                      <th>Date sortie</th>
                      <th>Service</th>
                      <th>Diagnostic</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>10/01/2025</td>
                      <td>15/01/2025</td>
                      <td>Cardiologie</td>
                      <td>Hypertension</td>
                    </tr>
                    <tr>
                      <td>03/10/2024</td>
                      <td>06/10/2024</td>
                      <td>Pneumologie</td>
                      <td>Infection respiratoire</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article> */}
          </div>

          {/* Colonne droite : Documents médicaux */}
          <div className="stacked-grid">
            <article className="dossier-panel">
              <h3>6. Documents médicaux</h3>
              <p className="panel-sub">Formats supportés: PDF, JPEG, PNG, MP4</p>
              <div className="doc-grid">
                <article className="doc-item">
                  <strong>Radiographie thorax</strong>
                  <span>JPEG - 2.4 Mo</span>
                  <button className="patient-compact-btn">Ouvrir</button>
                </article>
                <article className="doc-item">
                  <strong>Scanner cérébral</strong>
                  <span>PNG - 5.8 Mo</span>
                  <button className="patient-compact-btn">Ouvrir</button>
                </article>
                <article className="doc-item">
                  <strong>Compte rendu</strong>
                  <span>PDF - 0.9 Mo</span>
                  <button className="patient-compact-btn">Ouvrir</button>
                </article>
              </div>
              <div className="img-grid">
                <div className="img-placeholder"><i className="fa-regular fa-image"></i><span>Radiographie</span></div>
                <div className="img-placeholder"><i className="fa-solid fa-file-waveform"></i><span>IRM</span></div>
                <div className="img-placeholder"><i className="fa-solid fa-file-medical"></i><span>Compte rendu</span></div>
                <div className="img-placeholder"><i className="fa-solid fa-video"></i><span>Séquence MP4</span></div>
              </div>
            </article>
          </div>
        </section>
      </section>

      <style>{`
        /* ========== CONTENEUR PRINCIPAL AÉRÉ ========== */
        .patient-dossier {
          background: #e9eef8;
          border-radius: 24px;
          padding: 24px;
          display: grid;
          gap: 24px;
        }

        /* ========== CARTE PROFIL ========== */
        .profile-card {
          background: #fff;
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 18px;
          overflow: hidden;
        }
        .profile-head {
          padding: 24px;
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 20px;
          align-items: center;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #dbe7f3;
        }
        .profile-main h1 {
          margin: 0;
          font-size: 1.9rem;
          color: #000000 !important;   /* NOIR forcé en mode clair */
        }
        body.dark-mode .profile-main h1 {
          color: #e4f0fb !important;   /* clair en mode sombre */
        }
        .profile-tags {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          font-size: 0.8rem;
          padding: 6px 10px;
          font-weight: 600;
        }
        .tag-neutral {
          background: #efe8ff;
          color: #6952a7;
        }
        .tag-vip {
          background: #ffe8f7;
          color: #b8428d;
        }
        .profile-main p {
          margin: 10px 0 0;
          color: #4f6b8a;
        }
        .profile-actions {
          display: flex;
          gap: 10px;
          align-self: start;
        }
        .profile-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(24, 68, 101, 0.2);
          background: #fff;
          color: #315b84;
        }
        .profile-meta {
          border-top: 1px solid rgba(24, 68, 101, 0.12);
          padding: 18px 24px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .meta-item strong, .meta-highlight strong {
          font-size: 1.2rem;
          color: #132f53;
        }
        .meta-item span, .meta-highlight span {
          color: #617d97;
          font-size: 0.9rem;
        }
        .meta-highlight {
          justify-self: end;
          text-align: right;
        }

        /* ========== MÉTRIQUES ========== */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .metric-card {
          border-radius: 16px;
          padding: 18px;
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 14px;
          align-items: center;
        }
        .metric-card i {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.75);
          color: #2e557d;
          font-size: 1.4rem;
        }
        .metric-card strong {
          font-size: 2.2rem;
          line-height: 1;
          color: #122f53;
        }
        .metric-card span {
          color: #5d7894;
        }
        .metric-a { background: #f7dfc6; }
        .metric-b { background: #f8e7b5; }
        .metric-c { background: #cdeef4; }
        .metric-d { background: #ead8eb; }

        /* ========== GRILLE DEUX COLONNES ========== */
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .stacked-grid {
          display: grid;
          gap: 24px;
        }

        /* ========== PANNEAUX DOSSIER ========== */
        .dossier-panel {
          background: #fff;
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 18px;
          padding: 20px 24px;
          display: grid;
          gap: 16px;
        }
        /* Titres principaux des sections (1.,2.,3.,5.,7.) en NOIR */
        .dossier-panel h3 {
          margin: 0;
          font-size: 1.35rem;
          color: #000000 !important;
          font-weight: 700;
        }
        body.dark-mode .dossier-panel h3 {
          color: #e4f0fb !important;
        }
        /* Sous-titres internes (Allergies, Antécédents, Vaccinations) retrouvent leur couleur normale */
        .subsection-title {
          font-size: 1rem;
          font-weight: 700;
          margin-top: 4px;
          color: var(--text-dark, #1a1a1a);
        }
        body.dark-mode .subsection-title {
          color: var(--text-light, #c0d8e8);
        }
        .panel-sub {
          margin: -4px 0 0;
          color: #5f7b95;
        }

        /* Grille info patient */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .info-item {
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 12px;
          padding: 12px;
          display: grid;
          gap: 4px;
          background: #fbfdff;
        }
        .info-item span {
          font-size: 0.8rem;
          color: #67829b;
        }
        .info-item strong {
          color: #15395f;
          font-size: 0.95rem;
        }

        /* Pills */
        .pill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pill {
          border-radius: 999px;
          border: 1px solid rgba(24, 68, 101, 0.16);
          padding: 6px 12px;
          font-size: 0.86rem;
          color: #375f84;
          background: #f4f8fc;
        }
        .pill-danger {
          color: #8c3b4a;
          background: #ffeef2;
          border-color: #f0c4cf;
        }
        .pill-warning {
          color: #8a5a11;
          background: #fff4dc;
          border-color: #f1ddad;
        }
        .pill-success {
          color: #1f6a45;
          background: #e8f9ef;
          border-color: #bde8ce;
        }

        /* Tableaux */
        .table-wrap {
          overflow-x: auto;
        }
        .table-clean {
          width: 100%;
          min-width: 680px;
          border-collapse: collapse;
        }
        .table-clean th,
        .table-clean td {
          text-align: left;
          padding: 12px 8px;
          border-bottom: 1px solid rgba(24, 68, 101, 0.12);
          color: #20496f;
          vertical-align: top;
        }
        .table-clean th {
          color: #5f7b95;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 700;
        }
        .action-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2f5f91;
          text-decoration: none;
          font-weight: 600;
        }

        /* ========== DOCUMENTS MÉDICAUX ========== */
        .doc-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .doc-item {
          border: 1px dashed rgba(24, 68, 101, 0.25);
          border-radius: 14px;
          padding: 16px;
          background: #fafcff;
          display: grid;
          gap: 8px;
        }
        .doc-item strong {
          color: #1d466e;
        }
        .doc-item span {
          color: #5f7b95;
          font-size: 0.9rem;
        }
        /* Bouton "Ouvrir" redessiné : compact, élégant */
        .patient-compact-btn {
          background: transparent;
          border: 1px solid var(--teal, #17b8b0);
          border-radius: 30px;
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--teal-dark, #0f9f9b);
          cursor: pointer;
          transition: all 0.2s ease;
          width: fit-content;
        }
        .patient-compact-btn:hover {
          background: var(--teal, #17b8b0);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(23,184,176,0.2);
        }
        body.dark-mode .patient-compact-btn {
          border-color: #2dd4c8;
          color: #2dd4c8;
        }
        body.dark-mode .patient-compact-btn:hover {
          background: #2dd4c8;
          color: #001f2e;
        }

        .img-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .img-placeholder {
          height: 115px;
          border-radius: 12px;
          border: 1px solid rgba(24, 68, 101, 0.12);
          background: linear-gradient(145deg, #d9e8fb, #eef5ff);
          color: #2e567e;
          display: grid;
          place-items: center;
          gap: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          text-align: center;
          padding: 8px;
        }
        .img-placeholder i {
          font-size: 1.3rem;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1120px) {
          .content-grid { grid-template-columns: 1fr; }
          .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 760px) {
          .profile-head { grid-template-columns: 1fr; }
          .profile-actions { justify-content: flex-start; }
          .profile-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .meta-highlight { justify-self: start; text-align: left; }
          .metrics-grid, .info-grid, .doc-grid { grid-template-columns: 1fr; }
        }

        /* ========== MODE SOMBRE ========== */
        body.dark-mode .patient-dossier { background: #0b2435; }
        body.dark-mode .profile-card,
        body.dark-mode .dossier-panel {
          background: #102b3d;
          border-color: #1a4b65;
        }
        body.dark-mode .profile-main h1,
        body.dark-mode .dossier-panel h3,
        body.dark-mode .meta-item strong,
        body.dark-mode .meta-highlight strong,
        body.dark-mode .metric-card strong,
        body.dark-mode .info-item strong,
        body.dark-mode .doc-item strong,
        body.dark-mode .table-clean td,
        body.dark-mode .action-link {
          color: #e4f0fb;
        }
        body.dark-mode .subsection-title {
          color: #9fc0d9;
        }
        body.dark-mode .profile-main p,
        body.dark-mode .meta-item span,
        body.dark-mode .meta-highlight span,
        body.dark-mode .metric-card span,
        body.dark-mode .panel-sub,
        body.dark-mode .info-item span,
        body.dark-mode .table-clean th,
        body.dark-mode .doc-item span,
        body.dark-mode .pill {
          color: #9fc0d9;
        }
        body.dark-mode .profile-avatar { border-color: #2a5a75; }
        body.dark-mode .profile-icon {
          border-color: #2a5a75;
          background: #14344a;
          color: #b8d3e8;
        }
        body.dark-mode .profile-meta { border-top-color: #1a4b65; }
        body.dark-mode .metric-a { background: #4b3722; }
        body.dark-mode .metric-b { background: #4d4524; }
        body.dark-mode .metric-c { background: #214753; }
        body.dark-mode .metric-d { background: #47344c; }
        body.dark-mode .metric-card i { background: rgba(255,255,255,0.12); color: #d0e6f7; }
        body.dark-mode .info-item { border-color: #21536d; background: #123246; }
        body.dark-mode .pill { border-color: #2b607b; background: #16364c; }
        body.dark-mode .pill-danger { color: #ffc7d6; background: #5a2e3a; border-color: #854557; }
        body.dark-mode .pill-warning { color: #ffe4af; background: #59461f; border-color: #83652c; }
        body.dark-mode .pill-success { color: #b9f3d1; background: #244d39; border-color: #3a7a5a; }
        body.dark-mode .table-clean th,
        body.dark-mode .table-clean td { border-bottom-color: #1e4f68; }
        body.dark-mode .doc-item { border-color: #2a5d77; background: #123246; }
        body.dark-mode .img-placeholder {
          border-color: #2a5d77;
          background: linear-gradient(145deg, #1d425a, #123247);
          color: #cde2f3;
        }
      `}</style>
    </main>
  );
};

export default DossierVoirMedecin;