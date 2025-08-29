export declare const startChatSession: (clientId: string, systemCode: string, clientName: string) => Promise<string | null>;
export declare const sendClientMessage: (chatSessionId: string, content: string, systemOriginId: string) => Promise<void>;
