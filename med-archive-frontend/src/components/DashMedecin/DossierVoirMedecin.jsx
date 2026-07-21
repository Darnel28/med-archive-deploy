import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPatientDossierComplet } from "../../api/patientApi";
import { getMesPatientsService } from "../../api/serviceApi";
import AvatarInitials from "../AvatarInitials.jsx"; // Import du composant

// Fonctions utilitaires reprises du code original
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

function displayList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "-";
  if (value && typeof value === "object") return Object.values(value).filter(Boolean).join(", ") || "-";
  return value || "-";
}

export default function DossierVoirMedecin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get("patient_id") || "");
  const [dossierData, setDossierData] = useState(null);
  const [activeTab, setActiveTab] = useState("consultations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewModal, setViewModal] = useState(null);

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

  function openViewModal(type, data) {
    setViewModal({ type, data });
  }

  function closeViewModal() {
    setViewModal(null);
  }

  function modalTitle() {
    if (viewModal?.type === "consultation") return "Details de la consultation";
    if (viewModal?.type === "analyse") return "Details de l'analyse";
    if (viewModal?.type === "ordonnance") return "Details de l'ordonnance";
    return "Details";
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
            {/* Avatar dynamique */}
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
              {/* <span>N° dossier</span> */}
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
              {/* <strong className="subsection-title">Vaccinations</strong>
              <div className="pill-list">
                {dossier?.vaccinations ? (
                  dossier.vaccinations.split(',').map((vaccin, idx) => (
                    <span key={idx} className="pill pill-success">{vaccin.trim()}</span>
                  ))
                ) : (
                  <span className="pill">Aucune vaccination renseignée</span>
                )}
              </div> */}
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
                      <tr><td colSpan="5">Aucune consultation .</td></tr>
                    ) : (
                      consultations.map((consultation) => (
                        <tr key={consultation.id}>
                          <td>{formatDate(consultation.date_consultation)}</td>
                          <td>{consultation.medecin?.user?.name || "-"}</td>
                          <td>{consultation.motif || "-"}</td>
                          <td>{consultation.diagnostic || "-"}</td>
                          <td>
                            <button type="button" className="action-link action-button" onClick={() => openViewModal("consultation", consultation)}>
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
                      <th>Action</th>
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
                            <button type="button" className="action-link action-button" onClick={() => openViewModal("analyse", analyse)}>
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
                      <th>Action</th>
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
                            <button type="button" className="action-link action-button" onClick={() => openViewModal("ordonnance", ordonnance)}>
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
                      <button className="patient-compact-btn">Ouvrir</button>
                    </article>
                  ))
                )}
              </div>
              <div className="img-grid">
                {/* Placeholders d'aperçu (vous pouvez les lier aux documents réels si vous le souhaitez) */}
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

      {/* Styles CSS (inchangés) */}
      {viewModal && (
        <div className="dossier-view-modal-backdrop" onClick={closeViewModal}>
          <div className="dossier-view-modal" onClick={(event) => event.stopPropagation()}>
            <div className="dossier-view-modal-header">
              <div>
                <span className="modal-kicker">Voir</span>
                <h2>{modalTitle()}</h2>
              </div>
              <button type="button" className="modal-close" title="Fermer" onClick={closeViewModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {viewModal.type === "consultation" && (
              <div className="dossier-view-grid">
                <div><span>Date</span><strong>{formatDate(viewModal.data.date_consultation || viewModal.data.created_at)}</strong></div>
                <div><span>Medecin</span><strong>{viewModal.data.medecin?.user?.name || "-"}</strong></div>
                <div><span>Service</span><strong>{viewModal.data.service?.nom || "-"}</strong></div>
                <div><span>Motif</span><strong>{viewModal.data.motif || "-"}</strong></div>
                <div className="detail-wide"><span>Diagnostic</span><strong>{viewModal.data.diagnostic || "-"}</strong></div>
                <div className="detail-wide"><span>Observations</span><strong>{viewModal.data.observations || viewModal.data.notes || "-"}</strong></div>
                <div className="detail-wide"><span>Traitement</span><strong>{[
                  displayList(viewModal.data.ordonnance?.medicaments),
                  displayList(viewModal.data.ordonnance?.posologie),
                  displayList(viewModal.data.ordonnance?.instructions),
                ].filter((value) => value && value !== "-").join(" — ") || "-"}</strong></div>
              </div>
            )}

            {viewModal.type === "analyse" && (
              <div className="dossier-view-grid">
                <div><span>Date</span><strong>{formatDate(viewModal.data.date_prelevement || viewModal.data.created_at)}</strong></div>
                <div><span>Analyse</span><strong>{viewModal.data.type_analyse || "-"}</strong></div>
                <div><span>Statut</span><strong>{viewModal.data.statut || "-"}</strong></div>
                <div><span>Laboratoire</span><strong>{viewModal.data.laboratoire?.user?.name || viewModal.data.laboratoire?.name || "-"}</strong></div>
                <div className="detail-wide"><span>Resultat</span><strong>{displayList(viewModal.data.resultats)}</strong></div>
                <div className="detail-wide"><span>Commentaire</span><strong>{viewModal.data.commentaire || viewModal.data.commentaires || "-"}</strong></div>
              </div>
            )}

            {viewModal.type === "ordonnance" && (
              <div className="dossier-view-grid">
                <div><span>Date</span><strong>{formatDate(viewModal.data.created_at)}</strong></div>
                <div><span>Medecin</span><strong>{viewModal.data.consultation?.medecin?.user?.name || "-"}</strong></div>
                <div><span>Validite</span><strong>{formatDate(viewModal.data.date_validite)}</strong></div>
                <div><span>Reference</span><strong>ORD-{viewModal.data.id}</strong></div>
                <div className="detail-wide"><span>Medicaments</span><strong>{displayList(viewModal.data.medicaments)}</strong></div>
                <div className="detail-wide"><span>Posologie</span><strong>{displayList(viewModal.data.posologie)}</strong></div>
                <div className="detail-wide"><span>Instructions</span><strong>{displayList(viewModal.data.instructions)}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

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
          color: #000000 !important;   /* NOIR forcé en mode clair */
        }
        body.dark-mode .profile-main h1 {
          color: #e4f0fb !important;   /* clair en mode sombre */
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
        /* Titres principaux des sections (1.,2.,3.,5.,7.) en NOIR */
        .dossier-panel h3 {
          margin: 0;
          font-size: 1.35rem;
          color: #000000 !important;
          font-weight: 700;
        }
        body.dark-mode .dossier-panel h3 {
          color: #e4f0fb !important;
        }
        /* Sous-titres internes (Allergies, Antécédents, Vaccinations) retrouvent leur couleur normale */
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

        /* ========== DOCUMENTS MÉDICAUX ========== */
        .action-button {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          font: inherit;
        }

        .dossier-view-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.55);
        }
        .dossier-view-modal {
          width: min(760px, 92vw);
          max-height: 86vh;
          overflow: auto;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
        }
        .dossier-view-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(24, 68, 101, 0.12);
        }
        .dossier-view-modal-header h2 {
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
        .dossier-view-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 24px;
        }
        .dossier-view-grid div {
          display: grid;
          gap: 6px;
          padding: 14px;
          border: 1px solid rgba(24, 68, 101, 0.12);
          border-radius: 12px;
          background: #fbfdff;
        }
        .dossier-view-grid .detail-wide {
          grid-column: 1 / -1;
        }
        .dossier-view-grid span {
          color: #67829b;
          font-size: 0.8rem;
        }
        .dossier-view-grid strong {
          color: #15395f;
          font-size: 0.95rem;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

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
        /* Bouton "Ouvrir" redessiné : compact, élégant */
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
      `}</style>
    </main>
  );
}
