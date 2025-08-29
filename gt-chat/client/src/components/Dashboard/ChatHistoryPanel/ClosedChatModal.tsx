import React from 'react';
import { FiX, FiLock } from 'react-icons/fi';
import '../../../styles/ClosedChatModal.css';

interface ClosedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  systemName: string;
}

const ClosedChatModal: React.FC<ClosedChatModalProps> = ({ 
  isOpen, 
  onClose, 
  clientName, 
  systemName 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content closed-chat-modal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close-button"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <FiX />
        </button>
        
        <div className="modal-header-icon">
          <FiLock className="modal-lock-icon" />
        </div>
        
        <h3>Chat Cerrado</h3>
        
        <div className="closed-chat-info">
          <p>
            La conversación entre <strong>{clientName}</strong> y <strong>{systemName}</strong> 
            ha sido cerrada.
          </p>
          <p className="closed-chat-description">
            Este chat está en modo de solo lectura. No puedes enviar nuevos mensajes.
          </p>
        </div>
        
        <div className="closed-chat-features">
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span>Puedes revisar todo el historial de mensajes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📄</span>
            <span>Los archivos compartidos siguen disponibles</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⭐</span>
            <span>La calificación del chat se mantiene guardada</span>
          </div>
        </div>
        
        <button 
          className="btn-understand"
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default ClosedChatModal;
