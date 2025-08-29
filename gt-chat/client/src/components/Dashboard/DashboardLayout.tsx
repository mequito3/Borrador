import { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar/Sidebar";
import ChatListPanel from "./ChatListPanel/ChatListPanel";
import ChatWindow from "./ChatWindow/ChatWindow";
import ClientInfoPanel from "./ClientInfoPanel/ClientInfoPanel";
import { getToken, ensureValidSession } from "../../services/authService";
import { API_BASE, withApi } from "../../config";
import {
  connectAgentToChat,
  stopConnection,
  connectToGlobalNotifications,
} from "../../services/signalRService";
import EndChatModal from "./Modals/EndChatModal";
import ChatHistoryPanel from "./ChatHistoryPanel/ChatHistoryPanel";
import StatisticsPanel from "./ChatStatisticsPanel/StatisticsPanel";

const API = API_BASE;

interface Session {
  id: number;
  clientName: string;
  systemName: string;
  lastMessage: string;
  unreadCount: number;
  time: string;
  isRead?: boolean;
  clientId?: string;
  email?: string;
  company?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

const DashboardLayout = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [filterSystem, setFilterSystem] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState("chats");
  const [closedSessions, setClosedSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    closedSessions: 0,
    lastSession: null,
  });
  const [searchText, setSearchText] = useState("");
  const [satisfaction, setSatisfaction] = useState<number | null>(null);

  const selectedSessionRef = useRef<number | null>(null);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    connectToGlobalNotifications(({ sessionId, sender, content, sentAt }) => {
      // Formato 24h para la hora
      const formattedTime = new Date(sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === sessionId);
        let updated;
        if (idx !== -1) {
          updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessage: content,
            unreadCount:
              selectedSessionRef.current === sessionId
                ? 0
                : updated[idx].unreadCount + 1,
            time: formattedTime,
            isRead: selectedSessionRef.current === sessionId,
          };
        } else {
          updated = [
            {
              id: sessionId,
              clientName: sender,
              systemName: "Desconocido",
              lastMessage: content,
              unreadCount: 1,
              time: formattedTime,
              isRead: false,
            },
            ...prev,
          ];
        }
        setFilteredSessions(
          filterSystem === "all"
            ? updated
            : updated.filter((s) => s.systemName.toLowerCase() === filterSystem)
        );
        return updated;
      });
      if (selectedSessionRef.current === sessionId) {
        setMessages((prev) => [
          ...prev,
          {
            sender,
            content,
            sentAt,
          },
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (filterSystem === "all") {
      setFilteredSessions(sessions);
    } else {
      setFilteredSessions(
        sessions.filter(
          (s) => s.systemName.toLowerCase() === filterSystem
        )
      );
    }
  }, [filterSystem, sessions]);

  useEffect(() => {
    if (currentView === "historial") fetchClosedSessions();
    if (currentView === "estadisticas") fetchStats();
  }, [currentView]);

  // Filtrado por sistema y búsqueda
  useEffect(() => {
    let filtered = sessions;
    if (filterSystem !== "all") {
      filtered = filtered.filter((s) => s.systemName.toLowerCase() === filterSystem);
    }
    if (searchText.trim() !== "") {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.clientName && s.clientName.toLowerCase().includes(text)) ||
          (s.systemName && s.systemName.toLowerCase().includes(text)) ||
          (s.lastMessage && s.lastMessage.toLowerCase().includes(text))
      );
    }
    setFilteredSessions(filtered);
  }, [filterSystem, sessions, searchText]);

  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const fetchSessions = async () => {
  const res = await fetch(withApi(`/chat/active-sessions`), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      let data = await res.json();
      // Mapear Time (del backend) a time (frontend)
      data = data.map((s: any) => ({
        ...s,
        time: s.Time || s.time || "--:--",
      }));
      setSessions(data);
      setFilteredSessions(data);
    } else {
      console.error("Error al obtener sesiones activas:", res.status);
    }
  };

  const fetchClosedSessions = async () => {
    try {
  const res = await fetch(withApi(`/chat/closed-sessions`), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClosedSessions(data);
      } else {
        console.error("❌ Error al obtener historial:", res.status);
      }
    } catch (err) {
      console.error("❌ Error de red al obtener historial:", err);
    }
  };

  const fetchStats = async () => {
    try {
  const res = await fetch(withApi(`/chat/stats`), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("❌ Error al obtener estadísticas:", err);
    }
  };

  const loadMessages = async (sessionId: number) => {
    setSelectedSession(sessionId);

  await fetch(withApi(`/chat/${sessionId}/mark-read`), {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

  const res = await fetch(withApi(`/chat/${sessionId}/messages`));
    const data = await res.json();
    setMessages(data);

    stopConnection();    connectAgentToChat(sessionId, async (newMessage) => {
      console.log("Mensaje recibido por SignalR:", newMessage);
      
      // Lógica especial para archivos: si llega un mensaje con "[Archivo]" y attachments,
      // eliminar cualquier mensaje previo con "[Archivo]" sin attachments del mismo sender en los últimos 15 segundos
      if (newMessage.attachments && newMessage.attachments.length > 0) {
        // Hay adjuntos: intenta reemplazar placeholder previo del mismo sender en <15s
        setMessages(prev => {
          const now = new Date(newMessage.sentAt).getTime();
          for (let i = prev.length - 1; i >= 0; i--) {
            const m = prev[i];
            if (m.sender === newMessage.sender && m.content === '[Archivo]' && (!m.attachments || m.attachments.length === 0)) {
              const mt = new Date(m.sentAt).getTime();
              if (Math.abs(now - mt) < 15000) {
                const clone = [...prev];
                clone[i] = { ...newMessage }; // mantenemos content '[Archivo]' hasta que imágenes carguen
                return clone;
              }
            }
          }
          return [...prev, newMessage];
        });
      } else if (newMessage.content === '[Archivo]') {
        // Placeholder si no existe uno reciente (<5s)
        setMessages(prev => {
          const now = Date.now();
          const hasRecent = prev.some(m => m.sender === newMessage.sender && m.content === '[Archivo]' && (now - new Date(m.sentAt).getTime()) < 5000);
          if (hasRecent) return prev;
          return [...prev, newMessage];
        });
      } else {
        // Para mensajes normales (no "[Archivo]"), agregar directamente pero evitar duplicados
        setMessages((prev) => {
          const isDuplicate = prev.some(msg => {
            const timeDiff = Math.abs(new Date(msg.sentAt).getTime() - new Date(newMessage.sentAt).getTime());
            return msg.content === newMessage.content && 
                   msg.sender === newMessage.sender && 
                   timeDiff < 2000; // 2 segundos de margen
          });
          
          if (isDuplicate) {
            console.log("⚠️ Mensaje duplicado detectado, ignorando");
            return prev;
          }
          
          return [...prev, newMessage];
        });
      }

      if (newMessage.sender === "client") {
  await fetch(withApi(`/chat/${sessionId}/mark-read`), {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      }

      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId ? { ...s, unreadCount: 0, isRead: true } : s
        );
        setFilteredSessions(
          filterSystem === "all"
            ? updated
            : updated.filter((s) => s.systemName.toLowerCase() === filterSystem)
        );
        return updated;
      });
    });

    // Actualiza el contador de la lista al abrir el chat
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, unreadCount: 0, isRead: true } : s
      );
      setFilteredSessions(
        filterSystem === "all"
          ? updated
          : updated.filter((s) => s.systemName.toLowerCase() === filterSystem)
      );
      return updated;
    });

    await fetchSessions();
  };

  // Cambia la función para aceptar archivo
  const sendingRef = useRef(false);

  const sendMessage = async (file?: File | null) => {
    if (sendingRef.current) return; // evita doble click
    if ((!newMsg.trim() && !file) || !selectedSession) return;
    if (!ensureValidSession()) return;
    sendingRef.current = true;

    // Si hay archivo, primero sube el mensaje vacío, luego el archivo
    if (file) {
      // 1. Crea el mensaje vacío (sin contenido, solo para adjunto)
      const resMsg = await fetch(withApi(`/chat/send`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          chatSessionId: selectedSession,
            sender: "agent",
            content: newMsg || "[Archivo]",
            systemOriginId: 1,
        }),
      });
      if (!resMsg.ok) { sendingRef.current = false; return; }
      const msgData = await resMsg.json();
      // 2. Sube el archivo con el id del mensaje
      const formData = new FormData();
      formData.append("file", file);
      formData.append("messageId", msgData.id);
      await fetch(withApi(`/attachment/upload`), {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      setNewMsg("");
      sendingRef.current = false;
      return;
    }

    // Si solo es texto
    await fetch(withApi(`/chat/send`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        chatSessionId: selectedSession,
        sender: "agent",
        content: newMsg,
        systemOriginId: 1,
      }),
    });
    setNewMsg("");
    sendingRef.current = false;
    // No agregues el mensaje manualmente aquí, espera a que llegue por SignalR para evitar duplicados
  };

  const confirmEndChat = () => setShowModal(true);
  const cancelEndChat = () => {
    setShowModal(false);
    setSatisfaction(null);
  };

  const endChatSession = async () => {
    if (!selectedSession || satisfaction === null) return;

    try {
      // Enviar la calificación antes de cerrar el chat
  await fetch(withApi(`/chat/${selectedSession}/satisfaction`), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify(satisfaction) // CORRECTO: solo el número, no un objeto
      });
  const res = await fetch(withApi(`/chat/${selectedSession}/close`), {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        console.error("Error al finalizar el chat:", res.status);
        return;
      }
      stopConnection();
      setSelectedSession(null);
      setMessages([]);
      fetchSessions();
    } catch (err) {
      console.error("❌ Error finalizando chat:", err);
    } finally {
      setShowModal(false);
      setSatisfaction(null);
    }
  };


  return (
    <>
      <div className="dashboard-layout">
        <Sidebar
          filterSystem={filterSystem}
          setFilterSystem={setFilterSystem}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {currentView === "chats" && (
          <div className="main-content">
            <ChatListPanel
              sessions={filteredSessions}
              onSelectSession={loadMessages}
              selectedSession={selectedSession}
              onSearch={setSearchText}
            />            
            <ChatWindow
              key={selectedSession || 'no-session'}
              messages={messages}
              newMsg={newMsg}
              setNewMsg={setNewMsg}
              sendMessage={sendMessage}
              hasSession={!!selectedSession}
              onEndChat={confirmEndChat}
              clientName={selectedSession ? sessions.find(s => s.id === selectedSession)?.clientName : undefined}
              systemName={selectedSession ? sessions.find(s => s.id === selectedSession)?.systemName : undefined}
            />
            <ClientInfoPanel sessionId={selectedSession} clientId={null} sessions={sessions} />
          </div>
        )}

        {currentView === "historial" && (
          <div className="main-content">
            <ChatHistoryPanel />
          </div>
        )}

        {currentView === "estadisticas" && (
          <div className="main-content">
            <StatisticsPanel stats={stats} />
          </div>
        )}
      </div>

      {showModal && (
        <EndChatModal 
          onConfirm={endChatSession} 
          onCancel={cancelEndChat} 
          satisfaction={satisfaction}
          setSatisfaction={setSatisfaction}
        />
      )}
    </>
  );
};

export default DashboardLayout;
