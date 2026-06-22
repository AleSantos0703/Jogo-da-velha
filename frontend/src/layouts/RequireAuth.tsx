import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../store/useAuthStore";

export default function RequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
}
