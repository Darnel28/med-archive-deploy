import React, { useEffect, useState } from 'react';
import { getAuthToken, getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { getMedecinById, updateMedecin } from '../../api/medecinApi';

const DEFAULT_API_URL = 'http://localhost:8000/api';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const ProfilMedecin = () => {
  const [medecin, setMedecin] = useState(null);
  const [statistiques, setStatistiques] = useState(null);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [editForm, setEditForm] = useState({
    specialite_id: '',
    diplomes: '',
    diplome: '',
    annees_experience: '',
    telephone: '',
    adresse: '',
  });
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
   const formatBirthDate = (value) => {
    if (!value) return '—';
    const raw = String(value).split('T')[0];
    return raw || '—';
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
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let auth = normalizeAuthPayload(getAuthUser());
        let medecinId = extractMedecinId(auth);

        if (!medecinId) {
          const token = getAuthToken();
          if (token) {
            const current = await getCurrentUser();
            auth = normalizeAuthPayload(current);
            medecinId = extractMedecinId(auth);
          }
        }
        console.log('AUTH =', auth);
        console.log('MEDECIN ID =', medecinId);

        if (!medecinId) {
          console.log('AUTH RECUPERE =', auth);
          setError('Impossible d’identifier le médecin connecté');
          return;
        }
  const token = getAuthToken();
        const data = await getMedecinById(medecinId, token);
        const payload = data?.medecin ? data : data?.data ?? data;
        setMedecin(payload?.medecin ?? payload);
        setStatistiques(payload?.statistiques ?? null);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    }
      load();
  }, []);

  useEffect(() => {
    async function loadSpecialites() {
      try {
        const response = await fetch(`${API_URL}/specialites`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            Accept: 'application/json',
          },
        });
            const json = await response.json();
        setSpecialites(json?.data || []);
      } catch (err) {
        console.error(err);
        setSpecialites([]);
      }
    }

    loadSpecialites();
  }, []);
  const handleEdit = () => {
    setEditForm({
      specialite_id: medecin?.specialite?.id || '',
      diplomes: '',
      diplome: medecin?.diplome || '',
      annees_experience: medecin?.annees_experience ?? '',
      telephone: medecin?.user?.telephone || '',
      adresse: medecin?.user?.adresse || '',
    });
    setSaveError(null);
    setIsEditing(true);
  };
   const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'annees_experience' || name === 'specialite_id'
        ? (value === '' ? '' : Number(value))
        : value,
    }));
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };
   const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaveError(null);

      const token = getAuthToken();
      const medecinId = medecin?.id;

      if (!medecinId) {
        throw new Error('ID du médecin introuvable');
      }
       const payload = {
        specialite_id: editForm.specialite_id || null,
        diplome: editForm.diplome,
        annees_experience: editForm.annees_experience || 0,
        telephone: editForm.telephone,
        adresse: editForm.adresse,
      };

      const updated = await updateMedecin(medecinId, payload, token);
      const payloadData = updated?.medecin ? updated : updated?.data ?? updated;
      
      setMedecin(payloadData?.medecin ?? payloadData);
      setStatistiques(payloadData?.statistiques ?? statistiques);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="content page-tight">Chargement du profil...</main>;
  }
   if (error) {
    return <main className="content page-tight">Erreur: {error}</main>;
  }

  const display = {
    name: medecin?.user?.name || '—',
    email: medecin?.user?.email || '—',
    phone: medecin?.user?.telephone || '—',
    location: medecin?.user?.adresse || '—',
    date_naissance: formatBirthDate(medecin?.user?.date_naissance),
    sexe: medecin?.user?.sexe || '—',
    statut: medecin?.user?.statut || '—',
    specialite: medecin?.specialite?.nom || '—',
    etablissement: medecin?.etablissement?.name || '—',
    numero_professionnel: medecin?.numero_professionnel || '—',
    diplome: medecin?.diplome || '—',
    annees_experience: medecin?.annees_experience ?? '—',
    consultations_count: Array.isArray(medecin?.consultations) ? medecin.consultations.length : 0,
      avatar: medecin?.user?.avatar || medecin?.avatar || null,
    about: medecin?.about || medecin?.bio || '',
    skills: medecin?.skills || [],
    stats: {
      patients: statistiques?.patients_uniques ?? medecin?.patients_count ?? 0,
      consultations: statistiques?.total_consultations ?? (Array.isArray(medecin?.consultations) ? medecin.consultations.length : 0),
      consultations_mois: statistiques?.consultations_mois ?? 0,
      analyses_prescrites: statistiques?.analyses_prescrites ?? 0,
    },
  };
   return (
    <main className="content page-tight profile-page-light" style={{ background: '#f5f7fb' }}>
      {/* HEADER */}
      <div className="profile-header" style={{
        background: 'white',
        margin: '20px',
        padding: '25px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 5px 15px rgba(2,6,23,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {display.avatar ? (
            <img src={display.avatar} alt={display.name} style={{ width: '90px', height: '90px', borderRadius: '50%', marginRight: '20px', objectFit: 'cover' }} />
          ) : (
             <div style={{ width: '90px', height: '90px', borderRadius: '50%', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)', color: '#fff', fontWeight: 700, fontSize: '28px' }}>
              {display.name !== '—' ? display.name.split(/\s+/).filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() : '—'}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, color: '#111827', fontWeight: 800 }}>{display.name}</h2>
              <p style={{ margin: '5px 0', color: 'gray' }}>{display.specialite}</p>
            <p style={{ margin: 0, color: 'gray' }}>{display.location} • {display.annees_experience !== '—' ? `${display.annees_experience} ans d'expérience` : ''}</p>
          </div>
        </div>
        <div>
          <button onClick={handleEdit} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', marginLeft: '10px', cursor: 'pointer', background: '#00b894', color: 'white' }}>Modifier</button>
        </div>
      </div>
        {/* STATS */}
      <div className="profile-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: '15px',
        margin: '20px'
      }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(2,6,23,0.05)' }}>
          <strong>Patients </strong>
          <p>{display.stats.patients}</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(2,6,23,0.05)' }}>
          <strong>Consultations</strong>
          <p>{display.stats.consultations}</p>
        </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(2,6,23,0.05)' }}>
          <strong>Consultations du mois</strong>
          <p>{display.stats.consultations_mois}</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(2,6,23,0.05)' }}>
          <strong>Analyses prescrites</strong>
          <p>{display.stats.analyses_prescrites}</p>
        </div>
      </div>
       {/* MAIN GRID */}
      <div className="profile-main-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px',
        margin: '20px'
      }}>
        {/* LEFT COLUMN */}
        <div>
          {/* À propos */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 3px 10px rgba(2,6,23,0.05)' }}>
            <h3>À propos</h3>
            {/* <p style={{ lineHeight: 1.6 }}>{display.about || 'Aucune description disponible.'}</p> */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Email : {display.email}</div>
               <div style={{ marginTop: '10px', fontSize: '14px' }}>Téléphone : {display.phone}</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Adresse : {display.location}</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Statut : {display.statut}</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Établissement : {display.etablissement}</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Numéro professionnel : {display.numero_professionnel}</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Diplôme : {display.diplome}</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Années d’expérience : {display.annees_experience}</div>
            </div>
          </div>
               {/* Compétences */}
          {Array.isArray(medecin?.skills) && (
            <div style={{ background: '#0d1b2a', padding: '20px', borderRadius: '15px', boxShadow: '0 12px 30px rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
              <h3>Compétences</h3>
              <div>
                {medecin.skills.map((skill, idx) => (
                  <span key={idx} style={{ display: 'inline-block', padding: '8px 14px', margin: '5px', background: '#e6f7f5', borderRadius: '20px', fontSize: '13px' }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
          {/* RIGHT COLUMN */}
        <div>
          {/* Profil détaillé */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 3px 10px rgba(2,6,23,0.05)' }}>
            <h3>Informations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Nom</small>
                <strong>{display.name}</strong>
              </div>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Email</small>
                <strong>{display.email}</strong>
              </div>
              <div>
                  <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Téléphone</small>
                <strong>{display.phone}</strong>
              </div>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Adresse</small>
                <strong>{display.location}</strong>
              </div>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Date de naissance</small>
                <strong>{display.date_naissance}</strong>
              </div>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Sexe</small>
                <strong>{display.sexe}</strong>
              </div>
               <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Spécialité</small>
                <strong>{display.specialite}</strong>
              </div>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Établissement</small>
                <strong>{display.etablissement}</strong>
              </div>
              <div>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Années d’expérience</small>
                <strong>{display.annees_experience}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
        {isEditing && (
        <div
          className="profile-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseEdit}
        >
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Modifier le profil</h3>
                <p style={{ margin: '6px 0 0', fontSize: '14px' }}>
                  Mettre à jour vos informations personnelles.
                </p>
              </div>
              <button type="button" className="profile-modal-close" onClick={handleCloseEdit} aria-label="Fermer">
                ×
                 </button>
            </div>

            <form onSubmit={handleSave} className="profile-modal-form">
              <div className="profile-form-grid">
                <label className="profile-field">
                  <span>Spécialité</span>
                  <select
                    name="specialite_id"
                    value={editForm.specialite_id}
                    onChange={handleChange}
                  >
                    <option value="">Choisir une spécialité</option>
                    {specialites.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.nom}
                      </option>
                    ))}
                  </select>
                    </label>

                <label className="profile-field">
                  <span>Diplôme</span>
                  <input
                    type="text"
                    name="diplome"
                    value={editForm.diplome}
                    onChange={handleChange}
                    placeholder="Diplôme"
                  />
                </label>

                <label className="profile-field">
                  <span>Années d'expérience</span>
                  <input
                    type="number"
                    min="0"
                    name="annees_experience"
                    value={editForm.annees_experience}
                    onChange={handleChange}
                    placeholder="Années d'expérience"
                  />
                </label>

                <label className="profile-field">
                  <span>Téléphone</span>
                  <input
                    type="tel"
                    name="telephone"
                    value={editForm.telephone}
                    onChange={handleChange}
                    placeholder="Téléphone"
                  />
                </label>

                <label className="profile-field profile-field-full">
                  <span>Adresse</span>
                   <textarea
                    name="adresse"
                    rows="3"
                    value={editForm.adresse}
                    onChange={handleChange}
                    placeholder="Adresse"
                  />
                </label>
              </div>

              {saveError && (
                <div style={{ marginTop: '10px', color: '#f87171', fontSize: '14px' }}>
                  {saveError}
                </div>
              )}
              <div className="profile-modal-actions">
                <button type="button" onClick={handleCloseEdit} className="profile-modal-cancel" disabled={saving}>
                  Annuler
                </button>
                <button type="submit" className="profile-modal-save" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

 <style>{`
        .profile-page-light {
          color: #111827;
        }

        .profile-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 2000;
        }
  .profile-modal {
          width: min(760px, 100%);
          max-height: calc(100vh - 40px);
          overflow: auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(2,6,23,0.08);
          padding: 22px;
          border: 1px solid rgba(2,6,23,0.06);
          color: #111827;
        }

        .profile-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
          .profile-modal-close {
          border: none;
          background: #f3f4f6;
          color: #111827;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .profile-modal-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
             .profile-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .profile-field span {
          font-size: 13px;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: none;
        }
  .profile-field input,
        .profile-field textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 12px 14px;
          font: inherit;
          color: #111827;
          background: #fff;
          outline: none;
        }

        .profile-field select {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 12px 14px;
          font: inherit;
          color: #111827;
          background: #fff;
          outline: none;
        }
           .profile-field input:focus,
        .profile-field textarea:focus,
        .profile-field select:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
        }

        .profile-field-full {
          grid-column: 1 / -1;
        }

        .profile-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }
               .profile-modal-cancel,
        .profile-modal-save {
          border: none;
          border-radius: 12px;
          padding: 11px 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .profile-modal-cancel {
          background: #f3f4f6;
          color: #111827;
        }

        .profile-modal-save {
          background: #00b894;
          color: white;
        }
           .profile-modal-cancel:disabled,
        .profile-modal-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px;
            margin: 12px !important;
            padding: 18px !important;
          }
              .profile-header > div:first-child {
            width: 100%;
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .profile-header img,
          .profile-header > div:first-child > div {
            margin-right: 14px !important;
            margin-bottom: 8px;
          }

          .profile-stats-grid {
            grid-template-columns: 1fr !important;
            margin: 12px !important;
          }

          .profile-main-grid {
            grid-template-columns: 1fr !important;
            margin: 12px !important;
          }
               .profile-main-grid > div,
          .profile-stats-grid > div {
            min-width: 0;
          }

          .profile-main-grid > div > div > div > strong,
          .profile-main-grid > div > div > div > small {
            word-break: break-word;
          }

          .profile-main-grid > div > div {
            grid-template-columns: 1fr !important;
          }

          .profile-form-grid {
            grid-template-columns: 1fr;
          }
             .profile-modal {
            padding: 18px;
          }

          .profile-modal-actions {
            justify-content: stretch;
          }

          .profile-modal-cancel,
          .profile-modal-save {
            width: 100%;
          }
        }

        .badge.green { background: #d4edda; }
        .badge.blue { background: #cce5ff; }
        .badge.orange { background: #ffeeba; }
      `}</style>
    </main>
  );
  };

export default ProfilMedecin; 