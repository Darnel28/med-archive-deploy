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
        <form className="modal-card modal-result" onSubmit={submitResult}>

            {/* <div className="modal-icon">
                <i className="fa-solid fa-flask-vial"></i>
            </div> */}

            <h2>Résultat d'analyse</h2>

            <p className="modal-description">
                Saisissez les informations concernant le résultat de
                <strong> {resultModal.type_analyse}</strong>.
            </p>

            <div className="modal-form">

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

                <div className="form-group">
                    <label>Commentaire</label>
                    <textarea
                        rows="4"
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

            </div>

            <div className="modal-actions">

                <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setResultModal(null);
                      setResultFile(null);
                    }}
                >
                    Annuler
                </button>

                <button
                    type="submit"
                    className="btn-solid"
                >
                    <i className="fa-solid fa-floppy-disk"></i>
                    &nbsp; Enregistrer
                </button>

            </div>

        </form>
    </div>
)}

  <style>
        {
          `
         .modal-backdrop{
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.55);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:99999;
}

.modal-card{
    background:#fff;
    width:95%;
    max-width:650px;
    border-radius:18px;
    padding:30px;
    box-shadow:0 15px 45px rgba(0,0,0,.25);
    animation:popup .25s;
}

@keyframes popup{
    from{
        opacity:0;
        transform:scale(.9);
    }
    to{
        opacity:1;
        transform:scale(1);
    }
}

.modal-card h2{
    text-align:center;
    margin-bottom:10px;
    color:#0f172a;
}

.modal-description{
    text-align:center;
    color:#64748b;
    margin-bottom:25px;
}

.modal-form{
    display:flex;
    flex-direction:column;
    gap:18px;
}

.form-group{
    display:flex;
    flex-direction:column;
}

.form-group label{
    margin-bottom:8px;
    font-weight:600;
    color:#334155;
}

.form-group input,
.form-group textarea{
    width:100%;
    padding:14px;
    border:1px solid #d1d5db;
    border-radius:12px;
    font-size:15px;
    box-sizing:border-box;
}

.form-group textarea{
    min-height:120px;
}

.result-checkbox{
    display:flex;
    align-items:center;
    gap:10px;
    background:#f8fafc;
    padding:15px;
    border-radius:12px;
}

.modal-actions{
    display:flex;
    justify-content:flex-end;
    gap:15px;
    margin-top:25px;
}

.btn-outline{
    background:#f1f5f9;
    border:none;
    border-radius:10px;
    padding:12px 20px;
    cursor:pointer;
}

.btn-solid{
    background:#0ea5e9;
    color:#fff;
    border:none;
    border-radius:10px;
    padding:12px 20px;
    cursor:pointer;
}
    /* Chrome, Edge, Opera */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{
    -webkit-appearance:none;
    margin:0;
}

/* Firefox */
input[type=number]{
    appearance:textfield;
    -moz-appearance:textfield;
}


.form-group input[type=file]{
    border:2px dashed #0ea5e9;
    border-radius:12px;
    padding:18px;
    cursor:pointer;
    background:#f8fbff;
    transition:.25s;
}

.form-group input[type=file]:hover{
    background:#eef8ff;
}
          `

        }
      </style>
  
    </main>
  );
};

export default DemandeExamLabo;
