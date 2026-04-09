import { useState, useRef } from "react";

export default function ChatInput({ onSend, loading }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("single");
  const inputRef = useRef(null);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const text = input;
    setInput("");
    

    await onSend({
      text,
      mode
    });
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex gap-2 bg-gray-800 rounded-xl p-2 pl-4 items-center"
    >
      {/* Dropdown */}
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="bg-gray-900 text-white text-sm px-2 py-2 rounded-lg outline-none"
      >
        <option value="single">Single Model</option>
        <option value="multi">Multi Model</option>
      </select>

      {/* Input */}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
        className="flex-1 text-white bg-transparent outline-none"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}