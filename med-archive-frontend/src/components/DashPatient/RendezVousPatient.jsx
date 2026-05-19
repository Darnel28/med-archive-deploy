import React, { useState } from 'react';

const RendezVousPatient = () => {
  // Données statiques des rendez-vous
  const initialRdv = [
    { id: 1, date: "18 Mars 2026", heure: "14:30", medecin: "Dr. Martin", service: "Médecine générale", statut: "A venir", rappel: "Active", rappelIcon: "fa-regular fa-bell" },
    { id: 2, date: "25 Mars 2026", heure: "09:15", medecin: "Dr. Alice", service: "Cardiologie", statut: "A venir", rappel: "Active", rappelIcon: "fa-regular fa-bell" },
    { id: 3, date: "07 Avr 2026", heure: "11:00", medecin: "Dr. Samba", service: "Dermatologie", statut: "En attente", rappel: "Active", rappelIcon: "fa-regular fa-bell" },
    { id: 4, date: "12 Fev 2026", heure: "16:00", medecin: "Dr. Kone", service: "Ophtalmologie", statut: "Effectué", rappel: "Inactive", rappelIcon: "fa-regular fa-bell-slash" }
  ];

  const [rdvList, setRdvList] = useState(initialRdv);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrer les rendez-vous selon la recherche
  const filteredRdv = rdvList.filter(rdv =>
    Object.values(rdv).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRdv = filteredRdv.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRdv.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddRdv = () => {
    alert("Fonctionnalité : Ajouter un rendez-vous");
  };

  const handleAction = (action, rdv) => {
    alert(`${action} du rendez-vous du ${rdv.date} avec ${rdv.medecin}`);
  };

  const getStatutClass = (statut) => {
    switch (statut) {
      case 'A venir': return 'rdv-status upcoming';
      case 'En attente': return 'rdv-status pending';
      case 'Effectué': return 'rdv-status done';
      default: return 'rdv-status';
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Rendez-vous médicaux</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche rendez-vous">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Chercher un rendez-vous..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </label>
        {/* <button className="btn btn-solid" onClick={handleAddRdv}>
          <i className="fa-solid fa-calendar-plus"></i> Ajouter un rendez-vous
        </button> */}
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Médecin</th>
                  <th>Service</th>
                  <th>Statut</th>
                  <th>Rappel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRdv.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{rdv.date}</td>
                    <td>{rdv.heure}</td>
                    <td>{rdv.medecin}</td>
                    <td>{rdv.service}</td>
                    <td><span className={getStatutClass(rdv.statut)}>{rdv.statut}</span></td>
                    <td><i className={rdv.rappelIcon}></i> {rdv.rappel}</td>
                    <td className="rdv-actions">
                      <button className="icon-action" title="Voir" onClick={() => handleAction('Voir', rdv)}>
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button className="icon-action" title="Modifier" onClick={() => handleAction('Modifier', rdv)}>
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button className="icon-action danger" title="Annuler" onClick={() => handleAction('Annuler', rdv)}>
                        <i className="fa-regular fa-circle-xmark"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {currentRdv.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>Aucun rendez-vous trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredRdv.length} rendez-vous planifiés</span>
            <div className="table-pagination">
              <button
                className="table-page"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`table-page ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="table-page"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Suivant
              </button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default RendezVousPatient;