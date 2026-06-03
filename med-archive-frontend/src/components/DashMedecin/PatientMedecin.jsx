import React from 'react';
import DynamicPatientsDirectory from '../shared/DynamicPatientsDirectory.jsx';

const MesPatientsMedecin = () => (
  <DynamicPatientsDirectory title="Mes patients" source="doctor" detailPath="/espacemedecin/votre-patient" />
);

export default MesPatientsMedecin;
