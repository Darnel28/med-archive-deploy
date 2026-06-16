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
   const [showAddModal, setShowAddModal] = useState(false);

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
        <button className="btn transfer-add-btn" onClick={() => setShowAddModal(true)}>
            <i ></i> Ajouter une demande 
          </button>
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
        {showAddModal && (
  <div
    className="custom-modal-overlay"
    onClick={() => setShowAddModal(false)}
  >
    <div
      className="custom-modal"
      onClick={(e) => e.stopPropagation()}
    >
     <div className="custom-modal-header">
  <h3>Ajouter une demande d'examen</h3>
</div>

<div className="custom-modal-body">
  <div className="form-grid">

    <div className="form-group">
      <label>Patient *</label>
      <select name="patient_id">
        <option value="">Sélectionner un patient</option>
        <option value="1">Jean Dupont</option>
        <option value="2">Marie Koffi</option>
        <option value="3">Paul Mensah</option>
      </select>
    </div>

    <div className="form-group">
      <label>Type d'analyse *</label>
      <select name="type_analyse">
        <option value="">Sélectionner une analyse</option>
        <option value="NFS">NFS</option>
        <option value="Glycemie">Glycémie</option>
        <option value="Creatinine">Créatinine</option>
        <option value="Uree">Urée</option>
        <option value="ECBU">ECBU</option>
        <option value="Bilan_hepatique">Bilan hépatique</option>
        <option value="Bilan_lipidique">Bilan lipidique</option>
        <option value="TSH">TSH</option>
      </select>
    </div>

  </div>
</div>

      <div className="custom-modal-footer">
        <button
          className="btn-cancel"
          onClick={() => setShowAddModal(false)}
        >
          Annuler
        </button>

        <button className="btn-save">
          Enregistrer
        </button>
      </div>
    </div>
  </div>
)}

<style>
  {`
  .custom-modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
}

.custom-modal{
  width:90%;
  max-width:650px;
  background:#fff;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.15);
}

.custom-modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:20px 24px;
  border-bottom:1px solid #e5e7eb;
}

.custom-modal-header h3{
  margin:0;
  font-size:28px;
  font-weight:600;
}

.custom-modal-body{
  padding:24px;
}

.form-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
}

.form-group{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.form-group label{
  font-size:15px;
  font-weight:500;
  color:#1e2a4a;
}

.form-group select{
  width:100%;
  height:48px;
  border:1px solid #d9e1ea;
  border-radius:12px;
  padding:0 14px;
  font-size:15px;
  background:#fff;
}

.form-group select:focus{
  outline:none;
  border-color:#13c3b8;
}

.custom-modal-footer{
  display:flex;
  justify-content:flex-end;
  gap:12px;
  padding:20px 24px;
  border-top:1px solid #e5e7eb;
}

.btn-cancel{
  border:none;
  background:#f1f5f9;
  color:#64748b;
  padding:12px 20px;
  border-radius:12px;
  cursor:pointer;
  font-weight:600;
}

.btn-save{
  border:none;
  background:#13c3b8;
  color:#fff;
  padding:12px 24px;
  border-radius:12px;
  cursor:pointer;
  font-weight:600;
}

.btn-save:hover{
  opacity:.9;
}

@media (max-width:768px){
  .custom-modal{
    max-width:95%;
  }

  .form-grid{
    grid-template-columns:1fr;
  }
}
  `}
  </style>
    </main>
  );
}
