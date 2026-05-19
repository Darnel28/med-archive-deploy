import { useEffect } from "react";
import télécharger from "../assets/img/télécharger.jpeg";
import telecharger12 from "../assets/img/telecharger12.jpeg";
import télécharger10 from "../assets/img/télécharger (10).jpg";
import telecharger13 from "../assets/img/telecharger13.jpeg";
import telecharger14 from "../assets/img/telecharger14.jpeg";
import post_1 from "../assets/img/post/post_1.png";
import post_2 from "../assets/img/post/post_2.png";
import post_3 from "../assets/img/post/post_3.png";
import post_4 from "../assets/img/post/post_4.png";

function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function BlogFront() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const articles = [
        {
            image: télécharger,
            title: "Comprendre l'assistance respiratoire à l'hôpital",
            text: "Ce qu'il faut savoir quand un proche est sous respirateur artificiel : surveillance, communication avec l'équipe soignante et étapes de récupération.",
        },
        {
            image: telecharger12,
            title: "Bien préparer sa consultation médicale",
            text: "Questions à poser, documents à apporter et points à expliquer au médecin pour une consultation plus claire et plus efficace.",
        },
        {
            image: télécharger10,
            title: "Prise de tension : quand et comment la contrôler",
            text: "Les bons gestes pour mesurer correctement votre tension artérielle à domicile et mieux prévenir les risques cardiovasculaires.",
        },
        {
            image: telecharger13,
            title: "Prendre soin de son cœur au quotidien",
            text: "Activité physique, sommeil, gestion du stress et suivi médical : les habitudes clés pour protéger durablement votre cœur.",
        },
        {
            image: telecharger14,
            title: "Fruits et légumes : base d'une alimentation préventive",
            text: "Comment composer des repas équilibrés avec plus de produits frais pour renforcer l'immunité et réduire les maladies chroniques.",
        },
    ];

    return (
        <>
            <div className="slider-area2 blog-cover">
                <div className="slider-height2 d-flex align-items-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="hero-cap hero-cap2 text-center">
                                    <h2>Blog</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="blog_area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mb-5 mb-lg-0">
                            <div className="blog_left_sidebar">
                                {articles.map((article, index) => (
                                    <article className="blog_item" key={article.title}>
                                        <div className="blog_item_img">
                                            <img className="card-img rounded-0" src={article.image} alt={article.title} />
                                            <span className="blog_item_date">
                                                <h3>15</h3>
                                                <p>Jan</p>
                                            </span>
                                        </div>
                                        <div className="blog_details">
                                            <button
                                                type="button"
                                                className="d-inline-block blog-link-button"
                                                onClick={() => navigate("/blog-detail")}
                                            >
                                                <h2 className="blog-head" style={{ color: "#2d2d2d" }}>
                                                    {article.title}
                                                </h2>
                                            </button>
                                            <p>{article.text}</p>
                                            <button
                                                type="button"
                                                className="read-more1 blog-link-button"
                                                onClick={() => navigate("/blog-detail")}
                                            >
                                                Lire la suite
                                            </button>
                                        </div>
                                    </article>
                                ))}

                                <nav className="blog-pagination justify-content-center d-flex">
                                    <ul className="pagination">
                                        <li className="page-item">
                                            <a href="#" className="page-link" aria-label="Previous">
                                                <i className="ti-angle-left"></i>
                                            </a>
                                        </li>
                                        <li className="page-item">
                                            <a href="#" className="page-link">1</a>
                                        </li>
                                        <li className="page-item active">
                                            <a href="#" className="page-link">2</a>
                                        </li>
                                        <li className="page-item">
                                            <a href="#" className="page-link" aria-label="Next">
                                                <i className="ti-angle-right"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="blog_right_sidebar">
                                <aside className="single_sidebar_widget popular_post_widget">
                                    <h3 className="widget_title" style={{ color: "#2d2d2d" }}>Recent Post</h3>
                                    {[post_1, post_2, post_3, post_4].map((postImage, index) => (
                                        <div className="media post_item" key={postImage}>
                                            <img src={postImage} alt="post" />
                                            <div className="media-body">
                                                <button
                                                    type="button"
                                                    className="blog-link-button"
                                                    onClick={() => navigate("/blog-detail")}
                                                >
                                                    <h3 style={{ color: "#2d2d2d" }}>
                                                        {[
                                                            "Créer une fiche d'urgence en 2 minutes",
                                                            "Pourquoi numériser ses ordonnances",
                                                            "Bien partager son dossier avec son médecin",
                                                            "Les erreurs à éviter avant une téléconsultation",
                                                        ][index]}
                                                    </h3>
                                                </button>
                                                <p>{["01 Mars 2026", "25 Février 2026", "18 Février 2026", "12 Février 2026"][index]}</p>
                                            </div>
                                        </div>
                                    ))}
                                </aside>

                                <aside className="single_sidebar_widget newsletter_widget">
                                    <h4 className="widget_title" style={{ color: "#2d2d2d" }}>Newsletter</h4>
                                    <form action="#">
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                className="form-control"
                                                onFocus={(event) => (event.currentTarget.placeholder = "")}
                                                onBlur={(event) => (event.currentTarget.placeholder = "Enter email")}
                                                placeholder="Enter email"
                                                required
                                            />
                                        </div>
                                        <button className="button rounded-0 primary-bg text-white w-100 btn_1 boxed-btn" type="submit">
                                            Subscribe
                                        </button>
                                    </form>
                                </aside>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default BlogFront;