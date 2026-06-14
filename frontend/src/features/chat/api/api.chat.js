import api from "@/lib/axios";
import { getToken } from "@/lib/auth";

const AI_ROUTE = "/ai/chat";
const HISTORY_ROUTE = "/ai/history/chat";
const PDF_ROUTE = "/ai/pdf";

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

export const streamMessageDB = async (chatId, content) => {
  const baseURL = import.meta.env.VITE_PROD_API_URL;

  const res = await fetch(`${baseURL}/ai/history/chat/${chatId}/message/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stream failed: ${res.status} - ${err}`);
  }

  return res.body.getReader();
};

export const deleteChatDB = async (chatId) => {
  const res = await api.delete(`${HISTORY_ROUTE}/${chatId}`);
  return res.data;
};

export const uploadPdfDB = async (formData, chatId) => {
  const res = await api.post(`${PDF_ROUTE}/upload`, formData, {
    headers: { "Content-Type": undefined }  // removes any global override
  });
  return res.data;
};

export const fetchPdfStatus = async (pdfId) => {
  const res = await api.get(`${PDF_ROUTE}/status/${pdfId}`);
  return res.data;
};