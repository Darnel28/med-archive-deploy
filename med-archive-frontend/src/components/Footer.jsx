import logo from "../assets/img/logo/logo.png";
import contact_form from "../assets/img/gallery/contact_form.png"

function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function Footer() {
    return (
        <footer className="med-footer">
            <div className="container">
                <div className="footer-wrap">
                    <div className="newsletter-card">
                        <div className="newsletter-illustration">
                            <img src={contact_form} alt="Newsletter MedArchive" />
                        </div>
                        <div className="newsletter-content">
                            <h3>Restez informé sur votre santé numérique</h3>
                            <p>Recevez les nouveautés MedArchive, conseils pratiques et mises à jour de sécurité.</p>
                            <form className="newsletter-form" action="#" method="post">
                                <input type="email" placeholder="Votre adresse e-mail" aria-label="Email" />
                                <button type="submit">S'abonner</button>
                            </form>
                        </div>
                    </div>

                    <div className="footer-main">
                        <div className="row">
                            <div className="col-lg-4 col-md-6 mb-4">
                                <div className="footer-brand">
                                    <img src={logo} alt="Logo MedArchive" />
                                    <p>Plateforme nationale de gestion de dossier médical sécurisé pour les patients et
                                        professionnels de santé au Bénin.</p>
                                    <div className="socials">
                                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a href="#"><i className="fab fa-twitter"></i></a>
                                        <a href="#"><i className="fab fa-linkedin-in"></i></a>
                                        <a href="#"><i className="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-2 col-md-6 mb-4">
                                <h4 className="footer-title">Plateforme</h4>
                                <ul>
                                    <li><a href="/about" onClick={(event) => { event.preventDefault(); navigate("/about"); }}>À propos</a></li>
                                    <li><a href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>Services</a></li>
                                    <li><a href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>Professionnels</a></li>
                                    <li><a href="/contact" onClick={(event) => { event.preventDefault(); navigate("/contact"); }}>Support</a></li>
                                </ul>
                            </div>

                            <div className="col-lg-3 col-md-6 mb-4">
                                <h4 className="footer-title">Liens utiles</h4>
                                <ul>
                                    <li><a href="#">Créer mon dossier</a></li>
                                    <li><a href="#">Accès d'urgence</a></li>
                                    <li><a href="#">Confidentialité</a></li>
                                    <li><a href="#">Conditions d'utilisation</a></li>
                                </ul>
                            </div>

                            <div className="col-lg-3 col-md-6 mb-4">
                                <h4 className="footer-title">Contact</h4>
                                <p className="contact-item"><i className="fas fa-phone-alt"></i> +229 01 00 00 00 00</p>
                                <p className="contact-item"><i className="fas fa-envelope"></i> contact@medarchive.bj</p>
                                <p className="contact-item"><i className="fas fa-map-marker-alt"></i> Cotonou, Bénin</p>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2026 MedArchive. Tous droits réservés.</p>
                        <div className="links">
                            <a href="#">Politique de confidentialité</a>
                            <a href="#">Mentions légales</a>
                            <a href="#">Plan du site</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

