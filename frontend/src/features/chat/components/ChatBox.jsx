import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import Message from "./Messages";
import { useChat } from "../context/ChatContext";
import { useTypewriter } from "../hooks/useTypeWriter";

export default function ChatBox() {
  const { activeId, askAI, loading, messages, streamingMessage, uploadPdf, pdfStatus } = useChat();
  const displayText = useTypewriter(streamingMessage, 3);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage, loading, activeId]); 

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

          {messages.length === 0 && !loading && !streamingMessage && (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-2 text-gray-500 text-sm">
              {pdfStatus === "ready"      && <p>📄 PDF ready — ask anything about it</p>}
              {pdfStatus === "processing" && <p>⏳ Processing your PDF...</p>}
              {!pdfStatus                 && <p>Ask anything to get started</p>}
            </div>
          )}

          {messages?.map((msg, index) => (
            <Message key={index} msg={msg} />
          ))}
          {displayText && (
            <Message msg={{ role: "assistant", content: streamingMessage }} />
          )}
          {loading && !streamingMessage && (
            <div className="text-gray-500 text-sm animate-pulse">
              AI is typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <ChatInput
            onSend={askAI}
            onPdfUpload={uploadPdf}
            loading={loading}
            pdfStatus={pdfStatus}
          />
        </div>
      </div>
    </div>
  );
}