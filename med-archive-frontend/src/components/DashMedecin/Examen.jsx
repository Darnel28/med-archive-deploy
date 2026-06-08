import { useEffect, useMemo, useState } from 'react';
import { getAnalyses } from '../../api/analyseApi';
import { getCurrentUser } from '../../api/authApi';
import { getAuthUser } from '../../api/client';
import Pagination, { DEFAULT_PAGE_SIZE, paginateRows } from '../shared/Pagination.jsx';

function unwrapUser(value) {
  return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || {};
}

function medecinId(value) {
  const user = unwrapUser(value);
  return user?.medecin?.id || user?.medecin_id || null;
}

function unwrapRows(value) {
  if (Array.isArray(value?.data?.data?.data)) return value.data.data.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  if (Array.isArray(value?.data)) return value.data;
  return Array.isArray(value) ? value : [];
}

function patientName(item) {
  return item?.consultation?.dossier?.patient?.user?.name || 'Patient';
}

function statusInfo(status) {
  const values = {
    prescrit: ['Prescrit', 'rdv-status pending'],
    preleve: ['Prélevé', 'rdv-status upcoming'],
    en_cours: ['En cours', 'rdv-status upcoming'],
    termine: ['Terminé', 'rdv-status done'],
  };
  return values[status] || [status || 'Inconnu', 'rdv-status'];
}

export default function ExamensMedecin() {
  const [analyses, setAnalyses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        let id = medecinId(getAuthUser());
        if (!id) id = medecinId(await getCurrentUser());
        const response = await getAnalyses({ prescripteur_id: id, per_page: 100 });
        if (active) setAnalyses(unwrapRows(response));
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || requestError.message || 'Impossible de charger les demandes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return analyses.filter((item) => !query || `${patientName(item)} ${item.type_analyse || ''} ${item.laboratoire?.user?.name || ''}`.toLowerCase().includes(query));
  }, [analyses, search]);
  const pagination = useMemo(() => paginateRows(filtered, page, DEFAULT_PAGE_SIZE), [filtered, page]);

  useEffect(() => setPage(1), [search]);

  return (
    <main className="content page-tight">
      <section className="page-title-card"><h1>Mes demandes d'examens</h1></section>
      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche patient">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un patient ou un examen..." />
        </label>
      </section>
      {error && <div className="alert alert-danger">{error}</div>}
      <section className="rdv-section"><article className="rdv-card">
        <div className="rdv-table-wrap"><table className="rdv-table" aria-label="Demandes d'examens">
          <thead><tr><th>Patient</th><th>Examen demandé</th><th>Laboratoire</th><th>Date de prélèvement</th><th>Statut</th><th>Résultat</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6">Chargement...</td></tr>}
            {!loading && pagination.rows.map((item) => {
              const [label, className] = statusInfo(item.statut);
              return <tr key={item.id}>
                <td>{patientName(item)}</td>
                <td>{item.type_analyse}</td>
                <td>{item.laboratoire?.user?.name || 'Non assigné'}</td>
                <td>{item.date_prelevement ? new Date(item.date_prelevement).toLocaleString('fr-FR') : 'À planifier'}</td>
                <td><span className={className}>{label}</span></td>
                <td>{item.statut === 'termine' ? (item.resultats?.commentaire || 'Disponible') : 'En attente'}</td>
              </tr>;
            })}
            {!loading && filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: 24 }}>Aucune demande d'examen prescrite.</td></tr>}
          </tbody>
        </table></div>
        <div className="table-footer">
          <span className="table-meta">{filtered.length} demande{filtered.length > 1 ? 's' : ''}</span>
          <Pagination page={pagination.page} totalItems={filtered.length} onPageChange={setPage} />
        </div>
      </article></section>
    </main>
  );
}
