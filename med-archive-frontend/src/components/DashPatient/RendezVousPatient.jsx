import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { getMesFactures } from '../../api/patientApi';
import { payerFacture } from '../../api/factureApi';
import { updateConsultation } from '../../api/consultationApi';
import { apiClient, getAuthUser } from '../../api/client';

const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR') : '-';
const formatHour = (value) => value ? new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

const safeText = (value, fallback = '-') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const factureToRdv = (facture) => {
  const consultation = facture?.consultation || {};
  return {
    ...consultation,
    id: consultation.id || `facture-${facture.id}`,
    facture,
    date_consultation: consultation.date_consultation || facture.created_at,
    medecin: consultation.medecin,
    service: consultation.service,
    motif: consultation.motif || (facture.type === 'examen' ? 'Examen medical' : 'Consultation medicale'),
    statut: consultation.statut || facture.statut,
    statut_paiement: facture.statut === 'payee' ? 'payee' : facture.statut,
    montant_consultation: facture.montant_total,
    updated_at: facture.updated_at,
    created_at: facture.created_at,
  };
};

const getHospitalName = (rdv) => (
  rdv?.medecin?.user?.etablissement?.name
  || rdv?.medecin?.etablissement?.name
  || rdv?.etablissement?.name
  || rdv?.etablissement_nom
  || 'Centre Hospitalier Universitaire'
);

const getHospitalAddress = (rdv) => (
  rdv?.medecin?.user?.etablissement?.adresse
  || rdv?.medecin?.etablissement?.adresse
  || rdv?.etablissement?.adresse
  || 'Cotonou - Bénin'
);

const getConnectedPatientName = () => {
  const auth = getAuthUser() || {};
  return auth?.name || auth?.user?.name || auth?.patient?.user?.name || auth?.patient?.name || '';
};

const getPatientName = (rdv) => (
  getConnectedPatientName()
  || rdv?.dossier?.patient?.user?.name
  || rdv?.patient?.user?.name
  || rdv?.patient?.name
  || rdv?.patient_name
  || 'Patient'
);

const getPatientNumber = (rdv) => (
  rdv?.dossier?.patient?.numero_patient
  || rdv?.dossier?.patient?.code_patient
  || rdv?.patient?.numero_patient
  || rdv?.patient?.code_patient
  || `PAT-${String(rdv?.dossier?.patient_id || rdv?.patient_id || rdv?.id || '').padStart(6, '0')}`
);

const getReceiptNumber = (rdv) => (
  rdv?.facture?.numero_quittance
  || rdv?.facture?.reference
  || rdv?.facture?.numero_facture
  || `QT-${new Date(rdv?.updated_at || rdv?.created_at || rdv?.date_consultation || Date.now()).getFullYear()}-${String(rdv?.facture?.id || rdv?.id || Date.now()).padStart(6, '0')}`
);

const getPaymentDate = (rdv) => (
  rdv?.facture?.paid_at
  || rdv?.facture?.date_paiement
  || rdv?.facture?.updated_at
  || rdv?.updated_at
  || new Date().toISOString()
);

const getPaymentMethod = (rdv) => (
  rdv?.facture?.methode_paiement
  || rdv?.facture?.methode
  || rdv?.methode_paiement
  || rdv?.mode_paiement
  || 'Mobile Money'
);

const getPaymentReference = (rdv) => (
  rdv?.facture?.reference_paiement
  || rdv?.facture?.reference
  || rdv?.facture?.transaction_reference
  || '—'
);

const getPaidAmount = (rdv) => (
  rdv?.facture?.montant_paye
  || rdv?.facture?.montant_regle
  || rdv?.facture?.montant_total
  || rdv?.montant_consultation
  || rdv?.facture?.montant_restant
  || 0
);

const buildReceiptPdf = (rdv) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  // Couleurs
  const primaryColor = [0, 102, 204];
  const redColor = [204, 0, 0];
  const lightGray = [240, 242, 245];
  const darkGray = [50, 50, 50];
  const borderColor = [210, 218, 230];

  // Fonction pour un rectangle arrondi
  const roundedRect = (x, y, w, h, r) => {
    pdf.setDrawColor(...borderColor);
    pdf.setFillColor(...lightGray);
    pdf.roundedRect(x, y, w, h, r, r, 'FD');
  };

  // --- Données ---
  const hospitalName = getHospitalName(rdv);
  const hospitalAddress = getHospitalAddress(rdv);
  const receiptNumber = getReceiptNumber(rdv);
  const receiptDate = new Date(getPaymentDate(rdv)).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const patientName = getPatientName(rdv);
  const patientNumber = getPatientNumber(rdv);
  const doctorName = rdv?.medecin?.user?.name || 'Médecin';
  const serviceName = rdv?.service?.nom || rdv?.medecin?.specialite?.nom || '-';
  const consultationLabel = rdv?.motif || 'Consultation médicale';

  // Formatage des montants sans slash
  const formatMoneyNoSlash = (value) => {
    const num = Number(value || 0);
    const parts = num.toFixed(0).split(/(?=(?:\d{3})+(?!\d))/g);
    const formatted = parts.join('\u00A0'); // espace insécable
    return `${formatted} FCFA`;
  };

  const consultationAmount = formatMoneyNoSlash(rdv?.montant_consultation || rdv?.facture?.montant_total || 0);
  const paidAmount = formatMoneyNoSlash(getPaidAmount(rdv));
  const paymentMethod = getPaymentMethod(rdv);
  const paymentReference = getPaymentReference(rdv);

  // --- En-tête ---
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(...primaryColor);
  pdf.text(hospitalName, pageWidth / 2, 22, { align: 'center' });

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(11);
  pdf.setTextColor(...darkGray);
  pdf.text(hospitalAddress, pageWidth / 2, 30, { align: 'center' });

  pdf.setDrawColor(...borderColor);
  pdf.line(margin, 36, pageWidth - margin, 36);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...primaryColor);
  pdf.text('QUITTANCE DE PAIEMENT', pageWidth / 2, 48, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...darkGray);
  pdf.text(`N° Quittance : ${receiptNumber}`, pageWidth - margin, 48, { align: 'right' });
  pdf.text(`Date : ${receiptDate}`, pageWidth - margin, 54, { align: 'right' });

  // --- Informations patient (encadré gris) ---
  let y = 62;
  roundedRect(margin, y, maxWidth, 72, 4);
  pdf.setTextColor(...darkGray);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Informations du patient', margin + 6, y + 8);
  pdf.setDrawColor(...borderColor);
  pdf.line(margin + 6, y + 14, pageWidth - margin - 6, y + 14);

  const rowHeight = 9;
  let rowY = y + 20;
  const labelX = margin + 10;
  const valueX = margin + 100;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const pairs = [
    ['Nom du patient', patientName],
    ['Numéro patient', patientNumber],
    ['Médecin traitant', doctorName],
    ['Service / Spécialité', serviceName],
    ['Motif de la consultation', consultationLabel]
  ];

  pairs.forEach(([label, value]) => {
    pdf.text(label, labelX, rowY);
    pdf.text(value, valueX, rowY);
    rowY += rowHeight;
  });

  y = rowY + 16;  // PLUS D'ESPACE AVANT LE TRAIT

  // --- Détails du paiement (sans fond, sur page blanche) ---
  pdf.setDrawColor(...borderColor);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Titre centré en rouge
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...redColor);
  pdf.text('Détails du paiement', pageWidth / 2, y, { align: 'center' });
  y += 12;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...darkGray);

  // Lignes : libellés en noir, montants en rouge gras
  const details = [
    { label: 'Montant consultation :', value: consultationAmount, isAmount: true },
    { label: 'Montant payé :', value: paidAmount, isAmount: true },
    { label: 'Mode de paiement :', value: paymentMethod, isAmount: false },
    { label: 'Référence de paiement :', value: paymentReference, isAmount: false }
  ];

  details.forEach((item) => {
    // Libellé toujours en noir
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.label, margin, y);

    // Valeur : si c'est un montant => rouge gras, sinon noir normal
    if (item.isAmount) {
      pdf.setTextColor(...redColor);
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setTextColor(...darkGray);
      pdf.setFont('helvetica', 'normal');
    }
    pdf.text(item.value, pageWidth - margin, y, { align: 'right' });
    y += 10;
  });

  // Remise à zéro de la police
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...darkGray);

  y += 6;
  pdf.setDrawColor(...borderColor);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- Mention légale ---
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(...darkGray);
  pdf.text('Cette quittance atteste que le paiement a bien été reçu.', pageWidth / 2, y, { align: 'center' });
  y += 5;
  pdf.text('Merci pour votre confiance.', pageWidth / 2, y, { align: 'center' });

  // --- Signature électronique ---
  y += 12;
  const sigX = margin + 20;
  const sigW = maxWidth - 40;
  pdf.setDrawColor(...borderColor);
  pdf.setFillColor(250, 250, 252);
  pdf.roundedRect(sigX, y, sigW, 30, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...primaryColor);
  pdf.text('Signature électronique', pageWidth / 2, y + 10, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...darkGray);
  pdf.text('Centre Hospitalier', pageWidth / 2, y + 18, { align: 'center' });
  pdf.text('------------------------------------------------------------', pageWidth / 2, y + 24, { align: 'center' });

  pdf.save(`quittance-${String(receiptNumber).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
};

const RendezVousPatient = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [freeSlots, setFreeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentRdv, setPaymentRdv] = useState(null);
  const [paying, setPaying] = useState(false);
  const itemsPerPage = 5;

  const loadAppointments = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await getMesFactures({ per_page: 100 });
      setAppointments(unwrapRows(response).map(factureToRdv));
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible de charger vos paiements.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredRdv = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return appointments;
    return appointments.filter((rdv) => {
      const text = [
        rdv?.motif,
        rdv?.medecin?.user?.name,
        rdv?.medecin?.specialite?.nom,
        rdv?.service?.nom,
        rdv?.facture?.numero,
        rdv?.facture?.type,
        rdv?.statut,
        rdv?.statut_paiement,
      ].join(' ').toLowerCase();
      return text.includes(query);
    });
  }, [appointments, searchTerm]);

  const indexOfLast = currentPage * itemsPerPage;
  const currentRdv = filteredRdv.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredRdv.length / itemsPerPage);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePay = (rdv) => {
    const facture = rdv?.facture;

    if (!facture) {
      setMessage("Aucune facture associee a ce rendez-vous.");
      return;
    }

    setPaymentRdv(rdv);
  };

  const handleDownloadReceipt = (rdv) => {
    if (rdv?.statut_paiement !== 'payee') {
      setMessage('La quittance est disponible après paiement.');
      return;
    }

    buildReceiptPdf(rdv);
  };

  const confirmTestPayment = async () => {
    const facture = paymentRdv?.facture;
    if (!facture) return;

    setPaying(true);
    setMessage('');
    try {
      /*
      Paiement reel desactive pour l'environnement de test.
      const response = await creerPaiementFedapay(facture.id);
      if (response?.url) window.location.href = response.url;
      */
      await payerFacture(facture.id, {
        montant: facture.montant_restant,
        methode: 'mobile_money',
        reference: `TEST-RDV-${Date.now()}`,
      });
      setMessage('Paiement du rendez-vous valide avec succes.');
      setPaymentRdv(null);
      await loadAppointments();
    } catch (error) {
      console.error(error);
      setMessage("Impossible de valider le paiement test.");
    } finally {
      setPaying(false);
    }
  };

  const openReschedule = async (rdv) => {
    setEditing(rdv);
    setSelectedSlot('');
    setFreeSlots([]);
    setMessage('');
    try {
      const date = new Date(rdv.date_consultation).toISOString().slice(0, 10);
      const response = await apiClient.get(`/medecins/${rdv.medecin_id}/planning`, { params: { date } });
      setFreeSlots(response.data?.data?.creneaux_libres || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible de recuperer les heures libres du medecin.');
    }
  };

  const submitReschedule = async () => {
    if (!editing || !selectedSlot) return;
    setMessage('Modification du rendez-vous...');
    try {
      await updateConsultation(editing.id, { date_consultation: selectedSlot });
      setMessage('Rendez-vous modifie avec succes.');
      setEditing(null);
      await loadAppointments();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Modification impossible.');
    }
  };

  const getStatutClass = (rdv) => {
    if (rdv.statut === 'termine') return 'rdv-status done';
    if (rdv.statut_paiement !== 'payee') return 'rdv-status pending';
    return 'rdv-status upcoming';
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Rendez-Vous&Paiements</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche paiements">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un paiement..." value={searchTerm} onChange={handleSearch} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Medecin</th>
                  <th>Service</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && currentRdv.map((rdv) => (
                  <tr key={rdv.facture?.id || rdv.id}>
                    <td>{formatDate(rdv.date_consultation)}</td>
                    <td>{formatHour(rdv.date_consultation)}</td>
                    <td>{rdv.medecin?.user?.name || 'Medecin'}</td>
                    <td>{rdv.service?.nom || rdv.medecin?.specialite?.nom || 'Laboratoire'}</td>
                    <td>{formatMoney( rdv.montant_consultation)}</td>
                    <td>
                      <span className={getStatutClass(rdv)}>
                        {rdv.statut_paiement === 'payee' ? 'Paye' : 'A payer'}
                      </span>
                    </td>
                    <td className="rdv-actions">
                      <button className="icon-action" title="Payer" onClick={() => handlePay(rdv)} disabled={rdv.statut_paiement === 'payee'}>
                        <i className="fa-solid fa-credit-card"></i>
                      </button>
                      <button
                        className="icon-action download"
                        title="Télécharger la quittance"
                        onClick={() => handleDownloadReceipt(rdv)}
                        disabled={rdv.statut_paiement !== 'payee'}
                      >
                        <i className="fa-solid fa-download"></i>
                      </button>
                      {/* <button className="icon-action" title="Modifier" onClick={() => openReschedule(rdv)}>
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button> */}
                    </td>
                  </tr>
                ))}
                {!loading && currentRdv.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>Aucun paiement trouve</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredRdv.length} paiement(s)</span>
            <div className="table-pagination">
              <button className="table-page" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Precedent
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button key={index} className={`table-page ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              ))}
              <button className="table-page" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                Suivant
              </button>
            </div>
          </div>
        </article>
      </section>

      {editing && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Choisir une heure libre</h2>
            <select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}>
              <option value="">Selectionner un creneau</option>
              {freeSlots.map((slot) => (
                <option key={slot.date_consultation} value={slot.date_consultation}>{slot.heure}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-solid" onClick={submitReschedule} disabled={!selectedSlot}>Valider</button>
            </div>
          </div>
        </div>
      )}

      {paymentRdv && (
        <div className="modal-backdrop">
          <div className="modal-card">

            <div className="modal-icon">
              <i className="fa-solid fa-credit-card"></i>
            </div>

            <h2>Paiement du rendez-vous</h2>

            <p>
              Vous êtes sur le point de régler la somme de
              <br /><br />
              <strong style={{ fontSize: '22px', color: '#0ea5e9' }}>
                {formatMoney(paymentRdv.facture?.montant_restant ?? paymentRdv.montant_consultation)}
              </strong>
            </p>

            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setPaymentRdv(null)}
                disabled={paying}
              >
                Annuler
              </button>

              <button
                className="btn-solid"
                onClick={confirmTestPayment}
                disabled={paying}
              >
                {paying ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i>
                    &nbsp; Validation...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    &nbsp; Confirmer
                  </>
                )}
              </button>
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
        .icon-action.download{
    background:#e8f5ff;
    color:#0d6efd;
}

.icon-action.download:hover{
    background:#0d6efd;
    color:white;
}

.icon-action.download:disabled{
  background:#eef2f7;
  color:#94a3b8;
}

.rdv-actions .icon-action + .icon-action{
  margin-left:8px;
}
}
          `

        }
      </style>
    </main>
  );
};

export default RendezVousPatient;
