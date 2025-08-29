import "../../../styles/EndChatModal.css";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  satisfaction: number | null;
  setSatisfaction: (value: number) => void;
}

const EndChatModal = ({ onConfirm, onCancel, satisfaction, setSatisfaction }: Props) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>¿Finalizar esta conversación?</h3>
        <p>Esta acción cerrará la sesión de chat actual.</p>
        <div style={{ margin: '16px 0' }}>
          <label>Califica la atención:&nbsp;</label>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                cursor: 'pointer',
                color: satisfaction && satisfaction >= star ? '#ffc107' : '#ccc',
                fontSize: 24,
              }}
              onClick={() => setSatisfaction(star)}
              data-testid={`star-${star}`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="btn-confirm" onClick={onConfirm} disabled={satisfaction === null}>Finalizar</button>
        </div>
      </div>
    </div>
  );
};

export default EndChatModal;
