import React from 'react';
import DynamicAppointmentsTable from '../shared/DynamicAppointmentsTable.jsx';

const RendezVousService = () => (
  <DynamicAppointmentsTable title="Rendez-vous medicaux" useEtablissementScope />
);

export default RendezVousService;
