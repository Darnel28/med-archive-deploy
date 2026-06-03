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
    </main>
  );
}
