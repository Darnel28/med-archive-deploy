import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTransfertDossier,
  getCurrentUser,
  getMesPatientsEtablissement,
  getUsers,
} from "../../api";
import "../../assets/css/TransfertHopitalForm.css";
import useAutoDismissMessage from "../../hooks/useAutoDismissMessage";

function rowsFromPaginated(response) {
  const payload = response?.data ?? response;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function patientFromHospitalRow(row) {
    console.log(row);
  const patient = row.patient ?? row;
  console.log(patient.service);
  console.log(patient.dossier);
  const dossier = patient.dossier ?? {};
  return {
    id: patient.id,
    name: row.name || patient.user?.name || "-",
    dossierId: dossier.id,
    numeroDossier: dossier.numero_dossier || dossier.imu || "-",
    birthDate: row.date_naissance || patient.user?.date_naissance || "",
    phone: row.telephone || patient.user?.telephone || "",
    sex: row.sexe || patient.user?.sexe || "",
   serviceId:
    patient.service?.id ||
    dossier.service_proprietaire?.id ||
    "",
   serviceName:
    patient.service?.nom ||
    dossier.service_proprietaire?.nom ||
    "",
    medecinId: dossier.medecin_referent_id || dossier.medecin_referent?.id || "",
    medecinName: dossier.medecin_referent?.user?.name || dossier.medecin_traitant || "",
  };
}

const NouvelleDemandeTransfert = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [form, setForm] = useState({
    patient_id: "",
    service_source_id: "",
    etablissement_destination_id: "",
    medecin_traitant_id: "",
    motif: "",
    observations: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useAutoDismissMessage(success, setSuccess);

  const selectedPatient = useMemo(
    () => patients.find((patient) => String(patient.id) === String(form.patient_id)),
    [form.patient_id, patients]
  );

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");
        const meResponse = await getCurrentUser();
        const user = meResponse?.data?.user ?? meResponse?.user ?? meResponse;
        const etablissementId = user?.id;

        const [patientsResponse, usersResponse] = await Promise.all([
          getMesPatientsEtablissement({ per_page: 100 }),
          getUsers({ role: "Responsable Etablissement", statut: "actif", per_page: 100 }),
        ]);

        if (ignore) return;

        setCurrentUser(user);
        setPatients(rowsFromPaginated(patientsResponse).map(patientFromHospitalRow).filter((patient) => patient.dossierId));
        setHopitaux(rowsFromPaginated(usersResponse).filter((item) => item.id !== etablissementId));
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Impossible de charger les donnees du formulaire.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setForm((state) => ({
      ...state,
      service_source_id: selectedPatient?.serviceId || "",
      medecin_traitant_id: selectedPatient?.medecinId || "",
    }));
  }, [selectedPatient]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((state) => ({ ...state, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!selectedPatient?.dossierId) throw new Error("Dossier patient introuvable.");
      if (!form.service_source_id) throw new Error("Le service de depart du patient est introuvable.");

      await createTransfertDossier({
        dossier_id: selectedPatient.dossierId,
        service_source_id: form.service_source_id,
        etablissement_source_id: currentUser.id,
        etablissement_destination_id: form.etablissement_destination_id,
        medecin_traitant_id: form.medecin_traitant_id || null,
        motif: form.motif,
        observations: form.observations,
      });
      setSuccess("Demande de transfert envoyee.");
      setTimeout(() => navigate("/espacehopital/transfert"), 700);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Impossible d'envoyer la demande de transfert.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="hopital-transfer-form-page">
      <section className="hopital-transfer-form-hero">
        <div className="hopital-transfer-form-hero-copy">
          <span className="hopital-transfer-form-kicker">Bon de transfert</span>
          <h1>Demande de transfert / admission</h1>
          <p>Renseignez le dossier patient, l'hopital destinataire et les informations medicales utiles.</p>
        </div>
      </section>

      <form className="hopital-transfer-form-card" onSubmit={handleSubmit}>
        {loading ? <p className="table-meta">Chargement du formulaire...</p> : null}
        {error ? <p className="text-danger">{error}</p> : null}
        {success ? <p className="text-success">{success}</p> : null}

        <section className="hopital-transfer-form-section">
          <h2>I. Identification du patient</h2>
          <div className="hopital-transfer-form-grid">
            <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
              <span>Patient</span>
              <select name="patient_id" value={form.patient_id} onChange={updateField} required>
                <option value="">Choisir un patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </label>
            <label className="hopital-transfer-form-field">
              <span>Date de naissance</span>
              <input type="date" value={selectedPatient?.birthDate?.slice(0, 10) || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Telephone</span>
              <input type="tel" value={selectedPatient?.phone || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Sexe</span>
              <input type="text" value={selectedPatient?.sex || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Numero de dossier</span>
              <input type="text" value={selectedPatient?.numeroDossier || ""} readOnly />
            </label>
          </div>
        </section>

        <section className="hopital-transfer-form-section">
          <h2>II. Informations medicales</h2>
          <div className="hopital-transfer-form-grid">
            <label className="hopital-transfer-form-field">
              <span>Hopital d'origine</span>
              <input type="text" value={currentUser?.name || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Service de depart</span>
              <input type="text" value={selectedPatient?.serviceName || ""} readOnly required />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Medecin traitant</span>
              <input type="text" value={selectedPatient?.medecinName || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
              <span>Motif du transfert</span>
              <textarea name="motif" rows="4" value={form.motif} onChange={updateField} required />
            </label>
            <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
              <span>Resume de l'etat actuel et soins prodigues</span>
              <textarea name="observations" rows="4" value={form.observations} onChange={updateField} />
            </label>
          </div>
        </section>

        <section className="hopital-transfer-form-section">
          <h2>III. Demande de transfert</h2>
          <div className="hopital-transfer-form-grid">
            <label className="hopital-transfer-form-field">
              <span>Hopital destinataire</span>
              <select name="etablissement_destination_id" value={form.etablissement_destination_id} onChange={updateField} required>
                <option value="">Choisir l'hopital</option>
                {hopitaux.map((hopital) => (
                  <option key={hopital.id} value={hopital.id}>{hopital.name}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="tp-buttons">
          <button type="button" className="tp-btn-cancel" onClick={() => navigate("/espacehopital/transfert")}>
            Annuler
          </button>
          <button type="submit" className="tp-btn-submit" disabled={saving || loading}>
            {saving ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default NouvelleDemandeTransfert;
