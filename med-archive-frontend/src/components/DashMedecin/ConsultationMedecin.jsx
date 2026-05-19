import React, { useState } from 'react';

const ConsultationMedecin = () => {
  // État principal du formulaire
  const [formData, setFormData] = useState({
    // Patient
    patientNom: "Jean A.",
    patientNpi: "NPI-2026-000184",
    patientSexe: "Masculin",
    patientNaissance: "18/06/1981 - 45 ans",
    patientDossier: "DM-45-2026-0092",
    // Consultation
    consultDate: "2026-03-12",
    consultHeure: "09:00",
    consultMedecin: "Dr. Alice",
    consultHopital: "MedArchive Clinic",
    consultType: "Suivi",
    consultProchainRdv: "2026-03-19T09:30",
    // Motif
    motifCheckboxes: {
      fievre: false,
      douleurAbdominale: false,
      suiviMedical: true,
      resultatExamen: false,
    },
    motifDetails: "Patient venu pour suivi apres episode febrile.",
    // Symptômes
    symptCheckboxes: {
      fievre: true,
      fatigue: true,
      mauxTete: false,
    },
    tension: "12/8",
    temperature: "38.2 C",
    autresObs: "Etat general stable",
    // Diagnostic
    diagnostic: "Paludisme simple, sans complication",
    // Ordonnance (liste dynamique de médicaments)
    prescriptions: [
      { medicament: "Paracetamol", dosage: "500 mg", duree: "3 jours", frequence: "3 fois/jour" },
      { medicament: "Artemether", dosage: "80 mg", duree: "3 jours", frequence: "2 fois/jour" },
    ],
    // Examens demandés
    examens: {
      analyseSang: true,
      radiographie: false,
      scanner: false,
      testLabo: false,
    },
    // Notes
    notesMedicales: "Patient a revoir dans 7 jours pour controle clinique.",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Gestion des champs texte / select / date / time
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Gestion des checkboxes de motif
  const handleMotifCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      motifCheckboxes: { ...prev.motifCheckboxes, [name]: checked }
    }));
  };

  // Gestion des checkboxes de symptômes
  const handleSymptCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      symptCheckboxes: { ...prev.symptCheckboxes, [name]: checked }
    }));
  };

  // Gestion des checkboxes d'examens
  const handleExamenCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      examens: { ...prev.examens, [name]: checked }
    }));
  };

  // Gestion des champs de l'ordonnance (tableau dynamique)
  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...formData.prescriptions];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, prescriptions: updated }));
  };

  // Ajout d'une nouvelle ligne dans l'ordonnance
  const addPrescriptionRow = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { medicament: "", dosage: "", duree: "", frequence: "" }]
    }));
  };

  // Suppression d'une ligne (optionnel)
  const removePrescriptionRow = (index) => {
    const updated = [...formData.prescriptions];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, prescriptions: updated }));
  };

  // Validation du formulaire (simulation d'enregistrement)
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // cache le message après 3 secondes
    // Ici, vous pouvez envoyer les données à une API
    console.log("Données de consultation :", formData);
  };

  return (
    <main className="content page-tight sheet-wrap">
      <section className="medical-sheet">
        <div className="sheet-top">
          <div className="sheet-brand">
            <strong>MedArchive Medical Clinic</strong>
            <span>123 AnyWhere St, Cotonou</span>
          </div>
          <div className="sheet-date">12 Mars 2026</div>
        </div>

        <form className="sheet-form" onSubmit={handleSubmit}>
          <h1 className="sheet-title">Fiche de consultation medicale</h1>

          {/* 1. Informations du patient */}
          <section className="sheet-section">
            <h3>1. Informations du patient</h3>
            <div className="line-grid">
              <div className="line-field">
                <label htmlFor="patientNom">Nom et prénom</label>
                <input type="text" id="patientNom" value={formData.patientNom} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="patientNpi">NPI</label>
                <input type="text" id="patientNpi" value={formData.patientNpi} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="patientSexe">Sexe</label>
                <select id="patientSexe" value={formData.patientSexe} onChange={handleInputChange}>
                  <option>Masculin</option>
                  <option>Féminin</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="line-field">
                <label htmlFor="patientNaissance">Date de naissance / âge</label>
                <input type="text" id="patientNaissance" value={formData.patientNaissance} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="patientDossier">Numéro de dossier médical</label>
                <input type="text" id="patientDossier" value={formData.patientDossier} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* 2. Informations sur la consultation */}
          <section className="sheet-section">
            <h3>2. Informations sur la consultation</h3>
            <div className="line-grid three">
              <div className="line-field">
                <label htmlFor="consultDate">Date de la consultation</label>
                <input type="date" id="consultDate" value={formData.consultDate} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="consultHeure">Heure</label>
                <input type="time" id="consultHeure" value={formData.consultHeure} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="consultMedecin">Médecin responsable</label>
                <input type="text" id="consultMedecin" value={formData.consultMedecin} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="consultHopital">Hôpital / établissement</label>
                <input type="text" id="consultHopital" value={formData.consultHopital} onChange={handleInputChange} />
              </div>
              <div className="line-field">
                <label htmlFor="consultType">Type de consultation</label>
                <select id="consultType" value={formData.consultType} onChange={handleInputChange}>
                  <option>Nouvelle consultation</option>
                  <option>Suivi</option>
                  <option>Urgence</option>
                </select>
              </div>
              <div className="line-field">
                <label htmlFor="consultProchainRdv">Prochain RDV</label>
                <input type="datetime-local" id="consultProchainRdv" value={formData.consultProchainRdv} onChange={handleInputChange} />
              </div>
            </div>
          </section>

          {/* 3. Motif de consultation */}
          <section className="sheet-section">
            <h3>3. Motif de consultation</h3>
            <div className="check-row">
              <label><input type="checkbox" name="fievre" checked={formData.motifCheckboxes.fievre} onChange={handleMotifCheckbox} /> Fièvre</label>
              <label><input type="checkbox" name="douleurAbdominale" checked={formData.motifCheckboxes.douleurAbdominale} onChange={handleMotifCheckbox} /> Douleur abdominale</label>
              <label><input type="checkbox" name="suiviMedical" checked={formData.motifCheckboxes.suiviMedical} onChange={handleMotifCheckbox} /> Suivi médical</label>
              <label><input type="checkbox" name="resultatExamen" checked={formData.motifCheckboxes.resultatExamen} onChange={handleMotifCheckbox} /> Résultat d'examen</label>
            </div>
            <div className="line-field">
              <label htmlFor="consultMotif">Détails du motif</label>
              <textarea id="consultMotif" value={formData.motifDetails} onChange={(e) => setFormData(prev => ({ ...prev, motifDetails: e.target.value }))}></textarea>
            </div>
          </section>

          {/* 4. Symptômes et observations */}
          <section className="sheet-section">
            <h3>4. Symptômes et observations</h3>
            <div className="check-row">
              <label><input type="checkbox" name="fievre" checked={formData.symptCheckboxes.fievre} onChange={handleSymptCheckbox} /> Fièvre</label>
              <label><input type="checkbox" name="fatigue" checked={formData.symptCheckboxes.fatigue} onChange={handleSymptCheckbox} /> Fatigue</label>
              <label><input type="checkbox" name="mauxTete" checked={formData.symptCheckboxes.mauxTete} onChange={handleSymptCheckbox} /> Maux de tête</label>
            </div>
            <div className="line-grid three">
              <div className="line-field">
                <label htmlFor="obsTension">Tension artérielle</label>
                <input type="text" id="obsTension" value={formData.tension} onChange={(e) => setFormData(prev => ({ ...prev, tension: e.target.value }))} />
              </div>
              <div className="line-field">
                <label htmlFor="obsTemperature">Température</label>
                <input type="text" id="obsTemperature" value={formData.temperature} onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))} />
              </div>
              <div className="line-field">
                <label htmlFor="obsAutres">Autres observations</label>
                <input type="text" id="obsAutres" value={formData.autresObs} onChange={(e) => setFormData(prev => ({ ...prev, autresObs: e.target.value }))} />
              </div>
            </div>
          </section>

          {/* 5. Diagnostic */}
          <section className="sheet-section">
            <h3>5. Diagnostic</h3>
            <div className="line-field">
              <label htmlFor="consultDiagnostic">Conclusion médicale</label>
              <input type="text" id="consultDiagnostic" value={formData.diagnostic} onChange={(e) => setFormData(prev => ({ ...prev, diagnostic: e.target.value }))} />
            </div>
          </section>

          {/* 6. Prescription (ordonnance) */}
          <section className="sheet-section">
            <div className="section-title-row">
              <h3>6. Prescription (ordonnance)</h3>
              <button className="btn-add-row" type="button" onClick={addPrescriptionRow} aria-label="Ajouter un médicament">
                +
              </button>
            </div>
            <div className="rx-table-wrap">
              <table className="rx-table">
                <thead>
                  <tr>
                    <th>Nom du médicament</th>
                    <th>Dosage</th>
                    <th>Durée du traitement</th>
                    <th>Fréquence</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.prescriptions.map((med, idx) => (
                    <tr key={idx}>
                      <td><input type="text" value={med.medicament} onChange={(e) => handlePrescriptionChange(idx, 'medicament', e.target.value)} /></td>
                      <td><input type="text" value={med.dosage} onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)} /></td>
                      <td><input type="text" value={med.duree} onChange={(e) => handlePrescriptionChange(idx, 'duree', e.target.value)} /></td>
                      <td><input type="text" value={med.frequence} onChange={(e) => handlePrescriptionChange(idx, 'frequence', e.target.value)} /></td>
                      <td>
                        <button type="button" className="btn-add-row" style={{ background: '#f0d6d6', color: '#b33' }} onClick={() => removePrescriptionRow(idx)}>✖</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Examens demandés */}
          <section className="sheet-section">
            <h3>7. Examens demandés (si nécessaire)</h3>
            <div className="check-row">
              <label><input type="checkbox" name="analyseSang" checked={formData.examens.analyseSang} onChange={handleExamenCheckbox} /> Analyse de sang</label>
              <label><input type="checkbox" name="radiographie" checked={formData.examens.radiographie} onChange={handleExamenCheckbox} /> Radiographie</label>
              <label><input type="checkbox" name="scanner" checked={formData.examens.scanner} onChange={handleExamenCheckbox} /> Scanner</label>
              <label><input type="checkbox" name="testLabo" checked={formData.examens.testLabo} onChange={handleExamenCheckbox} /> Test laboratoire</label>
            </div>
          </section>

          {/* 8. Notes médicales */}
          <section className="sheet-section">
            <h3>8. Notes médicales</h3>
            <div className="line-field">
              <label htmlFor="consultNotes">Commentaires du médecin</label>
              <textarea id="consultNotes" value={formData.notesMedicales} onChange={(e) => setFormData(prev => ({ ...prev, notesMedicales: e.target.value }))}></textarea>
            </div>
          </section>

          <div className="sheet-actions">
            <button className="btn-validate" type="submit"><i className="fa-solid fa-check"></i> Valider</button>
          </div>
          {showSuccess && (
            <p className="sheet-result" style={{ display: 'block' }}>
              <i className="fa-solid fa-circle-check"></i> Consultation enregistrée avec succès.
            </p>
          )}
        </form>
      </section>
    </main>
  );
};

export default ConsultationMedecin;