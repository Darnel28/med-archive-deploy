import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPatientDossierComplet } from "../../api/patientApi";
import { getMesPatientsService } from "../../api/serviceApi";
import "../../assets/css/DossierDuPatient.css";

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

export default function DossierDuPatient() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get("patient_id") || "");
  const [dossierData, setDossierData] = useState(null);
  const [activeTab, setActiveTab] = useState("consultations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const patient = dossierData?.patient;
  const dossier = dossierData?.dossier;
  const consultations = dossierData?.consultations || [];
  const analyses = dossierData?.analyses || [];
  const ordonnances = dossierData?.ordonnances || [];
  const documents = dossierData?.documents || [];
  const permissions = dossierData?.permissions || {};

  const consultationsByYear = useMemo(() => {
    return consultations.reduce((groups, consultation) => {
      const year = consultation.date_consultation ? new Date(consultation.date_consultation).getFullYear() : "Sans date";
      groups[year] = groups[year] || [];
      groups[year].push(consultation);
      return groups;
    }, {});
  }, [consultations]);

  function handlePatientChange(event) {
    const id = event.target.value;
    setSelectedPatientId(id);
    setSearchParams(id ? { patient_id: id } : {});
  }

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Dossier patient</h1>
      </section>

      <section className="ddp-board">
        <aside className="ddp-aside">
          <div className="ddp-patient-id">
            <select value={selectedPatientId} onChange={handlePatientChange} aria-label="Choisir un patient">
              <option value="">Choisir un patient</option>
              {patients.map((item) => (
                <option key={item.id} value={item.id}>{patientName(item)} - {item.dossier?.numero_dossier || item.imu || ""}</option>
              ))}
            </select>
            <h2>{patientName(patient)}</h2>
            <span>IMU: {patient?.imu || dossier?.imu || "-"}</span>
          </div>

          {loading ? <p>Chargement du dossier...</p> : null}
          {error ? <p className="text-danger">{error}</p> : null}
          {!loading && permissions.can_write === false ? <p className="text-warning">Lecture seule: dossier transfere ou hors perimetre de modification.</p> : null}

          <ul className="ddp-facts">
            <li><i className="fa-regular fa-calendar"></i> {formatDate(patient?.user?.date_naissance)}</li>
            <li><i className="fa-solid fa-phone"></i> {patient?.user?.telephone || "-"}</li>
            <li><i className="fa-solid fa-droplet"></i> {patient?.groupe_sanguin || "-"}</li>
            <li><i className="fa-solid fa-house"></i> {patient?.user?.adresse || "-"}</li>
            <li><i className="fa-solid fa-file-medical"></i> Dossier: {dossier?.numero_dossier || "-"}</li>
            <li><i className="fa-solid fa-user-doctor"></i> Referent: {dossier?.medecin_traitant || "-"}</li>
          </ul>

          <section className="ddp-aside-block"><div className="ddp-aside-head"><h3>Allergies</h3></div><div className="ddp-info-item">{patient?.allergies || dossier?.allergies_importantes || "Aucune allergie renseignee"}</div></section>
          <section className="ddp-aside-block"><div className="ddp-aside-head"><h3>Antecedents</h3></div><div className="ddp-info-item">{patient?.antecedents_medicaux || dossier?.diagnostics_principaux || "Aucun antecedent renseigne"}</div></section>
        </aside>

        <section className="ddp-history-shell">
          <nav className="ddp-top-tabs" aria-label="Sections dossier">
            {[["consultations", "Consultations"], ["analyses", "Analyses"], ["ordonnances", "Ordonnances"], ["documents", "Documents"]].map(([tab, label]) => (
              <button key={tab} className={`ddp-tab ${activeTab === tab ? "active" : ""}`} type="button" onClick={() => setActiveTab(tab)}>{label}</button>
            ))}
          </nav>

          {activeTab === "consultations" ? (
            <div className="ddp-timeline">
              {Object.keys(consultationsByYear).length === 0 ? <p>Aucune consultation visible.</p> : null}
              {Object.entries(consultationsByYear).map(([year, rows]) => (
                <section className="ddp-year-group" key={year}>
                  <div className="ddp-year-label">{year}</div>
                  <div className="ddp-year-track">
                    {rows.map((consultation) => (
                      <article className="ddp-history-event" key={consultation.id}>
                        <span className="ddp-event-day">{formatDate(consultation.date_consultation)}</span>
                        <h4>{consultation.motif || "Consultation"}</h4>
                        <p className="ddp-history-meta">{consultation.medecin?.user?.name || "-"} - {consultation.service?.nom || "-"}</p>
                        {consultation.diagnostic ? <p>{consultation.diagnostic}</p> : null}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {activeTab === "analyses" ? <DataTable rows={analyses} columns={["Date", "Examen", "Laboratoire", "Statut"]} render={(row) => [formatDate(row.date_prelevement || row.created_at), row.type_analyse, row.laboratoire?.user?.name || "-", row.statut || "-"]} empty="Aucune analyse visible." /> : null}
          {activeTab === "ordonnances" ? <DataTable rows={ordonnances} columns={["Prescription", "Posologie", "Validite", "Prescripteur"]} render={(row) => [Array.isArray(row.medicaments) ? row.medicaments.join(", ") : row.medicaments, row.posologie || "-", formatDate(row.date_validite), row.consultation?.medecin?.user?.name || "-"]} empty="Aucune ordonnance visible." /> : null}
          {activeTab === "documents" ? <DataTable rows={documents} columns={["Document", "Type", "Date"]} render={(row) => [row.titre || row.nom || `Document #${row.id}`, row.type_document?.nom || row.type || "Document", formatDate(row.created_at)]} empty="Aucun document visible." /> : null}
        </section>
      </section>
    </main>
  );
}

function DataTable({ rows, columns, render, empty }) {
  return (
    <section className="ddp-analyses-card">
      <div className="ddp-analyses-table-wrap">
        <table className="ddp-analyses-table">
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.id}>{render(row).map((value, index) => <td key={index}>{value || "-"}</td>)}</tr>)}
            {rows.length === 0 ? <tr><td colSpan={columns.length}>{empty}</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
