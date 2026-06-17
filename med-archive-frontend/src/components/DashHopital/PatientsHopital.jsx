import React from 'react';
import DynamicPatientsDirectory from '../shared/DynamicPatientsDirectory.jsx';

const PatientHopital = () => (
  <DynamicPatientsDirectory title="Patients" source="etablissement" detailPath="/espacehopital/dossier-patient" />
);

export default PatientHopital;
