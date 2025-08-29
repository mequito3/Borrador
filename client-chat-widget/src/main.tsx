import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// index.css existe solo para satisfacer la importación y permitir estilos globales mínimos
import './index.css';
import ClientChat from './ClientChat';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ClientChat clientId="demo-local" systemCode="geoportal" clientName="Local" />
  </StrictMode>,
)
