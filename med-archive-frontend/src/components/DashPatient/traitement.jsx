import React from 'react';

const Traitements = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Historique des traitements</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche traitements">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un traitement..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-solid fa-pills"></i> Ajouter un traitement
        </button> */}
      </section>

      <section className="bottom-cards">
        <article className="small-card">
          <span>TRAITEMENTS ACTIFS</span>
          <strong>3</strong>
        </article>
        <article className="small-card">
          <span>DURÉE MOYENNE</span>
          <strong>30 jours</strong>
        </article>
        <article className="small-card">
          <span>MÉDECINS PRESCRIPTEURS</span>
          <strong>2</strong>
        </article>
        <article className="small-card">
          <span>DERNIÈRE MISE À JOUR</span>
          <strong>10 Mars</strong>
        </article>
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="dossier-head">
            <div>
              <span className="kicker">SUIVI THÉRAPEUTIQUE</span>
              <h2>Traitements récents et consignes associées</h2>
            </div>
            <span className="chip-positive">
              <i className="fa-solid fa-pills"></i> Suivi en cours
            </span>
          </div>

          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Médicaments prescrits</th>
                  <th>Durée du traitement</th>
                  <th>Médecin prescripteur</th>
                  <th>Instructions</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fer 80 mg, 1 gélule par jour</td>
                  <td>05 jan 2026 - 05 avr 2026</td>
                  <td>Dr. Alice Ahouansou</td>
                  <td>Après le petit-déjeuner, avec de l'eau. Éviter thé et café.</td>
                  <td><span className="rdv-status upcoming">En cours</span></td>
                  <td className="rdv-actions">
                    <button className="icon-action" title="Voir">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="icon-action" title="Ordonnance">
                      <i className="fa-solid fa-file-medical"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Paracétamol 1 g, 1 comprimé matin et soir</td>
                  <td>15 fév 2026 - 20 fév 2026</td>
                  <td>Dr. Martin Kossi</td>
                  <td>En cas de douleur, après les repas, maximum 2 prises par jour.</td>
                  <td><span className="rdv-status done">Terminé</span></td>
                  <td className="rdv-actions">
                    <button className="icon-action" title="Voir">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="icon-action" title="Suivi">
                      <i className="fa-solid fa-notes-medical"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Vitamine D 1000 UI, 1 capsule par semaine</td>
                  <td>12 fév 2026 - 08 avr 2026</td>
                  <td>Dr. Samba Adje</td>
                  <td>Chaque dimanche matin. Signaler toute réaction inhabituelle.</td>
                  <td><span className="rdv-status upcoming">En cours</span></td>
                  <td className="rdv-actions">
                    <button className="icon-action" title="Voir">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="icon-action" title="Détails">
                      <i className="fa-solid fa-circle-info"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">3 traitements suivis</span>
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

export default Traitements;