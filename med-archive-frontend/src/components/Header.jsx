import { useEffect, useState } from "react";
import logo from "../assets/img/logo11.png";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (event, path) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header>

      <div
        className={`header-area header-transparent ${isScrolled ? "is-scrolled" : ""}`}
      >
        <div className="main-header">
          <div className="container-fluid">
            <div className="row align-items-center header-row">
              <div className="logo">
                <a
                  href="/"
                  onClick={(event) => navigate(event, "/")}
                  className="medarchive-logo"
                >
                  <span className="med">Med</span>
                  <span className="archive">Archive</span>
                </a>
              </div>
              <div className="col-lg-10 col-xl-10 d-none d-lg-block">
                <div className="menu-main d-flex align-items-center justify-content-end">

                  <div className="main-menu f-right d-none d-lg-block">
                    <nav>
                      <ul id="navigation">
                        <li><a href="/" onClick={(event) => navigate(event, "/")}>Accueil</a></li>
                        <li><a href="/about" onClick={(event) => navigate(event, "/about")}>À propos</a></li>
                        {/* <li><a href="doctor.html">Doctors</a></li>
                        <li><a href="department.html">Department</a></li> */}
                        <li><a href="/blog" onClick={(event) => navigate(event, "/blog")}>Blog</a>
                          {/* <ul className="submenu">
                            <li><a href="blog.html">Blog</a></li>
                            <li><a href="blog_details.html">Blog Details</a></li>
                            <li><a href="elements.html">Element</a></li>
                          </ul> */}
                        </li>
                        <li><a href="/contact" onClick={(event) => navigate(event, "/contact")}>Contact</a></li>
                      </ul>
                    </nav>
                  </div>
                  <div className="header-right-btn f-right d-none d-lg-block ml-30">
                    <a href="/connexion" onClick={(event) => navigate(event, "/connexion")} className="btn header-btn">Mon Espace Santé</a>
                  </div>
                </div>
              </div>
              <div className="d-lg-none mobile-header-actions">
                <button
                  type="button"
                  className={`mobile-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navigation"
                  aria-label="Ouvrir le menu"
                  onClick={() => setIsMobileMenuOpen((value) => !value)}
                >
                  <span className="mobile-menu-icon" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="mobile-menu-label">MENU</span>
                </button>
              </div>
              <div
                className={`mobile-navigation-panel ${isMobileMenuOpen ? "open" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <nav
                  id="mobile-navigation"
                  aria-label="Navigation mobile"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ul>
                    <li><a href="/" onClick={(event) => navigate(event, "/")}>Accueil</a></li>
                    <li><a href="/about" onClick={(event) => navigate(event, "/about")}>À propos</a></li>
                    <li><a href="/blog" onClick={(event) => navigate(event, "/blog")}>Blog</a></li>
                    <li><a href="/contact" onClick={(event) => navigate(event, "/contact")}>Contact</a></li>
                    <li>
                      <a
                        href="/connexion"
                        onClick={(event) => navigate(event, "/connexion")}
                        className="mobile-espace-btn"
                      >
                        Mon espace santé
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}

export default Header;