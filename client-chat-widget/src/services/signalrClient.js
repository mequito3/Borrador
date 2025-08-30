import * as signalR from "@microsoft/signalr";

let connection = null;

function resolveApiBase() {
  return (typeof window !== 'undefined' && window.CHAT_API_BASE) || (import.meta?.env?.VITE_CHAT_API_BASE) || 'https://borrador-n453.onrender.com/api';
}

function resolveSignalRBase() {
  const explicit = (typeof window !== 'undefined' && window.CHAT_SIGNALR_BASE) || (import.meta?.env?.VITE_CHAT_SIGNALR_BASE);
  const apiBase = resolveApiBase();
  const base = (explicit || apiBase.replace(/\/api$/, '')).replace(/\/$/, '');
  return base;
}

function buildHubUrl(chatSessionId) {
  let base = resolveSignalRBase();
  let url = `${base}/hubs/chat?chatSessionId=${encodeURIComponent(chatSessionId)}`;
  if (url.startsWith('https://')) url = url.replace('https://', 'wss://');
  if (url.startsWith('http://')) url = url.replace('http://', 'ws://');
  return url;
}

export const connectClientToChat = async (chatSessionId, onReceive, onChatClosed = null) => {
  if (connection) return;
  const hubUrl = buildHubUrl(chatSessionId);
  console.log('[signalr] Conectando a', hubUrl);
  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build();

  connection.on('ReceiveMessage', (sessionId, sender, content, timestamp, attachments) => {
    console.log('📩 Mensaje recibido:', { sessionId, sender, content, timestamp, attachments });
    onReceive(sessionId, sender, content, timestamp, attachments);
  });

  connection.on('ChatClosed', (sessionId, message, timestamp) => {
    console.log('🔒 Chat cerrado por soporte:', { sessionId, message, timestamp });
    if (onChatClosed) onChatClosed(sessionId, message, timestamp);
  });

  await connection.start();
  console.log('[signalr] Conectado');
};

export const disconnectClient = async () => {
  if (connection) {
    try { await connection.stop(); } catch (e) { console.warn('[signalr] Error al detener', e); }
    connection = null;
  }
};
