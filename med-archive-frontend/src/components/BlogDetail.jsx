import single_blog_1 from "../assets/img/blog/single_blog_1.png";
import preview_img from "../assets/img/post/preview.png";

function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function BlogDetail() {
    return (
        <>
            <div className="slider-area2">
                <div className="slider-height2 d-flex align-items-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="hero-cap hero-cap2 text-center">
                                    <h2>Blog Details</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="blog_area single-post-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 posts-list">
                            <div className="single-post">
                                <div className="feature-img">
                                    <img className="img-fluid" src={single_blog_1} alt="Blog Image" />
                                </div>
                                <div className="blog_details">
                                    <h2 style={{ color: "#2d2d2d" }}>
                                        Le Mag de la Santé Numérique : conseils utiles pour mieux suivre vos soins
                                    </h2>
                                    <ul className="blog-info-link mt-3 mb-4">
                                        <li><a href="#"><i className="fa fa-user"></i> Santé numérique</a></li>
                                        <li><a href="#"><i className="fa fa-comments"></i> 03 Comments</a></li>
                                    </ul>
                                    <p className="excert">
                                        Centraliser ses informations médicales permet de gagner du temps, d’éviter les pertes de documents
                                        et de faciliter les échanges avec les soignants.
                                    </p>
                                    <p>
                                        Ce dossier détaille les bonnes pratiques pour conserver ses ordonnances, comprendre ses analyses et
                                        préparer sereinement les rendez-vous médicaux.
                                    </p>
                                    <div className="quote-wrapper">
                                        <div className="quotes">
                                            Un bon suivi commence par des informations accessibles, fiables et partagées au bon moment.
                                        </div>
                                    </div>
                                    <p>
                                        La santé numérique n’est utile que si elle reste simple à utiliser. C’est pourquoi MedArchive privilégie
                                        une interface claire, sécurisée et adaptée à tous les profils.
                                    </p>
                                </div>
                            </div>

                            <div className="navigation-top">
                                <div className="navigation-area">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 col-12 nav-left flex-row d-flex justify-content-start align-items-center">
                                            <div className="thumb">
                                                <button type="button" className="blog-link-button" onClick={() => navigate("/blog")}>
                                                    <img className="img-fluid" src={preview_img} alt="Preview Image" />
                                                </button>
                                            </div>
                                            <div className="detials">
                                                <p>Retour au blog</p>
                                                <button type="button" className="blog-link-button" onClick={() => navigate("/blog")}>
                                                    Voir les articles
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-12 nav-right flex-row d-flex justify-content-end align-items-center">
                                            <div className="detials">
                                                <p>Prochain article</p>
                                                <button type="button" className="blog-link-button" onClick={() => navigate("/blog")}>
                                                    Santé cardiaque
                                                </button>
                                            </div>
                                            <div className="arrow">
                                                <button type="button" className="blog-link-button" onClick={() => navigate("/blog")}>
                                                    →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="comment-form">
                                <h4>Leave a Reply</h4>
                                <form className="form-contact comment_form" action="#" id="commentForm">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <textarea className="form-control w-100" name="comment" id="comment" cols="30" rows="9" placeholder="Write Comment"></textarea>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <input className="form-control" name="name" id="name" type="text" placeholder="Name" />
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <input className="form-control" name="email" id="email" type="email" placeholder="Email" />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <input className="form-control" name="website" id="website" type="text" placeholder="Website" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="button button-contactForm btn_1 boxed-btn">Post Comment</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="blog_right_sidebar">
                                <aside className="single_sidebar_widget search_widget">
                                    <form action="#">
                                        <div className="form-group">
                                            <div className="input-group mb-3">
                                                <input type="text" className="form-control" placeholder="Search Keyword" />
                                                <div className="input-group-append">
                                                    <button className="btns" type="button"><i className="ti-search"></i></button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </aside>
                                <aside className="single_sidebar_widget post_category_widget">
                                    <h4 className="widget_title" style={{ color: "#2d2d2d" }}>Category</h4>
                                    <ul className="list cat-list">
                                        <li><a href="#" className="d-flex"><p>Santé numérique</p><p>(37)</p></a></li>
                                        <li><a href="#" className="d-flex"><p>Prévention</p><p>(10)</p></a></li>
                                        <li><a href="#" className="d-flex"><p>Suivi médical</p><p>(03)</p></a></li>
                                        <li><a href="#" className="d-flex"><p>Innovation</p><p>(11)</p></a></li>
                                    </ul>
                                </aside>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default BlogDetail;
