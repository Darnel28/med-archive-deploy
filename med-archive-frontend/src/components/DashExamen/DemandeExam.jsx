import React from 'react';

const DemandeExamLabo = () => {
    return (
        <main className="content page-tight">
            <section className="page-title-card">
                <h1>Demande d'examens de laboratoire</h1>
            </section>

            <section className="table-toolbar">
                <label className="table-search" aria-label="Recherche demandes d'examens">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Chercher une demande d'examens..." />
                </label>
                <button className="btn transfer-add-btn">
                    <i className="fa-solid fa-file-prescription"></i> Ajouter un examen
                </button>
            </section>

            <section className="rdv-section">
                <article className="rdv-card">
                    <div className="rdv-table-wrap">
                        <table className="rdv-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Examen</th>
                                    <th>Médecin</th>
                                    <th>Service</th>
                                    <th>Priorité</th>
                                    <th>Heure</th>
                                    <th>Statut</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="table-title-cell">Mme. A. Kouassi</td>
                                    <td>
                                        NFS
                                        <span className="table-subtext">Numération formule sanguine</span>
                                    </td>
                                    <td>Dr. Martin</td>
                                    <td>Hématologie</td>
                                    <td><span className="badge priority-high">Haute</span></td>
                                    <td className="table-nowrap">2026-05-10 09:30</td>
                                    <td><span className="rdv-status upcoming">En attente</span></td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="icon-action" title="Voir détails" aria-label="Voir détails"><i className="fa-regular fa-eye"></i></button>
                                        <button className="icon-action" title="Ajouter résultat" aria-label="Ajouter résultat"><i className="fa-solid fa-file-medical"></i></button>
                                        <button className="icon-action danger" title="Annuler" aria-label="Annuler"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">M. B. N'dri</td>
                                    <td>
                                        Bilan rénal
                                        <span className="table-subtext">Créatinine, Urée</span>
                                    </td>
                                    <td>Dr. Alice</td>
                                    <td>Biochimie</td>
                                    <td><span className="badge priority-medium">Moyenne</span></td>
                                    <td className="table-nowrap">2026-05-10 11:00</td>
                                    <td><span className="rdv-status done">Réalisé</span></td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="icon-action" title="Voir détails" aria-label="Voir détails"><i className="fa-regular fa-eye"></i></button>
                                        <button className="icon-action" title="Ajouter résultat" aria-label="Ajouter résultat"><i className="fa-solid fa-file-medical"></i></button>
                                        <button className="icon-action danger" title="Annuler" aria-label="Annuler"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">Mme. C. Zongo</td>
                                    <td>
                                        Hémoculture
                                        <span className="table-subtext">Contrôle infection</span>
                                    </td>
                                    <td>Dr. Samba</td>
                                    <td>Microbiologie</td>
                                    <td><span className="badge priority-low">Basse</span></td>
                                    <td className="table-nowrap">2026-05-11 08:15</td>
                                    <td><span className="rdv-status upcoming">Programmé</span></td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="icon-action" title="Voir détails" aria-label="Voir détails"><i className="fa-regular fa-eye"></i></button>
                                        <button className="icon-action" title="Ajouter résultat" aria-label="Ajouter résultat"><i className="fa-solid fa-file-medical"></i></button>
                                        <button className="icon-action danger" title="Annuler" aria-label="Annuler"><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span className="table-meta">3 ordonnances répertoriées</span>
                        <div className="table-pagination">
                            <span className="table-page">Précédent</span>
                            <span className="table-page active">1</span>
                            <span className="table-page">Suivant</span>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    );
};

export default DemandeExamLabo;