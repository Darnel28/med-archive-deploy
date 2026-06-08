import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const TransfertPatientServiceForm = ({ onTransfer, onCancel }) => {
      const navigate = useNavigate();
  // États
  const [identite, setIdentite] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: '',
    adresse: '',
  });
  const [provenanceDestination, setProvenanceDestination] = useState({
    serviceDepart: '',
    serviceAccueil: '',
  });
  const [coordonneesUrgence, setCoordonneesUrgence] = useState({
    nomPrenom: '',
    lien: '',
    telephone: '',
    adresse: '',
  });
  const [motifTransfert, setMotifTransfert] = useState('');
  const [observationMedicale, setObservationMedicale] = useState('');
  const [medecinDemandeur, setMedecinDemandeur] = useState('');
  const [dateValidation, setDateValidation] = useState('');
  const handleCancel = () => {
  navigate("/espaceaccueil/transfert");
};

  // Handlers
  const handleIdentiteChange = (e) => {
    const { name, value } = e.target;
    setIdentite((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvenanceChange = (e) => {
    const { name, value } = e.target;
    setProvenanceDestination((prev) => ({ ...prev, [name]: value }));
  };

  const handleUrgenceChange = (e) => {
    const { name, value } = e.target;
    setCoordonneesUrgence((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transferData = {
      identite,
      provenanceDestination,
      coordonneesUrgence,
      motifTransfert,
      observationMedicale,
      medecinDemandeur,
      dateValidation,
    };
    if (onTransfer) onTransfer(transferData);
    else console.log('Transfert data:', transferData);
  };

//   const handleCancel = () => {
//     if (onCancel) onCancel();
//     else {
//       setIdentite({ nom: '', prenom: '', dateNaissance: '', sexe: '', adresse: '' });
//       setProvenanceDestination({ serviceDepart: '', serviceAccueil: '' });
//       setCoordonneesUrgence({ nomPrenom: '', lien: '', telephone: '', adresse: '' });
//       setMotifTransfert('');
//       setObservationMedicale('');
//       setMedecinDemandeur('');
//       setDateValidation('');
//     }
//   };

  return (
    <>
      <style>{`
        /* Overlay */
       .tp-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: #f5f7fb;
}
      .tp-container {
  background: white;
  max-width: 1100px;
  margin: 0 auto;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,.08);
}
        .tp-form {
          padding: 2rem;
        }
        .tp-title {
          margin-top: 0;
          color: #0b5e7e;
          border-bottom: 3px solid #13c3b8;
          display: inline-block;
          padding-bottom: 0.5rem;
          font-size: 1.6rem;
        }
        .tp-fieldset {
          border: 1px solid #e0e0e0;
          border-radius: 16px;
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          background: #fefefe;
        }
        .tp-legend {
          font-weight: 700;
          font-size: 1.1rem;
          padding: 0 0.6rem;
          color: #1f7b8c;
          background: white;
          width: auto;
        }
        .tp-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .tp-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          font-weight: 500;
          min-width: 180px;
        }
        .tp-field label {
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
          color: #2c3e50;
        }
        .tp-field input, .tp-field select, .tp-field textarea {
          margin-top: 0.2rem;
          padding: 0.6rem;
          border: 1px solid #ccc;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: 0.2s;
          font-family: inherit;
        }
        .tp-field input:focus, .tp-field select:focus, .tp-field textarea:focus {
          outline: none;
          border-color: #13c3b8;
          box-shadow: 0 0 0 2px rgba(19,195,184,0.2);
        }
        .tp-radio-group {
          flex-direction: row !important;
          align-items: center;
          gap: 1rem;
        }
        .tp-radio-group label {
          flex-direction: row;
          align-items: center;
          gap: 0.3rem;
          font-weight: normal;
          margin-right: 1rem;
        }
        textarea {
          width: 100%;
          resize: vertical;
        }
        .tp-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          border-top: 1px solid #eee;
          padding-top: 1.5rem;
        }
        .tp-btn-submit, .tp-btn-cancel {
          padding: 0.6rem 1.6rem;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          font-size: 0.9rem;
        }
        .tp-btn-submit {
          background: #13c3b8;
          color: white;
        }
        .tp-btn-submit:hover {
          background: #0e9e95;
          transform: translateY(-1px);
        }
        .tp-btn-cancel {
          background: #f1f1f1;
          color: #333;
        }
        .tp-btn-cancel:hover {
          background: #e2e2e2;
        }
        @media (max-width: 700px) {
          .tp-form { padding: 1rem; }
          .tp-row { flex-direction: column; }
        }
      `}</style>

      <div className="tp-page">
        <div className="tp-container">
          <form onSubmit={handleSubmit} className="tp-form">
            <h2 className="tp-title"> FORMULAIRE DE TRANSFERT DE PATIENT</h2>

            {/* 1. Identité */}
            <fieldset className="tp-fieldset">
              <legend className="tp-legend">1. Identité du patient</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Nom *</label>
                  <input type="text" name="nom" value={identite.nom} onChange={handleIdentiteChange} required />
                </div>
                <div className="tp-field">
                  <label>Prénom(s) *</label>
                  <input type="text" name="prenom" value={identite.prenom} onChange={handleIdentiteChange} required />
                </div>
              </div>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Date de naissance *</label>
                  <input type="date" name="dateNaissance" value={identite.dateNaissance} onChange={handleIdentiteChange} required />
                </div>
                <div className="tp-field tp-radio-group">
                  <label>Sexe :</label>
                  <label><input type="radio" name="sexe" value="Masculin" checked={identite.sexe === 'Masculin'} onChange={handleIdentiteChange} /> Masculin</label>
                  <label><input type="radio" name="sexe" value="Féminin" checked={identite.sexe === 'Féminin'} onChange={handleIdentiteChange} /> Féminin</label>
                </div>
              </div>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={identite.adresse} onChange={handleIdentiteChange} placeholder="Rue, code postal, ville" />
                </div>
              </div>
            </fieldset>

            {/* 2. Provenance / destination */}
            <fieldset className="tp-fieldset">
              <legend className="tp-legend">2. Provenance et destination</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Service de départ *</label>
                  <input type="text" name="serviceDepart" value={provenanceDestination.serviceDepart} onChange={handleProvenanceChange} required />
                </div>
                <div className="tp-field">
                  <label>Service d'accueil *</label>
                  <input type="text" name="serviceAccueil" value={provenanceDestination.serviceAccueil} onChange={handleProvenanceChange} required />
                </div>
              </div>
            </fieldset>

            {/* 3. Urgence */}
            <fieldset className="tp-fieldset">
              <legend className="tp-legend">3. Personne à prévenir en cas d'urgence</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Nom et prénom</label>
                  <input type="text" name="nomPrenom" value={coordonneesUrgence.nomPrenom} onChange={handleUrgenceChange} />
                </div>
                <div className="tp-field">
                  <label>Lien avec le patient</label>
                  <input type="text" name="lien" value={coordonneesUrgence.lien} onChange={handleUrgenceChange} />
                </div>
              </div>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Téléphone</label>
                  <input type="tel" name="telephone" value={coordonneesUrgence.telephone} onChange={handleUrgenceChange} />
                </div>
                <div className="tp-field">
                  <label>Adresse</label>
                  <input type="text" name="adresse" value={coordonneesUrgence.adresse} onChange={handleUrgenceChange} />
                </div>
              </div>
            </fieldset>

            {/* 4. Motif */}
            <fieldset className="tp-fieldset">
              <legend className="tp-legend">4. Motif du transfert</legend>
              <textarea rows="4" value={motifTransfert} onChange={(e) => setMotifTransfert(e.target.value)} placeholder="Raison médicale du transfert..." required />
            </fieldset>

            {/* 5. Résumé médical */}
            <fieldset className="tp-fieldset">
              <legend className="tp-legend">5. Résumé de l'observation médicale</legend>
              <textarea rows="8" value={observationMedicale} onChange={(e) => setObservationMedicale(e.target.value)} placeholder="Antécédents, examens, traitements, constantes..." required />
            </fieldset>

            {/* 6. Validation */}
            <fieldset className="tp-fieldset">
              <legend className="tp-legend">6. Validation</legend>
              <div className="tp-row">
                <div className="tp-field">
                  <label>Médecin demandeur *</label>
                  <input type="text" value={medecinDemandeur} onChange={(e) => setMedecinDemandeur(e.target.value)} required />
                </div>
                <div className="tp-field">
                  <label>Date *</label>
                  <input type="date" value={dateValidation} onChange={(e) => setDateValidation(e.target.value)} required />
                </div>
              </div>
            </fieldset>

            <div className="tp-buttons">
              <button type="button" className="tp-btn-cancel" onClick={handleCancel}>Annuler</button>
              <button type="submit" className="tp-btn-submit">Envoyer</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TransfertPatientServiceForm;