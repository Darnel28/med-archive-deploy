import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import { FiLock, FiMail } from "react-icons/fi";
import "../assets/css/Connexion.css";
import { getDashboardPathForUser, login } from "../api";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage("");
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

    return (
        <div className="connexion-page">
            <div className="connexion-card">
                <div className="connexion-layout">
                    <aside className="connexion-left">
                        <div className="connexion-left-overlay" />

                        <div className="connexion-brand">
                            <div className="connexion-brand-mark">
                                360
                            </div>
                            <span className="connexion-brand-text">Med-Archive</span>
                        </div>

                        <div className="connexion-left-content">
                            <h2 className="connexion-left-title">
                                Bon retour !
                            </h2>
                            <p className="connexion-left-text">
                                Pour rester connecte avec nous, veuillez vous connecter avec vos informations personnelles.
                            </p>
                        </div>
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

                            <form onSubmit={handleLogin} className="connexion-form">
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

                                {errorMessage ? (
                                    <p className="connexion-error">{errorMessage}</p>
                                ) : null}

                                <div className="connexion-options-row">
                                    <label className="connexion-remember">
                                        <input type="checkbox" />
                                        <span>Se souvenir de moi</span>
                                    </label>
                                    <a href="#" className="connexion-forgot-link">Mot de passe oublie ?</a>
                                </div>

                                <div className="connexion-submit-wrap">
                                    <button
                                        type="submit"
                                        className="connexion-submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Connexion..." : "Se connecter"}
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
