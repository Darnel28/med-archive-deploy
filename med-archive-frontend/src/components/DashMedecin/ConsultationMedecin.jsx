import { useEffect, useState } from 'react';
import { getAuthUser } from '../../api/client';
import { getConsultation, updateConsultation } from '../../api/consultationApi';
import { getLaboratoires } from '../../api/laboratoireApi';

const emptyForm = {
  patientNom: '',
  patientNpi: '',
  patientSexe: '',
  patientNaissance: '',
  patientDossier: '',

  consultDate: '',
  consultHeure: '',

  consultMedecin: getAuthUser()?.user?.name ||
    getAuthUser()?.name ||
    '',

  consultHopital: '',
  consultType: 'Nouvelle consultation',
  consultProchainRdv: '',

  motifDetails: '',
  tension: '',
  temperature: '',
  poids: '',
  taille: '',
  frequenceCardiaque: '',
  saturationOxygene: '',
  glycemie: '',
  autresObs: '',

  diagnostic: '',
  notesMedicales: '',
  statut: 'en_cours',

  examens: {
    analyseSang: false,
    radiographie: false,
    scanner: false,
    testLabo: false,
  },

  prescriptions: [
    {
      medicament: '',
      dosage: '',
      duree: '',
      frequence: '',
    },
  ],
};

function dateParts(value) {
  if (!value) return { date: '', time: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  return { date: date.toISOString().slice(0, 10), time: date.toTimeString().slice(0, 5) };
}

function ageLabel(value) {
  if (!value) return '';
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return value;
  const age = Math.floor((Date.now() - birth.getTime()) / 31557600000);
  return `${birth.toLocaleDateString('fr-FR')} - ${age} ans`;
}

function textValue(...values) {
  return values.find((value) => typeof value === 'string' && value.trim()) || '';
}

function rowsFromPaginated(response) {
  const payload = response?.data ?? response;
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function toDateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function prescriptionRowsFromOrdonnance(ordonnance) {
  const source = ordonnance || {};
  const medicaments = Array.isArray(source.medicaments) ? source.medicaments : (source.medicaments ? [source.medicaments] : []);
  const posologies = Array.isArray(source.posologie) ? source.posologie : (source.posologie ? [source.posologie] : []);
  const validites = Array.isArray(source.date_validite) ? source.date_validite : (source.date_validite ? [source.date_validite] : []);
  const instructions = Array.isArray(source.instructions) ? source.instructions : (source.instructions ? [source.instructions] : []);

  const maxLength = Math.max(medicaments.length, posologies.length, validites.length, instructions.length);

  if (maxLength === 0) {
    return emptyForm.prescriptions;
  }

  return Array.from({ length: maxLength }, (_, index) => ({
    medicament: medicaments[index] || '',
    dosage: posologies[index] || '',
    duree: toDateInputValue(validites[index]),
    frequence: instructions[index] || '',
  }));
}

function buildOrdonnancePayload(prescriptions) {
  const ordonnances = prescriptions.reduce((accumulator, row) => {
    const medicament = String(row.medicament || '').trim();
    const posologie = String(row.dosage || '').trim();
    const dateValidite = toDateInputValue(row.duree);
    const instructions = String(row.frequence || '').trim();

    if (medicament || posologie || dateValidite || instructions) {
      accumulator.medicaments.push(medicament);
      if (posologie) accumulator.posologie.push(posologie);
      if (dateValidite) accumulator.date_validite.push(dateValidite);
      if (instructions) accumulator.instructions.push(instructions);
    }

    return accumulator;
  }, {
    medicaments: [],
    posologie: [],
    date_validite: [],
    instructions: [],
  });

  if (ordonnances.medicaments.length === 0) {
    return null;
  }

  const dateValidite = ordonnances.date_validite[0] || '';

  return {
    medicaments: ordonnances.medicaments,
    posologie: ordonnances.posologie.join(' | '),
    date_validite: dateValidite,
    instructions: ordonnances.instructions.join(' | '),
  };
}

const examenLabels = {
  analyseSang: 'Analyse de sang',
  radiographie: 'Radiographie',
  scanner: 'Scanner',
  testLabo: 'Test laboratoire',
};

function formFromConsultation(item) {
  const patient = item?.dossier?.patient;
  const patientUser = patient?.user;
  const doctor = typeof item?.medecin === 'object' ? item.medecin : null;
  const auth = getAuthUser()?.user || getAuthUser() || {};
  const authDoctor = auth?.medecin || {};
  const establishment = doctor?.etablissement || authDoctor?.etablissement || auth?.etablissement || {};
  const flat = item || {};
  const parts = dateParts(flat.date_consultation);
  return {
    ...emptyForm,
    patientNom: flat.patient || patientUser?.name || '',
    patientNpi: flat.patient_npi || flat.patient_imu || patient?.npi || patient?.imu || '',
    patientSexe: flat.patient_sexe || patientUser?.sexe || '',
    patientNaissance: ageLabel(flat.patient_date_naissance || patientUser?.date_naissance),
    patientDossier: flat.numero_dossier || item?.dossier?.numero_dossier || '',
    consultDate: parts.date,
    consultHeure: flat.heure || parts.time,
    consultMedecin: textValue(
      typeof flat.medecin === 'string' ? flat.medecin : '',
      doctor?.user?.name,
      auth?.name,
    ),
    consultHopital: textValue(
      typeof flat.hopital === 'string' ? flat.hopital : '',
      establishment?.name,
      establishment?.nom,
      establishment?.user?.name,
    ),
    motifDetails: flat.motif || '',
    diagnostic: flat.diagnostic || '',
    notesMedicales: flat.observations || '',
    statut: flat.statut || 'en_cours',
    prescriptions: prescriptionRowsFromOrdonnance(flat.ordonnance),
  };
}

export default function ConsultationMedecin() {
  const [consultationId, setConsultationId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const getCurrentDateTime = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
};

useEffect(() => {
    setFormData(current => ({
        ...current,
        consultProchainRdv: getCurrentDateTime()
    }));
}, []);
  const [laboratoires, setLaboratoires] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  
  const handleExamenCheckbox = (e) => {
    const { name, checked } = e.target;

    setFormData((current) => ({
      ...current,
      examens: {
        ...current.examens,
        [name]: checked,
      },
    }));
  };

  useEffect(() => {
    let active = true;
    async function load() {
      const stored = JSON.parse(sessionStorage.getItem('active_consultation') || 'null');
      if (!stored) {
        setMessage('Commencez un rendez-vous pour ouvrir et préremplir sa fiche de consultation.');
        return;
      }
      setConsultationId(stored.id);
      setFormData(formFromConsultation(stored));
      try {
        const response = await getConsultation(stored.id);
        if (active) {
          const detailedForm = formFromConsultation(response?.data || response);
          setFormData((current) => ({
            ...current,
            ...detailedForm,
            patientNom: detailedForm.patientNom || current.patientNom,
            patientNpi: detailedForm.patientNpi || current.patientNpi,
            patientSexe: detailedForm.patientSexe || current.patientSexe,
            patientNaissance: detailedForm.patientNaissance || current.patientNaissance,
            patientDossier: detailedForm.patientDossier || current.patientDossier,
            consultMedecin: detailedForm.consultMedecin || current.consultMedecin,
            consultHopital: detailedForm.consultHopital || current.consultHopital,
          }));
        }
      } catch {
        // Les données du planning suffisent pour permettre la saisie.
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getLaboratoires({ per_page: 100 })
      .then((response) => {
        if (active) setLaboratoires(rowsFromPaginated(response));
      })
      .catch(() => {
        if (active) setLaboratoires([]);
      });
    return () => { active = false; };
  }, []);

  const change = (key, value) => setFormData((current) => ({ ...current, [key]: value }));
  const changePrescription = (index, key, value) => setFormData((current) => ({
    ...current,
    prescriptions: current.prescriptions.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row),
  }));
  const resetForm = () => {
    const auth = getAuthUser()?.user || getAuthUser() || {};

    setFormData({
      ...emptyForm,
      consultMedecin: auth?.name || '',
    });

    setConsultationId(null);
    sessionStorage.removeItem('active_consultation');
  };

  const save = async (event) => {
    event.preventDefault();

    if (!consultationId) return;

    setSaving(true);
    setMessage('');

    try {
      const selectedExamens = Object.entries(formData.examens)
        .filter(([, checked]) => checked)
        .map(([key]) => ({
          laboratoire_id: laboratoires[0]?.id,
          type_analyse: examenLabels[key],
          date_prelevement: new Date().toISOString().slice(0, 10),
          commentaires: `Demande creee depuis la consultation `,
        }));

      if (selectedExamens.length > 0 && !laboratoires[0]?.id) {
        throw new Error("Aucun laboratoire disponible pour creer les demandes d'examens.");
      }

      const ordonnance = buildOrdonnancePayload(formData.prescriptions);
      const payload = {
        diagnostic: formData.diagnostic,
        observations: formData.notesMedicales || formData.autresObs,
        statut: 'termine',
        prochain_rdv: formData.consultProchainRdv || null,
        constantes: {
          tension_arterielle: formData.tension || null,
          temperature: formData.temperature || null,
          poids: formData.poids || null,
          taille: formData.taille || null,
          frequence_cardiaque: formData.frequenceCardiaque || null,
          saturation_oxygene: formData.saturationOxygene || null,
          glycemie: formData.glycemie || null,
        },
        analyses: selectedExamens,
      };

      if (ordonnance) {
        payload.ordonnance = ordonnance;
      }

      await updateConsultation(consultationId, payload);

      resetForm();

      setMessage('Consultation terminée avec succès.');
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
        error.message ||
        "Erreur lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="content page-tight sheet-wrap">
      <section className="medical-sheet">
        <div className="sheet-top">
          <div className="sheet-brand"><strong>{formData.consultHopital || 'MedArchive Medical Clinic'}</strong><span>Fiche médical numérique</span></div>
          <div className="sheet-date">{formData.consultDate ? new Date(`${formData.consultDate}T00:00:00`).toLocaleDateString('fr-FR') : ''}</div>
        </div>
        <form className="sheet-form" onSubmit={save}>
          <h1 className="sheet-title">Fiche de consultation médicale</h1>
          <section className="sheet-section">
            <h3>1. Informations du patient</h3>
            <div className="line-grid">
              {[['patientNom', 'Nom et prénom'], ['patientNpi', 'NPI / IMU'], ['patientSexe', 'Sexe'], ['patientNaissance', 'Date de naissance / âge'], ['patientDossier', 'Numéro de dossier médical']].map(([key, label]) => (
                <div className="line-field" key={key}><label>{label}</label><input value={formData[key]} readOnly /></div>
              ))}
            </div>
          </section>
          <section className="sheet-section">
            <h3>2. Informations sur la consultation</h3>
            <div className="line-grid three">
              <div className="line-field"><label>Date de la consultation</label><input type="date" value={formData.consultDate} readOnly /></div>
              <div className="line-field"><label>Heure</label><input type="time" value={formData.consultHeure} readOnly /></div>
              <div className="line-field"><label>Médecin responsable</label><input value={formData.consultMedecin} readOnly /></div>
              <div className="line-field"><label>Hôpital / établissement</label><input value={formData.consultHopital} readOnly /></div>
              <div className="line-field"><label>Type de consultation</label><select value={formData.consultType} onChange={(e) => change('consultType', e.target.value)}><option>Nouvelle consultation</option><option>Suivi</option><option>Urgence</option></select></div>
              <div className="line-field"><label>Prochain RDV</label><input type="datetime-local" value={formData.consultProchainRdv} onChange={(e) => change('consultProchainRdv', e.target.value)} /></div>
            </div>
          </section>
          <section className="sheet-section">
            <h3>3. Motif de consultation</h3>
            <div className="line-field"><label>Détails du motif</label><textarea value={formData.motifDetails} onChange={(e) => change('motifDetails', e.target.value)} /></div>
          </section>
          <section className="sheet-section">
            <h3>4. Symptômes et observations</h3>
            <div className="line-grid three">
              <div className="line-field"><label>Tension artérielle</label><input value={formData.tension} onChange={(e) => change('tension', e.target.value)} /></div>
              <div className="line-field"><label>Température</label><input value={formData.temperature} onChange={(e) => change('temperature', e.target.value)} /></div>
              <div className="line-field"><label>Poids (kg)</label><input type="number" step="0.1" value={formData.poids} onChange={(e) => change('poids', e.target.value)} /></div>
              <div className="line-field"><label>Taille (cm)</label><input type="number" value={formData.taille} onChange={(e) => change('taille', e.target.value)} /></div>
              <div className="line-field"><label>Frequence cardiaque</label><input type="number" value={formData.frequenceCardiaque} onChange={(e) => change('frequenceCardiaque', e.target.value)} /></div>
              <div className="line-field"><label>Saturation oxygene (%)</label><input type="number" step="0.1" value={formData.saturationOxygene} onChange={(e) => change('saturationOxygene', e.target.value)} /></div>
              <div className="line-field"><label>Glycemie</label><input type="number" step="0.1" value={formData.glycemie} onChange={(e) => change('glycemie', e.target.value)} /></div>
              <div className="line-field"><label>Autres observations</label><input value={formData.autresObs} onChange={(e) => change('autresObs', e.target.value)} /></div>
            </div>
          </section>
          <section className="sheet-section">
            <h3>5. Diagnostic</h3>
            <div className="line-field"><label>Conclusion médicale</label><textarea value={formData.diagnostic} onChange={(e) => change('diagnostic', e.target.value)} /></div>
          </section>
          <section className="sheet-section">
            <div className="section-title-row"><h3>6. Prescription (ordonnance)</h3><button className="btn-add-row" type="button" onClick={() => change('prescriptions', [...formData.prescriptions, { medicament: '', dosage: '', duree: '', frequence: '' }])}>+</button></div>
            <div className="rx-table-wrap"><table className="rx-table"><thead><tr><th>Nom du médicament</th><th>Posologie</th><th>Date de validité</th><th>Fréquence</th></tr></thead><tbody>
              {formData.prescriptions.map((row, index) => <tr key={index}>{['medicament', 'dosage', 'duree', 'frequence'].map((key) => <td key={key}><input type={key === 'duree' ? 'date' : 'text'}  value={row[key]} onChange={(e) => changePrescription(index, key, e.target.value)} /></td>)}</tr>)}
            </tbody></table></div>
          </section>
          <section className="sheet-section">
            <h3>7. Examens demandés (si nécessaire)</h3>

            <div className="check-row">
              <label>
                <input
                  type="checkbox"
                  name="analyseSang"
                  checked={formData.examens.analyseSang}
                  onChange={handleExamenCheckbox}
                />
                Analyse de sang
              </label>

              <label>
                <input
                  type="checkbox"
                  name="radiographie"
                  checked={formData.examens.radiographie}
                  onChange={handleExamenCheckbox}
                />
                Radiographie
              </label>

              <label>
                <input
                  type="checkbox"
                  name="scanner"
                  checked={formData.examens.scanner}
                  onChange={handleExamenCheckbox}
                />
                Scanner
              </label>

              <label>
                <input
                  type="checkbox"
                  name="testLabo"
                  checked={formData.examens.testLabo}
                  onChange={handleExamenCheckbox}
                />
                Test laboratoire
              </label>
            </div>
          </section>
          <section className="sheet-section">
            <h3>8. Notes médicales</h3>
            <div className="line-field"><label>Commentaires du médecin</label><textarea value={formData.notesMedicales} onChange={(e) => change('notesMedicales', e.target.value)} /></div>
          </section>
          <div className="sheet-actions"><button className="btn-validate" type="submit" disabled={!consultationId || saving}><i className="fa-solid fa-check"></i> {saving ? 'Enregistrement...' : 'Valider'}</button></div>
          {message && <p className="sheet-result" style={{ display: 'block' }}>{message}</p>}
        </form>
      </section>
    </main>
  );
}
