export const DASHBOARD_ROUTES = {
  patient: "/espacepatient",
  medecin: "/espacemedecin",
  accueil: "/espaceaccueil",
  examen: "/espaceexamen",
  hopital: "/espacehopital",
};

export function getRoleName(user) {
  return user?.role?.nom || user?.role || "";
}

export function getDashboardPathForUser(user) {
  const role = getRoleName(user).toLowerCase();

  if (role.includes("patient")) {
    return DASHBOARD_ROUTES.patient;
  }

  if (role.includes("medecin")) {
    return DASHBOARD_ROUTES.medecin;
  }

  if (role.includes("laborantin") || role.includes("laboratoire")) {
    return DASHBOARD_ROUTES.examen;
  }

  if (role.includes("accueil") || role.includes("caisse")) {
    return DASHBOARD_ROUTES.accueil;
  }

  if (role.includes("etablissement")) {
    return DASHBOARD_ROUTES.hopital;
  }

  if (role.includes("admin")) {
    return DASHBOARD_ROUTES.hopital;
  }

  return DASHBOARD_ROUTES.patient;
}
