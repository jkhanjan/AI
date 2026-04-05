import api from "@/lib/axios";

export const signup = async (data) => {
  return api.post("/auth/signin", data);
};

export const login = async (data) => {
  return api.post("/auth/login", data);
};