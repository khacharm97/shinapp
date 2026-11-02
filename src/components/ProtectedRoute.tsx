import { Navigate, Outlet, useLocation } from "react-router-dom";
import { rememberReturnTo } from "@/lib/return-to";

interface ProtectedRouteProps {
  redirectPath?: string;
}

export default function ProtectedRoute({ redirectPath = "/login" }: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  if (!token) {
    // Remember the page so logging in sends the visitor back to it.
    rememberReturnTo(location.pathname + location.search);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
