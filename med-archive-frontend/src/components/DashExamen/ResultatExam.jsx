import React, { useEffect, useMemo, useState } from 'react';
import { getAnalyseResultatFichier, getAnalyses } from '../../api/analyseApi';

const unwrapRows = (payload) => {
    if (Array.isArray(payload?.data?.data)) return payload.data.data;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const formatDate = (value) => value ? new Date(value).toLocaleString('fr-FR') : '-';

const ResultatExamLabo = () => {
    const [analyses, setAnalyses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    const loadAnalyses = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await getAnalyses({ per_page: 100 });
            setAnalyses(unwrapRows(response));
        } catch (error) {
            setAnalyses([]);
            setMessage(error?.response?.data?.message || 'Impossible de charger les resultats.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalyses();
    }, []);

    const filteredAnalyses = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const completed = analyses.filter((analysis) => analysis.statut === 'termine');

        if (!query) return completed;

        return completed.filter((analysis) => [
            analysis.consultation?.dossier?.patient?.user?.name,
            analysis.prescripteur?.user?.name,
            analysis.type_analyse,
            analysis.resultats?.commentaire,
            analysis.commentaires,
        ].join(' ').toLowerCase().includes(query));
    }, [analyses, searchTerm]);

    const openResult = async (analysis) => {
        setMessage('');

        if (!analysis.fichier_resultat) {
            setSelectedAnalysis(analysis);
            return;
        }

        try {
            const response = await getAnalyseResultatFichier(analysis.id);
            const url = URL.createObjectURL(response.data);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (error) {
            setMessage(error?.response?.data?.message || 'Impossible d ouvrir le fichier de resultat.');
        }
    };

    return (
        <main className="content page-tight">
            <section className="page-title-card">
                <h1>Resultats d'examens de laboratoire</h1>
            </section>

            <section className="table-toolbar">
                <label className="table-search" aria-label="Recherche resultat d'examen">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Chercher un resultat d'examen..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </label>
                <button className="btn transfer-add-btn" type="button" onClick={loadAnalyses} disabled={loading}>
                    <i className="fa-solid fa-rotate"></i> Actualiser
                </button>
            </section>

            {message && <p className="form-message">{message}</p>}

            <section className="rdv-section">
                <article className="rdv-card">
                    <div className="rdv-table-wrap">
                        <table className="rdv-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Medecin</th>
                                    <th>Examen</th>
                                    <th>Date resultat</th>
                                    <th>Resultat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                                {!loading && filteredAnalyses.map((analysis) => (
                                    <tr key={analysis.id}>
                                        <td className="table-title-cell">
                                            {analysis.consultation?.dossier?.patient?.user?.name || '-'}
                                        </td>
                                        <td>{analysis.prescripteur?.user?.name || '-'}</td>
                                        <td>
                                            {analysis.type_analyse || 'Analyse'}
                                            <span className="table-subtext">
                                                {analysis.fichier_resultat ? 'Fichier joint' : 'Compte rendu saisi'}
                                            </span>
                                        </td>
                                        <td className="table-nowrap">{formatDate(analysis.date_resultat || analysis.updated_at)}</td>
                                        <td className="rdv-actions table-actions-compact">
                                            <button
                                                className="icon-action"
                                                title="Voir le resultat"
                                                aria-label="Voir le resultat"
                                                onClick={() => openResult(analysis)}
                                            >
                                                <i className="fa-regular fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredAnalyses.length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Aucun resultat disponible</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span className="table-meta">{filteredAnalyses.length} resultats repertories</span>
                    </div>
                </article>
            </section>

            {selectedAnalysis && (
                <div className="modal-backdrop">
                    <div className="modal-card">
                        <h2>{selectedAnalysis.type_analyse}</h2>
                        <p><strong>Patient:</strong> {selectedAnalysis.consultation?.dossier?.patient?.user?.name || '-'}</p>
                        <p><strong>Conclusion:</strong> {selectedAnalysis.resultats?.commentaire || selectedAnalysis.commentaires || 'Resultat disponible.'}</p>
                        <div className="modal-actions">
                            <button className="btn btn-solid" type="button" onClick={() => setSelectedAnalysis(null)}>Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: rgba(15, 23, 42, 0.55);
                    backdrop-filter: blur(3px);
                }

                .modal-card {
                    width: min(460px, 100%);
                    padding: 28px;
                    border-radius: 16px;
                    background: #fff;
                    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
                }

                .modal-card h2 {
                    margin: 0 0 16px;
                    color: #14324a;
                    font-size: 22px;
                    font-weight: 700;
                    text-align: center;
                }

                .modal-card p {
                    margin: 10px 0;
                    color: #475569;
                    line-height: 1.6;
                    text-align: center;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .modal-actions .btn {
                    flex: 1;
                }
            `}</style>
        </main>
    );
};

export default ResultatExamLabo;
