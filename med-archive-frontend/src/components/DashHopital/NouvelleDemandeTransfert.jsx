import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTransfertDossier,
  getCurrentUser,
  getMesPatientsEtablissement,
  getServices,
  getUsers,
  listMedecins,
} from "../../api";
import "../../assets/css/TransfertHopitalForm.css";

function rowsFromPaginated(response) {
  const payload = response?.data ?? response;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function patientFromHospitalRow(row) {
  const patient = row.patient ?? row;
  return {
    id: patient.id,
    name: row.name || patient.user?.name || "-",
    dossierId: patient.dossier?.id,
    numeroDossier: patient.dossier?.numero_dossier || patient.dossier?.imu || "-",
    birthDate: row.date_naissance || patient.user?.date_naissance || "",
    phone: row.telephone || patient.user?.telephone || "",
    sex: row.sexe || patient.user?.sexe || "",
  };
}

const NouvelleDemandeTransfert = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [sourceServices, setSourceServices] = useState([]);
  const [destinationServices, setDestinationServices] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [form, setForm] = useState({
    patient_id: "",
    service_source_id: "",
    etablissement_destination_id: "",
    service_destination_id: "",
    medecin_traitant_id: "",
    motif: "",
    observations: "",
    date_souhaitee: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

        const [patientsResponse, servicesResponse, usersResponse, medecinsResponse] = await Promise.all([
          getMesPatientsEtablissement({ per_page: 100 }),
          getServices({ per_page: 100 }),
          getUsers({ role: "Responsable Etablissement", statut: "actif", per_page: 100 }),
          listMedecins(etablissementId ? { etablissement_id: etablissementId, per_page: 100 } : { per_page: 100 }),
        ]);

        if (ignore) return;

        const hospitalRows = rowsFromPaginated(usersResponse).filter((item) => item.id !== etablissementId);
        setCurrentUser(user);
        setPatients(rowsFromPaginated(patientsResponse).map(patientFromHospitalRow).filter((patient) => patient.dossierId));
        setSourceServices(rowsFromPaginated(servicesResponse));
        setHopitaux(hospitalRows);
        setMedecins(rowsFromPaginated(medecinsResponse));
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Impossible de charger les données du formulaire.");
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
    let ignore = false;

    async function loadDestinationServices() {
      if (!form.etablissement_destination_id) {
        setDestinationServices([]);
        setForm((state) => ({ ...state, service_destination_id: "" }));
        return;
      }

      try {
        const response = await getServices({
          etablissement_id: form.etablissement_destination_id,
          per_page: 100,
        });
        if (!ignore) setDestinationServices(rowsFromPaginated(response));
      } catch (err) {
        if (!ignore) {
          setDestinationServices([]);
          setError(err.response?.data?.message || "Impossible de charger les services de l’hôpital d’accueil.");
        }
      }
    }

    loadDestinationServices();
    return () => {
      ignore = true;
    };
  }, [form.etablissement_destination_id]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((state) => ({
      ...state,
      [name]: value,
      ...(name === "etablissement_destination_id" ? { service_destination_id: "" } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createTransfertDossier({
        dossier_id: selectedPatient.dossierId,
        service_source_id: form.service_source_id,
        service_destination_id: form.service_destination_id,
        etablissement_source_id: currentUser.id,
        etablissement_destination_id: form.etablissement_destination_id,
        medecin_traitant_id: form.medecin_traitant_id || null,
        motif: form.motif,
        observations: [form.observations, form.date_souhaitee ? `Date souhaitée: ${form.date_souhaitee}` : ""]
          .filter(Boolean)
          .join("\n"),
      });
      setSuccess("Demande de transfert envoyée.");
      setTimeout(() => navigate("/espacehopital/transfert"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d’envoyer la demande de transfert.");
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
          <p>Renseignez le dossier patient, le médecin traitant et le service d’accueil demandé.</p>
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
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.numeroDossier}
                  </option>
                ))}
              </select>
            </label>
            <label className="hopital-transfer-form-field">
              <span>Date de naissance</span>
              <input type="date" value={selectedPatient?.birthDate?.slice(0, 10) || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Téléphone</span>
              <input type="tel" value={selectedPatient?.phone || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Sexe</span>
              <input type="text" value={selectedPatient?.sex || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Numéro de dossier</span>
              <input type="text" value={selectedPatient?.numeroDossier || ""} readOnly />
            </label>
          </div>
        </section>

        <section className="hopital-transfer-form-section">
          <h2>II. Informations médicales</h2>
          <div className="hopital-transfer-form-grid">
            <label className="hopital-transfer-form-field">
              <span>Hôpital d'origine</span>
              <input type="text" value={currentUser?.name || ""} readOnly />
            </label>
            <label className="hopital-transfer-form-field">
              <span>Service de départ</span>
              <select name="service_source_id" value={form.service_source_id} onChange={updateField} required>
                <option value="">Choisir le service</option>
                {sourceServices.map((service) => (
                  <option key={service.id} value={service.id}>{service.nom}</option>
                ))}
              </select>
            </label>
            <label className="hopital-transfer-form-field">
              <span>Médecin traitant</span>
              <select name="medecin_traitant_id" value={form.medecin_traitant_id} onChange={updateField} required>
                <option value="">Choisir un médecin</option>
                {medecins.map((medecin) => (
                  <option key={medecin.id} value={medecin.id}>
                    {medecin.user?.name || medecin.nom || `Médecin #${medecin.id}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
              <span>Motif du transfert</span>
              <textarea name="motif" rows="4" value={form.motif} onChange={updateField} required />
            </label>
            <label className="hopital-transfer-form-field hopital-transfer-form-field-wide">
              <span>Résumé de l'état actuel et soins prodigués</span>
              <textarea name="observations" rows="4" value={form.observations} onChange={updateField} />
            </label>
          </div>
        </section>

        <section className="hopital-transfer-form-section">
          <h2>III. Demande de transfert</h2>
          <div className="hopital-transfer-form-grid">
            <label className="hopital-transfer-form-field">
              <span>Hôpital d'accueil souhaité</span>
              <select name="etablissement_destination_id" value={form.etablissement_destination_id} onChange={updateField} required>
                <option value="">Choisir l'hôpital</option>
                {hopitaux.map((hopital) => (
                  <option key={hopital.id} value={hopital.id}>{hopital.name}</option>
                ))}
              </select>
            </label>
            <label className="hopital-transfer-form-field">
              <span>Service d'accueil souhaité</span>
              <select name="service_destination_id" value={form.service_destination_id} onChange={updateField} required disabled={!form.etablissement_destination_id}>
                <option value="">Choisir le service</option>
                {destinationServices.map((service) => (
                  <option key={service.id} value={service.id}>{service.nom}</option>
                ))}
              </select>
            </label>
            <label className="hopital-transfer-form-field">
              <span>Date souhaitée</span>
              <input type="date" name="date_souhaitee" value={form.date_souhaitee} onChange={updateField} />
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
