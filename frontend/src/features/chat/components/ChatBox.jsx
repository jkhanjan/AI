import { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { cardConfig } from "@/lib/constant";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const { messages, askAI, loading, createNewChat } = useChat();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput("");
    await askAI(text);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderContent = (msg) => {
    if (typeof msg.content !== "object") {
      return (
        <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">
          {msg.content}
        </p>
      );
    }

    const data = msg?.content;

    if (data && (data.idea || data.marketing || data.tech)) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          {cardConfig.map(({ key, label, icon, colors }) =>
            data[key] ? (
              <div
                key={key}
                className={`${colors.bg} ${colors.border} border rounded-xl p-3.5 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-sm`}
              >
                <div className={`flex items-center gap-1.5 ${colors.text}`}>
                  {icon}
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">
                    {label}
                  </span>
                </div>
                <p className="m-0 text-[13px] leading-relaxed text-gray-900">
                  {data[key]}
                </p>
              </div>
            ) : null
          )}
        </div>
      );
    }

    return (
      <pre className="m-0 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
        {JSON.stringify(msg.content, null, 2)}
      </pre>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-400">Chat</h2>

        <button
          onClick={createNewChat}
          className="text-xs px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
        >
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-5 mb-3 bg-gray-800 flex flex-col gap-5">
        
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <p className="text-sm">Ask anything to get started</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                {isUser ? "You" : "AI"}
              </span>

              <div
                className={`
                  px-4 py-3 text-sm leading-relaxed
                  ${isUser 
                    ? "max-w-[85%] sm:max-w-[72%] rounded-[18px_18px_4px_18px] bg-gray-900 text-white" 
                    : "max-w-full rounded-[4px_18px_18px_18px] bg-gray-800 text-gray-900 border border-gray-200"
                  }
                `}
              >
                {renderContent(msg)}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="text-gray-400 text-sm">
            AI is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 bg-gray-800 rounded-xl p-2 pl-4 items-center"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 text-white bg-transparent outline-none"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}