import * as signalR from "@microsoft/signalr";
import { getToken } from "./authService";
import { SIGNALR_BASE, withSignalR } from "../config";

let connection = null;
let globalConnection = null;

/**
 * Conecta al agente a una sesión de chat específica.
 */
export const connectAgentToChat = async (chatSessionId, onMessageReceived) => {
  if (connection) {
    await connection.stop();
  }

  const base = SIGNALR_BASE || "";
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${base}/hubs/chat?chatSessionId=${chatSessionId}`, {
      accessTokenFactory: () => getToken() || "",
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveMessage", (sessionId, sender, content, sentAt, attachments) => {
    if (sessionId === chatSessionId) {
      console.log("📩 Mensaje recibido por SignalR (agente):", { sessionId, sender, content, sentAt, attachments });
      onMessageReceived({ sender, content, sentAt, attachments: attachments || [] });
    }
  });

  try {
    await connection.start();
    console.log("✅ Conectado a sesión:", chatSessionId);
  } catch (err) {
    console.error("❌ Error al conectar a sesión:", err);
  }
};

/**
 * Conecta al agente a notificaciones globales de cualquier mensaje.
 */
export const connectToGlobalNotifications = async (onMessageReceived) => {
  if (globalConnection) return;

  const base = SIGNALR_BASE || "";
  globalConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${base}/hubs/chat`, {
      accessTokenFactory: () => getToken() || "",
    })
    .withAutomaticReconnect()
    .build();

  globalConnection.on("ReceiveMessage", (sessionId, sender, content, sentAt) => {
    onMessageReceived({ sessionId, sender, content, sentAt });
  });

  try {
    await globalConnection.start();
    console.log("🔄 Conexión global establecida");
  } catch (err) {
    console.error("❌ Error conexión global:", err);
  }
};

/**
 * Detiene la conexión individual.
 */
export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log("🔌 Conexión de sesión detenida");
    } catch (err) {
      console.error("❌ Error al detener sesión:", err);
    }
  }
};
