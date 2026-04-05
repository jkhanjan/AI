import Cookies from "js-cookie";

export const setToken = (token) => {
  Cookies.set("token", token, { expires: 7 }); 
};

export const getToken = () => {
  return Cookies.get("token");
};

export const logout = () => {
  Cookies.remove("token");
};