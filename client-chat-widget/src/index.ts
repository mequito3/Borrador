import ClientChat from './ClientChat';
export { default as ClientChat } from './ClientChat';
export * from './types/chat';

// Helper para montar el widget dinámicamente en cualquier sitio sin React manual externo.
// Ejemplo:
//   import { mountClientChat } from 'client-chat-widget';
//   mountClientChat({ clientId: '123', systemCode: 'geoportal' });
import React from 'react';
import { createRoot } from 'react-dom/client';

// Debug helper (se ejecuta siempre pero es liviano)
try {
	const reactVersion = (React as any)?.version;
	if (!reactVersion) {
		console.error('[client-chat-widget] React no detectado. Instala react y react-dom o usa el bundle standalone.');
	} else {
		console.info('[client-chat-widget] React version:', reactVersion);
	}
	const globalReact = (window as any).React;
	if (globalReact && globalReact !== React) {
		console.warn('[client-chat-widget] Doble React detectado (global + módulo). Esto causa errores. Asegura una sola fuente.');
	}
} catch (_) { /* silent */ }

interface MountOptions {
	clientId: string;
	systemCode: 'geoportal' | 'erp' | 'avaluos';
	clientName?: string;
	containerId?: string; // por defecto 'client-chat-widget'
}

export async function mountClientChat(options: MountOptions) {
	const { clientId, systemCode, clientName = '', containerId = 'client-chat-widget' } = options;
	let container = document.getElementById(containerId);
	if (!container) {
		container = document.createElement('div');
		container.id = containerId;
		document.body.appendChild(container);
	}
	const root = createRoot(container);
	root.render(React.createElement(ClientChat, { clientId, systemCode, clientName }));
	return () => root.unmount();
}

// Exportar estilos (para consumers que quieran import manualmente)
import './styles/ClientChat.css';
import './styles/tokens.css';
