import React, { useEffect, useMemo, useState } from 'react';
import { getConsultations, getMesConsultationsEtablissement } from '../../api';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';

function statusLabel(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('termin') || raw === 'done') return 'Effectue';
  if (raw.includes('attente') || raw === 'pending') return 'En attente';
  return 'A venir';
}

function statusClass(value) {
  const label = statusLabel(value);
  if (label === 'Effectue') return 'rdv-status done';
  if (label === 'En attente') return 'rdv-status pending';
  return 'rdv-status upcoming';
}

function normalizeConsultation(row) {
  const date = row.date_consultation ? new Date(row.date_consultation) : null;
  return {
    id: row.id,
    date: date ? date.toLocaleDateString('fr-FR') : '-',
    heure: date ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-',
    medecin: valueAt(row, 'medecin.user.name', 'Medecin'),
    patient: valueAt(row, 'dossier.patient.user.name', 'Patient'),
    motif: row.motif || row.type_consultation || 'Consultation',
    statut: statusLabel(row.statut),
  };
}

export default function DynamicAppointmentsTable({ title = 'Rendez-vous medicaux', useEtablissementScope = false }) {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadAppointments() {
      setLoading(true);
      setError('');
      try {
        let response = null;
        if (useEtablissementScope) {
          try {
            response = await getMesConsultationsEtablissement({ per_page: 100 });
          } catch {
            response = null;
          }
        }
        if (!response) response = await getConsultations({ per_page: 100 });
        if (mounted) setAppointments(unwrapList(response).rows.map(normalizeConsultation));
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAppointments();
    return () => {
      mounted = false;
    };
  }, [useEtablissementScope]);

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((rdv) => Object.values(rdv).join(' ').toLowerCase().includes(term));
  }, [appointments, searchTerm]);

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>{title}</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche rendez-vous">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Chercher un rendez-vous..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Patient</th>
                  <th>Medecin</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6" className="text-center p-4">Chargement...</td></tr>}
                {!loading && filteredAppointments.length === 0 && <tr><td colSpan="6" className="text-center p-4">Aucun rendez-vous trouve.</td></tr>}
                {filteredAppointments.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{rdv.date}</td>
                    <td>{rdv.heure}</td>
                    <td>{rdv.patient}</td>
                    <td>{rdv.medecin}</td>
                    <td>{rdv.motif}</td>
                    <td><span className={statusClass(rdv.statut)}>{rdv.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredAppointments.length} rendez-vous affiche(s) sur {appointments.length}</span>
          </div>
        </article>
      </section>
    </main>
  );
}
