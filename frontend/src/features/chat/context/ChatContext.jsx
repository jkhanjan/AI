import { createContext, useContext, useState, useEffect } from "react";
import { 
  fetchAllChats, 
  createChatDB, 
  fetchChatMessages, 
  saveMessageDB, 
  generateAIResponse,
  deleteChatDB 
} from "../api/api.chat";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]); // Only holds messages for the active chat
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await fetchAllChats();
        setConversations(chats);
        if (chats.length > 0 && !activeId) {
          setActiveId(chats); // Mongoose uses _id
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

      const { message } = await saveMessageDB(currentChatId, text);

      setMessages((prev) => [...(prev || []), { role: "assistant", content: message }]);

    } catch (error) {
      console.error("Error asking AI:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await createChatDB();
      console.log("Full response:", response);
      
      const newChat = response; 
      
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
      loading, 
      askAI,
      createNewChat, 
      deleteConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);