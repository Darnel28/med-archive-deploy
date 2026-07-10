import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";

import "../assets/css/Connexion.css";
import "../assets/css/Deconnexion.css";
import Nuage from "../assets/img/Nuage.png";
import Dossier from "../assets/img/Dossier.png";
import icone from "../assets/img/icone.png";



export default function DeconnexionPage() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logout();
        } finally {
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="connexion-page deconnexion-page">

            <div className="connexion-card">

                <div className="connexion-layout">

                   

                    <aside className="connexion-left">

                        <div className="connexion-left-overlay"></div>

                        {/* Nuage haut */}
                        <img
                            src={Nuage}
                            alt=""
                            className="connexion-cloud connexion-cloud-top"
                        />

                        
                        <img
                            src={Nuage}
                            alt=""
                            className="connexion-cloud connexion-cloud-bottom"
                        />

                      
                        <div className="connexion-brand">

                            <img
                                src={icone}
                                alt=""
                                className="connexion-logo"
                            />

                            <span className="connexion-brand-text">
                                Med-Archive
                            </span>

                        </div>


                        <div className="connexion-left-content">

                            <h2 className="connexion-left-title">
                                À bientôt sur
                                <br />
                                Med-Archive !
                            </h2>

                            <p className="connexion-left-text">
                                Votre session est protégée.
                                Vous pourrez vous reconnecter
                                à tout moment en toute sécurité.
                            </p>

                        </div>

                      

                        <img
                            src={Dossier}
                            alt=""
                            className="connexion-folder"
                        />

                       
                        <span className="connexion-plus plus1">
                            +
                        </span>

                        <span className="connexion-plus plus2">
                            +
                        </span>

                        <span className="connexion-circle circle1"></span>

                        <span className="connexion-circle circle2"></span>

                    </aside>

                 
                    <section className="connexion-right">

                      <div className="connexion-form">

    <div className="deconnexion-box">

        <h2>Voulez-vous quitter votre session ?</h2>

        <p>
            Toutes vos données sont enregistrées.
            Vous pourrez reprendre votre travail
            dès votre prochaine connexion.
        </p>

        <div className="deconnexion-actions">

            <button
                type="button"
                className="deconnexion-secondary"
                onClick={() => navigate(-1)}
            >
                Retour
            </button>

            <button
                type="button"
                className="deconnexion-primary"
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
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