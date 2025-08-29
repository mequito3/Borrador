import React from 'react';
import '../styles/ClientChat.css';

interface ChatFabProps {
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
  isLoading?: boolean;
  showTooltip?: boolean;
  isPulsing?: boolean;
}

const ChatFab: React.FC<ChatFabProps> = ({ 
  onClick, 
  isOpen, 
  unreadCount = 0,
  isLoading = false,
  showTooltip = true,
  isPulsing = true
}) => {
  if (isOpen) return null;

  return (
    <button 
      className={`chat-fab ${unreadCount > 0 ? 'has-notification' : ''} ${isPulsing ? 'pulse' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      aria-label="Abrir chat en vivo"
      title="Chat en Vivo"
      disabled={isLoading}
    >
      {showTooltip && (
        <span className="chat-fab-tooltip">
        </span>
      )}
      
      {unreadCount > 0 && (
        <span className="unread-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      <div className="chat-fab-icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <circle cx="9" cy="10" r="0.5" fill="currentColor">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0s"/>
          </circle>
          <circle cx="12" cy="10" r="0.5" fill="currentColor">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
          </circle>
          <circle cx="15" cy="10" r="0.5" fill="currentColor">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
          </circle>
        </svg>
      </div>
    </button>
  );
};

export default ChatFab;
