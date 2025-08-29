import React, { useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { FiPaperclip } from "react-icons/fi";

interface Props {
  newMsg: string;
  setNewMsg: (value: string) => void;
  onSend: (file?: File | null) => void;
}

const ChatInput = ({ newMsg, setNewMsg, onSend }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    if (sending) return;
    setSending(true);
    onSend(file);
      setFile(null);
      setPreview("");
      setFileType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(()=>setSending(false), 600); // se libera tras una breve espera
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files && e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileType(selected.type);
      if (selected.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview("");
      }
    }
  };

  const handleSend = () => {
  if (sending) return;
  setSending(true);
  onSend(file);
    setFile(null);
    setPreview("");
    setFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setTimeout(() => setPreview(""), 200);
  setTimeout(()=>setSending(false), 600);
  };

  // Helper para mostrar el icono segun tipo de archivo
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("excel")) return "📊";
    if (type.includes("text")) return "📃";
    return "📎";
  };
  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <button
          className="chat-input-attach"
          title="Adjuntar archivo"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <FiPaperclip size={18} color="#666" aria-label="Adjuntar archivo" />
        </button>
        <input
          type="file"
          className="chat-input-file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
          style={{ display: "none" }}
        />
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
        />
        {preview && (
          <img src={preview} alt="preview" className="chat-input-preview" />
        )}
        {file && !preview && (
          <div className="chat-input-file-preview">
            <span className="file-icon">{getFileIcon(fileType)}</span>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-type">{fileType || 'Archivo'}</span>
            </div>
          </div>
        )}
      </div>
      <button
        className="chat-input-send"
        onClick={handleSend}
        type="button"
        title="Enviar mensaje"
        disabled={sending}
      >
        {sending ? '...' : <FiSend size={18} />}
      </button>
    </div>
  );
};

export default ChatInput;
