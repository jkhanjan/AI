import { getToken } from "@/lib/auth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
}