import React from 'react'

export default function UserMenu() {
  const userEmail = "user@gmail.com"; // replace later from auth

  return (
    <div className="absolute top-4 right-4">
      <div className="px-4 py-2 border rounded-lg">
        {userEmail}
      </div>
    </div>
  );
}
