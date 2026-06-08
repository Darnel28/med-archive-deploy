import React, { useEffect, useMemo, useState } from 'react';
import { getMesMedecinsEtablissement, listMedecins } from '../../api';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';

function normalizeDoctor(row) {
  const stats = row.statistiques || {};
  return {
    id: row.id,
    name: row.nom || row.user?.name || row.name || '-',
    email: row.email || row.user?.email || '-',
    phone: row.telephone || row.user?.telephone || '-',
    specialite: row.specialite?.nom || row.specialite || '-',
    experience: row.annees_experience ?? row.medecin?.annees_experience ?? 0,
    patients: stats.patients_actifs ?? row.patients_count ?? '-',
    consultations: stats.consultations_mois ?? row.consultations_count ?? '-',
    etablissement: row.etablissement?.name || valueAt(row, 'user.etablissement.name', '-'),
  };
}

export default function DynamicDoctorsTable({ title = 'Medecins', useEtablissementScope = false }) {
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const [isModalOpen, setIsModalOpen] = useState(false);

const [newDoctor, setNewDoctor] = useState({
  nom: '',
  email: '',
  telephone: '',
  specialite: '',
  experience: '',
});
  useEffect(() => {
    let mounted = true;

    async function loadDoctors() {
      setLoading(true);
      setError('');
      try {
        let response = null;
        if (useEtablissementScope) {
          try {
            response = await getMesMedecinsEtablissement();
          } catch {
            response = null;
          }
        }
        if (!response) response = await listMedecins({ per_page: 100 });
        const rows = unwrapList(response).rows.map(normalizeDoctor);
        if (mounted) setDoctors(rows);
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDoctors();
    return () => {
      mounted = false;
    };
  }, [useEtablissementScope]);

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) => Object.values(doctor).join(' ').toLowerCase().includes(term));
  }, [doctors, search]);

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>{title}</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche medecins">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Chercher un medecin..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button
  className="btn transfer-add-btn"
  type="button"
  onClick={() => setIsModalOpen(true)}
>
  <i></i>
  Ajouter un médecin
</button>
        
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Specialite</th>
                  <th>Telephone</th>
                  <th>Experience</th>
                  <th>Patients</th>
                  <th>Consultations mois</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6" className="text-center p-4">Chargement...</td></tr>}
                {!loading && filteredDoctors.length === 0 && <tr><td colSpan="6" className="text-center p-4">Aucun medecin trouve.</td></tr>}
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="table-title-cell">
                      <strong>{doctor.name}</strong><br />
                      <span className="table-meta">{doctor.email}</span>
                    </td>
                    <td>{doctor.specialite}</td>
                    <td className="table-nowrap">{doctor.phone}</td>
                    <td className="table-nowrap">{doctor.experience} an(s)</td>
                    <td className="table-nowrap">{doctor.patients}</td>
                    <td className="table-nowrap">{doctor.consultations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredDoctors.length} medecin(s) affiche(s) sur {doctors.length}</span>
          </div>
        </article>
      </section>
      {isModalOpen && (
  <div
    className="doctor-modal-overlay"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="doctor-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="doctor-modal-header">
        <h3>Ajouter un médecin</h3>

        <button
          className="doctor-modal-close"
          type="button"
          onClick={() => setIsModalOpen(false)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="doctor-modal-body">

        <div className="doctor-form-group">
          <label>Nom complet</label>
          <input
            type="text"
            value={newDoctor.nom}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                nom: e.target.value,
              })
            }
          />
        </div>

        <div className="doctor-form-group">
          <label>Email</label>
          <input
            type="email"
            value={newDoctor.email}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                email: e.target.value,
              })
            }
          />
        </div>

        <div className="doctor-form-group">
          <label>Téléphone</label>
          <input
            type="text"
            value={newDoctor.telephone}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                telephone: e.target.value,
              })
            }
          />
        </div>

        <div className="doctor-form-group">
          <label>Spécialité</label>
          <input
            type="text"
            value={newDoctor.specialite}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                specialite: e.target.value,
              })
            }
          />
        </div>

        <div className="doctor-form-group">
          <label>Années d'expérience</label>
          <input
            type="number"
            value={newDoctor.experience}
            onChange={(e) =>
              setNewDoctor({
                ...newDoctor,
                experience: e.target.value,
              })
            }
          />
        </div>

      </div>

      <div className="doctor-modal-footer">
        <button
          type="button"
          className="doctor-btn-cancel"
          onClick={() => setIsModalOpen(false)}
        >
          Annuler
        </button>

        <button
          type="button"
          className="doctor-btn-save"
        >
          Enregistrer
        </button>
      </div>
    </div>
  </div>
)}
<style>
  {`
    .doctor-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .doctor-modal {
      width: 100%;
      max-width: 500px;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0,0,0,.12);
    }
    .doctor-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 22px;
      border-bottom: 1px solid #eef2f6;
    }
    .doctor-modal-header h3 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 600;
    }
    .doctor-modal-close {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;      /* ← couleur visible (gris bleuté) */
  transition: all 0.2s;
}
.doctor-modal-close:hover {
  background: #f1f5f9; /* fond gris clair au survol */
  color: #0f172a;      /* devient plus foncé */
}
    .doctor-modal-body {
      padding: 20px 22px;
    }
    .doctor-form-group {
      margin-bottom: 12px;
    }
    .doctor-form-group label {
      display: block;
      margin-bottom: 5px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
    }
    .doctor-form-group input,
    .doctor-form-group select {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border: 1px solid #dbe2ea;
      border-radius: 10px;
      font-size: 0.9rem;
    }
    .doctor-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 22px;
      border-top: 1px solid #eef2f6;
    }
    .doctor-btn-cancel,
    .doctor-btn-save {
      height: 40px;
      padding: 0 16px;
      font-size: 0.9rem;
      border-radius: 10px;
      cursor: pointer;
      border: none;
    }
    .doctor-btn-cancel {
      background: #f1f5f9;
      color: #1e293b;
    }
    .doctor-btn-save {
      background: #0f9f9b;
      color: white;
    }
  `}
</style>
    </main>
  );
}
