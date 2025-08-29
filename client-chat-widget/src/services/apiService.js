// Permite configurar la URL base vía variable global window.CHAT_API_BASE, env Vite o fallback local
const API = (typeof window !== 'undefined' && window.CHAT_API_BASE) || import.meta?.env?.VITE_CHAT_API_BASE || "http://localhost:5000/api";

export const startChatSession = async (clientId, systemCode, clientName) => {
  const res = await fetch(`${API}/chat/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, systemCode, clientName: clientName ?? "" }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.id;
};

export const sendClientMessage = async (chatSessionId, content, systemOriginId) => {
  await fetch(`${API}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatSessionId, sender: "client", content, systemOriginId }),
  });
};
