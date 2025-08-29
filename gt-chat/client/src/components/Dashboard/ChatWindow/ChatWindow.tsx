import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useEffect, useRef } from "react";
import "../../../styles/ChatWindow.css";
interface Message {
    id: number;
    sender: string;
    content: string;
    sentAt: string;
    attachments?: {
        fileName: string;
        filePath: string;
        fileType: string;
    }[];
}

interface Props {
    messages: Message[];
    newMsg: string;
    setNewMsg: (value: string) => void;
    sendMessage: (file?: File | null) => void;
    hasSession: boolean;
    onEndChat: () => void;
    clientName?: string;
    systemName?: string;
}

const ChatWindow = ({ messages, newMsg, setNewMsg, sendMessage, hasSession, onEndChat, clientName, systemName }: Props) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Debug log temporal
    console.log("ChatWindow render:", { hasSession, selectedSession: hasSession, messagesCount: messages.length });

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);    return (
        <>
            {!hasSession ? (
                <section className="chat-window-empty">
                    <div className="empty-icon">💬</div>
                    <p className="empty-text">Selecciona una conversación</p>
                    <p className="empty-subtitle">Elige un chat de la lista para comenzar a atender al cliente</p>
                </section>
            ) : (
                <section className="chat-window">
                    <div className="chat-window-inner">
                        <ChatHeader 
                            onEndChat={onEndChat} 
                            clientName={clientName}
                            systemName={systemName}
                        />
                        <div className="message-container">
                            {messages.map((msg, index) => (
                                <MessageBubble key={`${msg.id}-${index}`} message={msg} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <ChatInput
                            newMsg={newMsg}
                            setNewMsg={setNewMsg}
                            onSend={sendMessage}
                        />
                    </div>
                </section>
            )}
        </>
    );
};

export default ChatWindow;
