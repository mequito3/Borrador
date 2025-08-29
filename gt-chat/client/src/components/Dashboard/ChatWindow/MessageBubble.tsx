import React, { useEffect, useRef, useState } from "react";
import { FILE_BASE } from "../../../config";
import "../../../styles/MessageBubbleDeleted.css";

interface Attachment {
  fileName: string;
  filePath: string;
  fileType: string;
}

interface Message {
  sender: string;
  content: string;
  sentAt: string;
  attachments?: Attachment[];
  isFileMessage?: boolean;
  deleted?: boolean; // Nuevo campo para saber si está borrado
}

interface Props {
  message: Message;
}

// Simple in-memory cache for attachment URLs to persist while component tree remounts
const attachmentCache: Record<string, string> = {};

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isAgent = message.sender === "agent";
  const [showDeleted, setShowDeleted] = useState(false);
  const deletedRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("MessageBubble rendered:", {
      content: message.content,
      attachments: message.attachments,
      attachmentsLength: message.attachments?.length || 0,
      sender: message.sender
    });
  }, [message]);

  useEffect(() => {
    if (message.deleted) {
      setShowDeleted(true);
      // Desvanece el mensaje después de 1.2s
      const timeout = setTimeout(() => setShowDeleted(false), 3200);
      return () => clearTimeout(timeout);
    }
  }, [message.deleted]);
  const renderAttachment = (attachment: Attachment, index: number) => {
    const fileType = attachment.fileType || "";
    const isImage = fileType.startsWith("image/");
    const isPDF = fileType === "application/pdf";
    const isDoc = fileType.includes("word") || fileType.includes("document");
    const isExcel = fileType.includes("excel") || fileType.includes("spreadsheet");

    // Construir URL correcta
    const key = attachment.filePath;
    let fileURL = attachmentCache[key];
    if (!fileURL) {
      fileURL = `${FILE_BASE}/${attachment.filePath}`.replace(/([^:])\/\//g, '$1/');
      attachmentCache[key] = fileURL;
    }
    
    console.log("Rendering attachment:", { 
      fileName: attachment.fileName, 
      fileType, 
      filePath: attachment.filePath, 
      fileURL,
      isImage 
    });

    if (isImage) {
      return (
        <div key={`${attachment.fileName}-${index}`} className="attachment-block">
          <img
            src={fileURL}
            alt={attachment.fileName}
            className="attachment-image"
            onError={(e) => {
              console.error("Error loading image:", fileURL);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => console.log("Image loaded successfully:", fileURL)}
          />
          <div className="attachment-filename">{attachment.fileName}</div>
        </div>
      );
    }

    // Para archivos no-imagen
    const getFileIcon = () => {
      if (isPDF) return "📄";
      if (isDoc) return "📝";
      if (isExcel) return "📊";
      return "📎";
    };

    const getFileLabel = () => {
      if (isPDF) return "PDF";
      if (isDoc) return "Word";
      if (isExcel) return "Excel";
      return "Archivo";
    };

    return (
      <div key={`${attachment.fileName}-${index}`} className="attachment-block">
        <div className="attachment-file">
          <span className="file-icon">{getFileIcon()}</span>
          <div className="file-details">
            <a
              href={fileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              {attachment.fileName}
            </a>
            <span className="file-type">({getFileLabel()})</span>
          </div>
        </div>
      </div>
    );
  };

  const isPlaceholderFile = message.content === '[Archivo]' && Array.isArray(message.attachments) && message.attachments.length > 0;

  if (message.deleted && showDeleted) {
    return (
      <div
        className="deleted-message fade-out fade-out-active"
        ref={deletedRef}
      >
        Este mensaje fue eliminado
      </div>
    );
  }
  return (
    <div
      className={`msg-bubble ${isAgent ? "agent" : "client"}`}
    >
      <div className="msg-content">
        {/* Mostrar texto solo si no es placeholder de archivo con adjuntos */}
        {message.content && !isPlaceholderFile && (
          <div className="message-text">{message.content}</div>
        )}
        
        {/* Si hay attachments, mostrarlos */}
  {Array.isArray(message.attachments) && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map(renderAttachment)}
          </div>
        )}
      </div>
      <div className="msg-time">
        {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
};

export default MessageBubble;
