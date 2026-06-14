import { createContext, useContext, useState, useEffect } from "react";
import { 
  fetchAllChats, 
  createChatDB, 
  fetchChatMessages, 
  streamMessageDB,  
  uploadPdfDB,
  fetchPdfStatus,
  deleteChatDB 
} from "../api/api.chat";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState(null);
  
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await fetchAllChats();
        setConversations(chats);
        if (chats.length > 0 && !activeId) {
          setActiveId(chats);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
      }
    };
    loadChats();
  }, [conversations.length]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeId) return setMessages([]);
      try {
        const dbMessages = await fetchChatMessages(activeId);
        setMessages(dbMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    loadMessages();
  }, [activeId]);

  useEffect(() => {
    setPdfStatus(null);
  }, [activeId]);

  const askAI = async ({ text, mode }) => {
    setLoading(true);
    try {
      let currentChatId = activeId;

      if (!currentChatId) {
        const newChat = await createChatDB();
        currentChatId = newChat._id;
        setConversations((prev) => [...(prev || []), newChat]);
        setActiveId(currentChatId);
      }

      setMessages((prev) => [...(prev || []), { role: "user", content: text }]);

      const reader = await streamMessageDB(currentChatId, text);
      const decoder = new TextDecoder();
      let fullReply = '';

      setStreamingMessage('');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });

        const lines = raw.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const payload = line.replace('data: ', '').trim();

          if (payload === '[DONE]') {
            setMessages((prev) => [...(prev || []), { role: "assistant", content: fullReply }]);
            setStreamingMessage('');
            break;
          }

          try {
            const { token } = JSON.parse(payload);
            if (token) {
              fullReply += token;
              setStreamingMessage(fullReply);
            }
          } catch (_) {}
        }
      }

    } catch (error) {
      console.error("Error asking AI:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPdf = async (file) => {
    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("chatId", activeId);

    setPdfStatus("processing");

    try {
      const data = await uploadPdfDB(formData, activeId);

      const poll = setInterval(async () => {
        const statusData = await fetchPdfStatus(data.pdfId);

        if (statusData.pdf.status === "ready") {
          setPdfStatus("ready");
          clearInterval(poll);
        }

        if (statusData.pdf.status === "failed") {
          setPdfStatus(null);
          clearInterval(poll);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      setPdfStatus(null);
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await createChatDB();
      setConversations((prev) => [newChat, ...(Array.isArray(prev) ? prev : [])]);
      setActiveId(newChat._id);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await deleteChatDB(id);
      const updated = conversations.filter((c) => c._id !== id);
      setConversations(updated);
      if (activeId === id) {
        setActiveId(updated.length > 0 ? updated[0]._id : null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };
  
  return (
    <ChatContext.Provider value={{
      conversations,
      activeId,
      setActiveId,
      messages,
      streamingMessage,
      loading,
      askAI,
      uploadPdf,
      pdfStatus,
      createNewChat,
      deleteConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);