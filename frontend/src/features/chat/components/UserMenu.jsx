import { useAuthContext } from "@/context/AuthContext";
import React from "react";

export default function UserMenu() {
  const { user, logout } = useAuthContext();

  return (
    <div className="flex items-center justify-between w-full">
      <span className="truncate text-sm">
        {user?.email}
      </span>

      <button
        onClick={logout}
        className="text-sm text-red-500 hover:text-red-400"
      >
        Logout
      </button>
    </div>
  );
}