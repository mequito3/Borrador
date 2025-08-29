import React from "react";

interface Props {
  onEndChat: () => void;
  clientName?: string;
  systemName?: string;
}

const ChatHeader = ({ onEndChat, clientName, systemName }: Props) => {
  return (
    <div className="chat-window-header">
      <div className="chat-header-info">
        <div className="chat-header-avatar">
          {clientName ? clientName.charAt(0).toUpperCase() : 'C'}
        </div>
        <div className="chat-header-details">
          <div className="chat-header-title">
            {clientName || 'Cliente'}

          </div>
          <div className="chat-header-subtitle">

            <div className="chat-header-status"></div>
            {systemName || 'En línea'}
          </div>
        </div>
      </div>
      <button className="end-chat-btn" onClick={onEndChat}>
        Finalizar chat
      </button>
    </div>
  );
};

export default ChatHeader;
