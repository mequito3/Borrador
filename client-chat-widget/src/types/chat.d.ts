// ============================================
// TIPOS Y INTERFACES DEL CHAT WIDGET
// ============================================

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'client' | 'agent' | 'system';
  sentAt: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize?: number;
}

export interface ChatSession {
  id: string;
  clientId: string;
  clientName: string;
  systemCode: string;
  status: 'active' | 'closed' | 'pending';
  isClosed: boolean;
  createdAt: string;
}

export interface ChatWidgetProps {
  clientId: string;
  clientName?: string;
  systemCode: string;
  apiBaseUrl?: string;
}

export interface ChatState {
  isOpen: boolean;
  isConnected: boolean;
  isLoading: boolean;
  session: ChatSession | null;
  messages: ChatMessage[];
  unreadCount: number;
}

export interface ChatActions {
  toggleChat: () => void;
  startChat: () => Promise<void>;
  sendMessage: (content: string, file?: File) => Promise<boolean>;
  openFileDialog: () => void;
}

// Props para componentes
export interface ChatFabProps {
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
  isLoading?: boolean;
  showTooltip?: boolean;
  isPulsing?: boolean;
}

export interface ChatHeaderProps {
  onClose: () => void;
  title?: string;
  status?: string;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  onImageClick?: (imageUrl: string) => void;
  formatDateTime?: (dateString: string) => string;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  onImageClick?: (imageUrl: string) => void;
  formatDateTime?: (dateString: string) => string;
}

export interface ChatInputProps {
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

export interface FilePreviewProps {
  selectedFile: File | null;
  previewUrl: string | null;
  onCancel: () => void;
}
