import React from 'react';
import '../styles/ClientChat.css';

interface ChatHeaderProps {
  onClose: () => void;
  title?: string;
  status?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onClose, 
  title = "Soporte Técnico", 
  status = "En línea" 
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <span className="chat-title">{title}</span>
        <span className="chat-status">
          <span className="status-indicator" />
          {status}
        </span>
      </div>
      <button 
        className="close-btn" 
        onClick={onClose}
        aria-label="Cerrar chat"
        type="button"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;
