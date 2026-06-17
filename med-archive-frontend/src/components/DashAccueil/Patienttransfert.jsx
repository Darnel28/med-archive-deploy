import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTransfertDossier,
  getCurrentUser,
  getMesPatientsService,
  getServices,
} from "../../api";

function rowsFromPaginated(response) {
  const payload = response?.data ?? response;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function mapPatient(row) {
  const patient = row.patient ?? row;
  return {
    id: patient.id,
    name: row.name || patient.user?.name || "-",
    dossierId: patient.dossier?.id,
    numeroDossier: patient.dossier?.numero_dossier || patient.imu || "-",
    birthDate: row.date_naissance || patient.user?.date_naissance || "",
    sex: row.sexe || patient.user?.sexe || "",
    phone: row.telephone || patient.user?.telephone || "",
    address: row.adresse || patient.user?.adresse || "",
    contactName: patient.personne_contact || "",
    contactPhone: patient.telephone_contact || "",
    currentDoctorName: patient.dossier?.medecin_referent?.user?.name || patient.dossier?.medecin_traitant || "",
    currentDoctorPhone: patient.dossier?.medecin_referent?.user?.telephone || "",
  };
}

const TransfertPatientServiceForm = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    patient_id: "",
    service_destination_id: "",
    motif: "",
    observations: "",
    date_validation: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentService = currentUser?.service;
  const etablissementId = currentService?.etablissement_id || currentUser?.etablissement_id;
  const selectedPatient = useMemo(
    () => patients.find((patient) => String(patient.id) === String(form.patient_id)),
    [patients, form.patient_id]
  );
  const destinationServices = services.filter((service) => String(service.id) !== String(currentService?.id));

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const meResponse = await getCurrentUser();
        const user = meResponse?.data?.user ?? meResponse?.user ?? meResponse;
        const hospitalId = user?.service?.etablissement_id || user?.etablissement_id;

        const [patientsResponse, servicesResponse] = await Promise.all([
          getMesPatientsService({ per_page: 100 }),
          getServices(hospitalId ? { etablissement_id: hospitalId, per_page: 100 } : { per_page: 100 }),
        ]);

        if (ignore) return;

        setCurrentUser(user);
        setPatients(rowsFromPaginated(patientsResponse).map(mapPatient).filter((patient) => patient.dossierId));
        setServices(rowsFromPaginated(servicesResponse));
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || "Impossible de charger les données du transfert.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((state) => ({
      ...state,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!currentService?.id || !etablissementId) {
      setError("Le service connecté est introuvable.");
      setSaving(false);
      return;
    }

    try {
      await createTransfertDossier({
        dossier_id: selectedPatient.dossierId,
        service_source_id: currentService.id,
        service_destination_id: form.service_destination_id,
        etablissement_source_id: etablissementId,
        etablissement_destination_id: etablissementId,
        motif: form.motif,
        observations: [form.observations, form.date_validation ? `Date de validation: ${form.date_validation}` : ""]
          .filter(Boolean)
          .join("\n"),
      });
      setSuccess("Demande de transfert envoyée.");
      setTimeout(() => navigate("/espaceaccueil/transfert"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d’envoyer la demande de transfert.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .tp-page { width: 100%; min-height: 100vh; padding: 20px; background: #f5f7fb; }
        .tp-container { background: white; max-width: 1100px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .tp-form { padding: 2rem; }
        .tp-title { margin-top: 0; color: #0b5e7e; border-bottom: 3px solid #13c3b8; display: inline-block; padding-bottom: 0.5rem; font-size: 1.6rem; }
        .tp-fieldset { border: 1px solid #e0e0e0; border-radius: 8px; margin: 1.5rem 0; padding: 1rem 1.5rem; background: #fefefe; }
        .tp-legend { font-weight: 700; font-size: 1.1rem; padding: 0 0.6rem; color: #1f7b8c; background: white; width: auto; }
        .tp-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
        .tp-field { flex: 1; display: flex; flex-direction: column; font-weight: 500; min-width: 180px; }
        .tp-field label { margin-bottom: 0.25rem; font-size: 0.9rem; color: #2c3e50; }
        .tp-field input, .tp-field select, .tp-field textarea { margin-top: 0.2rem; padding: 0.6rem; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; transition: 0.2s; font-family: inherit; }
        .tp-field input:focus, .tp-field select:focus, .tp-field textarea:focus { outline: none; border-color: #13c3b8; box-shadow: 0 0 0 2px rgba(19,195,184,0.2); }
        .tp-buttons { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem; }
        .tp-btn-submit, .tp-btn-cancel { padding: 0.6rem 1.6rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
        .tp-btn-submit { background: #13c3b8; color: white; }
        .tp-btn-submit:hover { background: #0e9e95; transform: translateY(-1px); }
        .tp-btn-cancel { background: #f1f1f1; color: #333; }
        .tp-alert-error { color: #b42318; margin: 0.75rem 0; }
        .tp-alert-success { color: #027a48; margin: 0.75rem 0; }
        textarea { width: 100%; resize: vertical; }
        @media (max-width: 700px) { .tp-form { padding: 1rem; } .tp-row { flex-direction: column; } }
      `}</style>

      <div className="tp-page">
        <div className="tp-container">
          <form onSubmit={handleSubmit} className="tp-form">
            <h2 className="tp-title">Formulaire de transfert de patient</h2>
            {loading ? <p>Chargement du formulaire...</p> : null}
            {error ? <p className="tp-alert-error">{error}</p> : null}
            {success ? <p className="tp-alert-success">{success}</p> : null}

            <fieldset className="tp-fieldset">
              <legend className="tp-legend">1. Identité du patient</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Patient *</label>
                  <select name="patient_id" value={form.patient_id} onChange={updateField} required>
                    <option value="">Choisir un patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.numeroDossier}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="tp-field">
                  <label>Date de naissance</label>
                  <input type="date" value={selectedPatient?.birthDate?.slice(0, 10) || ""} readOnly />
                </div>
                <div className="tp-field">
                  <label>Sexe</label>
                  <input type="text" value={selectedPatient?.sex || ""} readOnly />
                </div>
              </div>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Téléphone</label>
                  <input type="tel" value={selectedPatient?.phone || ""} readOnly />
                </div>
                <div className="tp-field">
                  <label>Adresse</label>
                  <input type="text" value={selectedPatient?.address || ""} readOnly />
                </div>
              </div>
            </fieldset>

            <fieldset className="tp-fieldset">
              <legend className="tp-legend">2. Provenance et destination</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Service de départ</label>
                  <input type="text" value={currentService?.nom || ""} readOnly />
                </div>
                <div className="tp-field">
                  <label>Médecin actuel</label>
                  <input type="text" value={selectedPatient?.currentDoctorName || ""} readOnly />
                </div>
                <div className="tp-field">
                  <label>Numéro du médecin actuel</label>
                  <input type="tel" value={selectedPatient?.currentDoctorPhone || ""} readOnly />
                </div>
              </div>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Service d'accueil *</label>
                  <select name="service_destination_id" value={form.service_destination_id} onChange={updateField} required>
                    <option value="">Choisir le service</option>
                    {destinationServices.map((service) => (
                      <option key={service.id} value={service.id}>{service.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="tp-fieldset">
              <legend className="tp-legend">3. Personne à prévenir</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Nom et prénom</label>
                  <input type="text" value={selectedPatient?.contactName || ""} readOnly />
                </div>
                <div className="tp-field">
                  <label>Téléphone</label>
                  <input type="tel" value={selectedPatient?.contactPhone || ""} readOnly />
                </div>
              </div>
            </fieldset>

            <fieldset className="tp-fieldset">
              <legend className="tp-legend">4. Motif du transfert</legend>
              <textarea name="motif" rows="4" value={form.motif} onChange={updateField} required />
            </fieldset>

            <fieldset className="tp-fieldset">
              <legend className="tp-legend">5. Résumé de l'observation médicale</legend>
              <textarea name="observations" rows="8" value={form.observations} onChange={updateField} required />
            </fieldset>

            <fieldset className="tp-fieldset">
              <legend className="tp-legend">6. Validation</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Date *</label>
                  <input type="date" name="date_validation" value={form.date_validation} onChange={updateField} required />
                </div>
              </div>
            </fieldset>

            <div className="tp-buttons">
              <button type="button" className="tp-btn-cancel" onClick={() => navigate("/espaceaccueil/transfert")}>Annuler</button>
              <button type="submit" className="tp-btn-submit" disabled={saving || loading}>{saving ? "Envoi..." : "Envoyer"}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TransfertPatientServiceForm;
