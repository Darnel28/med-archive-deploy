import React, { useEffect, useState } from 'react';
import { getCurrentService, updateCurrentService } from '../../api/serviceApi';

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

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Parametres du service</h1>
      </section>

      <div className="settings-shell">
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <span className="settings-nav-item active">
            <i className="fa-solid fa-sliders"></i><span>Informations du service</span>
          </span>
          <span className="settings-nav-item">
            <i className="fa-solid fa-building"></i><span>{service?.etablissement?.name || 'Etablissement'}</span>
          </span>
        </aside>

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

          <label className="settings-toggle settings-field-full">
            <input type="checkbox" name="est_actif" checked={formData.est_actif} onChange={handleChange} />
            <span>Service actif</span>
          </label>

          <div className="settings-submit-wrap settings-field-full">
            <button className="btn btn-solid settings-btn-compact" type="submit" disabled={saving || loading}>
              {saving ? 'Enregistrement...' : 'Enregistrer les parametres'}
            </button>
          </div>
        </form>
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
        .settings-nav-item { border-radius:10px; margin:6px; }
        .page-title-card { border-radius:12px; }
      `}</style>
    </main>
  );
};

export default ParametresAccueil;
