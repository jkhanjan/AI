import { setToken } from "@/lib/auth";
import { login, signup } from "../api/auth.api";

export const useAuth = () => {

  const handleLogin = async (data) => {
    try {
      const res = await login(data);
      if(res.data.token) {
        setToken(res.data.token);
      }
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const handleSignup = async (data) => {
    try {
      const res = await signup(data);
        if(res.data.token) {
        setToken(res.data.token);
      }
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  return {
    handleLogin,
    handleSignup,
  };
};