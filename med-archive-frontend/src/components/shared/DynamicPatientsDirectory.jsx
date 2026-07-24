import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { affecterDossierMedecin, createPatient, getMesPatientsEtablissement, getPatients as getAllPatients, listMedecins } from '../../api';
import { getPatients as getDoctorPatients } from '../../api/medecinApi';
import { getCurrentService, getMesPatientsService, getServices } from '../../api/serviceApi';
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
  const service = patient.service || row.service || {};
  const dossierServiceOwner = dossier.serviceProprietaire || dossier.service_proprietaire || {};
  const transferts = Array.isArray(dossier.transferts) ? dossier.transferts : [];
  const latestAcceptedTransfer = transferts
    .filter((transfer) => transfer.statut === 'accepte')
    .sort((left, right) => {
      const leftDate = new Date(left.date_approbation || left.updated_at || left.created_at || 0).getTime();
      const rightDate = new Date(right.date_approbation || right.updated_at || right.created_at || 0).getTime();
      return rightDate - leftDate;
    })[0] || null;
  return {
    id: patient.id || row.id,
    dossierId: dossier.id,
    serviceId: patient.service_id || service.id || row.service_id,
    dossierStatus: dossier.statut || '',
    dossierOwnerServiceId: dossier.service_proprietaire_id || dossierServiceOwner.id,
    transferStatus: latestAcceptedTransfer?.statut || '',
    transferSourceEtablissementId: latestAcceptedTransfer?.etablissement_source_id,
    transferDestinationEtablissementId: latestAcceptedTransfer?.etablissement_destination_id,
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
    service_id: '',
  });
  const [services, setServices] = useState([]);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [currentEtablissementId, setCurrentEtablissementId] = useState(null);
  const [assignPatient, setAssignPatient] = useState(null);
  const [assignForm, setAssignForm] = useState({ medecin_id: '', date_consultation: '', motif: 'Rendez-vous d affectation', observations: '' });
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const getMinDateTime = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
        const [patientsResponse, authResponse] = await Promise.all([
          getMesPatientsEtablissement({ per_page: 1000 }),
          getCurrentUser().catch(() => null),
        ]);
        const currentUser = normalizeAuthPayload(authResponse);
        response = patientsResponse;
        setCurrentEtablissementId(currentUser?.id || currentUser?.user?.id || null);
      } else if (source === 'service') {
        const [patientsResponse, serviceResponse] = await Promise.all([
          getMesPatientsService({ per_page: 1000 }),
          getCurrentService().catch(() => null),
        ]);
        response = patientsResponse;
        setCurrentServiceId(serviceResponse?.data?.id || serviceResponse?.id || null);
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
    listMedecins({ per_page: 100 })
      .then((response) => setDoctors(unwrapList(response).rows))
      .catch(() => setDoctors([]));
    if (source === 'etablissement') {
      getServices({ per_page: 1000 })
        .then((response) => setServices(unwrapList(response).rows))
        .catch(() => setServices([]));
    } else {
      setServices([]);
    }
    return () => {
      mounted = false;
    };
  }, [source]);

  function updatePatientForm(event) {
    const { name, value } = event.target;
    setPatientForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreatePatient(event) {
    event.preventDefault();  // empeche le rechargement de la page
    setModalSaving(true);
    setModalError('');
    setModalMessage('');

    const payload = Object.fromEntries(
      Object.entries(patientForm).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );
    if (!payload.password) delete payload.password;
    if (!payload.groupe_sanguin) delete payload.groupe_sanguin;
    if (!payload.service_id) delete payload.service_id;

    try {
      const response = await createPatient(payload);   
      setModalMessage(response?.warning || response?.message || 'Patient cree avec succes.');
      await loadPatients();
      setTimeout(() => setShowAddModal(false), 900);
    } catch (err) {
      setModalError(apiErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  function openAssignModal(patient) {
    setAssignPatient(patient);
    setAssignError('');
    setAssignMessage('');
    setAssignForm({ medecin_id: '', date_consultation: '', motif: 'Rendez-vous d affectation', observations: '' });
  }

  async function handleAssignSubmit(event) {
    event.preventDefault();
    if (!assignPatient?.dossierId) {
      setAssignError('Dossier patient introuvable.');
      return;
    }

    setAssignSaving(true);
    setAssignError('');
    setAssignMessage('');

    try {
      const response = await affecterDossierMedecin(assignPatient.dossierId, assignForm);
      setAssignMessage(response?.message || 'Dossier affecte et rendez-vous cree.');
      await loadPatients();
      setTimeout(() => setAssignPatient(null), 800);
    } catch (err) {
      setAssignError(apiErrorMessage(err));
    } finally {
      setAssignSaving(false);
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

  function canAssignDoctor(patient) {
    if (source === 'doctor') return false;
    if (source === 'etablissement' && patient.dossierStatus === 'transfere') {
      return patient.transferStatus === 'accepte'
        && currentEtablissementId
        && String(patient.transferDestinationEtablissementId) === String(currentEtablissementId);
    }
    if (source !== 'service') return true;
    if (!currentServiceId) return false;

    if (patient.dossierOwnerServiceId) {
      return String(patient.dossierOwnerServiceId) === String(currentServiceId);
    }

    return patient.dossierStatus !== 'transfere' && String(patient.serviceId) === String(currentServiceId);
  }

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
          {source !== 'doctor' && (
            <button className="btn transfer-add-btn" onClick={() => setShowAddModal(true)}>
              <i ></i> Ajouter un patient
            </button>
          )}
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
                {canAssignDoctor(patient) && (
                  <button className="mes-patients-action-btn" type="button" title="Affecter a un medecin" onClick={() => openAssignModal(patient)}>
                    <i className="fa-solid fa-user-doctor"></i>
                  </button>
                )}
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
                        {canAssignDoctor(patient) && (
                          <button className="icon-action" type="button" title="Affecter a un medecin" onClick={() => openAssignModal(patient)}><i className="fa-solid fa-user-doctor"></i></button>
                        )}
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
      {assignPatient && (
        <div className="custom-modal-overlay" onClick={() => setAssignPatient(null)}>
          <form className="custom-modal" onSubmit={handleAssignSubmit} onClick={(event) => event.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>Affecter a un medecin</h3>
              <button className="custom-modal-close" type="button" onClick={() => setAssignPatient(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="custom-modal-body">
              {assignError ? <p className="modal-alert modal-alert-error">{assignError}</p> : null}
              {assignMessage ? <p className="modal-alert modal-alert-success">{assignMessage}</p> : null}
              <p className="table-meta">Patient: <strong>{assignPatient.name}</strong></p>
              <div className="form-group">
                <label>Medecin</label>
                <select name="medecin_id" value={assignForm.medecin_id} onChange={(event) => setAssignForm((form) => ({ ...form, medecin_id: event.target.value }))} required>
                  <option value="">Choisir un medecin</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.user?.name || doctor.name || `Medecin #${doctor.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date et heure du rendez-vous</label>
                <input
  type="datetime-local"
  name="date_consultation"
  value={assignForm.date_consultation}
  min={getMinDateTime()}
  onChange={(event) =>
    setAssignForm((form) => ({
      ...form,
      date_consultation: event.target.value,
    }))
  }
  required
/>
              </div>
              <div className="form-group">
                <label>Motif</label>
                <input type="text" name="motif" value={assignForm.motif} onChange={(event) => setAssignForm((form) => ({ ...form, motif: event.target.value }))} />
              </div>
              <div className="form-group">
                <label>Observations</label>
                <textarea rows="3" name="observations" value={assignForm.observations} onChange={(event) => setAssignForm((form) => ({ ...form, observations: event.target.value }))} />
              </div>
            </div>
            <div className="custom-modal-footer">
              <button className="btn-cancel" type="button" onClick={() => setAssignPatient(null)}>Annuler</button>
              <button className="btn-save" type="submit" disabled={assignSaving}>{assignSaving ? 'Affectation...' : 'Creer le rendez-vous'}</button>
            </div>
          </form>
        </div>
      )}
      {source !== 'doctor' && showAddModal && (
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
              <div className="form-group"><label>Mot de passe initial</label><input name="password" type="password" value={patientForm.password} onChange={updatePatientForm} placeholder="Genere automatiquement si vide" /></div>
              <div className="form-group"><label>Telephone</label><input name="telephone" type="tel" value={patientForm.telephone} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Date de naissance</label><input name="date_naissance" type="date" value={patientForm.date_naissance} onChange={updatePatientForm} required /></div>
              <div className="form-group"><label>Sexe</label><select name="sexe" value={patientForm.sexe} onChange={updatePatientForm} required><option value="M">Masculin</option><option value="F">Feminin</option></select></div>
              <div className="form-group"><label>Groupe sanguin</label><select name="groupe_sanguin" value={patientForm.groupe_sanguin} onChange={updatePatientForm}><option value="">Non renseigne</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group} value={group}>{group}</option>)}</select></div>
              {source === 'etablissement' && (
                <div className="form-group">
                  <label>Service</label>
                  <select name="service_id" value={patientForm.service_id} onChange={updatePatientForm} required>
                    <option value="">Orienter vers un service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.nom || service.user?.name || `Service #${service.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
 .custom-modal-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* Modal normal (Affecter à un médecin) */
.custom-modal{
  width: 90%;
  max-width: 620px;
  max-height: 80vh;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,.15);
}

/* Grand modal (Ajouter un patient) */
.custom-modal-wide{
  max-width: 900px;
}

.custom-modal-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.custom-modal-header h3{
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #16204a;
}

.custom-modal-close{
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  color: #555;
}

.custom-modal-body{
  padding: 18px 22px;
  overflow-y: auto;
}

.custom-modal-grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 14px;
}

.form-group-full,
.modal-alert{
  grid-column: 1 / -1;
}

.form-group{
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.form-group label{
  font-size: 15px;
  font-weight: 500;
  color: #29436b;
}

.form-group input,
.form-group select,
.form-group textarea{
  width: 100%;
  border: 1px solid #d9e1ea;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 15px;
  transition: .2s;
}

.form-group input,
.form-group select{
  height: 46px;
}

.form-group textarea{
  min-height: 90px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus{
  outline: none;
  border-color: #13c3b8;
  box-shadow: 0 0 0 3px rgba(19,195,184,.15);
}

.custom-modal-footer{
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 22px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel{
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  background: #eef2f7;
  cursor: pointer;
  font-weight: 500;
}

.btn-save{
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  background: #13c3b8;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.btn-save:disabled{
  opacity: .6;
  cursor: not-allowed;
}

.modal-alert{
  padding: 10px 12px;
  border-radius: 8px;
}

.modal-alert-error{
  background: #fff1f0;
  color: #b42318;
}

.modal-alert-success{
  background: #ecfdf3;
  color: #027a48;
}

@media (max-width: 768px){

  .custom-modal{
    width: 95%;
    max-width: 95%;
    max-height: 90vh;
  }

  .custom-modal-grid{
    grid-template-columns: 1fr;
  }

}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  min-height: 44px;
  border: 1px solid #d9e1ea;
  border-radius: 10px;
  padding: 10px 14px;
}

.form-group textarea {
  min-height: 90px;
  resize: vertical;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
  `}
  </style>
    </main>
  );
}
