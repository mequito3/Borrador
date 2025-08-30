// Obtiene dinámicamente la base del API (se evalúa en cada llamada para permitir cambios en runtime)
const resolveApiBase = (override) => {
  if (override) return override.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.CHAT_API_BASE) return window.CHAT_API_BASE.replace(/\/$/, '');
  if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_CHAT_API_BASE) return import.meta.env.VITE_CHAT_API_BASE.replace(/\/$/, '');
  return 'https://borrador-n453.onrender.com/api';
};

/**
 * Inicia una sesión de chat.
 * @returns {Promise<{ id?: string, status: number, error?: string }>}
 */
export const startChatSession = async (clientId, systemCode, clientName, apiBaseOverride) => {
  const API = resolveApiBase(apiBaseOverride);
  try {
    const res = await fetch(`${API}/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, systemCode, clientName: clientName ?? "" }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { status: res.status, error: txt || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { status: 200, id: String(data.id) };
  } catch (e) {
    return { status: 0, error: e?.message || 'Network error' };
  }
};

export const sendClientMessage = async (chatSessionId, content, systemOriginId, apiBaseOverride) => {
  const API = resolveApiBase(apiBaseOverride);
  return fetch(`${API}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatSessionId, sender: "client", content, systemOriginId }),
  });
};

export { resolveApiBase };
