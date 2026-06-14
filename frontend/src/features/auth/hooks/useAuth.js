import { useAuthContext } from "@/context/AuthContext";
import { login, signup } from "../api/auth.api";

export const useAuth = () => {
  const { login: saveAuth } = useAuthContext();

  const handleLogin = async (data) => {
    try {
      const res = await login(data);

      saveAuth(
        res.data.token,
        res.data.user
      );

      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const handleSignup = async (data) => {
    try {
      const res = await signup(data);

      saveAuth(
        res.data.token,
        res.data.user
      );

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