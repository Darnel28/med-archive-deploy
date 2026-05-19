import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../api";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!getAuthToken()) {
    return <Navigate to="/connexion" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
