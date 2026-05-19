import about1 from "../assets/img/gallery/about1.png";
import about2 from "../assets/img/gallery/about2.png";

function About() {
    return (
        <section className="about-area section-padding2">

            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-md-10">
                        <div className="about-caption mb-50">

                            <div className="section-tittle section-tittle2 mb-35">
                                <span>À propos de la plateforme</span>
                                <h2 className="index-about-title">Bienvenu sur MedArchive</h2>
                            </div>
                            <p className="index-about-text">Med-Archive est le premier Réseau d'Historique Médical
                                Sécurisé au Bénin. Notre mission est de briser les barrières entre les hôpitaux publics
                                et les cliniques privées en unifiant votre parcours de soin.
                            </p>
                            <div className="about-btn1 mb-30">
                                <a href="about.html" className="btn about-action-btn">
                                    Consulter mon Historique<i className="ti-arrow-right"></i>
                                </a>
                            </div>
                            <div className="about-btn1 mb-30">
                                <a href="about.html" className="btn about-action-btn about-action-btn--secondary">
                                    Gérer mes Accès<i className="ti-arrow-right"></i>
                                </a>
                            </div>
                            <div className="about-btn1 mb-30">
                                <a href="about.html" className="btn about-action-btn about-action-btn--secondary">
                                    Fiche d'Urgence <i className="ti-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-12">

                        <div className="about-img ">
                            <div className="about-font-img d-none d-lg-block">
                                <img src={about2} alt="About 2" />
                            </div>
                            <div className="about-back-img ">
                                <img src={about1} alt="About 1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}

export default About;