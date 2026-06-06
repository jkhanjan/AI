import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import Message from "./Messages";
import { useChat } from "../context/ChatContext";

export default function ChatBox() {
  const { activeId, askAI, loading, messages, uploadPdf, pdfStatus } = useChat();
  const bottomRef = useRef(null);                

  // Auto-scroll logic
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, activeId]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-8xl mx-auto">

      <div className="flex-1 overflow-y-auto rounded-2xl p-5 mb-3 bg-black flex flex-col gap-5 m-10 relative">

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            {/* hint changes based on pdf state */}
            {pdfStatus === "ready"      && <p className="text-sm">📄 PDF ready — ask anything about it</p>}
            {pdfStatus === "processing" && <p className="text-sm">⏳ Processing your PDF...</p>}
            {!pdfStatus                 && <p className="text-sm">Ask anything to get started</p>}
          </div>
        )}

        {messages?.map((msg, index) => (
          <Message key={index} msg={msg} />
        ))}

        {loading && (
          <div className="text-gray-400 text-sm animate-pulse">
            AI is typing...
          </div>
        )}

        <div ref={bottomRef} />

         <div className="absolute bottom-0 w-full left-0">
            <ChatInput
            onSend={askAI}
            onPdfUpload={uploadPdf}   // ← add
            loading={loading}
            pdfStatus={pdfStatus}
          />
         </div>
      </div>

    </div>
  );
}