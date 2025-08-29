import * as signalR from "@microsoft/signalr";

let connection = null;

export const connectClientToChat = async (
  chatSessionId,
  onReceive,
  onChatClosed = null
) => {
  const base = (typeof window !== 'undefined' && window.CHAT_SIGNALR_BASE) || (import.meta?.env?.VITE_CHAT_SIGNALR_BASE) || 'http://localhost:5000';
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${base}/hubs/chat?chatSessionId=${chatSessionId}`)
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveMessage", (sessionId, sender, content, timestamp, attachments) => {
    console.log("📩 Mensaje recibido:", { sessionId, sender, content, timestamp, attachments });
    onReceive(sessionId, sender, content, timestamp, attachments);
  });

  // Manejar cuando el soporte cierra el chat
  connection.on("ChatClosed", (sessionId, message, timestamp) => {
    console.log("🔒 Chat cerrado por soporte:", { sessionId, message, timestamp });
    if (onChatClosed) {
      onChatClosed(sessionId, message, timestamp);
    }
  });

  await connection.start();
};

export const disconnectClient = async () => {
  if (connection) await connection.stop();
};
