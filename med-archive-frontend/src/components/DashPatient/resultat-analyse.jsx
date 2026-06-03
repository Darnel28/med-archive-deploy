import React, { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';

const ResultatsAnalyses = () => {
  const analyses = useMemo(() => ([
    {
      id: 1,
      analyse: 'Bilan sanguin',
      date: '12 Jan 2026',
      resultats: 'Hémoglobine 11.2 g/dL, leucocytes 6.1 G/L, plaquettes 245 G/L',
      interpretation: 'Anémie légère à surveiller',
      statut: 'À suivre',
      statutClass: 'pending',
      laboratoire: 'Laboratoire Med-Archive Centre',
      medecin: 'Dr. Martin',
      reference: 'MA-LAB-2026-014',
      conclusion: 'Le bilan montre une discrète diminution de l’hémoglobine, compatible avec une anémie légère sans signe d’urgence.',
      recommandations: 'Contrôle biologique dans 30 jours, hydratation régulière et suivi clinique si fatigue persistante.',
      details: [
        { label: 'Hémoglobine', value: '11.2 g/dL' },
        { label: 'Leucocytes', value: '6.1 G/L' },
        { label: 'Plaquettes', value: '245 G/L' },
      ],
    },
    {
      id: 2,
      analyse: 'CRP',
      date: '03 Fév 2026',
      resultats: '4.8 mg/L',
      interpretation: 'Aucun signe inflammatoire majeur',
      statut: 'Normal',
      statutClass: 'done',
      laboratoire: 'Laboratoire Med-Archive Centre',
      medecin: 'Dr. Alice',
      reference: 'MA-LAB-2026-021',
      conclusion: 'Le dosage de la CRP est dans les valeurs basses attendues, sans argument pour un syndrome inflammatoire actif.',
      recommandations: 'Aucune mesure spécifique, surveillance clinique selon l’évolution des symptômes.',
      details: [
        { label: 'CRP', value: '4.8 mg/L' },
        { label: 'Seuil de référence', value: '< 5 mg/L' },
      ],
    },
    {
      id: 3,
      analyse: 'Glycémie à jeun',
      date: '10 Fév 2026',
      resultats: '0.96 g/L',
      interpretation: 'Valeur dans l’intervalle attendu',
      statut: 'Normal',
      statutClass: 'done',
      laboratoire: 'Laboratoire Med-Archive Centre',
      medecin: 'Dr. Samba',
      reference: 'MA-LAB-2026-033',
      conclusion: 'Glycémie à jeun strictement dans la norme, sans argument biologique en faveur d’un déséquilibre glycémique.',
      recommandations: 'Poursuivre l’hygiène de vie habituelle et refaire un contrôle si besoin clinique.',
      details: [
        { label: 'Glycémie', value: '0.96 g/L' },
        { label: 'Valeur cible', value: '0.70 à 1.10 g/L' },
      ],
    },
  ]), []);

  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const openAnalysisModal = (analysis) => setSelectedAnalysis(analysis);
  const closeAnalysisModal = () => setSelectedAnalysis(null);

  const downloadAnalysisPdf = (analysis) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const accent = [23, 184, 176];
    const accentDark = [15, 127, 134];
    const navy = [22, 50, 79];
    const muted = [96, 114, 137];

    const addSectionTitle = (title, y) => {
      doc.setFillColor(...accent);
      doc.roundedRect(margin, y, 3.2, 3.2, 1.2, 1.2, 'F');
      doc.setTextColor(...navy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      doc.text(title, margin + 5, y + 3);
      return y + 10;
    };

    const addKeyValue = (label, value, x, y, width) => {
      doc.setTextColor(...muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.text(label, x, y);
      doc.setTextColor(...navy);
      doc.setFont('helvetica', 'normal');
      const wrapped = doc.splitTextToSize(value, width);
      doc.text(wrapped, x, y + 4.6);
      return y + 4.6 + wrapped.length * 4.2;
    };

    const ensureSpace = (neededHeight, currentY) => {
      if (currentY + neededHeight > pageHeight - margin) {
        doc.addPage();
        return 18;
      }
      return currentY;
    };

    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Med-Archive', margin, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Laboratoire d\'analyses médicales', margin, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Compte rendu d\'analyse', pageWidth - margin, 14, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Émis le ${analysis.date}`, pageWidth - margin, 20, { align: 'right' });

    let y = 44;
    y = addSectionTitle('Informations générales', y);
    y = ensureSpace(34, y);
    doc.setDrawColor(227, 234, 243);
    doc.setFillColor(249, 251, 254);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, 'FD');
    y = addKeyValue('Analyse', analysis.analyse, margin + 5, y + 7, 65);
    y = addKeyValue('Référence', analysis.reference, margin + 72, y - 15, 65);
    y = addKeyValue('Laboratoire', analysis.laboratoire, margin + 139, y - 15, 70);
    y = addKeyValue('Médecin prescripteur', analysis.medecin, margin + 213, y - 15, 68);

    y += 10;
    y = addSectionTitle('Résultats', y);
    y = ensureSpace(38, y);
    doc.setFillColor(245, 248, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 3, 3, 'F');
    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const resultsLines = doc.splitTextToSize(analysis.resultats, pageWidth - margin * 2 - 10);
    doc.text(resultsLines, margin + 5, y + 9);

    y += 42;
    y = addSectionTitle('Interprétation clinique', y);
    y = ensureSpace(35, y);
    doc.setFillColor(239, 245, 250);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, 'F');
    doc.setTextColor(...accentDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.2);
    doc.text(analysis.interpretation, margin + 5, y + 12);

    y += 28;
    y = addSectionTitle('Détails biologiques', y);
    const detailBoxTop = y;
    const detailCols = 2;
    const detailGap = 6;
    const detailWidth = (pageWidth - margin * 2 - detailGap) / detailCols;
    analysis.details.forEach((detail, index) => {
      const col = index % detailCols;
      const row = Math.floor(index / detailCols);
      const boxX = margin + col * (detailWidth + detailGap);
      const boxY = detailBoxTop + row * 20;
      doc.setDrawColor(227, 234, 243);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(boxX, boxY, detailWidth, 16, 3, 3, 'FD');
      doc.setTextColor(...muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.text(detail.label, boxX + 4, boxY + 6);
      doc.setTextColor(...navy);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.text(detail.value, boxX + 4, boxY + 11.5);
    });

    y = detailBoxTop + Math.ceil(analysis.details.length / detailCols) * 20 + 8;
    y = addSectionTitle('Conclusion médicale', y);
    y = ensureSpace(28, y);
    const conclusionLines = doc.splitTextToSize(analysis.conclusion, pageWidth - margin * 2 - 10);
    doc.setDrawColor(227, 234, 243);
    doc.setFillColor(250, 252, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18 + conclusionLines.length * 4.5, 3, 3, 'FD');
    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(conclusionLines, margin + 5, y + 8);

    y += 18 + conclusionLines.length * 4.5 + 8;
    y = addSectionTitle('Recommandations', y);
    y = ensureSpace(28, y);
    const recommendationLines = doc.splitTextToSize(analysis.recommandations, pageWidth - margin * 2 - 10);
    doc.setDrawColor(227, 234, 243);
    doc.setFillColor(240, 250, 248);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18 + recommendationLines.length * 4.5, 3, 3, 'FD');
    doc.setTextColor(...accentDark);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(recommendationLines, margin + 5, y + 8);

    doc.setDrawColor(227, 234, 243);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    doc.setTextColor(...muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Med-Archive - Document généré automatiquement pour le suivi médical', margin, pageHeight - 13);
    doc.text('Confidentiel - Usage médical uniquement', pageWidth - margin, pageHeight - 13, { align: 'right' });

    doc.save(`${analysis.analyse.replace(/\s+/g, '_')}_${analysis.date.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Résultats d'analyses</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche analyses">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une analyse..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-solid fa-vial"></i> Ajouter un résultat
        </button> */}
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Analyse</th>
                  <th>Date</th>
                  <th>Résultats</th>
                  <th>Interprétation</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis) => (
                  <tr key={analysis.id}>
                    <td className="table-title-cell">{analysis.analyse}</td>
                    <td className="table-nowrap">{analysis.date}</td>
                    <td>{analysis.resultats}</td>
                    <td>{analysis.interpretation}</td>
                    <td><span className={`rdv-status ${analysis.statutClass}`}>{analysis.statut}</span></td>
                    <td className="rdv-actions table-actions-compact">
                      <button type="button" className="icon-action" title="Voir" onClick={() => openAnalysisModal(analysis)}>
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button type="button" className="icon-action" title="Télécharger" onClick={() => downloadAnalysisPdf(analysis)}>
                        <i className="fa-solid fa-download"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">3 analyses disponibles</span>
            <div className="table-pagination">
              <span className="table-page">Précédent</span>
              <span className="table-page active">1</span>
              <span className="table-page">Suivant</span>
            </div>
          </div>
        </article>
      </section>

      {selectedAnalysis && (
        <div
          className="app-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="analysis-modal-title"
          onClick={closeAnalysisModal}
        >
          <div className="app-modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="app-modal-header">
              <div>
                <p className="app-modal-kicker">Résultat d'analyse</p>
                <h2 id="analysis-modal-title">{selectedAnalysis.analyse}</h2>
              </div>
              <button type="button" className="app-modal-close" onClick={closeAnalysisModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="app-modal-body">
              <div className="app-modal-summary">
                <div>
                  <span>Date</span>
                  <strong>{selectedAnalysis.date}</strong>
                </div>
                <div>
                  <span>Statut</span>
                  <strong>{selectedAnalysis.statut}</strong>
                </div>
                <div>
                  <span>Laboratoire</span>
                  <strong>{selectedAnalysis.laboratoire}</strong>
                </div>
                <div>
                  <span>Prescripteur</span>
                  <strong>{selectedAnalysis.medecin}</strong>
                </div>
              </div>

              <div className="app-modal-card">
                <h3>Résultats détaillés</h3>
                <p>{selectedAnalysis.resultats}</p>
              </div>

              <div className="app-modal-card">
                <h3>Interprétation</h3>
                <p>{selectedAnalysis.conclusion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ResultatsAnalyses;