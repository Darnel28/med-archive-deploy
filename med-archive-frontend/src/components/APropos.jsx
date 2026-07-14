import about from "../assets/img/about.png";
import about1 from "../assets/img/gallery/about1.png";
import about2 from "../assets/img/gallery/about2.png";
import about4 from "../assets/img/about4.png";
import "../assets/css/aboutaccueil.css";
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


            <section >

                <div className="container">

                 

                    <div className="about-title">

                        <span className="about-badge">
                            A propos de MedArchive
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



                 

                    <div className="about-block">

                        <div className="row align-items-center">

                            <div className="col-lg-6">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt=""
                                    />

                                    {/* <div className="floating-card card-one">

                                        <h5>+15</h5>

                                        <span>
                                            Hôpitaux connectés
                                        </span>

                                    </div> */}

                                    {/* <div className="floating-card card-two">

                                        <h5>9000+</h5>

                                        <span>
                                            Dossiers suivis
                                        </span>

                                    </div> */}

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

                                    {/* <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        Découvrir
                                    </a> */}

                                </div>

                            </div>

                        </div>

                    </div>



                    <div className="about-block reverse">

                        <div className="row align-items-center">

                            <div className="col-lg-6 order-lg-2">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt=""
                                    />

                                    {/* <div className="floating-card card-three">

                                        🔒
                                        <br />
                                        Données
                                        sécurisées

                                    </div> */}

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

                                    {/* <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        En savoir plus
                                    </a> */}

                                </div>

                            </div>

                        </div>

                    </div>
                  

                    <div className="about-block">

                        <div className="row align-items-center">

                            <div className="col-lg-6">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt="Historique médical"
                                    />

                                    {/* <div className="floating-card card-four">

                                        <h5>24h/24</h5>

                                        <span>
                                            Accès à votre dossier
                                        </span>

                                    </div> */}

                                </div>

                            </div>

                            <div className="col-lg-6">

                                <div className="about-content">

                                    <span className="number">
                                        / 03
                                    </span>

                                    <h3>
                                        Toute votre historique médical
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
{/* 
                                        <li>✔ Vaccinations</li> */}

                                        <li>✔ Ordonnances</li>

                                    </ul>

                                    {/* <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        Découvrir
                                    </a> */}

                                </div>

                            </div>

                        </div>

                    </div>





                 

                    <section className="stats-section">

                        <div className="row">

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>100 %</h2>

                                    <span>
                                      Sécurisées
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>24h/24</h2>

                                    <span>
                                       Disponible
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>Historique </h2>

                                    <span>
                                    Complet
                                    </span>

                                </div>

                            </div>

                            <div className="col-lg-3 col-md-6">

                                <div className="stat-card">

                                    <h2>99.9%</h2>

                                    <span>
                                       Fiable
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>





                  

                   <section className="why-medarchive">
                    

    <div className="about-block reverse">

                        <div className="row align-items-center">

                            <div className="col-lg-6 order-lg-2">

                                <div className="about-image">

                                    <img
                                        src={about4}
                                        alt=""
                                    />

                                    {/* <div className="floating-card card-three">

                                        🔒
                                        <br />
                                        Données
                                        sécurisées

                                    </div> */}

                                </div>

                            </div>



                            <div className="col-lg-6 order-lg-1">

                                <div className="about-content">

                                    <span className="number">
                                        / 04
                                    </span>

                                    <h3>

                                    Un suivi médical continu

                                    </h3>

                                    <p>

                                     Quel que soit l'établissement de santé consulté, votre historique médical reste disponible. Les professionnels de santé disposent des informations nécessaires pour assurer un suivi cohérent tout au long de votre parcours de soins.
                                    </p>

                                    <ul>

                                        <li>
                                            ✔ Continuité des soins
                                        </li>

                                        <li>
                                            ✔ Historique toujours disponible
                                        </li>

                                        <li>
                                            ✔ Réduction des examens répétitifs
                                        </li>

                                        {/* <li>
                                            ✔ Chiffrement des données
                                        </li> */}

                                    </ul>

                                    {/* <a
                                        href="#"
                                        className="about-btn-modern"
                                    >
                                        En savoir plus
                                    </a> */}

                                </div>

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