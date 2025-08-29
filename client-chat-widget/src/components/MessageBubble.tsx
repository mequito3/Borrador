import React from 'react';
import type { ChatMessage, FileAttachment } from '../types/chat';
import '../styles/ClientChat.css';


interface MessageBubbleProps {
  message: ChatMessage;
  onImageClick: (imageUrl: string) => void;
  formatDateTime: (dateString: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onImageClick, 
  formatDateTime 
}) => {
  const isClient = message.sender === 'client';
  const isSystem = message.sender === 'system';

  // Debug: Log para ver qué está llegando al componente
  console.log("🟡 MessageBubble renderizando:", {
    sender: message.sender,
    content: message.content,
    attachments: message.attachments,
    attachmentsLength: message.attachments?.length || 0
  });

  return (
    <div className={`message-bubble ${isClient ? 'client' : isSystem ? 'system' : 'agent'}`}>
      <div className="message-content">
        {message.content && <p>{message.content}</p>}
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map((attachment: FileAttachment, index: number) => {
              // Debug: Log para cada attachment
              console.log("🖼️ Procesando attachment en MessageBubble:", {
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                filePath: attachment.filePath,
                isImage: attachment.fileType && attachment.fileType.startsWith('image/')
              });

              return (
                <div key={index} className="attachment">
                  {attachment.fileType && attachment.fileType.startsWith('image/') ? (
                    <img
                      src={attachment.filePath}
                      alt={attachment.fileName}
                      className="attachment-image"
                      onClick={() => onImageClick(attachment.filePath)}
                    
                      onLoad={() => console.log("✅ Imagen cargada:", attachment.filePath)}
                      onError={() => console.log("❌ Error cargando imagen:", attachment.filePath)}
                    />
                  ) : (
                    <div className="attachment-file">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{attachment.fileName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="message-time">
        {formatDateTime(message.sentAt)}
      </div>
    </div>
  );
};

export default MessageBubble;
