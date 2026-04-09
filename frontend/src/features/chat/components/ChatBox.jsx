import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import Message from "./Messages";
import { useChat } from "../context/ChatContext";

export default function ChatBox() {
  const { conversations, activeId, askAI, loading } = useChat();
  const bottomRef = useRef(null);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages || [];

  // Auto-scroll logic
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, activeId]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-8xl mx-auto">
      
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-5 mb-3 bg-gray-900 flex flex-col gap-5">
        
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <p className="text-sm">Ask anything to get started</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <Message key={index} msg={msg} />
        ))}

        {loading && (
          <div className="text-gray-400 text-sm animate-pulse">
            AI is typing...
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={askAI} loading={loading} />
      
    </div>
  );
}