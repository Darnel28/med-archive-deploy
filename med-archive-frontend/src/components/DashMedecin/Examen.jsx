import React, { useState } from 'react';

const ExamensMedecin = () => {
  // État des demandes d'examens
  const [demandes, setDemandes] = useState([
    { id: 1, patient: "Jean A.", demande: "Analyse de sang", laboratoire: "CNHU Labo", statut: "pending" }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    demande: 'Analyse de sang',
    laboratoire: 'CNHU Labo'
  });

  // Filtrer les demandes selon la recherche
  const filteredDemandes = demandes.filter(d =>
    d.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ouvrir le modal
  const handleAddDemande = () => {
    setShowModal(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      patient: '',
      demande: 'Analyse de sang',
      laboratoire: 'CNHU Labo'
    });
  };

  // Mettre à jour les champs du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire et ajouter une nouvelle demande
  const handleSubmitDemande = (e) => {
    e.preventDefault();

    if (!formData.patient.trim()) {
      alert("Veuillez saisir le nom du patient");
      return;
    }

    const newDemande = {
      id: Date.now(),
      patient: formData.patient.trim(),
      demande: formData.demande,
      laboratoire: formData.laboratoire,
      statut: "pending"
    };

    setDemandes(prev => [newDemande, ...prev]);
    handleCloseModal();
  };

  // Obtenir la classe CSS du statut
  const getStatusClass = (statut) => {
    switch (statut) {
      case 'pending': return 'rdv-status pending';
      case 'ongoing': return 'rdv-status upcoming';
      case 'done': return 'rdv-status done';
      default: return 'rdv-status';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'pending': return 'En attente';
      case 'ongoing': return 'En cours';
      case 'done': return 'Terminé';
      default: return statut;
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Examens</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche patient">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher ou saisir le nom du patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn transfer-add-btn btn-add-exam" type="button" onClick={handleAddDemande}>
            <i className="fa-solid fa-plus"></i> Ajouter une demande
          </button>
        </div>
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table" aria-label="Demandes d'examens">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Demande</th>
                  <th>Laboratoire</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemandes.map((demande) => (
                  <tr key={demande.id}>
                    <td>{demande.patient}</td>
                    <td>{demande.demande}</td>
                    <td>{demande.laboratoire}</td>
                    <td><span className={getStatusClass(demande.statut)}>{getStatusText(demande.statut)}</span></td>
                    <td className="rdv-actions">
                      <button className="icon-action" title="Voir">
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDemandes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      Aucune demande d'examen trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">
              {filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''}
            </span>
            <div className="table-pagination">
              <span className="table-page">Précédent</span>
              <span className="table-page active">1</span>
              <span className="table-page">Suivant</span>
            </div>
          </div>
        </article>
      </section>

      {/* Modal pour ajouter une demande */}
      {showModal && (
        <div className="exam-modal-backdrop" onClick={handleCloseModal}>
          <div className="exam-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter une demande d'examen</h2>
              <button className="modal-close" onClick={handleCloseModal} aria-label="Fermer">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitDemande}>
              <div className="form-group">
                <label htmlFor="patient">Nom du patient *</label>
                <input
                  id="patient"
                  type="text"
                  name="patient"
                  value={formData.patient}
                  onChange={handleFormChange}
                  placeholder="Saisir le nom du patient"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="demande">Type d'examen *</label>
                <select
                  id="demande"
                  name="demande"
                  value={formData.demande}
                  onChange={handleFormChange}
                >
                  <option value="Analyse de sang">Analyse de sang</option>
                  <option value="Radiographie">Radiographie</option>
                  <option value="Échographie">Échographie</option>
                  <option value="Scanner">Tomodensitométrie (Scanner)</option>
                  <option value="IRM">Imagerie par résonance magnétique (IRM)</option>
                  <option value="ECG">ECG</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="laboratoire">Laboratoire *</label>
                <select
                  id="laboratoire"
                  name="laboratoire"
                  value={formData.laboratoire}
                  onChange={handleFormChange}
                >
                  <option value="CNHU Labo">CNHU Labo</option>
                  <option value="Labo Central">Labo Central</option>
                  <option value="Bio Analysis">Bio Analysis</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Ajouter la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};


export default ExamensMedecin;