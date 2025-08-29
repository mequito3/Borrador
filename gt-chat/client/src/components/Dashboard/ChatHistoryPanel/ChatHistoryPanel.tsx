import { useEffect, useState } from "react";
import { withApi } from "../../../config";
import ChatItem from "../ChatListPanel/ChatItem";
import ChatWindow from "../ChatWindow/ChatWindow";
import ClientInfoPanel from "../ClientInfoPanel/ClientInfoPanel";
import ClosedChatModal from "./ClosedChatModal";
import "../../../styles/ChatListPanel.css";
import "../../../styles/ChatWindow.css";
import "../../../styles/ChatHistoryPanel.css";

interface ClosedSession {
  id: number;
  clientName: string;
  systemName: string;
  closedAt: string;
  lastMessage?: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  sentAt: string;
}

const API = withApi(""); // base indicator

const ChatHistoryPanel = () => {
  const [sessions, setSessions] = useState<ClosedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ClosedSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesBySession, setMessagesBySession] = useState<Record<number, Message[]>>({});
  const [search, setSearch] = useState("");
  const [showClosedModal, setShowClosedModal] = useState(false);

  useEffect(() => {
    const fetchClosedSessions = async () => {
      try {
  const res = await fetch(withApi(`/chat/closed-sessions`), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!res.ok) throw new Error("Error cargando sesiones cerradas");
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error("❌", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClosedSessions();
  }, []);

  const handleSelectSession = async (session: ClosedSession) => {
    setSelectedSession(session);
    setShowClosedModal(true);
    setLoadingMessages(true);
    try {
  const res = await fetch(withApi(`/chat/${session.id}/messages`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!res.ok) throw new Error("Error cargando mensajes");
      const data = await res.json();
      setMessages(data);
      setMessagesBySession((prev) => ({ ...prev, [session.id]: data }));
    } catch (err) {
      setMessages([]);
      setMessagesBySession((prev) => ({ ...prev, [session.id]: [] }));
      console.error("❌", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const getLastMessage = (sessionId: number) => {
    const msgs = messagesBySession[sessionId] || [];
    if (msgs.length > 0) {
      const last = msgs[msgs.length - 1];
      return {
        lastMessage: last.content,
        time: new Date(last.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
    return { lastMessage: "(sin mensajes)", time: "--:--" };
  };

  // Buscador visual (no filtra, solo visual)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Si quieres filtrar realmente, aquí puedes hacerlo
  };

  // Handler vacío para el chat cerrado
  const noop = () => {};

  // Handler para cerrar el modal
  const handleCloseModal = () => {
    setShowClosedModal(false);
  };

  return (
    <div className={`chat-history-layout${!selectedSession ? ' no-client-panel' : ''}`}>
      <aside className="chat-list-panel">
        <div className="chat-list-header">
          <h3>Historial de chats ({sessions.length})</h3>
          <div className="chat-search">
            <span role="img" aria-label="Buscar">🔍</span>
            <input
              type="text"
              placeholder="Buscar chat..."
              value={search}
              onChange={handleSearch}
              disabled={loading}
            />
          </div>
        </div>
        <div className="chat-list">
          {loading ? (
            <p className="chat-list-loading">Cargando historial...</p>
          ) : sessions.length === 0 ? (
            <p className="chat-list-empty">No hay sesiones cerradas aún.</p>
          ) : (
            sessions.map((session) => {
              const { lastMessage, time } = getLastMessage(session.id);
              return (
                <ChatItem
                  key={`closed-session-${session.id}`}
                  session={{
                    id: session.id,
                    clientName: session.clientName,
                    systemName: session.systemName,
                    lastMessage,
                    time: time || new Date(session.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    unreadCount: 0,
                    isRead: true,
                  }}
                  isSelected={selectedSession?.id === session.id}
                  onClick={() => handleSelectSession(session)}
                />
              );
            })
          )}
        </div>
      </aside>
      <main className="chat-history-main">
        {selectedSession ? (
          <ChatWindow
            messages={messages}
            newMsg={""}
            setNewMsg={noop}
            sendMessage={noop}
            hasSession={true}
            onEndChat={noop}
            clientName={selectedSession.clientName}
            systemName={selectedSession.systemName}
          />
        ) : (
          <section className="chat-window-empty chat-history-empty">
            <p className="text-muted">Selecciona una sesión cerrada para ver el historial</p>
          </section>
        )}
      </main>
      {selectedSession && (
        <ClientInfoPanel
          sessionId={selectedSession.id}
          clientId={null}
          sessions={sessions}
        />
      )}
      
      {/* Modal para chat cerrado */}
      <ClosedChatModal
        isOpen={showClosedModal}
        onClose={handleCloseModal}
        clientName={selectedSession?.clientName || ""}
        systemName={selectedSession?.systemName || ""}
      />
    </div>
  );
};

export default ChatHistoryPanel;
