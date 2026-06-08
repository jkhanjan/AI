import React, { useState, useRef, useCallback, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
import UserMenu from "./UserMenu";

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 240;

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
  style={{ width, minWidth: MIN_WIDTH, maxWidth: '100%' }}
  className={`relative w-[100%] flex-shrink-0 border-r p-4 flex flex-col h-full`}
>
  <button
    onClick={createNewChat}
    className="w-full mb-4 p-2 text-white rounded hover:bg-gray-800"
  >
    + New Chat
  </button>

  {/* Chat history */}
  <div className="flex-1 w-full overflow-y-auto space-y-2 min-h-0">
    {conversations?.data?.map((chat) => (
      <div
        key={chat._id}
        onClick={() => setActiveId(chat._id)}
        className={`p-2 rounded cursor-pointer hover:bg-gray-700 bg-black
          flex justify-between items-center
          ${activeId === chat._id ? "bg-muted" : ""}
        `}
      >
        <span className="truncate">{chat.title}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteConversation(chat._id);
          }}
          className="opacity-60 hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ))}
  </div>

  {/* Bottom section */}
  <div className="mt-auto pt-4 border-t">
    <UserMenu />
  </div>

  <div
    onMouseDown={startResize}
    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500 transition-colors"
    style={{ transform: "translateX(50%)", zIndex: 10 }}
  />
</div>
  );
}