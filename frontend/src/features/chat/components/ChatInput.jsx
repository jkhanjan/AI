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
    await onPdfUpload(file);         // passes file up to parent
    e.target.value = "";             // reset input
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex gap-2 bg-gray-800 rounded-xl p-2 pl-4 items-center"
    >
      {/* Hidden file input */}
      <input
        type="file"
        accept="application/pdf"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* PDF Button — shows status inline */}
      <button
        type="button"
        onClick={() => fileRef.current.click()}
        disabled={pdfStatus === "processing"}
        className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm disabled:opacity-50"
      >
        {pdfStatus === "processing" && "⏳ Processing..."}
        {pdfStatus === "ready"      && "📄 PDF Ready"}
        {!pdfStatus                 && "📎 PDF"}
      </button>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={pdfStatus === "ready" ? "Ask about your PDF..." : "Ask anything..."}
        className="flex-1 text-white bg-transparent outline-none"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={loading || !input.trim() || pdfStatus === "processing"}
        className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}