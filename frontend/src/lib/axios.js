import axios from "axios";
import { getToken } from "./auth";

const BASE_URL = import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_LOCAL_API_URL;
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;