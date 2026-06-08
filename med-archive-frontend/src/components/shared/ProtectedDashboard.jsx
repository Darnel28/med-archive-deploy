import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, getAuthUser } from '../../api/client';

function roleName(value) {
  const user = value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || {};
  return String(user?.role?.nom || user?.role?.name || user?.role || '').toLowerCase();
}

function roleMatches(role, allowedRoles) {
  return allowedRoles.some((allowed) => role.includes(allowed.toLowerCase()));
}

export default function ProtectedDashboard({ allowedRoles, children }) {
  const location = useLocation();
  const allowed = getAuthToken() && roleMatches(roleName(getAuthUser()), allowedRoles);
  if (!allowed) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  return children;
}
