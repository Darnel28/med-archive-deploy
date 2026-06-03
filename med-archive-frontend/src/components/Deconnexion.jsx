import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import "../assets/css/Connexion.css";
import "../assets/css/Deconnexion.css";

export default function DeconnexionPage() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logout();
        } finally {
            navigate("/connexion", { replace: true });
        }
    };

    return (
        <div className="connexion-page deconnexion-page">
            <div className="connexion-card">
                <div className="connexion-layout deconnexion-layout">
                    <aside className="connexion-left deconnexion-left">
                        <div className="connexion-left-overlay" />

                        <div className="connexion-brand">
                            <div className="connexion-brand-mark">MA</div>
                            <span className="connexion-brand-text">Med-Archive</span>
                        </div>

                        <div className="connexion-left-content">
                            <h2 className="connexion-left-title">Gérez votre sortie en toute sécurité</h2>
                            <p className="connexion-left-text">
                                Votre session Med-Archive protège les données médicales de votre espace patient et professionnel.
                            </p>

                            <button type="button" className="connexion-left-button" onClick={() => navigate(-1)}>
                                Retour
                            </button>
                        </div>
                    </aside>

                    <section className="connexion-right deconnexion-right">
                        <div className="connexion-corner" />

                        <div className="connexion-form-panel deconnexion-form-panel">
                            <h1 className="connexion-right-title">Déconnexion de Med-Archive</h1>
                            <p className="connexion-right-subtitle deconnexion-subtitle">
                                Vous êtes sur le point de fermer votre session. Vos données restent sécurisées et vous pourrez revenir à tout moment.
                            </p>

                            <div className="deconnexion-box">
                                <div className="deconnexion-box-icon">
                                    <i className="fa-solid fa-shield-heart"></i>
                                </div>

                                <h2>Confirmer la déconnexion ?</h2>
                                <p>
                                    Pour continuer, cliquez sur le bouton de déconnexion. Sinon, revenez au tableau de bord pour poursuivre votre travail.
                                </p>

                                <div className="deconnexion-actions">
                                    <button type="button" className="deconnexion-secondary" onClick={() => navigate(-1)}>
                                        Rester connecté
                                    </button>
                                    <button type="button" className="deconnexion-primary" onClick={handleLogout} disabled={isLoggingOut}>
                                        {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}