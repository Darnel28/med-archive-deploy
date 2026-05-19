import React from 'react';

const ResultatsAnalyses = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Résultats d'analyses</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche analyses">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une analyse..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-solid fa-vial"></i> Ajouter un résultat
        </button> */}
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Analyse</th>
                  <th>Date</th>
                  <th>Résultats</th>
                  <th>Interprétation</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-title-cell">Bilan sanguin</td>
                  <td className="table-nowrap">12 Jan 2026</td>
                  <td>Hémoglobine 11.2 g/dL, leucocytes 6.1 G/L, plaquettes 245 G/L</td>
                  <td>Anémie légère à surveiller</td>
                  <td><span className="rdv-status pending">À suivre</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Télécharger"><i className="fa-solid fa-download"></i></button>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">CRP</td>
                  <td className="table-nowrap">03 Fév 2026</td>
                  <td>4.8 mg/L</td>
                  <td>Aucun signe inflammatoire majeur</td>
                  <td><span className="rdv-status done">Normal</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Télécharger"><i className="fa-solid fa-download"></i></button>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">Glycémie à jeun</td>
                  <td className="table-nowrap">10 Fév 2026</td>
                  <td>0.96 g/L</td>
                  <td>Valeur dans l'intervalle attendu</td>
                  <td><span className="rdv-status done">Normal</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Télécharger"><i className="fa-solid fa-download"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">3 analyses disponibles</span>
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

export default ResultatsAnalyses;