export const DASHBOARD_ROUTES = {
  admin: "/espaceadmin",
  patient: "/espacepatient",
  medecin: "/espacemedecin",
  accueil: "/espaceaccueil",
  examen: "/espaceexamen",
  hopital: "/espacehopital",
};

export function getDashboardPathForUser(user) {
  const role = String(user?.role?.nom || user?.role || "").toLowerCase();

  if (role.includes("super admin") || role.includes("admin regional") || role === "administrateur") {
    return DASHBOARD_ROUTES.admin;
  }

  if (role.includes("patient")) {
    return DASHBOARD_ROUTES.patient;
  }

  if (role.includes("medecin")) {
    return DASHBOARD_ROUTES.medecin;
  }

  if (role.includes("laborantin") || role.includes("laboratoire")) {
    return DASHBOARD_ROUTES.examen;
  }

  if (role.includes("service") || role.includes("accueil") || role.includes("caisse")) {
    return DASHBOARD_ROUTES.accueil;
  }

  if (role.includes("etablissement") || role.includes("hopital") || role.includes("hôpital")) {
    return DASHBOARD_ROUTES.hopital;
  }

  return DASHBOARD_ROUTES.patient;
}
