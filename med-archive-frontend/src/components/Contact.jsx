import React from "react";

function Contact() {
    return (
        <>

           
            <div className="slider-area2 about-cover">
                <div className="slider-height2 d-flex align-items-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="hero-cap hero-cap2 text-center">
                                    <h2>Contactez-nous</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


     
            <section className="contact-modern-section">

                <div className="container">

                    <div >

                        <div className="row g-0">

                        
                            <div className="col-lg-5">

                                <div className="contact-left">

                                    <h2>Entrer en contact</h2>

                                    <p>
                                        Une question concernant MedArchive ?
                                        Besoin d'assistance ?
                                        Notre équipe est disponible pour vous accompagner.
                                    </p>

                                    <div className="contact-info">

                                        <div className="contact-icon">
                                            <i className="ti-mobile"></i>
                                        </div>

                                        <div>
                                            <h5>Téléphone</h5>
                                            <span>+229 01 47 03 39 90</span>
                                        </div>

                                    </div>

                                    <div className="contact-info">

                                        <div className="contact-icon">
                                            <i className="ti-email"></i>
                                        </div>

                                        <div>
                                            <h5>Email</h5>
                                            <span>contact@medarchive.bj</span>
                                        </div>

                                    </div>

                                    {/* <div className="contact-info">

                                        <div className="contact-icon">
                                            <i className="ti-location-pin"></i>
                                        </div>

                                        <div>
                                            <h5>Adresse</h5>
                                            <span>Cotonou, République du Bénin</span>
                                        </div>

                                    </div> */}

                                    {/* <div className="contact-info">

                                        <div className="contact-icon">
                                            <i className="ti-time"></i>
                                        </div>

                                        <div>
                                            <h5>Horaires</h5>
                                            <span>Lundi - Vendredi<br />08h00 - 18h00</span>
                                        </div>

                                    </div> */}

                                    <h5 className="social-title">
                                        Réseaux sociaux
                                    </h5>

                                    <div className="contact-social">

                                        <a href="#">
                                            <i className="ti-facebook"></i>
                                        </a>

                                        <a href="#">
                                            <i className="ti-twitter"></i>
                                        </a>

                                        <a href="#">
                                            <i className="ti-linkedin"></i>
                                        </a>

                                        <a href="#">
                                            <i className="ti-instagram"></i>
                                        </a>

                                    </div>

                                </div>

                            </div>


                            {/* RIGHT */}

                            <div className="col-lg-7">

                                <div className="contact-right">

                                    <form>

                                        <div className="row">

                                            <div className="col-md-6">

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nom complet"
                                                />

                                            </div>

                                            <div className="col-md-6">

                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Adresse e-mail"
                                                />

                                            </div>

                                            <div className="col-md-6">

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Téléphone"
                                                />

                                            </div>

                                            <div className="col-md-6">

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Sujet"
                                                />

                                            </div>

                                            <div className="col-12">

                                                <textarea
                                                    className="form-control"
                                                    rows="6"
                                                    placeholder="Votre message..."
                                                ></textarea>

                                            </div>

                                            <div className="col-12 mt-3">

                                                <button
                                                    className="contact-btn"
                                                    type="submit"
                                                >
                                                    Envoyer le message
                                                </button>

                                            </div>

                                        </div>

                                    </form>

                                </div>

                            </div>

                        </div>

                    </div>


                   

                    <div className="map-section">

                        <h2>Hôpitaux proches de vous</h2>

                        <p>
                            Retrouvez les établissements de santé situés autour de votre position.
                        </p>

                        <div className="contact-map-card">

                            <iframe
                                title="Google Maps"
                                src="https://www.google.com/maps?q=Cotonou,Benin&z=13&output=embed"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>

                        </div>

                    </div>

                </div>

            </section>

            <style>
                {
                    `
         





.contact-wrapper{
    background:#fff;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,.08);
    margin-bottom:70px;
}

.contact-left{
    padding:55px;
}

.contact-left h2{
    font-size:42px;
    font-weight:700;
    color:#0b1c39;
    margin-bottom:15px;
}

.contact-left p{
    color:#7b8898;
    line-height:1.8;
    margin-bottom:40px;
}

.contact-info{
    display:flex;
    align-items:flex-start;
    margin-bottom:28px;
}

.contact-icon{
    width:52px;
    height:52px;
    border-radius:12px;
    background:#10b5a4;
    color:#fff;
    display:flex;
    justify-content:center;
    align-items:center;
    font-size:20px;
    margin-right:18px;
}

.contact-info h5{
    margin:0;
    font-size:18px;
    color:#0b1c39;
    font-weight:600;
}

.contact-info span{
    color:#7d8897;
    display:block;
    margin-top:4px;
}

.social-title{
    margin-top:45px;
    font-weight:700;
    color:#0b1c39;
}

.contact-social{
    margin-top:15px;
}

.contact-social a{
    width:42px;
    height:42px;
    border-radius:50%;
    display:inline-flex;
    justify-content:center;
    align-items:center;
    margin-right:10px;
    background:#eef8f7;
    color:#10b5a4;
    transition:.3s;
}

.contact-social a:hover{
    background:#10b5a4;
    color:#fff;
}



.contact-right{
    background:#EAF7FF;
    padding:55px;
    border-radius:20px;
}
.contact-right .form-control{
    border:none;
    border-radius:10px;
    height:54px;
    margin-bottom:20px;
    padding-left:18px;
    font-size:15px;
    box-shadow:none;
}

.contact-right textarea.form-control{
    height:170px;
    padding-top:18px;
    resize:none;
}

.contact-right .form-control:focus{
    border:1px solid #10b5a4;
    box-shadow:0 0 0 3px rgba(16,181,164,.15);
}

.contact-btn {
    background: #18b7ad !important;
    color: #fff !important;
    border: none;
    border-radius: 10px;
    padding: 15px 35px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all .3s ease;
    box-shadow: 0 8px 20px rgba(24, 183, 173, 0.25);
}

.contact-btn:hover {
    background: #149f97 !important;
    color: #fff !important;
    transform: translateY(-2px);
}

.contact-btn:focus,
.contact-btn:active {
    background: #18b7ad !important;
    color: #fff !important;
    box-shadow: 0 0 0 0.2rem rgba(24, 183, 173, 0.25);
}



.map-section h2{
    text-align:center;
    margin-bottom:12px;
    color:#0b1c39;
    font-size:34px;
    font-weight:700;
}

.map-section p{
    text-align:center;
    color:#777;
    margin-bottom:35px;
}

.contact-map-card{
    overflow:hidden;
    border-radius:20px;
    box-shadow:0 20px 45px rgba(0,0,0,.12);
}

.contact-map-card iframe{
    width:100%;
    height:500px;
    border:none;
}

/* ===========================
      RESPONSIVE
=========================== */

@media(max-width:991px){

.contact-left,
.contact-right{
    padding:35px;
}

.contact-left h2{
    font-size:32px;
}

.contact-map-card iframe{
    height:400px;
}

}

@media(max-width:767px){

.contact-left,
.contact-right{
    padding:25px;
}

.contact-left h2{
    font-size:28px;
}

.contact-info{
    margin-bottom:20px;
}

.contact-map-card iframe{
    height:320px;
}

}
                    
                `
                }
            </style>

        </>
    );
}

export default Contact;