import React, { useEffect, useState } from 'react';
import { getMesDonneesEtablissement, updateEtablissementInfo } from '../../api/etablissementApi';

const emptyForm = {
  name: '',
  email: '',
};

export default function ParametresHopital() {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadEtablissement() {
      try {
        setLoading(true);
        setError('');
        const response = await getMesDonneesEtablissement();
        const etablissement = response?.data?.etablissement ?? response?.etablissement ?? response?.data ?? {};

        if (ignore) return;

        setFormData({
          name: etablissement.nom || etablissement.name || '',
          email: etablissement.email || '',
        });
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || 'Impossible de charger les parametres de l hopital.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadEtablissement();
    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateEtablissementInfo(formData);
      setSuccess(response?.message || 'Parametres de l hopital mis a jour.');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible d enregistrer les parametres.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Parametres de l hopital</h1>
      </section>

      <div className="settings-shell">
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <span className="settings-nav-item active">
            <i className="fa-solid fa-building"></i><span>Informations de l hopital</span>
          </span>
        </aside>

        <form className="settings-form-grid" onSubmit={handleSubmit}>
          {loading ? <p className="settings-field-full">Chargement des parametres...</p> : null}
          {error ? <p className="settings-alert settings-alert-error settings-field-full">{error}</p> : null}
          {success ? <p className="settings-alert settings-alert-success settings-field-full">{success}</p> : null}

          <label className="settings-field">
            <span>Nom de l hopital</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label className="settings-field">
            <span>Email de l hopital</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
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
        .settings-field input { border-radius:10px; border:1px solid #d9e2ec; padding:12px 15px; width:100%; transition:all .2s ease; }
        .settings-field input:focus { outline:none; border-color:#24c0f1; box-shadow:0 0 0 3px rgba(36,192,241,.15); }
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
}
