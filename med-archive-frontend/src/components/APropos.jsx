import about1 from "../assets/img/gallery/about1.png";
import about2 from "../assets/img/gallery/about2.png";

function APropos() {
    return (
        <>
            <div className="slider-area2 about-cover">
                <div className="slider-height2 d-flex align-items-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="hero-cap hero-cap2 text-center">
                                    <h2>A propos</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="about-modern">
                <div className="container about-modern-content">
                    <div className="about-modern-intro text-center mb-30">
                        <h2>Une plateforme santé moderne, fiable et pensée pour tous.</h2>
                        <p>
                            Nous aidons patients et soignants à centraliser les informations médicales essentielles, suivre
                            les traitements et collaborer en toute sécurité.
                        </p>
                    </div>

                    <div className="about-modern-card about-feature-card mb-30">
                        <div className="row align-items-center">
                            <div className="col-lg-6 order-lg-2">
                                <div className="about-modern-card-image">
                                    <img src={about1} alt="Aperçu de la plateforme MedArchive" />
                                </div>
                            </div>
                            <div className="col-lg-6 order-lg-1">
                                <div className="about-modern-card-content">
                                    <h3>Prenez le contrôle de votre dossier médical</h3>
                                    <p>
                                        Centralisez vos consultations, résultats d'analyses, ordonnances et antécédents pour
                                        un meilleur suivi partout au Bénin.
                                    </p>
                                    <ul>
                                        <li>Consultation rapide de l'historique médical</li>
                                        <li>Partage sécurisé avec les médecins habilités</li>
                                        <li>Accès d'urgence aux informations vitales</li>
                                    </ul>
                                    <a href="#" className="btn about-btn2">
                                        Voir les fonctionnalités <i className="ti-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row about-stats-row mb-30">
                        <div className="col-lg-3 col-sm-6 mb-30">
                            <div className="about-stat-card">
                                <span className="about-stat-value">8,452+</span>
                                <p>Dossiers suivis</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 mb-30">
                            <div className="about-stat-card">
                                <span className="about-stat-value">100%</span>
                                <p>Données chiffrées</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 mb-30">
                            <div className="about-stat-card stat-highlight">
                                <span className="about-stat-value">1,658+</span>
                                <p>Patients actifs</p>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6 mb-30">
                            <div className="about-stat-card">
                                <span className="about-stat-value">150+</span>
                                <p>Professionnels</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-modern-card about-feature-card mb-30">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="about-modern-card-image">
                                    <img src={about2} alt="Suivi mobile MedArchive" />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="about-modern-card-content">
                                    <h3>Une expérience simple sur mobile</h3>
                                    <p>
                                        Retrouvez votre dossier où que vous soyez, avec une navigation claire pour les
                                        patients comme pour les soignants.
                                    </p>
                                    <ul>
                                        <li>Indicateurs personnalisés</li>
                                        <li>Rappels de rendez-vous et traitements</li>
                                        <li>Historique des examens et comptes rendus</li>
                                    </ul>
                                    <a href="#" className="btn about-btn consulter-btn">
                                        Créer mon dossier <i className="ti-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="about-service-showcase mb-30">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="about-service-showcase-content">
                                    <span className="about-modern-kicker">Nos services</span>
                                    <h3>Un service complet pensé pour vous</h3>
                                    <p>
                                        Profitez d'un accompagnement digital de bout en bout pour mieux suivre votre santé.
                                    </p>
                                    <ul>
                                        <li>Accès simple à votre historique médical</li>
                                        <li>Alertes intelligentes pour rendez-vous et traitements</li>
                                        <li>Coordination fluide entre patients et soignants</li>
                                    </ul>
                                    <a href="#" className="btn about-btn2">
                                        Voir nos services <i className="ti-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="about-service-showcase-image">
                                    <img src={about2} alt="Illustration des services MedArchive" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="about-team-highlight">
                        <div className="row">
                            <div className="col-12 mb-30">
                                <div className="about-team-intro text-center">
                                    <span className="about-modern-kicker">Qui peut utiliser MedArchive ?</span>
                                    <h3 className="about-team-title">Tous les patients et professionnels de santé</h3>
                                    <p>
                                        MedArchive est accessible à tous les patients et professionnels de santé, qu'ils
                                        soient dans un cadre hospitalier ou à domicile.
                                    </p>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="row about-team-grid">
                                    <div className="col-lg-3 col-sm-6 mb-20">
                                        <div className="about-team-card">
                                            <div className="about-team-card-img">
                                                <img src={about2} alt="Dr. Alexandre John" />
                                            </div>
                                            <div className="about-team-card-caption">
                                                <h4>Dr. Alexandre John</h4>
                                                <p>Cardiologue</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 mb-20">
                                        <div className="about-team-card">
                                            <div className="about-team-card-img">
                                                <img src={about2} alt="Dr. Maria Thomson" />
                                            </div>
                                            <div className="about-team-card-caption">
                                                <h4>Dr. Maria Thomson</h4>
                                                <p>Médecin interniste</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 mb-20 mb-sm-0">
                                        <div className="about-team-card">
                                            <div className="about-team-card-img">
                                                <img src={about1} alt="Dr. Samuel Koffi" />
                                            </div>
                                            <div className="about-team-card-caption">
                                                <h4>Dr. Samuel Koffi</h4>
                                                <p>Pédiatre</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-sm-6">
                                        <div className="about-team-card">
                                            <div className="about-team-card-img">
                                                <img src={about2} alt="Dr. Anita Mensah" />
                                            </div>
                                            <div className="about-team-card-caption">
                                                <h4>Dr. Anita Mensah</h4>
                                                <p>Radiologue</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}


export default APropos;