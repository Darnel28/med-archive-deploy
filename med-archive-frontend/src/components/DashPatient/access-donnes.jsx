import React from 'react';

const AccesDonnees = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Accès à mes données</h1>
      </section>

      {/* Section : Médecins autorisés */}
      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche médecin">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un médecin autorisé..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-solid fa-user-plus"></i> Autoriser un médecin
        </button> */}
      </section>

      {/* <section className="rdv-section">
        <article className="rdv-card">
          <div className="dossier-head" style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--teal)', marginRight: '8px' }}></i>
              Médecins autorisés à accéder à mon dossier
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Gérez les médecins qui peuvent consulter votre dossier médical.
            </p>
          </div>
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Médecin</th>
                  <th>Spécialité</th>
                  <th>Date d'autorisation</th>
                  <th>Expire le</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-title-cell">Dr. Martin</td>
                  <td>Médecine générale</td>
                  <td className="table-nowrap">10 Jan 2026</td>
                  <td className="table-nowrap">10 Jan 2027</td>
                  <td><span className="badge badge-success">Autorisé</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir le profil">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="icon-action icon-action-danger" title="Retirer l'accès">
                      <i className="fa-solid fa-ban"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">Dr. Alice</td>
                  <td>Cardiologie</td>
                  <td className="table-nowrap">03 Mars 2026</td>
                  <td className="table-nowrap">03 Mars 2027</td>
                  <td><span className="badge badge-success">Autorisé</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir le profil">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="icon-action icon-action-danger" title="Retirer l'accès">
                      <i className="fa-solid fa-ban"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="table-title-cell">Dr. Samba</td>
                  <td>Dermatologie</td>
                  <td className="table-nowrap">20 Nov 2025</td>
                  <td className="table-nowrap">20 Nov 2026</td>
                  <td><span className="badge badge-warning">Expiré bientôt</span></td>
                  <td className="rdv-actions table-actions-compact">
                    <button className="icon-action" title="Voir le profil">
                      <i className="fa-regular fa-eye"></i>
                    </button>
                    <button className="icon-action icon-action-danger" title="Retirer l'accès">
                      <i className="fa-solid fa-ban"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">3 médecins autorisés</span>
            <div className="table-pagination">
              <span className="table-page">Précédent</span>
              <span className="table-page active">1</span>
              <span className="table-page">Suivant</span>
            </div>
          </div>
        </article>
      </section> */}

      {/* Section : Journal des accès */}
      <section className="rdv-section" style={{ marginTop: '24px' }}>
        <article className="rdv-card">
          <div className="dossier-head" style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>
              <i className="fa-regular fa-clock" style={{ color: 'var(--teal)', marginRight: '8px' }}></i>
              Journal des consultations de mon dossier
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Historique de toutes les personnes ayant consulté votre dossier médical.
            </p>
          </div>
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Médecin</th>
                  <th>Spécialité</th>
                  <th>Section consultée</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-nowrap">
                    <span className="table-title-cell">15 Fév 2026</span>
                    <span className="table-subtext">14:32</span>
                  </td>
                  <td className="table-title-cell">Dr. Martin</td>
                  <td>Médecine générale</td>
                  <td>Dossier complet</td>
                  <td><span className="badge badge-info">Consulté</span></td>
                </tr>
                <tr>
                  <td className="table-nowrap">
                    <span className="table-title-cell">03 Jan 2026</span>
                    <span className="table-subtext">09:15</span>
                  </td>
                  <td className="table-title-cell">Dr. Alice</td>
                  <td>Cardiologie</td>
                  <td>Résultats d'analyses</td>
                  <td><span className="badge badge-info">Consulté</span></td>
                </tr>
                <tr>
                  <td className="table-nowrap">
                    <span className="table-title-cell">20 Nov 2025</span>
                    <span className="table-subtext">16:47</span>
                  </td>
                  <td className="table-title-cell">Dr. Samba</td>
                  <td>Dermatologie</td>
                  <td>Ordonnances</td>
                  <td><span className="badge badge-info">Consulté</span></td>
                </tr>
                <tr>
                  <td className="table-nowrap">
                    <span className="table-title-cell">05 Oct 2025</span>
                    <span className="table-subtext">11:00</span>
                  </td>
                  <td className="table-title-cell">Dr. Martin</td>
                  <td>Médecine générale</td>
                  <td>Consultations</td>
                  <td><span className="badge badge-info">Consulté</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">4 accès enregistrés</span>
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

export default AccesDonnees;