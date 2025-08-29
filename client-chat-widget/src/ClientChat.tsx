import React from "react";
import { useEffect, useState, useRef } from "react";
import { startChatSession } from "./services/apiService";
import { connectClientToChat, disconnectClient } from "./services/signalrClient";
import ChatFab from "./components/ChatFab";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import FilePreview from "./components/FilePreview";
import ChatInput from "./components/ChatInput";
import "./styles/tokens.css"; // design tokens (override via host page if needed)
import "./styles/ClientChat.css"; // component styles consuming tokens

import type { ChatMessage, FileAttachment } from './types/chat';

interface ClientChatProps {
  clientId: string;
  clientName?: string;
  systemCode: "geoportal" | "erp" | "avaluos";
}

const ClientChat = ({ clientId, clientName = "", systemCode }: ClientChatProps) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState<string>("");
  const [hasConnected, setHasConnected] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [isChatClosed, setIsChatClosed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Claves de localStorage específicas por cliente y sistema
  const storageKeys = {
    chatId: `chat_${clientId}_${systemCode}_id`,
    messages: `chat_${clientId}_${systemCode}_messages`,
    hasStarted: `chat_${clientId}_${systemCode}_started`,
    isClosed: `chat_${clientId}_${systemCode}_closed`
  };

  const getSystemOriginId = (): number => {
    switch (systemCode) {
      case "erp": return 2;
      case "avaluos": return 3;
      default: return 1;
    }
  };

  // Cargar estado del chat desde localStorage al inicializar
  useEffect(() => {
    const savedChatId = localStorage.getItem(storageKeys.chatId);
    const savedMessages = localStorage.getItem(storageKeys.messages);
    const savedHasStarted = localStorage.getItem(storageKeys.hasStarted);
    const savedIsClosed = localStorage.getItem(storageKeys.isClosed);

    console.log("🔄 Cargando estado del chat desde localStorage:", {
      savedChatId,
      savedHasStarted,
      savedIsClosed,
      hasMessages: !!savedMessages
    });

    // Si hay un chat activo (no cerrado por soporte)
    if (savedChatId && savedHasStarted === 'true' && savedIsClosed !== 'true') {
      console.log("✅ Restaurando chat activo existente");
      setChatId(savedChatId);
      setHasStarted(true);
      setIsChatClosed(false);
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          console.log("✅ Mensajes restaurados:", parsedMessages.length);
        } catch (error) {
          console.error("❌ Error parsing saved messages:", error);
          // Si hay error al parsear, limpiar localStorage
          clearChatStorage();
        }
      }
    } else if (savedIsClosed === 'true') {
      // Si el chat fue cerrado por soporte, mantener el estado cerrado
      console.log("🔒 Chat fue cerrado por soporte - manteniendo estado cerrado");
      setIsChatClosed(true);
      
      // Mantener mensajes para mostrar la conversación cerrada
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error("❌ Error parsing saved messages:", error);
        }
      }
    } else {
      console.log("📝 No hay chat previo o fue invalidado");
      clearChatStorage();
    }
  }, []);

  // Función para limpiar el storage del chat
  const clearChatStorage = () => {
    console.log("🧹 Limpiando localStorage del chat");
    localStorage.removeItem(storageKeys.chatId);
    localStorage.removeItem(storageKeys.messages);
    localStorage.removeItem(storageKeys.hasStarted);
    localStorage.removeItem(storageKeys.isClosed);
  };

  // Función para iniciar un nuevo chat (solo cuando el anterior esté cerrado)
  const startNewChat = () => {
    console.log("🆕 Iniciando nuevo chat - estado actual:", {
      isChatClosed,
      hasStarted,
      chatId
    });
    
    // Solo permitir nuevo chat si el anterior fue cerrado por soporte
    if (!isChatClosed) {
      console.log("⚠️ No se puede iniciar nuevo chat - chat actual aún activo");
      return;
    }

    console.log("✅ Limpiando estado para nuevo chat");
    clearChatStorage();
    setChatId(null);
    setMessages([]);
    setHasStarted(false);
    setHasConnected(false);
    setIsChatClosed(false);
    setUnreadCount(0);
  };

  // Limpiar conexión al desmontar el componente
  useEffect(() => {
    return () => {
      disconnectClient().catch((error) => console.error("Error during cleanup:", error));
    };
  }, []);
  // Conectar al chat cuando se inicia o restaura
  useEffect(() => {
    // No conectar si el chat está cerrado o no hay chatId
    if (!hasStarted || isChatClosed || !chatId || hasConnected) {
      return;
    }

    console.log("🔌 Conectando al chat:", { chatId, hasStarted, isChatClosed, hasConnected });

    const connect = async () => {
      try {
        await connectClientToChat(
          chatId!,
          // Callback para recibir mensajes
          (sessionId: string, sender: string, content: string, sentAt: string, attachments: any[] = []) => {
            console.log("📩 Mensaje recibido por SignalR:", { sessionId, sender, content, sentAt, attachments });
            
            const validSender = sender as 'client' | 'agent' | 'system';
            
            // Solo procesar mensajes válidos
            if (!content && (!attachments || attachments.length === 0)) {
              console.log("⚠️ Mensaje vacío ignorado");
              return;
            }
            
            // Convertir attachments del servidor al formato esperado
            const processedAttachments: FileAttachment[] = attachments?.map(att => {
              console.log("📎 Procesando attachment RAW:", att);
              console.log("📎 Propiedades del attachment:", Object.keys(att));
              
              // El servidor envía las propiedades con mayúscula inicial (FileName, FileType, FilePath)
              const fileName = att.FileName || att.fileName || 'archivo';
              const fileType = att.FileType || att.fileType || 'application/octet-stream';
              let filePath = att.FilePath || att.filePath || '';
              
              console.log("📎 fileName extraído:", fileName);
              console.log("📎 fileType extraído:", fileType);
              console.log("📎 filePath extraído:", filePath);
              
              // Construir URL completa para el archivo
              if (filePath && !filePath.startsWith('http')) {
                filePath = `http://localhost:5000/${filePath}`;
              }
              
              const processedAttachment = {
                fileName: fileName,
                fileType: fileType,
                filePath: filePath,
                fileSize: att.FileSize || att.fileSize
              };
              
              console.log("📎 Attachment procesado FINAL:", processedAttachment);
              console.log("📎 ¿Es imagen?", processedAttachment.fileType.startsWith('image/'));
              
              return processedAttachment;
            }) || [];

            const newMessage: ChatMessage = {
              id: `msg-${Date.now()}-${Math.random()}`, 
              sender: validSender, 
              content: processedAttachments.length > 0 && content === '[Archivo]' ? '' : content, 
              sentAt,
              attachments: processedAttachments.length > 0 ? processedAttachments : undefined
            };

            console.log("✅ Agregando mensaje:", newMessage);

            setMessages((prev) => {
              // Lógica especial para archivos: si llega un mensaje con "[Archivo]" y attachments,
              // eliminar cualquier mensaje previo con "[Archivo]" sin attachments del mismo sender en los últimos 15 segundos
              if (content === '[Archivo]' && processedAttachments.length > 0) {
                console.log("🔄 Mensaje con archivo detectado, limpiando duplicados...");
                
                const now = new Date(sentAt).getTime();
                
                const filteredPrev = prev.filter(msg => {
                  // Mantener todos los mensajes que NO sean "[Archivo]" 
                  if (msg.content !== '[Archivo]') {
                    return true;
                  }
                  
                  // Si es "[Archivo]" pero tiene attachments, mantenerlo
                  if (msg.attachments && msg.attachments.length > 0) {
                    return true;
                  }
                  
                  // Si es "[Archivo]" sin attachments, verificar si es del mismo sender y tiempo similar
                  const msgTime = new Date(msg.sentAt).getTime();
                  const timeDiff = Math.abs(now - msgTime);
                  const isSameSender = msg.sender === validSender;
                  const isRecent = timeDiff < 15000; // 15 segundos
                  
                  // Si es del mismo sender y tiempo reciente, eliminarlo (es duplicado)
                  if (isSameSender && isRecent) {
                    console.log("🗑️ Eliminando mensaje duplicado sin attachment:", msg);
                    return false;
                  }
                  
                  return true;
                });
                
                console.log("✅ Agregando mensaje con attachment definitivo");
                const updated = [...filteredPrev, newMessage];
                // Guardar mensajes en localStorage
                localStorage.setItem(storageKeys.messages, JSON.stringify(updated));
                return updated;
              }
              
              // Para mensajes "[Archivo]" sin attachments, verificar si ya existe uno con attachments
              if (content === '[Archivo]' && processedAttachments.length === 0) {
                console.log("⚠️ Mensaje '[Archivo]' sin attachments recibido, verificando duplicados...");
                
                const now = new Date(sentAt).getTime();
                
                // Buscar si ya existe un mensaje con attachments del mismo sender en tiempo similar
                const hasAttachmentVersion = prev.some(msg => {
                  const msgTime = new Date(msg.sentAt).getTime();
                  const timeDiff = Math.abs(now - msgTime);
                  const isSameSender = msg.sender === validSender;
                  const isRecent = timeDiff < 15000; // 15 segundos
                  const hasAttachments = msg.attachments && msg.attachments.length > 0;
                  
                  return isSameSender && isRecent && hasAttachments;
                });
                
                if (hasAttachmentVersion) {
                  console.log("🚫 Ignorando mensaje '[Archivo]' sin attachments porque ya existe versión con attachments");
                  return prev;
                }
              }
              
              // Para otros mensajes, verificar duplicados normalmente
              const isDuplicate = prev.some(msg => {
                // Si el contenido, timestamp y sender son exactamente iguales
                const sameContent = msg.content === newMessage.content;
                const sameTimestamp = msg.sentAt === sentAt;
                const sameSender = msg.sender === validSender;
                
                // Solo considerar duplicado si todo es exactamente igual
                return sameContent && sameTimestamp && sameSender;
              });
              
              if (isDuplicate) {
                console.log("⚠️ Mensaje duplicado detectado, ignorando");
                return prev;
              }
              
              console.log("✅ Agregando mensaje nuevo al state");
              const updated = [...prev, newMessage];
              // Guardar mensajes en localStorage
              localStorage.setItem(storageKeys.messages, JSON.stringify(updated));
              return updated;
            });
            
            // Incrementar contador si el chat está cerrado y el mensaje no es del cliente
            if (!isOpen && sender !== 'client') {
              setUnreadCount(prev => prev + 1);
            }
          },
          // Callback para cuando el chat es cerrado por soporte
          (sessionId: string, message: string, timestamp: string) => {
            console.log("🔒 Chat cerrado por soporte:", { sessionId, message, timestamp });
            
            const professionalMessage = "La sesión de soporte técnico ha sido finalizada por nuestro equipo. Si requiere asistencia adicional, puede iniciar una nueva conversación.";
            const systemMessage: ChatMessage = {
              id: `system-${Date.now()}`,
              sender: "system",
              content: professionalMessage,
              sentAt: timestamp
            };
            
            setMessages((prev) => {
              const updated = [...prev, systemMessage];
              // Guardar mensajes en localStorage
              localStorage.setItem(storageKeys.messages, JSON.stringify(updated));
              return updated;
            });
            
            setIsChatClosed(true);
            setHasConnected(false); // Desconectar para que no siga recibiendo mensajes
            
            // Marcar chat como cerrado en localStorage
            localStorage.setItem(storageKeys.isClosed, 'true');
            
            console.log("✅ Estado del chat actualizado a cerrado");
          }
        );
        setHasConnected(true);
      } catch (error) {
        console.error("Error connecting to chat:", error);
      }
    };

    connect();
  }, [hasStarted, hasConnected, chatId, isChatClosed, isOpen]);
  const sendMessage = async () => {
    if (!newMsg.trim() && !selectedFile) return;
    if (isChatClosed) return; // No permitir enviar mensajes si el chat está cerrado

    setIsLoading(true);
    let id = chatId;
    
    if (!hasStarted) {
      id = await startChatSession(clientId, systemCode, clientName);
      if (!id) {
        alert("Error al iniciar el chat");
        setIsLoading(false);
        return;
      }
      setChatId(id);
      setHasStarted(true);
      
      // Guardar estado en localStorage
      localStorage.setItem(storageKeys.chatId, id);
      localStorage.setItem(storageKeys.hasStarted, 'true');
      localStorage.setItem(storageKeys.isClosed, 'false');

      // Cargar historial solo la primera vez
      const res = await fetch(`http://localhost:5000/api/chat/${id}/messages`);
      const history = await res.json();
      const formattedHistory = history.map((msg: any) => ({
        ...msg,
        attachments: msg.attachments?.map((att: any) => ({
          ...att,
          filePath: att.filePath?.startsWith('http') ? att.filePath : `http://localhost:5000/${att.filePath}`
        }))
      }));
      
      setMessages(formattedHistory);
      // Guardar historial en localStorage
      localStorage.setItem(storageKeys.messages, JSON.stringify(formattedHistory));
    }

    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      // Enviar mensaje al servidor
      const response = await fetch("http://localhost:5000/api/Chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSessionId: id,
          content: newMsg,
          sender: "client",
          systemOriginId: getSystemOriginId(),
        }),
      });

      if (!response.ok) throw new Error("Error al enviar mensaje");

      let savedMessage = await response.json();

      // Subir archivo si existe
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("messageId", savedMessage.id);

        const uploadRes = await fetch("http://localhost:5000/api/Attachment/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          // No necesitamos hacer nada aquí, SignalR se encargará de enviar el mensaje actualizado
          console.log("📎 Archivo subido exitosamente");
        } else {
          console.error("Error subiendo archivo");
        }
      }

      setNewMsg("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };






  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // Si es hoy, mostrar solo la hora
    if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Si es ayer
    if (diffInHours < 48) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Ayer ${date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      }
    }
    
    // Si es de esta semana
    if (diffInHours < 168) {
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const time = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dayName} ${time}`;
    }
    
    // Si es más antiguo, mostrar fecha completa
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isChatClosed) {
      e.preventDefault();
      sendMessage();
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };





  return (
    <div className="gtc-chat-root">
      <ChatFab 
        isOpen={isOpen} 
        unreadCount={unreadCount}
        onClick={() => {
          setIsOpen(true);
          setUnreadCount(0); // Reset unread count when opening chat
        }} 
      />

      {isOpen && (
        <div className="chat-widget-window">
          <ChatHeader 
            onClose={() => setIsOpen(false)}
            title="Soporte Técnico"
            status="En línea"
          />

          <ChatMessages
            messages={messages}
            onImageClick={setModalImageUrl}
            formatDateTime={formatDateTime}
          />

          <FilePreview
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onCancel={() => {
              setPreviewUrl(null);
              setSelectedFile(null);
            }}
          />

          <ChatInput
            newMsg={newMsg}
            setNewMsg={setNewMsg}
            sendMessage={sendMessage}
            isChatClosed={isChatClosed}
            isLoading={isLoading}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            handleKeyPress={handleKeyPress}
            handleFileChange={handleFileChange}
            selectedFile={selectedFile}
            onStartNewChat={startNewChat}
          />
        </div>
      )}

  {modalImageUrl && (
        <div 
          className="image-modal" 
          onClick={() => setModalImageUrl(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setModalImageUrl(null);
            }
          }}
          tabIndex={0}
        >
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-controls">
              <button 
                className="image-modal-close"
                onClick={() => setModalImageUrl(null)}
                aria-label="Cerrar imagen"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <img 
              src={modalImageUrl} 
              alt="Vista previa ampliada" 
              onClick={(e) => e.stopPropagation()}
            />
            <div className="image-modal-info">
              Haz clic fuera de la imagen o presiona ESC para cerrar
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientChat;
