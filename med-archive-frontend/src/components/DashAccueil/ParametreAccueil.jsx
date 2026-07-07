import React, { useEffect, useState } from 'react';
import { FiLock } from 'react-icons/fi';
import { apiClient } from '../../api/client';
import { getCurrentService, updateCurrentService } from '../../api/serviceApi';
import useAutoDismissMessage from '../../hooks/useAutoDismissMessage';

const emptyForm = {
  nom: '',
  description: '',
  est_actif: true,
  tarif_patient_simple: '',
  tarif_patient_assure: '',
};

const ParametresAccueil = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activePanel, setActivePanel] = useState('service');
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('success');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useAutoDismissMessage(success, setSuccess);
  useAutoDismissMessage(passwordMessageType === 'success' ? passwordMessage : '', setPasswordMessage);

  useEffect(() => {
    let ignore = false;

    async function loadService() {
      try {
        setLoading(true);
        setError('');
        const response = await getCurrentService();
        const currentService = response?.data ?? response;

        if (ignore) return;

        setService(currentService);
        setFormData({
          nom: currentService?.nom || '',
          description: currentService?.description || '',
          est_actif: Boolean(currentService?.est_actif ?? true),
          tarif_patient_simple: currentService?.tarif_patient_simple ?? '',
          tarif_patient_assure: currentService?.tarif_patient_assure ?? '',
        });
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || 'Impossible de charger les parametres du service.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadService();
    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateCurrentService({
        ...formData,
        tarif_patient_simple: formData.tarif_patient_simple === '' ? null : Number(formData.tarif_patient_simple),
        tarif_patient_assure: formData.tarif_patient_assure === '' ? null : Number(formData.tarif_patient_assure),
      });
      const updatedService = response?.data ?? response;
      setService(updatedService);
      setSuccess(response?.message || 'Parametres du service mis a jour.');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d enregistrer les parametres.');
    } finally {
      setSaving(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setPasswordMessage('');

    if (passwordForm.password.length < 8) {
      setPasswordMessageType('error');
      setPasswordMessage('Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordMessageType('error');
      setPasswordMessage('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post('/me/mot-de-passe', passwordForm);
      setPasswordMessageType('success');
      setPasswordMessage('Mot de passe modifie avec succes.');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setPasswordMessageType('error');
      setPasswordMessage(err.response?.data?.message || 'Impossible de modifier le mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Parametres du service</h1>
      </section>

      <div className="settings-shell">
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <button className={`settings-nav-item${activePanel === 'service' ? ' active' : ''}`} type="button" onClick={() => setActivePanel('service')}>
            <i className="fa-solid fa-sliders"></i><span>Informations du service</span>
          </button>
          <button className={`settings-nav-item${activePanel === 'security' ? ' active' : ''}`} type="button" onClick={() => setActivePanel('security')}>
            <i className="fa-solid fa-lock"></i><span>Changer le mot de passe</span>
          </button>
          <span className="settings-nav-item">
            <i className="fa-solid fa-building"></i><span>{service?.etablissement?.name || 'Etablissement'}</span>
          </span>
        </aside>

        {activePanel === 'service' ? (
          <form className="settings-form-grid" onSubmit={handleSubmit}>
            {loading ? <p className="settings-field-full">Chargement des parametres...</p> : null}
            {error ? <p className="settings-alert settings-alert-error settings-field-full">{error}</p> : null}
            {success ? <p className="settings-alert settings-alert-success settings-field-full">{success}</p> : null}

            <label className="settings-field settings-field-full">
              <span>Nom du service</span>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
            </label>

            <label className="settings-field">
              <span>Tarif consultation non assure</span>
              <input type="number" name="tarif_patient_simple" value={formData.tarif_patient_simple} onChange={handleChange} min="0" step="100" />
            </label>

            <label className="settings-field">
              <span>Tarif consultation assure</span>
              <input type="number" name="tarif_patient_assure" value={formData.tarif_patient_assure} onChange={handleChange} min="0" step="100" />
            </label>

            <label className="settings-field settings-field-full">
              <span>Description</span>
              <textarea name="description" rows="4" value={formData.description || ''} onChange={handleChange} />
            </label>

            {/* <label className="settings-toggle settings-field-full">
              <input type="checkbox" name="est_actif" checked={formData.est_actif} onChange={handleChange} />
              <span>Service actif</span>
            </label> */}

            <div className="settings-submit-wrap settings-field-full">
              <button className="btn btn-solid settings-btn-compact" type="submit" disabled={saving || loading}>
                {saving ? 'Enregistrement...' : 'Enregistrer les parametres'}
              </button>
            </div>
          </form>
        ) : (
          <form className="settings-form-grid password-settings-form" onSubmit={submitPassword}>
            <div className="settings-field-full password-settings-head">
              <span className="password-settings-icon"><FiLock /></span>
              <div>
                <h2>Securite du compte</h2>
                <p>Modifiez le mot de passe utilise pour acceder a cet espace.</p>
              </div>
            </div>

            <label className="settings-field settings-field-full">
              <span>Ancien mot de passe</span>
              <input type="password" value={passwordForm.current_password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))} required />
            </label>

            <label className="settings-field">
              <span>Nouveau mot de passe</span>
              <input type="password" value={passwordForm.password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))} required />
            </label>

            <label className="settings-field">
              <span>Confirmation</span>
              <input type="password" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password_confirmation: event.target.value }))} required />
            </label>

            {passwordMessage ? (
              <p className={`settings-alert settings-field-full ${passwordMessageType === 'error' ? 'settings-alert-error' : 'settings-alert-success'}`}>
                {passwordMessage}
              </p>
            ) : null}

            <div className="settings-submit-wrap settings-field-full">
              <button className="btn btn-solid settings-btn-compact" type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .settings-form-grid { background:#fff; border-radius:12px; padding:24px; }
        .settings-field input,.settings-field select,.settings-field textarea { border-radius:10px; border:1px solid #d9e2ec; padding:12px 15px; width:100%; transition:all .2s ease; }
        .settings-field input:focus,.settings-field select:focus,.settings-field textarea:focus { outline:none; border-color:#24c0f1; box-shadow:0 0 0 3px rgba(36,192,241,.15); }
        .settings-toggle { display:flex; align-items:center; gap:10px; font-weight:600; }
        .settings-toggle input { width:18px; height:18px; }
        .settings-alert { padding:12px 14px; border-radius:10px; margin:0; }
        .settings-alert-error { color:#b42318; background:#fff1f0; }
        .settings-alert-success { color:#027a48; background:#ecfdf3; }
        .settings-btn-compact { border-radius:10px !important; padding:12px 24px; }
        .settings-btn-compact:disabled { opacity:.65; cursor:not-allowed; }
        .settings-nav-card { border-radius:12px; overflow:hidden; }
        .settings-nav-card .settings-nav-item {
          width:calc(100% - 12px);
          min-height:44px;
          border:0;
          border-left:3px solid transparent;
          border-radius:10px;
          margin:6px;
          background:transparent;
          color:#5a7393 !important;
          font:inherit;
          font-size:14px;
          font-weight:600;
          line-height:1.35;
          text-align:left;
          justify-content:flex-start;
          cursor:pointer;
          appearance:none;
          -webkit-appearance:none;
        }
        .settings-nav-card .settings-nav-item:hover,
        .settings-nav-card .settings-nav-item.active {
          background:#f2f6ff !important;
          border-left-color:#2f56d8;
          color:#2f56d8 !important;
        }
        .settings-nav-card .settings-nav-item:focus {
          outline:none;
          box-shadow:0 0 0 3px rgba(47,86,216,.12);
        }
        .settings-nav-card .settings-nav-item i,
        .settings-nav-card .settings-nav-item svg {
          width:18px;
          min-width:18px;
          color:currentColor !important;
          text-align:center;
        }
        .settings-nav-card span.settings-nav-item { cursor:default; }
        .page-title-card { border-radius:12px; }
        .password-settings-form { align-content:start; }
        .password-settings-head { display:flex; align-items:center; gap:14px; margin-bottom:4px; }
        .password-settings-head h2 { margin:0 0 4px; color:#102a43; font-size:22px; }
        .password-settings-head p { margin:0; color:#6b7280; }
        .password-settings-icon { width:46px; height:46px; display:inline-flex; align-items:center; justify-content:center; border-radius:12px; color:#0f766e; background:#e6fffb; font-size:22px; }
      `}</style>
    </main>
  );
};

export default ParametresAccueil;
