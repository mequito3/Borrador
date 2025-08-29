// Centralized configuration for API and SignalR endpoints
// Priority: Vite env vars -> global window variables -> sane defaults

// VITE_API_BASE should point to the REST API root including /api (e.g. https://app.example.com/api)
// Accepted aliases: VITE_API_BASE_URL, VITE_BACKEND_API
// VITE_SIGNALR_BASE should point to the host root WITHOUT /hubs/chat (e.g. https://app.example.com)
// Accepted aliases: VITE_SIGNALR_BASE_URL, VITE_SIGNALR_HUB_URL (will strip /hubs/chat)

const rawApi =
	import.meta.env.VITE_API_BASE ||
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_BACKEND_API ||
	(typeof window !== 'undefined' && (window as any).CHAT_API_BASE) ||
	'';
// Trim trailing slash
export const API_BASE: string = rawApi.replace(/\/$/, '');

const inferredSignalR = API_BASE.replace(/\/api$/i, '');
let rawSignalR =
	import.meta.env.VITE_SIGNALR_BASE ||
	import.meta.env.VITE_SIGNALR_BASE_URL ||
	import.meta.env.VITE_SIGNALR_HUB_URL ||
	(typeof window !== 'undefined' && (window as any).CHAT_SIGNALR_BASE) ||
	inferredSignalR;
// If user provided full hub URL, strip the hub path
rawSignalR = rawSignalR.replace(/\/hubs\/chat\/?$/i, '');
export const SIGNALR_BASE: string = rawSignalR.replace(/\/$/, '');

// File download base (strip trailing /api if present)
export const FILE_BASE = API_BASE.replace(/\/api$/i, '');

// Build time injected in vite.config.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - defined via Vite define
export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

export const withApi = (path: string) => `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
export const withSignalR = (path: string) => `${SIGNALR_BASE}${path.startsWith('/') ? path : '/' + path}`;

// Dev warnings helpful for misconfiguration
if (import.meta.env.DEV) {
	if (!API_BASE) {
		// eslint-disable-next-line no-console
		console.warn('[config] API_BASE no configurado. Define VITE_API_BASE en .env');
	}
}

export default { API_BASE, SIGNALR_BASE, FILE_BASE, APP_VERSION };