import React from 'react';
import '../styles/ClientChat.css';

interface FilePreviewProps {
  selectedFile: File | null;
  previewUrl: string | null;
  onCancel: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  selectedFile, 
  previewUrl, 
  onCancel 
}) => {
  if (!selectedFile) return null;

  return (
    <div className="file-preview">
      {previewUrl ? (
        <img src={previewUrl} alt="Previsualización" />
      ) : (
        <div className="file-info">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          <span>{selectedFile.name}</span>
        </div>
      )}
      
      <button 
        className="cancel-btn" 
        onClick={onCancel}
        aria-label="Cancelar archivo"
        type="button"
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
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default FilePreview;
