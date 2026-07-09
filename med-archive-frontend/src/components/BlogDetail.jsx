import { useEffect } from "react";
import preview_img from "../assets/img/post/preview.png";
import { getBlogPostBySlug, getBlogRelatedPosts } from "../data/blogPosts.js";
import { useLocation } from "react-router-dom";
function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function BlogDetail() {
    const location = useLocation();
    const slug = new URLSearchParams(location.search).get("slug");
    const article = getBlogPostBySlug(slug);
    const relatedPosts = getBlogRelatedPosts(article.slug, 3);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname, location.search]);

    return (
        <>
            <div className="slider-area2 about-cover">
                <div className="slider-height2 d-flex align-items-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-12">
                                <div className="hero-cap hero-cap2 text-center">
                                    <h2>Blog Detail</h2>
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
                                    <img className="img-fluid blog-detail-image" src={article.image} alt={article.title} />
                                </div>
                                <div className="blog_details">
                                    <h2 style={{ color: "#2d2d2d" }}>
                                        {article.title}
                                    </h2>
                                    <ul className="blog-info-link mt-3 mb-4">
                                        <li><a href="#"><i className="fa fa-user"></i> {article.category}</a></li>
                                        <li><a href="#"><i className="fa fa-comments"></i> {article.date}</a></li>
                                    </ul>
                                    <p className="excert">
                                        {article.intro}
                                    </p>
                                    <p>
                                        {article.paragraphs[0]}
                                    </p>
                                    <div className="quote-wrapper">
                                        <div className="quotes">
                                            {article.quote}
                                        </div>
                                    </div>
                                    <p>
                                        {article.paragraphs[1]}
                                    </p>
                                    <p>
                                        {article.conclusion}
                                    </p>
                                </div>
                            </div>

                            <div className="navigation-top">
                                {/* <div className="navigation-area"> */}
                                    {/* <div className="row"> */}
                                        {/* <div className="col-lg-6 col-md-6 col-12 nav-left flex-row d-flex justify-content-start align-items-center">
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
                                        </div> */}
                                        {/* <div className="col-lg-6 col-md-6 col-12 nav-right flex-row d-flex justify-content-end align-items-center">
                                            <div className="detials">
                                                <p>Article suivant</p>
                                                <button
                                                    type="button"
                                                    className="blog-link-button"
                                                    onClick={() => navigate(`/blog-detail?slug=${relatedPosts[0]?.slug ?? article.slug}`)}
                                                >
                                                    {relatedPosts[0]?.title ?? "Retour au blog"}
                                                </button>
                                            </div>
                                            <div className="arrow">
                                                <button
                                                    type="button"
                                                    className="blog-link-button"
                                                    onClick={() => navigate(`/blog-detail?slug=${relatedPosts[0]?.slug ?? article.slug}`)}
                                                >
                                                    →
                                                </button>
                                            </div>
                                        </div> */}
                                    {/* </div>
                                </div> */}
                            </div>

                            <div className="comment-form">
                                <h4>Un commentaire</h4>
                                <form className="form-contact comment_form" action="#" id="commentForm">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <textarea className="form-control w-100" name="comment" id="comment" cols="30" rows="9" placeholder="Votre commentaire..."></textarea>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <input className="form-control" name="name" id="name" type="text" placeholder="Nom" />
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
                                        <button type="submit" className="button button-contactForm btn_1 boxed-btn">Poster</button>
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
                                        <li><a href="#" className="d-flex"><p>{article.category}</p><p>(1)</p></a></li>
                                        <li><a href="#" className="d-flex"><p>Prévention</p><p>(3)</p></a></li>
                                        <li><a href="#" className="d-flex"><p>Suivi médical</p><p>(4)</p></a></li>
                                        <li><a href="#" className="d-flex"><p>Innovation</p><p>(2)</p></a></li>
                                    </ul>
                                </aside>

                                {/* <aside className="single_sidebar_widget popular_post_widget">
                                    <h3 className="widget_title" style={{ color: "#2d2d2d" }}>Articles liés</h3>
                                    {relatedPosts.map((relatedPost) => (
                                        <div className="media post_item" key={relatedPost.slug}>
                                            <img src={relatedPost.image} alt={relatedPost.title} />
                                            <div className="media-body">
                                                <button
                                                    type="button"
                                                    className="blog-link-button"
                                                    onClick={() => navigate(`/blog-detail?slug=${relatedPost.slug}`)}
                                                >
                                                    <h3 style={{ color: "#2d2d2d" }}>{relatedPost.title}</h3>
                                                </button>
                                                <p>{relatedPost.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </aside> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default BlogDetail;
