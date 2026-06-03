import React from 'react';
import DynamicDoctorsTable from '../shared/DynamicDoctorsTable.jsx';

const MedecinService = () => (
  <DynamicDoctorsTable title="Service Medecins" useEtablissementScope />
);

export default MedecinService;
