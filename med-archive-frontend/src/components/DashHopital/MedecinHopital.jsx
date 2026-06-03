import React from 'react';
import DynamicDoctorsTable from '../shared/DynamicDoctorsTable.jsx';

const MedecinHopital = () => (
  <DynamicDoctorsTable title="Medecins" useEtablissementScope />
);

export default MedecinHopital;
