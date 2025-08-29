export declare const connectClientToChat: (
  id: string, 
  callback: (sessionId: string, sender: string, content: string, sentAt: string) => void,
  onChatClosed?: (sessionId: string, message: string, timestamp: string) => void
) => Promise<void>;
export declare const disconnectClient: () => Promise<void>;
