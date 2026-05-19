import React from 'react';

const ConsultationsHistory = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Historique des consultations</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche consultations">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une consultation..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-regular fa-file-lines"></i> Ajouter une consultation
        </button> */}
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Médecin</th>
                  <th>Spécialité</th>
                  <th>Motif</th>
                  <th>Conclusion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-nowrap">15 Fév 2026</td>
                  <td className="table-title-cell">Dr. Martin</td>
                  <td>Médecine générale</td>
                  <td>Fatigue persistante</td>
                  <td>Anémie légère. Suivi recommandé dans 30 jours.</td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Compte rendu"><i className="fa-regular fa-file-lines"></i></button>
                  </td>
                </tr>
                <tr>
                  <td className="table-nowrap">03 Jan 2026</td>
                  <td className="table-title-cell">Dr. Alice</td>
                  <td>Cardiologie</td>
                  <td>Palpitations</td>
                  <td>ECG normal. Conseils d'hygiène de vie et surveillance.</td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Compte rendu"><i className="fa-regular fa-file-lines"></i></button>
                  </td>
                </tr>
                <tr>
                  <td className="table-nowrap">20 Nov 2025</td>
                  <td className="table-title-cell">Dr. Samba</td>
                  <td>Dermatologie</td>
                  <td>Éruption cutanée</td>
                  <td>Traitement local prescrit pendant 10 jours.</td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir"><i className="fa-regular fa-eye"></i></button>
                    <button className="icon-action" title="Compte rendu"><i className="fa-regular fa-file-lines"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">3 consultations enregistrées</span>
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

export default ConsultationsHistory;