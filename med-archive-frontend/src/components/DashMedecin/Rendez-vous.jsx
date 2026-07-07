import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { getPatients } from '../../api/medecinApi';
import Pagination, { DEFAULT_PAGE_SIZE, paginateRows } from '../shared/Pagination.jsx';

const DEFAULT_API_URL = 'http://localhost:8000/api';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

function normalizeAuthPayload(value) {
  return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || null;
}

function extractMedecinId(auth) {
  return auth?.medecin?.id || auth?.user?.medecin?.id || auth?.data?.user?.medecin?.id || auth?.medecin_id || auth?.user?.medecin_id || null;
}

function unwrapPatients(responseData) {
  if (Array.isArray(responseData?.data?.data)) return responseData.data.data;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData)) return responseData;
  return [];
}

function patientLabel(row) {
  return row?.name || row?.user?.name || row?.patient?.user?.name || row?.patient?.name || 'Patient';
}

function formatInputDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR') : 'cette date';
}

const RendezVousMedecin = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(formatInputDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [medecinId, setMedecinId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
const getCurrentTime = () => {
  const now = new Date();
  now.setMinutes(Math.ceil((now.getMinutes() + 1) / 30) * 30, 0, 0);
  return now.toTimeString().slice(0, 5);
};

const [formData, setFormData] = useState({
  patient_id: '',
  date_consultation: date,
  heure: getCurrentTime(),
  motif: ''
});
const today = formatInputDate();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadMedecinId = async () => {
    let auth = normalizeAuthPayload(getAuthUser());
    let id = extractMedecinId(auth);
    if (!id && getAuthToken()) {
      auth = normalizeAuthPayload(await getCurrentUser());
      id = extractMedecinId(auth);
    }
    if (!id) throw new Error("Impossible d'identifier le medecin connecte");
    setMedecinId(id);
    return id;
  };

  const loadPatients = async (id = medecinId) => {
    if (!id) return;
    setLoadingPatients(true);
    try {
      const responseData = await getPatients(id, getAuthToken());
      setPatients(unwrapPatients(responseData));
    } catch {
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadPlanning = async (id = medecinId) => {
    setLoading(true);
    setError(null);
    try {
      const currentId = id || await loadMedecinId();
      const res = await fetch(`${API_URL}/medecins/${currentId}/planning?date=${date}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Erreur recuperation planning');
     const consultations = Array.isArray(json?.data?.consultations)
  ? json.data.consultations
  : [];

setAppointments(
  consultations.filter(
    (c) => c.statut !== 'termine'
  )
);
    } catch (err) {
      setError(err.message || 'Erreur');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const id = await loadMedecinId();
        if (mounted) await loadPlanning(id);
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [date]);

  const filteredAppointments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return appointments;
    return appointments.filter((app) => `${app.patient || ''} ${app.motif || ''}`.toLowerCase().includes(query));
  }, [appointments, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, appointments.length]);

  const paginatedAppointments = useMemo(() => paginateRows(filteredAppointments, page, DEFAULT_PAGE_SIZE), [filteredAppointments, page]);

  const openModal = () => {
    setFormData({ patient_id: '', date_consultation: date, heure: getCurrentTime(), motif: '' });
    setFormError('');
    setIsModalOpen(true);
    if (patients.length === 0) loadPatients();
  };

  const closeModal = () => setIsModalOpen(false);
  const handleInputChange = (event) => setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      if (!medecinId) throw new Error('Medecin non identifie');
      const response = await fetch(`${API_URL}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' },
        body: JSON.stringify({
          medecin_id: medecinId,
          patient_id: formData.patient_id,
          date_consultation: `${formData.date_consultation}T${formData.heure}`,
          motif: formData.motif,
          statut: 'en_attente',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Erreur creation');
      closeModal();
      await loadPlanning(medecinId);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startConsultation = async (appointment) => {
    if (appointment.statut_paiement !== 'payee' && !appointment.est_urgence) {
      setError('Le paiement doit etre valide avant de demarrer cette consultation.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/consultations/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' },
        body: JSON.stringify({ statut: 'en_cours' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Impossible de commencer la consultation');
      const started = { ...appointment, ...(data?.data || {}), statut: 'en_cours' };
      sessionStorage.setItem('active_consultation', JSON.stringify(started));
      navigate('/espacemedecin/consultations');
    } catch (err) {
      setError(err.message);
    }
  };

  const finishConsultation = async (appointment) => {
    await fetch(`${API_URL}/consultations/${appointment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' },
      body: JSON.stringify({ statut: 'termine' }),
    });
    await loadPlanning(medecinId);
  };

  const getStatusInfo = (statut, statutPaiement) => {
    if (statutPaiement === 'non_payee') {
      return { text: 'En attente de paiement', className: 'rdv-status pending' };
    }

    switch (statut) {
      case 'en_attente':
      case 'pending':
      case 'programme':
        return { text: 'En attente', className: 'rdv-status pending' };
      case 'en_cours':
      case 'ongoing':
        return { text: 'En consultation', className: 'rdv-status upcoming' };
      case 'termine':
      case 'done':
        return { text: 'Termine', className: 'rdv-status done' };
      case 'absent':
        return { text: 'Absent', className: 'rdv-status cancelled' };
      default:
        return { text: statut || 'En attente', className: 'rdv-status pending' };
    }
  };

  if (loading && !medecinId) return <main className="content page-tight">Chargement du planning...</main>;

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Mes rendez-vous</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un rendez-vous..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </label>
        <input
          type="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date des rendez-vous"
        />
        <button className="btn transfer-add-btn" type="button" onClick={openModal}>
          <i className="fa-solid fa-calendar-plus"></i> Ajouter un rendez-vous
        </button>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            {!loading && filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-search"><i className="fa-solid fa-magnifying-glass"></i></div>
                <h2>Aucun rendez-vous trouve</h2>
                <p>Aucun rendez-vous n'est programme le {formatDisplayDate(date)}.</p>
                <button className="empty-state-btn" type="button" onClick={openModal}>
                  <i className="fa-solid fa-calendar-plus"></i> Programmer un rendez-vous
                </button>
              </div>
            ) : (
              <table className="rdv-table">
                <thead><tr><th>Heure</th><th>Patient</th><th>Motif</th><th>Paiement</th><th>Statut</th><th>Action</th></tr></thead>
                <tbody>
                  {loading && <tr><td colSpan="6">Chargement...</td></tr>}
                  {!loading && paginatedAppointments.rows.map((app) => {
                    const isPaid = app.statut_paiement === 'payee' || app.est_urgence;
                    const { text, className } = getStatusInfo(app.statut, app.statut_paiement);
                    return (
                      <tr key={app.id}>
                        <td>{app.heure}</td>
                        <td>{app.patient}</td>
                        <td>{app.motif}</td>
                        <td><span className={`rdv-status ${isPaid ? 'done' : 'pending'}`}>{isPaid ? 'Payee' : 'En attente'}</span></td>
                        <td><span className={className}>{text}</span></td>
                        <td>
                          {app.statut === 'en_cours' ? (
                            <button className="icon-action" type="button" title="Terminer la consultation" onClick={() => finishConsultation(app)}>
                              <i className="fa-solid fa-check"></i>
                            </button>
                          ) : (
                            <button className="icon-action" type="button" title={isPaid ? 'Commencer la consultation' : 'Paiement requis'} onClick={() => startConsultation(app)} disabled={!isPaid}>
                              <i className="fa-solid fa-play"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredAppointments.length === 0 ? 0 : paginatedAppointments.start + 1}-{paginatedAppointments.end} rendez-vous sur {filteredAppointments.length}</span>
            <Pagination page={paginatedAppointments.page} totalItems={filteredAppointments.length} onPageChange={setPage} />
          </div>
        </article>
      </section>

     {isModalOpen && (
  <div className="rdvmed-modal-overlay" onClick={closeModal}>
    <div
      className="rdvmed-modal-container"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rdvmed-modal-header">
        <div>
          <h3>Programmer un rendez-vous</h3>
          <p>Créer un nouveau rendez-vous médical</p>
        </div>

        <button
          type="button"
          className="rdvmed-modal-close"
          onClick={closeModal}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rdvmed-modal-body">
          {formError && (
            <div className="rdvmed-form-error">
              {formError}
            </div>
          )}

          <div className="rdvmed-form-group">
            <label>Patient *</label>

            <select
              name="patient_id"
              value={formData.patient_id}
              onChange={handleInputChange}
              required
              disabled={loadingPatients}
            >
              <option value="">
                -- Sélectionner un patient --
              </option>

              {patients.map((p) => {
                const id = p?.patient?.id || p?.id;

                return (
                  <option key={id} value={id}>
                    {patientLabel(p)}
                  </option>
                );
              })}
            </select>

            {loadingPatients && (
              <small>Chargement des patients...</small>
            )}
          </div>

          <div className="rdvmed-form-row">
            <div className="rdvmed-form-group">
              <label>Date *</label>

             <input
  type="date"
  name="date_consultation"
  value={formData.date_consultation}
  onChange={handleInputChange}
  min={today}
  required
/>
            </div>

            <div className="rdvmed-form-group">
              <label>Heure *</label>

              <input
                type="time"
                name="heure"
                value={formData.heure}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="rdvmed-form-group">
            <label>Motif *</label>

            <textarea
              name="motif"
              rows="4"
              value={formData.motif}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="rdvmed-modal-footer">
          <button
            type="button"
            className="rdvmed-btn-cancel"
            onClick={closeModal}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="rdvmed-btn-save"
            disabled={submitting}
          >
            {submitting
              ? 'Enregistrement...'
              : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
 <style>{`
    

.rdvmed-modal-overlay{
    position:fixed;
    inset:0;
    background:rgba(15,23,42,.65);
  
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:99999;
    padding:20px;
}

.rdvmed-modal-container{
    width:100%;
    max-width:700px;
    background:#fff;
    border-radius:22px;
    overflow:hidden;
    animation:rdvmedOpen .25s ease;
    box-shadow:
        0 25px 50px rgba(0,0,0,.25),
        0 10px 25px rgba(0,0,0,.15);
}

.rdvmed-modal-header{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    padding:30px 30px 20px;
    background:#ffffff;
    border-bottom:1px solid #edf2f7;
}

.rdvmed-modal-header h3{
    margin:0;
    font-size:1.5rem;
    font-weight:700;
}

.rdvmed-modal-header p{
    margin-top:6px;
    opacity:.9;
}

.rdvmed-modal-close{
    width:48px;
    height:48px;
    border:none;
    border-radius:50%;
    background:#f1f5f9;
    color:#0f172a;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:18px;
    transition:.2s;
}

.rdvmed-modal-close:hover{
    background:#e2e8f0;
    transform:none;
}

.rdvmed-modal-body{
    padding:30px;
}

.rdvmed-form-row{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:16px;
}

.rdvmed-form-group{
    margin-bottom:20px;
}

.rdvmed-form-group label{
    display:block;
    margin-bottom:8px;
    font-weight:600;
    color:#334155;
}

.rdvmed-form-group input,
.rdvmed-form-group select,
.rdvmed-form-group textarea{
    width:100%;
    padding:13px 14px;
    border:1px solid #dbe2ea;
    border-radius:12px;
    font-size:.95rem;
    transition:.2s;
}

.rdvmed-form-group input:focus,
.rdvmed-form-group select:focus,
.rdvmed-form-group textarea:focus{
    outline:none;
    border-color:#14b8a6;
    box-shadow:0 0 0 4px rgba(20,184,166,.15);
}

.rdvmed-form-error{
    margin-bottom:15px;
    padding:12px;
    border-radius:10px;
    background:#fee2e2;
    color:#b91c1c;
}

.rdvmed-modal-footer{
    display:flex;
    justify-content:flex-end;
    gap:12px;
    padding:20px 30px;
    border-top:1px solid #eef2f7;
}

.rdvmed-btn-cancel{
    border:none;
    padding:12px 20px;
    border-radius:10px;
    background:#e2e8f0;
    cursor:pointer;
    font-weight:600;
}

.rdvmed-btn-save{
    border:none;
    padding:12px 22px;
    border-radius:10px;
    background:#0f766e;
    color:white;
    cursor:pointer;
    font-weight:600;
}

.rdvmed-btn-save:hover{
    background:#115e59;
}

@keyframes rdvmedOpen{
    from{
        opacity:0;
        transform:translateY(-20px) scale(.95);
    }
    to{
        opacity:1;
        transform:translateY(0) scale(1);
    }
}
      `}</style>
    </main>
  );
};

export default RendezVousMedecin;
