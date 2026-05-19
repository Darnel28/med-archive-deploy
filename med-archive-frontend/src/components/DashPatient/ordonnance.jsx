import React from 'react';

const Ordonnances = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Ordonnances</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche ordonnances">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une ordonnance..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-solid fa-file-prescription"></i> Ajouter une ordonnance
        </button> */}
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Médicaments</th>
                  <th>Durée</th>
                  <th>Prescripteur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-title-cell">ORD-2026-014</td>
                  <td>
                    Paracétamol 1 g
                    <span className="table-subtext">1 comprimé matin et soir</span>
                  </td>
                  <td className="table-nowrap">5 jours</td>
                  <td>Dr. Martin</td>
                  <td><span className="rdv-status done">Clôturée</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Télécharger"><i className="fa-solid fa-download"></i></button>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">ORD-2026-009</td>
                  <td>
                    Fer 80 mg
                    <span className="table-subtext">1 gélule par jour</span>
                  </td>
                  <td className="table-nowrap">3 mois</td>
                  <td>Dr. Alice</td>
                  <td><span className="rdv-status upcoming">Active</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Télécharger"><i className="fa-solid fa-download"></i></button>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">ORD-2025-118</td>
                  <td>
                    Vitamine D 1000 UI
                    <span className="table-subtext">1 capsule par semaine</span>
                  </td>
                  <td className="table-nowrap">8 semaines</td>
                  <td>Dr. Samba</td>
                  <td><span className="rdv-status upcoming">Active</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Télécharger"><i className="fa-solid fa-download"></i></button>
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

export default Ordonnances;