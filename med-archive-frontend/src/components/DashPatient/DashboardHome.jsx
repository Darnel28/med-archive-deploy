import React from 'react';
import { Link } from 'react-router-dom';
import telecharger1 from "../../assets/img/télécharger (1).jpeg";

const DashboardHome = () => {
    return (
        <>
            <section className="patient-overview-card">
                <img src={telecharger1} alt="Illustration patient" />
                <div className="patient-overview-content">
                    <h2>Bonjour John Doe</h2>
                    <div className="patient-index-grid">
                        <div><span>Sexe</span><strong>Homme</strong></div>
                        <div><span>Age</span><strong>19 ans</strong></div>
                        <div><span>Taille</span><strong>168 cm</strong></div>
                        <div><span>Poids</span><strong>52 kg</strong></div>
                        <div><span>Groupe sanguin</span><strong>B+</strong></div>
                        <div><span>IMU</span><strong>BJ-24P-001</strong></div>
                    </div>
                </div>
            </section>

            <section className="patient-bottom-grid">
                <article className="patient-card upcoming-encounters-card">
                    <h3>Consultations a venir</h3>
                    <div className="encounters-surface">
                        <div className="encounters-date-block">
                            <strong>23 novembre 2026</strong>
                            <span>Aujourd'hui</span>
                        </div>

                        <div className="encounter-highlight">
                            <h4>Consultation dermatologique</h4>
                            <div className="encounter-meta">
                                <p><i className="fa-regular fa-calendar"></i> 23 nov. 2026 - 18:30</p>
                                <p>CNHU Cotonou, batiment B, salle 24</p>
                            </div>
                        </div>

                        <ul className="encounters-notes">
                            <li><i className="fa-solid fa-capsules"></i>N'oubliez pas votre prise de Nasonex Aerosol aujourd'hui.</li>
                            <li><i className="fa-regular fa-circle-check"></i>Vaccin antitetanique a renouveler: planifiez un rendez-vous.</li>
                        </ul>

                        {/* Utilisation de Link au lieu de <a> */}
                        <Link to="/espacepatient/consultations" className="patient-compact-btn">
                            Voir toutes les consultations
                        </Link>
                    </div>

                    <div className="calendar-surface">
                        <div className="calendar-head">
                            <button type="button" aria-label="Mois précédent"><i className="fa-solid fa-chevron-left"></i></button>
                            <strong>Novembre 2026</strong>
                            <button type="button" aria-label="Mois suivant"><i className="fa-solid fa-chevron-right"></i></button>
                        </div>
                        <div className="calendar-grid weekdays">
                            <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                        </div>
                        <div className="calendar-grid days">
                            <span className="mute">26</span><span className="mute">27</span><span className="mute">28</span><span className="mute">29</span>
                            <span className="mute">30</span><span>1</span><span>2</span>
                            <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
                            <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span>
                            <span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span className="active-day">23</span>
                            <span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
                        </div>
                    </div>
                </article>

                <aside className="patient-card diagnosis-panel">
                    <h3>Diagnostic actuel</h3>
                    <div className="diagnosis-surface">
                        <div className="diagnosis-head">
                            <h4>Sinusite</h4>
                            <span>11 oct. 2026</span>
                        </div>
                        <p>Inflammation des sinus avec gene respiratoire legere, en cours de suivi dans votre dossier medical Med-Archive.</p>

                        <div className="doctor-row">
                            <span>Medecin referent</span>
                            <div>
                                <img src="https://i.pravatar.cc/40?img=21" alt="Medecin" />
                                <strong>Dr. Sarah Simpson</strong>
                            </div>
                        </div>

                        <div className="receipt-row">
                            <span>Ordonnance active</span>
                            <div>
                                <strong>Nasonex Aerosol</strong>
                                <p>3 a 4 prises par jour pendant 7 jours en cas de gene respiratoire.</p>
                            </div>
                        </div>

                        {/* Utilisation de Link au lieu de <a> */}
                        <Link to="/espacepatient/dossier-medical" className="patient-compact-btn">
                            Ouvrir le dossier medical
                        </Link>
                    </div>
                </aside>
            </section>
        </>
    );
};

export default DashboardHome;