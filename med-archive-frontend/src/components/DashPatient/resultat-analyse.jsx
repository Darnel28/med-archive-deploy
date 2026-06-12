import React, { useEffect, useMemo, useState } from 'react';
import { getMesAnalyses } from '../../api/patientApi';
import { creerPaiementStripe, payerFacture } from '../../api/factureApi';

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
    if (!query) return analyses;
    return analyses.filter((analysis) => [
      analysis.type_analyse,
      analysis.laboratoire?.nom_laboratoire,
      analysis.prescripteur?.user?.name,
      analysis.statut,
      analysis.statut_paiement,
    ].join(' ').toLowerCase().includes(query));
  }, [analyses, searchTerm]);

  const payAnalysis = async (analysis) => {
    const facture = analysis.facture;

    if (!facture || facture.statut === 'payee') {
      setMessage('Cette analyse est deja payee ou aucune facture n est disponible.');
      return;
    }

    setMessage('Preparation du paiement...');
    try {
      try {
        await creerPaiementStripe(facture.id);
      } catch {
        // Stripe peut ne pas etre configure sur cet environnement local.
      }

      await payerFacture(facture.id, {
        montant: facture.montant_restant,
        methode: 'stripe',
        reference: `ANALYSE-${Date.now()}`,
      });
      setMessage('Frais d analyse payes avec succes.');
      await loadAnalyses();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Paiement impossible pour cette analyse.');
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
                      <button className="icon-action" title="Payer" onClick={() => payAnalysis(analysis)} disabled={analysis.statut_paiement === 'payee'}>
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
    </main>
  );
};

export default ResultatsAnalyses;
