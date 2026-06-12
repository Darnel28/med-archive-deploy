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
  };

  const submitResult = async (event) => {
    event.preventDefault();
    if (!resultModal) return;
    setMessage('');
    try {
      await ajouterResultatsAnalyse(resultModal.id, {
        resultats: {
          valeur: Number(resultForm.valeur),
          unite: resultForm.unite,
          normale: Boolean(resultForm.normale),
          commentaire: resultForm.commentaire,
        },
      });
      setResultModal(null);
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
                      <td><span className={`rdv-status ${isPaid ? 'done' : 'pending'}`}>{isPaid ? 'Paye' : 'A payer'}</span></td>
                      <td><span className="rdv-status upcoming">{analysis.statut}</span></td>
                      <td className="rdv-actions table-actions-compact">
                        <button className="icon-action" title="Prelever" onClick={() => changeStatus(analysis, 'preleve')} disabled={!isPaid || analysis.statut === 'termine'}>
                          <i className="fa-solid fa-vial"></i>
                        </button>
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
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={submitResult}>
            <h2>Ajouter un resultat</h2>
            <input type="number" step="0.01" placeholder="Valeur" value={resultForm.valeur} onChange={(event) => setResultForm((prev) => ({ ...prev, valeur: event.target.value }))} required />
            <input type="text" placeholder="Unite" value={resultForm.unite} onChange={(event) => setResultForm((prev) => ({ ...prev, unite: event.target.value }))} required />
            <label className="form-check">
              <input type="checkbox" checked={resultForm.normale} onChange={(event) => setResultForm((prev) => ({ ...prev, normale: event.target.checked }))} />
              Valeur normale
            </label>
            <textarea placeholder="Commentaire / conclusion" value={resultForm.commentaire} onChange={(event) => setResultForm((prev) => ({ ...prev, commentaire: event.target.value }))} />
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setResultModal(null)}>Annuler</button>
              <button type="submit" className="btn btn-solid">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default DemandeExamLabo;
