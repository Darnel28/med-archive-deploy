import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { apiClient, getAuthUser } from '../../api/client';
import { formatDate, unwrapRows } from './patientDashboardData';

const normalizeMedicaments = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

const normalizeOrdonnanceRows = (ordonnance) => {
  if (Array.isArray(ordonnance)) return ordonnance;
  if (ordonnance && typeof ordonnance === 'object') return [ordonnance];
  return [];
};

const formatOrdonnanceField = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-';
  return value || '-';
};

const getConnectedPatientName = () => {
  const auth = getAuthUser() || {};
  return auth?.name || auth?.user?.name || auth?.patient?.user?.name || auth?.patient?.name || '';
};

const buildPrescriptionPdf = (prescription) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  // Couleurs
  const primaryColor = [0, 102, 204];      // bleu professionnel
  const redColor = [204, 0, 0];            // rouge (pour la mention "Ordonnance")
  const lightGray = [240, 242, 245];
  const darkGray = [50, 50, 50];
  const borderColor = [210, 218, 230];

  // Fonction pour les rectangles arrondis
  const roundedRect = (x, y, w, h, r) => {
    doc.setDrawColor(...borderColor);
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y, w, h, r, r, 'FD');
  };

  // Récupération des données
  const medicaments = normalizeMedicaments(prescription.medicaments);
  const medecin = prescription.consultation?.medecin?.user?.name || 'Médecin';
  const etablissement = prescription.consultation?.service?.etablissement?.name
    || prescription.consultation?.medecin?.etablissement?.name
    || prescription.consultation?.medecin?.user?.etablissement?.name
    || 'Etablissement de sante';
  const patient = getConnectedPatientName() || prescription.consultation?.dossier?.patient?.user?.name || 'Patient';
  const date = formatDate(prescription.created_at);
  const dateValidite = Array.isArray(prescription.date_validite)
    ? formatOrdonnanceField(prescription.date_validite)
    : formatDate(prescription.date_validite || prescription.duree);
  const posologie = formatOrdonnanceField(prescription.posologie || prescription.dosage);
  const instructions = formatOrdonnanceField(prescription.instructions || prescription.frequence);
  const ref = `ORD-${prescription.id}`;

  // --- En-tête ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text(etablissement, margin, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...redColor);
  doc.text('ORDONNANCE MÉDICALE', pageWidth - margin, 22, { align: 'right' });

  // Séparateur
  doc.setDrawColor(...borderColor);
  doc.line(margin, 30, pageWidth - margin, 30);

  // Numéro et date sur la même ligne (à droite)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text(`N° ${ref}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Émise le : ${date}`, pageWidth - margin, 44, { align: 'right' });
  doc.text(`Valable jusqu'au : ${dateValidite}`, pageWidth - margin, 50, { align: 'right' });

  // --- Informations patient et médecin (encadré gris) ---
  let y = 62;
  const rectHeight = 38;
  roundedRect(margin, y, maxWidth, rectHeight, 4);
  doc.setTextColor(...darkGray);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Patient :', margin + 8, y + 8);
  doc.text('Prescripteur :', margin + 8, y + 18);
  doc.text('Spécialité / Service :', margin + 8, y + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(patient, margin + 50, y + 8);
  doc.text(medecin, margin + 50, y + 18);
  doc.text(
    prescription.consultation?.medecin?.specialite?.nom || '-',
    margin + 50,
    y + 28
  );

  y += rectHeight + 12;

  // --- Liste des médicaments (titre) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Traitement prescrit', margin, y);
  y += 8;

  // Ligne séparatrice
  doc.setDrawColor(...borderColor);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // --- Affichage des médicaments (listés avec numéros) ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);

  if (medicaments.length) {
    medicaments.forEach((medicament, index) => {
      let text = '';
      if (typeof medicament === 'string') {
        text = medicament;
      } else {
        text = `${medicament.nom || ''} ${medicament.posologie || ''} ${medicament.duree || ''}`.trim();
      }
      // Formatage de la ligne
      doc.text(`${index + 1}. ${text}`, margin, y);
      y += 7;
    });
  } else {
    doc.text('Aucun médicament spécifié.', margin, y);
    y += 7;
  }

  // --- Posologie et instructions ---
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Posologie', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text(posologie, margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Instructions particulières', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  // Gestion du texte long (wrap)
  const instrLines = doc.splitTextToSize(instructions, maxWidth);
  doc.text(instrLines, margin, y);
  y += instrLines.length * 5 + 6;

  // --- Signature électronique ---
  y += 6;
  const sigX = margin + 20;
  const sigW = maxWidth - 40;
  doc.setDrawColor(...borderColor);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(sigX, y, sigW, 30, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Signature électronique du médecin', pageWidth / 2, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text(medecin, pageWidth / 2, y + 18, { align: 'center' });
  doc.text('------------------------------------------------------------', pageWidth / 2, y + 24, { align: 'center' });

  // --- Pied de page ---
  doc.setFontSize(8.5);
  doc.setTextColor(...borderColor);
  doc.text('Document généré automatiquement par Med-Archive.', margin, pageHeight - 14);
  doc.text(`Réf. ${ref}`, pageWidth - margin, pageHeight - 14, { align: 'right' });

  // Génération du fichier
  doc.save(`${ref}.pdf`);
};

const Ordonnances = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient.get('/patients/me/ordonnances', { params: { per_page: 100 } })
      .then((response) => setPrescriptions(unwrapRows(response.data)))
      .catch((error) => setMessage(error?.response?.data?.message || 'Impossible de charger les ordonnances.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return prescriptions;
    return prescriptions.filter((prescription) => [
      prescription.id,
      JSON.stringify(prescription.medicaments),
      prescription.posologie,
      prescription.instructions,
      prescription.date_validite,
      prescription.consultation?.medecin?.user?.name,
      prescription.medicaments,
    ].join(' ').toLowerCase().includes(query));
  }, [prescriptions, searchTerm]);

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Ordonnances</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche ordonnances">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher une ordonnance..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Medicaments</th>
                  <th>Validite</th>
                  <th>Prescripteur</th>
                  <th>Instructions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && filteredPrescriptions.map((prescription) => {
                  const medicaments = normalizeMedicaments(prescription.medicaments);
                  const affichageMedicaments = medicaments.length ? medicaments : normalizeOrdonnanceRows(prescription).map((item) => item.medicaments || item.medicament || item.nom || '-');
                  return (
                    <tr key={prescription.id}>
                      <td className="table-title-cell">ORD-{prescription.id}</td>
                      <td>
                        {affichageMedicaments.length ? affichageMedicaments.map((medicament, index) => (
                          <span key={`${prescription.id}-${index}`} style={{ display: 'block' }}>
                            {typeof medicament === 'string' ? medicament : medicament.nom || medicament.medicaments || JSON.stringify(medicament)}
                          </span>
                        )) : '-'}
                        <span className="table-subtext">{formatOrdonnanceField(prescription.posologie || prescription.dosage)}</span>
                      </td>
                      <td className="table-nowrap">{Array.isArray(prescription.date_validite) ? formatOrdonnanceField(prescription.date_validite) : formatDate(prescription.date_validite || prescription.duree)}</td>
                      <td>{prescription.consultation?.medecin?.user?.name || '-'}</td>
                      <td>{formatOrdonnanceField(prescription.instructions || prescription.frequence)}</td>
                      <td className="rdv-actions table-actions-compact">
                        <button type="button" className="icon-action" title="Telecharger" onClick={() => buildPrescriptionPdf(prescription)}>
                          <i className="fa-solid fa-download"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filteredPrescriptions.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>Aucune ordonnance trouvee</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredPrescriptions.length} ordonnances repertoriees</span>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Ordonnances;
