import React, { useEffect, useMemo, useState } from 'react';
import { getMesConsultations } from '../../api/patientApi';
import { formatDateTime, unwrapRows } from './patientDashboardData';

const AccesDonnees = () => {
  const [consultations, setConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMesConsultations({ per_page: 100 })
      .then((response) => {
        if (active) setConsultations(unwrapRows(response));
      })
      .catch((error) => {
        if (active) {
          setMessage(error?.response?.data?.message || 'Impossible de charger les acces a vos donnees.');
          setConsultations([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const medecinsAutorises = useMemo(() => {
    const byId = new Map();
    consultations.forEach((consultation) => {
      const medecin = consultation.medecin;
      const id = medecin?.id || consultation.medecin_id;
      if (!id) return;
      const current = byId.get(id);
      const date = consultation.date_consultation;
      if (!current || new Date(date) > new Date(current.derniereConsultation || 0)) {
        byId.set(id, {
          id,
          nom: medecin?.user?.name || consultation.medecin?.name || 'Medecin',
          specialite: medecin?.specialite?.nom || consultation.service?.nom || '-',
          derniereConsultation: date,
          statut: consultation.statut || 'consulte',
        });
      }
    });
    return [...byId.values()].sort((a, b) => new Date(b.derniereConsultation || 0) - new Date(a.derniereConsultation || 0));
  }, [consultations]);

  const journal = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const rows = consultations.map((consultation) => ({
      id: consultation.id,
      date: consultation.date_consultation,
      medecin: consultation.medecin?.user?.name || 'Medecin',
      specialite: consultation.medecin?.specialite?.nom || consultation.service?.nom || '-',
      section: consultation.diagnostic || consultation.observations ? 'Dossier complet' : 'Rendez-vous medical',
      statut: consultation.statut || 'en_attente',
    }));

    return rows
      .filter((row) => !query || [row.medecin, row.specialite, row.section, row.statut].join(' ').toLowerCase().includes(query))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [consultations, searchTerm]);

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Acces a mes donnees</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche medecin">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un acces..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="dossier-head" style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--teal)', marginRight: '8px' }}></i>
              Medecins lies a mon dossier
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Liste construite depuis vos consultations et prescriptions enregistrees.
            </p>
          </div>
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Medecin</th>
                  <th>Specialite</th>
                  <th>Dernier acces medical</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && medecinsAutorises.map((medecin) => (
                  <tr key={medecin.id}>
                    <td className="table-title-cell">{medecin.nom}</td>
                    <td>{medecin.specialite}</td>
                    <td className="table-nowrap">{formatDateTime(medecin.derniereConsultation)}</td>
                    <td><span className="badge badge-info">{medecin.statut === 'termine' ? 'Consulte' : 'Autorise'}</span></td>
                  </tr>
                ))}
                {!loading && medecinsAutorises.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>Aucun medecin lie a votre dossier.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{medecinsAutorises.length} medecins repertories</span>
          </div>
        </article>
      </section>

      <section className="rdv-section" style={{ marginTop: '24px' }}>
        <article className="rdv-card">
          <div className="dossier-head" style={{ padding: '20px 20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>
              <i className="fa-regular fa-clock" style={{ color: 'var(--teal)', marginRight: '8px' }}></i>
              Journal des consultations de mon dossier
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Historique dynamique de vos consultations medicales.
            </p>
          </div>
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date et heure</th>
                  <th>Medecin</th>
                  <th>Specialite</th>
                  <th>Section consultee</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && journal.map((row) => (
                  <tr key={row.id}>
                    <td className="table-nowrap">{formatDateTime(row.date)}</td>
                    <td className="table-title-cell">{row.medecin}</td>
                    <td>{row.specialite}</td>
                    <td>{row.section}</td>
                    <td><span className="badge badge-info">{row.statut}</span></td>
                  </tr>
                ))}
                {!loading && journal.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>Aucun acces trouve.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{journal.length} acces enregistres</span>
          </div>
        </article>
      </section>
    </main>
  );
};

export default AccesDonnees;
