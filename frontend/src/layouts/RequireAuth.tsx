import { Navigate, Outlet } from "react-router-dom";
import { useIsAuthenticated } from "../store/useAuthStore";

export default function RequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
