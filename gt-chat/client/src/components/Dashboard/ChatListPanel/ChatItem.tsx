import "../../../styles/ChatListPanel.css";
import { ChevronRight } from "lucide-react";

interface Props {
  session: {
    id: number;
    clientName: string;
    systemName: string;
    lastMessage: string;
    time: string; // debe ser la hora del último mensaje, siempre
    unreadCount: number;
    isRead?: boolean;
  };
  isSelected: boolean;
  onClick: () => void;
}

const ChatItem = ({ session, isSelected, onClick }: Props) => {
  return (
    <div className={`chat-item ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="chat-item-header">
        <div className="chat-item-name-time">
          <span className="chat-item-name">{session.clientName}</span>
        </div>
        {/* Hora del último mensaje, SIEMPRE visible aunque no haya mensajes nuevos */}
        <span className="chat-item-time">{session.time || '--:--'}</span>
      </div>
      <div className="chat-item-sub">{session.systemName}</div>
      <div className="chat-item-message">{session.lastMessage}</div>
      {/* Badge solo si hay mensajes no leídos */}
      {!isSelected && session.unreadCount > 0 && !session.isRead && (
        <div className="chat-item-badge">{session.unreadCount}</div>
      )}
    </div>
  );
};

export default ChatItem;
