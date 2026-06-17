import React, { useEffect, useMemo, useState } from 'react';
import { createMedecin, getCurrentService, getMesMedecinsEtablissement, getServices, getSpecialites, listMedecins } from '../../api';
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
};

function normalizeDoctor(row) {
  const stats = row.statistiques || {};
  return {
    id: row.id,
    name: row.nom || row.user?.name || row.name || '-',
    email: row.email || row.user?.email || '-',
    phone: row.telephone || row.user?.telephone || '-',
    specialite: row.specialite?.nom || row.specialite || '-',
    service: row.service?.nom || '-',
    experience: row.annees_experience ?? row.medecin?.annees_experience ?? 0,
    patients: stats.patients_actifs ?? row.patients_count ?? '-',
    consultations: stats.consultations_mois ?? row.consultations_count ?? '-',
    etablissement: row.etablissement?.name || valueAt(row, 'user.etablissement.name', '-'),
  };
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState(emptyDoctor);

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
      setDoctors(unwrapList(response).rows.map(normalizeDoctor));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadFormData() {
      try {
        const [specialitesResponse, servicesResponse, currentServiceResponse] = await Promise.all([
          getSpecialites(),
          getServices({ per_page: 100 }),
          getCurrentService().catch(() => null),
        ]);
        if (!mounted) return;
        const service = currentServiceResponse?.data ?? null;
        const serviceRows = unwrapList(servicesResponse).rows;
        const specialiteRows = unwrapList(specialitesResponse).rows;
        const serviceSpecialiteId = service?.specialite_id
          || specialiteRows.find((specialite) => specialite.nom?.toLowerCase() === service?.nom?.toLowerCase())?.id
          || '';
        setCurrentService(service);
        setServices(serviceRows);
        setSpecialites(specialiteRows);
        setNewDoctor((doctor) => ({
          ...doctor,
          service_id: service?.id ? String(service.id) : doctor.service_id,
          specialite_id: serviceSpecialiteId ? String(serviceSpecialiteId) : doctor.specialite_id,
        }));
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

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) => Object.values(doctor).join(' ').toLowerCase().includes(term));
  }, [doctors, search]);

  function updateDoctorField(event) {
    const { name, value } = event.target;
    setNewDoctor((doctor) => {
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

  async function handleCreateDoctor(event) {
    event.preventDefault();
    setSaving(true);
    setModalError('');
    setSuccess('');

    const payload = { ...newDoctor };
    if (!payload.password) delete payload.password;
    if (payload.annees_experience !== '') payload.annees_experience = Number(payload.annees_experience);
    if (payload.service_id) payload.service_id = Number(payload.service_id);
    if (payload.specialite_id) payload.specialite_id = Number(payload.specialite_id);

    try {
      const response = await createMedecin(payload);
      setSuccess(response?.message || 'Medecin cree avec succes.');
      const currentServiceSpecialiteId = currentService?.specialite_id
        || specialites.find((specialite) => specialite.nom?.toLowerCase() === currentService?.nom?.toLowerCase())?.id
        || '';
      setNewDoctor({
        ...emptyDoctor,
        service_id: currentService?.id ? String(currentService.id) : '',
        specialite_id: currentServiceSpecialiteId ? String(currentServiceSpecialiteId) : '',
      });
      await loadDoctors();
      setTimeout(() => setIsModalOpen(false), 700);
    } catch (err) {
      setModalError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

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
        <button className="btn transfer-add-btn" type="button" onClick={() => setIsModalOpen(true)}>
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
                  <th>Patients</th>
                  <th>Consultations mois</th>
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
        <div className="doctor-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <form className="doctor-modal" onSubmit={handleCreateDoctor} onClick={(event) => event.stopPropagation()}>
            <div className="doctor-modal-header">
              <h3>Ajouter un medecin</h3>
              <button className="doctor-modal-close" type="button" onClick={() => setIsModalOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="doctor-modal-body">
              {modalError ? <p className="doctor-alert doctor-alert-error">{modalError}</p> : null}
              <div className="doctor-form-group"><label>Nom complet</label><input name="name" type="text" value={newDoctor.name} onChange={updateDoctorField} required /></div>
              <div className="doctor-form-group"><label>Email</label><input name="email" type="email" value={newDoctor.email} onChange={updateDoctorField} required /></div>
              <div className="doctor-form-group"><label>Mot de passe initial</label><input name="password" type="text" value={newDoctor.password} onChange={updateDoctorField} placeholder="password123 si vide" /></div>
              <div className="doctor-form-group"><label>Telephone</label><input name="telephone" type="text" value={newDoctor.telephone} onChange={updateDoctorField} required /></div>
              <div className="doctor-form-group"><label>Adresse</label><input name="adresse" type="text" value={newDoctor.adresse} onChange={updateDoctorField} required /></div>
              <div className="doctor-form-group"><label>Date de naissance</label><input name="date_naissance" type="date" value={newDoctor.date_naissance} onChange={updateDoctorField} required /></div>
              <div className="doctor-form-group"><label>Sexe</label><select name="sexe" value={newDoctor.sexe} onChange={updateDoctorField}><option value="M">Masculin</option><option value="F">Feminin</option></select></div>
              <div className="doctor-form-group"><label>Service</label><select name="service_id" value={newDoctor.service_id} onChange={updateDoctorField} disabled={Boolean(currentService?.id)} required><option value="">Choisir un service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.nom}</option>)}</select></div>
              <div className="doctor-form-group"><label>Specialite</label><select name="specialite_id" value={newDoctor.specialite_id} onChange={updateDoctorField} disabled={Boolean(currentService?.id && newDoctor.specialite_id)} required><option value="">Choisir une specialite</option>{specialites.map((specialite) => <option key={specialite.id} value={specialite.id}>{specialite.nom}</option>)}</select></div>
              <div className="doctor-form-group"><label>Numero professionnel</label><input name="numero_professionnel" type="text" value={newDoctor.numero_professionnel} onChange={updateDoctorField} required /></div>
              <div className="doctor-form-group"><label>Diplome</label><input name="diplome" type="text" value={newDoctor.diplome} onChange={updateDoctorField} /></div>
              <div className="doctor-form-group"><label>Annees d'experience</label><input name="annees_experience" type="number" min="0" value={newDoctor.annees_experience} onChange={updateDoctorField} /></div>
            </div>

            <div className="doctor-modal-footer">
              <button type="button" className="doctor-btn-cancel" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button type="submit" className="doctor-btn-save" disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .doctor-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:18px;}
        .doctor-modal{width:100%;max-width:760px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,.12);}
        .doctor-modal-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid #eef2f6;}
        .doctor-modal-header h3{margin:0;font-size:1.25rem;font-weight:600;}
        .doctor-modal-close{width:36px;height:36px;background:transparent;border:none;font-size:1.4rem;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#64748b;}
        .doctor-modal-close:hover{background:#f1f5f9;color:#0f172a;}
        .doctor-modal-body{padding:20px 22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-height:68vh;overflow:auto;}
        .doctor-form-group{display:flex;flex-direction:column;gap:5px;}
        .doctor-form-group label{font-size:.85rem;font-weight:600;color:#475569;}
        .doctor-form-group input,.doctor-form-group select{width:100%;height:40px;padding:0 12px;border:1px solid #dbe2ea;border-radius:10px;font-size:.9rem;}
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
