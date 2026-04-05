import React from 'react'

export default function Sidebar() {
  return (
    <div className="w-64 border-r p-4">
      <h2 className="font-semibold mb-4">Chat History</h2>

      <div className="space-y-2">
        <div className="p-2 rounded hover:bg-muted cursor-pointer">
          Chat 1
        </div>

        <div className="p-2 rounded hover:bg-muted cursor-pointer">
          Chat 2
        </div>
      </div>
    </div>
  );
}