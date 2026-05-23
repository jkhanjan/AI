import api from "@/lib/axios";

const AI_ROUTE = "/ai/chat";
const HISTORY_ROUTE = "/ai/history/chat";

export const generateAIResponse = async (prompt, mode) => {
  const res = await api.post(AI_ROUTE, { prompt, mode });
  return res.data;
};

export const fetchAllChats = async () => {
  const res = await api.get(HISTORY_ROUTE);
  return res.data;
};

export const createChatDB = async () => {
  const res = await api.post(HISTORY_ROUTE);
  return res.data;
};

export const fetchChatMessages = async (chatId) => {
  const res = await api.get(`${HISTORY_ROUTE}/${chatId}/messages`);
  return res.data;
};

export const saveMessageDB = async (chatId, content) => {
  const res = await api.post(`${HISTORY_ROUTE}/${chatId}/message`, { content });
  return res.data;
};

export const deleteChatDB = async (chatId) => {
  const res = await api.delete(`${HISTORY_ROUTE}/${chatId}`);
  return res.data;
};