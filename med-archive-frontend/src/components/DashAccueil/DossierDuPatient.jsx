import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getMesPatientsService } from "../../api";
import { getPatientDossierComplet } from "../../api/patientApi";
import "../../assets/css/DossierDuPatient.css";

function rowsFromPaginated(response) {
  const payload = response?.data ?? response;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function patientName(patient) {
  return patient?.user?.name || patient?.name || "-";
}

const DossierDuPatient = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("date");
  const [activeTab, setActiveTab] = useState("historique");
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get("patient_id") || "");
  const [dossierData, setDossierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPatients() {
      try {
        setLoading(true);
        setError("");
        const response = await getMesPatientsService({ per_page: 100 });
        const rows = rowsFromPaginated(response).map((row) => row.patient ?? row).filter(Boolean);

        if (ignore) return;

        setPatients(rows);
        const requestedId = searchParams.get("patient_id");
        const firstId = rows[0]?.id ? String(rows[0].id) : "";
        setSelectedPatientId(requestedId || firstId);
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Impossible de charger les patients du service.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadPatients();
    return () => {
      ignore = true;
    };
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    async function loadDossier() {
      if (!selectedPatientId) {
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

  const patient = dossierData?.patient;
  const dossier = dossierData?.dossier;
  const consultations = dossierData?.consultations || [];
  const analyses = dossierData?.analyses || [];
  const ordonnances = dossierData?.ordonnances || [];
  const documents = dossierData?.documents || [];

  const consultationsByYear = useMemo(() => {
    return consultations.reduce((acc, consultation) => {
      const year = consultation.date_consultation ? new Date(consultation.date_consultation).getFullYear() : "Sans date";
      if (!acc[year]) acc[year] = [];
      acc[year].push(consultation);
      return acc;
    }, {});
  }, [consultations]);

  function handlePatientChange(event) {
    const nextId = event.target.value;
    setSelectedPatientId(nextId);
    setSearchParams(nextId ? { patient_id: nextId } : {});
  }

  return (
    <main className="content page-tight">
      <nav className="ddp-top-tabs" aria-label="Navigation dossier">
        {[
          ["historique", "Historique médical"],
          ["analyses", "Résultats d'analyses"],
          ["ordonnances", "Ordonnances"],
          ["documents", "Documents"],
          ["hospitalisation", "Hospitalisation"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            className={`ddp-tab ${activeTab === tab ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="ddp-board">
        <aside className="ddp-aside" aria-label="Résumé patient">
          <div className="ddp-patient-id">
            <select value={selectedPatientId} onChange={handlePatientChange} aria-label="Choisir un patient">
              <option value="">Choisir un patient</option>
              {patients.map((item) => (
                <option key={item.id} value={item.id}>
                  {patientName(item)} - {item.dossier?.numero_dossier || item.imu || ""}
                </option>
              ))}
            </select>
            <h2>{patientName(patient)}</h2>
            <span>IMU: {patient?.imu || dossier?.imu || "-"}</span>
          </div>

          {loading ? <p>Chargement du dossier...</p> : null}
          {error ? <p className="text-danger">{error}</p> : null}

          <ul className="ddp-facts">
            <li><i className="fa-regular fa-calendar"></i> {formatDate(patient?.user?.date_naissance)}</li>
            <li><i className="fa-solid fa-phone"></i> {patient?.user?.telephone || "-"}</li>
            <li><i className="fa-solid fa-droplet"></i> {patient?.groupe_sanguin || "-"}</li>
            <li><i className="fa-solid fa-house"></i> {patient?.user?.adresse || "-"}</li>
            <li><i className="fa-solid fa-file-medical"></i> Dossier: {dossier?.numero_dossier || "-"}</li>
          </ul>

          <section className="ddp-aside-block" aria-label="Allergies principales">
            <div className="ddp-aside-head"><h3>Allergies</h3></div>
            <article className="ddp-info-item">
              <strong><i className="fa-solid fa-circle ddp-dot-danger"></i> {patient?.allergies || dossier?.allergies_importantes || "Aucune allergie renseignée"}</strong>
            </article>
          </section>
          <section className="ddp-aside-block">
            <div className="ddp-aside-head"><h3>Antécédents</h3></div>
            <div className="ddp-info-item"><span>{patient?.antecedents_medicaux || dossier?.diagnostics_principaux || "Aucun antécédent renseigné"}</span></div>
          </section>
          <section className="ddp-aside-block">
            <div className="ddp-aside-head"><h3>Traitements</h3></div>
            <div className="ddp-info-item"><span>{dossier?.traitements_en_cours || "Aucun traitement en cours renseigné"}</span></div>
          </section>
        </aside>

        {activeTab === "historique" && (
          <section className="ddp-history-shell" aria-label="Historique médical">
            <header className="ddp-history-toolbar ddp-analyses-toolbar">
              <h1>Historique médical</h1>
              <div className="ddp-history-filters">
                {["date", "condition", "type"].map((filter) => (
                  <button
                    key={filter}
                    className={`ddp-filter-chip ${activeFilter === filter ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                  >
                    Par {filter}
                  </button>
                ))}
              </div>
            </header>
            <div className="ddp-timeline">
              {Object.keys(consultationsByYear).length === 0 ? <p>Aucune consultation visible.</p> : null}
              {Object.entries(consultationsByYear).map(([year, items]) => (
                <section className="ddp-year-group" key={year}>
                  <div className="ddp-year-label">{year}</div>
                  <div className="ddp-year-track">
                    <span className="ddp-year-node" aria-hidden="true"></span>
                    {items.map((consultation) => (
                      <article className="ddp-history-event" key={consultation.id}>
                        <span className="ddp-event-day">{formatDate(consultation.date_consultation)}</span>
                        <h4>{consultation.motif || "Consultation"}</h4>
                        <p className="ddp-history-meta"><i className="fa-solid fa-user-doctor"></i> {consultation.medecin?.user?.name || "-"}</p>
                        <p className="ddp-history-meta"><i className="fa-solid fa-building"></i> {consultation.medecin?.etablissement?.name || consultation.service?.nom || "-"}</p>
                        {consultation.diagnostic ? <p>{consultation.diagnostic}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )}

        {activeTab === "analyses" && (
          <section className="ddp-history-shell ddp-analyses-shell" aria-label="Résultats d'analyses">
            <header className="ddp-history-toolbar ddp-analyses-toolbar"><h1>Résultats d'analyses</h1></header>
            <section className="ddp-analyses-card">
              <div className="ddp-analyses-table-wrap">
                <table className="ddp-analyses-table">
                  <thead><tr><th>Date</th><th>Examen</th><th>Laboratoire</th><th>Statut</th></tr></thead>
                  <tbody>
                    {analyses.map((analyse) => (
                      <tr key={analyse.id}>
                        <td>{formatDate(analyse.date_prelevement || analyse.created_at)}</td>
                        <td>{analyse.type_analyse}</td>
                        <td>{analyse.laboratoire?.user?.name || "-"}</td>
                        <td><span className="ddp-status ddp-status-ok">{analyse.statut || "-"}</span></td>
                      </tr>
                    ))}
                    {analyses.length === 0 ? <tr><td colSpan={4}>Aucune analyse visible.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {activeTab === "ordonnances" && (
          <section className="ddp-history-shell ddp-ord-shell" aria-label="Ordonnances">
            <header className="ddp-history-toolbar ddp-analyses-toolbar"><h1>Ordonnances</h1></header>
            <section className="ddp-ord-card">
              <div className="ddp-ord-table-wrap">
                <table className="ddp-ord-table">
                  <thead><tr><th>Prescription</th><th>Posologie</th><th>Validité</th><th>Prescripteur</th></tr></thead>
                  <tbody>
                    {ordonnances.map((ordonnance) => (
                      <tr key={ordonnance.id}>
                        <td>{Array.isArray(ordonnance.medicaments) ? ordonnance.medicaments.join(", ") : ordonnance.medicaments}</td>
                        <td>{ordonnance.posologie || "-"}</td>
                        <td>{formatDate(ordonnance.date_validite)}</td>
                        <td>{ordonnance.consultation?.medecin?.user?.name || "-"}</td>
                      </tr>
                    ))}
                    {ordonnances.length === 0 ? <tr><td colSpan={4}>Aucune ordonnance visible.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {activeTab === "documents" && (
          <section className="ddp-history-shell ddp-doc-shell" aria-label="Documents patient">
            <header className="ddp-history-toolbar ddp-analyses-toolbar"><h1>Documents médicaux</h1></header>
            <section className="ddp-doc-section">
              <div className="ddp-doc-grid">
                {documents.map((document) => (
                  <article className="ddp-doc-card" key={document.id}>
                    <h4>{document.titre || document.nom || `Document #${document.id}`}</h4>
                    <p>{document.type_document?.nom || document.type || "Document"} · {formatDate(document.created_at)}</p>
                  </article>
                ))}
                {documents.length === 0 ? <p>Aucun document visible.</p> : null}
              </div>
            </section>
          </section>
        )}

        {activeTab === "hospitalisation" && (
          <section className="ddp-history-shell ddp-hosp-shell" aria-label="Hospitalisations">
            <header className="ddp-history-toolbar ddp-analyses-toolbar"><h1>Hospitalisations</h1></header>
            <div className="ddp-timeline">
              <article className="ddp-history-event">
                <h4>Informations d'hospitalisation</h4>
                <p className="ddp-history-meta">{dossier?.notes_importantes || "Aucune information d'hospitalisation renseignée."}</p>
              </article>
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default DossierDuPatient;
