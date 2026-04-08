import api from "@/lib/axios";

export const sendMessage = async (prompt, mode) => {
  const res = await api.post("/ai/chat", { prompt, mode });
  return res.data;
};