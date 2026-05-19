import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuthUser, getDashboardPathForUser, login } from "../api";
import logo from "../assets/img/logo11.png";

function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = useMemo(() => {
    const from = location.state?.from?.pathname;

    if (from && from !== "/connexion") {
      return from;
    }

    return null;
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(formData);
      const user = result?.user || getAuthUser();
      navigate(redirectPath || getDashboardPathForUser(user), { replace: true });
    } catch (apiError) {
      const validationMessage = apiError?.data?.errors
        ? Object.values(apiError.data.errors).flat().join(" ")
        : null;

      setError(validationMessage || apiError?.message || "Connexion impossible pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-panel login-brand-panel">
          <Link to="/" className="login-logo-link" aria-label="Retour a l'accueil">
            <img src={logo} alt="Med-Archive" />
          </Link>
          <div>
            <p className="login-eyebrow">Espace securise</p>
            <h1>Connexion a Med-Archive</h1>
            <p className="login-copy">
              Accedez a votre espace selon votre role : patient, medecin, laboratoire,
              accueil ou etablissement.
            </p>
          </div>
        </div>

        <div className="login-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <p className="login-eyebrow">Identification</p>
              <h2>Se connecter</h2>
            </div>

            {error ? <div className="login-alert">{error}</div> : null}

            <label className="login-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nom@exemple.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="login-field">
              <span>Mot de passe</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                required
              />
            </label>

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Connexion;
