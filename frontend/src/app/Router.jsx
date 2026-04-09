import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signin";
import { ChatProvider } from "@/features/chat/context/ChatContext";
import Dashboard from "@/features/chat/pages/Dashboard";
import ProtectedRoute from "@/hooks/ProtectedRoute";
import { createBrowserRouter } from "react-router-dom";

export const Router = createBrowserRouter([
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/signin",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <ChatProvider>
           <Dashboard />
        </ChatProvider>
      </ProtectedRoute>
    )
  }
]);