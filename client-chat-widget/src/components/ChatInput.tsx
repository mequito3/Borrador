import React, { useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from "emoji-picker-react";
import '../styles/ClientChat.css';

interface ChatInputProps {
  newMsg: string;
  setNewMsg: (msg: string) => void;
  sendMessage: () => void;
  isChatClosed: boolean;
  isLoading: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean | ((prev: boolean) => boolean)) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  onStartNewChat?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  newMsg,
  setNewMsg,
  sendMessage,
  isChatClosed,
  isLoading,
  showEmojiPicker,
  setShowEmojiPicker,
  handleKeyPress,
  handleFileChange,
  selectedFile,
  onStartNewChat
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on outside click / Escape
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showEmojiPicker, setShowEmojiPicker]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [newMsg]);

  if (isChatClosed) {
    return (
      <div className="chat-input-area disabled">
        <div className="chat-closed-notice">
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
            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
            <circle cx="12" cy="16" r="1"></circle>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Sesión de soporte finalizada
        </div>
        {onStartNewChat && (
          <button 
            type="button"
            className="start-new-chat-btn"
            onClick={onStartNewChat}
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
              <path d="M12 2v20M2 12h20"></path>
            </svg>
            Iniciar nueva conversación
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="chat-input-area">
      <button 
        type="button" 
        className="emoji-btn"
        onClick={() => setShowEmojiPicker(prev => !prev)}
        disabled={isLoading}
        aria-label="Mostrar emojis"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </button>

      <label 
        htmlFor="file-upload" 
        className={`file-upload-btn ${isLoading ? 'disabled' : ''}`}
        aria-label="Subir archivo"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </label>

      <input
        type="file"
        id="file-upload"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <input
        ref={inputRef}
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={isLoading ? "Enviando..." : "Escribe tu mensaje..."}
        className="message-input"
        disabled={isLoading}
        aria-label="Escribir mensaje"
      />

      <button 
        className="send-btn"
        onClick={sendMessage}
        disabled={(!newMsg.trim() && !selectedFile) || isLoading}
        aria-label="Enviar mensaje"
        type="button"
      >
        {isLoading ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="loading"
          >
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
      </button>

      {showEmojiPicker && (
        <div className="emoji-picker-wrapper" ref={pickerRef} role="dialog" aria-label="Selector de emojis">
          <div className="emoji-picker-container">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setNewMsg(newMsg + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
              theme={Theme.LIGHT}
              width={300}
              height={360}
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
