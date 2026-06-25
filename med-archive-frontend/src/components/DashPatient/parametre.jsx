import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../api/authApi';
import { getAuthUser, setAuthSession } from '../../api/client';
import { updatePatient } from '../../api/patientApi';
import { patientFromUser, unwrapUser } from './patientDashboardData';

const emptyForm = {
  name: '',
  email: '',
  telephone: '',
  sexe: '',
  date_naissance: '',
  adresse: '',
  ville: '',
  groupe_sanguin: '',
  allergies: '',
  antecedents_medicaux: '',
  personne_contact: '',
  telephone_contact: '',
};

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Patient')}&background=0f766e&color=fff`;

const formFromUser = (user) => {
  const patient = patientFromUser(user) || {};
  return {
    name: user?.name || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    sexe: user?.sexe || '',
    date_naissance: user?.date_naissance ? String(user.date_naissance).slice(0, 10) : '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    groupe_sanguin: patient.groupe_sanguin || '',
    allergies: patient.allergies || '',
    antecedents_medicaux: patient.antecedents_medicaux || '',
    personne_contact: patient.personne_contact || '',
    telephone_contact: patient.telephone_contact || '',
  };
};

const Parametres = () => {
  const [user, setUser] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setMessage('');
      try {
        const cached = getAuthUser();
        const current = unwrapUser(await getCurrentUser()) || cached;
        const patient = patientFromUser(current);
        if (active) {
          setUser(current);
          setPatientId(patient?.id || null);
          setFormData(formFromUser(current));
        }
      } catch (error) {
        if (active) setMessage(error?.response?.data?.message || 'Impossible de charger vos parametres.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!patientId) {
      setMessage('Profil patient introuvable.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const response = await updatePatient(patientId, {
        name: formData.name,
        telephone: formData.telephone,
        adresse: formData.adresse,
        groupe_sanguin: formData.groupe_sanguin || null,
        allergies: formData.allergies || null,
        antecedents_medicaux: formData.antecedents_medicaux || null,
        personne_contact: formData.personne_contact || null,
        telephone_contact: formData.telephone_contact || null,
      });

      const refreshedUser = unwrapUser(await getCurrentUser()) || {
        ...user,
        name: formData.name,
        telephone: formData.telephone,
        adresse: formData.adresse,
        patient: response?.data || patientFromUser(user),
      };

      setAuthSession({ user: refreshedUser });
      setUser(refreshedUser);
      setFormData(formFromUser(refreshedUser));
      setMessage('Modifications enregistrees avec succes.');
    } catch (error) {
      setMessage(error?.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Parametres du compte</h1>
      </section>

      {message && <p className="form-message">{message}</p>}

      <div className="settings-shell">
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <Link className="settings-nav-item" to="/espacepatient/profil">
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </Link>
          <Link className="settings-nav-item active" to="/espacepatient/parametres">
            <i className="fa-regular fa-user"></i><span>Parametres du profil</span>
          </Link>
          <Link className="settings-nav-item" to="/espacepatient/securite-compte">
            <i className="fa-solid fa-lock"></i><span>Securite du compte</span>
          </Link>
          <Link className="settings-nav-item" to="/espacepatient/preferences-notifications">
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </Link>
        </aside>

        <article className="settings-main-card">
          <div className="settings-profile-head">
            <div className="settings-avatar-wrap">
              <img src={avatarFor(formData.name)} alt="Avatar" className="settings-avatar" />
            </div>
            <div className="settings-avatar-actions">
              <strong>{formData.name || 'Patient'}</strong>
              {/* <span>{formData.email || '-'}</span> */}
            </div>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <form className="settings-form-grid" onSubmit={handleSubmit}>
              <label className="settings-field">
                <span>Nom complet</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom complet" />
              </label>

              <label className="settings-field">
                <span>Email</span>
                <input type="email" name="email" value={formData.email} readOnly placeholder="Email" />
              </label>

              <label className="settings-field">
                <span>Numero de telephone</span>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Telephone" />
              </label>

              <label className="settings-field">
                <span>Sexe</span>
                <input type="text" name="sexe" value={formData.sexe} readOnly />
              </label>

              <label className="settings-field">
                <span>Date de naissance</span>
                <input type="date" name="date_naissance" value={formData.date_naissance} readOnly />
              </label>

              <label className="settings-field">
                <span>Groupe sanguin</span>
                <select name="groupe_sanguin" value={formData.groupe_sanguin} onChange={handleChange}>
                  <option value="">Non renseigne</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </label>

              <label className="settings-field settings-field-full">
                <span>Adresse</span>
                <textarea name="adresse" rows="3" value={formData.adresse} onChange={handleChange} placeholder="Saisir votre adresse"></textarea>
              </label>

              <label className="settings-field settings-field-full">
                <span>Allergies</span>
                <textarea name="allergies" rows="3" value={formData.allergies} onChange={handleChange} placeholder="Allergies connues"></textarea>
              </label>

              <label className="settings-field settings-field-full">
                <span>Antecedents medicaux</span>
                <textarea name="antecedents_medicaux" rows="3" value={formData.antecedents_medicaux} onChange={handleChange} placeholder="Antecedents medicaux"></textarea>
              </label>

              <label className="settings-field">
                <span>Personne a contacter</span>
                <input type="text" name="personne_contact" value={formData.personne_contact} onChange={handleChange} placeholder="Nom du contact" />
              </label>

              <label className="settings-field">
                <span>Telephone du contact</span>
                <input type="tel" name="telephone_contact" value={formData.telephone_contact} onChange={handleChange} placeholder="Telephone du contact" />
              </label>

              <div className="settings-submit-wrap settings-field-full">
                <button className="btn btn-solid settings-btn-compact" type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
                <Link className="btn btn-outline settings-btn-compact" to="/espacepatient/profil">
                  Voir le profil
                </Link>
              </div>
            </form>
          )}
        </article>
      </div>
    </main>
  );
};

export default Parametres;
