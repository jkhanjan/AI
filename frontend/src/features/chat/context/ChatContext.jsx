import { createContext, useContext, useState, useEffect } from "react";
import { sendMessage } from "../api/api.chat";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("conversations");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeId, setActiveId] = useState(() => {
    return localStorage.getItem("activeId") || null;
  });

  const [loading, setLoading] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages || [];

  const askAI = async ({ text, mode }) => {
    setLoading(true);
    let conversation = conversations.find((c) => c.id === activeId);

    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        title: text.slice(0, 30), // 👈 fix here
        messages: [],
      };
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
    }

    const userMessage = { role: "user", content: text }; // 👈 fix here
    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === conversation.id
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    try {
      const res = await sendMessage(text, mode); // 👈 fix here
      const aiMessage = { role: "assistant", content: res.response };

      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === conversation.id
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
    };
    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
  };

  const deleteConversation = (id) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeId === id) {
      setActiveId(updated[0]?.id || null);
    }
  };

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeId) localStorage.setItem("activeId", activeId);
    else localStorage.removeItem("activeId");
  }, [activeId]);

  return (
    <ChatContext.Provider value={{
      conversations, activeId, setActiveId,
      messages, loading, askAI,
      createNewChat, deleteConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);