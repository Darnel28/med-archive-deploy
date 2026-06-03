import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/TransfertHopitalForm.css';

const NouvelleDemandeTransfert = () => {
    return (
        <main className="hopital-transfer-form-page">
            <section className="hopital-transfer-form-hero">
                <div className="hopital-transfer-form-hero-copy">
                    <span className="hopital-transfer-form-kicker">Bon de transfert</span>
                    <h1>Demande de transfert / admission</h1>
                    <p>
                        Renseignez les informations du patient, le contexte médical et la demande d'accueil.
                        Le formulaire reste dans l'espace hôpital avec le même header et la même sidebar.
                    </p>
                </div>
                {/* <div className="hopital-transfer-form-note">
                    <i className="fa-solid fa-shield-heart"></i>
                    <span>Mode nuit compatible et styles isolés.</span>
                </div> */}
            </section>

            <form className="hopital-transfer-form-card">
                <section className="hopital-transfer-form-section">
                    <h2>I. Identification du patient</h2>
                    <div className="hopital-transfer-form-grid">
                        <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
                            <span>Nom et prénom</span>
                            <input type="text" placeholder="Nom complet du patient" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Date de naissance</span>
                            <input type="date" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Téléphone</span>
                            <input type="tel" placeholder="Ex. +229 00 00 00 00" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Sexe</span>
                            <select defaultValue="">
                                <option value="" disabled>Choisir</option>
                                <option value="femme">Femme</option>
                                <option value="homme">Homme</option>
                                {/* <option value="autre">Autre</option> */}
                            </select>
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Numéro de dossier</span>
                            <input type="text" placeholder="Dossier / admission" />
                        </label>
                    </div>
                </section>

                <section className="hopital-transfer-form-section">
                    <h2>II. Informations médicales</h2>
                    <div className="hopital-transfer-form-grid">
                        <label className="hopital-transfer-form-field">
                            <span>Hôpital d'origine</span>
                            <input type="text" placeholder="Nom de l'établissement" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Médecin traitant</span>
                            <input type="text" placeholder="Nom du médecin" />
                        </label>
                        <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
                            <span>Motif du transfert (diagnostic)</span>
                            <textarea rows="4" placeholder="Décrivez le motif médical de transfert"></textarea>
                        </label>
                        <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
                            <span>Résumé de l'état actuel et soins prodigués</span>
                            <textarea rows="4" placeholder="État clinique, traitements, surveillance, examens"></textarea>
                        </label>
                    </div>
                </section>

                <section className="hopital-transfer-form-section">
                    <h2>III. Demande de transfert</h2>
                    <div className="hopital-transfer-form-grid">
                        <label className="hopital-transfer-form-field">
                            <span>Hôpital / service d'accueil souhaité</span>
                            <input type="text" placeholder="Service cible" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Date souhaitée</span>
                            <input type="date" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Transport médicalisé</span>
                            <div className="hopital-transfer-form-checks">
                                <label>
                                    <input type="radio" name="transport" value="oui" />
                                    <span>Oui</span>
                                </label>
                                <label>
                                    <input type="radio" name="transport" value="non" />
                                    <span>Non</span>
                                </label>
                            </div>
                        </label>
                    </div>
                </section>

                <section className="hopital-transfer-form-section">
                    <h2>Signatures</h2>
                    <div className="hopital-transfer-form-signature-row">
                        <label className="hopital-transfer-form-field">
                            <span>Médecin et/ou responsable</span>
                            <input type="text" placeholder="Nom, titre et signature" />
                        </label>
                        <label className="hopital-transfer-form-field">
                            <span>Signature photo</span>
                            <input type="file" accept="image/*" />
                        </label>
                    </div>
                </section>

                <div className="hopital-transfer-form-actions">
                    <Link className="hopital-transfer-form-back" to="/espacehopital/transfert">
                        <i className="fa-solid fa-arrow-left"></i>
                        Retour à la liste
                    </Link>
                </div>
            </form>
        </main>
    );
};

export default NouvelleDemandeTransfert;