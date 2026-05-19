import React, { useState } from 'react';

const RendezVousMedecin = () => {
  // Données initiales des rendez-vous
  const [appointments, setAppointments] = useState([
    { id: 1, heure: '09:00', patient: 'Jean A.', motif: 'Consultation', statut: 'pending' },
    { id: 2, heure: '09:30', patient: 'Marie B.', motif: 'Suivi', statut: 'pending' },
    { id: 3, heure: '10:00', patient: 'Paul C.', motif: 'Résultat examen', statut: 'pending' },
    { id: 4, heure: '10:30', patient: 'Lucie D.', motif: 'Contrôle', statut: 'absent' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Fonction pour changer le statut
  const handleConsultation = (id) => {
    setAppointments(prev =>
      prev.map(app => {
        if (app.id === id) {
          if (app.statut === 'pending') {
            return { ...app, statut: 'ongoing' };
          }
          if (app.statut === 'ongoing') {
            return { ...app, statut: 'done' };
          }
        }
        return app;
      })
    );
  };

  // Filtrage selon le terme de recherche
  const filteredAppointments = appointments.filter(app =>
    app.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.motif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le texte et la classe CSS du statut
  const getStatusInfo = (statut) => {
    switch (statut) {
      case 'pending':
        return { text: 'En attente', className: 'rdv-status pending' };
      case 'ongoing':
        return { text: 'En consultation', className: 'rdv-status upcoming' };
      case 'done':
        return { text: 'Terminé', className: 'rdv-status done' };
      case 'absent':
        return { text: 'Absent', className: 'rdv-status done' };
      default:
        return { text: statut, className: 'rdv-status' };
    }
  };

  // Texte du bouton selon le statut
  const getButtonText = (statut) => {
    if (statut === 'pending') return 'Commencer consultation';
    if (statut === 'ongoing') return 'Terminer consultation';
    return 'Ouvrir';
  };

  // Gestionnaire pour "Ajouter rendez-vous"
  const handleAddAppointment = () => {
    // À implémenter : ouverture d'un modal ou redirection
    alert('Fonctionnalité à implémenter : ajouter rendez-vous');
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Mes rendez-vous</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche rendez-vous">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Chercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button className="btn transfer-add-btn" onClick={handleAddAppointment}>
          <i className="fa-solid fa-calendar-plus"></i> Ajouter un rendez-vous
        </button>
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Patient</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => {
                  const { text, className } = getStatusInfo(app.statut);
                  const buttonText = getButtonText(app.statut);
                  return (
                    <tr key={app.id}>
                      <td>{app.heure}</td>
                      <td>{app.patient}</td>
                      <td>{app.motif}</td>
                      <td><span className={className}>{text}</span></td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          type="button"
                          onClick={() => handleConsultation(app.id)}
                        >
                          {buttonText}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      Aucun rendez-vous trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">
              {filteredAppointments.length} rendez-vous planifié{filteredAppointments.length > 1 ? 's' : ''}
            </span>
            <div className="table-pagination">
              {/* Pagination simplifiée (à enrichir selon besoins) */}
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

export default RendezVousMedecin;