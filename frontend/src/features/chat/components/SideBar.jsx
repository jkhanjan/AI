import React, { useState, useRef, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { Trash2 } from "lucide-react";

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 256;

export default function Sidebar() {
  const { 
    conversations, 
    activeId, 
    setActiveId, 
    createNewChat,
    deleteConversation
  } = useChat();

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);

  const startResize = useCallback((e) => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div
      style={{ width, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH }}
      className="relative flex-shrink-0 border-r p-4 flex flex-col"
    >
      <h2 className="font-semibold mb-4">Chat History</h2>

      <button
        onClick={createNewChat}
        className="w-full mb-4 p-2 bg-black text-white rounded hover:bg-gray-800"
      >
        + New Chat
      </button>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveId(chat.id)}
            className={`p-2 rounded cursor-pointer hover:bg-muted bg-gray-800 
              flex justify-between items-center
              ${activeId === chat.id ? "bg-muted" : ""}
            `}
          >
            <span className="truncate">{chat.title}</span>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // VERY IMPORTANT
                deleteConversation(chat.id);
              }}
              className="opacity-60 hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={startResize}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
        style={{ transform: "translateX(50%)", zIndex: 10 }}
      />
    </div>
  );
}