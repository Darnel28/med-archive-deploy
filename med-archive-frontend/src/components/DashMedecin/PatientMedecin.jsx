import React, { useState, useMemo } from 'react';

// Données statiques des patients (à remplacer par une API plus tard)
const patientsData = [
  { name: "Jean A.", role: "Patient suivi", org: "Service: Cardiologie", tags: ["Suivi", "Hypertension"], avatar: "https://i.pravatar.cc/120?img=5", age: 45, phone: "+2290100000001", lastConsult: "12/03/2026" },
  { name: "Marie B.", role: "Patiente suivie", org: "Service: Medecine generale", tags: ["Controle", "Diabete"], avatar: "https://i.pravatar.cc/120?img=8", age: 37, phone: "+2290100000002", lastConsult: "02/03/2026", featured: true },
  { name: "Paul C.", role: "Patient suivi", org: "Service: Pneumologie", tags: ["Asthme", "Traitement"], avatar: "https://i.pravatar.cc/120?img=11", age: 52, phone: "+2290100000003", lastConsult: "27/02/2026" },
  { name: "Amina D.", role: "Patiente suivie", org: "Service: Endocrinologie", tags: ["Suivi", "Bilan"], avatar: "https://i.pravatar.cc/120?img=47", age: 31, phone: "+2290100000004", lastConsult: "10/03/2026" },
  { name: "David K.", role: "Patient suivi", org: "Service: Neurologie", tags: ["Consultation"], avatar: "https://i.pravatar.cc/120?img=20", age: 50, phone: "+2290100000005", lastConsult: "01/03/2026" },
  { name: "Lisa A.", role: "Patiente suivie", org: "Service: Gynecologie", tags: ["Prevention"], avatar: "https://i.pravatar.cc/120?img=16", age: 34, phone: "+2290100000006", lastConsult: "25/02/2026" },
  { name: "Nina H.", role: "Patiente suivie", org: "Service: Dermatologie", tags: ["Suivi"], initials: "NH", age: 33, phone: "+2290100000007", lastConsult: "11/03/2026", featured: true },
  { name: "Chris M.", role: "Patient suivi", org: "Service: Urologie", tags: ["Controle"], initials: "CM", age: 39, phone: "+2290100000008", lastConsult: "07/03/2026" },
  { name: "Olivia S.", role: "Patiente suivie", org: "Service: ORL", tags: ["Traitement"], avatar: "https://i.pravatar.cc/120?img=68", age: 28, phone: "+2290100000009", lastConsult: "01/03/2026" },
  { name: "Sarah W.", role: "Patiente suivie", org: "Service: Cardiologie", tags: ["Suivi"], avatar: "https://i.pravatar.cc/120?img=32", age: 42, phone: "+2290100000010", lastConsult: "22/02/2026" },
  { name: "James V.", role: "Patient suivi", org: "Service: Rhumatologie", tags: ["Bilan"], avatar: "https://i.pravatar.cc/120?img=14", age: 29, phone: "+2290100000011", lastConsult: "20/02/2026" },
  { name: "Fatou L.", role: "Patiente suivie", org: "Service: Pediatrie", tags: ["Controle"], avatar: "https://i.pravatar.cc/120?img=39", age: 41, phone: "+2290100000012", lastConsult: "18/02/2026" }
];

const MesPatientsMedecin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid'); // 'grid' ou 'list'

  // Filtrer les patients selon la recherche
  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return patientsData;
    return patientsData.filter(p =>
      [p.name, p.role, p.org, ...(p.tags || []), String(p.age), p.lastConsult]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  // Rendu avatar (image ou initiales)
  const renderAvatar = (patient) => {
    if (patient.initials) {
      return <div className="mes-patients-avatar-initials">{patient.initials}</div>;
    }
    return <img className="mes-patients-avatar" src={patient.avatar} alt={patient.name} />;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="content page-tight mes-patients-main">
      <section className="page-title-card">
        <h1>Mes patients</h1>
      </section>

      <section className="mes-patients-toolbar">
        <label className="mes-patients-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="mes-patients-toolbar-right">
          <div className="mes-patients-view-switch">
            <button
              className={`mes-patients-view-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
            >
              <i className="fa-solid fa-table-cells-large"></i>
            </button>
            <button
              className={`mes-patients-view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
          <button className="mes-patients-filter-btn">
            <i className="fa-solid fa-filter"></i> Filtrer <i className="fa-solid fa-caret-down"></i>
          </button>
        </div>
      </section>

      {/* Vue grille */}
      <section className={`mes-patients-view ${view === 'grid' ? 'active' : ''}`}>
        <div className="mes-patients-cards">
          {filteredPatients.map((patient, idx) => (
            <article key={idx} className={`mes-patients-card ${patient.featured ? 'featured' : ''}`}>
              <div className="mes-patients-card-main">
                <div className="mes-patients-card-head">
                  <button className="mes-patients-star-btn"><i className="fa-regular fa-star"></i></button>
                </div>
                <div className="mes-patients-avatar-wrap">{renderAvatar(patient)}</div>
                <h3 className="mes-patients-name">{patient.name}</h3>
                <p className="mes-patients-role">{patient.role}</p>
                <p className="mes-patients-org">{patient.org}</p>
                <div className="mes-patients-tags">
                  {patient.tags?.map((tag, i) => (
                    <span key={i} className="mes-patients-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="mes-patients-actions">
                <a className="mes-patients-action-btn" href="/espacemedecin/votre-patient">
                  <i className="fa-solid fa-folder-open"></i>
                </a>
                <a className="mes-patients-action-btn" href={`tel:${patient.phone}`}>
                  <i className="fa-solid fa-phone"></i>
                </a>
                <a className="mes-patients-action-btn" href="/chat">
                  <i className="fa-regular fa-envelope"></i>
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="mes-patients-footer">
          <span>Affichage 1-{filteredPatients.length} sur {patientsData.length} patients</span>
          <div className="mes-patients-pager">
            <button className="mes-patients-pager-btn"><i className="fa-solid fa-chevron-left"></i></button>
            <button className="mes-patients-pager-btn active">1</button>
            <button className="mes-patients-pager-btn">2</button>
            <button className="mes-patients-pager-btn">3</button>
            <button className="mes-patients-pager-btn">4</button>
            <button className="mes-patients-pager-btn"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
      </section>

      {/* Vue liste */}
      <section className={`mes-patients-view mes-patients-list-section ${view === 'list' ? 'active' : ''}`}>
        <article className="mes-patients-list-card">
          <div className="mes-patients-list-table-wrap">
            <table className="mes-patients-list-table">
              <thead>
                <tr><th>Nom</th><th>Âge</th><th>Dernière consultation</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, idx) => (
                  <tr key={idx}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.lastConsult}</td>
                    <td>
                      <div className="mes-patients-list-actions">
                        <a className="icon-action" href="/espacemedecin/patients/dossier">
                          <i className="fa-solid fa-folder-open"></i>
                        </a>
                        <a className="icon-action" href={`tel:${patient.phone}`}>
                          <i className="fa-solid fa-phone"></i>
                        </a>
                        <a className="icon-action" href="/chat">
                          <i className="fa-regular fa-envelope"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mes-patients-list-footer">
            <span className="table-meta">{filteredPatients.length} patients suivis</span>
            <div className="mes-patients-list-pagination">
              <span className="mes-patients-list-page">Précédent</span>
              <span className="mes-patients-list-page active">1</span>
              <span className="mes-patients-list-page">Suivant</span>
            </div>
          </div>
        </article>
      </section>

      <button className="mes-patients-floating-top" onClick={scrollToTop}>
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </main>
  );
};

export default MesPatientsMedecin;