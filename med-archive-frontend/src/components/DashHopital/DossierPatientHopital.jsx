import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { getAuthUser } from "../../api/client";
import { viewDocument } from "../../api/documentApi";
import { getAnalyseResultatFichier, getPatientDossierComplet } from "../../api/patientApi";
import { getMesPatientsService } from "../../api/serviceApi";
import AvatarInitials from "../AvatarInitials.jsx";

// ---------- Fonctions utilitaires ----------
function rowsFromPaginated(response) {
  const payload = response?.data ?? response;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
}

function patientName(patient) {
  return patient?.user?.name || patient?.name || "-";
}

function displayValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "-";
  return `${value}${suffix}`;
}

function normalizeMedicaments(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
}

function formatOrdonnanceField(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "-";
  return value || "-";
}

function blobFileName(baseName, fallback = "document-medical") {
  const name = String(baseName || fallback).trim() || fallback;
  return name.includes(".") ? name : `${name}.pdf`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openBlob(blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Construction du PDF d'ordonnance (adaptée pour utiliser le nom du patient depuis l'objet ordonnance)
function buildPrescriptionPdf(prescription) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  const primaryColor = [0, 102, 204];
  const redColor = [204, 0, 0];
  const lightGray = [240, 242, 245];
  const darkGray = [50, 50, 50];
  const borderColor = [210, 218, 230];

  const roundedRect = (x, y, w, h, r) => {
    doc.setDrawColor(...borderColor);
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y, w, h, r, r, 'FD');
  };

  const medicaments = normalizeMedicaments(prescription.medicaments);
  // Nom du patient depuis la consultation (ou fallback)
  const patient = prescription?.consultation?.dossier?.patient?.user?.name ||
                  prescription?.consultation?.dossier?.patient?.name ||
                  "Patient";
  const medecin = prescription.consultation?.medecin?.user?.name || 'Médecin';
  const date = formatDate(prescription.created_at);
  const dateValidite = Array.isArray(prescription.date_validite)
    ? formatOrdonnanceField(prescription.date_validite)
    : formatDate(prescription.date_validite || prescription.duree);
  const posologie = formatOrdonnanceField(prescription.posologie || prescription.dosage);
  const instructions = formatOrdonnanceField(prescription.instructions || prescription.frequence);
  const ref = `ORD-${prescription.id}`;

  // En‑tête
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('Med-Archive', margin, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...redColor);
  doc.text('ORDONNANCE MÉDICALE', pageWidth - margin, 22, { align: 'right' });

  doc.setDrawColor(...borderColor);
  doc.line(margin, 30, pageWidth - margin, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text(`N° ${ref}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Émise le : ${date}`, pageWidth - margin, 44, { align: 'right' });
  doc.text(`Valable jusqu'au : ${dateValidite}`, pageWidth - margin, 50, { align: 'right' });

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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Traitement prescrit', margin, y);
  y += 8;

  doc.setDrawColor(...borderColor);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

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
      doc.text(`${index + 1}. ${text}`, margin, y);
      y += 7;
    });
  } else {
    doc.text('Aucun médicament spécifié.', margin, y);
    y += 7;
  }

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
  const instrLines = doc.splitTextToSize(instructions, maxWidth);
  doc.text(instrLines, margin, y);
  y += instrLines.length * 5 + 6;

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

  doc.setFontSize(8.5);
  doc.setTextColor(...borderColor);
  doc.text('Document généré automatiquement par Med-Archive.', margin, pageHeight - 14);
  doc.text(`Réf. ${ref}`, pageWidth - margin, pageHeight - 14, { align: 'right' });

  doc.save(`${ref}.pdf`);
}

// ---------- Composant principal ----------
export default function DossierPatientHopital() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get("patient_id") || "");
  const [dossierData, setDossierData] = useState(null);
  const [activeTab, setActiveTab] = useState("consultations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // État pour la consultation sélectionnée (modale)
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Charger la liste des patients du service
  useEffect(() => {
    let ignore = false;

    async function loadPatients() {
      try {
        const response = await getMesPatientsService({ per_page: 1000 });
        const rows = rowsFromPaginated(response).map((row) => row.patient ?? row).filter(Boolean);
        if (ignore) return;
        setPatients(rows);
        setSelectedPatientId((current) => current || searchParams.get("patient_id") || (rows[0]?.id ? String(rows[0].id) : ""));
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Impossible de charger les patients du service.");
      }
    }

    loadPatients();
    return () => {
      ignore = true;
    };
  }, [searchParams]);

  // Charger le dossier complet du patient sélectionné
  useEffect(() => {
    let ignore = false;

    async function loadDossier() {
      if (!selectedPatientId) {
        setLoading(false);
        setDossierData(null);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getPatientDossierComplet(selectedPatientId);
        if (!ignore) setDossierData(response?.data ?? response);
      } catch (err) {
        if (!ignore) {
          setDossierData(null);
          setError(err.response?.data?.message || "Impossible de charger le dossier patient.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDossier();
    return () => {
      ignore = true;
    };
  }, [selectedPatientId]);

  // Extraire les données du dossier
  const patient = dossierData?.patient;
  const dossier = dossierData?.dossier;
  const consultations = dossierData?.consultations || [];
  const analyses = dossierData?.analyses || [];
  const ordonnances = dossierData?.ordonnances || [];
  const documents = dossierData?.documents || [];
  const permissions = dossierData?.permissions || {};
  const latestConstantes = dossierData?.dernieres_constantes || consultations.find((consultation) => consultation.constantes)?.constantes || null;

  // Regrouper les consultations par année
  const consultationsByYear = useMemo(() => {
    return consultations.reduce((groups, consultation) => {
      const year = consultation.date_consultation ? new Date(consultation.date_consultation).getFullYear() : "Sans date";
      groups[year] = groups[year] || [];
      groups[year].push(consultation);
      return groups;
    }, {});
  }, [consultations]);

  // Changement de patient
  function handlePatientChange(event) {
    const id = event.target.value;
    setSelectedPatientId(id);
    setSearchParams(id ? { patient_id: id } : {});
  }

  // Gestionnaires pour les actions
  async function handleDownloadAnalyse(analyse) {
    if (!analyse?.id) return;

    try {
      setError("");
      const response = await getAnalyseResultatFichier(analyse.id);
      downloadBlob(response.data, blobFileName(analyse.fichier_resultat || analyse.type_analyse, `analyse-${analyse.id}.pdf`));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de télécharger le document d'analyse.");
    }
  }

  async function handleOpenDocument(document) {
    if (!document?.id) return;

    try {
      setError("");
      const blob = await viewDocument(document.id);
      openBlob(blob);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'ouvrir ce document.");
    }
  }

  // Calcul de l'âge
  const age = patient?.user?.date_naissance
    ? new Date().getFullYear() - new Date(patient.user.date_naissance).getFullYear()
    : "-";

  const metrics = {
    bpm: displayValue(latestConstantes?.frequence_cardiaque),
    tension: displayValue(latestConstantes?.tension_arterielle),
    respiration: "-",
    glucose: displayValue(latestConstantes?.glycemie),
  };
  const patientWeight = latestConstantes?.poids ?? patient?.poids;

  return (
    <main className="content page-tight" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <section className="patient-dossier">
        {/* Carte de profil */}
        <article className="profile-card">
          <div className="profile-head">
            {patient?.avatar ? (
              <img
                className="profile-avatar"
                src={patient.avatar}
                alt={patientName(patient)}
              />
            ) : (
              <AvatarInitials
                name={patientName(patient)}
                size={100}
                bgColor="#13c3b8"
                className="profile-avatar"
              />
            )}
            <div className="profile-main">
              <h1>{patientName(patient)}</h1>
              <div className="profile-tags">
                <span className="tag tag-neutral">Patient suivi</span>
                {permissions.can_write === false && (
                  <span className="tag tag-vip">Lecture seule</span>
                )}
              </div>
              <p>{patient?.user?.adresse || "Adresse non renseignée"}</p>
            </div>
            <div className="profile-actions">
              <button className="profile-icon" type="button" title="Appeler">
                <i className="fa-solid fa-phone"></i>
              </button>
              <button className="profile-icon" type="button" title="Message">
                <i className="fa-regular fa-comment"></i>
              </button>
            </div>
          </div>
          <div className="profile-meta">
            <div className="meta-item">
              <strong>{age} ans</strong>
              <span>Âge</span>
            </div>
            <div className="meta-item">
              <strong>{patient?.groupe_sanguin || "-"}</strong>
              <span>Groupe sanguin</span>
            </div>
            <div className="meta-item">
              <strong>{displayValue(patientWeight, patientWeight ? " kg" : "")}</strong>
              <span>Poids</span>
            </div>
            <div className="meta-highlight">
              <strong>N° dossier: {dossier?.numero_dossier || "-"}</strong>
            </div>
          </div>
        </article>

        {/* Métriques rapides */}
        <section className="metrics-grid" aria-label="Indicateurs rapides">
          <article className="metric-card metric-a">
            <i className="fa-regular fa-heart"></i>
            <div>
              <strong>{metrics.bpm}</strong>
              <span>bpm</span>
            </div>
          </article>
          <article className="metric-card metric-b">
            <i className="fa-solid fa-gauge-high"></i>
            <div>
              <strong>{metrics.tension}</strong>
              <span>mmHg Tension</span>
            </div>
          </article>
          <article className="metric-card metric-c">
            <i className="fa-solid fa-lungs"></i>
            <div>
              <strong>{metrics.respiration}</strong>
              <span>Resp./min</span>
            </div>
          </article>
          <article className="metric-card metric-d">
            <i className="fa-solid fa-cubes"></i>
            <div>
              <strong>{metrics.glucose}</strong>
              <span>mg/dl Glucose</span>
            </div>
          </article>
        </section>

        {/* Grille principale */}
        <section className="content-grid">
          <div className="stacked-grid">
            {/* Informations générales */}
            <article className="dossier-panel">
              <h3>1. Informations générales</h3>
              <p className="panel-sub">Informations du patient.</p>
              <div className="info-grid">
                <div className="info-item"><span>Nom et prénom</span><strong>{patientName(patient)}</strong></div>
                <div className="info-item"><span>Sexe</span><strong>{patient?.user?.sexe || "-"}</strong></div>
                <div className="info-item"><span>Date de naissance</span><strong>{formatDate(patient?.user?.date_naissance)}</strong></div>
                <div className="info-item"><span>Âge</span><strong>{age} ans</strong></div>
                <div className="info-item"><span>Adresse</span><strong>{patient?.user?.adresse || "-"}</strong></div>
                <div className="info-item"><span>Téléphone</span><strong>{patient?.user?.telephone || "-"}</strong></div>
                <div className="info-item"><span>Email</span><strong>{patient?.user?.email || "-"}</strong></div>
                <div className="info-item"><span>Groupe sanguin</span><strong>{patient?.groupe_sanguin || "-"}</strong></div>
                <div className="info-item"><span>Urgence</span><strong>{patient?.telephone_contact || "-"}</strong></div>
              </div>
            </article>

            {/* Allergies et antécédents */}
            <article className="dossier-panel">
              <h3>2. Allergies et antécédents</h3>
              <p className="panel-sub">Informations critiques pour la prise en charge médicale.</p>
              <strong className="subsection-title">Allergies</strong>
              <div className="pill-list">
                {(patient?.allergies || dossier?.allergies_importantes) ? (
                  (patient?.allergies || dossier?.allergies_importantes).split(',').map((allergie, idx) => (
                    <span key={idx} className="pill pill-danger">{allergie.trim()}</span>
                  ))
                ) : (
                  <span className="pill">Aucune allergie renseignée</span>
                )}
              </div>
              <strong className="subsection-title">Antécédents médicaux</strong>
              <div className="pill-list">
                {(patient?.antecedents_medicaux || dossier?.diagnostics_principaux) ? (
                  (patient?.antecedents_medicaux || dossier?.diagnostics_principaux).split(',').map((ante, idx) => (
                    <span key={idx} className="pill">{ante.trim()}</span>
                  ))
                ) : (
                  <span className="pill">Aucun antécédent renseigné</span>
                )}
              </div>
              <strong className="subsection-title">Vaccinations</strong>
              <div className="pill-list">
                {dossier?.vaccinations ? (
                  dossier.vaccinations.split(',').map((vaccin, idx) => (
                    <span key={idx} className="pill pill-success">{vaccin.trim()}</span>
                  ))
                ) : (
                  <span className="pill">Aucune vaccination renseignée</span>
                )}
              </div>
            </article>

            {/* Historique des consultations */}
            <article className="dossier-panel">
              <h3>3. Historique des consultations</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Médecin</th>
                      <th>Motif</th>
                      <th>Diagnostic</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.length === 0 ? (
                      <tr><td colSpan="5">Aucune consultation.</td></tr>
                    ) : (
                      consultations.map((consultation) => (
                        <tr key={consultation.id}>
                          <td>{formatDate(consultation.date_consultation)}</td>
                          <td>{consultation.medecin?.user?.name || "-"}</td>
                          <td>{consultation.motif || "-"}</td>
                          <td>{consultation.diagnostic || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="action-link action-button"
                              onClick={() => setSelectedConsultation(consultation)}
                            >
                              <i className="fa-regular fa-eye"></i> Voir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            {/* Résultats d'analyses */}
            <article className="dossier-panel">
              <h3>4. Résultats d'analyses</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Analyse</th>
                      <th>Résultat</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.length === 0 ? (
                      <tr><td colSpan="4">Aucune analyse visible.</td></tr>
                    ) : (
                      analyses.map((analyse) => (
                        <tr key={analyse.id}>
                          <td>{formatDate(analyse.date_prelevement || analyse.created_at)}</td>
                          <td>{analyse.type_analyse || "-"}</td>
                          <td><span className="pill pill-warning">{analyse.statut || "-"}</span></td>
                          <td>
                            <button
                              type="button"
                              className="action-link action-button"
                              onClick={() => handleDownloadAnalyse(analyse)}
                              disabled={!analyse.fichier_resultat}
                            >
                              <i className="fa-solid fa-download"></i> Télécharger
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            {/* Ordonnances */}
            <article className="dossier-panel">
              <h3>5. Ordonnances</h3>
              <div className="table-wrap">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Médecin</th>
                      <th>Médicaments</th>
                      <th>Télécharger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordonnances.length === 0 ? (
                      <tr><td colSpan="4">Aucune ordonnance visible.</td></tr>
                    ) : (
                      ordonnances.map((ordonnance) => (
                        <tr key={ordonnance.id}>
                          <td>{formatDate(ordonnance.created_at)}</td>
                          <td>{ordonnance.consultation?.medecin?.user?.name || "-"}</td>
                          <td>{Array.isArray(ordonnance.medicaments) ? ordonnance.medicaments.join(", ") : ordonnance.medicaments || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="action-link action-button"
                              onClick={() => buildPrescriptionPdf(ordonnance)}
                            >
                              <i className="fa-regular fa-file-pdf"></i> PDF
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          {/* Colonne droite : Documents médicaux */}
          <div className="stacked-grid">
            <article className="dossier-panel">
              <h3>6. Documents médicaux</h3>
              <p className="panel-sub">Formats supportés: PDF, JPEG, PNG, MP4</p>
              <div className="doc-grid">
                {documents.length === 0 ? (
                  <p>Aucun document visible.</p>
                ) : (
                  documents.map((doc) => (
                    <article key={doc.id} className="doc-item">
                      <strong>{doc.titre || doc.nom || `Document #${doc.id}`}</strong>
                      <span>{doc.type_document?.nom || doc.type || "Document"} - {formatDate(doc.created_at)}</span>
                      <button
                        type="button"
                        className="patient-compact-btn"
                        onClick={() => handleOpenDocument(doc)}
                      >
                        Ouvrir
                      </button>
                    </article>
                  ))
                )}
              </div>
              <div className="img-grid">
                {documents.slice(0, 4).map((doc, idx) => (
                  <div key={idx} className="img-placeholder">
                    <i className="fa-regular fa-image"></i>
                    <span>{doc.titre || `Doc #${doc.id}`}</span>
                  </div>
                ))}
                {documents.length === 0 && (
                  <>
                    <div className="img-placeholder"><i className="fa-regular fa-image"></i><span>Aucun document</span></div>
                    <div className="img-placeholder"><i className="fa-solid fa-file-waveform"></i><span>-</span></div>
                    <div className="img-placeholder"><i className="fa-solid fa-file-medical"></i><span>-</span></div>
                    <div className="img-placeholder"><i className="fa-solid fa-video"></i><span>-</span></div>
                  </>
                )}
              </div>
            </article>
          </div>
        </section>
      </section>

      {/* MODALE DE CONSULTATION */}
      {selectedConsultation && (
        <div className="consultation-modal-backdrop" onClick={() => setSelectedConsultation(null)}>
          <div className="consultation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="consultation-modal-header">
              <div>
                <span className="modal-kicker">Consultation</span>
                <h2>{formatDate(selectedConsultation.date_consultation || selectedConsultation.created_at)}</h2>
              </div>
              <button type="button" className="modal-close" title="Fermer" onClick={() => setSelectedConsultation(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="consultation-detail-grid">
              <div><span>Médecin</span><strong>{selectedConsultation.medecin?.user?.name || "-"}</strong></div>
              <div><span>Service</span><strong>{selectedConsultation.service?.nom || "-"}</strong></div>
              <div><span>Motif</span><strong>{selectedConsultation.motif || "-"}</strong></div>
              <div><span>Diagnostic</span><strong>{selectedConsultation.diagnostic || "-"}</strong></div>
              <div className="detail-wide"><span>Observations</span><strong>{selectedConsultation.observations || selectedConsultation.notes || "-"}</strong></div>
              <div className="detail-wide"><span>Traitement</span><strong>{[
                Array.isArray(selectedConsultation.ordonnance?.medicaments)
                  ? selectedConsultation.ordonnance.medicaments.join(", ")
                  : selectedConsultation.ordonnance?.medicaments,
                selectedConsultation.ordonnance?.posologie,
                selectedConsultation.ordonnance?.instructions,
              ].filter(Boolean).join(" — ") || "-"}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* STYLES (avec les ajouts pour la modale et les boutons) */}
      <style>{`
        /* ========== CONTENEUR PRINCIPAL AÉRÉ ========== */
        .patient-dossier {
          background: #e9eef8;
          border-radius: 24px;
          padding: 24px;
          display: grid;
          gap: 24px;
        }

        /* ========== CARTE PROFIL ========== */
        .profile-card {
          background: #fff;
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 18px;
          overflow: hidden;
        }
        .profile-head {
          padding: 24px;
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 20px;
          align-items: center;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #dbe7f3;
        }
        .profile-main h1 {
          margin: 0;
          font-size: 1.9rem;
          color: #000000 !important;
        }
        body.dark-mode .profile-main h1 {
          color: #e4f0fb !important;
        }
        .profile-tags {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          font-size: 0.8rem;
          padding: 6px 10px;
          font-weight: 600;
        }
        .tag-neutral {
          background: #efe8ff;
          color: #6952a7;
        }
        .tag-vip {
          background: #ffe8f7;
          color: #b8428d;
        }
        .profile-main p {
          margin: 10px 0 0;
          color: #4f6b8a;
        }
        .profile-actions {
          display: flex;
          gap: 10px;
          align-self: start;
        }
        .profile-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(24, 68, 101, 0.2);
          background: #fff;
          color: #315b84;
        }
        .profile-meta {
          border-top: 1px solid rgba(24, 68, 101, 0.12);
          padding: 18px 24px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .meta-item strong, .meta-highlight strong {
          font-size: 1.2rem;
          color: #132f53;
        }
        .meta-item span, .meta-highlight span {
          color: #617d97;
          font-size: 0.9rem;
        }
        .meta-highlight {
          justify-self: end;
          text-align: right;
        }

        /* ========== MÉTRIQUES ========== */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .metric-card {
          border-radius: 16px;
          padding: 18px;
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 14px;
          align-items: center;
        }
        .metric-card i {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.75);
          color: #2e557d;
          font-size: 1.4rem;
        }
        .metric-card strong {
          font-size: 2.2rem;
          line-height: 1;
          color: #122f53;
        }
        .metric-card span {
          color: #5d7894;
        }
        .metric-a { background: #f7dfc6; }
        .metric-b { background: #f8e7b5; }
        .metric-c { background: #cdeef4; }
        .metric-d { background: #ead8eb; }

        /* ========== GRILLE DEUX COLONNES ========== */
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .stacked-grid {
          display: grid;
          gap: 24px;
        }

        /* ========== PANNEAUX DOSSIER ========== */
        .dossier-panel {
          background: #fff;
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 18px;
          padding: 20px 24px;
          display: grid;
          gap: 16px;
        }
        .dossier-panel h3 {
          margin: 0;
          font-size: 1.35rem;
          color: #000000 !important;
          font-weight: 700;
        }
        body.dark-mode .dossier-panel h3 {
          color: #e4f0fb !important;
        }
        .subsection-title {
          font-size: 1rem;
          font-weight: 700;
          margin-top: 4px;
          color: var(--text-dark, #1a1a1a);
        }
        body.dark-mode .subsection-title {
          color: var(--text-light, #c0d8e8);
        }
        .panel-sub {
          margin: -4px 0 0;
          color: #5f7b95;
        }

        /* Grille info patient */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .info-item {
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 12px;
          padding: 12px;
          display: grid;
          gap: 4px;
          background: #fbfdff;
        }
        .info-item span {
          font-size: 0.8rem;
          color: #67829b;
        }
        .info-item strong {
          color: #15395f;
          font-size: 0.95rem;
        }

        /* Pills */
        .pill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pill {
          border-radius: 999px;
          border: 1px solid rgba(24, 68, 101, 0.16);
          padding: 6px 12px;
          font-size: 0.86rem;
          color: #375f84;
          background: #f4f8fc;
        }
        .pill-danger {
          color: #8c3b4a;
          background: #ffeef2;
          border-color: #f0c4cf;
        }
        .pill-warning {
          color: #8a5a11;
          background: #fff4dc;
          border-color: #f1ddad;
        }
        .pill-success {
          color: #1f6a45;
          background: #e8f9ef;
          border-color: #bde8ce;
        }

        /* Tableaux */
        .table-wrap {
          overflow-x: auto;
        }
        .table-clean {
          width: 100%;
          min-width: 680px;
          border-collapse: collapse;
        }
        .table-clean th,
        .table-clean td {
          text-align: left;
          padding: 12px 8px;
          border-bottom: 1px solid rgba(24, 68, 101, 0.12);
          color: #20496f;
          vertical-align: top;
        }
        .table-clean th {
          color: #5f7b95;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 700;
        }
        .action-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2f5f91;
          text-decoration: none;
          font-weight: 600;
        }
        .action-button {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          font: inherit;
        }
        .action-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        /* ========== DOCUMENTS MÉDICAUX ========== */
        .doc-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .doc-item {
          border: 1px dashed rgba(24, 68, 101, 0.25);
          border-radius: 14px;
          padding: 16px;
          background: #fafcff;
          display: grid;
          gap: 8px;
        }
        .doc-item strong {
          color: #1d466e;
        }
        .doc-item span {
          color: #5f7b95;
          font-size: 0.9rem;
        }
        .patient-compact-btn {
          background: transparent;
          border: 1px solid var(--teal, #17b8b0);
          border-radius: 30px;
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--teal-dark, #0f9f9b);
          cursor: pointer;
          transition: all 0.2s ease;
          width: fit-content;
        }
        .patient-compact-btn:hover {
          background: var(--teal, #17b8b0);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(23,184,176,0.2);
        }
        body.dark-mode .patient-compact-btn {
          border-color: #2dd4c8;
          color: #2dd4c8;
        }
        body.dark-mode .patient-compact-btn:hover {
          background: #2dd4c8;
          color: #001f2e;
        }

        .img-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .img-placeholder {
          height: 115px;
          border-radius: 12px;
          border: 1px solid rgba(24, 68, 101, 0.12);
          background: linear-gradient(145deg, #d9e8fb, #eef5ff);
          color: #2e567e;
          display: grid;
          place-items: center;
          gap: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          text-align: center;
          padding: 8px;
        }
        .img-placeholder i {
          font-size: 1.3rem;
        }

        /* ========== MODALE CONSULTATION ========== */
        .consultation-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.55);
        }
        .consultation-modal {
          width: min(760px, 92vw);
          max-height: 86vh;
          overflow: auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
        }
        .consultation-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(24, 68, 101, 0.12);
        }
        .consultation-modal-header h2 {
          margin: 6px 0 0;
          color: #132f53;
          font-size: 1.35rem;
        }
        .modal-kicker {
          color: #0f9f9b;
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .modal-close {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(24, 68, 101, 0.14);
          border-radius: 10px;
          background: #f8fafc;
          color: #315b84;
          cursor: pointer;
        }
        .consultation-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 24px;
        }
        .consultation-detail-grid div {
          display: grid;
          gap: 6px;
          padding: 14px;
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 12px;
          background: #fbfdff;
        }
        .consultation-detail-grid .detail-wide {
          grid-column: 1 / -1;
        }
        .consultation-detail-grid span {
          color: #67829b;
          font-size: 0.8rem;
        }
        .consultation-detail-grid strong {
          color: #15395f;
          font-size: 0.95rem;
          white-space: pre-wrap;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1120px) {
          .content-grid { grid-template-columns: 1fr; }
          .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 760px) {
          .profile-head { grid-template-columns: 1fr; }
          .profile-actions { justify-content: flex-start; }
          .profile-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .meta-highlight { justify-self: start; text-align: left; }
          .metrics-grid, .info-grid, .doc-grid { grid-template-columns: 1fr; }
        }

        /* ========== MODE SOMBRE ========== */
        body.dark-mode .patient-dossier { background: #0b2435; }
        body.dark-mode .profile-card,
        body.dark-mode .dossier-panel {
          background: #102b3d;
          border-color: #1a4b65;
        }
        body.dark-mode .profile-main h1,
        body.dark-mode .dossier-panel h3,
        body.dark-mode .meta-item strong,
        body.dark-mode .meta-highlight strong,
        body.dark-mode .metric-card strong,
        body.dark-mode .info-item strong,
        body.dark-mode .doc-item strong,
        body.dark-mode .table-clean td,
        body.dark-mode .action-link {
          color: #e4f0fb;
        }
        body.dark-mode .subsection-title {
          color: #9fc0d9;
        }
        body.dark-mode .profile-main p,
        body.dark-mode .meta-item span,
        body.dark-mode .meta-highlight span,
        body.dark-mode .metric-card span,
        body.dark-mode .panel-sub,
        body.dark-mode .info-item span,
        body.dark-mode .table-clean th,
        body.dark-mode .doc-item span,
        body.dark-mode .pill {
          color: #9fc0d9;
        }
        body.dark-mode .profile-avatar { border-color: #2a5a75; }
        body.dark-mode .profile-icon {
          border-color: #2a5a75;
          background: #14344a;
          color: #b8d3e8;
        }
        body.dark-mode .profile-meta { border-top-color: #1a4b65; }
        body.dark-mode .metric-a { background: #4b3722; }
        body.dark-mode .metric-b { background: #4d4524; }
        body.dark-mode .metric-c { background: #214753; }
        body.dark-mode .metric-d { background: #47344c; }
        body.dark-mode .metric-card i { background: rgba(255,255,255,0.12); color: #d0e6f7; }
        body.dark-mode .info-item { border-color: #21536d; background: #123246; }
        body.dark-mode .pill { border-color: #2b607b; background: #16364c; }
        body.dark-mode .pill-danger { color: #ffc7d6; background: #5a2e3a; border-color: #854557; }
        body.dark-mode .pill-warning { color: #ffe4af; background: #59461f; border-color: #83652c; }
        body.dark-mode .pill-success { color: #b9f3d1; background: #244d39; border-color: #3a7a5a; }
        body.dark-mode .table-clean th,
        body.dark-mode .table-clean td { border-bottom-color: #1e4f68; }
        body.dark-mode .doc-item { border-color: #2a5d77; background: #123246; }
        body.dark-mode .img-placeholder {
          border-color: #2a5d77;
          background: linear-gradient(145deg, #1d425a, #123247);
          color: #cde2f3;
        }
        body.dark-mode .consultation-modal {
          background: #102b3d;
          border-color: #1a4b65;
        }
        body.dark-mode .consultation-modal-header {
          border-bottom-color: #1a4b65;
        }
        body.dark-mode .consultation-modal-header h2 {
          color: #e4f0fb;
        }
        body.dark-mode .consultation-detail-grid div {
          border-color: #1a4b65;
          background: #123246;
        }
        body.dark-mode .consultation-detail-grid span {
          color: #9fc0d9;
        }
        body.dark-mode .consultation-detail-grid strong {
          color: #e4f0fb;
        }
        body.dark-mode .modal-close {
          border-color: #2a5a75;
          background: #14344a;
          color: #b8d3e8;
        }
      `}</style>
    </main>
  );
}