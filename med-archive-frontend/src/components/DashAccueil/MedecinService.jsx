import React from 'react';

const MedecinService = () => {
    return (
        <main className="content page-tight">
            <section className="page-title-card">
                <h1>Service Médecins</h1>
            </section>

            <section className="table-toolbar">
                <label className="table-search" aria-label="Recherche médecins">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" placeholder="Chercher un médecin..." />
                </label>
                <button className="btn transfer-add-btn">
                    <i className="fa-solid fa-plus"></i> Ajouter un médécin
                </button>
            </section>

            <section className="rdv-section">
                <article className="rdv-card">
                    <div className="rdv-table-wrap">
                        <table className="rdv-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th>Années d'expérience</th>
                                    <th>Nombre de patients</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="table-title-cell">Dupont</td>
                                    <td>Jean</td>
                                    <td className="table-nowrap">12</td>
                                    <td className="table-nowrap">450</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="action-icon" title="Voir" onClick={() => alert('Voir Jean Dupont')}><i className="fa-solid fa-eye"></i></button>
                                        <button className="action-icon" title="Modifier" onClick={() => alert('Modifier Jean Dupont')}><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="action-icon" title="Supprimer" onClick={() => alert('Supprimer Jean Dupont')}><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">Martin</td>
                                    <td>Alice</td>
                                    <td className="table-nowrap">8</td>
                                    <td className="table-nowrap">320</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="action-icon" title="Voir" onClick={() => alert('Voir Alice Martin')}><i className="fa-solid fa-eye"></i></button>
                                        <button className="action-icon" title="Modifier" onClick={() => alert('Modifier Alice Martin')}><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="action-icon" title="Supprimer" onClick={() => alert('Supprimer Alice Martin')}><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">Samba</td>
                                    <td>Amadou</td>
                                    <td className="table-nowrap">15</td>
                                    <td className="table-nowrap">780</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="action-icon" title="Voir" onClick={() => alert('Voir Amadou Samba')}><i className="fa-solid fa-eye"></i></button>
                                        <button className="action-icon" title="Modifier" onClick={() => alert('Modifier Amadou Samba')}><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="action-icon" title="Supprimer" onClick={() => alert('Supprimer Amadou Samba')}><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="table-title-cell">Durand</td>
                                    <td>Claire</td>
                                    <td className="table-nowrap">3</td>
                                    <td className="table-nowrap">120</td>
                                    <td className="rdv-actions table-actions-compact">
                                        <button className="action-icon" title="Voir" onClick={() => alert('Voir Claire Durand')}><i className="fa-solid fa-eye"></i></button>
                                        <button className="action-icon" title="Modifier" onClick={() => alert('Modifier Claire Durand')}><i className="fa-solid fa-pen-to-square"></i></button>
                                        <button className="action-icon" title="Supprimer" onClick={() => alert('Supprimer Claire Durand')}><i className="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span className="table-meta">4 médecins listés</span>
                    </div>
                </article>
            </section>
        </main>
    );
};

export default MedecinService;