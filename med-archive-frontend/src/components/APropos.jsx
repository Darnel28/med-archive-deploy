import about from "../assets/img/about.png";
import about1 from "../assets/img/gallery/about1.png";
import about2 from "../assets/img/gallery/about2.png";
import about4 from "../assets/img/about4.png";
import "../assets/css/aboutaccueil.css";
function APropos() {
    return (
        <>

            {/* HERO */}
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


            <section className="about-v2">

                <div className="container">

                    {/* INTRO */}

                    <div className="about-title">

                        <span className="about-badge">
                            Bienvenue sur MedArchive
                        </span>

                        <h2>
                            Une plateforme moderne
                            qui révolutionne
                            la gestion des dossiers
                            médicaux au Bénin.
                        </h2>

                        <p>
                            MedArchive permet aux patients,
                            médecins et établissements
                            de santé de collaborer
                            autour d'un dossier médical
                            numérique sécurisé,
                            disponible partout et à tout moment.
                        </p>

                    </div>



                    {/* ========================== */}

                    {/* SECTION 01 */}

                    <div className="about-block">

                        <div className="row align-items-center">

                            <div className="col-lg-6">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt=""
                                    />

                                    <div className="floating-card card-one">

                                        <h5>+15</h5>

                                        <span>
                                            Hôpitaux connectés
                                        </span>

                                    </div>

                                    <div className="floating-card card-two">

                                        <h5>9000+</h5>

                                        <span>
                                            Dossiers suivis
                                        </span>

                                    </div>

                                </div>

                            </div>



                            <div className="col-lg-6">

                                <div className="about-content">

                                    <span className="number">
                                        / 01
                                    </span>

                                    <h3>

                                        Votre dossier médical
                                        toujours disponible

                                    </h3>

                                    <p>

                                        Retrouvez vos
                                        consultations,
                                        examens,
                                        analyses,
                                        ordonnances
                                        et antécédents
                                        depuis une seule
                                        plateforme.

                                    </p>

                                    <ul>

                                        <li>
                                            ✔ Historique complet
                                        </li>

                                        <li>
                                            ✔ Ordonnances numériques
                                        </li>

                                        <li>
                                            ✔ Analyses accessibles
                                        </li>

                                        <li>
                                            ✔ Données sécurisées
                                        </li>

                                    </ul>

                                    <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        Découvrir
                                    </a>

                                </div>

                            </div>

                        </div>

                    </div>





                    {/* ========================== */}

                    {/* SECTION 02 */}

                    <div className="about-block reverse">

                        <div className="row align-items-center">

                            <div className="col-lg-6 order-lg-2">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt=""
                                    />

                                    <div className="floating-card card-three">

                                        🔒
                                        <br />
                                        Données
                                        sécurisées

                                    </div>

                                </div>

                            </div>



                            <div className="col-lg-6 order-lg-1">

                                <div className="about-content">

                                    <span className="number">
                                        / 02
                                    </span>

                                    <h3>

                                        Partage sécurisé
                                        entre établissements
                                        de santé

                                    </h3>

                                    <p>

                                        Lorsqu'un patient est transféré,
                                        ses informations médicales
                                        sont accessibles uniquement
                                        aux professionnels autorisés,
                                        garantissant confidentialité
                                        et continuité des soins.

                                    </p>

                                    <ul>

                                        <li>
                                            ✔ Contrôle des accès
                                        </li>

                                        <li>
                                            ✔ Autorisations du patient
                                        </li>

                                        <li>
                                            ✔ Traçabilité complète
                                        </li>

                                        <li>
                                            ✔ Chiffrement des données
                                        </li>

                                    </ul>

                                    <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        En savoir plus
                                    </a>

                                </div>

                            </div>

                        </div>

                    </div>
                    {/* ========================== */}
                    {/* SECTION 03 */}

                    <div className="about-block">

                        <div className="row align-items-center">

                            <div className="col-lg-6">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt="Historique médical"
                                    />

                                    <div className="floating-card card-four">

                                        <h5>24h/24</h5>

                                        <span>
                                            Accès à votre dossier
                                        </span>

                                    </div>

                                </div>

                            </div>

                            <div className="col-lg-6">

                                <div className="about-content">

                                    <span className="number">
                                        / 03
                                    </span>

                                    <h3>
                                        Tout votre historique médical
                                        dans une seule plateforme
                                    </h3>

                                    <p>
                                        Toutes vos consultations,
                                        radiographies, scanners,
                                        IRM, analyses biologiques
                                        et ordonnances sont
                                        regroupés dans un seul
                                        espace sécurisé.
                                    </p>

                                    <ul>

                                        <li>✔ Consultations</li>

                                        <li>✔ Analyses médicales</li>

                                        <li>✔ Scanner & IRM</li>

                                        <li>✔ Radiologie</li>

                                        <li>✔ Vaccinations</li>

                                        <li>✔ Ordonnances</li>

                                    </ul>

                                    <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        Découvrir
                                    </a>

                                </div>

                            </div>

                        </div>

                    </div>





                    {/* ========================== */}
                    {/* STATISTIQUES */}

                    <section className="stats-section">

                        <div className="row">

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>15+</h2>

                                    <span>
                                        Hôpitaux partenaires
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>150+</h2>

                                    <span>
                                        Professionnels de santé
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>9000+</h2>

                                    <span>
                                        Patients enregistrés
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>99.9%</h2>

                                    <span>
                                        Disponibilité
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>





                    {/* ========================== */}
                    {/* POURQUOI MEDARCHIVE */}

                   <section className="why-medarchive">

    <div className="row align-items-center">

        {/* TEXTE A GAUCHE */}
        <div className="col-lg-6">

            <div className="why-content">

                <span className="about-badge">
                    Pourquoi MedArchive ?
                </span>

                <h2>
                    Une solution conçue
                    pour les patients,
                    les médecins
                    et les hôpitaux.
                </h2>

                <p>
                    MedArchive simplifie
                    la gestion du parcours
                    médical grâce
                    à une plateforme
                    intuitive, sécurisée
                    et accessible partout.
                </p>

                <div className="feature-list">

                    <div className="feature-item">

                        <div className="icon">
                            🔒
                        </div>

                        <div>

                            <h5>Sécurité maximale</h5>

                            <p>
                                Vos données sont chiffrées et protégées.
                            </p>

                        </div>

                    </div>

                    <div className="feature-item">

                        <div className="icon">
                            ⚡
                        </div>

                        <div>

                            <h5>Rapidité</h5>

                            <p>
                                Accédez à vos informations instantanément.
                            </p>

                        </div>

                    </div>

                    <div className="feature-item">

                        <div className="icon">
                            🏥
                        </div>

                        <div>

                            <h5>Collaboration</h5>

                            <p>
                                Tous les établissements travaillent sur les mêmes données.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        {/* IMAGE A DROITE */}
        <div className="col-lg-6">

            <div className="why-image">

                <img
                    src={about4}
                    alt="Pourquoi MedArchive"
                />

            </div>

        </div>

    </div>

</section>






                    {/* ========================== */}
                    {/* RESEAU */}

                    <section className="network-section">

                        <div className="text-center mb-5">

                            <span className="about-badge">

                                Notre réseau

                            </span>

                            <h2>

                                Un écosystème national
                                connecté

                            </h2>

                            <p>

                                Patients,
                                médecins,
                                laboratoires
                                et hôpitaux
                                collaborent
                                autour
                                d'un même
                                dossier médical.

                            </p>

                        </div>

                        <div className="row">

                            <div className="col-lg-3">

                                <div className="network-card">

                                    <h4>
                                        CNHU
                                    </h4>

                                    <span>
                                        3200 patients
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3">

                                <div className="network-card">

                                    <h4>
                                        CHUZ
                                    </h4>

                                    <span>
                                        2400 patients
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3">

                                <div className="network-card">

                                    <h4>
                                        Clinique Saint Luc
                                    </h4>

                                    <span>
                                        950 patients
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3">

                                <div className="network-card">

                                    <h4>
                                        Hôpital de Zone
                                    </h4>

                                    <span>
                                        1700 patients
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>

                </div>

            </section>

        </>

    );

}

export default APropos;