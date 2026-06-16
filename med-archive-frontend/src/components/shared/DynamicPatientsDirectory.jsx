import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { createPatient, getMesPatientsEtablissement, getPatients as getAllPatients } from '../../api';
import { getPatients as getDoctorPatients } from '../../api/medecinApi';
import { getMesPatientsService } from '../../api/serviceApi';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';
import AvatarInitials from '../AvatarInitials.jsx';
import Pagination, { DEFAULT_PAGE_SIZE, paginateRows } from './Pagination.jsx';

function normalizeAuthPayload(value) {
  return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || null;
}

function extractMedecinId(auth) {
  return auth?.medecin?.id || auth?.user?.medecin?.id || auth?.medecin_id || auth?.user?.medecin_id || null;
}

function ageFromDate(value) {
  if (!value) return '-';
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function normalizePatient(row) {
  const patient = row.patient || row;
  const user = patient.user || row.user || {};
  const dossier = patient.dossier || row.dossier || {};
  return {
    id: patient.id || row.id,
    name: user.name || row.name || patient.name || '-',
    role: patient.groupe_sanguin ? `Groupe ${patient.groupe_sanguin}` : 'Patient suivi',
    org: dossier.numero_dossier ? `Dossier: ${dossier.numero_dossier}` : `IMU: ${patient.imu || '-'}`,
    tags: [patient.groupe_sanguin, patient.allergies ? 'Allergies' : null, dossier.statut].filter(Boolean),
    age: ageFromDate(user.date_naissance || patient.date_naissance),
    phone: user.telephone || row.telephone || '',
    lastConsult: row.derniere_consultation || patient.derniere_consultation || dossier.updated_at || patient.updated_at || '-',
  };
}

export default function DynamicPatientsDirectory({ title = 'Patients', source = 'all', detailPath = '/espaceaccueil/dossier-patient' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    npi: '',
    name: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    ville: '',
    date_naissance: '',
    sexe: 'M',
    groupe_sanguin: '',
    allergies: '',
    antecedents_medicaux: '',
    personne_contact: '',
    telephone_contact: '',
    profession: '',
    nationalite: 'Beninoise',
    lieu_naissance: '',
  });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');

  async function loadPatients() {
    setLoading(true);
    setError('');
    try {
      let response = null;
      if (source === 'doctor') {
        let auth = normalizeAuthPayload(getAuthUser());
        let medecinId = extractMedecinId(auth);
        if (!medecinId) {
          auth = normalizeAuthPayload(await getCurrentUser());
          medecinId = extractMedecinId(auth);
        }
        if (!medecinId) throw new Error('Impossible d identifier le medecin connecte.');
        response = await getDoctorPatients(medecinId);
      } else if (source === 'etablissement') {
        try {
          response = await getMesPatientsEtablissement({ per_page: 1000 });
        } catch {
          response = await getAllPatients({ per_page: 1000 });
        }
      } else if (source === 'service') {
        response = await getMesPatientsService({ per_page: 1000 });
      } else {
        response = await getAllPatients({ per_page: 1000 });
      }
      setPatients(unwrapList(response).rows.map(normalizePatient));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    loadPatients();
    return () => {
      mounted = false;
    };
  }, [source]);

  function updatePatientForm(event) {
    const { name, value } = event.target;
    setPatientForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreatePatient(event) {
    event.preventDefault();
    setModalSaving(true);
    setModalError('');
    setModalMessage('');

    const payload = Object.fromEntries(
      Object.entries(patientForm).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );
    if (!payload.password) delete payload.password;
    if (!payload.groupe_sanguin) delete payload.groupe_sanguin;

    try {
      const response = await createPatient(payload);
      setModalMessage(response?.message || 'Patient cree avec succes.');
      await loadPatients();
      setTimeout(() => setShowAddModal(false), 900);
    } catch (err) {
      setModalError(apiErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((patient) => [patient.name, patient.role, patient.org, ...(patient.tags || []), String(patient.age), patient.lastConsult].join(' ').toLowerCase().includes(query));
  }, [patients, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, patients.length, view]);

  const paginatedPatients = useMemo(() => paginateRows(filteredPatients, page, DEFAULT_PAGE_SIZE), [filteredPatients, page]);

  const renderAvatar = (patient) => <AvatarInitials name={patient.name} size={72} bgColor="#13c3b8" />;

  return (
    <main className="content page-tight mes-patients-main">
      <section className="page-title-card">
        <h1>{title}</h1>
      </section>

      <section className="mes-patients-toolbar">
        <label className="mes-patients-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className="mes-patients-toolbar-right">
          <div className="mes-patients-view-switch">
            <button className={`mes-patients-view-btn ${view === 'grid' ? 'active' : ''}`} type="button" onClick={() => setView('grid')}>
              <i className="fa-solid fa-table-cells-large"></i>
            </button>
            <button className={`mes-patients-view-btn ${view === 'list' ? 'active' : ''}`} type="button" onClick={() => setView('list')}>
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
          <button className="btn transfer-add-btn" onClick={() => setShowAddModal(true)}>
            <i ></i> Ajouter un patient
          </button>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className={`mes-patients-view ${view === 'grid' ? 'active' : ''}`}>
        {loading && <p className="table-meta p-4">Chargement des patients...</p>}
        {!loading && filteredPatients.length === 0 && <p className="table-meta p-4">Aucun patient trouve.</p>}
        <div className="mes-patients-cards">
          {paginatedPatients.rows.map((patient) => (
            <article key={patient.id} className="mes-patients-card">
              <div className="mes-patients-card-main">
                <div className="mes-patients-avatar-wrap">{renderAvatar(patient)}</div>
                <h3 className="mes-patients-name">{patient.name}</h3>
                <p className="mes-patients-role">{patient.role}</p>
                <p className="mes-patients-org">{patient.org}</p>
                <div className="mes-patients-tags">
                  {patient.tags.map((tag) => <span key={tag} className="mes-patients-tag">{tag}</span>)}
                </div>
              </div>
              <div className="mes-patients-actions">
                <Link className="mes-patients-action-btn" to={`${detailPath}?patient_id=${patient.id}`}>
                  <i className="fa-solid fa-folder-open"></i>
                </Link>
                {patient.phone && <a className="mes-patients-action-btn" href={`tel:${patient.phone}`}><i className="fa-solid fa-phone"></i></a>}
              </div>
            </article>
          ))}
        </div>
        <div className="mes-patients-footer">
          <span>
            {filteredPatients.length === 0 ? 0 : paginatedPatients.start + 1}-{paginatedPatients.end} patient(s) affiche(s) sur {filteredPatients.length}
          </span>
          <Pagination page={paginatedPatients.page} totalItems={filteredPatients.length} onPageChange={setPage} />
        </div>
        
      </section>

      <section className={`mes-patients-view mes-patients-list-section ${view === 'list' ? 'active' : ''}`}>
        <article className="mes-patients-list-card">
          <div className="mes-patients-list-table-wrap">
            <table className="mes-patients-list-table">
              <thead>
                <tr><th>Nom</th><th>Age</th><th>Dossier / IMU</th><th>Derniere mise a jour</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginatedPatients.rows.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.org}</td>
                    <td>{patient.lastConsult ? new Date(patient.lastConsult).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>
                      <div className="mes-patients-list-actions">
                        <Link className="icon-action" to={`${detailPath}?patient_id=${patient.id}`}><i className="fa-solid fa-folder-open"></i></Link>
                        {patient.phone && <a className="icon-action" href={`tel:${patient.phone}`}><i className="fa-solid fa-phone"></i></a>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredPatients.length === 0 && <tr><td colSpan="5">Aucun patient trouve.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mes-patients-list-footer">
            <span className="table-meta">
              {filteredPatients.length === 0 ? 0 : paginatedPatients.start + 1}-{paginatedPatients.end} patients suivis sur {filteredPatients.length}
            </span>
            <Pagination page={paginatedPatients.page} totalItems={filteredPatients.length} onPageChange={setPage} />
          </div>
        </article>
      </section>
      {showAddModal && (
        <div className="custom-modal-overlay" onClick={() => setShowAddModal(false)}>
          <form className="custom-modal custom-modal-wide" onSubmit={handleCreatePatient} onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>Ajouter un patient</h3>
              <button className="custom-modal-close" type="button" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="custom-modal-body custom-modal-grid">
              {modalError && <p className="modal-alert modal-alert-error">{modalError}</p>}
              {modalMessage && <p className="modal-alert modal-alert-success">{modalMessage}</p>}

              <div className="form-group"><label>NPI</label><input name="npi" type="text" value={patientForm.npi} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Nom complet</label><input name="name" type="text" value={patientForm.name} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Email</label><input name="email" type="email" value={patientForm.email} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Mot de passe initial</label><input name="password" type="text" value={patientForm.password} onChange={updatePatientForm} placeholder="Genere automatiquement si vide" /></div>
              <div className="form-group"><label>Telephone</label><input name="telephone" type="tel" value={patientForm.telephone} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Date de naissance</label><input name="date_naissance" type="date" value={patientForm.date_naissance} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Sexe</label><select name="sexe" value={patientForm.sexe} onChange={updatePatientForm} required><option value="M">Masculin</option><option value="F">Feminin</option></select></div>
              <div className="form-group"><label>Groupe sanguin</label><select name="groupe_sanguin" value={patientForm.groupe_sanguin} onChange={updatePatientForm}><option value="">Non renseigne</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group} value={group}>{group}</option>)}</select></div>
              <div className="form-group"><label>Ville</label><input name="ville" type="text" value={patientForm.ville} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Adresse</label><input name="adresse" type="text" value={patientForm.adresse} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Personne a contacter</label><input name="personne_contact" type="text" value={patientForm.personne_contact} onChange={updatePatientForm} /></div>
              <div className="form-group"><label>Telephone contact</label><input name="telephone_contact" type="tel" value={patientForm.telephone_contact} onChange={updatePatientForm} /></div>
              <div className="form-group"><label>Profession</label><input name="profession" type="text" value={patientForm.profession} onChange={updatePatientForm} /></div>
              <div className="form-group"><label>Lieu de naissance</label><input name="lieu_naissance" type="text" value={patientForm.lieu_naissance} onChange={updatePatientForm} /></div>
              <div className="form-group form-group-full"><label>Allergies</label><textarea name="allergies" rows="2" value={patientForm.allergies} onChange={updatePatientForm} /></div>
              <div className="form-group form-group-full"><label>Antecedents medicaux</label><textarea name="antecedents_medicaux" rows="2" value={patientForm.antecedents_medicaux} onChange={updatePatientForm} /></div>
            </div>

            <div className="custom-modal-footer">
              <button className="btn-cancel" type="button" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn-save" type="submit" disabled={modalSaving}>{modalSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}<style>
  {`
  .add-patient-btn{
  display:flex;
  align-items:center;
  gap:8px;
  padding:10px 18px;
  border:none;
  border-radius:12px;
  background:#13c3b8;
  color:#fff;
  font-weight:600;
  cursor:pointer;
}

.add-patient-btn:hover{
  opacity:.9;
}

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
  width:100%;
  max-width:500px;
  background:#fff;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.15);
}

.custom-modal-wide{
  max-width:860px;
}

.custom-modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:18px 22px;
  border-bottom:1px solid #e5e7eb;
}

.custom-modal-close{
  border:none;
  background:none;
  font-size:20px;
  cursor:pointer;
}

.custom-modal-body{
  padding:22px;
}

.custom-modal-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
  max-height:65vh;
  overflow:auto;
}

.form-group-full,
.modal-alert{
  grid-column:1 / -1;
}

.modal-alert{
  margin:0;
  padding:10px 12px;
  border-radius:8px;
}

.modal-alert-error{
  color:#b42318;
  background:#fff1f0;
}

.modal-alert-success{
  color:#027a48;
  background:#ecfdf3;
}

.form-group{
  display:flex;
  flex-direction:column;
  gap:6px;
  margin-bottom:16px;
}

.form-group input,
.form-group select,
.form-group textarea{
  border:1px solid #d9e1ea;
  border-radius:10px;
  padding:10px 14px;
  font:inherit;
}

.form-group input,
.form-group select{
  height:44px;
}

.custom-modal-footer{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  padding:18px 22px;
  border-top:1px solid #e5e7eb;
}

.btn-cancel{
  border:none;
  padding:10px 18px;
  border-radius:10px;
  cursor:pointer;
}

.btn-save{
  border:none;
  padding:10px 18px;
  border-radius:10px;
  background:#13c3b8;
  color:#fff;
  cursor:pointer;
}

.btn-save:disabled{
  opacity:.65;
  cursor:not-allowed;
}

@media (max-width:720px){
  .custom-modal-grid{
    grid-template-columns:1fr;
  }
}
  `}
  </style>
    </main>
  );
}
