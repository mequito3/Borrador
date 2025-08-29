import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';
import MessageBubble from './MessageBubble';
import '../styles/ClientChat.css';

interface ChatMessagesProps {
  messages: ChatMessage[];
  onImageClick: (imageUrl: string) => void;
  formatDateTime: (dateString: string) => string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  onImageClick, 
  formatDateTime 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
  <div className="chat-messages" aria-live="polite" aria-relevant="additions text">
      {messages.length === 0 && (
        <div className="empty-chat">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>Envía tu primer mensaje</p>
        </div>
      )}
      
      {messages.map((message, index) => (
        <MessageBubble
          key={`${message.id}-${index}`}
          message={message}
          onImageClick={onImageClick}
          formatDateTime={formatDateTime}
        />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
