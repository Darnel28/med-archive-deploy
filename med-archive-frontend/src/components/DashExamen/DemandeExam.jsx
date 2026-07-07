import React, { useEffect, useMemo, useState } from 'react';
import { ajouterResultatsAnalyse, getAnalyses, updateAnalyseStatut } from '../../api/analyseApi';

const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value) => value ? new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const DemandeExamLabo = () => {
  const [analyses, setAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [resultModal, setResultModal] = useState(null);
  const [resultForm, setResultForm] = useState({ valeur: '', unite: '', normale: true, commentaire: '' });
  const [resultFile, setResultFile] = useState(null);

  const loadAnalyses = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await getAnalyses({ per_page: 50 });
      setAnalyses(unwrapRows(response));
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible de charger les demandes.');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const filteredAnalyses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return analyses;
    return analyses.filter((analysis) => [
      analysis.type_analyse,
      analysis.consultation?.dossier?.patient?.user?.name,
      analysis.prescripteur?.user?.name,
      analysis.statut,
      analysis.statut_paiement,
    ].join(' ').toLowerCase().includes(query));
  }, [analyses, searchTerm]);

  const changeStatus = async (analysis, statut) => {
    setMessage('');
    try {
      await updateAnalyseStatut(analysis.id, { statut });
      await loadAnalyses();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Statut impossible a modifier.');
    }
  };

  const openResultModal = (analysis) => {
    if (analysis.statut_paiement !== 'payee') {
      setMessage('Cette analyse doit etre payee avant traitement.');
      return;
    }
    setResultModal(analysis);
    setResultForm({ valeur: '', unite: '', normale: true, commentaire: '' });
    setResultFile(null);
  };

  const submitResult = async (event) => {
    event.preventDefault();
    if (!resultModal) return;
    setMessage('');
    try {
      const payload = new FormData();
      if (resultForm.valeur !== '') {
        payload.append('resultats[valeur]', Number(resultForm.valeur));
      }
      if (resultForm.unite.trim() !== '') {
        payload.append('resultats[unite]', resultForm.unite);
      }
      payload.append('resultats[normale]', resultForm.normale ? '1' : '0');
      payload.append('resultats[commentaire]', resultForm.commentaire);
      if (resultFile) {
        payload.append('fichier_resultat', resultFile);
      }

      await ajouterResultatsAnalyse(resultModal.id, payload);
      setResultModal(null);
      setResultFile(null);
      await loadAnalyses();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible d enregistrer le resultat.');
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Demandes d'examens de laboratoire</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche demandes d'examens">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une demande d'examens..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Examen</th>
                  <th>Medecin</th>
                  <th>Laboratoire</th>
                  <th>Date</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && filteredAnalyses.map((analysis) => {
                  const patient = analysis.consultation?.dossier?.patient?.user?.name || 'Patient';
                  const isPaid = analysis.statut_paiement === 'payee';

                  return (
                    <tr key={analysis.id}>
                      <td className="table-title-cell">{patient}</td>
                      <td>
                        {analysis.type_analyse}
                        <span className="table-subtext">{analysis.commentaires || 'Analyse prescrite'}</span>
                      </td>
                      <td>{analysis.prescripteur?.user?.name || '-'}</td>
                      <td>{analysis.laboratoire?.nom_laboratoire || analysis.laboratoire?.user?.name || '-'}</td>
                      <td className="table-nowrap">{formatDate(analysis.date_prelevement)}</td>
                      <td><span className={`rdv-status ${isPaid ? 'done' : 'pending'}`}>{isPaid ? 'Paye' : 'En attente de paiement'}</span></td>
                      <td><span className="rdv-status upcoming">{analysis.statut}</span></td>
                      <td className="rdv-actions table-actions-compact">
                        {/* <button className="icon-action" title="Prelever" onClick={() => changeStatus(analysis, 'preleve')} disabled={!isPaid || analysis.statut === 'termine'}>
                          <i className="fa-solid fa-vial"></i>
                        </button> */}
                        <button className="icon-action" title="Ajouter resultat" onClick={() => openResultModal(analysis)} disabled={!isPaid || analysis.statut === 'termine'}>
                          <i className="fa-solid fa-file-medical"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filteredAnalyses.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center' }}>Aucune demande trouvee</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredAnalyses.length} demandes repertoriees</span>
          </div>
        </article>
      </section>

      {resultModal && (
        <div className="modal-backdrop" onClick={() => { setResultModal(null); setResultFile(null); }}>
          <div className="modal-card modal-result" onClick={(e) => e.stopPropagation()}>
            {/* Bouton de fermeture */}
            <button
              type="button"
              className="modal-close"
              onClick={() => { setResultModal(null); setResultFile(null); }}
              aria-label="Fermer"
            >
              ×
            </button>

            <h2>Résultat d'analyse</h2>
            <p className="modal-description">
              Saisissez les informations concernant le résultat de
              <strong> {resultModal.type_analyse}</strong>.
            </p>

            <form className="modal-form" onSubmit={submitResult}>
              <div className="form-row">
                <div className="form-group">
                  <label>Valeur</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex : 12.5"
                    value={resultForm.valeur}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        valeur: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Unité</label>
                  <input
                    type="text"
                    placeholder="Ex : g/L"
                    value={resultForm.unite}
                    onChange={(e) =>
                      setResultForm((prev) => ({
                        ...prev,
                        unite: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Commentaire</label>
                <textarea
                  rows="2"
                  placeholder="Conclusion ou observations..."
                  value={resultForm.commentaire}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      commentaire: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Résultat (Image ou PDF)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setResultFile(e.target.files[0])}
                />
              </div>

              <label className="result-checkbox">
                <input
                  type="checkbox"
                  checked={resultForm.normale}
                  onChange={(e) =>
                    setResultForm((prev) => ({
                      ...prev,
                      normale: e.target.checked,
                    }))
                  }
                />
                <span>Résultat dans les valeurs normales</span>
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setResultModal(null); setResultFile(null); }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-solid">
                  <i className="fa-solid fa-floppy-disk"></i>
                  &nbsp; Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
    /* ---------- Modal ---------- */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
      animation: fadeIn 0.2s ease;
    }

    .modal-card {
      background: #ffffff;
      width: 95%;
      max-width: 560px;
      border-radius: 20px;
      padding: 24px 28px 28px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.25s ease;
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-close {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 28px;
      line-height: 1;
      color: #94a3b8;
      cursor: pointer;
      transition: 0.2s;
      padding: 4px 8px;
      border-radius: 8px;
    }

    .modal-close:hover {
      color: #0f172a;
      background: #f1f5f9;
    }

    .modal-card h2 {
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      text-align: center;
    }

    .modal-description {
      text-align: center;
      color: #475569;
      font-size: 14px;
      margin: 0 0 22px 0;
    }

    .modal-description strong {
      color: #0f172a;
    }

    /* ---------- Formulaire ---------- */
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 600;
      font-size: 13px;
      color: #334155;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      font-size: 14px;
      transition: 0.15s;
      box-sizing: border-box;
      background: #fafbfc;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      border-color: #0ea5e9;
      outline: none;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      background: #ffffff;
    }

    .form-group textarea {
      min-height: 60px;
      resize: vertical;
      font-family: inherit;
    }

    .form-group input[type="file"] {
      padding: 12px;
      border: 2px dashed #0ea5e9;
      border-radius: 10px;
      background: #f8fbff;
      cursor: pointer;
      font-size: 13px;
    }

    .form-group input[type="file"]:hover {
      background: #eef8ff;
    }

    /* Checkbox personnalisée */
    .result-checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      color: #1e293b;
      transition: 0.15s;
    }

    .result-checkbox:hover {
      background: #f1f5f9;
    }

    .result-checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #0ea5e9;
      cursor: pointer;
    }

    /* Boutons */
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 22px;
    }

    .btn-outline,
    .btn-solid {
      padding: 10px 24px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-outline {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-outline:hover {
      background: #e2e8f0;
    }

    .btn-solid {
      background: #0ea5e9;
      color: #ffffff;
    }

    .btn-solid:hover {
      background: #0284c7;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .form-row {
        flex-direction: column;
        gap: 12px;
      }
      .modal-card {
        padding: 20px;
      }
    }

    /* Supprimer les flèches des champs number */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      appearance: textfield;
      -moz-appearance: textfield;
    }
  `}
      </style>

    </main>
  );
};

export default DemandeExamLabo;
