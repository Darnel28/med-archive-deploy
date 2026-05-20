import React, { useState } from 'react';

import '../../assets/css/DossierDuPatient.css';

const DossierVoirMedecin = () => {
    const [activeFilter, setActiveFilter] = useState('date');
    const [activeTab, setActiveTab] = useState('historique');

    return (
        <main className="content page-tight">
            <nav className="ddp-top-tabs" aria-label="Navigation dossier">
                <button
                    className={`ddp-tab ${activeTab === 'historique' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab('historique')}
                >
                    Historique medical
                </button>
                <button
                    className={`ddp-tab ${activeTab === 'analyses' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab('analyses')}
                >
                    Resultats d'analyses
                </button>
                <button
                    className={`ddp-tab ${activeTab === 'ordonnances' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab('ordonnances')}
                >
                    Ordonnances <i className="fa-solid fa-chevron-down ddp-tab-caret"></i>
                </button>
                <button
                    className={`ddp-tab ${activeTab === 'documents' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab('documents')}
                >
                    Documents
                </button>
                <button
                    className={`ddp-tab ${activeTab === 'hospitalisation' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setActiveTab('hospitalisation')}
                >
                    Hospitalisation
                </button>
            </nav>

            <section className="ddp-board">
                <aside className="ddp-aside" aria-label="Resume patient">
                    <img className="ddp-photo"
                        src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=480&q=80"
                        alt="Portrait patient" />

                    <div className="ddp-patient-id">
                        <h2>Marie Lefevre</h2>
                        <span>IMU: MA-24-5108</span>
                    </div>

                    <ul className="ddp-facts">
                        <li><i className="fa-regular fa-calendar"></i> 14/03/1950</li>
                        <li><i className="fa-solid fa-phone"></i> +229 00 00 00 00</li>
                        <li><i className="fa-solid fa-droplet"></i> O+ | 163 cm | 78 kg</li>
                        <li><i className="fa-solid fa-house"></i> Zogbo, Benin Rue 123</li>
                        <li><i className="fa-solid fa-user-doctor"></i> Medecin referent: Dr Jean Martin</li>
                    </ul>

                    <section className="ddp-aside-block" aria-label="Allergies principales">
                        <div className="ddp-aside-head">
                            <h3>Allergies</h3>
                            <a href="#">Voir tout</a>
                        </div>

                        <article className="ddp-info-item">
                            <strong><i className="fa-solid fa-circle ddp-dot-danger"></i> Penicilline</strong>
                            <span>Reponse severe observee en 2024</span>
                        </article>

                        <article className="ddp-info-item">
                            <strong><i className="fa-solid fa-circle ddp-dot-warning"></i> Ibuprofene</strong>
                            <span>Reaction moderee, surveillance recommandee</span>
                        </article>
                    </section>
                    <section className="ddp-aside-block">
                        <div className="ddp-aside-head">
                            <h3>Antécédents</h3>
                        </div>

                        <div className="ddp-info-item">
                            <strong><i className="fa-solid fa-circle ddp-dot-danger"></i> Hypertension</strong>
                            <span>Diagnostiquée en 2018 - traitement en cours</span>
                        </div>

                        <div className="ddp-info-item">
                            <strong><i className="fa-solid fa-circle ddp-dot-warning"></i> Diabète type 2</strong>
                            <span>Suivi régulier - régime contrôlé</span>
                        </div>
                    </section>
                    <section className="ddp-aside-block">
                        <div className="ddp-aside-head">
                            <h3>Traitements</h3>
                        </div>

                        <div className="ddp-info-item">
                            <strong><i className="fa-solid fa-circle ddp-dot-info"></i> Metformine 500mg</strong>
                            <span>2 fois par jour</span>
                        </div>

                        <div className="ddp-info-item">
                            <strong><i className="fa-solid fa-circle ddp-dot-teal"></i> Amlodipine 10mg</strong>
                            <span>1 fois par jour</span>
                        </div>
                    </section>

                    <section className="ddp-aside-block" aria-label="Derniers resultats">
                        <div className="ddp-aside-head">
                            <h3>Derniers resultats</h3>
                        </div>

                        <article className="ddp-result-item">
                            <label><span>Cholesterol total</span><strong>2.15 g/L</strong></label>
                            <div className="ddp-result-track"><span className="ddp-result-fill warn" style={{ width: '68%' }}></span></div>
                        </article>

                        <article className="ddp-result-item">
                            <label><span>Creatinine</span><strong>12 mg/L</strong></label>
                            <div className="ddp-result-track"><span className="ddp-result-fill alert" style={{ width: '82%' }}></span></div>
                        </article>

                        <article className="ddp-result-item">
                            <label><span>Glucose a jeun</span><strong>0.98 g/L</strong></label>
                            <div className="ddp-result-track"><span className="ddp-result-fill" style={{ width: '48%' }}></span></div>
                        </article>
                    </section>
                </aside>

                {activeTab === 'historique' && (
                    <section className="ddp-history-shell" aria-label="Historique medical">
                        <header className="ddp-history-toolbar ddp-analyses-toolbar">
                            <h1>Historique medical</h1>
                            <div className="ddp-history-filters">
                                <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
                            </div>
                        </header>

                        <div className="ddp-history-scale" aria-label="Echelle chronologique">
                            <div className="ddp-scale-bars">
                                <span style={{ height: '11px' }}></span><span style={{ height: '18px' }}></span><span
                                    style={{ height: '8px' }}></span><span style={{ height: '25px' }}></span><span
                                        style={{ height: '13px' }}></span><span style={{ height: '22px' }}></span><span
                                            style={{ height: '9px' }}></span><span style={{ height: '15px' }}></span><span
                                                style={{ height: '7px' }}></span><span style={{ height: '19px' }}></span><span
                                                    style={{ height: '10px' }}></span><span style={{ height: '16px' }}></span><span
                                                        style={{ height: '23px' }}></span><span style={{ height: '14px' }}></span><span
                                                            style={{ height: '12px' }}></span><span style={{ height: '9px' }}></span><span
                                                                style={{ height: '20px' }}></span><span style={{ height: '6px' }}></span><span
                                                                    style={{ height: '18px' }}></span><span style={{ height: '13px' }}></span>
                            </div>
                            <div className="ddp-scale-steps">
                                <span>15</span>
                                <span>1M</span>
                                <span>3M</span>
                                <span>6M</span>
                                <span>1A</span>
                            </div>
                            <div className="ddp-scale-date">27/10/2024 - 27/04/2026</div>
                        </div>

                        <div className="ddp-timeline">
                            <section className="ddp-year-group">
                                <div className="ddp-year-label">2026</div>
                                <div className="ddp-year-track">
                                    <span className="ddp-year-node" aria-hidden="true"></span>
                                    <div className="ddp-annual-ribbon"><i className="fa-regular fa-file-lines"></i> Voir rapport annuel
                                    </div>
                                    <article className="ddp-history-event">
                                        <span className="ddp-event-day">Lundi</span>
                                        <h4>Consultation generale</h4>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Jean Martin</p>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Hopital Saint-Antoine,
                                            Paris</p>
                                    </article>
                                    <article className="ddp-history-event">
                                        <span className="ddp-event-day">Jeudi</span>
                                        <h4>Controle d'asthme</h4>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Bernard Simon</p>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Clinique du Marais,
                                            Paris</p>
                                    </article>
                                </div>
                            </section>

                            <section className="ddp-year-group">
                                <div className="ddp-year-label">2025</div>
                                <div className="ddp-year-track">
                                    <span className="ddp-year-node" aria-hidden="true"></span>
                                    <div className="ddp-annual-ribbon"><i className="fa-regular fa-file-lines"></i> Voir rapport annuel
                                    </div>
                                    <article className="ddp-history-event">
                                        <span className="ddp-event-day">Mardi</span>
                                        <h4>Vaccin contre la grippe</h4>
                                        <p className="ddp-history-meta"><i className="fa-regular fa-calendar"></i> 31 Aout 2025</p>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-location-dot"></i> Cabinet D-attrinand
                                            Simorkina, Paris</p>
                                    </article>
                                    <article className="ddp-history-event">
                                        <span className="ddp-event-day">Mars</span>
                                        <h4>Chirurgie de la vesicule biliaire</h4>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Bernard Durnad
                                        </p>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Hopital Bichat Claude
                                            Bernard, Paris</p>
                                    </article>
                                </div>
                            </section>

                            <section className="ddp-year-group">
                                <div className="ddp-year-label">2024</div>
                                <div className="ddp-year-track">
                                    <span className="ddp-year-node" aria-hidden="true"></span>
                                    <div className="ddp-annual-ribbon"><i className="fa-regular fa-file-lines"></i> Voir rapport annuel
                                    </div>
                                    <article className="ddp-history-event">
                                        <span className="ddp-event-day">Jeudi</span>
                                        <h4>Consultation de suivi cardiaque</h4>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Jean Martin</p>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Institut Med Archive,
                                            antenne Cotonou</p>
                                    </article>
                                    <article className="ddp-history-event">
                                        <span className="ddp-event-day">Avril</span>
                                        <h4>Controle d'asthme chronique</h4>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> Dr Bernard Simon</p>
                                        <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> Hopital Saint-Antoine,
                                            Paris</p>
                                    </article>
                                </div>
                            </section>
                        </div>
                    </section>
                )}

                {activeTab === 'analyses' && (
                    <section className="ddp-history-shell ddp-analyses-shell" aria-label="Resultats d'analyses">
                        <header className="ddp-history-toolbar ddp-analyses-toolbar">
                            <h1>Resultats d'analyses</h1>
                            <div className="ddp-history-filters">
                                <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
                            </div>
                        </header>
                        <section className="ddp-analyses-card" aria-label="Tableau des resultats d'analyses">
                            <div className="ddp-analyses-card-head">
                                {/* <h3>Resultats d'analyses</h3> */}
                                {/* <a href="#">Voir tous les examens</a> */}
                            </div>
                            <div className="ddp-analyses-table-wrap">
                                <table className="ddp-analyses-table">
                                    <thead>
                                        <tr>
                                            <th>DATE</th>
                                            <th>EXAMEN</th>
                                            <th>VALEUR</th>
                                            <th>STATUT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>21/03/2026</td>
                                            <td>Hemoglobine glyquee (HbA1c)</td>
                                            <td>6.8%</td>
                                            <td><span className="ddp-status ddp-status-watch">A surveiller</span></td>
                                        </tr>
                                        <tr>
                                            <td>18/03/2026</td>
                                            <td>Creatinine</td>
                                            <td>12 mg/L</td>
                                            <td><span className="ddp-status ddp-status-alert">Eleve</span></td>
                                        </tr>
                                        <tr>
                                            <td>12/03/2026</td>
                                            <td>Glycemie a jeun</td>
                                            <td>0.98 g/L</td>
                                            <td><span className="ddp-status ddp-status-ok">Normal</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </section>
                )}

                {activeTab === 'ordonnances' && (
                    <section className="ddp-history-shell ddp-ord-shell" aria-label="Ordonnances">
                        <header className="ddp-history-toolbar ddp-analyses-toolbar">
                            <h1>Ordonnances</h1>
                            <div className="ddp-history-filters">
                                <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
                            </div>
                        </header>
                        <section className="ddp-ord-card" aria-label="Tableau des ordonnances">
                            <div className="ddp-ord-card-head">
                                {/* <h3>Liste Ordonnances </h3> */}
                                <a href="#">Nouvelle ordonnance</a>
                            </div>
                            <div className="ddp-ord-table-wrap">
                                <table className="ddp-ord-table">
                                    <thead>
                                        <tr>
                                            <th>PRESCRIPTION</th>
                                            <th>POSOLOGIE</th>
                                            <th>DUREE</th>
                                            <th>PRESCRIPTEUR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Metformine 500mg</td>
                                            <td>2 fois par jour</td>
                                            <td>90 jours</td>
                                            <td>Dr Jean Martin</td>
                                        </tr>
                                        <tr>
                                            <td>Amlodipine 10mg</td>
                                            <td>1 fois par jour</td>
                                            <td>60 jours</td>
                                            <td>Dr Bernard Simon</td>
                                        </tr>
                                        <tr>
                                            <td>Atorvastatine 20mg</td>
                                            <td>Le soir apres repas</td>
                                            <td>30 jours</td>
                                            <td>Dr Jean Martin</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </section>
                )}

                {activeTab === 'documents' && (
                    <section className="ddp-history-shell ddp-doc-shell" aria-label="Documents patient">
                        <header className="ddp-history-toolbar ddp-analyses-toolbar">
                            <h1>Documents medicaux</h1>
                            <div className="ddp-history-filters">
                                <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
                            </div>
                        </header>
                        <section className="ddp-doc-section" aria-label="Grille des documents">
                            <div className="ddp-doc-section-head">
                                {/* <h3>Documents medicaux</h3> */}
                                {/* <a href="#">Bibliotheque Med Archive</a> */}
                            </div>
                            <div className="ddp-doc-grid">
                                <article className="ddp-doc-card">
                                    <h4>Compte rendu cardiologie</h4>
                                    <p>PDF · 1.2 Mo · 19/03/2026</p>
                                </article>
                                <article className="ddp-doc-card">
                                    <h4>Bilan biologique trimestriel</h4>
                                    <p>PDF · 0.8 Mo · 18/03/2026</p>
                                </article>
                                <article className="ddp-doc-card">
                                    <h4>Ordonnance scannee</h4>
                                    <p>JPEG · 0.6 Mo · 12/03/2026</p>
                                </article>
                                <article className="ddp-doc-card">
                                    <h4>Echo cardiaque</h4>
                                    <p>PNG · 2.4 Mo · 10/03/2026</p>
                                </article>
                                <article className="ddp-doc-card">
                                    <h4>Fiche de suivi diabetologique</h4>
                                    <p>PDF · 0.5 Mo · 02/03/2026</p>
                                </article>
                                <article className="ddp-doc-card">
                                    <h4>Consentement numerise</h4>
                                    <p>PDF · 0.3 Mo · 27/02/2026</p>
                                </article>
                            </div>
                        </section>
                    </section>
                )}

                {activeTab === 'hospitalisation' && (
                    <section className="ddp-history-shell ddp-hosp-shell" aria-label="Hospitalisations">
                        <header className="ddp-history-toolbar ddp-analyses-toolbar">
                            <h1>Hospitalisations</h1>
                            <div className="ddp-history-filters">
                                <button className={`ddp-filter-chip ${activeFilter === 'date' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('date')}>Par date</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'condition' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('condition')}>Par condition</button>
                                <button className={`ddp-filter-chip ${activeFilter === 'type' ? 'active' : ''}`} type="button" onClick={() => setActiveFilter('type')}>Par type</button>
                            </div>
                        </header>
                        <div className="ddp-timeline">
                            <article className="ddp-history-event">
                                <h4>Hospitalisation cardiologie</h4>
                                <p className="ddp-history-meta">Hopital Saint-Antoine - 08/04/2026 - 12 jours</p>
                            </article>
                            <article className="ddp-history-event">
                                <h4>Hospitalisation diabetologie</h4>
                                <p className="ddp-history-meta">Clinique du Marais - 22/02/2026 - 5 jours</p>
                            </article>
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
};

export default DossierVoirMedecin;