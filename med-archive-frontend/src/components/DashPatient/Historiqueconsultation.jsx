import React, { useEffect, useMemo, useState } from 'react';
import { getMesConsultations } from '../../api/patientApi';
import { formatDateTime, unwrapRows } from './patientDashboardData';

const ConsultationsHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMesConsultations({ per_page: 100 })
      .then((response) => setConsultations(unwrapRows(response)))
      .catch((error) => setMessage(error?.response?.data?.message || 'Impossible de charger les consultations.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredConsultations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return consultations;
    return consultations.filter((consultation) => [
      consultation.motif,
      consultation.diagnostic,
      consultation.observations,
      consultation.medecin?.user?.name,
      consultation.medecin?.specialite?.nom,
    ].join(' ').toLowerCase().includes(query));
  }, [consultations, searchTerm]);

  const openConsultationModal = (consultation, type) => {
    setSelectedConsultation(consultation);
    setModalType(type);
  };

  const closeConsultationModal = () => {
    setSelectedConsultation(null);
    setModalType(null);
  };

  const modalTitle = modalType === 'details' ? 'Details de la consultation' : 'Notes medicales';

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Historique des consultations</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche consultations">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une consultation..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Medecin</th>
                  <th>Specialite</th>
                  <th>Motif</th>
                  <th>Conclusion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && filteredConsultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td className="table-nowrap">{formatDateTime(consultation.date_consultation)}</td>
                    <td className="table-title-cell">{consultation.medecin?.user?.name || '-'}</td>
                    <td>{consultation.medecin?.specialite?.nom || consultation.service?.nom || '-'}</td>
                    <td>{consultation.motif || '-'}</td>
                    <td>{consultation.diagnostic || consultation.observations || '-'}</td>
                    <td className="rdv-actions table-actions-compact">
                      <button type="button" className="icon-action" title="Voir" onClick={() => openConsultationModal(consultation, 'details')}>
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button type="button" className="icon-action" title="Notes medicales" onClick={() => openConsultationModal(consultation, 'notes')}>
                        <i className="fa-regular fa-file-lines"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredConsultations.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>Aucune consultation trouvee</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredConsultations.length} consultations enregistrees</span>
          </div>
        </article>
      </section>

      {selectedConsultation && (
        <div className="app-modal-overlay consultation-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="consultation-modal-title" onClick={closeConsultationModal}>
          <div className="app-modal-panel consultation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="app-modal-header consultation-modal-header">
              <h2 id="consultation-modal-title">{modalTitle}</h2>
              <button type="button" className="app-modal-close consultation-modal-close" onClick={closeConsultationModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="app-modal-body consultation-modal-body">
              <div className="app-modal-summary consultation-modal-summary">
                <div><span>Date</span><strong>{formatDateTime(selectedConsultation.date_consultation)}</strong></div>
                <div><span>Medecin</span><strong>{selectedConsultation.medecin?.user?.name || '-'}</strong></div>
                <div><span>Motif</span><strong>{selectedConsultation.motif || '-'}</strong></div>
                <div><span>Statut</span><strong>{selectedConsultation.statut || '-'}</strong></div>
              </div>
              {modalType === 'details' ? (
                <div className="consultation-modal-card">
                  <h3>Apercu de la consultation</h3>
                  <p>{selectedConsultation.diagnostic || 'Aucun diagnostic renseigne.'}</p>
                  <ul>
                    <li><strong>Observations:</strong> {selectedConsultation.observations || '-'}</li>
                    {/* <li><strong>Paiement:</strong> {selectedConsultation.statut_paiement || '-'}</li> */}
                  </ul>
                </div>
              ) : (
                <div className="consultation-modal-card consultation-report-card">
                  <h3>Notes medicales</h3>
                  <p>{selectedConsultation.observations || selectedConsultation.diagnostic || 'Aucune note medicale renseignee.'}</p>
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
