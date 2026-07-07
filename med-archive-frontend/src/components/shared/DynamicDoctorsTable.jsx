import React, { useEffect, useMemo, useState } from 'react';
import { createMedecin, getCurrentService, getServices, getSpecialites, listMedecins, updateMedecin } from '../../api';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';

const emptyDoctor = {
  name: '',
  email: '',
  password: '',
  telephone: '',
  adresse: '',
  date_naissance: '',
  sexe: 'M',
  service_id: '',
  specialite_id: '',
  numero_professionnel: '',
  diplome: '',
  annees_experience: '',
  statut: 'actif',
};

function normalizeDoctor(row) {
  const stats = row.statistiques || {};
  return {
    id: row.id,
    raw: row,
    name: row.nom || row.user?.name || row.name || '-',
    email: row.email || row.user?.email || '-',
    phone: row.telephone || row.user?.telephone || '-',
    specialite: row.specialite?.nom || row.specialite || '-',
    service: row.service?.nom || '-',
    experience: row.annees_experience ?? row.medecin?.annees_experience ?? 0,
    patients: stats.patients_actifs ?? row.patients_count ?? '-',
    consultations: stats.consultations_mois ?? row.consultations_count ?? '-',
    etablissement: row.etablissement?.name || valueAt(row, 'user.etablissement.name', '-'),
    statut: row.user?.statut || row.statut || 'actif',
  };
}

function doctorToForm(doctor) {
  const row = doctor?.raw ?? {};
  return {
    name: row.user?.name || doctor?.name || '',
    email: row.user?.email || doctor?.email || '',
    password: '',
    telephone: row.user?.telephone || doctor?.phone || '',
    adresse: row.user?.adresse || '',
    date_naissance: row.user?.date_naissance ? String(row.user.date_naissance).slice(0, 10) : '',
    sexe: row.user?.sexe || 'M',
    service_id: row.service_id ? String(row.service_id) : '',
    specialite_id: row.specialite_id ? String(row.specialite_id) : '',
    numero_professionnel: row.numero_professionnel || '',
    diplome: row.diplome || '',
    annees_experience: row.annees_experience ?? '',
    statut: row.user?.statut || 'actif',
  };
}

function buildDoctorPayload(formData) {
  const payload = { ...formData };
  if (!payload.password) delete payload.password;
  if (payload.annees_experience !== '') payload.annees_experience = Number(payload.annees_experience);
  if (payload.service_id) payload.service_id = Number(payload.service_id);
  else delete payload.service_id;
  if (payload.specialite_id) payload.specialite_id = Number(payload.specialite_id);
  else delete payload.specialite_id;
  return payload;
}

export default function DynamicDoctorsTable({ title = 'Medecins', useEtablissementScope = false }) {
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  async function loadDoctors() {
    setLoading(true);
    setError('');
    try {
      const response = await listMedecins({ per_page: 1000 });
      setDoctors(unwrapList(response).rows.map(normalizeDoctor));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function defaultDoctorForm(service, specialiteRows) {
    const serviceSpecialiteId = service?.specialite_id
      || specialiteRows.find((specialite) => specialite.nom?.toLowerCase() === service?.nom?.toLowerCase())?.id
      || '';

    return {
      ...emptyDoctor,
      service_id: service?.id ? String(service.id) : '',
      specialite_id: serviceSpecialiteId ? String(serviceSpecialiteId) : '',
    };
  }

  useEffect(() => {
    let mounted = true;

    async function loadFormData() {
      try {
        const [specialitesResponse, servicesResponse, currentServiceResponse] = await Promise.all([
          getSpecialites(),
          getServices({ per_page: 1000 }),
          getCurrentService().catch(() => null),
        ]);
        if (!mounted) return;
        const service = currentServiceResponse?.data ?? null;
        const serviceRows = unwrapList(servicesResponse).rows;
        const specialiteRows = unwrapList(specialitesResponse).rows;

        setCurrentService(service);
        setServices(serviceRows);
        setSpecialites(specialiteRows);
        setDoctorForm(defaultDoctorForm(service, specialiteRows));
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      }
    }

    loadDoctors();
    loadFormData();
    return () => {
      mounted = false;
    };
  }, [useEtablissementScope]);

  useEffect(() => {
    if (!error && !success) return undefined;
    const timer = window.setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [error, success]);

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) => Object.values({ ...doctor, raw: '' }).join(' ').toLowerCase().includes(term));
  }, [doctors, search]);

  function updateDoctorField(event) {
    const { name, value } = event.target;
    setDoctorForm((doctor) => {
      if (name !== 'service_id') return { ...doctor, [name]: value };

      const selectedService = services.find((service) => String(service.id) === String(value));
      const selectedSpecialiteId = selectedService?.specialite_id
        || specialites.find((specialite) => specialite.nom?.toLowerCase() === selectedService?.nom?.toLowerCase())?.id
        || '';

      return {
        ...doctor,
        service_id: value,
        specialite_id: selectedSpecialiteId ? String(selectedSpecialiteId) : doctor.specialite_id,
      };
    });
  }

  function openCreateModal() {
    setSelectedDoctor(null);
    setDoctorForm(defaultDoctorForm(currentService, specialites));
    setModalError('');
    setModalMode('create');
  }

  function openViewModal(doctor) {
    setSelectedDoctor(doctor);
    setDoctorForm(doctorToForm(doctor));
    setModalError('');
    setModalMode('view');
  }

  function openEditModal(doctor) {
    setSelectedDoctor(doctor);
    setDoctorForm(doctorToForm(doctor));
    setModalError('');
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setSelectedDoctor(null);
    setModalError('');
  }

  async function handleSubmitDoctor(event) {
    event.preventDefault();
    setSaving(true);
    setModalError('');
    setSuccess('');

    const payload = buildDoctorPayload(doctorForm);

    try {
      const response = modalMode === 'edit'
        ? await updateMedecin(selectedDoctor.id, payload)
        : await createMedecin(payload);
      setSuccess(response?.message || (modalMode === 'edit' ? 'Medecin modifie avec succes.' : 'Medecin cree avec succes.'));
      await loadDoctors();
      closeModal();
    } catch (err) {
      setModalError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleDoctorStatus(doctor) {
    const isActive = doctor.statut === 'actif';
    const nextStatus = isActive ? 'inactif' : 'actif';
    const action = isActive ? 'desactiver' : 'reactiver';
    if (!window.confirm(`Voulez-vous ${action} ce medecin ?`)) return;

    try {
      setError('');
      setSuccess('');
      await updateMedecin(doctor.id, { statut: nextStatus });
      setSuccess(isActive ? 'Medecin desactive avec succes.' : 'Medecin reactive avec succes.');
      await loadDoctors();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  const isReadOnly = modalMode === 'view';
  const serviceLocked = Boolean(currentService?.id);

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>{title}</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche medecins">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un medecin..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <button className="btn transfer-add-btn" type="button" onClick={openCreateModal}>
          <i className="fa-solid fa-plus"></i>
          Ajouter un medecin
        </button>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Specialite</th>
                  <th>Service</th>
                  <th>Telephone</th>
                  <th>Experience</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="7" className="text-center p-4">Chargement...</td></tr>}
                {!loading && filteredDoctors.length === 0 && <tr><td colSpan="7" className="text-center p-4">Aucun medecin trouve.</td></tr>}
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="table-title-cell"><strong>{doctor.name}</strong><br /><span className="table-meta">{doctor.email}</span></td>
                    <td>{doctor.specialite}</td>
                    <td>{doctor.service}</td>
                    <td className="table-nowrap">{doctor.phone}</td>
                    <td className="table-nowrap">{doctor.experience} an(s)</td>
                    <td>
                      <span className={`rdv-status ${doctor.statut === 'actif' ? 'done' : 'pending'}`}>
                        {doctor.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action" title="Voir" type="button" onClick={() => openViewModal(doctor)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className="icon-action" title="Modifier" type="button" onClick={() => openEditModal(doctor)}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button className="icon-action" title={doctor.statut === 'actif' ? 'Desactiver' : 'Reactiver'} type="button" onClick={() => toggleDoctorStatus(doctor)}>
                        <i className={`fa-solid ${doctor.statut === 'actif' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                      </button>
                    </td>
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

      {modalMode && (
        <div className="doctor-modal-overlay" onClick={closeModal}>
          <form className="doctor-modal" onSubmit={handleSubmitDoctor} onClick={(event) => event.stopPropagation()}>
            <div className="doctor-modal-header">
              <h3>{modalMode === 'view' ? 'Details du medecin' : modalMode === 'edit' ? 'Modifier le medecin' : 'Ajouter un medecin'}</h3>
              <button className="doctor-modal-close" type="button" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="doctor-modal-body">
              {modalError ? <p className="doctor-alert doctor-alert-error">{modalError}</p> : null}
              <div className="doctor-form-group"><label>Nom complet</label><input name="name" type="text" value={doctorForm.name} onChange={updateDoctorField} disabled={isReadOnly} required /></div>
              <div className="doctor-form-group"><label>Email</label><input name="email" type="email" value={doctorForm.email} onChange={updateDoctorField} disabled={isReadOnly} required /></div>
              {modalMode === 'create' && (
                <div className="doctor-form-group">
                  <label>Mot de passe initial</label>
                  <input
                    name="password"
                    type="text"
                    value={doctorForm.password}
                    onChange={updateDoctorField}
                    placeholder="Genere automatiquement si vide"
                  />
                </div>
              )}
              <div className="doctor-form-group"><label>Telephone</label><input name="telephone" type="text" value={doctorForm.telephone} onChange={updateDoctorField} disabled={isReadOnly} required /></div>
              <div className="doctor-form-group"><label>Adresse</label><input name="adresse" type="text" value={doctorForm.adresse} onChange={updateDoctorField} disabled={isReadOnly} required /></div>
              <div className="doctor-form-group"><label>Date de naissance</label><input name="date_naissance" type="date" value={doctorForm.date_naissance} onChange={updateDoctorField} disabled={isReadOnly} required /></div>
              <div className="doctor-form-group"><label>Sexe</label><select name="sexe" value={doctorForm.sexe} onChange={updateDoctorField} disabled={isReadOnly}><option value="M">Masculin</option><option value="F">Feminin</option></select></div>
              <div className="doctor-form-group"><label>Service</label><select name="service_id" value={doctorForm.service_id} onChange={updateDoctorField} disabled={isReadOnly || serviceLocked} required><option value="">Choisir un service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.nom}</option>)}</select></div>
              <div className="doctor-form-group"><label>Specialite</label><select name="specialite_id" value={doctorForm.specialite_id} onChange={updateDoctorField} disabled={isReadOnly || Boolean(currentService?.id && doctorForm.specialite_id)} required><option value="">Choisir une specialite</option>{specialites.map((specialite) => <option key={specialite.id} value={specialite.id}>{specialite.nom}</option>)}</select></div>
              <div className="doctor-form-group"><label>Numero professionnel</label><input name="numero_professionnel" type="text" value={doctorForm.numero_professionnel} onChange={updateDoctorField} disabled={isReadOnly} required /></div>
              <div className="doctor-form-group"><label>Diplome</label><input name="diplome" type="text" value={doctorForm.diplome} onChange={updateDoctorField} disabled={isReadOnly} /></div>
              <div className="doctor-form-group"><label>Annees d'experience</label><input name="annees_experience" type="number" min="0" value={doctorForm.annees_experience} onChange={updateDoctorField} disabled={isReadOnly} /></div>
              <div className="doctor-form-group"><label>Statut</label><select name="statut" value={doctorForm.statut} onChange={updateDoctorField} disabled={isReadOnly}><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="en_attente">En attente</option></select></div>
            </div>

            <div className="doctor-modal-footer">
              <button type="button" className="doctor-btn-cancel" onClick={closeModal}>{isReadOnly ? 'Fermer' : 'Annuler'}</button>
              {!isReadOnly && <button type="submit" className="doctor-btn-save" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>}
            </div>
          </form>
        </div>
      )}

      <style>{`
        .doctor-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:18px;}
        .doctor-modal{width:100%;max-width:820px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,.12);}
        .doctor-modal-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #eef2f6;}
        .doctor-modal-header h3{margin:0;font-size:1.25rem;font-weight:600;}
        .doctor-modal-close{width:36px;height:36px;background:transparent;border:none;font-size:1.4rem;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#64748b;}
        .doctor-modal-close:hover{background:#f1f5f9;color:#0f172a;}
        .doctor-modal-body{padding:20px 22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-height:68vh;overflow:auto;}
        .doctor-form-group{display:flex;flex-direction:column;gap:5px;}
        .doctor-form-group label{font-size:.85rem;font-weight:600;color:#475569;}
        .doctor-form-group input,.doctor-form-group select{width:100%;height:40px;padding:0 12px;border:1px solid #dbe2ea;border-radius:10px;font-size:.9rem;background:#fff;}
        .doctor-form-group input:disabled,.doctor-form-group select:disabled{background:#f8fafc;color:#64748b;}
        .doctor-alert{grid-column:1 / -1;margin:0;padding:10px 12px;border-radius:10px;}
        .doctor-alert-error{color:#b42318;background:#fff1f0;}
        .doctor-modal-footer{display:flex;justify-content:flex-end;gap:8px;padding:16px 22px;border-top:1px solid #eef2f6;}
        .doctor-btn-cancel,.doctor-btn-save{height:40px;padding:0 16px;font-size:.9rem;border-radius:10px;cursor:pointer;border:none;}
        .doctor-btn-cancel{background:#f1f5f9;color:#1e293b;}
        .doctor-btn-save{background:#0f9f9b;color:white;}
        .doctor-btn-save:disabled{opacity:.65;cursor:not-allowed;}
        @media (max-width:720px){.doctor-modal-body{grid-template-columns:1fr;}}
      `}</style>
    </main>
  );
}
