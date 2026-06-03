import React from 'react';
import DynamicPatientsDirectory from '../shared/DynamicPatientsDirectory.jsx';

const PatientHopital = () => (
  <DynamicPatientsDirectory title="Patients" source="etablissement" detailPath="/espaceaccueil/dossier-patient" />
);

export default PatientHopital;
