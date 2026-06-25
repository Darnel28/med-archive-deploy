import React, { useEffect, useMemo, useState } from 'react';
import { getMesAnalyses } from '../../api/patientApi';
import { payerFacture } from '../../api/factureApi';

const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR') : '-';
const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

const ResultatsAnalyses = () => {
  const [analyses, setAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [paymentAnalysis, setPaymentAnalysis] = useState(null);
  const [paying, setPaying] = useState(false);

  const loadAnalyses = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await getMesAnalyses({ per_page: 50 });
      setAnalyses(unwrapRows(response));
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible de charger vos analyses.');
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
    const rows = query ? analyses.filter((analysis) => [
      analysis.type_analyse,
      analysis.laboratoire?.nom_laboratoire,
      analysis.prescripteur?.user?.name,
      analysis.statut,
      analysis.statut_paiement,
    ].join(' ').toLowerCase().includes(query)) : analyses;

    return [...rows].sort((a, b) => {
      const aUnpaid = a.statut_paiement !== 'payee' ? 0 : 1;
      const bUnpaid = b.statut_paiement !== 'payee' ? 0 : 1;
      return aUnpaid - bUnpaid;
    });
  }, [analyses, searchTerm]);

  const openTestPayment = (analysis) => {
    const facture = analysis.facture;

    if (!facture || facture.statut === 'payee') {
      setMessage('Cette analyse est deja payee ou aucune facture n est disponible.');
      return;
    }

    setPaymentAnalysis(analysis);
  };

  const confirmTestPayment = async () => {
    const facture = paymentAnalysis?.facture;
    if (!facture) return;

    setPaying(true);
    setMessage('');
    try {
      /*
      Paiement reel desactive pour l'environnement de test.
      await creerPaiementStripe(facture.id);
      */

      await payerFacture(facture.id, {
        montant: facture.montant_restant,
        methode: 'mobile_money',
        reference: `TEST-ANALYSE-${Date.now()}`,
      });
      setMessage('Frais d analyse payes avec succes.');
      setPaymentAnalysis(null);
      await loadAnalyses();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Paiement impossible pour cette analyse.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Resultats d'analyse</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche analyses">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une analyse..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Analyse</th>
                  <th>Laboratoire</th>
                  <th>Medecin</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && filteredAnalyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td className="table-title-cell">{analysis.type_analyse}</td>
                    <td>{analysis.laboratoire?.nom_laboratoire || analysis.laboratoire?.user?.name || '-'}</td>
                    <td>{analysis.prescripteur?.user?.name || '-'}</td>
                    <td>{formatDate(analysis.date_prelevement)}</td>
                    <td>{formatMoney(analysis.facture?.montant_restant ?? analysis.montant_analyse)}</td>
                    <td>
                      <span className={`rdv-status ${analysis.statut_paiement === 'payee' ? 'done' : 'pending'}`}>
                        {analysis.statut_paiement === 'payee' ? 'Paye' : 'A payer'}
                      </span>
                    </td>
                    <td><span className="rdv-status upcoming">{analysis.statut}</span></td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action" title="Payer" onClick={() => openTestPayment(analysis)} disabled={analysis.statut_paiement === 'payee'}>
                        <i className="fa-solid fa-credit-card"></i>
                      </button>
                      <button className="icon-action" title="Voir resultat" onClick={() => setSelectedAnalysis(analysis)} disabled={analysis.statut !== 'termine'}>
                        <i className="fa-regular fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredAnalyses.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center' }}>Aucune analyse trouvee</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredAnalyses.length} analyses repertoriees</span>
          </div>
        </article>
      </section>

      {selectedAnalysis && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>{selectedAnalysis.type_analyse}</h2>
            <p><strong>Conclusion:</strong> {selectedAnalysis.resultats?.commentaire || selectedAnalysis.commentaires || 'Resultat disponible dans les documents medicaux si un fichier a ete joint.'}</p>
            {selectedAnalysis.fichier_resultat && (
              <p>Document medical: {selectedAnalysis.fichier_resultat}</p>
            )}
            <div className="modal-actions">
              <button className="btn btn-solid" onClick={() => setSelectedAnalysis(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {paymentAnalysis && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Paiement test</h2>
            <p>Valider le paiement de {formatMoney(paymentAnalysis.facture?.montant_restant ?? paymentAnalysis.montant_analyse)} pour {paymentAnalysis.type_analyse}.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setPaymentAnalysis(null)} disabled={paying}>Annuler</button>
              <button className="btn btn-solid" onClick={confirmTestPayment} disabled={paying}>{paying ? 'Validation...' : 'Valider'}</button>
            </div>
          </div>
        </div>
      )}
       <style>
        {
          `
          /* Fond sombre */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn .25s ease;
}

/* Boîte du modal */
.modal-card {
    width: 95%;
    max-width: 460px;
    background: #fff;
    border-radius: 18px;
    padding: 30px;
    box-shadow: 0 18px 45px rgba(0,0,0,.18);
    animation: zoomIn .25s ease;
}

/* Icône */
.modal-icon{
    width:70px;
    height:70px;
    margin:auto;
    border-radius:50%;
    background:#e8f7ff;
    color:#0099cc;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:30px;
    margin-bottom:18px;
}

/* Titre */
.modal-card h2{
    margin:0;
    text-align:center;
    font-size:24px;
    font-weight:700;
    color:#14324a;
}

/* Texte */
.modal-card p{
    margin:18px 0 25px;
    text-align:center;
    line-height:1.7;
    color:#666;
    font-size:15px;
}

/* Boutons */
.modal-actions{
    display:flex;
    gap:15px;
}

.modal-actions button{
    flex:1;
    border:none;
    border-radius:12px;
    padding:13px;
    font-size:15px;
    font-weight:600;
    cursor:pointer;
    transition:.25s;
}

.btn-outline{
    background:#f4f5f7;
    color:#555;
}

.btn-outline:hover{
    background:#e5e7eb;
}

.btn-solid{
    background:#0ea5e9;
    color:#fff;
}

.btn-solid:hover{
    background:#0284c7;
}

.btn-solid:disabled,
.btn-outline:disabled{
    opacity:.6;
    cursor:not-allowed;
}

@keyframes fadeIn{
    from{opacity:0;}
    to{opacity:1;}
}

@keyframes zoomIn{
    from{
        opacity:0;
        transform:scale(.8);
    }
    to{
        opacity:1;
        transform:scale(1);
    }
}
          `

        }
      </style>
    </main>
  );
};

export default ResultatsAnalyses;
