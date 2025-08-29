export { default as ClientChat } from './ClientChat';
export * from './types/chat';

// Helper para montar el widget dinámicamente en cualquier sitio sin React manual externo.
// Ejemplo:
//   import { mountClientChat } from 'client-chat-widget';
//   mountClientChat({ clientId: '123', systemCode: 'geoportal' });
import React from 'react';
import { createRoot } from 'react-dom/client';

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
		const module = await import('./ClientChat');
		const ClientChatCmp = module.default;
		root.render(React.createElement(ClientChatCmp, { clientId, systemCode, clientName }));
	return () => root.unmount();
}

// Exportar estilos (para consumers que quieran import manualmente)
import './styles/ClientChat.css';
import './styles/tokens.css';
