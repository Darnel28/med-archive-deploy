import about1 from "../assets/img/gallery/about1.png";
import about2 from "../assets/img/gallery/about2.png";
import consultation from "../assets/img/consultation.jpg";
import medecin from "../assets/img/medecin.jpg";
import labo from "../assets/img/labo.jpg";
import numerique from "../assets/img/numerique.jpg";
import phone from "../assets/img/phone.jpg";
import document from "../assets/img/document.jpg";
import about4 from "../assets/img/about4.png";
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
                        <div className="diamond-gallery">

                            <div className="diamond">
                                {/* <img src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800" alt="" /> */}
                                <img src={document} alt="" />
                            </div>

                            <div className="diamond">
                                {/* <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800" alt="" /> */}
                                <img src={about4} alt="" />
                            </div>

                            <div className="diamond">
                                {/* <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800" alt="" /> */}
                                <img src={labo} alt="" />
                            </div>

                                                <div className="diamond badge">
                                <span>
                                    +5000
                                    <small>Dossiers<br />Médicaux</small>
                                </span>
                            </div>

                            <div className="diamond">
                                {/* <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800" alt="" /> */}
                                <img src={medecin} alt="" />
                            </div>

                            <div className="diamond">
                                {/* <img src="https://images.unsplash.com/photo-1494526585095-c41746248156?w=800" alt="" /> */}
                                <img src={phone} alt="" />
                            </div>

       

                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}

export default About;