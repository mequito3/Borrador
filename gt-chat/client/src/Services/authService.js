import { API_BASE, withApi } from "../config";

const API = API_BASE || ""; // empty lets caller detect missing config

export const login = async (username, password) => {
  if (!API) throw new Error("API_BASE no configurado (VITE_API_BASE o window.CHAT_API_BASE)");
  const res = await fetch(withApi("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Credenciales inválidas");

  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data.token;
};

export const getToken = () => localStorage.getItem("token");

export const logout = () => localStorage.removeItem("token");

export const parseToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Error al parsear el token:", e);
    return null;
  }
};

export const isTokenExpired = () => {
  const token = getToken();
  const data = parseToken(token);
  if (!data || !data.exp) return false; // si no hay exp asumimos válido
  const now = Math.floor(Date.now() / 1000);
  return data.exp < now;
};

export const ensureValidSession = () => {
  if (isTokenExpired()) {
    logout();
    return false;
  }
  return true;
};
