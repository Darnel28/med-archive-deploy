import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { apiClient } from '../../api/client';
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

const buildPrescriptionPdf = (prescription) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const medicaments = normalizeMedicaments(prescription.medicaments);

  doc.setFillColor(18, 39, 73);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Med-Archive', margin, 13);
  doc.setFontSize(13);
  doc.text('ORDONNANCE MEDICALE', pageWidth - margin, 14, { align: 'right' });

  let y = 48;
  doc.setTextColor(18, 39, 73);
  doc.setFontSize(11);
  doc.text(`Reference : ORD-${prescription.id}`, margin, y);
  doc.text(`Date : ${formatDate(prescription.created_at)}`, margin, y + 7);
  doc.text(`Prescripteur : ${prescription.consultation?.medecin?.user?.name || '-'}`, margin, y + 14);
  doc.text(`Patient : ${prescription.consultation?.dossier?.patient?.user?.name || 'Patient'}`, margin, y + 21);

  y += 38;
  doc.setFont('helvetica', 'bold');
  doc.text('Traitement prescrit', margin, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  medicaments.forEach((medicament, index) => {
    const text = typeof medicament === 'string' ? medicament : [medicament.nom, medicament.posologie, medicament.duree].filter(Boolean).join(' - ');
    doc.text(`${index + 1}. ${text}`, margin, y);
    y += 7;
  });

  y += 8;
  doc.text(`Posologie : ${prescription.posologie || '-'}`, margin, y);
  y += 7;
  doc.text(`Instructions : ${prescription.instructions || '-'}`, margin, y);
  doc.setFontSize(8.7);
  doc.text('Document genere automatiquement par Med-Archive.', margin, pageHeight - 14);
  doc.save(`ORD-${prescription.id}.pdf`);
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
      prescription.posologie,
      prescription.instructions,
      prescription.consultation?.medecin?.user?.name,
      JSON.stringify(prescription.medicaments),
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
                  return (
                    <tr key={prescription.id}>
                      <td className="table-title-cell">ORD-{prescription.id}</td>
                      <td>
                        {medicaments.length ? medicaments.map((medicament, index) => (
                          <span key={`${prescription.id}-${index}`} style={{ display: 'block' }}>
                            {typeof medicament === 'string' ? medicament : medicament.nom || JSON.stringify(medicament)}
                          </span>
                        )) : '-'}
                        <span className="table-subtext">{prescription.posologie || ''}</span>
                      </td>
                      <td className="table-nowrap">{formatDate(prescription.date_validite)}</td>
                      <td>{prescription.consultation?.medecin?.user?.name || '-'}</td>
                      <td>{prescription.instructions || '-'}</td>
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
