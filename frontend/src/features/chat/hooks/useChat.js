import { useState, useEffect } from "react";
import { sendMessage } from "../api/api.chat";

export const useChat = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("conversations");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem("activeId");
    return saved || null;
  });

  const [loading, setLoading] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages || [];

  const askAI = async (prompt) => {
    setLoading(true);

    let updatedConversations = [...conversations];
    let conversation = updatedConversations.find((c) => c.id === activeId);

    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        title: prompt.slice(0, 30),
        messages: [],
      };
      updatedConversations.push(conversation);
      setActiveId(conversation.id);
    }

    conversation.messages.push({ role: "user", content: prompt });
    setConversations([...updatedConversations]);

    try {
      const res = await sendMessage(prompt, conversation.messages);
      conversation.messages.push({ role: "assistant", content: res.response });
      setConversations([...updatedConversations]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // persist conversations
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // persist activeId separately
  useEffect(() => {
    if (activeId) {
      localStorage.setItem("activeId", activeId);
    } else {
      localStorage.removeItem("activeId");
    }
  }, [activeId]);

  const createNewChat = () => setActiveId(null);

  return {
    messages,
    askAI,
    loading,
    conversations,
    activeId,
    setActiveId,
    createNewChat,
  };
};