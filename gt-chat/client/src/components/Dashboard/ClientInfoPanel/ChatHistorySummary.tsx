import { useEffect, useState } from "react";
import { withApi } from "../../../config";

interface Props {
  clientId: string | null;
}

interface ChatSummary {
  chatSessionId: number;
  systemName?: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
}

interface ClientHistory {
  clientId: string;
  clientName?: string;
  totalChats: number;
  lastContact?: string;
  chats: ChatSummary[];
  satisfaction?: number;
}

const ChatHistorySummary = ({ clientId }: Props) => {
  const [history, setHistory] = useState<ClientHistory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
  fetch(withApi(`/chat/client-history/${clientId}`), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setHistory(data))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (!clientId) return null;
  if (loading) return <div>Cargando resumen...</div>;
  if (!history) return <div>No hay historial.</div>;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h4>Resumen de chats</h4>
      <p>
        Último contacto:{" "}
        {history.lastContact
          ? new Date(history.lastContact).toLocaleDateString("es-ES")
          : "-"}
      </p>
      <p>Chats anteriores: {history.totalChats}</p>
      <p>
        Satisfacción:{" "}
        {history.satisfaction
          ? "⭐".repeat(Math.round(history.satisfaction))
          : "No disponible"}
      </p>
    </div>
  );
};

export default ChatHistorySummary;
