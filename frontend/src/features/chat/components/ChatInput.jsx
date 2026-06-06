import { useState, useRef } from "react";

export default function ChatInput({ onSend, onPdfUpload, loading, pdfStatus }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("single");
  const fileRef = useRef(null);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput("");
    await onSend({ text, mode });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await onPdfUpload(file);
    e.target.value = "";
  };

  return (
    <form onSubmit={handleSend} className="w-full px-4 py-2">
      <div
        className="
          flex items-center gap-2
          px-2 py-1.5 rounded-[14px]
          bg-white/[0.06] border border-white/[0.12]
          transition-all duration-200
          focus-within:bg-white/10 focus-within:border-white/25
          focus-within:ring-[3px] focus-within:ring-white/5
        "
      >
        <input
          type="file"
          accept="application/pdf"
          ref={fileRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={pdfStatus === "processing"}
          className="
            flex-shrink-0 px-3 py-1.5 rounded-[9px] text-sm
            bg-white/[0.08] border border-white/[0.15] text-white/75
            hover:bg-white/[0.14] disabled:opacity-40
            transition-colors duration-150
          "
        >
          {pdfStatus === "processing" && "⏳ Processing..."}
          {pdfStatus === "ready"      && "📄 PDF Ready"}
          {!pdfStatus                 && "📎 PDF"}
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pdfStatus === "ready" ? "Ask about your PDF..." : "Ask anything..."}
          className="
            flex-1 bg-transparent border-none outline-none
            text-white text-sm placeholder:text-white/35
            px-1 py-1.5 caret-white
          "
        />

        <button
          type="submit"
          disabled={loading || !input.trim() || pdfStatus === "processing"}
          className="
            flex-shrink-0 px-3.5 py-1.5 rounded-[9px] text-sm text-white
            bg-white/[0.12] border border-white/20
            hover:bg-white/20 disabled:opacity-35
            transition-colors duration-150
          "
        >
          Send
        </button>
      </div>
    </form>
  );
}