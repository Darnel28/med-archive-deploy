import blogvacinnation from "../assets/img/blogvacinnation.jpg";
import télécharger10 from "../assets/img/télécharger (10).jpg";
import télécharger11 from "../assets/img/télécharger (11).jpg";

function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function Blog() {
    return (
        <>
            <div className="gallery-area fix">
                <div className="container-fluid p-0">
                    <div className="row no-gutters">
                        <div className="col-lg-3 col-md-3 col-sm-6">
                            <div className="gallery-box">
                                <div className="single-gallery">
                                    <div className="gallery-img"
                                        style={{ backgroundImage: 'url(assets/img/gallery/gallery1.png)' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-6">
                            <div className="gallery-box">
                                <div className="single-gallery">
                                    <div className="gallery-img"
                                        style={{ backgroundImage: 'url(assets/img/gallery/gallery2.png)' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6">
                            <div className="gallery-box">
                                <div className="single-gallery">
                                    <div className="gallery-img"
                                        style={{ backgroundImage: 'url(assets/img/gallery/gallery3.png)' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6">
                            <div className="gallery-box">
                                <div className="single-gallery">
                                    <div className="gallery-img"
                                        style={{ backgroundImage: 'url(assets/img/gallery/gallery4.png)' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-6">
                            <div className="gallery-box">
                                <div className="single-gallery">
                                    <div className="gallery-img"
                                        style={{ backgroundImage: 'url(assets/img/gallery/gallery5.png)' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-sm-6">
                            <div className="gallery-box">
                                <div className="single-gallery">
                                    <div className="gallery-img"
                                        style={{ backgroundImage: 'url(assets/img/gallery/gallery6.png)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="home_blog-area section-padding30">
                <div className="container">
                    <div className="row justify-content-sm-center">
                        <div className="col-xl-7 col-lg-8 col-md-10">

                            <div className="section-tittle text-center mb-70">
                                <span>Actualités & Conseils</span>
                                <h2>Le Mag de la Santé Numérique</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-4 col-lg-4 col-md-6">
                            <div className="single-blogs mb-30">
                                <div className="blog-img">
                                    <img src={blogvacinnation} alt="Blog Image" />
                                </div>
                                <div className="blogs-cap">
                                    <div className="date-info">
                                        <span>Santé</span>
                                        <p>Nov 30, 2026</p>
                                    </div>
                                    <h4>
                                        <button type="button" className="blog-link-button" onClick={() => navigate("/blog-detail")}>
                                            Rappel des vaccins sur votre carnet numérique
                                        </button>
                                    </h4>
                                    <button type="button" className="read-more1 blog-link-button" onClick={() => navigate("/blog-detail")}>
                                        Lire Plus
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6">
                            <div className="single-blogs mb-30">
                                <div className="blog-img">
                                    <img src={télécharger10} alt="Blog Image" />
                                </div>
                                <div className="blogs-cap">
                                    <div className="date-info">
                                        <span>Bilan </span>
                                        <p>Nov 30, 2026</p>
                                    </div>
                                    <h4>
                                        <button type="button" className="blog-link-button" onClick={() => navigate("/blog-detail")}>
                                            Archivage immédiat de vos constantes vitales
                                        </button>
                                    </h4>
                                    <button type="button" className="read-more1 blog-link-button" onClick={() => navigate("/blog-detail")}>
                                        Lire Plus
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-6">
                            <div className="single-blogs mb-30">
                                <div className="blog-img">
                                    <img src={télécharger11} alt="Blog Image" />
                                </div>
                                <div className="blogs-cap">
                                    <div className="date-info">
                                        <span>Opération</span>
                                        <p>Nov 30, 2026</p>
                                    </div>
                                    <h4>
                                        <button type="button" className="blog-link-button" onClick={() => navigate("/blog-detail")}>
                                            Prise en Charge
                                        </button>
                                    </h4>
                                    <button type="button" className="read-more1 blog-link-button" onClick={() => navigate("/blog-detail")}>
                                        Lire Plus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Blog;