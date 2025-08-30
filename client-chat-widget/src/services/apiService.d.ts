export interface StartChatResult {
	status: number;
	id?: string;
	error?: string;
}
export declare const startChatSession: (clientId: string, systemCode: string, clientName: string, apiBaseOverride?: string) => Promise<StartChatResult>;
export declare const sendClientMessage: (chatSessionId: string, content: string, systemOriginId: number, apiBaseOverride?: string) => Promise<Response>;
export declare const resolveApiBase: (override?: string) => string;
