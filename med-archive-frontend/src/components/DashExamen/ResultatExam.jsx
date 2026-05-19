import React from 'react';

const ResultatExamLabo = () => {
    return (
        <main className="content page-tight">
       
            <section className="page-title-card">
                <h1>Resultats d'examens de laboratoire</h1>
            </section>

            <section className="table-toolbar">
                <label className="table-search" aria-label="Recherche resultat d'examen">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Chercher un resultat d'examen..." />
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
                                    <th>Médecin</th>
                                    <th>Examen</th>
                                    <th>Date</th>
                                    <th>Résultat</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="table-title-cell">Mme. A. Kouassi</td>
                                    <td>Dr. Martin</td>
                                    <td>
                                        NFS
                                        <span className="table-subtext">Numération formule sanguine</span>
                                    </td>
                                    <td className="table-nowrap">2026-05-10 09:30</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="icon-action" title="Voir le résultat" aria-label="Voir le résultat">
                                            <i className="fa-regular fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">M. B. N'dri</td>
                                    <td>Dr. Alice</td>
                                    <td>
                                        Bilan rénal
                                        <span className="table-subtext">Créatinine, Urée</span>
                                    </td>
                                    <td className="table-nowrap">2026-05-10 11:00</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="icon-action" title="Voir le résultat" aria-label="Voir le résultat">
                                            <i className="fa-regular fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">Mme. C. Zongo</td>
                                    <td>Dr. Samba</td>
                                    <td>
                                        Hémoculture
                                        <span className="table-subtext">Contrôle infection</span>
                                    </td>
                                    <td className="table-nowrap">2026-05-11 08:15</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="icon-action" title="Voir le résultat" aria-label="Voir le résultat">
                                            <i className="fa-regular fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span className="table-meta">3 résultats répertoriés</span>
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

export default ResultatExamLabo;