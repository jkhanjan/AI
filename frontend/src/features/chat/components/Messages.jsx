export default function Message({ msg }) {
  const isUser = msg.role === "user";

  const renderContent = () => {
    if (typeof msg.content !== "object") {
      return (
        <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-[0.9rem] font-light">
          {msg.content}
        </p>
      );
    }

    const data = msg?.content;

    return (
      <pre className="m-0 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
        {JSON.stringify(msg.content, null, 2)}
      </pre>
    );
  };

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
        {isUser ? "" : "AI"}
      </span>

      <div
        className={`
          px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? " flex-shrink-0 px-3.5 py-1.5 rounded-[9px] text-sm text-white bg-white/[0.12] border border-white/20"
              : "max-w-full rounded-[4px_18px_18px_18px] bg-gray-800 text-gray-200 border border-gray-700"
          }
        `}
      >
        {renderContent()}
      </div>
    </div>
  );
}