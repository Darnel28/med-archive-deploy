import { useEffect } from "react";
import { getBlogFrontPosts } from "../data/blogPosts.js";

function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

function BlogFront() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const articles = getBlogFrontPosts();
    const recentPosts = articles.slice(0, 4);

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
                                                <h3>{article.day}</h3>
                                                <p>{article.month}</p>
                                            </span>
                                        </div>
                                        <div className="blog_details">
                                            <button
                                                type="button"
                                                className="d-inline-block blog-link-button"
                                                onClick={() => navigate(`/blog-detail?slug=${article.slug}`)}
                                            >
                                                <h2 className="blog-head" style={{ color: "#2d2d2d" }}>
                                                    {article.title}
                                                </h2>
                                            </button>
                                            <p>{article.excerpt}</p>
                                            <button
                                                type="button"
                                                className="read-more1 blog-link-button"
                                                onClick={() => navigate(`/blog-detail?slug=${article.slug}`)}
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
                                    {recentPosts.map((post) => (
                                        <div className="media post_item" key={post.slug}>
                                            <img src={post.recentImage ?? post.image} alt={post.title} />
                                            <div className="media-body">
                                                <button
                                                    type="button"
                                                    className="blog-link-button"
                                                    onClick={() => navigate(`/blog-detail?slug=${post.slug}`)}
                                                >
                                                    <h3 style={{ color: "#2d2d2d" }}>
                                                        {post.title}
                                                    </h3>
                                                </button>
                                                <p>{post.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </aside>

                                {/* <aside className="single_sidebar_widget newsletter_widget">
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
                                </aside> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default BlogFront;