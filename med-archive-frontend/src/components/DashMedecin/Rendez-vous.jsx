import React, { useState, useEffect } from 'react';
import { getAuthToken, getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { getPatients } from '../../api/medecinApi';

const DEFAULT_API_URL = 'http://localhost:8000/api';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

const RendezVousMedecin = () => {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [medecinId, setMedecinId] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    date_consultation: date,
    heure: '09:00',
    motif: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ========== FONCTIONS D'EXTRACTION (identiques à ProfilMedecin) ==========
  const normalizeAuthPayload = (value) => {
    return (
      value?.data?.data?.user ||
      value?.data?.user ||
      value?.user ||
      value?.data ||
      value ||
      null
    );
  };

  const extractMedecinId = (auth) => {
    return (
      auth?.medecin?.id ||
      auth?.user?.medecin?.id ||
      auth?.data?.user?.medecin?.id ||
      auth?.medecin_id ||
      auth?.user?.medecin_id ||
      null
    );
  };

  const loadMedecinId = async () => {
    let auth = normalizeAuthPayload(getAuthUser());
    let id = extractMedecinId(auth);
    if (!id) {
      const token = getAuthToken();
      if (token) {
        try {
          const current = await getCurrentUser();
          auth = normalizeAuthPayload(current);
          id = extractMedecinId(auth);
        } catch (err) {
          console.error('Erreur getCurrentUser', err);
        }
      }
    }
    if (!id) {
      setError('Impossible d’identifier le médecin connecté');
      return null;
    }
    setMedecinId(id);
    return id;
  };

  // ========== CHARGEMENT DES PATIENTS (avec extraction paginée) ==========
  const loadPatients = async () => {
    if (!medecinId) return;
    setLoadingPatients(true);
    try {
      const token = getAuthToken();
      const responseData = await getPatients(medecinId, token);
      // La réponse est : { success: true, data: { current_page: 1, data: [...] } }
      let patientsList = [];
      if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
        patientsList = responseData.data.data;
      } else if (Array.isArray(responseData?.data)) {
        patientsList = responseData.data;
      } else if (Array.isArray(responseData)) {
        patientsList = responseData;
      }
      setPatients(patientsList);
    } catch (err) {
      console.error('Erreur chargement patients', err);
      setPatients([]);
    } finally {
      setLoadingPatients(false);
    }
  };

  // ========== CHARGEMENT DU PLANNING ==========
  const loadPlanning = async () => {
    setLoading(true);
    setError(null);
    try {
      let id = medecinId;
      if (!id) {
        id = await loadMedecinId();
        if (!id) throw new Error('ID du médecin introuvable');
      }
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/medecins/${id}/planning?date=${date}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Erreur récupération planning');
      setAppointments(Array.isArray(json?.data?.consultations) ? json.data.consultations : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadMedecinId();
      await loadPlanning();
    };
    init();
  }, [date]);

  // ========== MODAL ==========
  const openModal = () => {
    setFormData({
      patient_id: '',
      date_consultation: date,
      heure: '09:00',
      motif: '',
    });
    setFormError('');
    setIsModalOpen(true);
    if (patients.length === 0 && medecinId) loadPatients();
  };

  const closeModal = () => setIsModalOpen(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const id = medecinId;
      if (!id) throw new Error('Médecin non identifié');
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          medecin_id: id,
          patient_id: formData.patient_id,
          date_consultation: formData.date_consultation,
          heure: formData.heure,
          motif: formData.motif,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Erreur création');
      closeModal();
      loadPlanning();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== FILTRES & AFFICHAGE ==========
  const handleConsultation = (id) => {
    setAppointments(prev =>
      prev.map(app => app.id === id ? { ...app, statut: app.statut === 'programme' ? 'termine' : app.statut } : app)
    );
  };

  const filteredAppointments = appointments.filter(app =>
    app.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.motif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (statut) => {
    switch (statut) {
      case 'pending': return { text: 'En attente', className: 'rdv-status pending' };
      case 'ongoing': return { text: 'En consultation', className: 'rdv-status upcoming' };
      case 'done': return { text: 'Terminé', className: 'rdv-status done' };
      case 'absent': return { text: 'Absent', className: 'rdv-status done' };
      default: return { text: statut, className: 'rdv-status' };
    }
  };

  const getButtonText = (statut) => {
    if (statut === 'pending') return 'Commencer consultation';
    if (statut === 'ongoing') return 'Terminer consultation';
    return 'Ouvrir';
  };

  if (loading && !medecinId) return <main className="content page-tight">Chargement du planning...</main>;
  if (error) return <main className="content page-tight">Erreur : {error}</main>;

  return (
    <main className="content page-tight">
      {/* Styles (inchangés) */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-container {
          background: #fff;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .dark-mode .modal-container {
          background: #1f2937;
          color: #f9fafb;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark-mode .modal-header {
          border-bottom-color: #374151;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.8rem;
          font-weight: bold;
          cursor: pointer;
          color: #6b7280;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: rgba(0,0,0,0.05);
          color: #111827;
        }
        .dark-mode .modal-close {
          color: #9ca3af;
        }
        .dark-mode .modal-close:hover {
          background: rgba(255,255,255,0.1);
          color: #f9fafb;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #fff;
        }
        .dark-mode .form-group input,
        .dark-mode .form-group select,
        .dark-mode .form-group textarea {
          background: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        .form-row {
          display: flex;
          gap: 1rem;
        }
        .form-error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 0.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        .dark-mode .modal-footer {
          border-top-color: #374151;
        }
        .btn-secondary {
          background: #e5e7eb;
          color: #1f2937;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-primary {
          background: #0f9f9b;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <section className="page-title-card">
        <h1>Mes rendez-vous</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Chercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button className="btn transfer-add-btn" onClick={openModal}>
          <i ></i> Ajouter un rendez-vous
        </button>
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-search"><i className="fa-solid fa-magnifying-glass"></i></div>
                <h2>Aucun rendez-vous trouvé</h2>
                <p>Aucun rendez-vous n'est programmé pour cette date.</p>
                <button className="empty-state-btn" onClick={openModal}>
                  <i className="fa-solid fa-calendar-plus"></i> Programmer un rendez-vous
                </button>
              </div>
            ) : (
              <table className="rdv-table">
                <thead>
                  <tr><th>Heure</th><th>Patient</th><th>Motif</th><th>Statut</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((app) => {
                    const { text, className } = getStatusInfo(app.statut);
                    const buttonText = getButtonText(app.statut);
                    return (
                      <tr key={app.id}>
                        <td>{app.heure}</td>
                        <td>{app.patient}</td>
                        <td>{app.motif}</td>
                        <td><span className={className}>{text}</span></td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => handleConsultation(app.id)}>
                            {buttonText}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredAppointments.length} rendez-vous planifié{filteredAppointments.length > 1 ? 's' : ''}</span>
            <div className="table-pagination">
              <span className="table-page">Précédent</span>
              <span className="table-page active">1</span>
              <span className="table-page">Suivant</span>
            </div>
          </div>
        </article>
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Programmer un rendez-vous</h3>
              <button className="modal-close" onClick={closeModal} aria-label="Fermer">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="form-error">{formError}</div>}
                <div className="form-group">
                  <label>Patient *</label>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleInputChange}
                    required
                    disabled={loadingPatients}
                  >
                    <option value="">-- Sélectionner un patient --</option>
                    {patients.map(p => (
                     <option key={p.id} value={p.id}>
  {p.name}
</option>
                    ))}
                  </select>
                  {loadingPatients && <small>Chargement des patients...</small>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" name="date_consultation" value={formData.date_consultation} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Heure *</label>
                    <input type="time" name="heure" value={formData.heure} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Motif *</label>
                  <textarea name="motif" rows="3" value={formData.motif} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default RendezVousMedecin;