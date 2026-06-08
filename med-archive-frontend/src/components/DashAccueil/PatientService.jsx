import React from 'react';
import DynamicPatientsDirectory from '../shared/DynamicPatientsDirectory.jsx';

const PatientService = () => (
  <DynamicPatientsDirectory title="Patients du service" source="service" detailPath="/espaceaccueil/dossier-patient" />
);

export default PatientService;
