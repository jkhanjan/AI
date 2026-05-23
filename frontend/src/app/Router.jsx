import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signin";
import { ChatProvider } from "@/features/chat/context/ChatContext";
import Dashboard from "@/features/chat/pages/Dashboard";
import Analysis from "@/features/dashboard/pages/Analysis";
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
  },
    {
    path: "/analysis",
    element: (
      <ProtectedRoute>
        <ChatProvider>
           <Analysis />
        </ChatProvider>
      </ProtectedRoute>
    )
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ChatProvider>
           <Login />
        </ChatProvider>
      </ProtectedRoute>
    )
  }
]);