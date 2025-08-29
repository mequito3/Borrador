import "../../../styles/ClientInfoPanel.css";
import { useEffect, useState } from "react";
import { withApi } from "../../../config";
import ChatHistorySummary from "./ChatHistorySummary";
import ViewFullHistoryButton from "./ViewFullHistoryButton";
import ClientDetails from "./ClientDetails";

interface Props {
  sessionId: number | null;
  clientId: string | null;
  sessions?: any[]; // Para buscar el clientId
}

const ClientInfoPanel = ({ sessionId, clientId, sessions = [] }: Props) => {
  // Si no viene el clientId, lo buscamos por sessionId
  let realClientId = clientId;
  let clientData: any = null;
  if (!realClientId && sessionId && sessions.length > 0) {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      realClientId = found.clientId;
      clientData = found;
    }
  } else if (realClientId && sessions.length > 0) {
    clientData = sessions.find((s) => s.clientId === realClientId);
  }

  // Estado para puntaje y recomendaciones
  const [score, setScore] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (!realClientId) return;
    // Obtener puntaje de satisfacción
  fetch(withApi(`/Chat/client-history/${realClientId}`), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.satisfaction === "number") {
          setScore(data.satisfaction);
        }
        // Ejemplo de recomendaciones simples
        if (data && data.totalChats > 5) {
          setRecommendations([
            "Cliente frecuente: ofrecer atención preferencial.",
            "Revisar historial para anticipar necesidades.",
          ]);
        } else if (data && data.totalChats <= 1) {
          setRecommendations([
            "Cliente nuevo: brindar bienvenida cálida.",
            "Explicar funcionalidades clave del sistema.",
          ]);
        } else {
          setRecommendations(["Atención estándar recomendada."]);
        }
      });
  }, [realClientId]);

  if (!sessionId || !realClientId) {
    return (
      <aside className="client-info-panel">
        <p className="empty-info">Selecciona un chat para ver información del cliente</p>
      </aside>
    );
  }

  return (
    <aside className="client-info-panel">
      <h3>Información del Cliente</h3>
      <div className="client-section">
        <ClientDetails
          clientName={clientData?.clientName}
          email={clientData?.email}
          company={clientData?.company}
          system={clientData?.systemName}
          clientId={clientData?.clientId}
          phone={clientData?.phone}
          address={clientData?.address}
          createdAt={clientData?.createdAt}
        />
        <div >
          <strong>Puntaje de Cliente:</strong>{" "}
          {score !== null ? (
            <span
              
            >
              {"⭐".repeat(Math.round(score))}{" "}
              <span >
                ({score.toFixed(1)})
              </span>
            </span>
          ) : (
            <span >No disponible</span>
          )}
        </div>
        <div>
          <strong>Recomendaciones:</strong>
          <ul>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
      <ChatHistorySummary clientId={realClientId} />
    </aside>
  );
};

export default ClientInfoPanel;
