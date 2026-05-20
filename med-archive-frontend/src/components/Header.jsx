import { useEffect, useState } from "react";
import logo from "../assets/img/logo11.png";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = (event, path) => {
    event.preventDefault();
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

  return (
    <header>

      <div
        className={`header-area header-transparent ${isScrolled ? "is-scrolled" : ""}`}
      >
        <div className="main-header">
          <div className="container-fluid">
            <div className="row align-items-center">

              <div className="col-8 col-sm-8 col-md-3 col-lg-2 col-xl-2">
                <div className="logo">
                  <a href="/" onClick={(event) => navigate(event, "/")}><img src={logo} alt="Med-Archive" /></a>
                </div>
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
              <div className="col-4 col-sm-4 col-md-9 d-lg-none">
                <div className="mobile_menu"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}

export default Header;