import { useState } from "react";
import ChatItem from "./ChatItem";
import "../../../styles/ChatListPanel.css";

interface Session {
  id: number;
  clientName: string;
  systemName: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isRead?: boolean;
}

interface Props {
  sessions: Session[];
  selectedSession: number | null;
  onSelectSession: (sessionId: number) => void;
  onSearch: (text: string) => void;
}

const ChatListPanel = ({ sessions, selectedSession, onSelectSession, onSearch }: Props) => {
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <aside className="chat-list-panel">
      <div className="chat-list-header">
        <h3>Chats activos ({sessions.length})</h3>
        <div className="chat-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar chat..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="chat-list">
        {sessions.map((s) => (
          <ChatItem
            key={s.id}
            session={s}
            isSelected={selectedSession === s.id}
            onClick={() => onSelectSession(s.id)}
          />
        ))}
      </div>
    </aside>
  );
};

export default ChatListPanel;
