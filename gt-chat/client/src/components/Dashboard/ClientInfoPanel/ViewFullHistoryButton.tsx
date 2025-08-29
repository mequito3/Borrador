import React, { useState, useEffect } from "react";
import { withApi } from "../../../config";

interface Props {
  clientId: string;
}

const ViewFullHistoryButton = ({ clientId }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
      <button style={{ padding: "0.5rem 1rem" }} onClick={() => setShow(true)}>
        Ver historial completo
      </button>
      {show && (
        <div
         
          onClick={() => setShow(false)}
        >
          <div
           
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Historial completo</h3>
            <FullClientHistory clientId={clientId} />
            <button
              onClick={() => setShow(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para mostrar el historial completo
const FullClientHistory = ({ clientId }: { clientId: string }) => {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  if (loading) return <div>Cargando...</div>;
  if (!history) return <div>No hay historial.</div>;

  return (
    <div>
      <h4>{history.clientName || history.clientId}</h4>
      <ul>
        {history.chats.map((chat: any) => (
          <li key={chat.chatSessionId} style={{ marginBottom: 12 }}>
            <strong>{chat.systemName || "-"}</strong> |{" "}
            {new Date(chat.startedAt).toLocaleString("es-ES")}
            <br />
            Mensajes: {chat.messageCount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewFullHistoryButton;
