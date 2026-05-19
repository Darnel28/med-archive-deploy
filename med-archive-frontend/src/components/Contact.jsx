function Contact() {
    return (
        <>
            <section className="contact-section contact-modern-section">
                <div className="container">
                    <div className="contact-modern-head text-center">
                        <h2>Contactez-nous</h2>
                        <p>
                            Vous avez un probleme avec la plateforme ? Une question ? Nous sommes là pour vous répondre.
                        </p>
                    </div>

                    <div className="row contact-modern-cards justify-content-center">
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-30">
                            <div className="contact-modern-card text-center">
                                <i className="ti-email"></i>
                                <h4>Email</h4>
                                <p>
                                    contact@medarchive.bj<br />
                                    Réponse sous 24h
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-30">
                            <div className="contact-modern-card text-center">
                                <i className="ti-headphone-alt"></i>
                                <h4>Téléphone</h4>
                                <p>
                                    +229 01 47 03 39 90<br />
                                    Lun-Ven, 8h-18h
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 mb-30">
                            <div className="contact-modern-card text-center">
                                <i className="ti-time"></i>
                                <h4>Horaires</h4>
                                <p>
                                    Lundi - Vendredi<br />
                                    8h00 - 18h00
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-modern-wrap mb-40">
                        <h3>Envoyez-nous un message</h3>
                        <form className="form-contact contact_form" action="contact_process.php" method="post" id="contactForm" noValidate>
                            <div className="row">
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea
                                            className="form-control w-100"
                                            name="message"
                                            id="message"
                                            cols="30"
                                            rows="7"
                                            placeholder="Votre message"
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <input
                                            className="form-control"
                                            name="name"
                                            id="name"
                                            type="text"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <input
                                            className="form-control"
                                            name="email"
                                            id="email"
                                            type="email"
                                            placeholder="Votre adresse e-mail"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <input
                                            className="form-control"
                                            name="subject"
                                            id="subject"
                                            type="text"
                                            placeholder="Sujet"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group mt-3 mb-0 text-center">
                                <button type="submit" className="button button-contactForm boxed-btn">
                                    Envoyer
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="contact-map-card">
                        <iframe
                            title="Google Maps MedArchive"
                            src="https://www.google.com/maps?q=Ouidah%2C%20Benin&z=13&output=embed"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Contact;
