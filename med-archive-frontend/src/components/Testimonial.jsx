import React from "react";
import beninMap from "../assets/img/beninMap.png";
import beninMap2 from "../assets/img/beninMap2.png";
import medecin from "../assets/img/medecin.jpg";
// import doctor1 from "../assets/img/avatar1.jpg";
// import doctor2 from "../assets/img/avatar2.jpg";
// import doctor3 from "../assets/img/avatar3.jpg";
// import doctor4 from "../assets/img/avatar4.jpg";

function Testimonial() {
    return (
        <section className="network-section">

            <div className="container">

                <div className="row align-items-center">

                    {/* LEFT */}

                    <div className="col-lg-5">

                        {/* <span className="network-subtitle">
                            Réseau National
                        </span>

                        <h2 className="network-title">
                            MedArchive est présent dans tout le Bénin
                        </h2>

                        <p className="network-text">
                            Grâce à MedArchive, votre dossier médical vous accompagne
                            dans les établissements partenaires partout au Bénin.
                            Les médecins autorisés peuvent consulter votre historique
                            en quelques secondes afin d'améliorer votre prise en charge.
                        </p> */}

                        {/* <div className="network-card">

                            <div className="network-icon">
                                <i className="ti-files"></i>
                            </div>

                            <div>

                                <h4>Dossier médical unique</h4>

                                <p>
                                    Toutes vos consultations, examens,
                                    ordonnances et analyses regroupés
                                    au même endroit.
                                </p>

                            </div>

                        </div> */}

                        <div className="network-card">

                            <div className="network-icon">
                                <i className="ti-lock"></i>
                            </div>

                            <div>

                                <h4>Données sécurisées</h4>

                                <p>
                                    Seuls les professionnels autorisés
                                    peuvent accéder à vos informations.
                                </p>

                            </div>

                        </div>

                        <div className="network-card">

                            <div className="network-icon">
                                <i className="ti-heart"></i>
                            </div>

                            <div>

                                <h4>Prise en charge rapide</h4>

                                <p>
                                    Les médecins retrouvent immédiatement
                                    vos antécédents médicaux.
                                </p>

                            </div>

                        </div>

                        <div className="network-card">

                            <div className="network-icon">
                                <i className="ti-world"></i>
                            </div>

                            <div>

                                <h4>Disponible partout</h4>

                                <p>
                                    Hôpitaux, cliniques et laboratoires
                                    connectés au même réseau.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="col-lg-7">

                        <div className="network-map">

                            {/* Carte */}

                            <img
                                src={beninMap2}
                                className="benin-map"
                                alt="Carte du Bénin"
                            />

                            {/* Points */}

                            <span className="map-dot dot1"></span>
                            <span className="map-dot dot2"></span>
                            <span className="map-dot dot3"></span>
                            <span className="map-dot dot4"></span>
                            <span className="map-dot dot5"></span>
                            <span className="map-dot dot6"></span>
                            <span className="map-dot dot7"></span>
                            {/* <span className="map-dot dot8"></span> */}

                            {/* Avatars */}

                            <div className="avatar avatar1">
                                <img src={medecin} alt="" />
                            </div>

                            <div className="avatar avatar2">
                                <img src={medecin} alt="" />
                            </div>

                            <div className="avatar avatar3">
                                <img src={medecin} alt="" />
                            </div>

                            <div className="avatar avatar4">
                                <img src={medecin} alt="" />
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Testimonial;