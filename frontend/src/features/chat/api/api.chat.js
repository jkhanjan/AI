import api from "@/lib/axios";

export const sendMessage = async (prompt) => {
  const res = await api.post("/ai/chat", { prompt });
  console.log(res,'res')
  return res.data;
};