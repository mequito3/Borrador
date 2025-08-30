// Standalone auto-mount build (incluye React + ReactDOM) para <script> directo.
// Uso mínimo en cualquier HTML (sin build ni imports):
// <script src="https://unpkg.com/client-chat-widget@1.1.0/dist/standalone/client-chat-widget.standalone.js" data-client-id="123" data-system-code="geoportal" data-client-name="Juan"></script>
// El script detecta los data-* y monta el chat.

import React from 'react';
import { createRoot } from 'react-dom/client';
import ClientChat from './ClientChat';
import './styles/ClientChat.css';
import './styles/tokens.css';

function autoMount() {
  const scriptEl = document.currentScript as HTMLScriptElement | null;
  // Si currentScript no funciona (algunos loaders), buscar por src que contenga 'client-chat-widget.standalone'
  const el = scriptEl || Array.from(document.querySelectorAll('script')).find(s => s.src.includes('client-chat-widget.standalone')) as HTMLScriptElement | undefined;
  if (!el) return;
  const clientId = el.dataset.clientId || 'anon';
  const systemCode = (el.dataset.systemCode as 'geoportal' | 'erp' | 'avaluos') || 'geoportal';
  const clientName = el.dataset.clientName || '';
  const containerId = el.dataset.containerId || 'client-chat-widget';

  // Permitir override de base URLs sin build (opcional)
  if (el.dataset.apiBase) {
    (window as any).CHAT_API_BASE = el.dataset.apiBase;
  }
  if (el.dataset.signalrBase) {
    (window as any).CHAT_SIGNALR_BASE = el.dataset.signalrBase;
  }
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  const root = createRoot(container);
  root.render(React.createElement(ClientChat, { clientId, systemCode, clientName }));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMount);
} else {
  autoMount();
}

// Exponer opcional API manual
(window as any).ClientChatWidgetStandalone = {
  mount: (opts: { clientId: string; systemCode: 'geoportal' | 'erp' | 'avaluos'; clientName?: string; containerId?: string }) => {
    const { clientId, systemCode, clientName = '', containerId = 'client-chat-widget' } = opts;
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
};
