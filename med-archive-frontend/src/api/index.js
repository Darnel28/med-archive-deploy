// export * from "./client";
// export * from "./authApi";
// export * from "./authRoutes";
// export * from "./resourceApi";
// export * from "./userApi";
// export * from "./roleApi";
// export * from "./patientApi";
// export * from "./medecinApi";
// export * from "./dossierApi";
// export * from "./consultationApi";
// export * from "./etablissementApi";
// export * from "./laboratoireApi";
// export * from "./analyseApi";
// export * from "./documentApi";
// export * from "./statistiqueApi";
// export * from "./factureApi";
// export * from "./paiementApi";
// export * from "./serviceApi";
// export * from "./parametreApi";
// export * from "./transfertDossierApi";
export * from "./client";
export * from "./authApi";
export * from "./authRoutes";
export * from "./resourceApi";
export * from "./userApi";
export * from "./roleApi";

// patientApi : exclure getPatients pour éviter le conflit
export {
  createPatient,
  updatePatient,
  deletePatient,
 getPatients,
  // getPatients,  // ← ne pas exporter celle-ci
} from "./patientApi";

// medecinApi : exporter tout, y compris getPatients
export * from "./medecinApi";

// puis les autres
export * from "./dossierApi";
export * from "./consultationApi";
export * from "./etablissementApi";
export * from "./laboratoireApi";
export * from "./analyseApi";
export * from "./documentApi";
export * from "./statistiqueApi";
export * from "./factureApi";
export * from "./paiementApi";
export * from "./serviceApi";
export * from "./parametreApi";
export * from "./transfertDossierApi";