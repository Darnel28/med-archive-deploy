import React, { useState } from 'react';

const ConsultationsHistory = () => {
  const consultations = [
    {
      id: 1,
      date: '15 Fév 2026',
      medecin: 'Dr. Martin',
      specialite: 'Médecine générale',
      motif: 'Fatigue persistante',
      conclusion: 'Anémie légère. Suivi recommandé dans 30 jours.',
      diagnostic: 'Anémie légère',
      traitement: 'Repos, hydratation et contrôle biologique de suivi.',
      compteRendu:
        'Consultation de contrôle avec fatigue installée depuis plusieurs semaines. Les examens orientent vers une anémie légère sans signe de gravité immédiate.',
    },
    {
      id: 2,
      date: '03 Jan 2026',
      medecin: 'Dr. Alice',
      specialite: 'Cardiologie',
      motif: 'Palpitations',
      conclusion: "ECG normal. Conseils d'hygiène de vie et surveillance.",
      diagnostic: 'Aucun trouble cardiaque retrouvé',
      traitement: 'Surveillance simple et réduction des facteurs déclenchants.',
      compteRendu:
        'Le patient rapporte des palpitations intermittentes. L’ECG réalisé au cabinet est sans anomalie. Une surveillance clinique est recommandée.',
    },
    {
      id: 3,
      date: '20 Nov 2025',
      medecin: 'Dr. Samba',
      specialite: 'Dermatologie',
      motif: 'Éruption cutanée',
      conclusion: 'Traitement local prescrit pendant 10 jours.',
      diagnostic: 'Dermatite superficielle',
      traitement: 'Crème locale deux fois par jour pendant 10 jours.',
      compteRendu:
        'Éruption cutanée localisée compatible avec une dermatite simple. L’évolution attendue est favorable sous traitement local.',
    },
  ];

  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [modalType, setModalType] = useState(null);

  const openConsultationModal = (consultation, type) => {
    setSelectedConsultation(consultation);
    setModalType(type);
  };

  const closeConsultationModal = () => {
    setSelectedConsultation(null);
    setModalType(null);
  };

  const modalTitle = modalType === 'details' ? 'Détails de la consultation' : 'Compte rendu';

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
                {consultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td className="table-nowrap">{consultation.date}</td>
                    <td className="table-title-cell">{consultation.medecin}</td>
                    <td>{consultation.specialite}</td>
                    <td>{consultation.motif}</td>
                    <td>{consultation.conclusion}</td>
                    <td className="rdv-actions table-actions-compact">
                      <button
                        type="button"
                        className="icon-action"
                        title="Voir"
                        onClick={() => openConsultationModal(consultation, 'details')}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        className="icon-action"
                        title="Compte rendu"
                        onClick={() => openConsultationModal(consultation, 'report')}
                      >
                        <i className="fa-regular fa-file-lines"></i>
                      </button>
                    </td>
                  </tr>
                ))}
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

      {selectedConsultation && (
        <div
          className="app-modal-overlay consultation-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consultation-modal-title"
          onClick={closeConsultationModal}
        >
          <div className="app-modal-panel consultation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="app-modal-header consultation-modal-header">
              <div>
                {/* <p className="app-modal-kicker consultation-modal-kicker">Dash patient</p> */}
                <h2 id="consultation-modal-title">{modalTitle}</h2>
              </div>
              <button type="button" className="app-modal-close consultation-modal-close" onClick={closeConsultationModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="app-modal-body consultation-modal-body">
              <div className="app-modal-summary consultation-modal-summary">
                <div>
                  <span>Date</span>
                  <strong>{selectedConsultation.date}</strong>
                </div>
                <div>
                  <span>Médecin</span>
                  <strong>{selectedConsultation.medecin}</strong>
                </div>
                <div>
                  <span>Spécialité</span>
                  <strong>{selectedConsultation.specialite}</strong>
                </div>
                <div>
                  <span>Motif</span>
                  <strong>{selectedConsultation.motif}</strong>
                </div>
              </div>

              {modalType === 'details' ? (
                <div className="consultation-modal-card">
                  <h3>Aperçu de la consultation</h3>
                  <p>{selectedConsultation.conclusion}</p>
                  <ul>
                    <li><strong>Diagnostic :</strong> {selectedConsultation.diagnostic}</li>
                    <li><strong>Traitement :</strong> {selectedConsultation.traitement}</li>
                  </ul>
                </div>
              ) : (
                <div className="consultation-modal-card consultation-report-card">
                  <h3>Compte rendu médical</h3>
                  <p>{selectedConsultation.compteRendu}</p>
                  <div className="consultation-report-note">
                    <i className="fa-regular fa-file-lines"></i>
                    <span>{selectedConsultation.conclusion}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ConsultationsHistory;