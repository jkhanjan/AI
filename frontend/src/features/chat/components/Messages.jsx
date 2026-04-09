import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cardConfig } from "@/lib/constant";

export default function Message({ msg }) {
  const isUser = msg.role === "user";

  // 👇 View state
  const [view, setView] = useState("horizontal"); // horizontal | vertical

  const renderContent = () => {
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
        <div className="flex flex-col gap-2">
          
          {/* 👇 Toggle Buttons */}
          <div className="flex gap-2 self-end">
            <button
              onClick={() => setView("horizontal")}
              className={`text-xs px-2 py-1 rounded-md border ${
                view === "horizontal"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400"
              }`}
            >
              Horizontal
            </button>

            <button
              onClick={() => setView("vertical")}
              className={`text-xs px-2 py-1 rounded-md border ${
                view === "vertical"
                  ? "bg-gray-700 text-white"
                  : "bg-transparent text-gray-400"
              }`}
            >
              Vertical
            </button>
          </div>
          <div
            className={`
              ${
                view === "horizontal"
                  ? "flex gap-4"
                  : "flex flex-col gap-3"
              } 
              text-gray-200
            `}
          >
            {cardConfig.map(({ key, label, icon, colors }) =>
              data[key] ? (
                <div
                  key={key}
                  className={`${colors.bg} ${colors.border} border-[1px] rounded-xl p-3.5 flex flex-col gap-2 transition-shadow duration-200 hover:shadow-sm`}
                >
                  <div
                    className={`flex items-center gap-2.5 ${colors.text}`}
                  >
                    {icon}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">
                      {label}
                    </span>
                  </div>

                  <div className="text-sm whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {data[key]}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null
            )}
          </div>
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
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
        {isUser ? "You" : "AI"}
      </span>

      <div
        className={`
          px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "max-w-[85%] sm:max-w-[72%] rounded-[18px_18px_4px_18px] bg-gray-900 text-white"
              : "max-w-full rounded-[4px_18px_18px_18px] bg-gray-800 text-gray-200 border border-gray-700"
          }
        `}
      >
        {renderContent()}
      </div>
    </div>
  );
}