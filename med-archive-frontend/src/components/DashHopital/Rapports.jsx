import React, { useEffect, useMemo, useState } from 'react';
import '../../assets/css/Hopital.css';
import { getMesConsultationsEtablissement, getTransfertDossiers } from '../../api';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';
import Pagination, { DEFAULT_PAGE_SIZE, paginateRows } from '../shared/Pagination.jsx';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeStatus(value) {
  if (!value) return 'En attente';
  const text = String(value).replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function firstValue(item, paths, fallback = '-') {
  for (const path of paths) {
    const value = valueAt(item, path, undefined);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

const Rapports = () => {
  const [transferts, setTransferts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = 'Audit hospitalier';
    let mounted = true;

    async function loadRapports() {
      setLoading(true);
      setError('');
      try {
        const [transfertsResponse, consultationsResponse] = await Promise.all([
          getTransfertDossiers({ per_page: 1000 }),
          getMesConsultationsEtablissement({ per_page: 1000 }),
        ]);
        if (!mounted) return;
        setTransferts(unwrapList(transfertsResponse).rows);
        setConsultations(unwrapList(consultationsResponse).rows);
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRapports();
    return () => {
      mounted = false;
    };
  }, []);

  const movements = useMemo(() => {
    const fromTransfers = transferts.map((item) => ({
      patient: firstValue(item, ['dossier.patient.user.name', 'dossier.numero_dossier'], 'Patient'),
      movement: 'Transfert',
      detail: `${firstValue(item, ['service_source.nom', 'serviceSource.nom'])} vers ${firstValue(item, ['service_destination.nom', 'serviceDestination.nom'], 'A affecter')}`,
      author: firstValue(item, ['demandeur.name', 'created_by.name', 'dossier.medecin_referent.user.name', 'dossier.medecinReferent.user.name']),
      timestamp: formatDateTime(item.date_demande || item.created_at || item.date_transfert || item.updated_at),
    }));

    const fromConsultations = consultations.map((item) => ({
      patient: valueAt(item, 'dossier.patient.user.name', 'Patient'),
      movement: item.type_consultation || 'Consultation',
      detail: item.motif || 'Consultation medicale',
      author: valueAt(item, 'medecin.user.name', '-'),
      timestamp: formatDateTime(item.date_consultation),
    }));

    return [...fromTransfers, ...fromConsultations].slice(0, 12);
  }, [consultations, transferts]);

  const serviceActivity = useMemo(() => {
    const counts = {};
    consultations.forEach((item) => {
      const service = item.service?.nom || item.medecin?.specialite?.nom || 'Consultation';
      counts[service] = (counts[service] || 0) + 1;
    });
    transferts.forEach((item) => {
      const service = firstValue(item, ['service_destination.nom', 'serviceDestination.nom'], '');
      if (service) counts[service] = (counts[service] || 0) + 1;
    });

    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts).map(([service, mouvements]) => ({
      service,
      entrants: transferts.filter((item) => firstValue(item, ['service_destination.nom', 'serviceDestination.nom'], '') === service).length,
      sortants: transferts.filter((item) => firstValue(item, ['service_source.nom', 'serviceSource.nom'], '') === service).length,
      mouvements,
      charge: Math.round((mouvements / max) * 100),
    }));
  }, [consultations, transferts]);

  const transferRows = useMemo(() => transferts.map((item) => ({
    id: item.id,
    patient: firstValue(item, ['dossier.patient.user.name', 'dossier.numero_dossier'], 'Patient'),
    fromService: firstValue(item, ['service_source.nom', 'serviceSource.nom']),
    toService: firstValue(item, ['service_destination.nom', 'serviceDestination.nom'], 'A affecter'),
    transferredBy: firstValue(item, ['demandeur.name', 'created_by.name']),
    referringDoctor: firstValue(item, ['dossier.medecin_referent.user.name', 'dossier.medecinReferent.user.name']),
    reason: item.motif || item.raison || '-',
    date: formatDateTime(item.date_demande || item.created_at || item.date_transfert || item.updated_at),
    status: normalizeStatus(item.statut),
  })), [transferts]);

  const paginatedTransfers = useMemo(() => paginateRows(transferRows, page, DEFAULT_PAGE_SIZE), [transferRows, page]);

  const highlights = [
    { label: 'Transferts effectues', value: transferts.length, trend: 'Total charge', icon: 'fa-arrow-right-arrow-left' },
    { label: 'Mouvements patients', value: movements.length, trend: 'Journal recent', icon: 'fa-person-walking-arrow-right' },
    { label: 'Services actifs', value: serviceActivity.length, trend: 'Avec activite', icon: 'fa-hospital' },
    { label: 'Consultations', value: consultations.length, trend: 'Etablissement', icon: 'fa-stethoscope' },
  ];

  const isEmpty = !loading && transferts.length === 0 && consultations.length === 0;

  return (
    <main className="audit-shell">
      <section className="audit-header">
        <div>
          <p className="audit-eyebrow">Rapports d'audit hospitalier</p>
          <h1>Transferts, mouvements patients et activite des services</h1>
          <p className="audit-subtitle">Vue consolidee des activites reelles de l'hopital.</p>
        </div>
        <div className="audit-date-chip">
          <i className="fa-regular fa-calendar-days"></i>
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-state-search"><i className="fa-solid fa-magnifying-glass"></i></div>
          <h2>Aucun rapport trouve</h2>
          <p>Aucune consultation ni transfert n'est encore disponible pour cet hopital.</p>
        </div>
      ) : (
        <>
          <section className="audit-kpi-grid">
            {highlights.map((item) => (
              <article className="audit-kpi-card" key={item.label}>
                <div className="audit-kpi-icon"><i className={`fa-solid ${item.icon}`}></i></div>
                <div className="audit-kpi-content">
                  <span className="audit-kpi-value">{loading ? '...' : item.value}</span>
                  <span className="audit-kpi-label">{item.label}</span>
                  <span className="audit-kpi-trend">{item.trend}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="audit-panels">
            <article className="audit-panel">
              <div className="audit-panel-head"><div><h2>Mouvements patients</h2><p>Journal des consultations et transferts.</p></div></div>
              <div className="movement-list">
                {loading && <p className="table-meta">Chargement...</p>}
                {!loading && movements.length === 0 && <p className="table-meta">Aucun mouvement trouve.</p>}
                {movements.map((movement) => (
                  <div className="movement-item" key={`${movement.patient}-${movement.timestamp}-${movement.detail}`}>
                    <div className="movement-marker"><i className="fa-solid fa-right-left"></i></div>
                    <div className="movement-content">
                      <div className="movement-top"><strong>{movement.patient}</strong><span>{movement.timestamp}</span></div>
                      <p>{movement.movement}</p>
                      <small>{movement.detail}</small>
                      <span className="movement-author">{movement.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="audit-panel">
              <div className="audit-panel-head"><div><h2>Activite des services</h2><p>Volume des mouvements observes.</p></div></div>
              <div className="activity-list">
                {!loading && serviceActivity.length === 0 && <p className="table-meta">Aucune activite de service trouvee.</p>}
                {serviceActivity.map((service) => (
                  <div className="activity-row" key={service.service}>
                    <div className="activity-row-top"><strong>{service.service}</strong><span>{service.mouvements} mouvements</span></div>
                    <div className="activity-bar"><span style={{ width: `${service.charge}%` }}></span></div>
                    <div className="activity-row-bottom">
                      <span>Entrants: {service.entrants}</span><span>Sortants: {service.sortants}</span><span>Charge: {service.charge}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="audit-panels audit-panels-bottom">
            <article className="audit-panel audit-panel-wide">
              <div className="audit-panel-head"><div><h2>Transferts effectues entre services</h2><p>Historique dynamique des demandes.</p></div></div>
              <div className="table-wrapper audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr><th>ID</th><th>Patient</th><th>Du service</th><th>Vers service</th><th>Qui a transfere</th><th>Medecin referent</th><th>Motif</th><th>Date</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan="9">Chargement...</td></tr>}
                    {!loading && transferRows.length === 0 && <tr><td colSpan="9">Aucun transfert trouve.</td></tr>}
                    {paginatedTransfers.rows.map((item) => (
                      <tr key={item.id}>
                        <td className="audit-id">{item.id}</td>
                        <td>{item.patient}</td>
                        <td>{item.fromService}</td>
                        <td>{item.toService}</td>
                        <td>{item.transferredBy}</td>
                        <td>{item.referringDoctor}</td>
                        <td>{item.reason}</td>
                        <td>{item.date}</td>
                        <td><span className="status-badge en-cours">{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span className="table-meta">{transferRows.length === 0 ? 0 : paginatedTransfers.start + 1}-{paginatedTransfers.end} transferts sur {transferRows.length}</span>
                <Pagination page={paginatedTransfers.page} totalItems={transferRows.length} onPageChange={setPage} />
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
};

export default Rapports;
