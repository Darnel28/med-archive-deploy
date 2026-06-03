import React from 'react';
import { jsPDF } from 'jspdf';

const prescriptions = [
  {
    reference: 'ORD-2026-014',
    patient: 'Patient Med-Archive',
    date: '15 Fév 2026',
    prescripteur: 'Dr. Martin',
    specialite: 'Médecine générale',
    statut: 'Clôturée',
    statutClass: 'done',
    medicaments: [
      { nom: 'Paracétamol 1 g', posologie: '1 comprimé matin et soir', duree: '5 jours' },
    ],
    diagnostic: 'Douleurs et fièvre modérée',
    conseils: 'Boire suffisamment d’eau, respecter la posologie et éviter l’automédication.',
  },
  {
    reference: 'ORD-2026-009',
    patient: 'Patient Med-Archive',
    date: '03 Mar 2026',
    prescripteur: 'Dr. Alice',
    specialite: 'Hématologie',
    statut: 'Active',
    statutClass: 'upcoming',
    medicaments: [
      { nom: 'Fer 80 mg', posologie: '1 gélule par jour', duree: '3 mois' },
    ],
    diagnostic: 'Carence martiale',
    conseils: 'Prendre le traitement à distance des repas si possible et poursuivre le suivi biologique.',
  },
  {
    reference: 'ORD-2025-118',
    patient: 'Patient Med-Archive',
    date: '10 Nov 2025',
    prescripteur: 'Dr. Samba',
    specialite: 'Médecine générale',
    statut: 'Active',
    statutClass: 'upcoming',
    medicaments: [
      { nom: 'Vitamine D 1000 UI', posologie: '1 capsule par semaine', duree: '8 semaines' },
    ],
    diagnostic: 'Carence en vitamine D',
    conseils: 'Respecter la prise hebdomadaire et refaire le point lors du prochain contrôle.',
  },
];

const buildPrescriptionPdf = (prescription) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;

  const dark = [18, 39, 73];
  const teal = [23, 184, 176];
  const muted = [94, 110, 132];

  const addLabelValue = (label, value, x, y, width) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...muted);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(String(value), width);
    doc.text(lines, x, y + 4.5);
    return y + 4.5 + lines.length * 4.4;
  };

  doc.setFillColor(...dark);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Med-Archive', margin, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Centre hospitalier numérique - Ordonnance médicale', margin, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ORDONNANCE MÉDICALE', pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Référence : ${prescription.reference}`, pageWidth - margin, 20, { align: 'right' });

  doc.setDrawColor(220, 228, 238);
  doc.line(margin, 40, pageWidth - margin, 40);

  let y = 48;
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(224, 232, 241);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 3, 3, 'FD');
  y = addLabelValue('Patient', prescription.patient, margin + 5, y + 7, 75);
  y = addLabelValue('Date', prescription.date, margin + 95, y - 13, 55);
  y = addLabelValue('Prescripteur', prescription.prescripteur, margin + 145, y - 13, 55);
  y = addLabelValue('Spécialité', prescription.specialite, margin + 5, y + 4, 75);
  y = addLabelValue('Diagnostic', prescription.diagnostic, margin + 95, y - 13, 110);

  y += 10;
  doc.setFillColor(242, 248, 247);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 127, 134);
  doc.text('Traitement prescrit', margin + 4, y + 8);

  y += 18;
  prescription.medicaments.forEach((medicament, index) => {
    doc.setDrawColor(220, 228, 238);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, 'FD');
    doc.setFillColor(...teal);
    doc.roundedRect(margin + 4, y + 5, 3.5, 3.5, 1.2, 1.2, 'F');

    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(medicament.nom, margin + 12, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.setTextColor(...muted);
    doc.text(`Posologie : ${medicament.posologie}`, margin + 12, y + 16);
    doc.text(`Durée : ${medicament.duree}`, margin + 12, y + 22);

    y += 34;
    if (index < prescription.medicaments.length - 1) {
      y += 2;
    }
  });

  y += 4;
  doc.setFillColor(248, 250, 253);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text('Conseils au patient', margin + 4, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(52, 70, 91);
  const conseilLines = doc.splitTextToSize(prescription.conseils, pageWidth - margin * 2 - 10);
  doc.text(conseilLines, margin + 4, y + 15);

  doc.setDrawColor(220, 228, 238);
  doc.line(margin, pageHeight - 22, pageWidth - margin, pageHeight - 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.7);
  doc.setTextColor(...muted);
  doc.text('Document généré automatiquement par Med-Archive. À présenter à la pharmacie ou lors du suivi médical.', margin, pageHeight - 14);
  doc.text('Confidentiel - Usage médical uniquement', pageWidth - margin, pageHeight - 14, { align: 'right' });

  const fileName = `${prescription.reference}_${prescription.date.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

const Ordonnances = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Ordonnances</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche ordonnances">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une ordonnance..." />
        </label>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-solid fa-file-prescription"></i> Ajouter une ordonnance
        </button> */}
      </section>

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Médicaments</th>
                  <th>Durée</th>
                  <th>Prescripteur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.reference}>
                    <td className="table-title-cell">{prescription.reference}</td>
                    <td>
                      {prescription.medicaments.map((medicament, index) => (
                        <span key={medicament.nom} style={{ display: 'block' }}>
                          {index === 0 ? medicament.nom : `- ${medicament.nom}`}
                          <span className="table-subtext">{medicament.posologie}</span>
                        </span>
                      ))}
                    </td>
                    <td className="table-nowrap">{prescription.medicaments[0].duree}</td>
                    <td>{prescription.prescripteur}</td>
                    <td><span className={`rdv-status ${prescription.statutClass}`}>{prescription.statut}</span></td>
                    <td className="rdv-actions table-actions-compact">
                      <button
                        type="button"
                        className="icon-action"
                        title="Télécharger"
                        onClick={() => buildPrescriptionPdf(prescription)}
                      >
                        <i className="fa-solid fa-download"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">3 ordonnances répertoriées</span>
            <div className="table-pagination">
              <span className="table-page">Précédent</span>
              <span className="table-page active">1</span>
              <span className="table-page">Suivant</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Ordonnances;