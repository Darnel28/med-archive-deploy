import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import { FiLock, FiMail } from "react-icons/fi";
import "../assets/css/Connexion.css";
import { forgotPassword, getDashboardPathForUser, login } from "../api";
import Nuage from "../assets/img/Nuage.png";
import Dossier from "../assets/img/Dossier.png";
import icone from "../assets/img/icone.png";
export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const data = await login({ email, password });
            navigate(getDashboardPathForUser(data.user), { replace: true });
        } catch (error) {
            const apiMessage = error.response?.data?.message;
            const validationMessage = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(" ")
                : null;

            setErrorMessage(validationMessage || apiMessage || "Email ou mot de passe incorrect.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!email) {
            setErrorMessage("Veuillez saisir votre email pour recevoir un nouveau mot de passe temporaire.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await forgotPassword({ email });
            setSuccessMessage(data?.message || "Un nouveau mot de passe temporaire a ete envoye par email.");
            setShowForgotPassword(false);
            setPassword("");
        } catch (error) {
            const validationMessage = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(" ")
                : null;
            setErrorMessage(validationMessage || error.response?.data?.message || "Impossible d envoyer le nouveau mot de passe.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="connexion-page">
            <div className="connexion-card">
                <div className="connexion-layout">
                  <aside className="connexion-left">
    <div className="connexion-left-overlay"></div>

    {/* Nuage en haut à droite */}
    <img src={Nuage} alt="" className="connexion-cloud connexion-cloud-top" />

    {/* Nuage en bas à gauche */}
    <img src={Nuage} alt="" className="connexion-cloud connexion-cloud-bottom" />

    <div className="connexion-brand">
        {/* Ton logo */}
        <img src={icone} alt="Med-Archive" className="connexion-logo" />
        <span className="connexion-brand-text">Med-Archive</span>
    </div>

    <div className="connexion-left-content">
        <h2 className="connexion-left-title">
            Bienvenue sur <br />
            Med-Archive !
        </h2>

        <p className="connexion-left-text">
            Votre dossier médical numérique sécurisé,
            accessible partout et à tout moment.
        </p>
    </div>

    {/* Illustration du dossier médical */}
    <img
        src={Dossier}
        alt=""
        className="connexion-folder"
    />

    {/* Décorations */}
    <span className="connexion-plus plus1">+</span>
    <span className="connexion-plus plus2">+</span>
    <span className="connexion-circle circle1"></span>
    <span className="connexion-circle circle2"></span>
</aside>

                    <section className="connexion-right">
                        <div  />

                        <div className="connexion-form-panel">
                            <h1 className="connexion-right-title">
                                Connexion a votre espace
                            </h1>

                            <div className="connexion-socials">
                                <button type="button" className="connexion-social-btn">
                                    <FaFacebookF />
                                </button>
                                <button type="button" className="connexion-social-btn">
                                    <FaGooglePlusG />
                                </button>
                                <button type="button" className="connexion-social-btn">
                                    <FaLinkedinIn />
                                </button>
                            </div>

                            <p className="connexion-right-subtitle">
                                ou utilisez votre E-mail pour vous connecter :
                            </p>

                            <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin} className="connexion-form">
                                <div className="connexion-field">
                                    <span className="connexion-field-icon"><FiMail /></span>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="connexion-input"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                {!showForgotPassword ? (
                                    <div className="connexion-field">
                                        <span className="connexion-field-icon"><FiLock /></span>
                                        <input
                                            type="password"
                                            placeholder="Mot de passe"
                                            className="connexion-input"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>
                                ) : null}

                                {errorMessage ? (
                                    <p className="connexion-error">{errorMessage}</p>
                                ) : null}

                                {successMessage ? (
                                    <p className="connexion-success">{successMessage}</p>
                                ) : null}

                                <div className="connexion-options-row">
                                    {!showForgotPassword ? (
                                        <label className="connexion-remember">
                                            <input type="checkbox" />
                                            <span>Se souvenir de moi</span>
                                        </label>
                                    ) : <span />}
                                    <button
                                        type="button"
                                        className="connexion-forgot-link"
                                        onClick={() => {
                                            setShowForgotPassword((value) => !value);
                                            setErrorMessage("");
                                            setSuccessMessage("");
                                        }}
                                    >
                                        {showForgotPassword ? "Retour connexion" : "Mot de passe oublie ?"}
                                    </button>
                                </div>

                                <div className="connexion-submit-wrap">
                                    <button
                                        type="submit"
                                        className="connexion-submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (showForgotPassword ? "Envoi..." : "Connexion...") : (showForgotPassword ? "Envoyer" : "Se connecter")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
